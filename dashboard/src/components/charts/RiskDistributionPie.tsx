import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { riskDistributionData } from '../../data/dummyData';

export function RiskDistributionPie() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={riskDistributionData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {riskDistributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
