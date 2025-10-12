'use client';

import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
