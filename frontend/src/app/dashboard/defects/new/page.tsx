'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { projectsApi, defectsApi } from '@/lib/api/index';
import type { Project, BuildingObject, Stage, DefectPriority } from '@/types';

export default function NewDefectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedObject, setSelectedObject] = useState<BuildingObject | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<DefectPriority>('medium');
  const [plannedDate, setPlannedDate] = useState('');
  
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await projectsApi.getProjects(false);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Не удалось загрузить список проектов');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === parseInt(projectId));
    setSelectedProject(project || null);
    setSelectedObject(null);
    setSelectedStage(null);
  };

  const handleObjectChange = (objectId: string) => {
    const object = selectedProject?.objects?.find(o => o.id === parseInt(objectId));
    setSelectedObject(object || null);
    setSelectedStage(null);
  };

  const handleStageChange = (stageId: string) => {
    const stage = selectedObject?.stages?.find(s => s.id === parseInt(stageId));
    setSelectedStage(stage || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject || !selectedObject || !selectedStage) {
      setError('Пожалуйста, выберите проект, объект и этап');
      return;
    }

    if (!title.trim()) {
      setError('Пожалуйста, введите заголовок дефекта');
      return;
    }

    if (!description.trim()) {
      setError('Пожалуйста, введите описание дефекта');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const newDefect = await defectsApi.createDefect({
        title: title.trim(),
        description: description.trim(),
        projectId: selectedProject.id,
        buildingObjectId: selectedObject.id,
        stageId: selectedStage.id,
        priority,
        plannedDate: plannedDate || undefined,
      });

      // Redirect to the newly created defect or back to dashboard
      router.push(`/dashboard/defects/${newDefect.id}`);
    } catch (error: any) {
      console.error('Failed to create defect:', error);
      setError(error?.message || 'Не удалось создать дефект');
      setSubmitting(false);
    }
  };

  if (loading || loadingProjects) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            ← Назад
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Создать новый дефект</CardTitle>
            <CardDescription>
              Заполните форму для создания нового дефекта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="project">Проект *</Label>
                <Select 
                  value={selectedProject?.id.toString()} 
                  onValueChange={handleProjectChange}
                  disabled={submitting}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Выберите проект" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="object">Объект строительства *</Label>
                <Select 
                  value={selectedObject?.id.toString()} 
                  onValueChange={handleObjectChange}
                  disabled={!selectedProject || submitting}
                >
                  <SelectTrigger id="object">
                    <SelectValue placeholder="Выберите объект" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProject?.objects?.map((object) => (
                      <SelectItem key={object.id} value={object.id.toString()}>
                        {object.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Этап работ *</Label>
                <Select 
                  value={selectedStage?.id.toString()} 
                  onValueChange={handleStageChange}
                  disabled={!selectedObject || submitting}
                >
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Выберите этап" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedObject?.stages?.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id.toString()}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Заголовок *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Краткое описание проблемы"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Подробное описание дефекта"
                  rows={6}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Select 
                  value={priority} 
                  onValueChange={(value) => setPriority(value as DefectPriority)}
                  disabled={submitting}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="critical">Критический</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedDate">Плановая дата устранения</Label>
                <Input
                  id="plannedDate"
                  type="date"
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Создание...' : 'Создать дефект'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
