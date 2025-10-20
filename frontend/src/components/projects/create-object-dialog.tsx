'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { projectsApi } from '@/lib/api';

interface CreateObjectDialogProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateObjectDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: CreateObjectDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Введите название объекта');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await projectsApi.createObject({
        projectId,
        name: name.trim(),
        type: type.trim() || undefined,
        description: description.trim() || undefined,
      });

      setName('');
      setType('');
      setDescription('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create object:', error);
      setError(error?.message || 'Не удалось создать объект');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать объект строительства</DialogTitle>
          <DialogDescription>
            Добавьте новый объект в проект
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="object-name">Название объекта *</Label>
            <Input
              id="object-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Корпус А"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="object-type">Тип объекта</Label>
            <Input
              id="object-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Например: Жилой дом"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="object-description">Описание</Label>
            <Textarea
              id="object-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание объекта"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
