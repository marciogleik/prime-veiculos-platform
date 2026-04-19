
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addExternalIdColumn() {
  console.log('--- ADICIONANDO COLUNA external_id AO BANCO ---');
  
  // Como o supabase-js não tem um método 'custom query' direto para DDL sem RPC,
  // usaremos uma técnica comum em scripts de migração: tentar inserir um mock 
  // que use o campo, ou apenas informar ao usuário para rodar o SQL se não houver RPC.
  
  // No entando, eu posso tentar usar a API do Supabase se o RPC 'exec_sql' estiver disponível,
  // mas o padrão é o usuário rodar no painel. 
  // Vou tentar criar um script que use o REST API para verificar se a coluna já existe.
  
  try {
    const { error } = await supabase.from('vehicles').select('external_id').limit(1);
    
    if (!error) {
      console.log('✅ A coluna external_id já existe.');
      return;
    }

    console.log('A coluna external_id não foi encontrada. Por favor, execute o seguinte comando no SQL Editor do Supabase:');
    console.log('\nALTER TABLE vehicles ADD COLUMN external_id text UNIQUE;\n');
    
  } catch (err: any) {
    console.error('Erro ao verificar coluna:', err.message);
  }
}

addExternalIdColumn();
