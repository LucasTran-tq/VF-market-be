import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
    AuthOtpDocument,
    AuthOtpEntity,
} from 'src/common/auth/schemas/auth.otp.schema';
import { DatabaseMongoRepositoryAbstract } from 'src/common/database/abstracts/database.mongo-repository.abstract';
import { DatabaseEntity } from 'src/common/database/decorators/database.decorator';
import { IDatabaseRepositoryAbstract } from 'src/common/database/interfaces/database.repository.interface';
@Injectable()
export class AuthOtpRepository
    extends DatabaseMongoRepositoryAbstract<AuthOtpDocument>
    implements IDatabaseRepositoryAbstract<AuthOtpDocument>
{
    constructor(
        @DatabaseEntity(AuthOtpEntity.name)
        private readonly AuthOtpModel: Model<AuthOtpDocument>
    ) {
        super(AuthOtpModel);
    }
}
