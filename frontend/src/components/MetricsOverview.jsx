import { FileSpreadsheet, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

export default function MetricsOverview({ summary }) {
  if (!summary) return null;

  const { total_analysed, total_attacks, total_normal, attack_percentage } = summary;

  const cards = [
    {
      title: 'Flux Analysés',
      value: total_analysed.toLocaleString(),
      subtitle: 'Lignes réseau traitées',
      icon: FileSpreadsheet,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-950/40',
      borderColor: 'border-cyan-800/60',
    },
    {
      title: 'Trafic Normal',
      value: total_normal.toLocaleString(),
      subtitle: `${((total_normal / (total_analysed || 1)) * 100).toFixed(1)}% du total`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-800/60',
    },
    {
      title: 'Attaques Détectées',
      value: total_attacks.toLocaleString(),
      subtitle: 'Flux malveillants identifiés',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      bgColor: 'bg-rose-950/40',
      borderColor: 'border-rose-800/60',
    },
    {
      title: "Taux d'Attaque",
      value: `${attack_percentage.toFixed(1)}%`,
      subtitle: 'Gravité du flux global',
      icon: Activity,
      iconColor: attack_percentage > 20 ? 'text-rose-400' : 'text-amber-400',
      bgColor: 'bg-slate-900/60',
      borderColor: 'border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-5 rounded-xl border ${c.borderColor} ${c.bgColor} backdrop-blur shadow-lg transition hover:border-slate-700`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{c.title}</span>
              <div className={`p-2 rounded-lg bg-slate-950/60 border border-slate-800 ${c.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-white tracking-tight">{c.value}</div>
              <div className="text-xs text-slate-400 mt-1">{c.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

