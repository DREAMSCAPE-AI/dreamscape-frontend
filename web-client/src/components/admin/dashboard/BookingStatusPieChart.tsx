import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BookingStatusPieChartProps {
  byStatus: Record<string, number>;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#22c55e',
  PENDING: '#f59e0b',
  CANCELLED: '#ef4444',
  COMPLETED: '#3b82f6',
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirme',
  PENDING: 'En attente',
  CANCELLED: 'Annule',
  COMPLETED: 'Termine',
};

const BookingStatusPieChart = ({ byStatus, isLoading }: BookingStatusPieChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-80 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
        <div className="h-full bg-gray-100 rounded" />
      </div>
    );
  }

  const data = Object.entries(byStatus).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    color: STATUS_COLORS[status] || '#9ca3af',
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Statuts des reservations</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}`, 'Reservations']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BookingStatusPieChart;
