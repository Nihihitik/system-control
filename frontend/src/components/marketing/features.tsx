import { CheckCircle2, BarChart3, Shield, Workflow } from "lucide-react";

const FEATURES = [
  {
    icon: CheckCircle2,
    title: "Управление задачами",
    desc: "Создание, назначение и отслеживание задач с KPI и дедлайнами.",
  },
  {
    icon: BarChart3,
    title: "Аналитика и отчёты",
    desc: "Наглядные дашборды, отчёты по командам и проектам.",
  },
  { icon: Shield, title: "Роли и доступы", desc: "Гранулярные права — менеджер, наблюдатель и др." },
  { icon: Workflow, title: "Процессы и дефекты", desc: "Стабильный пайплайн качества и контроль дефектов." },
] as const;

export function Features() {
  return (
    <section id="features" className="border-b">
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Всё необходимое для команды</h2>
          <p className="mt-4 text-muted-foreground">
            Инструменты для эффективной работы над проектами
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border bg-muted/50">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
