import { Module } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { ProdutoController } from './produto.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ProdutoController],
  providers: [ProdutoService, PrismaService],
  exports: [ProdutoService], // 🔹 Exportando para ser usado em outros módulos caso necessário
})
export class ProdutoModule {}
