import { motion } from 'framer-motion';
import { Cpu, Award, Sliders } from 'lucide-react';

export default function BenchmarkSection({ featuresMetadata }) {
  const benchmark = featuresMetadata?.benchmark || {
    RandomForest: {
      precision: 1.0,
      recall: 1.0,
      f1_score: 1.0,
      roc_auc: 1.0,
      confusion_matrix: { tn: 1650, fp: 0, fn: 0, tp: 1350 },
    },
    XGBoost: {
      precision: 1.0,
      recall: 1.0,
      f1_score: 1.0,
      roc_auc: 1.0,
      confusion_matrix: { tn: 1650, fp: 0, fn: 0, tp: 1350 },
    },
  };

  const champion = featuresMetadata?.champion_model || 'RandomForest';

  return (
    <section id="benchmark" className="py-20 border-t border-slate-800/80 bg-obsidian-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-violet-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            # Évaluation & Validation Scientifique
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Benchmark Comparatif des Modèles
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 font-light leading-relaxed">
            Évaluation rigoureuse sur un jeu de test indépendant (20% du volume, stratifié)
            pour mesurer avec exactitude la précision de classification DDoS.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tableau comparatif des modèles */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-obsidian-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur shadow-xl"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">Performances sur le Jeu de Test</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded flex items-center space-x-1">
                <Award className="w-3.5 h-3.5" />
                <span>Champion : {champion}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-obsidian-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Modèle</th>
                    <th className="py-3 px-3">Précision</th>
                    <th className="py-3 px-3">Rappel</th>
                    <th className="py-3 px-3">F1-Score</th>
                    <th className="py-3 px-3">ROC-AUC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {Object.entries(benchmark).map(([name, stats]) => {
                    const isChamp = name === champion;
                    return (
                      <tr key={name} className={isChamp ? 'bg-violet-950/20' : ''}>
                        <td className="py-3 px-3 font-semibold text-white flex items-center space-x-2">
                          <span>{name}</span>
                          {isChamp && (
                            <span className="text-[10px] bg-violet-900 text-violet-200 px-1.5 py-0.5 rounded font-sans">
                              Retenu
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-emerald-400">{(stats.precision * 100).toFixed(2)}%</td>
                        <td className="py-3 px-3 text-emerald-400">{(stats.recall * 100).toFixed(2)}%</td>
                        <td className="py-3 px-3 font-bold text-cyan-300">{(stats.f1_score * 100).toFixed(2)}%</td>
                        <td className="py-3 px-3 text-slate-200">{(stats.roc_auc * 100).toFixed(2)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrice de confusion */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block mb-3 font-mono">
                Matrice de Confusion (Modèle Champion : {champion})
              </span>
              <div className="grid grid-cols-2 gap-3 text-center font-mono text-xs">
                <div className="bg-obsidian-950 border border-emerald-900/40 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 block mb-1">Vrais Négatifs (TN)</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {benchmark[champion]?.confusion_matrix?.tn ?? 1650}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Normaux classifiés Normaux</span>
                </div>
                <div className="bg-obsidian-950 border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 block mb-1">Faux Positifs (FP)</span>
                  <span className="text-lg font-bold text-slate-400">
                    {benchmark[champion]?.confusion_matrix?.fp ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Fausses alertes</span>
                </div>
                <div className="bg-obsidian-950 border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 block mb-1">Faux Négatifs (FN)</span>
                  <span className="text-lg font-bold text-slate-400">
                    {benchmark[champion]?.confusion_matrix?.fn ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Attaques manquées</span>
                </div>
                <div className="bg-obsidian-950 border border-rose-900/40 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 block mb-1">Vrais Positifs (TP)</span>
                  <span className="text-lg font-bold text-rose-400">
                    {benchmark[champion]?.confusion_matrix?.tp ?? 1350}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Attaques bloquées</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Liste des 10 features normalisées */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 bg-obsidian-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur shadow-xl space-y-4"
          >
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Sliders className="w-5 h-5 text-violet-400" />
              <h3 className="text-base font-semibold text-white">10 Variables Réseau Clés</h3>
            </div>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Extrait standardisé des colonnes du jeu de données CIC-IDS2017 nettoyées et normalisées :
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {[
                { name: 'Destination Port', role: 'Port cible (ex: 80, 443)' },
                { name: 'Flow Duration', role: 'Durée du flux en microsecondes' },
                { name: 'Total Fwd Packets', role: 'Volume total paquets aller' },
                { name: 'Total Backward Packets', role: 'Volume total paquets retour' },
                { name: 'Total Length of Fwd Packets', role: 'Octets émis par le flux' },
                { name: 'Total Length of Bwd Packets', role: 'Octets reçus en réponse' },
                { name: 'Bwd Packet Length Std', role: 'Écart-type longueur paquets retour' },
                { name: 'Flow Packets/s', role: 'Débit en paquets par seconde' },
                { name: 'Flow IAT Mean', role: 'Intervalle moyen inter-paquets' },
                { name: 'ACK Flag Count', role: 'Présence drapeau TCP ACK' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-obsidian-950 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-cyan-400 font-medium">{f.name}</span>
                  <span className="text-slate-400 text-[11px]">{f.role}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
