import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

const PIE_COLORS = ['#10b981', '#f43f5e'];

const HIST_COLORS = [
  '#10b981',
  '#059669',
  '#14b8a6',
  '#0ea5e9',
  '#2563eb',
  '#6366f1',
  '#8b5cf6',
  '#f59e0b',
  '#f97316',
  '#f43f5e',
];

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090b] border border-zinc-800 p-3 rounded-xl shadow-2xl text-xs">
        <p className="font-semibold text-white">{payload[0].name}</p>
        <p className="text-zinc-400 mt-1">
          Volume : <span className="font-mono font-bold text-blue-400">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomHistTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090b] border border-zinc-800 p-3 rounded-xl shadow-2xl text-xs">
        <p className="font-semibold text-white">Tranche : {payload[0].payload.bin}</p>
        <p className="text-zinc-400 mt-1">
          Nombre de flux : <span className="font-mono font-bold text-blue-400">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Visualizations({ summary, rows, scoreHistogram }) {
  if (!summary || !rows || rows.length === 0) return null;

  const normalCount = summary.normal_count ?? summary.total_normal ?? 0;
  const ddosCount = summary.ddos_count ?? summary.total_attacks ?? 0;

  // Données du graphique camembert / donut
  const pieData = [
    { name: 'Trafic Normal', value: normalCount },
    { name: 'Attaques DDoS', value: ddosCount },
  ];

  // Données de l'histogramme des 10 classes de 10%
  const histData =
    scoreHistogram && scoreHistogram.length === 10
      ? scoreHistogram
      : [
          { bin: '0-10%', count: 0 },
          { bin: '10-20%', count: 0 },
          { bin: '20-30%', count: 0 },
          { bin: '30-40%', count: 0 },
          { bin: '40-50%', count: 0 },
          { bin: '50-60%', count: 0 },
          { bin: '60-70%', count: 0 },
          { bin: '70-80%', count: 0 },
          { bin: '80-90%', count: 0 },
          { bin: '90-100%', count: 0 },
        ];

  if (!scoreHistogram || scoreHistogram.length !== 10) {
    rows.forEach((r) => {
      const p = r.probability ?? 0;
      const idx = Math.max(Math.min(Math.floor(p * 10), 9), 0);
      histData[idx].count++;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Répartition Normal vs Attaque */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-zinc-800">
          <PieIcon className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">Répartition Globale du Trafic</h3>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center space-x-6 text-xs text-zinc-400 pt-2 border-t border-zinc-800 font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Normal ({normalCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>DDoS ({ddosCount.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* Histogramme des scores du modèle (non calibré) */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Histogramme des scores du modèle (non calibré)
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">10 classes de 10%</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="bin" tick={{ fill: '#71717a', fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={45} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip content={<CustomHistTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {histData.map((_, index) => (
                  <Cell key={`cell-bar-${index}`} fill={HIST_COLORS[index % HIST_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-800 font-mono">
          Distribution des flux par tranche de score (0% à 100%)
        </div>
      </div>
    </div>
  );
}
