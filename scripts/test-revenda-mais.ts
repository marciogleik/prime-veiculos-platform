
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.REVENDA_MAIS_API_KEY;
const API_URL = process.env.REVENDA_MAIS_API_URL;

async function testConnection() {
  console.log('--- TESTE DE CONEXÃO REVENDA MAIS ---');
  console.log('URL:', API_URL);
  
  if (!API_KEY) {
    console.error('ERRO: REVENDA_MAIS_API_KEY não encontrada no .env.local');
    return;
  }

  try {
    // Tenta buscar o estoque ou informações da revenda
    // Testamos alguns endpoints comuns de sistemas de integrador
    const endpoints = [
      '/estoque',
      '/vehicles',
      '/veiculos',
      '/inventory'
    ];

    for (const endpoint of endpoints) {
      console.log(`Testando endpoint: ${endpoint}...`);
      try {
        const response = await axios.get(`${API_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'X-API-KEY': API_KEY, // Algumas APIs usam header customizado
            'Accept': 'application/json'
          },
          timeout: 5000
        });
        
        console.log(`✅ SUCESSO no ${endpoint}!`);
        console.log('Status:', response.status);
        console.log('Dados recebidos (primeiros 100 caracteres):', JSON.stringify(response.data).substring(0, 100));
        return;
      } catch (e: any) {
        console.log(`❌ Falha no ${endpoint}: ${e.response?.status || e.message}`);
      }
    }
    
    console.error('ERRO: Não foi possível encontrar um endpoint de estoque válido.');
  } catch (err: any) {
    console.error('ERRO CRÍTICO:', err.message);
  }
}

testConnection();
