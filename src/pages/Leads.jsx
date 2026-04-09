import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  guide_sent: 'bg-amber-100 text-amber-700',
  follow_up_1: 'bg-violet-100 text-violet-700',
  follow_up_2: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
};

async function invokeLLM(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content?.map(b => b.text || '').join('') || '';
}

export default function Leads() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', business_type: '', source: 'qr_scan' });
  const [emailDraft, setEmailDraft] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => db.entities.Lead.list('-created_date', 100),
  });
  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Lead.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leads'] }); setShowAdd(false); setNewLead({ name: '', email: '', business_type: '', source: 'qr_scan' }); toast.success('Lead added!'); },
    onError: () => toast.error('Failed to add lead'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Lead.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
    onError: () => toast.error('Failed to update lead'),
  });
  const generateFollowUp = async (lead) => {
    setEmailLoading(true);
    try {
      const result = await invokeLLM(`Create a friendly follow-up email for a lead from my craft/market stall business.\nLead name: ${lead.name || 'there'}\nTheir business: ${lead.business_type || 'small business'}\nCurrent status: ${lead.status}\nIf status is "new": Write a thank-you email with a free tip and link to guide.\nIf status is "guide_sent": Write a "Most people miss this…" email with a story and soft offer.\nIf status is "follow_up_1": Write a conversion email with clear offer and CTA.\nInclude:\n- Subject line\n- Full email body\n- Friendly, warm tone\n- Clear CTA`);
      setEmailDraft({ lead, content: result });
    } catch { toast.error('Failed to generate email'); }
    finally { setEmailLoading(false); }
  };
  const saveEmailToContent = async () => {
    try {
      await db.entities.GeneratedContent.create({ content_type: 'email', title: `Email for ${emailDraft?.lead?.name || emailDraft?.lead?.email}`, content: emailDraft?.content, status: 'draft' });
      toast.success('Saved to content!');
    } catch { toast.error('Failed to save'); }
  };
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3"><Users className="w-7 h-7 text-primary" />Leads</h1>
          <p className="text-muted-foreground mt-1">{leads.length} contacts captured</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Lead</Button>
      </div>
      {showAdd && (
        <Card className="p-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Name" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} />
            <Input placeholder="Email *" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
            <Input placeholder="Business type" value={newLead.business_type} onChange={(e) => setNewLead({ ...newLead, business_type: e.target.value })} />
            <Select value={newLead.source} onValueChange={(v) => setNewLead({ ...newLead, source: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="qr_scan">QR Scan</SelectItem>
                <SelectItem value="market_stall">Market Stall</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={() => createMutation.mutate(newLead)} disabled={!newLead.email || createMutation.isPending}>{createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </Card>
      )}
      <div className="space-y-3">
        {isLoading ? <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
        : leads.length === 0 ? <Card className="p-8 text-center"><Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No leads yet.</p></Card>
        : leads.map((lead) => (
          <Card key={lead.id} className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">{(lead.name || lead.email)?.[0]?.toUpperCase() || '?'}</div>
                <div><p className="font-medium">{lead.name || lead.email}</p><p className="text-xs text-muted-foreground">{lead.email} · {lead.business_type || 'Unknown'}</p></div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusColors[lead.status] || statusColors.new}>{lead.status?.replace(/_/g, ' ')}</Badge>
                <Select value={lead.status} onValueChange={(v) => updateMutation.mutate({ id: lead.id, data: { status: v } })}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="guide_sent">Guide Sent</SelectItem>
                    <SelectItem value="follow_up_1">Follow Up 1</SelectItem>
                    <SelectItem value="follow_up_2">Follow Up 2</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => generateFollowUp(lead)} disabled={emailLoading} className="gap-1">{emailLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}Email</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!emailDraft} onOpenChange={() => setEmailDraft(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Follow-up Email for {emailDraft?.lead?.name || emailDraft?.lead?.email}</DialogTitle></DialogHeader>
          <div className="prose prose-sm max-w-none"><ReactMarkdown>{emailDraft?.content || ''}</ReactMarkdown></div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(emailDraft?.content || ''); toast.success('Copied!'); }}>Copy</Button>
            <Button size="sm" onClick={saveEmailToContent}>Save to Content</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
