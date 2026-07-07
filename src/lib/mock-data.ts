
export interface Visitor {
  id: string;
  name: string;
  documentId: string;
  purpose: string;
  category: string;
  status: 'pending' | 'active' | 'checked-out' | 'denied';
  checkInTime?: string;
  checkOutTime?: string;
  residentName: string;
  unit: string;
  plate?: string;
  company?: string;
}

export interface ScheduledVisit {
  id: string;
  visitorName: string;
  residentName: string;
  torre: string;
  apartamento: string;
  date: string;
  time: string;
  visitType: string;
}

export const MOCK_VISITORS: Visitor[] = [
  {
    id: '1',
    name: 'JUAN PEREZ',
    documentId: '8-999-1234',
    purpose: 'Delivery de comida rápida',
    category: 'Delivery',
    status: 'active',
    checkInTime: new Date().toISOString(),
    residentName: 'Carlos Ruiz',
    unit: 'T1 - 502',
    plate: 'AA1234',
    company: 'PEDIDOSYA'
  },
  {
    id: '2',
    name: 'MARIA SANCHEZ',
    documentId: 'PE-123456',
    purpose: 'Reunion de trabajo con el propietario',
    category: 'Meeting',
    status: 'pending',
    residentName: 'Ana Gomez',
    unit: 'T2 - 101',
  },
  {
    id: '3',
    name: 'ROBERTO DIAZ',
    documentId: '4-777-888',
    purpose: 'Reparación de aire acondicionado',
    category: 'Maintenance',
    status: 'active',
    checkInTime: new Date().toISOString(),
    residentName: 'Pedro Infante',
    unit: 'T1 - 1201',
    plate: '8T-9901',
    company: 'CLIMAS S.A.'
  },
  {
    id: '4',
    name: 'ELENA RODRIGUEZ',
    documentId: 'E-88-222',
    purpose: 'Visita familiar',
    category: 'Social Visit',
    status: 'checked-out',
    checkInTime: '2023-10-24T18:00:00Z',
    checkOutTime: '2023-10-24T22:30:00Z',
    residentName: 'Carlos Ruiz',
    unit: 'T1 - 502',
  }
];

export const MOCK_SCHEDULED_VISITS: ScheduledVisit[] = [
  {
    id: '1',
    visitorName: 'RICARDO VALDES',
    residentName: 'CARLOS RUIZ',
    torre: 'TORRE 1',
    apartamento: '502',
    date: new Date().toISOString(),
    time: '12:00 PM',
    visitType: 'SOCIAL'
  },
  {
    id: '2',
    visitorName: 'LAURA JIMENEZ',
    residentName: 'CARLOS RUIZ',
    torre: 'TORRE 1',
    apartamento: '502',
    date: new Date(Date.now() + 86400000).toISOString(),
    time: '04:00 PM',
    visitType: 'MANTENIMIENTO'
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    visitorName: 'Maria Sanchez',
    purpose: 'Meeting',
    time: '2 mins ago',
    type: 'approval_request'
  },
  {
    id: 'n2',
    visitorName: 'Delivery Express',
    purpose: 'Delivery',
    time: '15 mins ago',
    type: 'active_notice'
  }
];
