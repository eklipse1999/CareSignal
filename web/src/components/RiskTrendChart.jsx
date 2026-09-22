import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

const palette = { diabetes: '#0f766e', heart_disease: '#f97360', symptom_check: '#4169a1' };
const labels = { diabetes: 'Diabetes', heart_disease: 'Heart disease', symptom_check: 'Symptom check' };

export default function RiskTrendChart({ predictions }) {
  const data = [...predictions].reverse().map((prediction, index) => ({
    index: index + 1,
    date: new Date(prediction.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    diabetes: prediction.prediction_type === 'diabetes' ? Number(prediction.risk_probability) : null,
    heart_disease: prediction.prediction_type === 'heart_disease' ? Number(prediction.risk_probability) : null,
    symptom_check: prediction.prediction_type === 'symptom_check' ? Number(prediction.risk_probability) : null
  }));

  return (
    <div className="h-80 w-full">
      <div className="mb-3 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
        {Object.entries(palette).map(([key, color]) => <span key={key} className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />{labels[key]}</span>)}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -18, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => [`${Math.round(value * 100)}%`, 'Risk probability']} contentStyle={{ border: '0', borderRadius: 12, boxShadow: '0 12px 30px rgba(16,42,67,.12)' }} />
          {Object.entries(palette).map(([key, color]) => <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} connectNulls={false} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
