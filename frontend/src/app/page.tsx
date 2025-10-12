import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
        <h1 className="mb-6 text-center text-4xl font-bold">
          Добро пожаловать в System Control
        </h1>
        <p className="mb-8 max-w-2xl text-center text-muted-foreground">
          Система управления с авторизацией пользователей и ролями доступа.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/register">Начать работу</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Войти</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
