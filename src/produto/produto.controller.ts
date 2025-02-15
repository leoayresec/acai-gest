import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { JwtAuthGuard } from '../config/auth/jwt-auth.guard';

@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @UseGuards(JwtAuthGuard)
  @Post('criar')
  async criarProduto(@Request() req, @Body() produtoData) {
    return this.produtoService.create(req.user, produtoData);
  }
}
