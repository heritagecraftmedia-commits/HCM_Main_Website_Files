import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, ShoppingBag, Users,
  FileText, Brain, Sparkles, PenTool, X,
  GitBranch, Plug, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/hcm',           label: 'Dashboard',        icon: LayoutDashboard },
  { path: '/hcm/sales',     label: 'Sales Engine',     icon: ShoppingBag },
  { path: '/hcm/content',   label: 'Content Creator',  icon: PenTool },
  { path: '/hcm/leads',     label: 'Leads',            icon: Users },
  { path: '/hcm/guide',     label: 'Guide Generator',  icon: FileText },
  { path: '/hcm/insights',  label: 'Memory Bank',      icon: Brain },
];

const systemItems = [
  { path: '/hcm/workflows',   label: 'Workflows',   icon: GitBranch },
  { path: '/hcm/connectors',  label: 'Connectors',  icon: Plug },
  { path: '/hcm/action-log',  label: 'Action Log',  icon: Activity },
];

function NavLink({ item, onClose, location }) {
  const isActive = location.pathname === item.path;
  return (
    <Link
      to={item.path}
      onClick={onClose}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
        ${isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}
      `}
    >
      <item.icon className="w-4 h-4" />
      {item.label}
    </Link>
  );
}

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-tight">HCM</h1>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Business Brain</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-3 space-y-1">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} onClose={onClose} location={location} />
            ))}
          </nav>
          <div className="px-3 pt-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-1">System</p>
            {systemItems.map((item) => (
              <NavLink key={item.path} item={item} onClose={onClose} location={location} />
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-border">
          <Link to="/qr" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-all">
            <Megaphone className="w-4 h-4" />
            QR Landing Page
          </Link>
        </div>
      </aside>
    </>
  );
}
