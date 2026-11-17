import { useState, useMemo } from 'react';
import { ShieldAlert, ShieldCheck, ArrowUpDown, Flame } from 'lucide-react';

export default function TopSuspiciousTable({ rows = [] }) {
  const [sortField, setSortField] = useState('probability');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedRows = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    return [...rows].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField.startsWith('feat_')) {
        const featName = sortField.replace('feat_', '');
        aVal = a.features?.[featName] ?? 0;
        bVal = b.features?.[featName] ?? 0;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [rows, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (!rows || rows.length === 0) return null;

  return (
    <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Top {rows.length} Flux Suspects (Plus Hauts Scores)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Cliquez sur une colonne pour trier
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-black/60 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
              <th
                onClick={() => toggleSort('row_index')}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center space-x-1">
                  <span># Ligne</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                </div>
              </th>
              <th className="py-3 px-4">Verdict</th>
              <th
                onClick={() => toggleSort('probability')}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Score du modèle (non calibré)</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('feat_Flow Duration')}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Flow Duration (µs)</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                </div>
              </th>
              <th className="py-3 px-4">Fwd / Bwd Pkts</th>
              <th
                onClick={() => toggleSort('feat_Flow Packets/s')}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Flow Pkts/s</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                </div>
              </th>
              <th className="py-3 px-4">ACK Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {sortedRows.map((r) => {
              const scorePct = (r.probability * 100).toFixed(1);
              const feats = r.features || {};
              const isAttack = r.is_ddos;

              return (
                <tr key={r.row_index} className="hover:bg-zinc-900/40 text-zinc-300 transition">
                  <td className="py-3 px-4 text-zinc-500 font-semibold">#{r.row_index}</td>
                  <td className="py-3 px-4 font-sans">
                    {isAttack ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        DDoS
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            r.probability > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${scorePct}%` }}
                        />
                      </div>
                      <span className="font-bold text-white">{scorePct}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {feats['Flow Duration'] != null
                      ? Number(feats['Flow Duration']).toLocaleString()
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-zinc-400">
                    {feats['Total Fwd Packets'] ?? '-'} / {feats['Total Backward Packets'] ?? '-'}
                  </td>
                  <td className="py-3 px-4 text-blue-400">
                    {feats['Flow Packets/s'] != null
                      ? Number(feats['Flow Packets/s']).toFixed(2)
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-zinc-400">
                    {feats['ACK Flag Count'] ?? '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
