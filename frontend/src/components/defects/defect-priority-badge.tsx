import { Badge } from '@/components/ui/badge';
import type { DefectPriority } from '@/types';

const priorityConfig: Record<DefectPriority, { label: string; className: string }> = {
  critical: { label: 'Критический', className: 'bg-red-600 hover:bg-red-700 text-white' },
  high: { label: 'Высокий', className: 'bg-orange-500 hover:bg-orange-600 text-white' },
  medium: { label: 'Средний', className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  low: { label: 'Низкий', className: 'bg-gray-400 hover:bg-gray-500 text-white' },
};

interface DefectPriorityBadgeProps {
  priority: DefectPriority;
}

export function DefectPriorityBadge({ priority }: DefectPriorityBadgeProps) {
  const config = priorityConfig[priority];

  return <Badge className={config.className}>{config.label}</Badge>;
}
