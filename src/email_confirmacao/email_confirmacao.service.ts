import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailConfirmacao } from './entities/email_confirmacao.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class EmailConfirmacaoService {
  constructor(
    @InjectRepository(EmailConfirmacao)
    private readonly emailConfirmacaoRepository: Repository<EmailConfirmacao>,
  ) {}

  async gerarToken(empresa: Empresa): Promise<string> {
    const token = randomUUID();

    const dtExpiracao = new Date(empresa.dt_criacao);
    dtExpiracao.setDate(dtExpiracao.getDate() + 1); 

    const emailConfirmacao = this.emailConfirmacaoRepository.create({
      id_usuario: empresa,
      token,
      dt_expiracao: dtExpiracao,
    });

    await this.emailConfirmacaoRepository.save(emailConfirmacao);

    return token;
  }

  async validarToken(token: string): Promise<Empresa | null> {
    const registro = await this.emailConfirmacaoRepository.findOne({
      where: { token },
      relations: ['id_usuario'],
    });

    if (!registro || new Date() > registro.dt_expiracao) {
      return null;
    }

    return registro.id_usuario;
  }

  async removerToken(token: string) {
    await this.emailConfirmacaoRepository.delete({ token });
  }
}
