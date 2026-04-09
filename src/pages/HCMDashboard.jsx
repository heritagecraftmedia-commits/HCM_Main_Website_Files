import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/api/supabaseClient';
import { Users, Brain, FileText, TrendingUp } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import DailyAssistant from '../components/dashboard/DailyAssistant';
import QuickActions from '../components/dashboard/QuickActions';
import SystemStatus from '../components/dashboard/SystemStatus';

export default function HCMDashboard() {
  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => db.entities.Lead.list('-created_date', 50),
  });
  const { data: insights = [] } = useQuery({
    queryKey: ['insights'],
    queryFn: () => db.entities.BusinessInsight.list('-created_date', 20),
  });
  const { data: content = [] } = useQuery({
    queryKey: ['content'],
    queryFn: () => db.entities.GeneratedContent.list('-created_date', 20),
  });
  const { data: dailyNotes = [] } = useQuery({
    queryKey: ['dailyNotes'],
    queryFn: () => db.entities.DailyNote.list('-date', 10),
  });
  const newLeads = leads.filter(l => l.status === 'new').length;
  const converted = leads.filter(l => l.status === 'converted').length;
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Good {getGreeting()} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your business at a glance</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Leads" value={leads.length} sublabel={`${newLeads} new`} color="primary" />
        <StatCard icon={TrendingUp} label="Converted" value={converted} sublabel="customers" color="accent" />
        <StatCard icon={Brain} label="Insights" value={insights.length} sublabel="saved" color="amber" />
        <StatCard icon={FileText} label="Content" value={content.length} sublabel="pieces created" color="rose" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <DailyAssistant insights={insights} dailyNotes={dailyNotes} />
        <div className="space-y-6">
          <QuickActions />
          <SystemStatus />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
