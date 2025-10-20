import type { DefectStatus, DefectPriority } from "@/types";

export const statusTranslations: Record<DefectStatus, string> = {
  new: "Новый",
  in_progress: "В работе",
  under_review: "На проверке",
  closed: "Закрыт",
  cancelled: "Отменен",
};

export const priorityTranslations: Record<DefectPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  critical: "Критический",
};

export function getStatusLabel(status: DefectStatus): string {
  return statusTranslations[status] || status;
}

export function getPriorityLabel(priority: DefectPriority): string {
  return priorityTranslations[priority] || priority;
}
