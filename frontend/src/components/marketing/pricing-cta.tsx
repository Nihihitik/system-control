import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PricingCTA() {
  return (
    <section id="pricing" className="border-b">
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Готовы начать?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Создайте аккаунт и подключите команду за пару минут
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Начать работу
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Войти</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
