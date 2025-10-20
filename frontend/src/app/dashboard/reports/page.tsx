'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { projectsApi, reportsApi, usersApi } from '@/lib/api';
import type { ExportFiltersParams, DefectPriority, DefectStatus, Project, User } from '@/types';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Basic guards
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && user.role !== 'manager' && user.role !== 'observer') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Local state for custom export
  const [filters, setFilters] = useState<ExportFiltersParams>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [engineers, setEngineers] = useState<Pick<User, 'id' | 'firstName' | 'lastName' | 'middleName' | 'email'>[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingEngineers, setLoadingEngineers] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProjects(true);
        setLoadingEngineers(true);
        const [p, e] = await Promise.all([projectsApi.getMyProjects(), usersApi.getEngineers()]);
        setProjects(p);
        setEngineers(e);
      } catch (e) {
        console.error('Failed to load filter data', e);
      } finally {
        setLoadingProjects(false);
        setLoadingEngineers(false);
      }
    };
    if (!loading) load();
  }, [loading]);

  const isObserver = user?.role === 'observer';

  const setPeriod = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    setFilters((f) => ({ ...f, dateFrom: fmt(from), dateTo: fmt(to) }));
  };

  const downloadExcelWith = (preset?: ExportFiltersParams) => {
    reportsApi.downloadExcel({ ...filters, ...(preset || {}) });
  };
  const downloadCsvWith = (preset?: ExportFiltersParams) => {
    reportsApi.downloadCSV({ ...filters, ...(preset || {}) });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'manager' && user.role !== 'observer')) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Отчеты</h1>
            <p className="text-muted-foreground mt-2">Быстрый экспорт данных для менеджеров</p>
          </div>
          {isObserver && (
            <Badge variant="secondary" className="text-sm">Только просмотр</Badge>
          )}
        </div>

        {/* Quick presets for managers */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Сводка за 7 дней</CardTitle>
              </div>
              <CardDescription>Все дефекты, созданные за последние 7 дней</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => downloadExcelWith(periodPreset(7))}>
                  <Download className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => downloadCsvWith(periodPreset(7))}>
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Закрытые за месяц</CardTitle>
              </div>
              <CardDescription>Статус: Закрыта за последние 30 дней</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => downloadExcelWith({ ...periodPreset(30), status: 'closed' })}>
                  <Download className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => downloadCsvWith({ ...periodPreset(30), status: 'closed' })}>
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Критические в работе</CardTitle>
              </div>
              <CardDescription>Приоритет: Критический, Статус: В работе</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => downloadExcelWith({ priority: 'critical', status: 'in_progress' })}>
                  <Download className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => downloadCsvWith({ priority: 'critical', status: 'in_progress' })}>
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom export */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Произвольный экспорт</CardTitle>
            <CardDescription>Выберите критерии и скачайте файл</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Проект</Label>
                <Select
                  value={filters.projectId?.toString() || 'all'}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, projectId: v === 'all' ? undefined : Number(v) }))
                  }
                  disabled={loadingProjects}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Все проекты" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все проекты</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Исполнитель</Label>
                <Select
                  value={filters.assigneeId?.toString() || 'all'}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, assigneeId: v === 'all' ? undefined : Number(v) }))
                  }
                  disabled={loadingEngineers}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Все исполнители" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все исполнители</SelectItem>
                    {engineers.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.lastName} {u.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Статус</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(v) => setFilters((f) => ({ ...f, status: v === 'all' ? undefined : (v as DefectStatus) }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Любой" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Любой</SelectItem>
                    <SelectItem value="new">Новая</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="under_review">На проверке</SelectItem>
                    <SelectItem value="closed">Закрыта</SelectItem>
                    <SelectItem value="cancelled">Отменена</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Приоритет</Label>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(v) => setFilters((f) => ({ ...f, priority: v === 'all' ? undefined : (v as DefectPriority) }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Любой" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Любой</SelectItem>
                    <SelectItem value="critical">Критический</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="low">Низкий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Период с</Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Период по</Label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Быстрый период:</span>
              <Button variant="outline" className="h-8" onClick={() => setPeriod(7)}>7 дней</Button>
              <Button variant="outline" className="h-8" onClick={() => setPeriod(30)}>30 дней</Button>
              <Button variant="ghost" className="h-8 ml-auto" onClick={() => setFilters({})}>Сбросить</Button>
            </div>

            <div className="mt-6 flex gap-2">
              <Button className="flex-1" onClick={() => downloadExcelWith()}>
                <Download className="mr-2 h-4 w-4" /> Скачать Excel
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => downloadCsvWith()}>
                <Download className="mr-2 h-4 w-4" /> Скачать CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Helpers
function periodPreset(days: number): ExportFiltersParams {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { dateFrom: fmt(from), dateTo: fmt(to) };
}
