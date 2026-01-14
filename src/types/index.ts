export type AppointmentStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  notes?: string;
  cars: Car[];
  createdAt: Date;
  totalVisits: number;
}

export interface Car {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  color: string;
  plateNumber?: string;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price?: number;
  category: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  carId: string;
  serviceId: string;
  employeeId?: string;
  date: Date;
  startTime: string;
  status: AppointmentStatus;
  notes?: string;
  price?: number;
}

export interface Employee {
  id: string;
  name: string;
  role: 'admin' | 'employee';
  email: string;
}

export interface Notification {
  id: string;
  appointmentId: string;
  type: 'reminder-24h' | 'reminder-2h' | 'reschedule' | 'custom';
  channel: 'sms' | 'email';
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
}
