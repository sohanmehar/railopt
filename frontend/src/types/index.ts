export type UserRole = 'CIVIL_ENG' | 'SNT_ENG' | 'TRD_ENG' | 'CONTROLLER' | 'SR_DOM';

export interface UserPersona {
  id: string;
  name: string;
  role: UserRole;
  department: 'CIVIL' | 'SNT' | 'TRD' | 'OPERATIONS' | 'ADMIN';
  division: string;
  badge: string;
}

export interface DefectItem {
  defect_id: string;
  department: 'CIVIL' | 'SNT' | 'TRD';
  source_system: string;
  section_id: string;
  track_type: string;
  start_km: number;
  end_km: number;
  category: string;
  description: string;
  severity: 'CRITICAL' | 'URGENT' | 'ROUTINE';
  is_overdue: boolean;
  required_duration_mins: number;
  equipment_needed: string;
  post_work_tsr_kmh?: number | null;
  priority_score?: number;
}

export interface BundledTask {
  defect_id: string;
  department: 'CIVIL' | 'SNT' | 'TRD';
  category: string;
  original_duration_mins: number;
  start_km: number;
  end_km: number;
  equipment: string;
}

export interface ScheduledBlock {
  block_id: string;
  section_id: string;
  track_type: string;
  start_km: number;
  end_km: number;
  allocated_start_time: string;
  allocated_end_time: string;
  allocated_duration_mins: number;
  total_individual_duration_mins: number;
  time_saved_mins: number;
  bundled_departments: ('CIVIL' | 'SNT' | 'TRD')[];
  bundled_tasks: BundledTask[];
  priority_score: number;
  estimated_passenger_delay_mins: number;
  estimated_freight_delay_mins: number;
  status: 'PROPOSED' | 'SANCTIONED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
}

export interface OptimizationResult {
  horizon: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  total_blocks_scheduled: number;
  total_tasks_bundled: number;
  total_maintenance_hours_saved: number;
  downtime_reduction_percentage: number;
  blocks: ScheduledBlock[];
}

export interface TrainScheduleItem {
  train_number: string;
  train_name: string;
  train_type: string;
  is_freight: boolean;
  track_type: string;
  priority_tier: number;
  departure_time: string;
  arrival_time: string;
  entry_minute_of_day: number;
  exit_minute_of_day: number;
}