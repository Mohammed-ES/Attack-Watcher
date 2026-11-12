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
      iconColor: 'text-[#2563eb]',
      borderColor: 'border-[#1a1a1e] hover:border-[#2563eb]/40',
    },
    {
      title: 'Trafic Normal',
      value: total_normal.toLocaleString(),
      subtitle: `${((total_normal / (total_analysed || 1)) * 100).toFixed(1)}% du total`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      borderColor: 'border-[#1a1a1e] hover:border-emerald-500/40',
    },
    {
      title: 'Attaques Détectées',
      value: total_attacks.toLocaleString(),
      subtitle: 'Flux malveillants identifiés',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      borderColor: 'border-[#1a1a1e] hover:border-rose-500/40',
    },
    {
      title: "Taux d'Attaque",
      value: `${attack_percentage.toFixed(1)}%`,
      subtitle: 'Gravité du flux global',
      icon: Activity,
      iconColor: attack_percentage > 20 ? 'text-rose-400' : 'text-amber-400',
      borderColor: 'border-[#1a1a1e] hover:border-[#2563eb]/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-5 rounded-2xl border ${c.borderColor} bg-[#0c0c0e] shadow-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{c.title}</span>
              <div className={`p-2 rounded-xl bg-black border border-[#1a1a1e] ${c.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-white tracking-tight">{c.value}</div>
              <div className="text-xs text-neutral-500 mt-1">{c.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
