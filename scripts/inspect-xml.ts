
import axios from 'axios';

async function inspectXML() {
  const url = 'http://app.revendamais.com.br/application/index.php/apiGeneratorXml/generator/sitedaloja/761d7b59411166aa6398d452be40212134093.xml';
  console.log('--- INSPECIONANDO XML REVENDA MAIS ---');
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    console.log('Status:', response.status);
    console.log('Tipo:', response.headers['content-type']);
    console.log('Conteúdo (Início):');
    console.log(response.data.substring(0, 2000));
  } catch (err: any) {
    console.error('Erro ao ler XML:', err.message);
  }
}

inspectXML();
