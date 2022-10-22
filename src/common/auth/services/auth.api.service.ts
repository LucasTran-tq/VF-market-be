import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HelperStringService } from 'src/common/helper/services/helper.string.service';
import { HelperHashService } from 'src/common/helper/services/helper.hash.service';
import { HelperEncryptionService } from 'src/common/helper/services/helper.encryption.service';
import {
    IDatabaseCreateOptions,
    IDatabaseSoftDeleteOptions,
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';
import {
    AuthApiDocument,
    AuthApiEntity,
} from 'src/common/auth/schemas/auth.api.schema';
import {
    IAuthApi,
    IAuthApiRequestHashedData,
} from 'src/common/auth/interfaces/auth.interface';
import { AuthApiUpdateDto } from 'src/common/auth/dtos/auth.api.update.dto';
import {
    AuthApiCreateDto,
    AuthApiCreateRawDto,
} from 'src/common/auth/dtos/auth.api.create.dto';
import { IAuthApiService } from 'src/common/auth/interfaces/auth.api.service.interface';
import { AuthApiRepository } from 'src/common/auth/repositories/auth.api.repository';

@Injectable()
export class AuthApiService implements IAuthApiService {
    private readonly env: string;

    constructor(
        private readonly authApiRepository: AuthApiRepository,
        private readonly helperStringService: HelperStringService,
        private readonly configService: ConfigService,
        private readonly helperHashService: HelperHashService,
        private readonly helperEncryptionService: HelperEncryptionService
    ) {
        this.env = this.configService.get<string>('app.env');
    }

    async findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<AuthApiDocument[]> {
        return this.authApiRepository.findAll<AuthApiDocument>(find, {
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
    ): Promise<AuthApiDocument> {
        return this.authApiRepository.findOneById<AuthApiDocument>(
            _id,
            options
        );
    }

    async findOne(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<AuthApiDocument> {
        return this.authApiRepository.findOne<AuthApiDocument>(find, options);
    }

    async findOneByKey(
        key: string,
        options?: IDatabaseFindOneOptions
    ): Promise<AuthApiDocument> {
        return this.authApiRepository.findOne<AuthApiDocument>(
            { key },
            options
        );
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number> {
        return this.authApiRepository.getTotal(find, options);
    }

    async inactive(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<AuthApiDocument> {
        const update = {
            isActive: false,
        };

        return this.authApiRepository.updateOneById(_id, update, options);
    }

    async active(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<AuthApiDocument> {
        const update = {
            isActive: true,
        };

        return this.authApiRepository.updateOneById(_id, update, options);
    }

    async create(
        { name, description }: AuthApiCreateDto,
        options?: IDatabaseCreateOptions
    ): Promise<IAuthApi> {
        const key = await this.createKey();
        const secret = await this.createSecret();
        const passphrase = await this.createPassphrase();
        const encryptionKey = await this.createEncryptionKey();
        const hash: string = await this.createHashApiKey(key, secret);

        const create: AuthApiEntity = {
            name,
            description,
            key,
            hash,
            passphrase,
            encryptionKey,
            isActive: true,
        };

        const created = await this.authApiRepository.create<AuthApiEntity>(
            create,
            options
        );

        return {
            _id: created._id,
            secret,
            passphrase,
            encryptionKey,
        };
    }

    async createRaw(
        {
            name,
            description,
            key,
            secret,
            passphrase,
            encryptionKey,
        }: AuthApiCreateRawDto,
        options?: IDatabaseCreateOptions
    ): Promise<IAuthApi> {
        const hash: string = await this.createHashApiKey(key, secret);

        const create: AuthApiEntity = {
            name,
            description,
            key,
            hash,
            passphrase,
            encryptionKey,
            isActive: true,
        };

        const created = await this.authApiRepository.create<AuthApiEntity>(
            create,
            options
        );

        return {
            _id: created._id,
            secret,
            passphrase,
            encryptionKey,
        };
    }

    async updateOneById(
        _id: string,
        data: AuthApiUpdateDto,
        options?: IDatabaseOptions
    ): Promise<AuthApiDocument> {
        return this.authApiRepository.updateOneById<AuthApiUpdateDto>(
            _id,
            data,
            options
        );
    }

    async updateHashById(
        _id: string,
        options?: IDatabaseOptions
    ): Promise<IAuthApi> {
        const authApi: AuthApiDocument =
            await this.authApiRepository.findOneById(_id);
        const secret: string = await this.createSecret();
        const hash: string = await this.createHashApiKey(authApi.key, secret);
        const passphrase: string = await this.createPassphrase();
        const encryptionKey: string = await this.createEncryptionKey();

        const update = {
            hash,
            passphrase,
            encryptionKey,
        };

        await this.authApiRepository.updateOneById(_id, update, options);

        return {
            _id: authApi._id,
            secret,
            passphrase,
            encryptionKey,
        };
    }

    async deleteOneById(
        _id: string,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<AuthApiDocument> {
        return this.authApiRepository.deleteOneById(_id, options);
    }

    async deleteOne(
        find: Record<string, any>,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<AuthApiDocument> {
        return this.authApiRepository.deleteOne(find, options);
    }

    async createKey(): Promise<string> {
        return this.helperStringService.random(25, {
            safe: false,
            upperCase: true,
            prefix: `${this.env}_`,
        });
    }

    async createEncryptionKey(): Promise<string> {
        return this.helperStringService.random(15, {
            safe: false,
            upperCase: true,
            prefix: `${this.env}_`,
        });
    }

    async createSecret(): Promise<string> {
        return this.helperStringService.random(35, {
            safe: false,
            upperCase: true,
        });
    }

    async createPassphrase(): Promise<string> {
        return this.helperStringService.random(16, {
            safe: true,
        });
    }

    async createHashApiKey(key: string, secret: string): Promise<string> {
        return this.helperHashService.sha256(`${key}:${secret}`);
    }

    async validateHashApiKey(
        hashFromRequest: string,
        hash: string
    ): Promise<boolean> {
        return this.helperHashService.sha256Compare(hashFromRequest, hash);
    }

    async decryptApiKey(
        encryptedApiKey: string,
        encryptionKey: string,
        passphrase: string
    ): Promise<IAuthApiRequestHashedData> {
        const decrypted = this.helperEncryptionService.aes256Decrypt(
            encryptedApiKey,
            encryptionKey,
            passphrase
        );

        return decrypted as IAuthApiRequestHashedData;
    }

    async encryptApiKey(
        data: IAuthApiRequestHashedData,
        encryptionKey: string,
        passphrase: string
    ): Promise<string> {
        return this.helperEncryptionService.aes256Encrypt(
            data,
            encryptionKey,
            passphrase
        );
    }

    async createBasicToken(
        clientId: string,
        clientSecret: string
    ): Promise<string> {
        const token = `${clientId}:${clientSecret}`;
        return this.helperEncryptionService.base64Decrypt(token);
    }

    async validateBasicToken(
        clientBasicToken: string,
        ourBasicToken: string
    ): Promise<boolean> {
        return this.helperEncryptionService.base64Compare(
            clientBasicToken,
            ourBasicToken
        );
    }
}
