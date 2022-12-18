import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProductEntity } from 'src/modules/Product/schemas/product.schema';
import { TransactionEntity } from 'src/modules/transaction/schemas/transaction.schema';
import { UserEntity } from 'src/modules/user/schemas/user.schema';

@Schema({ timestamps: true, versionKey: false })
export class OrderEntity {
    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: UserEntity.name,
        index: true,
    })
    user: Types.ObjectId;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: ProductEntity.name,
        // index: true,
    })
    product: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: TransactionEntity.name,
    })
    transaction?: Types.ObjectId;

    @Prop({
        required: true,
        lowercase: true,
        trim: true,
    })
    address: string;

    @Prop({
        required: true,
        trim: true,
    })
    tokenId: number;

    @Prop({
        required: true,
        lowercase: true,
        trim: true,
    })
    walletAddress: string;

    @Prop({
        required: true,
        lowercase: true,
        trim: true,
    })
    status: string;
}

export const OrderDatabaseName = 'orders';
export const OrderSchema = SchemaFactory.createForClass(OrderEntity);

export type OrderDocument = OrderEntity & Document;

// Hooks
OrderSchema.pre<OrderDocument>('save', function (next) {
    // this.email = this.email?.toLowerCase();
    // this.firstName = this.firstName?.toLowerCase();
    // this.lastName = this.lastName?.toLowerCase();

    next();
});
