import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpCode,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/criar-empresa-dto';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  // ✅ Criar uma nova empresa
  @Post()
  @HttpCode(201) // 🔹 Retorna código HTTP 201 (Created)
  async create(@Body() createEmpresaDto: CreateEmpresaDto) {
    try {
      return await this.empresaService.create(createEmpresaDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ Confirmar conta por token (ativação de empresa)
  @Get('confirmar')
  @HttpCode(200)
  async confirmarConta(@Query('token') token: string) {
    try {
      return await this.empresaService.confirmarConta(token);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ Buscar todas as empresas
  @Get()
  async findAll() {
    return this.empresaService.findAll();
  }

  // ✅ Buscar empresa pelo ID
  @Get(':id')
  async findOne(@Param('id_empresa') id_empresa: string) {
    const empresa = await this.empresaService.findOne(id_empresa);
    if (!empresa) {
      throw new BadRequestException('Empresa não encontrada.');
    }
    return empresa;
  }

  // ✅ Atualizar empresa pelo ID
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<CreateEmpresaDto>) {
    try {
      return await this.empresaService.update(id, updateData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ Remover empresa pelo ID
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.empresaService.remove(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
