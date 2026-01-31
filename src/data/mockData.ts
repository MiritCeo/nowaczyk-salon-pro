import { Client, Car, Service, Appointment, Employee } from '@/types';

export const mockEmployees: Employee[] = [
  { id: 'emp-1', name: 'Car22 Admin', role: 'admin', email: 'michal@nowaczyk.pl' },
  { id: 'emp-2', name: 'Tomasz Kowalski', role: 'employee', email: 'tomasz@nowaczyk.pl' },
];

export const mockServices: Service[] = [
  { id: 'srv-1', name: 'Mycie podstawowe', description: 'Mycie zewnętrzne + odkurzanie', duration: 45, price: 80, category: 'Mycie' },
  { id: 'srv-2', name: 'Mycie premium', description: 'Pełne mycie wewnętrzne i zewnętrzne', duration: 90, price: 150, category: 'Mycie' },
  { id: 'srv-3', name: 'Detailing wnętrza', description: 'Kompleksowe czyszczenie wnętrza', duration: 180, price: 350, category: 'Detailing' },
  { id: 'srv-4', name: 'Korekta lakieru', description: 'Polerowanie + korekta zarysowań', duration: 480, price: 800, category: 'Detailing' },
  { id: 'srv-5', name: 'Powłoka ceramiczna', description: 'Aplikacja powłoki ochronnej', duration: 300, price: 1500, category: 'Ochrona' },
  { id: 'srv-6', name: 'Pranie tapicerki', description: 'Ekstrakcyjne pranie siedzeń', duration: 120, price: 250, category: 'Pranie' },
];

export const mockCars: Car[] = [
  { id: 'car-1', clientId: 'cli-1', brand: 'BMW', model: 'M3 Competition', color: 'Czarny', plateNumber: 'WPL 12345' },
  { id: 'car-2', clientId: 'cli-1', brand: 'Porsche', model: '911 GT3', color: 'Biały' },
  { id: 'car-3', clientId: 'cli-2', brand: 'Mercedes-Benz', model: 'AMG GT', color: 'Srebrny', plateNumber: 'WA 98765' },
  { id: 'car-4', clientId: 'cli-3', brand: 'Audi', model: 'RS6 Avant', color: 'Szary Nardo' },
  { id: 'car-5', clientId: 'cli-4', brand: 'Volkswagen', model: 'Golf R', color: 'Niebieski' },
];

export const mockClients: Client[] = [
  { 
    id: 'cli-1', 
    firstName: 'Jan', 
    lastName: 'Kowalski', 
    phone: '+48 600 123 456', 
    email: 'jan.kowalski@email.pl',
    notes: 'Stały klient, preferuje poniedziałki',
    cars: [mockCars[0], mockCars[1]],
    createdAt: new Date('2024-01-15'),
    totalVisits: 12
  },
  { 
    id: 'cli-2', 
    firstName: 'Anna', 
    lastName: 'Nowak', 
    phone: '+48 601 234 567', 
    email: 'anna.nowak@email.pl',
    cars: [mockCars[2]],
    createdAt: new Date('2024-02-20'),
    totalVisits: 5
  },
  { 
    id: 'cli-3', 
    firstName: 'Piotr', 
    lastName: 'Wiśniewski', 
    phone: '+48 602 345 678',
    notes: 'Właściciel firmy, flotowe samochody',
    cars: [mockCars[3]],
    createdAt: new Date('2024-03-10'),
    totalVisits: 8
  },
  { 
    id: 'cli-4', 
    firstName: 'Marek', 
    lastName: 'Zieliński', 
    phone: '+48 603 456 789', 
    email: 'marek.z@email.pl',
    cars: [mockCars[4]],
    createdAt: new Date('2024-11-28'),
    totalVisits: 2
  },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const mockAppointments: Appointment[] = [
  { 
    id: 'apt-1', 
    clientId: 'cli-1', 
    carId: 'car-1', 
    serviceId: 'srv-2',
    employeeId: 'emp-1',
    date: today, 
    startTime: '09:00',
    status: 'completed',
    notes: 'Klient prosi o szczególną uwagę na felgi',
    price: 150
  },
  { 
    id: 'apt-2', 
    clientId: 'cli-2', 
    carId: 'car-3', 
    serviceId: 'srv-4',
    employeeId: 'emp-2',
    date: today, 
    startTime: '10:30',
    status: 'in-progress',
    price: 800
  },
  { 
    id: 'apt-3', 
    clientId: 'cli-3', 
    carId: 'car-4', 
    serviceId: 'srv-3',
    employeeId: 'emp-1',
    date: today, 
    startTime: '14:00',
    status: 'scheduled',
    price: 350
  },
  { 
    id: 'apt-4', 
    clientId: 'cli-4', 
    carId: 'car-5', 
    serviceId: 'srv-1',
    employeeId: 'emp-2',
    date: today, 
    startTime: '16:00',
    status: 'scheduled',
    price: 80
  },
  { 
    id: 'apt-5', 
    clientId: 'cli-1', 
    carId: 'car-2', 
    serviceId: 'srv-5',
    employeeId: 'emp-1',
    date: tomorrow, 
    startTime: '09:00',
    status: 'scheduled',
    price: 1500
  },
  { 
    id: 'apt-6', 
    clientId: 'cli-2', 
    carId: 'car-3', 
    serviceId: 'srv-6',
    date: tomorrow, 
    startTime: '11:00',
    status: 'scheduled',
    price: 250
  },
];

export const getClientById = (id: string) => mockClients.find(c => c.id === id);
export const getCarById = (id: string) => mockCars.find(c => c.id === id);
export const getServiceById = (id: string) => mockServices.find(s => s.id === id);
export const getEmployeeById = (id: string) => mockEmployees.find(e => e.id === id);

export const getTodayAppointments = () => {
  const today = new Date();
  return mockAppointments.filter(apt => 
    apt.date.toDateString() === today.toDateString()
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));
};

export const getTomorrowAppointments = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return mockAppointments.filter(apt => 
    apt.date.toDateString() === tomorrow.toDateString()
  );
};

export const getNewClientsCount = (days: number = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return mockClients.filter(c => c.createdAt >= cutoffDate).length;
};

// Get appointment history for a specific client and car
export const getClientCarHistory = (clientId: string, carId?: string) => {
  return mockAppointments
    .filter(apt => apt.clientId === clientId && (carId ? apt.carId === carId : true))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Get all appointments for a client
export const getClientAppointments = (clientId: string) => {
  return mockAppointments
    .filter(apt => apt.clientId === clientId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
};
