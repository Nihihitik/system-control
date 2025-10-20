import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} System Control. Все права защищены.
          </p>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/register" className="transition-colors hover:text-foreground">
              Начать
            </Link>
            <Link href="#features" className="transition-colors hover:text-foreground">
              Возможности
            </Link>
            <Link href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
