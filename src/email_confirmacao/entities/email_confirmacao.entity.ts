import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity('tab_email_confirmacao')
export class EmailConfirmacao {
  @PrimaryGeneratedColumn()
  id_email_verificacao: number;

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa, { onDelete: 'CASCADE' })
  id_usuario: Empresa;
  @Column()
  token: string;

  @CreateDateColumn()
  dt_expiracao: Date;
}
