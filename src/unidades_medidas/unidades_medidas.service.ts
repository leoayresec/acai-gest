import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UnidadesMedidasService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Buscar todas as unidades de medida
  async findAll() {
    return this.prisma.tab_unidades_medida.findMany();
  }
}
