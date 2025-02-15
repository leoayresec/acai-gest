import { Module } from '@nestjs/common';
import { UnidadesMedidasService } from './unidades_medidas.service';
import { UnidadesMedidasController } from './unidades_medidas.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [UnidadesMedidasController],
  providers: [UnidadesMedidasService, PrismaService],
  exports: [UnidadesMedidasService],
})
export class UnidadesMedidasModule {}
