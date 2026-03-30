"use client";

import { useState, useCallback } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Image as ImageIcon, X, Trophy, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Photo {
  id: string;
  url: string;
  file?: File;
}

interface SortablePhotoProps {
  photo: Photo;
  isMain: boolean;
  onRemove: (id: string) => void;
}

function SortablePhoto({ photo, isMain, onRemove }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden group border border-gray-100"
    >
      <div {...attributes} {...listeners} className="w-full h-full cursor-grab active:cursor-grabbing">
        <Image src={photo.url} alt="Veículo" fill className="object-cover" />
      </div>
      
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-2 right-2 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(photo.id)}
      >
        <X className="w-4 h-4" />
      </Button>

      {isMain && (
        <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Trophy className="w-3 h-3" /> CAPA
        </div>
      )}
    </div>
  );
}

export default function FotoUpload({ 
  initialPhotos = [], 
  onPhotosChange 
}: { 
  initialPhotos?: Photo[], 
  onPhotosChange: (photos: Photo[]) => void 
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        onPhotosChange(newOrder);
        return newOrder;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos: Photo[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file
    }));
    
    setPhotos(prev => [...prev, ...newPhotos]);
    onPhotosChange([...photos, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    const newPhotos = photos.filter(p => p.id !== id);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Galeria de Fotos</h3>
          <p className="text-xs text-gray-400 mt-1">Primeira foto será a capa. Arraste para reordenar.</p>
        </div>
        
        <div className="relative">
          <Input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="photo-input"
            onChange={handleFileChange}
          />
          <Label 
            htmlFor="photo-input" 
            className="bg-black text-white hover:bg-primary h-10 px-4 rounded-xl flex items-center gap-2 cursor-pointer font-bold transition-all"
          >
            <Upload className="w-4 h-4" />
            ADICIONAR FOTOS
          </Label>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <SortableContext items={photos} strategy={horizontalListSortingStrategy}>
            {photos.map((photo, index) => (
              <SortablePhoto 
                key={photo.id} 
                photo={photo} 
                isMain={index === 0} 
                onRemove={removePhoto}
              />
            ))}
          </SortableContext>
          
          {photos.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-gray-100 rounded-3xl p-12 flex flex-col items-center justify-center text-gray-400">
              <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Nenhuma foto adicionada ainda.</p>
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
