import { AuthOtpDocument } from 'src/common/auth/schemas/auth.otp.schema';
import {
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseOptions,
} from 'src/common/database/interfaces/database.interface';

export interface IAuthOtpService {
    findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<AuthOtpDocument[]>;

    findOneById(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<AuthOtpDocument>;

    findOne(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<AuthOtpDocument>;

    findOneByKey(
        key: string,
        options?: IDatabaseFindOneOptions
    ): Promise<AuthOtpDocument>;

    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number>;
}
