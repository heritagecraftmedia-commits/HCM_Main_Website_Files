import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/api/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
const categoryLabels = {
  what_worked:       { label: '✅ What Worked',  color: 'bg-green-100 text-green-700' },
  what_didnt:        { label: "❌ What Didn't",  color: 'bg-red-100 text-red-700' },
  customer_feedback: { label: '💬 Feedback',     color: 'bg-blue-100 text-blue-700' },
  sales_insight:     { label: '💰 Sales',        color: 'bg-amber-100 text-amber-700' },
  new_opportunity:   { label: '🚀 Opportunity',  color: 'bg-violet-100 text-violet-700' },
  decision:          { label: '🎯 Decision',     color: 'bg-slate-100 text-slate-700' },
};
async function invokeLLM(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }) });
  const data = await response.json();
  return data.content?.map(b => b.text || '').join('') || '';
}
export default function MemoryBank() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newInsight, setNewInsight] = useState({ category: 'what_worked', content: '', market_event: '', importance: 'medium' });
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const { data: insights = [], isLoading } = useQuery({ queryKey: ['insights'], queryFn: () => db.entities.BusinessInsight.list('-created_date', 50) });
  const createMutation = useMutation({ mutationFn: (data) => db.entities.BusinessInsight.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['insights'] }); setShowAdd(false); setNewInsight({ category: 'what_worked', content: '', market_event: '', importance: 'medium' }); toast.success('Insight saved!'); }, onError: () => toast.error('Failed to save insight') });
  const deleteMutation = useMutation({ mutationFn: (id) => db.entities.BusinessInsight.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insights'] }) });
  const generateSummary = async () => { setSummaryLoading(true); try { const insightText = insights.map(i => `[${i.category}] ${i.content} (${i.market_event || 'general'})`).join('\n'); const result = await invokeLLM(`Summarise these business insights into a clear "Second Brain" memory file.\nInsights:\n${insightText || 'No insights recorded yet.'}\nExtract and organize: What worked, What didn't, Customer feedback themes, Sales insights, New opportunities.\nFormat cleanly with emojis and clear headings.`); setSummary(result); } catch { toast.error('Failed to generate summary'); } finally { setSummaryLoading(false); } };
  const saveSummary = async () => { try { await db.entities.GeneratedContent.create({ content_type: 'insight_summary', title: `Memory Summary — ${format(new Date(), 'dd MMM yyyy')}`, content: summary, status: 'draft' }); toast.success('Summary saved to content!'); } catch { toast.error('Failed to save summary'); } };
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3"><Brain className="w-7 h-7 text-primary" />Memory Bank</h1><p className="text-muted-foreground mt-1">Your business second brain</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateSummary} disabled={summaryLoading} className="gap-2">{summaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}AI Summary</Button>
          <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Insight</Button>
        </div>
      </div>
      {showAdd && <Card className="p-5 space-y-3"><div className="grid sm:grid-cols-2 gap-3"><Select value={newInsight.category} onValueChange={(v) => setNewInsight({ ...newInsight, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(categoryLabels).map(([key, val]) => <SelectItem key={key} value={key}>{val.label}</SelectItem>)}</SelectContent></Select><Input placeholder="Market/Event (optional)" value={newInsight.market_event} onChange={(e) => setNewInsight({ ...newInsight, market_event: e.target.value })} /></div><Textarea placeholder="What did you learn?" value={newInsight.content} onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })} /><Select value={newInsight.importance} onValueChange={(v) => setNewInsight({ ...newInsight, importance: v })}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low importance</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High importance</SelectItem></SelectContent></Select><div className="flex gap-2"><Button size="sm" onClick={() => createMutation.mutate(newInsight)} disabled={!newInsight.content || createMutation.isPending}>{createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}</Button><Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button></div></Card>}
      {summary && <Card className="border-primary/20"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />AI Memory Summary</CardTitle></CardHeader><CardContent><div className="prose prose-sm max-w-none"><ReactMarkdown>{summary}</ReactMarkdown></div><div className="flex gap-2 mt-4"><Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(summary); toast.success('Copied!'); }}>Copy</Button><Button size="sm" onClick={saveSummary}>Save to Content</Button></div></CardContent></Card>}
      <div className="space-y-3">
        {isLoading ? <div className="text-center py-8 text-muted-foreground">Loading insights...</div>
        : insights.length === 0 ? <Card className="p-8 text-center"><Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No insights yet.</p></Card>
        : insights.map((insight) => (
          <Card key={insight.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2"><Badge className={categoryLabels[insight.category]?.color || 'bg-gray-100 text-gray-700'}>{categoryLabels[insight.category]?.label || insight.category}</Badge>{insight.importance === 'high' && <Badge className="bg-red-100 text-red-700">High priority</Badge>}{insight.market_event && <span className="text-xs text-muted-foreground">{insight.market_event}</span>}<span className="text-xs text-muted-foreground">{insight.created_date ? format(new Date(insight.created_date), 'MMM d, yyyy') : ''}</span></div>
                <p className="text-sm">{insight.content}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteMutation.mutate(insight.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
