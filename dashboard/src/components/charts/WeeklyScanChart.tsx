import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { weeklyScanData } from '../../data/dummyData';

export function WeeklyScanChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={weeklyScanData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="day" 
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
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Bar dataKey="scans" name="Total Scans" fill="#00d4ff" radius={[4, 4, 0, 0]} />
          <Bar dataKey="threats" name="Threats Blocked" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
