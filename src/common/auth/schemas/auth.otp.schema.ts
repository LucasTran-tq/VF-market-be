import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class AuthOtpEntity {
    @Prop({
        required: true,
        // index: true,
    })
    otp: string;

    @Prop({
        required: true,
    })
    email: string;
}

export const AuthOtpDatabaseName = 'otp';
export const AuthOtpSchema = SchemaFactory.createForClass(AuthOtpEntity);

export type AuthOtpDocument = AuthOtpEntity & Document;

// Hooks
AuthOtpSchema.pre<AuthOtpDocument>('save', function (next) {
    // this.name = this.name.toLowerCase();

    next();
});
