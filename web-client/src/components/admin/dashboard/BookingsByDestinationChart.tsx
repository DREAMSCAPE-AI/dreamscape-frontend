import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DestinationBooking } from '@/types/admin';

interface BookingsByDestinationChartProps {
  data: DestinationBooking[];
  isLoading?: boolean;
}

const BookingsByDestinationChart = ({ data, isLoading }: BookingsByDestinationChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-72 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
        <div className="h-full bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Top destinations</h3>
      <div className="h-56" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis
              type="category"
              dataKey="destination"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              width={70}
            />
            <Tooltip
              formatter={(value) => [`${value} reservations`, 'Reservations']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BookingsByDestinationChart;
