'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Defect } from '@/types';
import { DefectCard } from '@/components/defects/defect-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DefectsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loadingDefects, setLoadingDefects] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user?.role !== 'manager') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'manager') {
      loadDefects();
    }
  }, [user]);

  const loadDefects = async () => {
    try {
      setLoadingDefects(true);
      const response = await defectsApi.getManagerDefects({ limit: 100 });
      setDefects(response.data);
    } catch (error) {
      console.error('Failed to load defects:', error);
    } finally {
      setLoadingDefects(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user || user.role !== 'manager') {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Все дефекты</h1>
            <p className="text-muted-foreground mt-2">
              Дефекты по всем вашим проектам
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Фильтры</Button>
            <Button>Создать дефект</Button>
          </div>
        </div>

        {loadingDefects ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : defects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Дефекты не найдены
              </p>
              <Button>Создать первый дефект</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Найдено дефектов: {defects.length}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {defects.map((defect) => (
                <DefectCard key={defect.id} defect={defect} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
