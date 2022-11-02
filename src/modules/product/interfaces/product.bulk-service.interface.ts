import { IDatabaseManyOptions } from 'src/common/database/interfaces/database.interface';

export interface IProductBulkService {
    deleteMany(
        find: Record<string, any>,
        options?: IDatabaseManyOptions
    ): Promise<boolean>;
}
