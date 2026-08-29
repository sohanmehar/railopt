'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  Train, 
  LogOut, 
  User as UserIcon, 
  ShieldAlert, 
  Radio, 
  Zap, 
  Sliders, 
  Activity, 
  HardDrive, 
  Cpu, 
  FileSpreadsheet, 
  Gauge, 
  ClipboardList, 
  Flame, 
  Truck, 
  FileCheck2, 
  Wrench, 
  RadioTower, 
  Clock, 
  Layers, 
  Menu 
} from 'lucide-react';

function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, token, logout, isLoading } = useAuth();
  const { fontSizeScale, t } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'console';
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1EDE3] flex items-center justify-center text-[#667085] text-[12px] font-mono">
        Authenticating with CRIS Central Bus...
      </div>
    );
  }

  if (!user) return null;

  // RBAC Security Route Verification
  const isAuthorizedRoute = () => {
    if (pathname.startsWith('/portal/controller')) return user.role === 'CONTROLLER';
    if (pathname.startsWith('/portal/admin')) return user.role === 'SR_DOM';
    if (pathname.startsWith('/portal/civil')) return user.role === 'CIVIL_ENG';
    if (pathname.startsWith('/portal/snt')) return user.role === 'SNT_ENG';
    if (pathname.startsWith('/portal/trd')) return user.role === 'TRD_ENG';
    return true;
  };

  const getAuthorizedPath = () => {
    switch (user.role) {
      case 'CONTROLLER': return '/portal/controller';
      case 'SR_DOM': return '/portal/admin';
      case 'CIVIL_ENG': return '/portal/civil';
      case 'SNT_ENG': return '/portal/snt';
      case 'TRD_ENG': return '/portal/trd';
      default: return '/login';
    }
  };

  if (!isAuthorizedRoute()) {
    return (
      <div className="min-h-screen bg-[#F1EDE3] text-[#344054] flex flex-col font-['Inter']">
        <Navbar />
        <main className="p-8 max-w-xl mx-auto my-auto text-center space-y-4">
          <div className="p-6 bg-[#FFFFFF] border border-[#9A111F]/30 rounded-2xl shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#9A111F]/10 text-[#9A111F] flex items-center justify-center mx-auto border border-[#9A111F]/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-[16px] font-bold text-[#21304D]">CRIS Operational Security — Restricted Access (403)</h2>
            <p className="text-[12px] text-[#667085] leading-relaxed">
              Officer <strong className="text-[#21304D]">{user.name}</strong> ({user.designation}), your CRIS credentials are authorized exclusively for the <strong className="text-[#9A111F]">{user.department}</strong> workspace. Access to other department operational desks is restricted under Indian Railways G&SR Rule 14.02.
            </p>
            <div className="p-3 bg-[#F1EDE3] rounded-xl border border-[#D8D2C7] text-[11px] font-mono text-[#667085] text-left space-y-1">
              <div>Attempted Route: <span className="text-[#9A111F] font-bold">{pathname}</span></div>
              <div>Security Log Audit ID: <span className="text-[#21304D] font-bold">SEC-AUDIT-2026-9941</span></div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => router.push(getAuthorizedPath())}
                className="w-full bg-[#21304D] hover:bg-[#182338] text-white py-2.5 rounded-xl text-[12px] font-semibold transition-all shadow-xs cursor-pointer"
              >
                Return to Authorized {user.department} Desk
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Department-specific specialized toolbars
  const getSidebarConfig = () => {
    switch (user.role) {
      case 'TRD_ENG':
        return {
          title: 'TRD / 25kV OHE',
          badgeColor: 'text-[#9A111F] border-[#9A111F]/30 bg-[#9A111F]/10',
          menu: [
            { id: 'console', key: 'demand_console', label: 'Demand & Feed Console', icon: Zap },
            { id: 'elementary_sections', key: 'elementary_sections', label: '25kV Elementary Sections', icon: Flame },
            { id: 'tower_wagon', key: 'tower_wagon', label: 'Tower Wagon Deployment', icon: Truck },
            { id: 'earth_rods', key: 'earth_rods', label: 'OHE Earth Rod Registers', icon: ClipboardList },
            { id: 'ptw', key: 'ptw_permit', label: 'Digital PTW (Power Permit)', icon: FileCheck2 },
          ]
        };
      case 'CIVIL_ENG':
        return {
          title: 'P-WAY CIVIL',
          badgeColor: 'text-[#287A62] border-[#287A62]/30 bg-[#287A62]/10',
          menu: [
            { id: 'console', key: 'track_defects', label: 'Track Demand & Defects', icon: ShieldAlert },
            { id: 'machinery', key: 'machinery', label: 'CSM / BCM Machinery', icon: Truck },
            { id: 'usfd_flaws', key: 'usfd_flaws', label: 'USFD Rail Flaw Log', icon: Activity },
            { id: 'tsr_slips', key: 'tsr_slips', label: 'TSR Caution Slips (T/409)', icon: FileSpreadsheet },
            { id: 'pway_registry', key: 'pway_registry', label: 'Permanent Way Registry', icon: Wrench },
          ]
        };
      case 'SNT_ENG':
        return {
          title: 'SIGNAL & TELECOM',
          badgeColor: 'text-[#21304D] border-[#21304D]/30 bg-[#21304D]/10',
          menu: [
            { id: 'console', key: 'signal_console', label: 'Signal Telemetry Console', icon: Radio },
            { id: 'points', key: 'point_machines', label: 'Point Machine Registry', icon: Cpu },
            { id: 'track_circuits', key: 'track_circuits', label: 'Track Circuit Voltages', icon: Gauge },
            { id: 't351', key: 't351_form', label: 'Disconnection Form (T/351)', icon: FileCheck2 },
            { id: 'axle_counters', key: 'axle_counters', label: 'Axle Counter Diagnostics', icon: RadioTower },
          ]
        };
      case 'CONTROLLER':
        return {
          title: 'PUNE COA',
          badgeColor: 'text-[#9A111F] border-[#9A111F]/30 bg-[#9A111F]/10',
          menu: [
            { id: 'console', key: 'time_space_chart', label: 'Time-Space String Chart', icon: Clock },
            { id: 'block_queue', key: 'corridor_queue', label: 'Corridor Block Queue', icon: Layers },
            { id: 'delay_sandbox', key: 'delay_sandbox', label: 'Real-time Delay Sandbox', icon: RadioTower },
            { id: 'sanctions', key: 'sanction_gateway', label: 'Block Sanction Gateway', icon: FileCheck2 },
          ]
        };
      case 'SR_DOM':
        return {
          title: 'DIVISION COMMAND',
          badgeColor: 'text-[#21304D] border-[#21304D]/30 bg-[#21304D]/10',
          menu: [
            { id: 'console', key: 'operations_overview', label: 'Operations Overview', icon: Sliders },
            { id: 'policy_tuner', key: 'policy_tuner', label: 'CP-SAT Policy Tuner', icon: Cpu },
            { id: 'ledger', key: 'corridor_ledger', label: 'Division Corridor Ledger', icon: FileSpreadsheet },
            { id: 'analytics', key: 'punctuality_analytics', label: 'Punctuality Analytics', icon: Gauge },
          ]
        };
      default:
        return {
          title: 'RAILWAY DESK',
          badgeColor: 'text-[#667085] border-[#D8D2C7] bg-[#FFFFFF]',
          menu: []
        };
    }
  };

  const config = getSidebarConfig();

  const handleMenuClick = (tabId: string) => {
    router.push(`${pathname}?tab=${tabId}`);
  };

  return (
    <div className={`min-h-screen bg-[#F1EDE3] text-[#344054] flex overflow-hidden font-['Inter'] transition-all ${
      fontSizeScale === 'sm' ? 'text-[92%]' : fontSizeScale === 'lg' ? 'text-[108%]' : 'text-[100%]'
    }`}>
      
      {/* Collapsible Sidebar */}
      <aside
        className={`bg-[#FFFFFF] border-r border-[#D8D2C7] flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out shadow-xs ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-3 space-y-5">
          
          {/* Header & Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 text-[#667085] hover:text-[#344054] hover:bg-[#F1EDE3] rounded-xl transition-all shrink-0"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>

            {!collapsed && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="p-1.5 rounded-lg bg-[#9A111F]/10 border border-[#9A111F]/20 text-[#9A111F] shrink-0">
                  <Train className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="font-bold text-[14px] text-[#21304D] tracking-tight block truncate">RailBlock AI</span>
                  <span className="text-[10px] text-[#667085] block truncate">CRIS • {user.division} DIV</span>
                </div>
              </div>
            )}
          </div>

          {/* Department Workspace Section */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider">
                  {t('workspace')}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium border ${config.badgeColor}`}>
                  {user.department}
                </span>
              </div>
            )}

            {/* Interactive Sidebar Buttons */}
            <div className="space-y-1">
              {config.menu.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const displayLabel = t(item.key) || item.label;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    type="button"
                    title={collapsed ? displayLabel : undefined}
                    className={`w-full flex items-center rounded-xl text-[12px] font-medium transition-all ${
                      collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5 text-left'
                    } ${
                      isActive
                        ? 'bg-[#21304D] text-white border border-[#21304D] font-semibold shadow-xs'
                        : 'text-[#667085] hover:text-[#344054] hover:bg-[#F1EDE3] cursor-pointer border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#9A111F]'}`} />
                    {!collapsed && <span className="truncate">{displayLabel}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telemetry Status Box */}
          {!collapsed && (
            <div className="p-3 bg-[#FFFFFF] border border-[#D8D2C7] rounded-xl space-y-2 text-[10px] font-mono shadow-xs">
              <div className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider mb-1">
                {t('subsystem_link')}
              </div>
              <div className="flex items-center justify-between text-[#667085]">
                <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-[#21304D]" /> CP-SAT</span>
                <span className="text-[#287A62] font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-[#667085]">
                <span className="flex items-center gap-1.5"><HardDrive className="w-3 h-3 text-[#21304D]" /> Neon DB</span>
                <span className="text-[#287A62] font-bold">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between text-[#667085]">
                <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-[#21304D]" /> TMS/COA</span>
                <span className="text-[#287A62] font-bold">ACTIVE</span>
              </div>
            </div>
          )}

        </div>

        {/* User Card & Logout Button */}
        <div className="p-3 border-t border-[#D8D2C7] bg-[#FFFFFF]">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 rounded-xl bg-[#F1EDE3] border border-[#D8D2C7] text-[#21304D] shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <div className="text-[12px] font-semibold text-[#344054] truncate">{user.name}</div>
                  <div className="text-[10px] text-[#667085] truncate">{user.designation}</div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={logout}
                className="p-2 text-[#667085] hover:text-[#9A111F] hover:bg-[#9A111F]/10 border border-transparent hover:border-[#9A111F]/20 rounded-xl transition-all"
                title="Logout from System"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#F1EDE3]">
        <Navbar />
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F1EDE3] flex items-center justify-center text-[#667085] text-[12px] font-mono">
        Loading RailBlock AI Portal...
      </div>
    }>
      <PortalLayoutContent>{children}</PortalLayoutContent>
    </Suspense>
  );
}