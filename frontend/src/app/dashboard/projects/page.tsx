'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { projectsApi } from '@/lib/api';
import type { Project } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

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
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await projectsApi.getMyProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
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
              {isObserver ? 'Просмотр проектов' : 'Управление проектами'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isObserver
                ? 'Просмотр проектов, объектов и этапов'
                : 'Просмотр и управление проектами, объектами и этапами'}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {isObserver && (
              <Badge variant="secondary" className="text-sm">
                Только просмотр
              </Badge>
            )}
            {!isObserver && (
              <Button onClick={() => router.push('/dashboard/projects/new')}>
                Создать проект
              </Button>
            )}
          </div>
        </div>

        {loadingProjects ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                У вас пока нет назначенных проектов
              </p>
              <Button onClick={() => router.push('/dashboard/projects/new')}>
                Создать первый проект
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className={isObserver ? '' : 'hover:shadow-md transition-shadow'}
              >
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {project.description || 'Без описания'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Объектов:</span>
                      <span>{project.objects?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Дефектов:</span>
                      <span>{project._count?.defects || 0}</span>
                    </div>
                    {project.startDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Начало:</span>
                        <span>
                          {new Date(project.startDate).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}
                    {project.endDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Окончание:</span>
                        <span>
                          {new Date(project.endDate).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}
                  </div>
                  {!isObserver && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      >
                        Просмотр
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => router.push(`/dashboard/projects/${project.id}/edit`)}
                      >
                        Редактировать
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
