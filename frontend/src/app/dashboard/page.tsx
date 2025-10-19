'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DefectCard } from '@/components/defects/defect-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { defectsApi } from '@/lib/api/index';
import type { Defect, DefectStatus } from '@/types';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loadingDefects, setLoadingDefects] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | DefectStatus>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDefects();
    }
  }, [user]);

  const loadDefects = async () => {
    try {
      setLoadingDefects(true);
      const response = await defectsApi.getAssignedDefects({ limit: 100 });
      setDefects(response.data);
    } catch (error) {
      console.error('Failed to load defects:', error);
    } finally {
      setLoadingDefects(false);
    }
  };

  const filterDefectsByStatus = (status: 'all' | DefectStatus) => {
    if (status === 'all') return defects;
    return defects.filter((d) => d.status === status);
  };

  const getStatusCount = (status: 'all' | DefectStatus) => {
    if (status === 'all') return defects.length;
    return defects.filter((d) => d.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show different dashboard for Engineer role
  if (user.role === 'engineer') {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Мои задачи</h1>
            <Button onClick={() => router.push('/dashboard/defects/new')}>
              Создать дефект
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | DefectStatus)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                Все ({getStatusCount('all')})
              </TabsTrigger>
              <TabsTrigger value="new">
                Новая ({getStatusCount('new')})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                В работе ({getStatusCount('in_progress')})
              </TabsTrigger>
              <TabsTrigger value="under_review">
                На проверке ({getStatusCount('under_review')})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Закрыта ({getStatusCount('closed')})
              </TabsTrigger>
            </TabsList>

            {loadingDefects ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="all" className="mt-0">
                  {filterDefectsByStatus('all').length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        У вас пока нет назначенных дефектов
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filterDefectsByStatus('all').map((defect) => (
                        <DefectCard key={defect.id} defect={defect} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="new" className="mt-0">
                  {filterDefectsByStatus('new').length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Нет новых дефектов
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filterDefectsByStatus('new').map((defect) => (
                        <DefectCard key={defect.id} defect={defect} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="in_progress" className="mt-0">
                  {filterDefectsByStatus('in_progress').length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Нет дефектов в работе
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filterDefectsByStatus('in_progress').map((defect) => (
                        <DefectCard key={defect.id} defect={defect} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="under_review" className="mt-0">
                  {filterDefectsByStatus('under_review').length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Нет дефектов на проверке
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filterDefectsByStatus('under_review').map((defect) => (
                        <DefectCard key={defect.id} defect={defect} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="closed" className="mt-0">
                  {filterDefectsByStatus('closed').length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Нет закрытых дефектов
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filterDefectsByStatus('closed').map((defect) => (
                        <DefectCard key={defect.id} defect={defect} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
      </div>
    );
  }

  // Manager dashboard with analytics
  if (user.role === 'manager') {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold">Панель аналитики</h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего дефектов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Загрузка данных...
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">В работе</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Активные дефекты
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Просрочено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">-</div>
                <p className="text-xs text-muted-foreground">
                  Требуют внимания
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Закрыто</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">-</div>
                <p className="text-xs text-muted-foreground">
                  Завершенные дефекты
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Добро пожаловать в систему контроля</CardTitle>
              <CardDescription>
                Аналитика и отчеты по дефектам для менеджеров
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Используйте навигацию выше для доступа к различным разделам системы:
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-medium">Аналитика</span> - просмотр статистики и ключевых показателей
                </li>
                <li>
                  <span className="font-medium">Проекты</span> - управление проектами, объектами и этапами
                </li>
                <li>
                  <span className="font-medium">Дефекты</span> - просмотр и управление всеми дефектами
                </li>
                <li>
                  <span className="font-medium">Отчеты</span> - экспорт данных в CSV и Excel
                </li>
              </ul>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Default dashboard for Observer
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Панель управления</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Информация о пользователе</CardTitle>
              <CardDescription>Ваши данные в системе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">ФИО:</span> {user.lastName} {user.firstName}{' '}
                {user.middleName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Роль:</span>{' '}
                <span className="capitalize">{user.role}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Роли в системе</CardTitle>
              <CardDescription>Описание ролей пользователей</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Engineer:</span> Инженер - базовая роль по умолчанию
              </div>
              <div>
                <span className="font-medium">Manager:</span> Менеджер - расширенные права
              </div>
              <div>
                <span className="font-medium">Observer:</span> Наблюдатель - права только на
                просмотр
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
