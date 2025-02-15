import { Module, DynamicModule, Type, ForwardReference } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';


// 🔹 Função para buscar módulos dentro de subdiretórios recursivamente
function getModulesFromDirectory(directory: string): any[] {
  const modules: any[] = [];

  readdirSync(directory, { withFileTypes: true }).forEach((fileOrDir) => {
    const fullPath = join(directory, fileOrDir.name);

    if (fileOrDir.isDirectory()) {
      // 🔍 Se for uma pasta, buscar módulos dentro dela (recursivo)
      modules.push(...getModulesFromDirectory(fullPath));
    } else if (fileOrDir.isFile() && fileOrDir.name.endsWith('.module.js')) {
      try {
        const module = require(fullPath);
        const moduleKey = Object.keys(module).find((key) => key.endsWith('Module'));

        if (moduleKey) {
          modules.push(module[moduleKey]);
        }
      } catch (error) {
      }
    }
  });

  return modules;
}

// 🔥 Função principal para carregar módulos dinamicamente
function loadModules(): Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference<any>> {
  const modulesDirectory = __dirname;
  const modules = getModulesFromDirectory(modulesDirectory);
  return modules;
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    ...loadModules(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
