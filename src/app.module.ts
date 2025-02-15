import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { EmpresaModule } from './empresa/empresa.module';
import { AuthModule } from './config/auth/auth.module';

@Module({
  imports: [EmpresaModule, PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
