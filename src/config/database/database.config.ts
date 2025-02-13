import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
import { Empresa } from '../../empresa/entities/empresa.entity';
import { EmailConfirmacao } from '../../email_confirmacao/entities/email_confirmacao.entity';

export const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Empresa, EmailConfirmacao],
    synchronize: process.env.DB_SYNCHRONIZE === 'true', 
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};
