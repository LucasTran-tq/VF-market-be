import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { AwsS3Serialization } from 'src/common/aws/serializations/aws.s3.serialization';
import { RoleEntity } from 'src/modules/role/schemas/role.schema';

export const DEFAULT_IMAGE =
    'https://pic.onlinewebfonts.com/svg/img_264570.png';

@Schema({ timestamps: true, versionKey: false })
export class UserEntity {
    @Prop({
        // required: true,
        required: false,
        index: true,
        lowercase: true,
        trim: true,
    })
    firstName?: string;

    @Prop({
        // required: true,
        required: false,
        index: true,
        lowercase: true,
        trim: true,
    })
    lastName?: string;

    @Prop({
        // required: true,
        required: false,
        index: true,
        unique: true,
        trim: true,
    })
    mobileNumber?: string;

    @Prop({
        required: true,
        index: true,
        unique: true,
        lowercase: true,
        trim: true,
    })
    email: string;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: RoleEntity.name,
        index: true,
    })
    role: Types.ObjectId;

    @Prop({
        // required: true,
        required: false,
    })
    password?: string;

    @Prop({
        // required: true,
        required: false,
        index: true,
    })
    passwordExpired?: Date;

    @Prop({
        // required: true,
        required: false,
    })
    salt?: string;

    @Prop({
        required: true,
        default: true,
        index: true,
    })
    isActive: boolean;

    @Prop({
        required: false,
    })
    photo?: string;

    @Prop({
        required: false,
    })
    address?: string;

    // @Prop({
    //     required: false,
    //     _id: false,
    //     type: {
    //         path: String,
    //         pathWithFilename: String,
    //         filename: String,
    //         completedUrl: String,
    //         baseUrl: String,
    //         mime: String,
    //     },
    // })
    // photo?: AwsS3Serialization;
}

export const UserDatabaseName = 'users';
export const UserSchema = SchemaFactory.createForClass(UserEntity);

export type UserDocument = UserEntity & Document;

// Hooks
UserSchema.pre<UserDocument>('save', function (next) {
    this.email = this.email?.toLowerCase();
    this.firstName = this.firstName?.toLowerCase();
    this.lastName = this.lastName?.toLowerCase();

    next();
});
