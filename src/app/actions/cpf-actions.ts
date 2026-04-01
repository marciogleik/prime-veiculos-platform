'use server'

export async function consultarCpfAction(cpf: string) {
    try {
        const apiKey = process.env.APICPF_KEY;
        const cleanCpf = cpf.replace(/\D/g, ''); // Remove pontos e traços
        
        if (cleanCpf.length !== 11) throw new Error('CPF Inválido');
        
        console.log(`[CPF API] Consultando CPF: ${cleanCpf}`);

        const response = await fetch(`https://apicpf.com/api/consulta?cpf=${cleanCpf}`, {
            headers: { 'X-API-KEY': apiKey || '' },
            next: { revalidate: 0 }
        });

        const fullResponse = await response.json().catch(() => ({}));
        console.log("[CPF API] Resposta:", JSON.stringify(fullResponse, null, 2));

        if (!response.ok) {
            const errorMsg = fullResponse.message || fullResponse.error || "";
            if (errorMsg.toLowerCase().includes('não encontrada')) {
                return {
                    success: true,
                    data: {
                        situacao_cadastral: 'NÃO LOCALIZADO',
                        nome: 'Nome não consta no registro atual',
                        mensagem: errorMsg || 'Pessoa não encontrada',
                        is_not_found: true
                    }
                };
            }
            throw new Error(errorMsg || `Erro na API: ${response.status}`);
        }

        // The API returns core data inside a 'data' property or at the root
        const apiData = fullResponse.data || fullResponse || {};
        
        // Return everything returned by the API, but ensure common fields are mapped for convenience
        return { 
            success: true, 
            data: {
                ...fullResponse, // Original structure
                ...apiData,      // Flattened core data
                nome: apiData.nome || apiData.nome_pessoa_fisica || fullResponse.nome || "Não Informado",
                situacao_cadastral: apiData.situacao_cadastral || fullResponse.situacao_cadastral || apiData.status || "REGULAR",
                score: apiData.score !== undefined ? apiData.score : (fullResponse.score !== undefined ? fullResponse.score : null),
                data_nascimento: apiData.data_nascimento || fullResponse.data_nascimento || null,
                genero: apiData.genero || fullResponse.genero || null,
            } 
        };
    } catch (error: any) {
        console.error("[CPF API] Erro:", error.message);
        return { success: false, message: error.message };
    }
}
