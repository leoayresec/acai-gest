import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma.service';
import { JwtStrategy } from './jwt.strategy'; // Estratégia para autenticação JWT
import { ConfigModule } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
     // 🔹 Para carregar as variáveis do .env
    JwtModule.register({
      secret: process.env.JWT_SECRET, // 🔑 Carregando a chave secreta do .env
      signOptions: { expiresIn: '1h' }, // Tempo de expiração do token
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, EmailService],
  exports: [AuthService, JwtModule], // 🔹 Exporta o AuthService e JwtModule para outros módulos
})
export class AuthModule {}
