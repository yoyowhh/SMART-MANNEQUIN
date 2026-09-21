export default function StatusBadge({ tone = "ok", children }) {
    const map = {
        ok: "text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200",
        warn: "text-amber-700 font-semibold bg-amber-50 border border-amber-200",
        danger: "text-red-700 font-semibold bg-red-50 border border-red-200",
        info: "text-slate-700 font-semibold bg-slate-50 border border-slate-200",
    };
    return (
        <span className={`neo-pill px-3 py-1 text-xs inline-flex items-center gap-1.5 ${map[tone] ?? map.info}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tone === 'ok' ? 'bg-emerald-500 animate-pulse' : tone === 'warn' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
            {children}
        </span>
    );
}
