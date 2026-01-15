import { Appointment, Service } from '@/types';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export const getAppointmentServices = (appointment: Appointment) => {
  if (appointment.services && appointment.services.length > 0) {
    return appointment.services as Partial<Service>[];
  }
  if (appointment.service) {
    return [appointment.service as Partial<Service>];
  }
  return [];
};

export const getAppointmentTotal = (appointment: Appointment) => {
  const services = getAppointmentServices(appointment);
  const servicesTotal = services.reduce((sum, service) => sum + (Number(service.price) || 0), 0);
  const basePrice = servicesTotal > 0 ? servicesTotal : (appointment.price || 0);
  const extraCost = appointment.extraCost || 0;
  return basePrice + extraCost;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getPaymentProgress = (paidAmount: number, total: number) => {
  if (!total || total <= 0) return 0;
  const progress = (paidAmount / total) * 100;
  return Math.max(0, Math.min(100, progress));
};

export const getPaymentInfo = (appointment: Appointment, now: Date = new Date()) => {
  const total = getAppointmentTotal(appointment);
  const paidAmount = Math.min(Number(appointment.paidAmount || 0), total);
  const remaining = Math.max(0, total - paidAmount);
  const status: PaymentStatus = paidAmount >= total
    ? 'paid'
    : paidAmount > 0
      ? 'partial'
      : 'unpaid';
  const todayStart = startOfDay(now);
  const appointmentStart = startOfDay(appointment.date);
  const isOverdue = appointmentStart < todayStart && remaining > 0;
  const overdueDays = isOverdue
    ? Math.floor((todayStart.getTime() - appointmentStart.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    status,
    total,
    paidAmount,
    remaining,
    progress: getPaymentProgress(paidAmount, total),
    isOverdue,
    overdueDays,
  };
};
