import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller'; // 🔹 Importar o controller

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig)],
  controllers: [DatabaseController], // 🔹 Adicionar aqui
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
