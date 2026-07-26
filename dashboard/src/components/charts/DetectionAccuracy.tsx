import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { detectionAccuracy } from '../../data/dummyData';
import { AnimatedCounter } from '../ui/AnimatedCounter';

export function DetectionAccuracy() {
  const data = [
    { name: 'Accurate', value: detectionAccuracy.overall },
    { name: 'Inaccurate', value: 100 - detectionAccuracy.overall },
  ];

  return (
    <div className="h-72 w-full flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={100}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="#00ffd5" />
            <Cell fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] text-center">
        <div className="text-4xl font-bold font-mono text-cyan-400">
          <AnimatedCounter value={detectionAccuracy.overall} format={(v) => v.toFixed(1)} />%
        </div>
        <div className="text-sm text-slate-400 mt-1">Overall Accuracy</div>
      </div>
      
      <div className="w-full flex justify-between px-8 absolute bottom-4 text-xs text-slate-500">
        <div>Phishing: <span className="text-slate-300">{detectionAccuracy.phishing}%</span></div>
        <div>Malware: <span className="text-slate-300">{detectionAccuracy.malware}%</span></div>
      </div>
    </div>
  );
}
