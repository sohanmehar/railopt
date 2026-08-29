'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types';
import { 
  Train, 
  ShieldAlert, 
  Radio, 
  Zap, 
  SlidersHorizontal, 
  Building2,
  LogOut,
  Search,
  Calendar,
  Bell,
  PhoneCall,
  ShieldCheck,
  Eye,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const { fontSizeScale, setFontSizeScale, t } = useUI();
  const router = useRouter();
  const pathname = usePathname();

  // State Management for Interactive Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Real-time Live Clock Effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      
      setCurrentTimeStr(`${day}-${month}-${year} ${hours}:${mins}:${secs} IST`);

      // Set planDate to today's date if empty
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayISO = `${yyyy}-${mm}-${dd}`;
      setPlanDate(prev => prev || todayISO);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Popover & Modal States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Notifications List
  const [notifications] = useState([
    { id: 1, type: 'success', title: 'T/351 Disconnection Granted', desc: 'S&T block BLK-PUNE-2026-001 sanctioned for 01:00-04:30 hrs.', time: '10m ago' },
    { id: 2, type: 'warning', title: '25kV OHE PTW Permit Issued', desc: 'TRD Elementary Section FS-LNL-UP-01 isolated.', time: '25m ago' },
    { id: 3, type: 'danger', title: 'Caution Order T/409 Active', desc: 'Temporary speed restriction 20 km/h at KAD-CCH.', time: '1h ago' }
  ]);

  // Demo Search Database
  const searchItems = [
    { type: 'Block', title: 'BLK-PUNE-2026-001 (KAD-LNL)', link: '/portal/controller?tab=block_queue' },
    { type: 'Block', title: 'BLK-PUNE-2026-002 (DAPD-CCH)', link: '/portal/controller?tab=block_queue' },
    { type: 'Section', title: 'Pune - Lonavala UP Main Line', link: '/portal/controller?tab=console' },
    { type: 'Asset', title: '25kV OHE Elementary Section FS-LNL-UP-01', link: '/portal/trd?tab=elementary_sections' },
    { type: 'Form', title: 'Form S&T (T/351) Disconnection Record', link: '/portal/snt?tab=t351' },
    { type: 'Caution', title: 'T/409 Speed Restriction Order', link: '/portal/civil?tab=tsr_slips' }
  ].filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSkipToContent = () => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlanDateChange = (newDate: string) => {
    setPlanDate(newDate);
  };

  return (
    <header className="w-full border-b border-[#D8D2C7] bg-[#FFFFFF] sticky top-0 z-50 shadow-xs font-['Inter']">
      
      {/* 1. Top Government of India Deep Maroon Header Strip */}
      <div className="bg-[#9A111F] text-white text-[11px] px-4 py-1 flex flex-wrap items-center justify-between font-medium tracking-wide border-b border-[#7D0C18]">
        <div className="flex items-center gap-3">
          <span>{t('gov_india')}</span>
          <span className="opacity-40">•</span>
          <span>{t('rail_ministry')}</span>
          <span className="opacity-40">•</span>
          <span className="font-semibold">CRIS</span>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono opacity-95">
          <button 
            onClick={handleSkipToContent}
            className="cursor-pointer hover:underline hidden md:inline hover:text-[#FFD700] transition-colors"
          >
            {t('skip_to_content')}
          </button>
          <span className="opacity-40 hidden md:inline">|</span>
          
          <button 
            className="flex items-center gap-1 cursor-pointer hover:underline hover:text-[#FFD700] transition-colors hidden sm:flex"
            title="Screen Reader Mode"
          >
            <Eye className="w-3 h-3" /> {t('screen_reader')}
          </button>
          <span className="opacity-40 hidden sm:inline">|</span>

          {/* Real-time Global Font Size Scaling Buttons */}
          <div className="flex items-center gap-1 font-sans font-bold bg-black/20 px-1.5 py-0.5 rounded">
            <button 
              onClick={() => setFontSizeScale('sm')} 
              className={`hover:text-[#FFD700] px-1 rounded transition-colors ${fontSizeScale === 'sm' ? 'bg-[#9A111F] text-[#FFD700]' : ''}`}
              title="Reduce Font Size (Standard)"
            >
              A-
            </button>
            <button 
              onClick={() => setFontSizeScale('md')} 
              className={`hover:text-[#FFD700] px-1 rounded transition-colors ${fontSizeScale === 'md' ? 'bg-[#9A111F] text-[#FFD700]' : ''}`}
              title="Normal Font Size"
            >
              A
            </button>
            <button 
              onClick={() => setFontSizeScale('lg')} 
              className={`hover:text-[#FFD700] px-1 rounded transition-colors ${fontSizeScale === 'lg' ? 'bg-[#9A111F] text-[#FFD700]' : ''}`}
              title="Increase Font Size (Large)"
            >
              A+
            </button>
          </div>
          <span className="opacity-40">|</span>

          <span className="font-mono text-white/90">🕒 {currentTimeStr || '2026-08-30 00:00:00 IST'}</span>
        </div>
      </div>

      {/* 2. Official Ministry & System Emblem Banner Strip */}
      <div className="bg-[#FFFFFF] px-4 py-3 border-b border-[#D8D2C7]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Ashoka Emblem + CRIS Emblem + System Title */}
          <div className="flex items-center gap-3.5">
            {/* National Emblem Visual */}
            <div className="w-9 h-10 bg-[#F1EDE3] border border-[#D8D2C7] rounded-lg flex flex-col items-center justify-center p-1 shrink-0 text-[#9A111F] shadow-xs">
              <div className="font-bold text-[10px] tracking-widest text-[#9A111F] text-center leading-tight font-serif">
                🏛️<br/>
                <span className="text-[6.5px] font-sans font-bold">GOVT OF INDIA</span>
              </div>
            </div>

            {/* Official CRIS Railway Insignia Emblem */}
            <div className="w-9 h-9 rounded-full bg-[#21304D] border-2 border-[#9A111F] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Train className="w-5 h-5 text-[#FFFFFF]" />
            </div>

            {/* System Title Banner */}
            <div>
              <h1 className="font-bold text-[15px] sm:text-[17px] text-[#9A111F] tracking-tight leading-tight">
                {t('bdms_title')}{' '}
                <span className="text-[#21304D] font-mono text-[13px]">(BDMS)</span>
              </h1>
              <div className="font-bold text-[12px] sm:text-[13px] text-[#21304D] tracking-tight leading-tight font-mono">
                {t('coa_subtitle')}
              </div>
              <p className="text-[11px] text-[#667085] mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[#344054]">
                  {t('central_railway')}
                </span>
                <span>•</span>
                <span className="text-[#9A111F] font-medium">
                  {t('pune_division')}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Emergency & Government Portal Verification Badges */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {/* Helpline 139 Trigger */}
            <button 
              onClick={() => setShowEmergencyModal(true)}
              className="bg-[#9A111F]/5 border border-[#9A111F]/20 hover:bg-[#9A111F]/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-right transition-all shadow-xs text-left cursor-pointer"
              title="Click to view Railway Emergency Contacts"
            >
              <PhoneCall className="w-4 h-4 text-[#9A111F] shrink-0" />
              <div>
                <div className="text-[9px] font-bold text-[#9A111F] uppercase tracking-wider">Railway Emergency</div>
                <div className="text-[11px] font-bold text-[#21304D] font-mono">Helpline 139</div>
              </div>
            </button>

            {/* CRIS Security Verification Badge Trigger */}
            <button 
              onClick={() => setShowSecurityModal(true)}
              className="bg-[#287A62]/10 border border-[#287A62]/30 hover:bg-[#287A62]/20 px-3 py-1.5 rounded-xl flex items-center gap-2 text-left transition-all shadow-xs cursor-pointer"
              title="Click to verify CRIS SSL Encryption Security Certificate"
            >
              <ShieldCheck className="w-4 h-4 text-[#287A62] shrink-0" />
              <div>
                <div className="text-[9px] font-bold text-[#287A62] uppercase tracking-wider">CRIS - COA v2.4</div>
                <div className="text-[10px] text-[#344054] font-medium">Secured Government Portal</div>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Operational Utility Sub-Bar */}
      <div className="bg-[#F1EDE3]/70 px-4 py-2 border-b border-[#D8D2C7] relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
          
          {/* Global Task / Section / Block Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#667085]" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, assets, sections, blocks..."
              className="w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-xl pl-9 pr-3 py-1.5 text-[11px] text-[#344054] placeholder-[#667085] focus:outline-none focus:border-[#9A111F] transition-all shadow-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-2.5 text-[#667085] hover:text-[#344054]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Dynamic Search Popover Menu */}
            {searchTerm && (
              <div className="absolute top-full left-0 mt-1 w-full bg-[#FFFFFF] border border-[#D8D2C7] rounded-xl shadow-lg z-50 overflow-hidden text-[11px]">
                <div className="p-2 bg-[#F1EDE3] border-b border-[#D8D2C7] font-semibold text-[#21304D] flex justify-between">
                  <span>Search Results for "{searchTerm}"</span>
                  <span className="font-mono text-[10px]">{searchItems.length} items</span>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-[#D8D2C7]">
                  {searchItems.length > 0 ? (
                    searchItems.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          router.push(item.link);
                          setSearchTerm('');
                        }}
                        className="p-2.5 hover:bg-[#F1EDE3] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="text-[#344054] font-medium">{item.title}</span>
                        <span className="text-[9px] bg-[#9A111F]/10 text-[#9A111F] border border-[#9A111F]/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                          {item.type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-[#667085]">No matching blocks, sections, or forms found.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Utility Widgets: Plan Date, Notification Bell, User Persona Pill */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Plan Date Selector */}
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#D8D2C7] px-3 py-1 rounded-xl text-[11px] font-mono shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-[#9A111F]" />
              <span className="text-[#667085] font-semibold text-[10px]">PLAN DATE:</span>
              <input 
                type="date" 
                value={planDate}
                onChange={(e) => handlePlanDateChange(e.target.value)}
                className="bg-transparent text-[#21304D] font-bold focus:outline-none cursor-pointer"
              />
            </div>

            {/* Notification Bell Popover Trigger */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-[#FFFFFF] border border-[#D8D2C7] hover:bg-[#F1EDE3] rounded-xl text-[#344054] transition-all shadow-xs cursor-pointer"
                title="System Alerts & Notifications"
              >
                <Bell className="w-4 h-4 text-[#21304D]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#9A111F] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#FFFFFF]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Box */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#FFFFFF] border border-[#D8D2C7] rounded-2xl shadow-xl z-50 overflow-hidden text-[12px]">
                  <div className="p-3 bg-[#21304D] text-white flex items-center justify-between">
                    <span className="font-semibold text-[12px]">CRIS Live Dispatch Alerts</span>
                    <button 
                      onClick={() => setUnreadCount(0)} 
                      className="text-[10px] bg-[#9A111F] hover:bg-[#7D0C18] text-white px-2 py-0.5 rounded font-mono font-medium transition-colors"
                    >
                      Clear Badge
                    </button>
                  </div>
                  <div className="divide-y divide-[#D8D2C7] max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-[#F1EDE3]/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#344054] text-[11px]">{n.title}</span>
                          <span className="text-[9px] text-[#667085] font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#667085] mt-1">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center bg-[#F1EDE3] border-t border-[#D8D2C7]">
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] text-[#9A111F] font-semibold hover:underline"
                    >
                      Close Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active User Officer Persona Badge & Switcher */}
            {user && (
              <div className="relative">
                <div 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 bg-[#FFFFFF] border border-[#D8D2C7] hover:border-[#9A111F] px-3 py-1 rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#21304D] text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                    {user.role === 'CONTROLLER' ? 'CO' : user.role === 'SR_DOM' ? 'DOM' : user.role.slice(0, 2)}
                  </div>
                  <div className="text-left hidden xs:block">
                    <div className="text-[12px] font-bold text-[#344054] leading-tight flex items-center gap-1">
                      {user.name}
                      <ChevronDown className="w-3 h-3 text-[#667085]" />
                    </div>
                    <div className="text-[10px] text-[#9A111F] font-medium leading-tight font-mono">
                      {user.designation}
                    </div>
                  </div>
                </div>

                {/* User Profile Popover */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-[#FFFFFF] border border-[#D8D2C7] rounded-2xl shadow-xl z-50 overflow-hidden text-[12px]">
                    <div className="p-3 bg-[#F1EDE3] border-b border-[#D8D2C7] space-y-1">
                      <div className="font-bold text-[#21304D] text-[13px]">{user.name}</div>
                      <div className="text-[11px] text-[#9A111F] font-mono font-medium">{user.designation}</div>
                      <div className="text-[10px] text-[#667085] mt-0.5 flex items-center justify-between font-mono">
                        <span>Division: <strong>{user.division}</strong></span>
                        <span>Dept: <strong>{user.department}</strong></span>
                      </div>
                    </div>

                    <div className="p-3 border-b border-[#D8D2C7] space-y-2 text-[11px] font-mono text-[#667085]">
                      <div className="flex items-center justify-between">
                        <span>CRIS Token:</span>
                        <span className="text-[#287A62] font-bold">ACTIVE (AES-256)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Security Clearance:</span>
                        <span className="text-[#287A62] font-bold">LEVEL-4 VERIFIED</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Session IP:</span>
                        <span className="text-[#21304D] font-bold">10.142.8.44 (RAILNET)</span>
                      </div>
                    </div>

                    <div className="p-2 bg-[#FFFFFF]">
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-[11px] font-bold text-[#9A111F] hover:bg-[#9A111F]/10 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out from CRIS Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* EMERGENCY HELPLINE MODAL */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D8D2C7] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
              <div className="flex items-center gap-2 text-[#9A111F]">
                <PhoneCall className="w-5 h-5" />
                <h3 className="text-[14px] font-bold text-[#21304D]">Railway Emergency Contact Desk</h3>
              </div>
              <button onClick={() => setShowEmergencyModal(false)} className="text-[#667085] hover:text-[#344054]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2.5 text-[12px]">
              <div className="p-3 bg-[#F1EDE3] rounded-xl border border-[#D8D2C7] flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#21304D]">All India Railway Helpline</div>
                  <div className="text-[10px] text-[#667085]">24x7 Security & Assistance</div>
                </div>
                <span className="font-mono font-bold text-[#9A111F] text-[14px]">139</span>
              </div>
              <div className="p-3 bg-[#F1EDE3] rounded-xl border border-[#D8D2C7] flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#21304D]">Pune COA Control Room</div>
                  <div className="text-[10px] text-[#667085]">Chief Controller Desk</div>
                </div>
                <span className="font-mono font-bold text-[#21304D]">020-26123456</span>
              </div>
              <div className="p-3 bg-[#F1EDE3] rounded-xl border border-[#D8D2C7] flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#21304D]">Traction Power Controller (TPC)</div>
                  <div className="text-[10px] text-[#667085]">25kV Emergency Isolation</div>
                </div>
                <span className="font-mono font-bold text-[#21304D]">020-26129876</span>
              </div>
              <div className="p-3 bg-[#F1EDE3] rounded-xl border border-[#D8D2C7] flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#21304D]">Sr. DOM Command Control</div>
                  <div className="text-[10px] text-[#667085]">Divisional Headquarters</div>
                </div>
                <span className="font-mono font-bold text-[#21304D]">020-26121111</span>
              </div>
            </div>

            <button 
              onClick={() => setShowEmergencyModal(false)}
              className="w-full bg-[#21304D] hover:bg-[#182338] text-white py-2 rounded-xl font-semibold text-[12px] transition-colors"
            >
              Close Emergency Directory
            </button>
          </div>
        </div>
      )}

      {/* CRIS SECURITY CERTIFICATE MODAL */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D8D2C7] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-[#D8D2C7] pb-3">
              <div className="flex items-center gap-2 text-[#287A62]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-[14px] font-bold text-[#21304D]">CRIS Security & Compliance Token</h3>
              </div>
              <button onClick={() => setShowSecurityModal(false)} className="text-[#667085] hover:text-[#344054]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-[12px]">
              <div className="p-3 bg-[#287A62]/10 border border-[#287A62]/30 rounded-xl text-[#287A62] font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>SSL AES-256 Bit Encrypted Connection Verified</span>
              </div>
              
              <div className="space-y-1.5 text-[#667085] font-mono text-[11px]">
                <div>Certificate Issuer: <strong className="text-[#21304D]">CRIS CA (Certifying Authority)</strong></div>
                <div>Server Hash: <strong className="text-[#21304D]">SHA256:7f9a8b1c...</strong></div>
                <div>G&SR Compliance: <strong className="text-[#287A62]">VERIFIED (Rule 14.02)</strong></div>
                <div>Session Auth Token: <strong className="text-[#21304D]">CRIS-PA-2026-9941X</strong></div>
              </div>
            </div>

            <button 
              onClick={() => setShowSecurityModal(false)}
              className="w-full bg-[#9A111F] hover:bg-[#7D0C18] text-white py-2 rounded-xl font-semibold text-[12px] transition-colors"
            >
              Acknowledge & Close Security Shield
            </button>
          </div>
        </div>
      )}

    </header>
  );
}