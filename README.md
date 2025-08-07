# Sistema de Backup de Arquivos via SFTP

Este é um sistema Node.js para fazer backup de arquivos e pastas de um servidor remoto via SFTP.

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Acesso SFTP ao servidor remoto

## 🚀 Instalação

1. Clone ou baixe os arquivos do projeto
2. Instale as dependências:

```bash
npm install
```

## ⚙️ Configuração

Edite o arquivo `config.json` com suas informações de conexão:

```json
{
  "origem": {
    "host": "seu-servidor.com.br",
    "user": "seu-usuario",
    "password": "sua-senha",
    "type": "sftp",
    "paths": [
      "/caminho/para/pasta1",
      "/caminho/para/pasta2",
      "/caminho/para/pasta3"
    ]
  },
  "destino": {
    "pasta_local": "./backup",
    "manter_estrutura": true
  },
  "opcoes": {
    "timeout": 30000,
    "retryAttempts": 3,
    "retryDelay": 1000
  }
}
```

### Configurações disponíveis:

#### Origem

- `host`: Endereço do servidor SFTP
- `user`: Nome de usuário para conexão
- `password`: Senha para conexão
- `type`: Tipo de conexão (sempre "sftp")
- `paths`: Array com os caminhos das pastas a serem copiadas

#### Destino

- `pasta_local`: Pasta local onde os arquivos serão salvos
- `manter_estrutura`: Se `true`, mantém a estrutura de pastas; se `false`, copia tudo para uma pasta única

#### Opções

- `timeout`: Timeout da conexão em milissegundos
- `retryAttempts`: Número de tentativas de reconexão
- `retryDelay`: Delay entre tentativas em milissegundos

## 🏃‍♂️ Execução

Execute o backup com um dos comandos:

```bash
npm start
```

ou

```bash
npm run backup
```

ou diretamente:

```bash
node backup.js
```

## 📊 Funcionalidades

- ✅ Conexão segura via SFTP
- ✅ Cópia recursiva de pastas e subpastas
- ✅ Manutenção da estrutura de diretórios (opcional)
- ✅ Tratamento de erros robusto
- ✅ Estatísticas detalhadas do processo
- ✅ Reconexão automática em caso de falha
- ✅ Logs detalhados do progresso

## 📁 Estrutura de Saída

Com `manter_estrutura: true`:

```
backup/
├── files/
│   ├── arquivo1.txt
│   └── subpasta/
│       └── arquivo2.txt
├── images/
│   └── foto.jpg
└── icons/
    └── icon.png
```

Com `manter_estrutura: false`:

```
backup/
├── arquivo1.txt
├── arquivo2.txt
├── foto.jpg
└── icon.png
```

## 🔧 Personalização

Você pode modificar o arquivo `backup.js` para adicionar funcionalidades como:

- Filtros de arquivos por extensão
- Compressão dos arquivos
- Backup incremental
- Notificações por email
- Logs em arquivo

## ⚠️ Segurança

- **IMPORTANTE**: Nunca commite senhas no controle de versão
- Considere usar chaves SSH em vez de senhas
- Use variáveis de ambiente para dados sensíveis em produção

## 🐛 Solução de Problemas

### Erro de conexão

- Verifique se o host, usuário e senha estão corretos
- Confirme se o servidor aceita conexões SFTP
- Verifique se a porta 22 está aberta

### Erro de permissão

- Verifique se o usuário tem permissão para acessar as pastas
- Confirme se as pastas de destino existem no servidor

### Timeout

- Aumente o valor de `timeout` no config.json
- Verifique a velocidade da conexão com o servidor

## 📝 Logs

O sistema exibe logs detalhados incluindo:

- Status da conexão
- Progresso da cópia de cada arquivo
- Estatísticas finais
- Erros encontrados

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

