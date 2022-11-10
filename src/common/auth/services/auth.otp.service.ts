/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HelperStringService } from 'src/common/helper/services/helper.string.service';
import { HelperHashService } from 'src/common/helper/services/helper.hash.service';
import { HelperEncryptionService } from 'src/common/helper/services/helper.encryption.service';
import {
    IDatabaseCreateOptions,
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseOptions,
    IDatabaseSoftDeleteOptions,
} from 'src/common/database/interfaces/database.interface';
import {
    AuthOtpDocument,
    AuthOtpEntity,
} from 'src/common/auth/schemas/auth.otp.schema';

import { IAuthOtpService } from 'src/common/auth/interfaces/auth.otp.service.interface';
import { AuthOtpRepository } from 'src/common/auth/repositories/auth.otp.repository';
import { AuthOtpCreateDto } from '../dtos/auth.otp.create.dto';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';

@Injectable()
export class AuthOtpService implements IAuthOtpService {
    private readonly env: string;

    private TIME_5_MINUTES: number = 5 * 60 * 1000;

    constructor(
        private readonly AuthOtpRepository: AuthOtpRepository,
        private readonly helperStringService: HelperStringService,
        private readonly configService: ConfigService,
        private readonly helperHashService: HelperHashService,
        private readonly helperDateService: HelperDateService,
        private readonly helperEncryptionService: HelperEncryptionService
    ) {
        this.env = this.configService.get<string>('app.env');
    }

    async findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<AuthOtpDocument[]> {
        return this.AuthOtpRepository.findAll<AuthOtpDocument>(find, {
            ...options,
            select: {
                name: 1,
                key: 1,
                isActive: 1,
                createdAt: 1,
            },
        });
    }

    async findOneById(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<AuthOtpDocument> {
        return this.AuthOtpRepository.findOneById<AuthOtpDocument>(
            _id,
            options
        );
    }

    async findOne(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<AuthOtpDocument> {
        return this.AuthOtpRepository.findOne<AuthOtpDocument>(find, options);
    }

    async findOneByKey(
        key: string,
        options?: IDatabaseFindOneOptions
    ): Promise<AuthOtpDocument> {
        return this.AuthOtpRepository.findOne<AuthOtpDocument>(
            { key },
            options
        );
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number> {
        return this.AuthOtpRepository.getTotal(find, options);
    }

    async deleteOne(
        find: Record<string, any>,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<AuthOtpDocument> {
        return this.AuthOtpRepository.deleteOne(find, options);
    }

    async create(
        { email, otp }: AuthOtpCreateDto,
        options?: IDatabaseCreateOptions
    ): Promise<any> {
        const create: AuthOtpEntity = {
            email,
            otp,
        };

        const created = await this.AuthOtpRepository.create<AuthOtpEntity>(
            create,
            options
        );

        return {
            _id: created._id,
            email,
            otp,
        };
    }

    async generateUserVerificationCode(): Promise<string> {
        const digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    }

    async checkExist(
        email: string,
        otp: string
        // options?: IDatabaseExistOptions
    ): Promise<any> {
        const existEmailOtp: any = await this.findOne({ email, otp });

        const otpLifeSpan = this.helperDateService.timestamp({
            date: existEmailOtp.createdAt,
        });
        const now = new Date().getTime();

        if (now - otpLifeSpan > this.TIME_5_MINUTES) return false;

        return existEmailOtp ? true : false;
    }

   
}
