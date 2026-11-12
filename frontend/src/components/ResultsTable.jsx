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
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden backdrop-blur shadow-xl">
      {/* Barre d'outils (Filtres, Recherche, Pagination rapide) */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Filtres par bouton */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              filterStatus === 'ALL'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tous ({rows.length})
          </button>
          <button
            onClick={() => handleFilterChange('ATTACK')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              filterStatus === 'ATTACK'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Attaques ({rows.filter((r) => r.is_ddos).length})
          </button>
          <button
            onClick={() => handleFilterChange('NORMAL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              filterStatus === 'NORMAL'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Normaux ({rows.filter((r) => !r.is_ddos).length})
          </button>
        </div>

        {/* Barre de recherche & Sélecteur de page */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher (ligne, port)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      {/* Tableau des données */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4"># Ligne</th>
              <th className="py-3 px-4">Verdict</th>
              <th className="py-3 px-4">Probabilité DDoS</th>
              <th className="py-3 px-4">Port Cible</th>
              <th className="py-3 px-4">Durée (μs)</th>
              <th className="py-3 px-4">Paquets Aller</th>
              <th className="py-3 px-4">Paquets Retour</th>
              <th className="py-3 px-4">Débit (p/s)</th>
              <th className="py-3 px-4">Flag ACK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-slate-500 font-sans">
                  Aucun enregistrement ne correspond aux critères de filtre.
                </td>
              </tr>
            ) : (
              paginatedRows.map((r) => {
                const feats = r.features || {};
                return (
                  <tr
                    key={r.row_index}
                    className={`transition hover:bg-slate-800/40 ${
                      r.is_ddos ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 text-slate-400 font-semibold">{r.row_index}</td>
                    <td className="py-2.5 px-4 font-sans">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-semibold ${
                          r.is_ddos
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {r.is_ddos ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{r.prediction}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`font-bold ${
                          r.is_ddos ? 'text-rose-400' : 'text-slate-300'
                        }`}
                      >
                        {(r.probability * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-200">{feats['Destination Port'] ?? '-'}</td>
                    <td className="py-2.5 px-4">{Number(feats['Flow Duration'] || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-4">{feats['Total Fwd Packets'] ?? '-'}</td>
                    <td className="py-2.5 px-4">{feats['Total Backward Packets'] ?? '-'}</td>
                    <td className="py-2.5 px-4">{Number(feats['Flow Packets/s'] || 0).toFixed(1)}</td>
                    <td className="py-2.5 px-4">{feats['ACK Flag Count'] ?? '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Contrôles de Pagination */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Affichage de <span className="font-semibold text-slate-200">{filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> à{' '}
          <span className="font-semibold text-slate-200">{Math.min(currentPage * pageSize, filteredRows.length)}</span> sur{' '}
          <span className="font-semibold text-slate-200">{filteredRows.length}</span> lignes filtrées
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2">
            Page <span className="font-semibold text-slate-200">{currentPage}</span> sur{' '}
            <span className="font-semibold text-slate-200">{totalPages}</span>
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

