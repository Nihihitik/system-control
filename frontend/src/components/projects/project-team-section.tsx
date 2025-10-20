'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AssignUserDialog } from './assign-user-dialog';
import { projectsApi } from '@/lib/api';
import type { User } from '@/types';

interface ProjectTeamSectionProps {
  projectId: number;
  managers?: User[];
  observers?: User[];
  engineers?: User[];
  isManager: boolean;
  onUpdate: () => void;
}

export function ProjectTeamSection({
  projectId,
  managers = [],
  observers = [],
  engineers = [],
  isManager,
  onUpdate,
}: ProjectTeamSectionProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<'manager' | 'observer' | 'engineer'>('engineer');
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);

  const handleOpenAssignDialog = (role: 'manager' | 'observer' | 'engineer') => {
    setAssignRole(role);
    setAssignDialogOpen(true);
  };

  const handleRemoveUser = async (userId: number, role: 'manager' | 'observer' | 'engineer') => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя из проекта?')) {
      return;
    }

    try {
      setRemovingUserId(userId);

      if (role === 'manager') {
        await projectsApi.removeManager(projectId, userId);
      } else if (role === 'observer') {
        await projectsApi.removeObserver(projectId, userId);
      } else if (role === 'engineer') {
        await projectsApi.removeEngineer(projectId, userId);
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to remove user:', error);
      alert('Не удалось удалить пользователя');
    } finally {
      setRemovingUserId(null);
    }
  };

  const getUserFullName = (user: User) => {
    const parts = [user.lastName, user.firstName, user.middleName].filter(Boolean);
    return parts.join(' ');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Команда проекта</CardTitle>
          <CardDescription>Участники проекта по ролям</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="managers" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="managers">
                Менеджеры
                <Badge variant="secondary" className="ml-2">
                  {managers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="observers">
                Наблюдатели
                <Badge variant="secondary" className="ml-2">
                  {observers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="engineers">
                Инженеры
                <Badge variant="secondary" className="ml-2">
                  {engineers.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="managers" className="space-y-4">
              <div className="space-y-2">
                {managers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Нет назначенных менеджеров
                  </p>
                ) : (
                  managers.map((manager) => (
                    <div
                      key={manager.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{getUserFullName(manager)}</p>
                        <p className="text-sm text-muted-foreground">{manager.email}</p>
                      </div>
                      {isManager && (
                        <Button
                          variant="outline"
                          onClick={() => handleRemoveUser(manager.id, 'manager')}
                          disabled={removingUserId === manager.id}
                          className="h-8 px-3 text-sm"
                        >
                          {removingUserId === manager.id ? 'Удаление...' : 'Удалить'}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
              {isManager && (
                <Button onClick={() => handleOpenAssignDialog('manager')} className="w-full">
                  Добавить менеджера
                </Button>
              )}
            </TabsContent>

            <TabsContent value="observers" className="space-y-4">
              <div className="space-y-2">
                {observers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Нет назначенных наблюдателей
                  </p>
                ) : (
                  observers.map((observer) => (
                    <div
                      key={observer.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{getUserFullName(observer)}</p>
                        <p className="text-sm text-muted-foreground">{observer.email}</p>
                      </div>
                      {isManager && (
                        <Button
                          variant="outline"
                          onClick={() => handleRemoveUser(observer.id, 'observer')}
                          disabled={removingUserId === observer.id}
                          className="h-8 px-3 text-sm"
                        >
                          {removingUserId === observer.id ? 'Удаление...' : 'Удалить'}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
              {isManager && (
                <Button onClick={() => handleOpenAssignDialog('observer')} className="w-full">
                  Добавить наблюдателя
                </Button>
              )}
            </TabsContent>

            <TabsContent value="engineers" className="space-y-4">
              <div className="space-y-2">
                {engineers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Нет назначенных инженеров
                  </p>
                ) : (
                  engineers.map((engineer) => (
                    <div
                      key={engineer.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{getUserFullName(engineer)}</p>
                        <p className="text-sm text-muted-foreground">{engineer.email}</p>
                      </div>
                      {isManager && (
                        <Button
                          variant="outline"
                          onClick={() => handleRemoveUser(engineer.id, 'engineer')}
                          disabled={removingUserId === engineer.id}
                          className="h-8 px-3 text-sm"
                        >
                          {removingUserId === engineer.id ? 'Удаление...' : 'Удалить'}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
              {isManager && (
                <Button onClick={() => handleOpenAssignDialog('engineer')} className="w-full">
                  Добавить инженера
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AssignUserDialog
        projectId={projectId}
        role={assignRole}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onSuccess={onUpdate}
      />
    </>
  );
}
