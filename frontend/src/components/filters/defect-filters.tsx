'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { projectsApi, usersApi } from '@/lib/api';
import type { DefectFilterParams, DefectStatus, DefectPriority, Project, User } from '@/types';
import { X } from 'lucide-react';

interface DefectFiltersProps {
  filters: DefectFilterParams;
  onFiltersChange: (filters: DefectFilterParams) => void;
}

const STATUS_LABELS: Record<DefectStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  under_review: 'На проверке',
  closed: 'Закрыта',
  cancelled: 'Отменена',
};

const PRIORITY_LABELS: Record<DefectPriority, string> = {
  critical: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

export function DefectFilters({ filters, onFiltersChange }: DefectFiltersProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [engineers, setEngineers] = useState<Pick<User, 'id' | 'firstName' | 'lastName' | 'middleName' | 'email'>[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingEngineers, setLoadingEngineers] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<DefectStatus[]>(filters.statuses || []);
  const [selectedPriorities, setSelectedPriorities] = useState<DefectPriority[]>(filters.priorities || []);

  useEffect(() => {
    loadProjects();
    loadEngineers();
  }, []);

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

  const loadEngineers = async () => {
    try {
      setLoadingEngineers(true);
      const data = await usersApi.getEngineers();
      setEngineers(data);
    } catch (error) {
      console.error('Failed to load engineers:', error);
    } finally {
      setLoadingEngineers(false);
    }
  };

  const handleStatusToggle = (status: DefectStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];

    setSelectedStatuses(newStatuses);
    onFiltersChange({
      ...filters,
      statuses: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handlePriorityToggle = (priority: DefectPriority) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter((p) => p !== priority)
      : [...selectedPriorities, priority];

    setSelectedPriorities(newPriorities);
    onFiltersChange({
      ...filters,
      priorities: newPriorities.length > 0 ? newPriorities : undefined,
    });
  };

  const handleProjectChange = (projectId: string) => {
    onFiltersChange({
      ...filters,
      projectId: projectId === 'all' ? undefined : Number(projectId),
    });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    onFiltersChange({
      ...filters,
      assigneeId: assigneeId === 'all' ? undefined : Number(assigneeId),
    });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search: search || undefined,
    });
  };

  const handleReset = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    onFiltersChange({});
  };

  const hasActiveFilters = selectedStatuses.length > 0 ||
    selectedPriorities.length > 0 ||
    filters.projectId ||
    filters.assigneeId ||
    filters.search;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Фильтры</h3>
            {hasActiveFilters && (
              <Button variant="ghost" className="h-8 text-xs" onClick={handleReset}>
                Сбросить все
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Поиск</Label>
              <Input
                placeholder="Поиск по названию..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Проект</Label>
              <Select
                value={filters.projectId?.toString() || 'all'}
                onValueChange={handleProjectChange}
                disabled={loadingProjects}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Все проекты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все проекты</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Исполнитель</Label>
              <Select
                value={filters.assigneeId?.toString() || 'all'}
                onValueChange={handleAssigneeChange}
                disabled={loadingEngineers}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Все исполнители" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все исполнители</SelectItem>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id.toString()}>
                      {engineer.lastName} {engineer.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Статус</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABELS) as DefectStatus[]).map((status) => (
                <Badge
                  key={status}
                  variant={selectedStatuses.includes(status) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleStatusToggle(status)}
                >
                  {STATUS_LABELS[status]}
                  {selectedStatuses.includes(status) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Приоритет</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRIORITY_LABELS) as DefectPriority[]).map((priority) => (
                <Badge
                  key={priority}
                  variant={selectedPriorities.includes(priority) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handlePriorityToggle(priority)}
                >
                  {PRIORITY_LABELS[priority]}
                  {selectedPriorities.includes(priority) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
