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
import { Label } from '@/components/ui/label';
import { usersApi, projectsApi } from '@/lib/api';
import type { UserRole } from '@/types';

interface AssignUserDialogProps {
  projectId: number;
  role: 'manager' | 'observer' | 'engineer';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignUserDialog({
  projectId,
  role,
  open,
  onOpenChange,
  onSuccess,
}: AssignUserDialogProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Введите email пользователя');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Введите корректный email адрес');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Find user by email
      const user = await usersApi.findByEmail(email, role as UserRole);

      // Assign user based on role
      if (role === 'manager') {
        await projectsApi.assignManager(projectId, user.id);
      } else if (role === 'observer') {
        await projectsApi.assignObserver(projectId, user.id);
      } else if (role === 'engineer') {
        await projectsApi.assignEngineer(projectId, user.id);
      }

      setEmail('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to assign user:', error);
      if (error.message.includes('404') || error.message.includes('not found')) {
        setError('Пользователь с таким email не найден');
      } else {
        setError(error?.message || 'Не удалось назначить пользователя');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'manager':
        return 'менеджера';
      case 'observer':
        return 'наблюдателя';
      case 'engineer':
        return 'инженера';
      default:
        return 'пользователя';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Назначить {getRoleLabel()}</DialogTitle>
          <DialogDescription>
            Введите email пользователя для назначения на проект
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email пользователя</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={loading}
              required
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
              {loading ? 'Назначение...' : 'Назначить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
