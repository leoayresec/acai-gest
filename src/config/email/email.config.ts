import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const emailConfig: MailerOptions = {
  transport: {
    host: process.env.EMAIL_HOST, // Exemplo: smtp.gmail.com
    port: Number(process.env.EMAIL_PORT) || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
  defaults: {
    from: '"Suporte Açai Gest" <no-reply@acai-gest.com>',
  },
  template: {
    dir: join(__dirname, './template'), 
    adapter: new HandlebarsAdapter(),
    options: { strict: true },
  },
};
