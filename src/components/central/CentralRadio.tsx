import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Radio as RadioIcon, Users, Clock, ExternalLink, Activity, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { RadioScheduleModal } from '../dashboard/RadioScheduleModal';
import { RadioShow } from '../../types';

interface DbShow {
    id: string;
    title: string;
    host: string;
    days: string[];
    time_slot: string;
    status: string;
    last_broadcast: string | null;
}

interface DbAdSlot {
    id: string;
    show_date: string;
    time_slot: string;
    client_name: string;
    length_seconds: number;
    status: string;
    notes: string | null;
}

const EMPTY_SHOW: RadioShow = { id: '', title: '', host: '', schedule: '', status: 'planned' };

const dbShowToRadioShow = (s: DbShow): RadioShow => ({
    id: s.id,
    title: s.title,
    host: s.host,
    schedule: s.days.length ? s.days.join(', ') + ' · ' + s.time_slot : s.time_slot,
    status: s.status as RadioShow['status'],
    lastBroadcast: s.last_broadcast || undefined,
});

export const CentralRadio: React.FC = () => {
    const [shows, setShows] = useState<DbShow[]>([]);
    const [adSlots, setAdSlots] = useState<DbAdSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalShow, setModalShow] = useState<RadioShow | null>(null);

    const fetchShows = async () => {
        const { data, error } = await supabase
            .from('radio_shows')
            .select('*')
            .order('created_at');
        if (error) throw error;
        setShows(data || []);
    };

    const fetchAdSlots = async () => {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
            .from('radio_ad_slots')
            .select('*')
            .eq('show_date', today)
            .order('time_slot');
        if (error) throw error;
        setAdSlots(data || []);
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchShows(), fetchAdSlots()])
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (updated: RadioShow) => {
        const payload = {
            title: updated.title,
            host: updated.host,
            days: [] as string[],
            time_slot: updated.schedule,
            status: updated.status,
            last_broadcast: updated.lastBroadcast || null,
        };
        if (updated.id) {
            const { error } = await supabase.from('radio_shows').update(payload).eq('id', updated.id);
            if (error) { setError(error.message); return; }
        } else {
            const { error } = await supabase.from('radio_shows').insert(payload);
            if (error) { setError(error.message); return; }
        }
        setModalShow(null);
        await fetchShows().catch(e => setError(e.message));
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this show?')) return;
        const { error } = await supabase.from('radio_shows').delete().eq('id', id);
        if (error) { setError(error.message); return; }
        setShows(prev => prev.filter(s => s.id !== id));
    };

    const liveShow = shows.find(s => s.status === 'live');

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-serif">Community Radio <span className="italic text-brand-olive">FM 107.2</span></h2>
                    <p className="text-brand-ink/50 mt-1">Live from The Farmers Table Hub.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setModalShow(EMPTY_SHOW)}
                        className="flex items-center gap-2 px-6 py-3 border border-brand-olive/20 text-brand-olive rounded-full text-sm font-bold bg-white hover:bg-brand-olive/5 transition-all"
                    >
                        <Plus size={16} /> Schedule Show
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-brand-olive text-white rounded-full text-sm font-bold shadow-lg shadow-brand-olive/10">
                        <Activity size={18} /> Station Health
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-brand-olive/30 border-t-brand-olive rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Now On Air Card */}
                        <div className="bg-brand-olive text-brand-cream p-10 md:p-12 rounded-[40px] shadow-xl relative overflow-hidden">
                            <div className="absolute top-10 right-10 flex flex-col items-center gap-2 opacity-20">
                                <RadioIcon size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="px-3 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" /> Live On Air
                                    </div>
                                    <span className="text-white/60 text-xs font-mono">FM 107.2 · Online ✓</span>
                                </div>
                                <div className="mb-10">
                                    <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-2">Current Show</p>
                                    <h3 className="text-4xl md:text-5xl font-serif italic mb-4">
                                        {liveShow ? liveShow.title : 'No Show Currently Live'}
                                    </h3>
                                    <div className="flex items-center gap-6 text-white/80">
                                        <div className="flex items-center gap-2">
                                            <Users size={18} className="text-amber-400" />
                                            <span className="font-bold">342 Listeners</span>
                                        </div>
                                        {liveShow && (
                                            <div className="flex items-center gap-2">
                                                <Clock size={18} className="text-amber-400" />
                                                <span className="font-bold">{liveShow.time_slot}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-end gap-1.5 h-12 mb-4">
                                    {[4, 8, 5, 10, 6, 9, 7, 12, 5, 8, 4, 10, 6, 9, 3, 7, 5, 8, 4, 10].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [`${h * 4}px`, `${(h + 2) * 4}px`, `${h * 4}px`] }}
                                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                                            className="w-1.5 bg-white/40 rounded-full"
                                        />
                                    ))}
                                </div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Signal Output Peak — High Fidelity</p>
                            </div>
                        </div>

                        {/* Ad Slots Section */}
                        <div className="bg-white rounded-[40px] border border-brand-olive/5 shadow-sm p-8 md:p-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-serif italic text-brand-olive">Today's Ad Slots</h3>
                                <button className="text-xs font-bold text-brand-olive underline underline-offset-4">Manage Ad Scripts</button>
                            </div>
                            {adSlots.length === 0 ? (
                                <p className="text-sm text-brand-ink/40 py-4">No ad slots scheduled for today.</p>
                            ) : (
                                <div className="space-y-4">
                                    {adSlots.map((slot) => {
                                        const overdue = slot.status.toLowerCase() === 'unpaid';
                                        const lengthLabel = slot.length_seconds >= 60
                                            ? `${slot.length_seconds / 60}m`
                                            : `${slot.length_seconds}s`;
                                        return (
                                            <div key={slot.id} className="flex items-center gap-4 p-5 rounded-3xl bg-brand-cream/10 border border-brand-olive/5 group hover:border-brand-olive/20 transition-all">
                                                <div className="w-16 font-mono text-xs font-bold text-brand-ink/40">{slot.time_slot}</div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-brand-ink">{slot.client_name}</p>
                                                    <p className="text-[10px] text-brand-ink/40 font-bold uppercase tracking-tight">Length: {lengthLabel} · {slot.status}</p>
                                                </div>
                                                {overdue && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                                                        Payment Overdue
                                                    </div>
                                                )}
                                                <button className="p-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <ExternalLink size={14} className="text-brand-olive" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Schedule Sidebar */}
                    <div className="bg-white rounded-[40px] p-8 border border-brand-olive/10 shadow-lg shadow-brand-olive/5">
                        <h3 className="text-xl font-serif mb-8 text-brand-olive italic">Weekly Schedule</h3>
                        {shows.length === 0 ? (
                            <p className="text-sm text-brand-ink/40">No shows scheduled yet. Add one above.</p>
                        ) : (
                            <div className="space-y-8">
                                {shows.map((show, idx) => (
                                    <div key={show.id} className="space-y-3 group">
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${show.status === 'live' ? 'bg-brand-olive text-white' : 'bg-brand-cream text-brand-olive/50'}`}>
                                                {show.status === 'live' ? 'Live Now' : show.status}
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => setModalShow(dbShowToRadioShow(show))}
                                                    className="p-1 text-brand-ink/40 hover:text-brand-olive"
                                                    title="Edit show"
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(show.id)}
                                                    className="p-1 text-brand-ink/40 hover:text-red-500"
                                                    title="Delete show"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-lg leading-tight">{show.title}</h4>
                                        <div className="flex items-center justify-between text-brand-ink/60">
                                            <span className="text-xs">{show.host}</span>
                                            <span className="text-xs font-bold">{show.time_slot}</span>
                                        </div>
                                        {idx !== shows.length - 1 && <div className="pt-4 border-b border-brand-olive/5" />}
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="w-full mt-10 py-4 bg-brand-cream/50 border border-brand-olive/10 text-brand-olive rounded-3xl text-sm font-bold hover:bg-brand-olive/5 transition-all">
                            Open Full Planner
                        </button>
                    </div>
                </div>
            )}

            {modalShow && (
                <RadioScheduleModal
                    show={modalShow}
                    onClose={() => setModalShow(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};
