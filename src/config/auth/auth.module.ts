import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from '../email/email.module'; // ✅ Importando o EmailModule

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '15m' },
    }),
    EmailModule, // ✅ Adicionando o EmailModule
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
