import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database') // Certifique-se de que o prefixo está correto
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('test-connection') // O caminho precisa ser exatamente esse
  async testConnection() {
    return this.databaseService.testConnection();
  }
}