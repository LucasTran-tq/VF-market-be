import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const DEFAULT_IMAGE =
    'https://pic.onlinewebfonts.com/svg/img_264570.png';

@Schema({ timestamps: true, versionKey: false })
export class ConfigurationEntity {
    @Prop({
        required: true,
        index: true,
        lowercase: true,
    })
    value: string;

    @Prop({
        required: true,
        index: true,
        lowercase: true,
    })
    name: string;
}

export const ConfigurationDatabaseName = 'configurations';
export const ConfigurationSchema =
    SchemaFactory.createForClass(ConfigurationEntity);

export type ConfigurationDocument = ConfigurationEntity & Document;

// Hooks
ConfigurationSchema.pre<ConfigurationDocument>('save', function (next) {
    this.name = this.name?.toLowerCase();

    next();
});
