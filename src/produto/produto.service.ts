import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProdutoService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Criar um produto vinculado à empresa do usuário autenticado via token
  async create(usuarioAuth, data) {
    if (!usuarioAuth || !usuarioAuth.id_empresa) {
      throw new UnauthorizedException('Usuário não autenticado ou sem empresa vinculada.');
    }

    // ✅ Criar o produto vinculado à empresa do usuário autenticado
    return this.prisma.tab_produtos.create({
      data: {
        ...data,
        id_empresa: usuarioAuth.id_empresa, // Obtém a empresa diretamente do token
      },
    });
  }
}
