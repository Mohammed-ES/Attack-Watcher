"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Cpu, Layers } from "lucide-react";

export interface FeatureItem {
  title: string;
  alt?: string;
  content: string | React.ReactNode;
}

function FeatureMedia({
  content,
  alt,
}: {
  content: string | React.ReactNode;
  alt?: string;
}) {
  if (typeof content !== "string") {
    return <div className="w-full h-full">{content}</div>;
  }

  const isVideo = /\.(mp4|webm|ogg)$/i.test(content);
  const isImage =
    /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(content) ||
    /unsplash|images\./i.test(content);

  if (isVideo) {
    return (
      <video
        src={content}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  if (isImage) {
    return (
      <img src={content} alt={alt || "Feature preview"} className="w-full h-full object-cover" />
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-8 bg-[#0c0c0e]">
      <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
    </div>
  );
}

export const original21stItems: FeatureItem[] = [
  {
    title: "Copy & paste components, instantly.",
    alt: "Drop in fully-styled, accessible components with a single CLI command.",
    content: "https://cdn.21st.dev/assets/mirror/8c/8c4e18b6cde77ac53f3fa40ce7146594c03dd5fd0ebbd2adc9de141804a4d845.webm",
  },
  {
    title: "Install components & blocks via CLI.",
    alt: "Run a single command to add any component directly into your codebase — no package to manage.",
    content: "https://cdn.21st.dev/assets/mirror/25/25228e9cefa50f9db3c28b77375e51fb15fc5975d98a6fbe23dbeeb9e068395d.webm",
  },
  {
    title: "Tailwind-first styling you actually own.",
    alt: "No black-box CSS. The source lives in your project — tweak anything, anytime.",
    content:
      "https://cdn.21st.dev/assets/localized/bd5e2be5d76b2e4f1612e70510357cf6865869dfed81859c4fd7b597ca38b9a6.png",
  },
  {
    title: "Dark mode out of the box.",
    alt: "Theme switching with CSS variables. Light, dark, or fully custom — zero extra work.",
    content: "https://cdn.21st.dev/assets/mirror/16/167a5626e0c8f3aa59c25b5dc3324a2d0178bbec206084a4375f5363e29ade5f.webm",
  },
  {
    title: "Responsive by default, every time.",
    alt: "Every component adapts seamlessly across mobile, tablet, and desktop — no extra work needed.",
    content: "https://cdn.21st.dev/assets/mirror/6e/6eae938226ca5a8c25295b2f1a8cfee3d7e96db1445e63bdc7eff68309f95036.webm",
  },
];

export const attackWatcherItems: FeatureItem[] = [
  {
    title: "Real-time Vector Parsing & Inspection",
    alt: "Extraction instantanée des 10 variables fondamentales du trafic réseau IP/TCP à partir des paquets capturés.",
    content: "https://cdn.21st.dev/assets/mirror/8c/8c4e18b6cde77ac53f3fa40ce7146594c03dd5fd0ebbd2adc9de141804a4d845.webm",
  },
  {
    title: "Anti-Leakage Scaling & Standardization",
    alt: "Standardisation StandardScaler fittée rigoureusement post-split stratifié, éliminant toute contamination statistique.",
    content: "https://cdn.21st.dev/assets/mirror/25/25228e9cefa50f9db3c28b77375e51fb15fc5975d98a6fbe23dbeeb9e068395d.webm",
  },
  {
    title: "Dual-Model Champion Engine (RF vs XGBoost)",
    alt: "Benchmark continu et sélection automatique du meilleur modèle basé sur le F1-Score et la latence.",
    content: "https://cdn.21st.dev/assets/localized/bd5e2be5d76b2e4f1612e70510357cf6865869dfed81859c4fd7b597ca38b9a6.png",
  },
  {
    title: "Batch CSV High-Throughput Inspection",
    alt: "Analyse vectorisée de fichiers CSV volumineux comprenant des centaines de milliers de flux sans saturation mémoire.",
    content: "https://cdn.21st.dev/assets/mirror/16/167a5626e0c8f3aa59c25b5dc3324a2d0178bbec206084a4375f5363e29ade5f.webm",
  },
  {
    title: "Calibrated Zero False Positives Discrimination",
    alt: "Calibration stricte du seuil de décision pour distinguer les pics légitimes des attaques DDoS par inondation.",
    content: "https://cdn.21st.dev/assets/mirror/6e/6eae938226ca5a8c25295b2f1a8cfee3d7e96db1445e63bdc7eff68309f95036.webm",
  },
];

interface FeaturesWithPanelProps {
  title?: string;
  badge?: string;
  description?: string;
  items?: FeatureItem[];
  className?: string;
}

export default function FeaturesWithPanel({
  title = "Intelligence at every layer",
  badge = "Modular Architecture",
  description = "Comprehensive network observability and multi-vector attack detection powered by supervised ML.",
  items,
  className,
}: FeaturesWithPanelProps) {
  const [active, setActive] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<'cyber' | 'dev'>('cyber');

  // Détermine la liste d'éléments affichés
  const currentItems = items || (activeTab === 'cyber' ? attackWatcherItems : original21stItems);

  return (
    <div className={cn("relative w-full py-12", className)}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 lg:items-start">
          <div>
            {/* Badge et sélecteur de vue */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              {badge && (
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0c0c0e] text-blue-400 border border-[#222228]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{badge}</span>
                </div>
              )}

              {/* Bascule discrète entre les items Cyber Intelligence et 21st.dev */}
              {!items && (
                <div className="inline-flex items-center p-0.5 rounded-full bg-black/60 border border-[#1a1a1e] text-[11px] font-mono">
                  <button
                    onClick={() => {
                      setActiveTab('cyber');
                      setActive(0);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-full transition flex items-center space-x-1.5",
                      activeTab === 'cyber'
                        ? "bg-blue-600 text-white font-medium shadow"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <span>Intelligence ML</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('dev');
                      setActive(0);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-full transition flex items-center space-x-1.5",
                      activeTab === 'dev'
                        ? "bg-blue-600 text-white font-medium shadow"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    <Layers className="w-3 h-3" />
                    <span>21st.dev Core</span>
                  </button>
                </div>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
              {title}
            </h2>

            {description && (
              <p className="text-muted-foreground text-sm sm:text-base font-normal mb-10 max-w-xl">
                {description}
              </p>
            )}

            {!description && <div className="mb-10" />}

            <ul className="flex flex-col gap-1">
              {currentItems.map((item, index) => (
                <motion.li
                  key={`${activeTab}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.07,
                    ease: "easeOut",
                  }}
                  onClick={() => setActive(index)}
                  className={cn(
                    "flex flex-col px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 lg:flex-row lg:items-center lg:gap-4 border",
                    active === index
                      ? "ring-1 ring-blue-500/80 bg-blue-600/10 border-blue-500/30 text-white"
                      : "ring-1 ring-transparent hover:bg-white/[0.03] border-transparent text-neutral-400",
                  )}
                >
                  <div className="flex flex-row items-center gap-4 w-full lg:contents">
                    <span
                      className={cn(
                        "size-7 rounded-full flex items-center justify-center text-xs font-mono font-medium shrink-0 transition-colors duration-200",
                        active === index
                          ? "bg-blue-600 text-white font-semibold shadow-[0_0_12px_rgba(37,99,235,0.6)]"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors duration-200",
                        active === index
                          ? "text-white font-semibold"
                          : "text-neutral-400",
                      )}
                    >
                      {item.title}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {active === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full overflow-hidden lg:hidden"
                      >
                        <Card className="w-full mt-3 overflow-hidden p-0 gap-0 aspect-4/3 relative border-[#1a1a1e] bg-[#0c0c0e]">
                          <div className="absolute inset-0">
                            <FeatureMedia
                              content={item.content}
                              alt={item.alt}
                            />
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block sticky top-28">
            <Card className="relative w-full aspect-4/3 overflow-hidden p-0 gap-0 border border-[#1a1a1e] bg-[#0c0c0e] shadow-[0_20px_50px_rgba(0,0,0,0.9)] rounded-3xl group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${active}`}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 flex items-center justify-center bg-black"
                >
                  <FeatureMedia
                    content={currentItems[active]?.content}
                    alt={currentItems[active]?.alt}
                  />

                  {/* Liseré de bas de carte avec description alt */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-xs font-mono text-neutral-300">
                    <span className="truncate max-w-[85%]">{currentItems[active]?.alt}</span>
                    <span className="text-blue-400 text-[10px] uppercase font-bold shrink-0">Layer 0{active + 1}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
