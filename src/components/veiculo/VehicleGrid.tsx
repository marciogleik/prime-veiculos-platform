'use client';

import { useVehicleStore } from '@/store/vehicleStore';
import VeiculoCard from './VeiculoCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function VehicleGrid() {
  const { vehicles } = useVehicleStore();

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-slate-500 font-medium">Nenhum veículo disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <AnimatePresence mode="popLayout">
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: [0.22, 1, 0.36, 1] 
            }}
            layout
          >
            <VeiculoCard veiculo={vehicle} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
