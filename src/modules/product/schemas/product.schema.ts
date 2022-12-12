// export class Product {}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class ProductEntity {
    @Prop({
        required: true,
        index: true,
        lowercase: true,
        trim: true,
    })
    name: string;

    @Prop({
        required: true,
        index: true,
        lowercase: true,
        trim: true,
    })
    description: string;

    @Prop({
        required: true,
        type: Object,
    })
    price: Record<string, any>;

    @Prop({
        required: true,
        index: true,
        lowercase: true,
        trim: true,
    })
    images: string[];

    @Prop({
        required: true,
        lowercase: true,
    })
    launchId: number;

    @Prop({
        required: true,
        lowercase: true,
    })
    totalCount: number;

    @Prop({
        required: true,
        lowercase: true,
    })
    totalSold: number;
}

export const ProductDatabaseName = 'products';
export const ProductSchema = SchemaFactory.createForClass(ProductEntity);

export type ProductDocument = ProductEntity & Document;

// Hooks
ProductSchema.pre<ProductDocument>('save', function (next) {
    // this.email = this.email?.toLowerCase();
    // this.firstName = this.firstName?.toLowerCase();
    // this.lastName = this.lastName?.toLowerCase();

    next();
});
