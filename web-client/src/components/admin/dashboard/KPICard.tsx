interface KPICardProps {
  title: string;
  value: string;
  evolution: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple';
  subtitle?: string;
}

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
};

const KPICard = ({ title, value, evolution, icon, color, subtitle }: KPICardProps) => {
  const colors = COLOR_MAP[color];
  const isPositive = evolution >= 0;

  return (
    <div className={`bg-white rounded-xl border ${colors.border} p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center ${colors.icon}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{evolution.toFixed(1)}%
        </span>
        {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
};

export default KPICard;
