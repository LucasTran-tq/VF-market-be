import {
    BadRequestException,
    Body,
    Controller,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthApiKey } from 'src/common/auth/decorators/auth.api-key.decorator';
import { AuthOtpService } from 'src/common/auth/services/auth.otp.service';
import { AuthService } from 'src/common/auth/services/auth.service';
import { ENUM_ERROR_STATUS_CODE_ERROR } from 'src/common/error/constants/error.status-code.constant';
import {
    RequestValidateTimestamp,
    RequestValidateUserAgent,
} from 'src/common/request/decorators/request.decorator';
import { Response } from 'src/common/response/decorators/response.decorator';
import { MailService } from 'src/modules/mail/mail.service';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/constants/role.status-code.constant';
import { RoleDocument } from 'src/modules/role/schemas/role.schema';
import { RoleService } from 'src/modules/role/services/role.service';
import {
    ENUM_OTP_STATUS_CODE_ERROR,
    ENUM_USER_STATUS_CODE_ERROR,
} from 'src/modules/user/constants/user.status-code.constant';
import { UserSignUpDto } from 'src/modules/user/dtos/user.sign-up.dto';
import {
    IUserCheckExist,
    IUserDocument,
} from 'src/modules/user/interfaces/user.interface';
import { UserService } from 'src/modules/user/services/user.service';
import { UserSendOtpDto } from '../dtos/user.send-otp.dto';

@ApiTags('modules.public.user')
@Controller({
    version: '1',
    path: '/user',
})
export class UserPublicController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly roleService: RoleService,
        private readonly authOtpService: AuthOtpService,
        private readonly mailService: MailService
    ) {}

    // @Response('auth.signUp', { doc: { httpStatus: HttpStatus.CREATED } })
    // // @AuthApiKey()
    // // @RequestValidateUserAgent()
    // // @RequestValidateTimestamp()
    // @Post('/sign-up')
    // async signUp(
    //     @Body()
    //     { email, mobileNumber, ...body }: UserSignUpDto
    // ): Promise<void> {
    //     const role: RoleDocument = await this.roleService.findOne<RoleDocument>(
    //         {
    //             name: 'user',
    //         }
    //     );
    //     if (!role) {
    //         throw new NotFoundException({
    //             statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR,
    //             message: 'role.error.notFound',
    //         });
    //     }

    //     const checkExist: IUserCheckExist = await this.userService.checkExist(
    //         email,
    //         mobileNumber
    //     );

    //     if (checkExist.email && checkExist.mobileNumber) {
    //         throw new BadRequestException({
    //             statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EXISTS_ERROR,
    //             message: 'user.error.exist',
    //         });
    //     } else if (checkExist.email) {
    //         throw new BadRequestException({
    //             statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EMAIL_EXIST_ERROR,
    //             message: 'user.error.emailExist',
    //         });
    //     } else if (checkExist.mobileNumber) {
    //         throw new BadRequestException({
    //             statusCode:
    //                 ENUM_USER_STATUS_CODE_ERROR.USER_MOBILE_NUMBER_EXIST_ERROR,
    //             message: 'user.error.mobileNumberExist',
    //         });
    //     }

    //     try {
    //         const password = await this.authService.createPassword(
    //             body.password
    //         );

    //         await this.userService.create({
    //             firstName: body.firstName,
    //             lastName: body.lastName,
    //             email,
    //             mobileNumber,
    //             role: role._id,
    //             password: password.passwordHash,
    //             passwordExpired: password.passwordExpired,
    //             salt: password.salt,
    //         });

    //         // create otp
    //         // send otp over mail
    //         const otp =
    //             await this.authOtpService.generateUserVerificationCode();
    //         console.log('otp:', otp);
    //         await this.authOtpService.create({ email, otp });

    //         // send mail
    //         await this.mailService.sendMailSystemOtp(email, { email, otp });

    //         return;
    //     } catch (err: any) {
    //         throw new InternalServerErrorException({
    //             statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
    //             message: 'http.serverError.internalServerError',
    //             error: err.message,
    //         });
    //     }
    // }

    // @Response('auth.activeUser', { doc: { httpStatus: HttpStatus.CREATED } })
    // // @AuthApiKey()
    // // @RequestValidateUserAgent()
    // // @RequestValidateTimestamp()
    // @Post('/activeUser')
    // async activeUser(
    //     @Body()
    //     { email, otp }: UserSendOtpDto
    // ): Promise<void> {
    //     const checkExist: any = await this.authOtpService.checkExist(
    //         email,
    //         otp
    //     );
    //     console.log('checkExist:', checkExist);

    //     if (!checkExist) {
    //         throw new BadRequestException({
    //             statusCode: ENUM_OTP_STATUS_CODE_ERROR.OTP_NOT_FOUND_ERROR,
    //             message: 'otp.error.not_found',
    //         });
    //     }

    //     try {
    //         // update isActive
    //         const user: IUserDocument =
    //             await this.userService.findOne<IUserDocument>({ email });
          
    //         await this.userService.active(user._id);

    //         await this.authOtpService.deleteOne({ email, otp });

    //         return;
    //     } catch (err: any) {
    //         throw new InternalServerErrorException({
    //             statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
    //             message: 'http.serverError.internalServerError',
    //             error: err.message,
    //         });
    //     }
    // }
}
