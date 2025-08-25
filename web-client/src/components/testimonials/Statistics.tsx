import React, { useState, useEffect } from 'react';

interface Statistic {
  id: string;
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'stable';
}

const Statistics = () => {
  const [stats, setStats] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an analytics/metrics API
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // For now, we'll use static data but in a real implementation
        // this would come from real analytics data
        const analyticsData: Statistic[] = [
          { 
            id: '1',
            value: '50K+', 
            label: 'Travelers Served',
            trend: 'up'
          },
          { 
            id: '2',
            value: '100+', 
            label: 'Destinations',
            trend: 'up'
          },
          { 
            id: '3',
            value: '4.9', 
            label: 'Average Rating',
            trend: 'stable'
          }
        ];
        
        setStats(analyticsData);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        // Fallback to empty array
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="h-12 bg-gray-300 rounded mb-2 mx-auto w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
      {stats.map((stat) => (
        <div key={stat.id} className="text-center">
          <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
            {stat.value}
          </div>
          <p className="text-gray-400 mt-2">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default Statistics;