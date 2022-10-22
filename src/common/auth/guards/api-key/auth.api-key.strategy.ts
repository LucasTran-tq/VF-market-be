import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';
import { ENUM_AUTH_STATUS_CODE_ERROR } from 'src/common/auth/constants/auth.status-code.constant';
import { IAuthApiRequestHashedData } from 'src/common/auth/interfaces/auth.interface';
import { AuthApiDocument } from 'src/common/auth/schemas/auth.api.schema';
import { AuthApiService } from 'src/common/auth/services/auth.api.service';
import { IRequestApp } from 'src/common/request/interfaces/request.interface';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
    constructor(private readonly authApiService: AuthApiService) {
        super(
            { header: 'X-API-KEY', prefix: '' },
            true,
            async (
                apiKey: string,
                verified: (
                    error: Error,
                    user?: Record<string, any>,
                    info?: string | number
                ) => Promise<void>,
                req: IRequestApp
            ) => this.validate(apiKey, verified, req)
        );
    }

    async validate(
        apiKey: string,
        verified: (
            error: Error,
            user?: AuthApiDocument,
            info?: string | number
        ) => Promise<void>,
        req: any
    ) {
        console.log('apiKey:', apiKey);
        const xApiKey: string[] = apiKey.split(':');
        const key = xApiKey[0];
        const encrypted = xApiKey[1];
        console.log('key:', key);
        console.log('encrypted:', encrypted);

        const apiEncryption = await this.authApiService.encryptApiKey(
            {
                key: key,
                timestamp: 1666425204926,

                hash: 'e11a023bc0ccf713cb50de9baa5140e59d3d4c52ec8952d9ca60326e040eda54',
            },
            'opbUwdiS1FBsrDUoPgZdx',
            'cuwakimacojulawu'
        );
        console.log('apiEncryption:', apiEncryption);

        const authApi: AuthApiDocument = await this.authApiService.findOneByKey(
            key
        );
        console.log('authApi:', authApi);

        if (!authApi) {
            verified(
                null,
                null,
                `${ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_NOT_FOUND_ERROR}`
            );
        } else if (!authApi.isActive) {
            verified(
                null,
                null,
                `${ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_INACTIVE_ERROR}`
            );
        } else {
            const decrypted: IAuthApiRequestHashedData =
                await this.authApiService.decryptApiKey(
                    encrypted,
                    authApi.encryptionKey,
                    authApi.passphrase
                );
            console.log('decrypted:', decrypted);

            const hasKey: boolean =
                'key' in decrypted &&
                'timestamp' in decrypted &&
                'hash' in decrypted;
            console.log('hasKey:', hasKey);

            if (!hasKey) {
                verified(
                    null,
                    null,
                    `${ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_SCHEMA_INVALID_ERROR}`
                );
            } else if (key !== decrypted.key) {
                verified(
                    null,
                    null,
                    `${ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_INVALID_ERROR}`
                );
            } else {
                const validateApiKey: boolean =
                    await this.authApiService.validateHashApiKey(
                        decrypted.hash,
                        authApi.hash
                    );
                if (!validateApiKey) {
                    verified(
                        null,
                        null,
                        `${ENUM_AUTH_STATUS_CODE_ERROR.AUTH_API_KEY_INVALID_ERROR}`
                    );
                } else {
                    req.apiKey = {
                        _id: authApi._id,
                        key: authApi.key,
                        name: authApi.name,
                    };
                    verified(null, authApi);
                }
            }
        }
    }
}
