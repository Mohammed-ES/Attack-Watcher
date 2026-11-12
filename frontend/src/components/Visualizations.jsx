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

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c0c0e] border border-[#1a1a1e] p-3 rounded-xl shadow-2xl text-xs">
        <p className="font-semibold text-white">{payload[0].name}</p>
        <p className="text-neutral-400 mt-1">
          Volume : <span className="font-mono font-bold text-[#2563eb]">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c0c0e] border border-[#1a1a1e] p-3 rounded-xl shadow-2xl text-xs">
        <p className="font-semibold text-white">{payload[0].payload.tier}</p>
        <p className="text-neutral-400 mt-1">
          Flux : <span className="font-mono font-bold text-[#2563eb]">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

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
    { tier: 'Modéré (20-50%)', count: 0, fill: '#2563eb' },
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Répartition Normal vs Attaque */}
      <div className="bg-[#0c0c0e] border border-[#1a1a1e] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#1a1a1e]">
          <PieIcon className="w-4 h-4 text-[#2563eb]" />
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

        <div className="flex items-center justify-center space-x-6 text-xs text-neutral-400 pt-2 border-t border-[#1a1a1e]">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Normal ({summary.total_normal.toLocaleString()})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>DDoS ({summary.total_attacks.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* Distribution par Niveau de Risque */}
      <div className="bg-[#0c0c0e] border border-[#1a1a1e] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#1a1a1e]">
          <BarChart3 className="w-4 h-4 text-[#2563eb]" />
          <h3 className="text-sm font-semibold text-white tracking-tight">Niveaux de Risque (Confiance Modèle)</h3>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskTiers} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="tier" tick={{ fill: '#737373', fontSize: 10 }} />
              <YAxis tick={{ fill: '#737373', fontSize: 10 }} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {riskTiers.map((entry, index) => (
                  <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-[#1a1a1e]">
          Distribution probabiliste de l'ensemble des flux classifiés
        </div>
      </div>
    </div>
  );
}
