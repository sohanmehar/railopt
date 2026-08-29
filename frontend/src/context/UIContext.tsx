'use client';

import React, { createContext, useContext, useState } from 'react';

export type FontSizeScale = 'sm' | 'md' | 'lg';

export interface UIContextType {
  fontSizeScale: FontSizeScale;
  setFontSizeScale: (s: FontSizeScale) => void;
  t: (key: string) => string;
}

const translations: Record<string, string> = {
  // Top Header & Govt Branding
  gov_india: 'Government of India',
  rail_ministry: 'Ministry of Railways',
  cris_name: 'Centre for Railway Information Systems (CRIS)',
  skip_to_content: 'Skip to Main Content',
  screen_reader: 'Screen Reader',
  bdms_title: 'Block & Disconnection Management System',
  coa_subtitle: 'BLOCK & DISCONNECTION MANAGEMENT SYSTEM — COA INTEGRATED',
  central_railway: 'Central Railway',
  pune_division: 'Pune Division (PA)',
  emergency_helpline: 'Railway Emergency Helpline 139',
  secured_portal: 'CRIS - COA v2.4 Secured Government Portal',
  search_placeholder: 'Search tasks, assets, sections, blocks...',
  plan_date: 'PLAN DATE',

  // Sidebar Menu Items
  workspace: 'Workspace',
  subsystem_link: 'Subsystem Link',
  operations_overview: 'Operations Overview',
  time_space_chart: 'Time-Space String Chart',
  corridor_queue: 'Corridor Block Queue',
  delay_sandbox: 'Real-time Delay Sandbox',
  sanction_gateway: 'Block Sanction Gateway',
  demand_console: 'Demand & Feed Console',
  elementary_sections: '25kV Elementary Sections',
  tower_wagon: 'Tower Wagon Deployment',
  earth_rods: 'OHE Earth Rod Registers',
  ptw_permit: 'Digital PTW (Power Permit)',
  track_defects: 'Track Demand & Defects',
  machinery: 'CSM / BCM Machinery',
  usfd_flaws: 'USFD Rail Flaw Log',
  tsr_slips: 'TSR Caution Slips (T/409)',
  pway_registry: 'Permanent Way Registry',
  signal_console: 'Signal Telemetry Console',
  point_machines: 'Point Machine Registry',
  track_circuits: 'Track Circuit Voltages',
  t351_form: 'Disconnection Form (T/351)',
  axle_counters: 'Axle Counter Diagnostics',
  policy_tuner: 'CP-SAT Policy Tuner',
  corridor_ledger: 'Division Corridor Ledger',
  punctuality_analytics: 'Section Punctuality Analytics',

  // Dashboard Common Words & Headers
  submit_block_demand: 'Submit Block Demand (Digital BDMS)',
  telemetry_defect_feed: 'Telemetry Defect Feed',
  lodge_requisition: 'Lodge Formal Requisition',
  commence_field_work: 'Commence Field Work',
  section: 'Section',
  track_line: 'Track Line',
  start_km: 'Start KM',
  end_km: 'End KM',
  duration_mins: 'Duration (mins)',
  elementary_section_id: 'Elementary Section ID',
  ohe_power_block: 'OHE Power Block (PTW)',
  downtime_avoided: 'Downtime Avoided',
  maintenance_hours_saved: 'Track Closure Saved',
  tasks_bundled: 'Tasks Bundled',
  live_coa_operations: 'Live COA Operations',
  simulate_delay: 'Simulate Delay (+35m)',
  re_run: 'Re-run',
  sanction_block: 'Sanction Block',
  safety_dossier: 'Safety Dossier (G&SR)'
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [fontSizeScale, setFontSizeScale] = useState<FontSizeScale>('md');

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <UIContext.Provider value={{ fontSizeScale, setFontSizeScale, t }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
