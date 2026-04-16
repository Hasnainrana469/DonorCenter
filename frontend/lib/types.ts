export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';
export type RequestStatus = 'open' | 'in_progress' | 'fulfilled' | 'cancelled';

export interface DonorProfile {
  id: number;
  user: User;
  blood_type: BloodType;
  weight: number;
  age: number;
  is_available: boolean;
  last_donation_date: string | null;
  total_donations: number;
  average_rating: number;
  bio: string;
  distance_km?: number;
}

export interface BloodRequest {
  id: number;
  requester: User;
  blood_type: BloodType;
  units_needed: number;
  urgency: Urgency;
  status: RequestStatus;
  hospital_name: string;
  hospital_address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  patient_name: string;
  contact_phone: string;
  description: string;
  required_by: string | null;
  responses_count: number;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  city: string;
  country: string;
  language: string;
  profile_picture?: string;
  latitude?: number;
  longitude?: number;
  is_phone_verified: boolean;
  is_email_verified: boolean;
}

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  data: Record<string, unknown>;
  created_at: string;
}

export interface BloodStock {
  id: number;
  blood_bank: BloodBank;
  blood_type: BloodType;
  units_available: number;
  units_reserved: number;
  units_free: number;
  status: 'critical' | 'low' | 'moderate' | 'adequate';
}

export interface BloodBank {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  stocks: BloodStock[];
}

export interface Appointment {
  id: number;
  donor: number;
  donor_name: string;
  hospital_name: string;
  hospital_address: string;
  scheduled_date: string;
  status: string;
  notes: string;
}

export interface ChatMessage {
  id: number;
  sender: User;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  participants: User[];
  last_message: ChatMessage | null;
  unread_count: number;
}
