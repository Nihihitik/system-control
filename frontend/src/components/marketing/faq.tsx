export function FAQ() {
  return (
    <section id="faq" className="border-b">
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Частые вопросы</h2>
          <p className="mt-4 text-muted-foreground">Ответы на популярные вопросы</p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl space-y-1">
          {[{
            q: "Это действительно бесплатно?",
            a: "Регистрация и базовый тариф — бесплатно. Платные функции — по запросу.",
          },{
            q: "Есть ли роли и права доступа?",
            a: "Да, доступны роли: manager, observer и др., с гибкой настройкой.",
          },{
            q: "Можно ли импортировать данные?",
            a: "Да, поддерживаем импорт через CSV/JSON и API.",
          }].map((item) => (
            <details key={item.q} className="group border-b py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between font-medium">
                {item.q}
                <span className="ml-4 text-muted-foreground group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
