'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DefectCard } from '@/components/defects/defect-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { defectsApi, analyticsApi, projectsApi } from '@/lib/api/index';
import type { Defect, DefectStatus, AnalyticsOverview, AnalyticsTrendsDataPoint, Project } from '@/types';
import { TrendsChart } from '@/components/analytics/trends-chart';
import { StatusPieChart } from '@/components/analytics/status-pie-chart';
import { PriorityBarChart } from '@/components/analytics/priority-bar-chart';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assignedDefects, setAssignedDefects] = useState<Defect[]>([]);
  const [createdDefects, setCreatedDefects] = useState<Defect[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingDefects, setLoadingDefects] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'created'>('assigned');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'engineer') {
      loadEngineerData();
    }
  }, [user]);

  const loadEngineerData = async () => {
    try {
      setLoadingDefects(true);
      setLoadingProjects(true);

      const [assignedResponse, createdResponse, projectsData] = await Promise.all([
        defectsApi.getAssignedDefects({ limit: 100 }),
        defectsApi.getCreatedDefects({ limit: 100 }),
        projectsApi.getMyProjects(),
      ]);

      setAssignedDefects(assignedResponse.data);
      setCreatedDefects(createdResponse.data);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load engineer data:', error);
    } finally {
      setLoadingDefects(false);
      setLoadingProjects(false);
    }
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
            <h1 className="text-3xl font-bold">Моя панель</h1>
            <Button onClick={() => router.push('/dashboard/defects/new')}>
              Создать дефект
            </Button>
          </div>

          {/* Projects Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Мои проекты</h2>
            {loadingProjects ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Вы пока не назначены ни на один проект
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>
                        {project.description || 'Нет описания'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Объектов:</span>
                          <span>{project.objects?.length || 0}</span>
                        </div>
                        {project._count && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Дефектов:</span>
                            <span>{project._count.defects}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Defects Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Мои задачи</h2>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'assigned' | 'created')}>
              <TabsList className="mb-6">
                <TabsTrigger value="assigned">
                  Назначенные мне ({assignedDefects.length})
                </TabsTrigger>
                <TabsTrigger value="created">
                  Созданные мной ({createdDefects.length})
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
                  <TabsContent value="assigned" className="mt-0">
                    {assignedDefects.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          У вас пока нет назначенных дефектов
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {assignedDefects.map((defect) => (
                          <DefectCard key={defect.id} defect={defect} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="created" className="mt-0">
                    {createdDefects.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          Вы пока не создали ни одного дефекта
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {createdDefects.map((defect) => (
                          <DefectCard key={defect.id} defect={defect} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    );
  }

  // Manager and Observer dashboard with analytics
  if (user.role === 'manager' || user.role === 'observer') {
    return <AnalyticsDashboard userRole={user.role} />;
  }

  // Default dashboard - should not reach here
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

function AnalyticsDashboard({ userRole }: { userRole: 'manager' | 'observer' }) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrendsDataPoint[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoadingOverview(true);
      setLoadingTrends(true);

      const [overviewData, trendsData] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getTrends(30),
      ]);

      setOverview(overviewData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingOverview(false);
      setLoadingTrends(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Панель аналитики</h1>
            <p className="text-muted-foreground mt-2">
              Просмотр статистики и ключевых показателей
            </p>
          </div>
          {userRole === 'observer' && (
            <Badge variant="secondary" className="text-sm">
              Только просмотр
            </Badge>
          )}
        </div>

        {loadingOverview ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : overview ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего дефектов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.total}</div>
                <p className="text-xs text-muted-foreground">
                  По всем проектам
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">В работе</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {overview.byStatus.in_progress}
                </div>
                <p className="text-xs text-muted-foreground">
                  Активные дефекты
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">На проверке</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {overview.byStatus.under_review}
                </div>
                <p className="text-xs text-muted-foreground">
                  Требуют проверки
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Закрыто</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {overview.byStatus.closed}
                </div>
                <p className="text-xs text-muted-foreground">
                  Завершенные дефекты
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-6 mb-8">
          {loadingTrends ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ) : trends.length > 0 ? (
            <TrendsChart data={trends} />
          ) : null}
        </div>

        {overview && (
          <div className="grid gap-6 md:grid-cols-2">
            {loadingOverview ? (
              <>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <StatusPieChart data={overview.byStatus} />
                <PriorityBarChart data={overview.byPriority} />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
