'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          System Control
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName} ({user.role})
              </span>
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
