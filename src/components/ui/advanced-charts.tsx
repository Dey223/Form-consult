"use client"

import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

// Couleurs avancées pour les nouveaux graphiques
const ADVANCED_COLORS = {
  gradient1: '#6366f1',      // indigo-500
  gradient2: '#a855f7',      // purple-500
  gradient3: '#ec4899',      // pink-500
  success: '#22c55e',        // green-500
  warning: '#eab308',        // yellow-500
  danger: '#f97316',         // orange-500
}

const DONUT_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#eab308', '#f97316']

interface ChartWrapperProps {
  children: React.ReactElement
  title: string
  description?: string
  className?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function AdvancedChartWrapper({ children, title, description, className, trend }: ChartWrapperProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
              trend.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {trend.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface MixedRevenueChartProps {
  data: Array<{ 
    month: string
    revenue: number
    target: number
    growth: number
  }>
}

export function MixedRevenueChart({ data }: MixedRevenueChartProps) {
  const currentMonth = data[data.length - 1]
  const previousMonth = data[data.length - 2]
  const trend = currentMonth && previousMonth ? {
    value: Math.round(((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100),
    isPositive: currentMonth.revenue > previousMonth.revenue
  } : undefined

  return (
    <AdvancedChartWrapper 
      title="Performance vs Objectifs" 
      description="Revenus réels comparés aux objectifs mensuels"
      trend={trend}
    >
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={ADVANCED_COLORS.gradient1} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={ADVANCED_COLORS.gradient1} stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="month" 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k MAD` : `${value} MAD`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            `${value.toLocaleString()} MAD`,
            name === 'revenue' ? 'Revenus' : name === 'target' ? 'Objectif' : 'Croissance'
          ]}
        />
        <Legend />
        <Bar 
          dataKey="target" 
          fill="#e2e8f0" 
          name="Objectif"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="revenue" 
          fill="url(#revenueGradient)" 
          name="Revenus"
          radius={[4, 4, 0, 0]}
        />
        <Line 
          type="monotone" 
          dataKey="growth" 
          stroke={ADVANCED_COLORS.success}
          strokeWidth={3}
          dot={{ fill: ADVANCED_COLORS.success, strokeWidth: 2, r: 6 }}
          name="Croissance %"
        />
      </ComposedChart>
    </AdvancedChartWrapper>
  )
}

interface RadialPerformanceChartProps {
  data: Array<{ 
    name: string
    value: number
    target: number
    fill: string
  }>
}

export function RadialPerformanceChart({ data }: RadialPerformanceChartProps) {
  const maxValue = Math.max(...data.map(d => d.target))
  
  return (
    <AdvancedChartWrapper 
      title="Performance Radiale" 
      description="Vue d'ensemble des métriques clés"
    >
      <RadialBarChart 
        cx="50%" 
        cy="50%" 
        innerRadius="20%" 
        outerRadius="80%" 
        data={data}
        startAngle={90}
        endAngle={450}
      >
        <RadialBar
          dataKey="value"
          cornerRadius={10}
          fill="#6366f1"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value}%`,
            props.payload.name
          ]}
        />
        <Legend 
          iconSize={12}
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value, entry) => `${value}: ${entry.payload?.value}%`}
        />
      </RadialBarChart>
    </AdvancedChartWrapper>
  )
}

interface DonutChartProps {
  data: Array<{ 
    name: string
    value: number
    amount: number
  }>
  centerText?: string
  centerValue?: string
}

export function DonutChart({ data, centerText = "Total", centerValue }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  
  return (
    <AdvancedChartWrapper 
      title="Répartition financière" 
      description="Distribution des revenus par catégorie"
    >
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          innerRadius={60}
          fill="#8884d8"
          dataKey="amount"
          stroke="white"
          strokeWidth={3}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={DONUT_COLORS[index % DONUT_COLORS.length]} 
            />
          ))}
        </Pie>
        
        {/* Texte central */}
        <text 
          x="50%" 
          y="50%" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fontSize="14" 
          fill="#64748b"
          fontWeight="500"
        >
          {centerText}
        </text>
        <text 
          x="50%" 
          y="50%" 
          dy="20" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fontSize="24" 
          fill="#1e293b"
          fontWeight="bold"
        >
          {centerValue || `${total.toLocaleString()} MAD`}
        </text>
        
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [`${value.toLocaleString()} MAD`, 'Montant']}
        />
      </PieChart>
    </AdvancedChartWrapper>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export function MetricCard({ title, value, change, icon, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={`flex items-center mt-2 text-sm font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {change.isPositive ? '+' : ''}{change.value}% vs mois dernier
              </div>
            )}
          </div>
          {icon && (
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 