"use client"

import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Couleurs pour les graphiques (palette moderne)
const CHART_COLORS = {
  primary: '#3b82f6',      // blue-500
  secondary: '#8b5cf6',    // violet-500
  accent: '#06b6d4',       // cyan-500
  success: '#10b981',      // emerald-500
  warning: '#f59e0b',      // amber-500
  danger: '#ef4444',       // red-500
  muted: '#6b7280',        // gray-500
}

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

interface ChartWrapperProps {
  children: React.ReactElement
  title: string
  description?: string
  className?: string
}

export function ChartWrapper({ children, title, description, className }: ChartWrapperProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number; subscriptions: number }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ChartWrapper 
      title="Évolution du chiffre d'affaires" 
      description="Revenus mensuels et nouveaux abonnements"
    >
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
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
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            name === 'revenue' ? `${value.toLocaleString()} MAD` : value,
            name === 'revenue' ? 'Revenus' : 'Abonnements'
          ]}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          fill="url(#revenueGradient)" 
        />
      </AreaChart>
    </ChartWrapper>
  )
}

interface PaymentStatusChartProps {
  data: Array<{ name: string; value: number; color?: string }>
}

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  return (
    <ChartWrapper 
      title="Statut des paiements" 
      description="Répartition des paiements par statut"
    >
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          stroke="white"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [value.toLocaleString(), 'Transactions']}
        />
      </PieChart>
    </ChartWrapper>
  )
}

interface SubscriptionTrendsProps {
  data: Array<{ week: string; new: number; canceled: number; active: number }>
}

export function SubscriptionTrendsChart({ data }: SubscriptionTrendsProps) {
  return (
    <ChartWrapper 
      title="Tendances des abonnements" 
      description="Nouveaux abonnements vs annulations par semaine"
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="week" 
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
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            value,
            name === 'new' ? 'Nouveaux' : name === 'canceled' ? 'Annulés' : 'Actifs'
          ]}
        />
        <Legend />
        <Bar 
          dataKey="new" 
          fill={CHART_COLORS.success} 
          name="Nouveaux"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="canceled" 
          fill={CHART_COLORS.danger} 
          name="Annulés"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartWrapper>
  )
}

interface PlanDistributionProps {
  data: Array<{ plan: string; count: number; revenue: number }>
}

export function PlanDistributionChart({ data }: PlanDistributionProps) {
  return (
    <ChartWrapper 
      title="Répartition par plan" 
      description="Nombre d'abonnements et revenus par plan"
    >
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          type="number"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          type="category"
          dataKey="plan" 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            name === 'revenue' ? `${value.toLocaleString()} MAD` : value,
            name === 'revenue' ? 'Revenus' : 'Abonnements'
          ]}
        />
        <Legend />
        <Bar 
          dataKey="count" 
          fill={CHART_COLORS.primary} 
          name="Abonnements"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartWrapper>
  )
}

interface PaymentMethodsProps {
  data: Array<{ method: string; count: number; percentage: number }>
}

export function PaymentMethodsChart({ data }: PaymentMethodsProps) {
  return (
    <ChartWrapper 
      title="Méthodes de paiement" 
      description="Répartition des méthodes de paiement utilisées"
    >
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="count"
          stroke="white"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={PIE_COLORS[index % PIE_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value} (${props.payload.percentage}%)`,
            'Utilisations'
          ]}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => value}
        />
      </PieChart>
    </ChartWrapper>
  )
} 