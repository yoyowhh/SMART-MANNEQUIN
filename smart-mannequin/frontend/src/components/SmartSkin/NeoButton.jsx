export default function NeoButton({ children, className = "", ...props }) {
    return (
        <button
            className={`neo-pill px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-slate-700 font-medium active:scale-[0.98] transition-all hover:text-slate-900 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
