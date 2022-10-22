import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DatabaseModule } from 'src/common/database/database.module';
import { HelperModule } from 'src/common/helper/helper.module';
import { SettingBulkService } from 'src/common/setting/services/setting.bulk.service';
import { SettingModule } from 'src/common/setting/setting.module';
import configs from 'src/configs';

describe('SettingBulkService', () => {
    let settingBulkService: SettingBulkService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                DatabaseModule,
                ConfigModule.forRoot({
                    load: configs,
                    isGlobal: true,
                    cache: true,
                    envFilePath: ['.env'],
                    expandVariables: true,
                }),
                HelperModule,
                SettingModule,
            ],
        }).compile();

        settingBulkService =
            moduleRef.get<SettingBulkService>(SettingBulkService);
    });

    it('should be defined', () => {
        expect(settingBulkService).toBeDefined();
    });

    describe('deleteMany', () => {
        it('should be called', async () => {
            const test = jest.spyOn(settingBulkService, 'deleteMany');

            await settingBulkService.deleteMany({ name: 'test' });
            expect(test).toHaveBeenCalledWith({ name: 'test' });
        });

        it('should be success', async () => {
            const result = await settingBulkService.deleteMany({
                name: 'test',
            });
            jest.spyOn(settingBulkService, 'deleteMany').mockImplementation(
                async () => result
            );

            expect(await settingBulkService.deleteMany({ name: 'test' })).toBe(
                result
            );
        });
    });
});
