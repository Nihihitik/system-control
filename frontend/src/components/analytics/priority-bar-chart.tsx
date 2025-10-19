'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { DefectPriority } from '@/types';

interface PriorityBarChartProps {
  data: Record<DefectPriority, number>;
}

const PRIORITY_LABELS: Record<DefectPriority, string> = {
  critical: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

const PRIORITY_COLORS: Record<DefectPriority, string> = {
  critical: 'hsl(0 84.2% 60.2%)', // red
  high: 'hsl(24.6 95% 53.1%)', // orange
  medium: 'hsl(47.9 95.8% 53.1%)', // yellow
  low: 'hsl(142.1 76.2% 36.3%)', // green
};

const chartConfig = {
  count: {
    label: 'Количество',
  },
  critical: {
    label: PRIORITY_LABELS.critical,
    color: PRIORITY_COLORS.critical,
  },
  high: {
    label: PRIORITY_LABELS.high,
    color: PRIORITY_COLORS.high,
  },
  medium: {
    label: PRIORITY_LABELS.medium,
    color: PRIORITY_COLORS.medium,
  },
  low: {
    label: PRIORITY_LABELS.low,
    color: PRIORITY_COLORS.low,
  },
};

export function PriorityBarChart({ data }: PriorityBarChartProps) {
  const chartData = Object.entries(data)
    .map(([priority, count]) => ({
      priority: PRIORITY_LABELS[priority as DefectPriority],
      count,
      fill: PRIORITY_COLORS[priority as DefectPriority],
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Распределение по приоритетам</CardTitle>
        <CardDescription>
          Количество дефектов по уровню приоритета
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="priority"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="priority"
                  nameKey="priority"
                />
              }
            />
            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
