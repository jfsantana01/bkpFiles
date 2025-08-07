const Client = require("ssh2-sftp-client");
const fs = require("fs-extra");
const path = require("path");

class BackupManager {
  constructor() {
    this.sftp = new Client();
    this.config = null;
    this.stats = {
      totalFiles: 0,
      copiedFiles: 0,
      errors: 0,
      startTime: null,
      endTime: null,
    };
  }

  async loadConfig() {
    try {
        

      const configData = await fs.readFile("config.json", "utf8");
      this.config = JSON.parse(configData);
      console.log("✅ Configuração carregada com sucesso");
      return true;
    } catch (error) {
      console.error("❌ Erro ao carregar configuração:", error.message);
      return false;
    }
  }

  async connect() {
    try {
      console.log(`🔌 Conectando ao servidor ${this.config.origem.host}...`);

      await this.sftp.connect({
        host: this.config.origem.host,
        username: this.config.origem.user,
        password: this.config.origem.password,
        readyTimeout: this.config.opcoes.timeout,
        retries: this.config.opcoes.retryAttempts,
        retry_factor: 2,
        retry_minTimeout: this.config.opcoes.retryDelay,
      });

      console.log("✅ Conectado com sucesso ao servidor SFTP");
      return true;
    } catch (error) {
      console.error("❌ Erro ao conectar:", error.message);
      return false;
    }
  }

  async createLocalDirectory(localPath) {
    try {
      await fs.ensureDir(localPath);
      console.log(`📁 Diretório criado/verificado: ${localPath}`);
    } catch (error) {
      console.error(`❌ Erro ao criar diretório ${localPath}:`, error.message);
    }
  }

  async copyDirectory(remotePath, localPath) {
    try {
      console.log(`📂 Copiando diretório: ${remotePath} -> ${localPath}`);

      // Verifica se o diretório remoto existe
      const exists = await this.sftp.exists(remotePath);
      if (!exists) {
        console.warn(`⚠️ Diretório remoto não encontrado: ${remotePath}`);
        return;
      }

      // Lista todos os arquivos no diretório remoto
      const files = await this.sftp.list(remotePath);

      for (const file of files) {
        const remoteFilePath = path.posix.join(remotePath, file.name);
        const localFilePath = path.join(localPath, file.name);

        if (file.type === "d") {
          // É um diretório, copia recursivamente
          await this.createLocalDirectory(localFilePath);
          await this.copyDirectory(remoteFilePath, localFilePath);
        } else {
          // É um arquivo, copia diretamente
          await this.copyFile(remoteFilePath, localFilePath);
        }
      }

      console.log(`✅ Diretório copiado com sucesso: ${remotePath}`);
    } catch (error) {
      console.error(
        `❌ Erro ao copiar diretório ${remotePath}:`,
        error.message
      );
      this.stats.errors++;
    }
  }

  async copyFile(remotePath, localPath) {
    try {
      this.stats.totalFiles++;
      console.log(`📄 Copiando arquivo: ${path.basename(remotePath)}`);

      // Garante que o diretório do arquivo seja criado
      const localDir = path.dirname(localPath);
      await this.createLocalDirectory(localDir);

      await this.sftp.fastGet(remotePath, localPath);
      this.stats.copiedFiles++;
    } catch (error) {
      console.error(`❌ Erro ao copiar arquivo ${remotePath}:`, error.message);
      this.stats.errors++;
    }
  }

  async executeBackup() {
    this.stats.startTime = new Date();
    console.log("🚀 Iniciando processo de backup...\n");

    // Carrega configuração
    if (!(await this.loadConfig())) {
      return false;
    }

    // Conecta ao servidor
    if (!(await this.connect())) {
      return false;
    }

    try {
      // Cria diretório de destino
      await this.createLocalDirectory(this.config.destino.pasta_local);

      // Copia cada caminho especificado
      for (const remotePath of this.config.origem.paths) {
        let localPath;

        if (this.config.destino.manter_estrutura) {
          // Mantém a estrutura de diretórios
          const pathParts = remotePath.split("/").filter((part) => part);
          const folderName = pathParts[pathParts.length - 1];
          localPath = path.join(this.config.destino.pasta_local, folderName);
        } else {
          // Copia tudo para a pasta de destino
          localPath = this.config.destino.pasta_local;
        }

        // Garante que a pasta de destino específica seja criada
        await this.createLocalDirectory(localPath);
        await this.copyDirectory(remotePath, localPath);
      }

      this.stats.endTime = new Date();
      this.printStats();
    } catch (error) {
      console.error("❌ Erro durante o backup:", error.message);
      return false;
    } finally {
      // Fecha conexão
      await this.sftp.end();
      console.log("🔌 Conexão fechada");
    }

    return true;
  }

  printStats() {
    const duration = this.stats.endTime - this.stats.startTime;
    const durationSeconds = Math.round(duration / 1000);

    console.log("\n📊 ESTATÍSTICAS DO BACKUP:");
    console.log("========================");
    console.log(`⏱️  Duração: ${durationSeconds} segundos`);
    console.log(`📁 Total de arquivos processados: ${this.stats.totalFiles}`);
    console.log(`✅ Arquivos copiados com sucesso: ${this.stats.copiedFiles}`);
    console.log(`❌ Erros: ${this.stats.errors}`);
    console.log(
      `📂 Pasta de destino: ${path.resolve(this.config.destino.pasta_local)}`
    );

    if (this.stats.errors === 0) {
      console.log("\n🎉 Backup concluído com sucesso!");
    } else {
      console.log(
        "\n⚠️ Backup concluído com alguns erros. Verifique os logs acima."
      );
    }
  }
}

// Executa o backup
async function main() {
  const backupManager = new BackupManager();
  const success = await backupManager.executeBackup();

  if (!success) {
    console.error("\n💥 Falha no processo de backup");
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Erro não tratado:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Exceção não capturada:", error);
  process.exit(1);
});

// Executa se for o arquivo principal
if (require.main === module) {
  main();
}

module.exports = BackupManager;
