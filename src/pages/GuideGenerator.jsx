import React, { useState } from 'react';
import { db } from '@/api/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Sparkles, Loader2, Copy, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
async function invokeLLM(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }) });
  const data = await response.json();
  return data.content?.map(b => b.text || '').join('') || '';
}
export default function GuideGenerator() {
  const [topic, setTopic] = useState('How to Use AI to Grow Your Small Business');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const generateGuide = async () => { setLoading(true); try { const result = await invokeLLM(`Create a simple downloadable guide for craft and small business owners.\nTopic: "${topic}"\nInclude: catchy title, 5 numbered sections with practical advice, real-life craft/market stall examples, market stall tips, social media ideas, simple tools.\nStyle: beginner friendly, no jargon, copy-paste ready, headers, bullet points, emojis.\nEnd with CTA to book free AI audit.`); setGuide(result); } catch { toast.error('Failed to generate guide'); } finally { setLoading(false); } };
  const generateSignupEmail = async () => { setEmailLoading(true); try { const result = await invokeLLM(`Create a friendly message to encourage people to join my mailing list at my craft/market stall.\nFree guide topic: "${topic}"\nMake it short, warm, simple. Include why they should join, what they get.\nAlso create: 1. catchy subject line 2. follow-up welcome email 3. second sales email (2-3 days later).\nMake each email ready to use with emojis.`); setEmailResult(result); } catch { toast.error('Failed to generate email funnel'); } finally { setEmailLoading(false); } };
  const saveGuide = async () => { try { await db.entities.GeneratedContent.create({ content_type: 'guide', title: topic, content: guide, status: 'draft' }); toast.success('Guide saved!'); } catch { toast.error('Failed to save guide'); } };
  const saveEmailFunnel = async () => { try { await db.entities.GeneratedContent.create({ content_type: 'email_funnel', title: `Email funnel — ${topic}`, content: emailResult, status: 'draft' }); toast.success('Email funnel saved!'); } catch { toast.error('Failed to save'); } };
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div><h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3"><FileText className="w-7 h-7 text-primary" />Free Guide Generator</h1><p className="text-muted-foreground mt-1">Create your lead magnet guide to capture emails</p></div>
      <Card className="p-5 space-y-4"><Input placeholder="Guide topic..." value={topic} onChange={(e) => setTopic(e.target.value)} /><div className="flex gap-2 flex-wrap"><Button onClick={generateGuide} disabled={loading} className="gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Generate Guide</Button><Button variant="outline" onClick={generateSignupEmail} disabled={emailLoading} className="gap-2">{emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Generate Email Funnel</Button></div></Card>
      {guide && <Card><CardContent className="p-5"><div className="prose prose-sm max-w-none"><ReactMarkdown>{guide}</ReactMarkdown></div><div className="flex gap-2 mt-4 flex-wrap"><Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(guide); toast.success('Copied!'); }} className="gap-1"><Copy className="w-3 h-3" /> Copy</Button><Button variant="outline" size="sm" onClick={saveGuide} className="gap-1"><Save className="w-3 h-3" /> Save</Button><Button size="sm" onClick={generateGuide} disabled={loading} className="gap-1"><Sparkles className="w-3 h-3" /> Regenerate</Button></div></CardContent></Card>}
      {emailResult && <Card><CardContent className="p-5"><p className="font-medium mb-3">📧 Email Funnel</p><div className="prose prose-sm max-w-none"><ReactMarkdown>{emailResult}</ReactMarkdown></div><div className="flex gap-2 mt-4 flex-wrap"><Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(emailResult); toast.success('Copied!'); }} className="gap-1"><Copy className="w-3 h-3" /> Copy</Button><Button variant="outline" size="sm" onClick={saveEmailFunnel} className="gap-1"><Save className="w-3 h-3" /> Save</Button></div></CardContent></Card>}
    </div>
  );
}
