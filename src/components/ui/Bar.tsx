export function Bar({ height, label, active = false }: { height: string, label: string, active?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2 group flex-1">
            <div
                className={`${active ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-blue-100 hover:bg-blue-200'} transition-all rounded-t-lg w-full`}
                style={{ height }}
            ></div>
            <p className={`${active ? 'text-blue-600' : 'text-slate-400'} text-[10px] font-bold uppercase`}>{label}</p>
        </div>
    );
}
