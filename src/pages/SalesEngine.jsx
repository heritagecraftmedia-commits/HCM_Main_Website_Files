import React, { useState } from 'react';
import { db } from '@/api/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, Copy, Save, ShoppingBag, Mic, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
async function invokeLLM(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }) });
  const data = await response.json();
  return data.content?.map(b => b.text || '').join('') || '';
}
export default function SalesEngine() {
  const [product, setProduct] = useState('');
  const [problem, setProblem] = useState('');
  const [pitchResult, setPitchResult] = useState(null);
  const [salesResult, setSalesResult] = useState(null);
  const [loading, setLoading] = useState({ pitch: false, sales: false });
  const generatePitch = async () => { if (!product) return toast.error('Enter your product first'); setLoading(p => ({ ...p, pitch: true })); try { const result = await invokeLLM(`Create a natural, friendly stall pitch for a market stall.\nProduct: ${product}\nOutput:\n1. 10-15 second pitch\n2. Friendly version\n3. Fun attention-grabbing version\nRules: not salesy, easy to remember, human sounding, include emojis`); setPitchResult(result); } catch { toast.error('Failed to generate pitch'); } finally { setLoading(p => ({ ...p, pitch: false })); } };
  const generateSalesTips = async () => { setLoading(p => ({ ...p, sales: true })); try { const result = await invokeLLM(`Help improve sales at a craft stall.\n${problem ? `Challenge: ${problem}` : ''}\n${product ? `Product: ${product}` : ''}\n1. 3 reasons customers may NOT be buying\n2. 5 quick fixes for today\n3. 10-second pitch\n4. One upsell idea\n5. One visual improvement\nKeep fast, simple, actionable, use emojis`); setSalesResult(result); } catch { toast.error('Failed to generate sales tips'); } finally { setLoading(p => ({ ...p, sales: false })); } };
  const saveContent = async (contentType, title, content) => { try { await db.entities.GeneratedContent.create({ content_type: contentType, title, content, status: 'draft' }); toast.success('Saved!'); } catch { toast.error('Failed to save'); } };
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div><h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3"><ShoppingBag className="w-7 h-7 text-primary" />Sales Engine</h1><p className="text-muted-foreground mt-1">Generate pitches, fix sales issues, boost revenue</p></div>
      <Card className="p-5 space-y-4"><Input placeholder="What's your product? e.g. Handmade candles..." value={product} onChange={(e) => setProduct(e.target.value)} /><Textarea placeholder="Any specific challenge? e.g. People look but don't buy..." value={problem} onChange={(e) => setProblem(e.target.value)} className="h-20" /></Card>
      <Tabs defaultValue="pitch">
        <TabsList className="grid grid-cols-2 w-full max-w-md"><TabsTrigger value="pitch" className="gap-2"><Mic className="w-4 h-4" /> Pitch Creator</TabsTrigger><TabsTrigger value="sales" className="gap-2"><TrendingUp className="w-4 h-4" /> Sales Fixer</TabsTrigger></TabsList>
        <TabsContent value="pitch" className="mt-4"><Card><CardContent className="p-5">{!pitchResult && !loading.pitch && <div className="text-center py-6"><Mic className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground text-sm mb-4">Enter your product above</p><Button onClick={generatePitch} className="gap-2"><Sparkles className="w-4 h-4" /> Generate Pitch</Button></div>}{loading.pitch && <div className="text-center py-6"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>}{pitchResult && !loading.pitch && <><div className="prose prose-sm max-w-none"><ReactMarkdown>{pitchResult}</ReactMarkdown></div><div className="flex gap-2 mt-4 flex-wrap"><Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(pitchResult); toast.success('Copied!'); }} className="gap-1"><Copy className="w-3 h-3" /> Copy</Button><Button variant="outline" size="sm" onClick={() => saveContent('pitch', `Pitch — ${product}`, pitchResult)} className="gap-1"><Save className="w-3 h-3" /> Save</Button><Button size="sm" onClick={generatePitch} disabled={loading.pitch} className="gap-1"><Sparkles className="w-3 h-3" /> Regenerate</Button></div></>}</CardContent></Card></TabsContent>
        <TabsContent value="sales" className="mt-4"><Card><CardContent className="p-5">{!salesResult && !loading.sales && <div className="text-center py-6"><TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground text-sm mb-4">Describe your challenge above</p><Button onClick={generateSalesTips} className="gap-2"><Sparkles className="w-4 h-4" /> Fix My Sales</Button></div>}{loading.sales && <div className="text-center py-6"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>}{salesResult && !loading.sales && <><div className="prose prose-sm max-w-none"><ReactMarkdown>{salesResult}</ReactMarkdown></div><div className="flex gap-2 mt-4 flex-wrap"><Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(salesResult); toast.success('Copied!'); }} className="gap-1"><Copy className="w-3 h-3" /> Copy</Button><Button variant="outline" size="sm" onClick={() => saveContent('sales_tips', `Sales tips — ${product || 'general'}`, salesResult)} className="gap-1"><Save className="w-3 h-3" /> Save</Button><Button size="sm" onClick={generateSalesTips} disabled={loading.sales} className="gap-1"><Sparkles className="w-3 h-3" /> Regenerate</Button></div></>}</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
