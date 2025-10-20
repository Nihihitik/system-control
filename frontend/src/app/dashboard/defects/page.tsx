'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { defectsApi } from '@/lib/api';
import type { Defect, DefectFilterParams } from '@/types';
import { DefectCard } from '@/components/defects/defect-card';
import { Skeleton } from '@/components/ui/skeleton';
import { DefectFilters } from '@/components/filters/defect-filters';

export default function DefectsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loadingDefects, setLoadingDefects] = useState(true);
  const [filters, setFilters] = useState<DefectFilterParams>({ limit: 100 });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && user.role !== 'manager' && user.role !== 'observer') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && (user.role === 'manager' || user.role === 'observer')) {
      loadDefects();
    }
  }, [user, filters]);

  const loadDefects = async () => {
    if (!user) return;

    try {
      setLoadingDefects(true);
      const response = user.role === 'observer'
        ? await defectsApi.getObserverDefects(filters)
        : await defectsApi.getManagerDefects(filters);
      setDefects(response.data);
    } catch (error) {
      console.error('Failed to load defects:', error);
    } finally {
      setLoadingDefects(false);
    }
  };

  const handleFiltersChange = (newFilters: DefectFilterParams) => {
    setFilters({ ...newFilters, limit: 100 });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'manager' && user.role !== 'observer')) {
    return null;
  }

  const isObserver = user.role === 'observer';

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {isObserver ? 'Просмотр дефектов' : 'Все дефекты'}
            </h1>
            <p className="text-muted-foreground mt-2">
              Дефекты по всем вашим проектам
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {isObserver && (
              <Badge variant="secondary" className="text-sm">
                Только просмотр
              </Badge>
            )}
            {!isObserver && (
              <Button onClick={() => router.push('/dashboard/defects/new')}>Создать дефект</Button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <DefectFilters filters={filters} onFiltersChange={handleFiltersChange} />
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
