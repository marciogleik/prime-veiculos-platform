'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVehicleStore } from '@/store/vehicleStore';
import { Vehicle } from '@/types';
import { toast } from 'sonner';

const formSchema = z.object({
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  version: z.string().optional(),
  year: z.string().min(4, 'Ano inválido'),
  price: z.string().min(1, 'Preço é obrigatório'),
  mileage: z.string().min(1, 'KM é obrigatório'),
  transmission: z.enum(['Manual', 'Automático', 'CVT']),
  fuel: z.enum(['Flex', 'Gasolina', 'Elétrico', 'Diesel']),
  description: z.string().min(10, 'Descrição muito curta'),
});

interface AddVehicleFormProps {
  onSuccess: () => void;
}

export default function AddVehicleForm({ onSuccess }: AddVehicleFormProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const addVehicle = useVehicleStore((state) => state.addVehicle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transmission: 'Automático',
      fuel: 'Gasolina',
    },
  });

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    if (!image) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      brand_id: data.brand.toLowerCase(),
      brand: { id: data.brand.toLowerCase(), name: data.brand },
      model: data.model,
      year_fab: parseInt(data.year),
      year_model: parseInt(data.year),
      version: data.version,
      price: parseFloat(data.price.replace(/[^\d]/g, '')),
      mileage: parseInt(data.mileage),
      transmission: data.transmission,
      fuel: data.fuel,
      description: data.description,
      status: 'disponível',
      is_featured: false,
      accepts_proposal: true,
      seller_id: '1',
      slug: `${data.brand}-${data.model}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-'),
      photos: [
        { 
          id: 'temp', 
          vehicle_id: 'temp', 
          url: image, 
          storage_path: '', 
          order_index: 0 
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addVehicle(newVehicle);
    toast.success('Veículo adicionado com sucesso!');
    reset();
    setImage(null);
    onSuccess();
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-12">
      {/* Drag & Drop Area */}
      <div className="space-y-2">
        <Label>Imagem do Veículo</Label>
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-antigravity h-48 flex flex-col items-center justify-center transition-all overflow-hidden ${
            isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {image ? (
            <>
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur p-1.5 rounded-full shadow-sm hover:bg-white text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm font-medium text-slate-600">Arraste uma imagem ou clique</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" placeholder="Ex: Porsche" {...register('brand')} />
          {errors.brand && <p className="text-xs text-red-500">{errors.brand.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input id="model" placeholder="Ex: 911" {...register('model')} />
          {errors.model && <p className="text-xs text-red-500">{errors.model.message as string}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="version">Versão (Opcional)</Label>
        <Input id="version" placeholder="Ex: Carrera S" {...register('version')} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Input id="year" placeholder="2024" {...register('year')} />
          {errors.year && <p className="text-xs text-red-500">{errors.year.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mileage">KM</Label>
          <Input id="mileage" placeholder="0" {...register('mileage')} />
          {errors.mileage && <p className="text-xs text-red-500">{errors.mileage.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input id="price" placeholder="850.000" {...register('price')} />
          {errors.price && <p className="text-xs text-red-500">{errors.price.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Câmbio</Label>
          <Select onValueChange={(val) => setValue('transmission', val as any)} defaultValue="Automático">
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Automático">Automático</SelectItem>
              <SelectItem value="CVT">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Combustível</Label>
          <Select onValueChange={(val) => setValue('fuel', val as any)} defaultValue="Gasolina">
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Flex">Flex</SelectItem>
              <SelectItem value="Gasolina">Gasolina</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Elétrico">Elétrico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea 
          id="description" 
          placeholder="Descreva os detalhes do veículo..." 
          className="min-h-[100px] resize-none"
          {...register('description')}
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message as string}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-bold bg-slate-900">
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            SALVANDO...
          </>
        ) : (
          <>
            ADICIONAR AO CATÁLOGO
            <ChevronRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
