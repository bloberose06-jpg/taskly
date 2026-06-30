// src/components/JobCard.tsx
import Link from 'next/link';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    category?: string;
    image_url?: string | null;
    type?: string; // Híbrido, Remoto, Presencial
    location?: string;
    price?: number;
    payment_type?: string;
    cliente_id: string;
  };
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="group flex flex-col bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 h-full">
      
      {/* 1. Image Header Section (Keeps layout uniform) */}
      <div className="relative w-full h-44 bg-zinc-950 overflow-hidden border-b border-zinc-800/60">
        {job.image_url ? (
          <img 
            src={job.image_url} 
            alt={job.title}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Sleek minimalist placeholder when there's no image */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-600">
            <span className="text-xs uppercase tracking-widest font-mono text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded">
              {job.category || 'Taskly'}
            </span>
          </div>
        )}
        
        {/* Modality Badges over Image */}
        <div className="absolute top-3 left-3">
          <span className={`text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm border ${
            job.type?.toLowerCase() === 'remoto' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : job.type?.toLowerCase() === 'híbrido'
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            {job.type || 'Presencial'}
          </span>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top category info row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold tracking-wider text-amber-500 uppercase truncate max-w-[70%]">
              {job.category || "General"}
            </span>
            
            {/* LINK TO PROFILE (Subtle, clean placement) */}
            <Link 
              href={`/profile/${job.cliente_id}`}
              className="text-xs text-zinc-400 hover:text-white underline decoration-zinc-600 hover:decoration-white transition-colors"
            >
              Ver perfil
            </Link>
          </div>

          {/* Job Title */}
          <Link href={`/jobs/${job.id}`}>
            <h3 className="text-base font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1 mb-1.5" title={job.title}>
              {job.title}
            </h3>
          </Link>

          {/* Description (Forced strictly to 2 lines to lock card alignment) */}
          <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-4">
            {job.description || "Sin descripción proporcionada."}
          </p>
        </div>

        {/* 3. Footer Meta Info */}
        <div className="space-y-3 pt-3 border-t border-zinc-800/60 mt-auto">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="flex items-center gap-1 text-zinc-400 truncate">
              <span className="text-zinc-600 text-xs">📍</span> {job.location || "Guatemala"}
            </span>
          </div>

          {/* Pricing Row */}
          <div className="flex items-end justify-between bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/40">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Presupuesto</span>
              <span className="text-xs text-zinc-400 font-mono">
                {job.payment_type || 'Por entrega'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-amber-400 font-mono">
                GTQ {job.price?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
