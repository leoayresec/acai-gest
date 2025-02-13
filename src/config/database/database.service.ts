import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  async testConnection() {
    try {
      await this.dataSource.query('SELECT 1'); // Comando simples para testar conexão
      return { message: 'Conexão com o banco de dados bem-sucedida!' };
    } catch (error) {
      return { message: 'Erro na conexão com o banco', error: error.message };
    }
  }
}