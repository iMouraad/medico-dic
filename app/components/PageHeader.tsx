interface Props {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export default function PageHeader({ title, description, children }: Props) {
    return (
        <div className="flex items-start justify-between flex-wrap gap-3 mb-8">
            <div className="max-w-2xl">
                <h1 className="text-xl font-extrabold text-slate-800 mb-1">{title}</h1>
                {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>
            {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
        </div>
    );
}
