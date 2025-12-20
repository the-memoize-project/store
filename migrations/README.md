# Database Migrations

Este diretório contém as migrations do banco de dados D1 (Cloudflare).

## Como usar

O projeto possui um script `migration` que facilita a execução das migrations:

```bash
bun run migration
```

### Opções disponíveis

#### Desenvolvimento (Local)

```bash
# Aplicar todas as migrations pendentes localmente
bun run migration --local
```

#### Produção (Remoto)

```bash
# Aplicar todas as migrations pendentes em produção
bun run migration --remote
```

## Criando novas migrations

1. Crie um arquivo SQL na pasta `migrations/` seguindo o padrão:
   ```
   0002_descricao_da_mudanca.sql
   ```

2. Use sempre números sequenciais com zeros à esquerda (0001, 0002, etc.)

3. Exemplo de migration:
   ```sql
   -- Migration: Add tags to cards
   -- Created: 2025-12-19

   CREATE TABLE IF NOT EXISTS tag (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     user_id TEXT NOT NULL
   );

   CREATE INDEX IF NOT EXISTS idx_tag_user_id ON tag(user_id);
   ```

## Workflow recomendado

```bash
# 1. Criar a migration (arquivo SQL)
# 2. Testar localmente
bun run migration --local

# 3. Testar a aplicação
bun run dev

# 4. Se tudo estiver ok, aplicar em produção
bun run migration --remote

# 5. Deploy da aplicação
bun run deploy
```

## Importante

- **Nunca edite migrations já aplicadas em produção**
- Sempre crie uma nova migration para fazer alterações
- As migrations são aplicadas automaticamente na ordem dos nomes dos arquivos
- O D1 rastreia quais migrations já foram executadas
