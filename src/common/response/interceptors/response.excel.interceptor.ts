import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { HelperFileService } from 'src/common/helper/services/helper.file.service';
import {
    ClassConstructor,
    ClassTransformOptions,
    plainToInstance,
} from 'class-transformer';
import { Reflector } from '@nestjs/core';
import { IResponseExcel } from 'src/common/response/interfaces/response.interface';
import {
    RESPONSE_SERIALIZATION_META_KEY,
    RESPONSE_SERIALIZATION_OPTIONS_META_KEY,
} from 'src/common/response/constants/response.constant';

@Injectable()
export class ResponseExcelInterceptor implements NestInterceptor<Promise<any>> {
    constructor(
        private readonly reflector: Reflector,
        private readonly helperFileService: HelperFileService
    ) {}

    async intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Promise<Observable<Promise<Record<string, any>>>> {
        if (context.getType() === 'http') {
            return next.handle().pipe(
                map(async (responseData: Promise<IResponseExcel>) => {
                    const ctx: HttpArgumentsHost = context.switchToHttp();
                    const responseExpress: Response = ctx.getResponse();

                    const classSerialization: ClassConstructor<any> =
                        this.reflector.get<ClassConstructor<any>>(
                            RESPONSE_SERIALIZATION_META_KEY,
                            context.getHandler()
                        );
                    const classSerializationOptions: ClassTransformOptions =
                        this.reflector.get<ClassTransformOptions>(
                            RESPONSE_SERIALIZATION_OPTIONS_META_KEY,
                            context.getHandler()
                        );

                    // response
                    const response = (await responseData) as IResponseExcel;
                    let serialization = response;
                    if (classSerialization) {
                        serialization = plainToInstance(
                            classSerialization,
                            response,
                            classSerializationOptions
                        );
                    }

                    // create excel
                    const excel: Buffer =
                        this.helperFileService.writeExcel(serialization);

                    // set headers
                    responseExpress.setHeader(
                        'Content-Type',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    );
                    responseExpress.setHeader(
                        'Content-Disposition',
                        'attachment; filename=' + 'export.xlsx'
                    );
                    responseExpress.setHeader('Content-Length', excel.length);

                    // send excel
                    return responseExpress.send(excel);
                })
            );
        }

        return next.handle();
    }
}
