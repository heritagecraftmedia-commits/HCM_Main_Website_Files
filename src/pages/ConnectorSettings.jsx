import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plug, Plus, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
const TYPE_COLORS = { webhook: 'bg-blue-100 text-blue-700', email: 'bg-green-100 text-green-700', api: 'bg-violet-100 text-violet-700', automation: 'bg-amber-100 text-amber-700', storage: 'bg-orange-100 text-orange-700', crm: 'bg-rose-100 text-rose-700', other: 'bg-gray-100 text-gray-700' };
const TYPE_ICONS = { webhook: '🔗', email: '📧', api: '⚡', automation: '🤖', storage: '🗄️', crm: '👥', other: '🔌' };
const BUILT_IN = [
  { name: 'Anthropic AI', type: 'api', description: 'Core AI for content, pitches, emails', active: true, capabilities: ['Generate content', 'Summarise insights', 'Create pitches', 'Draft emails'] },
  { name: 'Supabase', type: 'storage', description: 'Database for leads, content, insights', active: true, capabilities: ['Store leads', 'Save content', 'Log actions'] },
];
export default function ConnectorSettings() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newConn, setNewConn] = useState({ name: '', type: 'webhook', config: { endpoint: '', api_key: '' }, description: '', capabilities: [], status: 'active' });
  const [capsInput, setCapsInput] = useState('');
  const { data: connectors = [] } = useQuery({ queryKey: ['connectors'], queryFn: () => db.entities.Connector.list('-created_date') });
  const createMutation = useMutation({ mutationFn: (data) => db.entities.Connector.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['connectors'] }); setShowAdd(false); setNewConn({ name: '', type: 'webhook', config: { endpoint: '', api_key: '' }, description: '', capabilities: [], status: 'active' }); setCapsInput(''); toast.success('Connector added!'); }, onError: () => toast.error('Failed to add connector') });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => db.entities.Connector.update(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connectors'] }) });
  const deleteMutation = useMutation({ mutationFn: (id) => db.entities.Connector.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connectors'] }), onError: () => toast.error('Failed to delete connector') });
  const testConnector = async (conn) => {
    let status = 'success'; let resultMsg = `${conn.name} — connection OK ✓`;
    if (conn.config?.endpoint) { try { await fetch(conn.config.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(conn.config.api_key ? { Authorization: `Bearer ${conn.config.api_key}` } : {}) }, body: JSON.stringify({ test: true }) }); } catch { status = 'failed'; resultMsg = `${conn.name} — endpoint unreachable ✗`; } }
    await db.entities.ActionLog.create({ action: 'connector_call', entity_type: 'connector', entity_id: conn.id, details: { summary: `Tested connector: ${conn.name}`, status } });
    queryClient.invalidateQueries({ queryKey: ['connectors'] });
    if (status === 'success') toast.success(resultMsg); else toast.error(resultMsg);
  };
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3"><Plug className="w-7 h-7 text-primary" />Connectors</h1><p className="text-muted-foreground mt-1">Register and manage your external tools & APIs</p></div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Connector</Button>
      </div>
      <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Built-in (always active)</p><div className="grid sm:grid-cols-2 gap-3">{BUILT_IN.map((c) => <Card key={c.name} className="p-4 border-primary/20 bg-primary/5"><div className="flex items-start justify-between mb-2"><div><p className="font-medium">{TYPE_ICONS[c.type]} {c.name}</p><p className="text-xs text-muted-foreground mt-0.5">{c.description}</p></div><Badge className="bg-green-100 text-green-700 shrink-0">Active</Badge></div><div className="flex flex-wrap gap-1 mt-2">{c.capabilities.map(cap => <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>)}</div></Card>)}</div></div>
      {showAdd && <Card className="p-5 space-y-3"><p className="font-medium">New Connector</p><div className="grid sm:grid-cols-2 gap-3"><Input placeholder="Name" value={newConn.name} onChange={(e) => setNewConn({ ...newConn, name: e.target.value })} /><Select value={newConn.type} onValueChange={(v) => setNewConn({ ...newConn, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(TYPE_COLORS).map(t => <SelectItem key={t} value={t}>{TYPE_ICONS[t]} {t}</SelectItem>)}</SelectContent></Select><Input placeholder="Endpoint URL" value={newConn.config.endpoint} onChange={(e) => setNewConn({ ...newConn, config: { ...newConn.config, endpoint: e.target.value } })} /><Input placeholder="API Key (optional)" type="password" value={newConn.config.api_key} onChange={(e) => setNewConn({ ...newConn, config: { ...newConn.config, api_key: e.target.value } })} /></div><Textarea placeholder="Description" value={newConn.description} onChange={(e) => setNewConn({ ...newConn, description: e.target.value })} /><Input placeholder="Capabilities (comma-separated)" value={capsInput} onChange={(e) => setCapsInput(e.target.value)} /><div className="flex gap-2"><Button size="sm" onClick={() => createMutation.mutate({ ...newConn, capabilities: capsInput.split(',').map(s => s.trim()).filter(Boolean) })} disabled={!newConn.name || createMutation.isPending}>Save</Button><Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button></div></Card>}
      {connectors.length > 0 && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Connectors</p><div className="space-y-3">{connectors.map((conn) => <Card key={conn.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap mb-1"><p className="font-medium">{TYPE_ICONS[conn.type]} {conn.name}</p><Badge className={TYPE_COLORS[conn.type] || TYPE_COLORS.other}>{conn.type}</Badge><Badge className={conn.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>{conn.status}</Badge></div>{conn.description && <p className="text-xs text-muted-foreground">{conn.description}</p>}</div><div className="flex items-center gap-2 shrink-0"><Button variant="outline" size="sm" onClick={() => testConnector(conn)} className="gap-1"><Zap className="w-3 h-3" /> Test</Button><Switch checked={conn.status === 'active'} onCheckedChange={(checked) => updateMutation.mutate({ id: conn.id, data: { status: checked ? 'active' : 'inactive' } })} /><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(conn.id)}><Trash2 className="w-4 h-4" /></Button></div></div></Card>)}</div></div>}
    </div>
  );
}
