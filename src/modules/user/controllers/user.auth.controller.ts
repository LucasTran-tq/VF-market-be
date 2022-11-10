/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Token, User } from 'src/common/auth/decorators/auth.decorator';
import {
    AuthRefreshJwtGuard,
} from 'src/common/auth/decorators/auth.jwt.decorator';
import { AuthFirebaseGuard } from 'src/common/auth/decorators/auth.firebase.decorator';
import { AuthService } from 'src/common/auth/services/auth.service';
import { AwsS3Service } from 'src/common/aws/services/aws.s3.service';
import { ENUM_ERROR_STATUS_CODE_ERROR } from 'src/common/error/constants/error.status-code.constant';
import { ENUM_LOGGER_ACTION } from 'src/common/logger/constants/logger.enum.constant';
import { Logger } from 'src/common/logger/decorators/logger.decorator';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/constants/role.status-code.constant';
import {
    ENUM_OTP_STATUS_CODE_ERROR,
    ENUM_USER_STATUS_CODE_ERROR,
    ENUM_USER_STATUS_CODE_SUCCESS,
} from 'src/modules/user/constants/user.status-code.constant';
import { UserLoginDto } from 'src/modules/user/dtos/user.login.dto';
import {
    IUserCheckExist,
    IUserDocument,
} from 'src/modules/user/interfaces/user.interface';
import { UserLoginSerialization } from 'src/modules/user/serializations/user.login.serialization';
import { UserPayloadSerialization } from 'src/modules/user/serializations/user.payload.serialization';
import { UserService } from 'src/modules/user/services/user.service';
import { RoleDocument } from 'src/modules/role/schemas/role.schema';
import { RoleService } from 'src/modules/role/services/role.service';
import { AuthOtpService } from 'src/common/auth/services/auth.otp.service';
import { MailService } from 'src/modules/mail/mail.service';
import { UserSendOtpDto } from '../dtos/user.send-otp.dto';
import { UserSignUpDto } from '../dtos/user.sign-up.dto';

@ApiTags('modules.user')
@Controller({
    version: '1',
    path: '/auth',
})
export class UserAuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly awsService: AwsS3Service,
        private readonly roleService: RoleService,
        private readonly authOtpService: AuthOtpService,
        private readonly mailService: MailService
    ) {}

    @Response('auth.signUp', { doc: { httpStatus: HttpStatus.CREATED } })
    // @AuthApiKey()
    // @RequestValidateUserAgent()
    // @RequestValidateTimestamp()
    @Post('/sign-up')
    async signUp(
        @Body()
        { email, mobileNumber, ...body }: UserSignUpDto
    ): Promise<void> {
        const role: RoleDocument = await this.roleService.findOne<RoleDocument>(
            {
                name: 'user',
            }
        );
        if (!role) {
            throw new NotFoundException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
                message: 'role.error.notFound',
            });
        }

        const checkExist: IUserCheckExist = await this.userService.checkExist(
            email,
            mobileNumber
        );

        if (checkExist.email && checkExist.mobileNumber) {
            throw new BadRequestException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EXISTS_ERROR,
                message: 'user.error.exist',
            });
        } else if (checkExist.email) {
            throw new BadRequestException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EMAIL_EXIST_ERROR,
                message: 'user.error.emailExist',
            });
        } else if (checkExist.mobileNumber) {
            throw new BadRequestException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_MOBILE_NUMBER_EXIST_ERROR,
                message: 'user.error.mobileNumberExist',
            });
        }

        try {
            const password = await this.authService.createPassword(
                body.password
            );

            await this.userService.create({
                firstName: body.firstName,
                lastName: body.lastName,
                email,
                mobileNumber,
                role: role._id,
                password: password.passwordHash,
                passwordExpired: password.passwordExpired,
                salt: password.salt,
            });

            // create otp
            // send otp over mail
            const otp =
                await this.authOtpService.generateUserVerificationCode();
            console.log('otp:', otp);
            await this.authOtpService.create({ email, otp });

            // send mail
            await this.mailService.sendMailSystemOtp(email, { email, otp });

            return;
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                error: err.message,
            });
        }
    }

    @Response('auth.activeUser', { doc: { httpStatus: HttpStatus.CREATED } })
    // @AuthApiKey()
    // @RequestValidateUserAgent()
    // @RequestValidateTimestamp()
    @Post('/activeUser')
    async activeUser(
        @Body()
        { email, otp }: UserSendOtpDto
    ): Promise<void> {
        const checkExist: any = await this.authOtpService.checkExist(
            email,
            otp
        );
        console.log('checkExist:', checkExist);

        if (!checkExist) {
            throw new BadRequestException({
                statusCode: ENUM_OTP_STATUS_CODE_ERROR.OTP_NOT_FOUND_ERROR,
                message: 'otp.error.not_found',
            });
        }

        try {
            // update isActive
            const user: IUserDocument =
                await this.userService.findOne<IUserDocument>({ email });

            await this.userService.active(user._id);

            await this.authOtpService.deleteOne({ email, otp });

            return;
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                error: err.message,
            });
        }
    }

    @Response('user.login', {
        classSerialization: UserLoginSerialization,
        doc: { statusCode: ENUM_USER_STATUS_CODE_SUCCESS.USER_LOGIN_SUCCESS },
    })
    @Logger(ENUM_LOGGER_ACTION.LOGIN, { tags: ['login', 'withEmail'] })
    @HttpCode(HttpStatus.OK)
    @Post('/login')
    async login(@Body() body: UserLoginDto): Promise<IResponse> {
        const user: IUserDocument =
            await this.userService.findOne<IUserDocument>(
                {
                    email: body.email,
                },
                {
                    populate: true,
                }
            );

        if (!user) {
            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
                message: 'user.error.notFound',
            });
        }

        const validate: boolean = await this.authService.validateUser(
            body.password,
            user.password
        );

        if (!validate) {
            throw new BadRequestException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NOT_MATCH_ERROR,
                message: 'user.error.passwordNotMatch',
            });
        } else if (!user.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_IS_INACTIVE_ERROR,
                message: 'user.error.inactive',
            });
        } else if (!user.role.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_IS_INACTIVE_ERROR,
                message: 'role.error.inactive',
            });
        }

        const payload: UserPayloadSerialization =
            await this.userService.payloadSerialization(user);
        const tokenType: string = await this.authService.getTokenType();
        const expiresIn: number =
            await this.authService.getAccessTokenExpirationTime();
        const rememberMe: boolean = body.rememberMe ? true : false;
        const payloadAccessToken: Record<string, any> =
            await this.authService.createPayloadAccessToken(
                payload,
                rememberMe
            );
        const payloadRefreshToken: Record<string, any> =
            await this.authService.createPayloadRefreshToken(
                payload._id,
                rememberMe,
                {
                    loginDate: payloadAccessToken.loginDate,
                }
            );

        const payloadHashedAccessToken =
            await this.authService.encryptAccessToken(payloadAccessToken);
        const payloadHashedRefreshToken =
            await this.authService.encryptAccessToken(payloadRefreshToken);

        const accessToken: string = await this.authService.createAccessToken(
            payloadHashedAccessToken
        );

        const refreshToken: string = await this.authService.createRefreshToken(
            payloadHashedRefreshToken,
            { rememberMe }
        );

        const checkPasswordExpired: boolean =
            await this.authService.checkPasswordExpired(user.passwordExpired);

        if (checkPasswordExpired) {
            return {
                metadata: {
                    // override status code and message
                    statusCode:
                        ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_EXPIRED_ERROR,
                    message: 'user.error.passwordExpired',
                },
                tokenType,
                expiresIn,
                accessToken,
                refreshToken,
            };
        }

        return {
            metadata: {
                // override status code
                statusCode: ENUM_USER_STATUS_CODE_SUCCESS.USER_LOGIN_SUCCESS,
            },
            tokenType,
            expiresIn,
            accessToken,
            refreshToken,
        };
    }

    @Response('user.refresh', { classSerialization: UserLoginSerialization })
    @AuthRefreshJwtGuard()
    @HttpCode(HttpStatus.OK)
    @Post('/refresh')
    async refresh(
        @User()
        { _id, rememberMe, loginDate }: Record<string, any>,
        @Token() refreshToken: string
    ): Promise<IResponse> {
        const user: IUserDocument =
            await this.userService.findOneById<IUserDocument>(_id, {
                populate: true,
            });

        if (!user) {
            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
                message: 'user.error.notFound',
            });
        } else if (!user.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_IS_INACTIVE_ERROR,
                message: 'user.error.inactive',
            });
        } else if (!user.role.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_IS_INACTIVE_ERROR,
                message: 'role.error.inactive',
            });
        }

        const checkPasswordExpired: boolean =
            await this.authService.checkPasswordExpired(user.passwordExpired);

        if (checkPasswordExpired) {
            throw new ForbiddenException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_EXPIRED_ERROR,
                message: 'user.error.passwordExpired',
            });
        }

        const payload: UserPayloadSerialization =
            await this.userService.payloadSerialization(user);
        const tokenType: string = await this.authService.getTokenType();
        const expiresIn: number =
            await this.authService.getAccessTokenExpirationTime();
        const payloadAccessToken: Record<string, any> =
            await this.authService.createPayloadAccessToken(
                payload,
                rememberMe,
                {
                    loginDate,
                }
            );

        const payloadHashedAccessToken =
            await this.authService.encryptAccessToken(payloadAccessToken);

        const accessToken: string = await this.authService.createAccessToken(
            payloadHashedAccessToken
        );

        return {
            tokenType,
            expiresIn,
            accessToken,
            refreshToken,
        };
    }

    @Response('user.login', {
        classSerialization: UserLoginSerialization,
        doc: { statusCode: ENUM_USER_STATUS_CODE_SUCCESS.USER_LOGIN_SUCCESS },
    })
    @Logger(ENUM_LOGGER_ACTION.LOGIN, { tags: ['login-firebase', 'google'] })
    @HttpCode(HttpStatus.OK)
    @AuthFirebaseGuard()
    @Post('/login-google')
    async loginGoogle(
        @User() { email }: Record<string, any>
    ): Promise<IResponse> {
        // * if user in database create token
        // * if not, create user

        let user: IUserDocument = await this.userService.findOne<IUserDocument>(
            {
                email: email,
            },
            {
                populate: true,
            }
        );

        try {
            if (!user) {
                const role: RoleDocument =
                    await this.roleService.findOne<RoleDocument>({
                        name: 'user',
                    });
                if (!role) {
                    throw new NotFoundException({
                        statusCode:
                            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
                        message: 'role.error.notFound',
                    });
                }

                await this.userService.createWithFirebase({
                    email,
                    role: role._id,
                });

                user = await this.userService.findOne<IUserDocument>(
                    {
                        email: email,
                    },
                    {
                        populate: true,
                    }
                );
            }

            const payload: UserPayloadSerialization =
                await this.userService.payloadSerialization(user);
            const tokenType: string = await this.authService.getTokenType();
            const expiresIn: number =
                await this.authService.getAccessTokenExpirationTime();
            const rememberMe: boolean = true;
            const payloadAccessToken: Record<string, any> =
                await this.authService.createPayloadAccessToken(
                    payload,
                    rememberMe
                );
            const payloadRefreshToken: Record<string, any> =
                await this.authService.createPayloadRefreshToken(
                    payload._id,
                    rememberMe,
                    {
                        loginDate: payloadAccessToken.loginDate,
                    }
                );

            const payloadHashedAccessToken =
                await this.authService.encryptAccessToken(payloadAccessToken);
            const payloadHashedRefreshToken =
                await this.authService.encryptAccessToken(payloadRefreshToken);

            const accessToken: string =
                await this.authService.createAccessToken(
                    payloadHashedAccessToken
                );

            const refreshToken: string =
                await this.authService.createRefreshToken(
                    payloadHashedRefreshToken,
                    { rememberMe }
                );

            const checkPasswordExpired: boolean =
                await this.authService.checkPasswordExpired(
                    user.passwordExpired
                );

            if (checkPasswordExpired) {
                return {
                    metadata: {
                        // override status code and message
                        statusCode:
                            ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_EXPIRED_ERROR,
                        message: 'user.error.passwordExpired',
                    },
                    tokenType,
                    expiresIn,
                    accessToken,
                    refreshToken,
                };
            }

            return {
                metadata: {
                    // override status code
                    statusCode:
                        ENUM_USER_STATUS_CODE_SUCCESS.USER_LOGIN_SUCCESS,
                },
                tokenType,
                expiresIn,
                accessToken,
                refreshToken,
            };
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                error: err.message,
            });
        }
    }
}
