import React from 'react'
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Bar,
  Pie,
  Area,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS } from '../../lib/constants'
import { cn } from '../../lib/utils'

type ChartType = 'line' | 'bar' | 'pie' | 'area'

interface ChartProps {
  type: ChartType
  data: Record<string, unknown>[]
  dataKeys: string[]
  xAxisKey?: string
  height?: number
  className?: string
  colors?: string[]
}

export function Chart({
  type,
  data,
  dataKeys,
  xAxisKey = 'name',
  height = 300,
  className,
  colors = [...CHART_COLORS],
}: ChartProps) {
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--color-surface, #fff)',
      border: '1px solid var(--color-border, #e5e7eb)',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
    },
  }

  function renderLineChart() {
    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip {...tooltipStyle} />
        <Legend />
        {dataKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    )
  }

  function renderBarChart() {
    return (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip {...tooltipStyle} />
        <Legend />
        {dataKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[i % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    )
  }

  function renderPieChart() {
    return (
      <PieChart>
        <Tooltip {...tooltipStyle} />
        <Legend />
        <Pie
          data={data}
          dataKey={dataKeys[0]}
          nameKey={xAxisKey}
          cx="50%"
          cy="50%"
          outerRadius={height / 3}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    )
  }

  function renderAreaChart() {
    return (
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip {...tooltipStyle} />
        <Legend />
        {dataKeys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    )
  }

  const chartRenderers: Record<ChartType, () => React.JSX.Element> = {
    line: renderLineChart,
    bar: renderBarChart,
    pie: renderPieChart,
    area: renderAreaChart,
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        {chartRenderers[type]()}
      </ResponsiveContainer>
    </div>
  )
}
