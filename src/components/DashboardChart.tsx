import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';

interface ChartData {
  month: string;
  revenue: number;
  products: number;
  meetings: number;
}

interface DashboardChartProps {
  data: ChartData[];
  title: string;
  type: 'revenue' | 'products' | 'meetings' | 'overview';
  height?: number;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ 
  data, 
  title, 
  type, 
  height = 240 
}) => {
  const getChartColor = () => {
    switch (type) {
      case 'revenue':
        return { stroke: '#10b981', fill: '#10b981', area: '#10b981' };
      case 'products':
        return { stroke: '#3b82f6', fill: '#3b82f6', area: '#3b82f6' };
      case 'meetings':
        return { stroke: '#8b5cf6', fill: '#8b5cf6', area: '#8b5cf6' };
      default:
        return { stroke: '#06b6d4', fill: '#06b6d4', area: '#06b6d4' };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-5 w-5" />;
      case 'products':
        return <Package className="h-5 w-5" />;
      case 'meetings':
        return <Calendar className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const formatValue = (value: number, dataKey: string) => {
    if (dataKey === 'revenue') {
      return `$${value.toLocaleString()}`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {entry.name}: <span className="font-medium">{formatValue(entry.value, entry.dataKey)}</span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const colors = getChartColor();

  return (
    <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/30 dark:border-dark-700/50 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-${colors.stroke} to-${colors.stroke}20 text-white`}>
            {getIcon()}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>+12% this month</span>
        </div>
      </div>

      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'overview' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.area} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors.area} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={window.innerWidth < 640 ? 10 : 12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={window.innerWidth < 640 ? 10 : 12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => type === 'revenue' ? `$${value}` : value.toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={type === 'overview' ? 'revenue' : type}
                stroke={colors.stroke}
                strokeWidth={3}
                fill={`url(#gradient-${type})`}
                dot={{ fill: colors.stroke, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors.stroke, strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={window.innerWidth < 640 ? 10 : 12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={window.innerWidth < 640 ? 10 : 12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => type === 'revenue' ? `$${value}` : value.toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={type}
                stroke={colors.stroke}
                strokeWidth={3}
                dot={{ fill: colors.stroke, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors.stroke, strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div 
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" 
              style={{ backgroundColor: colors.stroke }}
            />
            <span className="text-gray-600 dark:text-gray-300 capitalize">{type}</span>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardChart;