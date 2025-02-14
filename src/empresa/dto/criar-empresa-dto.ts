import { IsString, IsEmail, IsNotEmpty, Length, Matches, IsBoolean, IsOptional } from 'class-validator';

export class CreateEmpresaDto {
  @IsNotEmpty({ message: 'A Razão Social da empresa é obrigatória.' })
  @IsString()
  razao_social: string;

  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  @IsString()
  num_telefone: string; // ✅ Corrigido para `num_telefone`, que é o nome correto no banco

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

  @IsNotEmpty({ message: 'O número do endereço é obrigatório.' })
  @IsString()
  numero: string; // ✅ Corrigido para `numero`, que é o nome correto no banco

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsString()
  senha: string;
  
  @IsOptional() // ✅ Campo opcional, pois no banco já tem um valor padrão `false`
  @IsBoolean()
  ativo?: boolean;
}
