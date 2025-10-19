'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">
            System Control
          </Link>

          {(user?.role === 'manager' || user?.role === 'observer') && (
            <nav className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive('/dashboard')
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                Аналитика
              </Link>
              <Link
                href="/dashboard/projects"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive('/dashboard/projects')
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                Проекты
              </Link>
              <Link
                href="/dashboard/defects"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive('/dashboard/defects')
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                Дефекты
              </Link>
              <Link
                href="/dashboard/reports"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive('/dashboard/reports')
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                Отчеты
              </Link>
            </nav>
          )}
        </div>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {user.firstName} {user.lastName} ({user.role})
              </Link>
              <Button onClick={() => logout()} variant="outline">
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Войти</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Регистрация</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
