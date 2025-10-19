import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DefectStatusBadge } from './defect-status-badge';
import { DefectPriorityBadge } from './defect-priority-badge';
import type { Defect } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';

interface DefectCardProps {
  defect: Defect;
}

export function DefectCard({ defect }: DefectCardProps) {
  const isOverdue = defect.plannedDate && new Date(defect.plannedDate) < new Date()
    && defect.status !== 'closed' && defect.status !== 'cancelled';

  return (
    <Link href={`/dashboard/defects/${defect.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg">#{defect.id} {defect.title}</CardTitle>
              <CardDescription className="mt-1">
                {defect.project?.name} / {defect.buildingObject?.name} / {defect.stage?.name}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <DefectStatusBadge status={defect.status} />
              <DefectPriorityBadge priority={defect.priority} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Автор:</span>
              <span>{defect.author?.lastName} {defect.author?.firstName}</span>
            </div>
            {defect.assignee && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Исполнитель:</span>
                <span>{defect.assignee.lastName} {defect.assignee.firstName}</span>
              </div>
            )}
            {defect.plannedDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Плановая дата:</span>
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {new Date(defect.plannedDate).toLocaleDateString('ru-RU')}
                  {isOverdue && ' (просрочено)'}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Создано:</span>
              <span>
                {formatDistanceToNow(new Date(defect.createdAt), { addSuffix: true, locale: ru })}
              </span>
            </div>
            {defect._count && (
              <div className="flex gap-4 pt-2 border-t">
                <span className="text-muted-foreground">
                  Комментариев: {defect._count.comments}
                </span>
                <span className="text-muted-foreground">
                  Вложений: {defect._count.attachments}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
