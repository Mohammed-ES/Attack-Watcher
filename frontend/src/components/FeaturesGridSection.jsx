import FeaturesWithPanel from '@/components/ui/features-with-panel';
import { ScrollReveal } from '../animations';

export default function FeaturesGridSection() {
  return (
    <section
      id="capabilities"
      className="py-16 sm:py-24 bg-black/60 border-t border-[#1a1a1e] relative overflow-hidden backdrop-blur-sm"
    >
      {/* Fond atmosphérique : Halos lumineux bleus profonds */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Trame de grille cybernétique discrète */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.8) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10">
        <ScrollReveal direction="up">
          <FeaturesWithPanel
            title="Intelligence at every layer"
            badge="Modular Architecture"
            description="Comprehensive network observability and multi-vector attack detection powered by supervised ML."
            className="py-0"
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
