import { Injectable } from '@nestjs/common';
import { CreateConfigurationDto } from '../dtos/create-configuration.dto';
import { ConfigurationRepository } from '../repositories/configuration.repository';
import { ConfigurationEntity } from '../schemas/configuration.schema';


@Injectable()
export class ConfigurationService {
    constructor(
        private readonly configurationRepository: ConfigurationRepository
    ) {}

    async create(createConfigurationDto: CreateConfigurationDto) {
        if (createConfigurationDto.key != process.env.KEY_INIT) {
            return false;
        }

        delete createConfigurationDto.key;

        const item = await this.configurationRepository.create(
            createConfigurationDto
        );
        // const data = await this.configurationRepository.save(item);
        const data =
            await this.configurationRepository.create<ConfigurationEntity>(
                item
            );

        return data;
    }
    async findOne(name: string) {
        const data = await this.configurationRepository.findOne({ name });

        return data;
    }
    async update(name: string, value: string) {
        try {
            const e = await this.configurationRepository.findOne({
                name,
            });
            e.value = value;
            // return await this.configurationRepository.save(e);
            return await this.configurationRepository.updateOne(
                {
                    name,
                },
                {
                    value: value,
                }
            );
        } catch (e) {
            console.log('update configuration : ', e);
        }
    }
}
