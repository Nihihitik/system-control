export function Testimonials() {
  return (
    <section className="border-b bg-muted/30">
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Команды доверяют нам</h2>
          <p className="mt-4 text-muted-foreground">Отзывы пользователей платформы</p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-3">
          {[{
            name: "Анна, PM",
            text: "Видимость по всем процессам в одном месте. Экономим до 6 часов в неделю на отчётах.",
          },{
            name: "Игорь, CTO",
            text: "Наконец-то нормальные роли и доступы. Безопасность и контроль на уровне.",
          },{
            name: "Мария, QA Lead",
            text: "Дефекты перестали теряться. Встроенная аналитика — огонь.",
          }].map((t) => (
            <div key={t.name} className="flex flex-col rounded-lg border bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">“{t.text}”</p>
              <p className="mt-4 text-sm font-medium">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
