import { registerAs } from '@nestjs/config';
import ms from 'ms';

export default registerAs(
    'mail',
    (): Record<string, any> => ({
        mailHost: process.env.MAIL_HOST || 'smtp.sendgrid.net',
        mailUser: process.env.MAIL_USER || 'apikey',
        mailPassword: process.env.MAIL_PASSWORD,
        mailFrom: process.env.MAIL_FROM || 'nguyenhuuphat2001@gmail.com',
    })
);
