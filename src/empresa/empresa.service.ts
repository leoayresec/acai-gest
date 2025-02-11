import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/criar-empresa-dto';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  private async verificarEmailExistente(email: string): Promise<void> {
    const emailExistente = await this.empresaRepository.findOne({
      where: { email },
    });

    if (emailExistente) {
      throw new BadRequestException('O email informado já está em uso. Tente outro email ou recupere sua senha.');
    }
  }
  
  private async verificarCpfCnpjExistente(cpf_cnpj: string): Promise<void> {
    const cpfCnpjExistente = await this.empresaRepository.findOne({
      where: { cpf_cnpj },
    });

    if (cpfCnpjExistente) {
      throw new BadRequestException('O cpf/cnpj informado já está em uso. Tente outro cpf/cnpj ou recupere sua senha.');
    }
  }
  private async criptografarSenha(senha: string): Promise<string> {
    const salt = await bcrypt.genSalt(10); 
    return bcrypt.hash(senha, salt);
  }

  async create(createEmpresaDto: CreateEmpresaDto) {
    await this.verificarEmailExistente(createEmpresaDto.email);
    await this.verificarCpfCnpjExistente(createEmpresaDto.cpf_cnpj);
    createEmpresaDto.senha = await this.criptografarSenha(createEmpresaDto.senha);

    const empresa = this.empresaRepository.create(createEmpresaDto);

    return await this.empresaRepository.save(empresa);
  }
}
