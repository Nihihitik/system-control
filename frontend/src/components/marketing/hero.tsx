"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="border-b">
      <div className="container mx-auto px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="text-balance text-center text-5xl font-semibold tracking-tight sm:text-6xl">
            Управляйте проектами эффективно
          </h1>
          <p className="mt-6 text-balance text-center text-lg text-muted-foreground">
            System Control — платформа для контроля задач, дефектов и аналитики команды.
            Роли, права доступа и отчёты в одном месте.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">
                  Перейти в Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild>
                  <Link href="/register">
                    Начать работу
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/login">Войти</Link>
                </Button>
              </>
            )}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Без кредитной карты · Начните за 2 минуты
          </p>
        </motion.div>
      </div>
    </section>
  );
}
