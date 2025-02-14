import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { EmpresaModule } from './empresa/empresa.module';

@Module({
  imports: [EmpresaModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
