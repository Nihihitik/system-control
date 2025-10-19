import { Badge } from '@/components/ui/badge';
import type { DefectStatus } from '@/types';

const statusConfig: Record<DefectStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new: { label: 'Новая', variant: 'secondary' },
  in_progress: { label: 'В работе', variant: 'default' },
  under_review: { label: 'На проверке', variant: 'outline' },
  closed: { label: 'Закрыта', variant: 'outline' },
  cancelled: { label: 'Отменена', variant: 'destructive' },
};

interface DefectStatusBadgeProps {
  status: DefectStatus;
}

export function DefectStatusBadge({ status }: DefectStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
