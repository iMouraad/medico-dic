interface Props {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color?: 'blue' | 'emerald' | 'amber' | 'red' | 'slate' | 'orange';
}

const COLOR_MAP: Record<NonNullable<Props['color']>, string> = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
    slate: 'text-slate-600 bg-slate-50',
    orange: 'text-orange-600 bg-orange-50',
};

export default function StatCard({ label, value, icon: Icon, color = 'blue' }: Props) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex items-center gap-4 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${COLOR_MAP[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <div className="text-2xl font-black text-slate-800 leading-none truncate">{value}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 truncate">{label}</div>
            </div>
        </div>
    );
}
