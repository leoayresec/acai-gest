import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '',
    });
  }

  async validate(payload: any) {  
    const usuario = await this.prisma.tab_usuarios.findUnique({
      where: { id_usuario: payload.sub },
      include: { tab_empresas: true },
    });
  
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }
      return {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      id_empresa: usuario.empresa_id,
    };
  }
}


  