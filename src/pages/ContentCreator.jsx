import React, { useState } from 'react';
import { db } from '@/api/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenTool, Sparkles, Loader2, Copy, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
async function invokeLLM(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }) });
  const data = await response.json();
  return data.content?.map(b => b.text || '').join('') || '';
}
export default function ContentCreator() {
  const [business, setBusiness] = useState('');
  const [tone, setTone] = useState('friendly');
  const [extra, setExtra] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    if (!business) return toast.error('Describe your business first');
    setLoading(true);
    try { const res = await invokeLLM(`Create content for a craft or small business.\nBusiness: ${business}\nTone: ${tone}\n${extra ? `Extra context: ${extra}` : ''}\nOutput:\n1. 3 social media post ideas (with full caption text, hashtags)\n2. 1 short video script (TikTok/Reels style, 30 seconds)\n3. 1 story idea for Instagram/Facebook\nFocus on storytelling, behind the scenes, customer trust, soft selling, emojis.\nMake each post ready to copy-paste.`); setResult(res); }
    catch { toast.error('Failed to generate content'); }
    finally { setLoading(false); }
  };
  const saveContent = async () => { try { await db.entities.GeneratedContent.create({ content_type: 'social_post', title: `Content for ${business}`, content: result, status: 'draft' }); toast.success('Saved!'); } catch { toast.error('Failed to save'); } };
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div><h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3"><PenTool className="w-7 h-7 text-primary" />Content Creator</h1><p className="text-muted-foreground mt-1">Generate ready-to-post social media content</p></div>
      <Card className="p-5 space-y-4">
        <Input placeholder="What's your business? e.g. Handmade soy candles, artisan bread..." value={business} onChange={(e) => setBusiness(e.target.value)} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select value={tone} onValueChange={setTone}><SelectTrigger><SelectValue placeholder="Tone" /></SelectTrigger><SelectContent><SelectItem value="friendly">Friendly & Warm</SelectItem><SelectItem value="fun">Fun & Quirky</SelectItem><SelectItem value="professional">Professional</SelectItem><SelectItem value="storytelling">Storytelling</SelectItem></SelectContent></Select>
          <Textarea placeholder="Anything specific? e.g. New product launch..." value={extra} onChange={(e) => setExtra(e.target.value)} className="h-10 sm:h-auto" />
        </div>
        <Button onClick={generate} disabled={loading} className="gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Generate Content</Button>
      </Card>
      {result && <Card><CardContent className="p-5"><div className="prose prose-sm max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div><div className="flex gap-2 mt-4"><Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }} className="gap-1"><Copy className="w-3 h-3" /> Copy All</Button><Button variant="outline" size="sm" onClick={saveContent} className="gap-1"><Save className="w-3 h-3" /> Save</Button><Button size="sm" onClick={generate} disabled={loading} className="gap-1"><Sparkles className="w-3 h-3" /> Regenerate</Button></div></CardContent></Card>}
    </div>
  );
}
