import { Controller, Get } from '@nestjs/common';
import { UnidadesMedidasService } from './unidades_medidas.service';

@Controller('unidades-medidas')
export class UnidadesMedidasController {
  constructor(private readonly unidadesMedidasService: UnidadesMedidasService) {}

  // ✅ Rota para buscar todas as unidades de medida
  @Get()
  async findAll() {
    return this.unidadesMedidasService.findAll();
  }
}
