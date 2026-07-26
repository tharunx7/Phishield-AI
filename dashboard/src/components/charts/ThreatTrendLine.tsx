import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { threatTrendData } from '../../data/dummyData';

export function ThreatTrendLine() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={threatTrendData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
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
            tickFormatter={(value) => {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
              return value;
            }}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
            formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '10px' }}
            formatter={(value) => <span className="text-slate-300 text-sm capitalize">{value}</span>}
          />
          <Line 
            type="monotone" 
            dataKey="phishing" 
            name="Phishing Attacks"
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#ef4444', stroke: '#0f172a' }}
          />
          <Line 
            type="monotone" 
            dataKey="malware" 
            name="Malware"
            stroke="#a855f7" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#a855f7', stroke: '#0f172a' }}
          />
          <Line 
            type="monotone" 
            dataKey="scam" 
            name="Scam/Fraud"
            stroke="#eab308" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#eab308', stroke: '#0f172a' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
