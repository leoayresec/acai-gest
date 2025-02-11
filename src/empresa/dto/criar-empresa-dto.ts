import { IsString, IsEmail, IsNotEmpty, Length, Matches, IsBoolean } from 'class-validator';

export class CreateEmpresaDto {
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório.' })
  @IsString()
  nome: string;

  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  @IsString()
  telefone: string;

  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @IsEmail({}, { message: 'O e-mail informado não é válido.' })
  email: string;

  @IsNotEmpty({ message: 'O CPF/CNPJ é obrigatório.' })
  @IsString()
  @Length(11, 14, { message: 'O CPF/CNPJ deve ter entre 11 e 14 caracteres.' })
  @Matches(/^\d+$/, { message: 'O CPF/CNPJ deve conter apenas números.' })
  cpf_cnpj: string;

  @IsNotEmpty({ message: 'O CEP é obrigatório.' })
  @IsString()
  cep: string;

  @IsNotEmpty({ message: 'O endereço é obrigatório.' })
  @IsString()
  endereco: string;

  @IsNotEmpty({ message: 'O número é obrigatório.' })
  @IsString()
  numero: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsString()
  senha: string;
  
  @IsBoolean()
  ativo: boolean;
}
