import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
dotenv.config();

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('mail.mailHost'),

          secure: false,
          auth: {
            user: config.get('mail.mailUser'),
            pass: config.get('mail.mailPassword'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('mail.mailFrom')}>`,
        },
        template: {
          dir: `${process.cwd()}/dist/src/modules/mail/templates/`,
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
