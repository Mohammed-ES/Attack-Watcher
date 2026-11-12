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

const COLORS = ['#10b981', '#f43f5e'];

export default function Visualizations({ summary, rows }) {
  if (!summary || !rows || rows.length === 0) return null;

  // Données du graphique camembert / donut
  const pieData = [
    { name: 'Trafic Normal', value: summary.total_normal },
    { name: 'Attaques DDoS', value: summary.total_attacks },
  ];

  // Regroupement par tranches de risque de probabilité
  const riskTiers = [
    { tier: 'Faible (0-20%)', count: 0, fill: '#10b981' },
    { tier: 'Modéré (20-50%)', count: 0, fill: '#06b6d4' },
    { tier: 'Élevé (50-80%)', count: 0, fill: '#f59e0b' },
    { tier: 'Critique (80-100%)', count: 0, fill: '#f43f5e' },
  ];

  rows.forEach((r) => {
    const p = r.probability;
    if (p < 0.2) riskTiers[0].count++;
    else if (p < 0.5) riskTiers[1].count++;
    else if (p < 0.8) riskTiers[2].count++;
    else riskTiers[3].count++;
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded shadow-xl text-xs">
          <p className="font-semibold text-white">{payload[0].name}</p>
          <p className="text-slate-300 mt-1">
            Volume : <span className="font-mono font-bold text-cyan-400">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Répartition Normal vs Attaque */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur shadow-xl">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-800">
          <PieIcon className="w-4 h-4 text-cyan-400" />
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
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center space-x-6 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Trafic Normal ({summary.total_normal})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span>Attaques DDoS ({summary.total_attacks})</span>
          </div>
        </div>
      </div>

      {/* Distribution par niveau de risque */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur shadow-xl">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-800">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">Distribution par Niveau de Probabilité</h3>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskTiers} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="tier" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded shadow-xl text-xs">
                        <p className="font-semibold text-white">{payload[0].payload.tier}</p>
                        <p className="text-slate-300 mt-1">
                          Flux : <span className="font-mono font-bold text-cyan-400">{payload[0].value.toLocaleString()}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {riskTiers.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

