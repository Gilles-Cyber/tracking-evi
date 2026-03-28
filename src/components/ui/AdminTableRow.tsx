import { MapPin, AlertTriangle, Edit3, UserPlus, Eye } from 'lucide-react';

export function AdminTableRow({ id, dest, date, status, value, statusColor }: { id: string, dest: string, date: string, status: string, value: string, statusColor: 'blue' | 'green' | 'red' }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        red: 'bg-red-50 text-red-600 border-red-100'
    };

    return (
        <tr className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 font-mono text-blue-600 text-xs font-bold">{id}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="text-slate-400 w-3 h-3" />
                    {dest}
                </div>
            </td>
            <td className="px-6 py-4 text-xs text-slate-400">{date}</td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border ${colorClasses[statusColor]}`}>
                    {statusColor === 'red' && <AlertTriangle className="w-3 h-3" />}
                    {statusColor !== 'red' && <span className={`w-1.5 h-1.5 rounded-full ${statusColor === 'blue' ? 'bg-blue-600' : 'bg-green-600'}`}></span>}
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-right font-bold text-xs text-slate-900">{value}</td>
            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-blue-600 transition-colors"><UserPlus className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
    );
}
