'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { DefectStatus } from '@/types';

interface StatusPieChartProps {
  data: Record<DefectStatus, number>;
}

const STATUS_LABELS: Record<DefectStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  under_review: 'На проверке',
  closed: 'Закрыта',
  cancelled: 'Отменена',
};

const STATUS_COLORS: Record<DefectStatus, string> = {
  new: 'hsl(221.2 83.2% 53.3%)', // blue
  in_progress: 'hsl(47.9 95.8% 53.1%)', // yellow
  under_review: 'hsl(24.6 95% 53.1%)', // orange
  closed: 'hsl(142.1 76.2% 36.3%)', // green
  cancelled: 'hsl(215.4 16.3% 46.9%)', // gray
};

const chartConfig = {
  defects: {
    label: 'Дефекты',
  },
  new: {
    label: STATUS_LABELS.new,
    color: STATUS_COLORS.new,
  },
  in_progress: {
    label: STATUS_LABELS.in_progress,
    color: STATUS_COLORS.in_progress,
  },
  under_review: {
    label: STATUS_LABELS.under_review,
    color: STATUS_COLORS.under_review,
  },
  closed: {
    label: STATUS_LABELS.closed,
    color: STATUS_COLORS.closed,
  },
  cancelled: {
    label: STATUS_LABELS.cancelled,
    color: STATUS_COLORS.cancelled,
  },
};

export function StatusPieChart({ data }: StatusPieChartProps) {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([status, value]) => ({
      status,
      value,
      name: STATUS_LABELS[status as DefectStatus],
      fill: STATUS_COLORS[status as DefectStatus],
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Распределение по статусам</CardTitle>
        <CardDescription>
          Всего дефектов: {total}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  hideLabel
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
