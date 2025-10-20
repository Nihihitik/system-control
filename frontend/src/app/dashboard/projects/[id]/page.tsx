'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectTeamSection } from '@/components/projects/project-team-section';
import { CreateObjectDialog } from '@/components/projects/create-object-dialog';
import { CreateStageDialog } from '@/components/projects/create-stage-dialog';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { projectsApi } from '@/lib/api';
import type { Project, BuildingObject } from '@/types';

export default function ProjectDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createObjectOpen, setCreateObjectOpen] = useState(false);
  const [createStageOpen, setCreateStageOpen] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && projectId) {
      loadProject();
    }
  }, [user, projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getProjectById(projectId);
      setProject(data);
    } catch (error: any) {
      console.error('Failed to load project:', error);
      setError(error?.message || 'Не удалось загрузить проект');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStage = (objectId: number) => {
    setSelectedObjectId(objectId);
    setCreateStageOpen(true);
  };

  const handleArchive = async () => {
    if (!confirm('Вы уверены, что хотите архивировать этот проект?')) {
      return;
    }

    try {
      await projectsApi.archiveProject(projectId);
      router.push('/dashboard/projects');
    } catch (error: any) {
      console.error('Failed to archive project:', error);
      alert(error?.message || 'Не удалось архивировать проект');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {error || 'Проект не найден'}
              </p>
              <Button onClick={() => router.push('/dashboard/projects')}>
                Вернуться к списку проектов
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const isManager = user.role === 'manager';
  const isObserver = user.role === 'observer';

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            ← Назад
          </Button>
          <div className="flex gap-2">
            {isObserver && (
              <Badge variant="secondary" className="text-sm">
                Только просмотр
              </Badge>
            )}
            {isManager && (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/projects/${projectId}/edit`)}
                >
                  Редактировать
                </Button>
                <Button variant="outline" onClick={handleArchive}>
                  Архивировать
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription className="mt-2">
                      {project.description}
                    </CardDescription>
                  )}
                </div>
                {project.isArchived && (
                  <Badge variant="secondary">Архивирован</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Дата начала</p>
                  <p className="font-medium">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString('ru-RU')
                      : 'Не указана'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Дата окончания</p>
                  <p className="font-medium">
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString('ru-RU')
                      : 'Не указана'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Объектов</p>
                  <p className="font-medium">{project.objects?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Дефектов</p>
                  <p className="font-medium">{project._count?.defects || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Building Objects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Объекты строительства</CardTitle>
                  <CardDescription>
                    Список объектов и этапов работ
                  </CardDescription>
                </div>
                {isManager && (
                  <Button onClick={() => setCreateObjectOpen(true)}>
                    Создать объект
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!project.objects || project.objects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    В проекте пока нет объектов строительства
                  </p>
                  {isManager && (
                    <Button onClick={() => setCreateObjectOpen(true)}>
                      Создать первый объект
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {project.objects.map((object) => (
                    <Card key={object.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{object.name}</CardTitle>
                            {object.type && (
                              <Badge variant="outline" className="mt-1">
                                {object.type}
                              </Badge>
                            )}
                            {object.description && (
                              <CardDescription className="mt-2">
                                {object.description}
                              </CardDescription>
                            )}
                          </div>
                          {isManager && (
                            <Button
                              variant="outline"
                              onClick={() => handleCreateStage(object.id)}
                            >
                              Добавить этап
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      {object.stages && object.stages.length > 0 && (
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium mb-3">Этапы работ:</p>
                            {object.stages.map((stage) => (
                              <div
                                key={stage.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">{stage.name}</p>
                                  {stage.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {stage.description}
                                    </p>
                                  )}
                                  {(stage.startDate || stage.endDate) && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {stage.startDate &&
                                        new Date(stage.startDate).toLocaleDateString(
                                          'ru-RU',
                                        )}
                                      {stage.startDate && stage.endDate && ' - '}
                                      {stage.endDate &&
                                        new Date(stage.endDate).toLocaleDateString(
                                          'ru-RU',
                                        )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Section */}
          <ProjectTeamSection
            projectId={projectId}
            managers={project.managers}
            observers={project.observers}
            engineers={project.engineers}
            isManager={isManager}
            onUpdate={loadProject}
          />
        </div>
      </main>

      {/* Dialogs */}
      <CreateObjectDialog
        projectId={projectId}
        open={createObjectOpen}
        onOpenChange={setCreateObjectOpen}
        onSuccess={loadProject}
      />
      {selectedObjectId && (
        <CreateStageDialog
          buildingObjectId={selectedObjectId}
          open={createStageOpen}
          onOpenChange={setCreateStageOpen}
          onSuccess={loadProject}
        />
      )}
    </div>
  );
}
