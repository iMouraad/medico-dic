'use client';

import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { formatFechaCorta } from '@/app/lib/dateFormat';

export interface DailyPoint {
    day: string;
    profile_views: number;
}

interface Props {
    data: DailyPoint[];
}

const WIDTH = 560;
const HEIGHT = 160;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export default function VisitasChart({ data }: Props) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const total = useMemo(() => data.reduce((sum, d) => sum + d.profile_views, 0), [data]);
    const max = useMemo(() => Math.max(1, ...data.map((d) => d.profile_views)), [data]);

    const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
    const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

    const points = data.map((d, i) => {
        const x = PAD_LEFT + (data.length === 1 ? plotWidth / 2 : (i / (data.length - 1)) * plotWidth);
        const y = PAD_TOP + plotHeight - (d.profile_views / max) * plotHeight;
        return { x, y, ...d };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1]?.x.toFixed(1)} ${PAD_TOP + plotHeight} L ${points[0]?.x.toFixed(1)} ${PAD_TOP + plotHeight} Z`;

    const gridLines = [0, 0.5, 1].map((t) => PAD_TOP + plotHeight * t);

    const formatDate = (day: string) => formatFechaCorta(new Date(`${day}T00:00:00`));

    const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const ratio = Math.min(1, Math.max(0, relX / rect.width));
        const idx = Math.round(ratio * (data.length - 1));
        setHoverIndex(idx);
    };

    const hovered = hoverIndex !== null ? points[hoverIndex] : null;
    const labelStep = Math.max(1, Math.floor(data.length / 5));

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 bg-blue-50">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-slate-800 leading-none">Visitas al perfil</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Últimos {data.length} días · {total} en total
                        </div>
                    </div>
                </div>
            </div>

            {total === 0 ? (
                <div className="h-[160px] flex items-center justify-center text-xs text-slate-400 font-medium">
                    Todavía no hay visitas registradas en este período.
                </div>
            ) : (
                <div className="relative">
                    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" preserveAspectRatio="none">
                        {gridLines.map((y, i) => (
                            <line key={i} x1={PAD_LEFT} y1={y} x2={WIDTH - PAD_RIGHT} y2={y} stroke="#f1f5f9" strokeWidth={1} />
                        ))}

                        <defs>
                            <linearGradient id="visitasArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        <path d={areaPath} fill="url(#visitasArea)" />
                        <path
                            d={linePath}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {data.map((_, i) => (
                            <text
                                key={i}
                                x={points[i].x}
                                y={HEIGHT - 4}
                                textAnchor="middle"
                                className="fill-slate-400"
                                fontSize={9}
                                fontWeight={700}
                                style={{ opacity: i % labelStep === 0 || i === data.length - 1 ? 1 : 0 }}
                            >
                                {formatDate(data[i].day)}
                            </text>
                        ))}

                        {hovered && (
                            <>
                                <line
                                    x1={hovered.x}
                                    y1={PAD_TOP}
                                    x2={hovered.x}
                                    y2={PAD_TOP + plotHeight}
                                    stroke="#cbd5e1"
                                    strokeWidth={1}
                                    strokeDasharray="3 3"
                                />
                                <circle cx={hovered.x} cy={hovered.y} r={4} fill="#2563eb" stroke="white" strokeWidth={2} />
                            </>
                        )}

                        <rect
                            x={PAD_LEFT}
                            y={0}
                            width={plotWidth}
                            height={HEIGHT}
                            fill="transparent"
                            onMouseMove={handleMove}
                            onMouseLeave={() => setHoverIndex(null)}
                        />
                    </svg>

                    {hovered && (
                        <div
                            className="absolute -translate-x-1/2 -translate-y-full bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
                            style={{
                                left: `${(hovered.x / WIDTH) * 100}%`,
                                top: `${(hovered.y / HEIGHT) * 100 - 4}%`,
                            }}
                        >
                            {formatDate(hovered.day)} · {hovered.profile_views} visita{hovered.profile_views === 1 ? '' : 's'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
