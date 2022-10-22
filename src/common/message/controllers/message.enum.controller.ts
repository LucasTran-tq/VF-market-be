import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessageLanguageSerialization } from 'src/common/message/serializations/message.language.serialization';
import { MessageEnumService } from 'src/common/message/services/message.enum.service';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';

@ApiTags('enum.message')
@Controller({
    version: VERSION_NEUTRAL,
    path: '/message',
})
export class MessageEnumController {
    constructor(private readonly messageEnumService: MessageEnumService) {}

    @Response('message.languages', {
        classSerialization: MessageLanguageSerialization,
    })
    @Get('/languages')
    async languages(): Promise<IResponse> {
        const languages: string[] =
            await this.messageEnumService.getLanguages();
        return {
            languages,
        };
    }
}
