import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
const TYPE_STYLES = {
  pitch_generated:   { label: '🎤 Pitch',      color: 'bg-orange-100 text-orange-700' },
  content_generated: { label: '✏️ Content',    color: 'bg-blue-100 text-blue-700' },
  email_drafted:     { label: '📧 Email',       color: 'bg-green-100 text-green-700' },
  lead_captured:     { label: '🙋 Lead',        color: 'bg-violet-100 text-violet-700' },
  insight_saved:     { label: '🧠 Insight',     color: 'bg-amber-100 text-amber-700' },
  guide_generated:   { label: '📄 Guide',       color: 'bg-teal-100 text-teal-700' },
  workflow_run:      { label: '⚡ Workflow',     color: 'bg-primary/10 text-primary' },
  connector_call:    { label: '🔌 Connector',   color: 'bg-rose-100 text-rose-700' },
};
const STATUS_ICONS = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed:  <XCircle className="w-4 h-4 text-destructive" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
};
export default function ActionLog() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['actionlog'],
    queryFn: () => db.entities.ActionLog.list('-created_date', 100),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.ActionLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actionlog'] }),
  });
  const clearAll = async () => {
    await Promise.all(logs.map(l => db.entities.ActionLog.delete(l.id)));
    queryClient.invalidateQueries({ queryKey: ['actionlog'] });
  };
  const filtered = filter === 'all' ? logs : logs.filter(l => l.action === filter);
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3"><Activity className="w-7 h-7 text-primary" />Action Log</h1>
          <p className="text-muted-foreground mt-1">{logs.length} actions recorded</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(TYPE_STYLES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {logs.length > 0 && <Button variant="outline" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">Clear All</Button>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['success', 'failed', 'pending'].map(status => {
          const count = logs.filter(l => (l.status || 'success') === status).length;
          return <Card key={status} className="p-3 text-center"><div className="flex items-center justify-center gap-2 mb-1">{STATUS_ICONS[status]}</div><p className="text-xl font-bold">{count}</p><p className="text-xs text-muted-foreground capitalize">{status}</p></Card>;
        })}
      </div>
      <div className="space-y-2">
        {isLoading ? <div className="text-center py-8 text-muted-foreground">Loading...</div>
        : filtered.length === 0 ? <Card className="p-8 text-center"><Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No actions logged yet.</p></Card>
        : filtered.map((log) => (
          <Card key={log.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5">{STATUS_ICONS[log.status || 'success']}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={TYPE_STYLES[log.action]?.color || 'bg-gray-100 text-gray-700'}>{TYPE_STYLES[log.action]?.label || log.action}</Badge>
                    {log.entity_type && log.entity_type !== 'internal' && <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>}
                    <span className="text-xs text-muted-foreground">{log.created_date ? format(new Date(log.created_date), 'MMM d, HH:mm') : ''}</span>
                  </div>
                  <p className="text-sm font-medium">{log.details?.summary}</p>
                  {log.details?.detail && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.details.detail}</p>}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteMutation.mutate(log.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
