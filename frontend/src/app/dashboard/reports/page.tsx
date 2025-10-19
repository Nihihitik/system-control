'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  const handleDownloadCSV = () => {
    reportsApi.downloadCSV();
  };

  const handleDownloadExcel = () => {
    reportsApi.downloadExcel();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Отчеты</h1>
          <p className="text-muted-foreground mt-2">
            Экспорт данных о дефектах в различных форматах
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Экспорт в CSV</CardTitle>
              </div>
              <CardDescription>
                Простой текстовый формат для импорта в Excel, Google Sheets и другие приложения
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>CSV файл будет содержать:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Все дефекты по вашим проектам</li>
                    <li>Информация о статусе и приоритете</li>
                    <li>Данные об авторе и исполнителе</li>
                    <li>Даты создания и плановые сроки</li>
                  </ul>
                </div>
                <Button onClick={handleDownloadCSV} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Скачать CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Экспорт в Excel</CardTitle>
              </div>
              <CardDescription>
                Форматированный Excel файл с автофильтрами и стилизацией
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Excel файл будет содержать:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Все дефекты по вашим проектам</li>
                    <li>Форматированные заголовки</li>
                    <li>Автоматические фильтры</li>
                    <li>Оптимизированная ширина столбцов</li>
                  </ul>
                </div>
                <Button onClick={handleDownloadExcel} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Скачать Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Фильтры экспорта</CardTitle>
            <CardDescription>
              В будущем здесь можно будет настроить фильтры для экспорта данных
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Функционал фильтрации будет добавлен в следующих версиях.
              Сейчас экспортируются все дефекты по вашим проектам.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
