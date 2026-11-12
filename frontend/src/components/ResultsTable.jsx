import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert, Search, Filter } from 'lucide-react';

export default function ResultsTable({ rows }) {
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ATTACK, NORMAL
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtrage et recherche
  const filteredRows = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      // Filtre statut
      if (filterStatus === 'ATTACK' && !r.is_ddos) return false;
      if (filterStatus === 'NORMAL' && r.is_ddos) return false;

      // Recherche par index ou port de destination
      if (searchTerm.trim() !== '') {
        const term = searchTerm.trim().toLowerCase();
        const rowIdx = String(r.row_index);
        const port = String(r.features?.['Destination Port'] || '');
        return rowIdx.includes(term) || port.includes(term);
      }
      return true;
    });
  }, [rows, filterStatus, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(Number(size));
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#0c0c0e] border border-[#1a1a1e] rounded-2xl overflow-hidden shadow-xl">
      {/* Barre d'outils (Filtres, Recherche, Pagination rapide) */}
      <div className="p-4 sm:p-5 border-b border-[#1a1a1e] flex flex-wrap items-center justify-between gap-4">
        {/* Filtres par bouton pill */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-neutral-500 hidden sm:block" />
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
              filterStatus === 'ALL'
                ? 'bg-[#2563eb] text-white'
                : 'bg-black border border-[#1a1a1e] text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            Tous ({rows.length})
          </button>
          <button
            onClick={() => handleFilterChange('ATTACK')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
              filterStatus === 'ATTACK'
                ? 'bg-rose-600 text-white'
                : 'bg-black border border-[#1a1a1e] text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            Attaques ({rows.filter((r) => r.is_ddos).length})
          </button>
          <button
            onClick={() => handleFilterChange('NORMAL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
              filterStatus === 'NORMAL'
                ? 'bg-emerald-600 text-white'
                : 'bg-black border border-[#1a1a1e] text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            Normaux ({rows.filter((r) => !r.is_ddos).length})
          </button>
        </div>

        {/* Barre de recherche & Sélecteur de page */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Rechercher (ligne, port)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-black border border-[#1a1a1e] rounded-full pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-[#2563eb] transition"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="bg-black border border-[#1a1a1e] rounded-full px-3 py-1.5 text-xs text-neutral-400 focus:outline-none focus:border-[#2563eb] transition"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>
      </div>

      {/* Tableau interactif */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-black/60 border-b border-[#1a1a1e] text-neutral-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4"># Ligne</th>
              <th className="py-3 px-4">Verdict</th>
              <th className="py-3 px-4">Probabilité DDoS</th>
              <th className="py-3 px-4">Port Dest.</th>
              <th className="py-3 px-4">Durée Flux (µs)</th>
              <th className="py-3 px-4">Total Fwd Pkts</th>
              <th className="py-3 px-4">Total Bwd Pkts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1e]">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-neutral-500">
                  Aucun flux ne correspond aux critères de recherche.
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => {
                const isAttack = r.is_ddos;
                const proba = (r.probability * 100).toFixed(1);
                const feats = r.features || {};

                return (
                  <tr
                    key={r.row_index}
                    className="hover:bg-white/[0.02] transition"
                  >
                    <td className="py-3 px-4 font-mono text-neutral-400">
                      #{r.row_index}
                    </td>
                    <td className="py-3 px-4">
                      {isAttack ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          DDoS Attack
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          BENIGN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isAttack ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${proba}%` }}
                          />
                        </div>
                        <span className="font-mono text-neutral-300">{proba}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-300">
                      {feats['Destination Port'] ?? '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {feats['Flow Duration'] != null
                        ? Number(feats['Flow Duration']).toLocaleString()
                        : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {feats['Total Fwd Packets'] ?? '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {feats['Total Backward Packets'] ?? '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#1a1a1e] flex items-center justify-between text-xs text-neutral-400">
        <div>
          Affichage de <span className="font-semibold text-white">{filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> à{' '}
          <span className="font-semibold text-white">{Math.min(currentPage * pageSize, filteredRows.length)}</span> sur{' '}
          <span className="font-semibold text-white">{filteredRows.length}</span> résultats
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#1a1a1e] bg-black text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono px-2">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#1a1a1e] bg-black text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
