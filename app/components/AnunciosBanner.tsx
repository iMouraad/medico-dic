import { Megaphone } from 'lucide-react';
import type { Ad } from '@/app/lib/types';

export default function AnunciosBanner({ ads, compact = false }: { ads: Ad[]; compact?: boolean }) {
    if (ads.length === 0) return null;

    return (
        <section>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                <Megaphone className="w-4 h-4 text-blue-600" />
                <span>Publicidad</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {ads.map((ad) => {
                    const card = (
                        <div
                            className={`flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden hover:shadow-md transition-shadow duration-200 ${
                                compact ? 'w-52' : 'w-72'
                            }`}
                        >
                            <div className={`w-full bg-slate-100 flex items-center justify-center ${compact ? 'h-24' : 'h-32'}`}>
                                {ad.image_url ? (
                                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Megaphone className="w-6 h-6 text-slate-300" />
                                )}
                            </div>
                            <div className="p-3">
                                <span className="text-xs font-bold text-slate-700 line-clamp-2">{ad.title}</span>
                            </div>
                        </div>
                    );

                    return ad.link_url ? (
                        <a key={ad.id} href={ad.link_url} target="_blank" rel="noopener noreferrer sponsored">
                            {card}
                        </a>
                    ) : (
                        <div key={ad.id}>{card}</div>
                    );
                })}
            </div>
        </section>
    );
}
