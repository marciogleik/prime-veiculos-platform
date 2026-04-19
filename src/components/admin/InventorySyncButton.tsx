
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { syncInventoryAction } from '@/app/(admin)/dashboard/veiculos/sync-action';

export default function InventorySyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('Sincronizando com Revenda Mais...', {
      description: 'Lendo XML e atualizando estoque. Por favor, aguarde.'
    });

    try {
      const result = await syncInventoryAction();
      
      if (result.success) {
        toast.success('Estoque atualizado!', {
          id: toastId,
          description: `Importados: ${result.imported} | Atualizados: ${result.updated}.`,
          duration: 5000
        });
        // Refresh page to show new data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(result.errors.join(', '));
      }
    } catch (err: any) {
      console.error('Erro na sincronia:', err);
      toast.error('Erro na sincronização', {
        id: toastId,
        description: 'Verifique se o link XML está ativo no Revenda Mais.',
        duration: 5000
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      className="h-14 px-6 rounded-2xl border-2 gap-3 font-black text-[10px] tracking-[0.2em] uppercase hover:bg-slate-50 transition-all group"
    >
      <RefreshCw className={`w-4 h-4 text-primary ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
      {isSyncing ? 'SINCRONIZANDO...' : 'SINCRONIZAR ESTOQUE'}
    </Button>
  );
}
