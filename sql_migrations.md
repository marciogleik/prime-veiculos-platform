# Script de Migração SQL - Prime Veículos

Para que os novos campos de **Placa** e **Renavam** funcionem, você precisa rodar este comando no **SQL Editor** do seu painel do Supabase:

```sql
-- Adiciona campos de controle interno para veículos
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS plate text,
ADD COLUMN IF NOT EXISTS renavam text;

-- Comentário para documentar que são campos privados
COMMENT ON COLUMN vehicles.plate IS 'Placa do veículo (uso interno)';
COMMENT ON COLUMN vehicles.renavam IS 'Número do Renavam (uso interno)';
```

> [!IMPORTANT]
> Após rodar esse comando, o sistema já estará pronto para salvar e editar esses dados no seu painel administrativo. Eles **não** serão exibidos para os clientes no catálogo público. 
