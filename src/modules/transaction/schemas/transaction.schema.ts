import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { RoleEntity } from 'src/modules/role/schemas/role.schema';

export const DEFAULT_IMAGE =
    'https://pic.onlinewebfonts.com/svg/img_264570.png';

@Schema({ timestamps: true, versionKey: false })
export class TransactionEntity {
    @Prop({
        required: true,
        index: true,
        lowercase: true,
    })
    address: string;

    @Prop({
        required: true,
        index: true,
        lowercase: true,
    })
    from: string;

    @Prop({
        required: true,
    })
    type: string;

    @Prop({
        required: true,
    })
    amount: number;

    @Prop({
        required: true,
    })
    tokenId: string;

    @Prop({
        required: true,
    })
    timestamp: string;

    @Prop({
        required: true,
    })
    txHash: string;

    @Prop({
        required: true,
    })
    launchpadId: string;

    @Prop({
        required: true,
    })
    isOwnerCreated: string;
}

export const TransactionDatabaseName = 'transactions';
export const TransactionSchema =
    SchemaFactory.createForClass(TransactionEntity);

export type TransactionDocument = TransactionEntity & Document;

// Hooks
TransactionSchema.pre<TransactionDocument>('save', function (next) {
    this.address = this.address?.toLowerCase();
    this.from = this.from?.toLowerCase();

    next();
});
