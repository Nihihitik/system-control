'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { AnalyticsTrendsDataPoint } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TrendsChartProps {
  data: AnalyticsTrendsDataPoint[];
}

const chartConfig = {
  created: {
    label: 'Создано',
    color: 'hsl(var(--chart-1))',
  },
  closed: {
    label: 'Закрыто',
    color: 'hsl(var(--chart-2))',
  },
};

export function TrendsChart({ data }: TrendsChartProps) {
  const formattedData = data.map((point) => ({
    ...point,
    dateFormatted: format(new Date(point.date), 'd MMM', { locale: ru }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика дефектов</CardTitle>
        <CardDescription>
          Количество созданных и закрытых дефектов за последние 30 дней
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="dateFormatted"
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
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="created"
              stroke="var(--color-created)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="closed"
              stroke="var(--color-closed)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
