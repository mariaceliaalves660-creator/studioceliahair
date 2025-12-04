export type UnitType = 'unit' | 'kg' | 'g' | 'piece' | 'un';
export type ViewMode = 'admin' | 'client' | 'social';

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  unitType: UnitType;
  unit?: UnitType; // Legacy support
  image?: string;
  imageUrl?: string;
  images?: string[];
  origin?: 'store' | 'hair_business';
  isOnline?: boolean;
  hairQuoteId?: string;
  location?: string;
  specifications?: Record<string, any>;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes?: number;
  category?: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text' | 'upload_video';
  url?: string;
  content?: string;
  duration?: string;
  fileName?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  workload?: string;
  duration?: string;
  format?: 'Presencial' | 'Online' | 'Misto';
  certificate?: string;
  materials?: string;
  price: number;
  image?: string;
  imageUrl?: string;
  active?: boolean;
  instructor?: string;
  maxStudents?: number;
  modules?: CourseModule[];
  students?: string[];
  specifications?: Record<string, any>;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate?: Date;
  enrolledCourseIds?: string[];
  courses?: string[];
  progress?: Record<string, number>;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  commissionRate: number;
}

export interface Client {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone: string;
  birthday?: string;
  cpf?: string;
  city?: string;
  state?: string;
  history?: Sale[];
  loyaltyPoints?: number;
}

export interface PointRedemption {
  id: string;
  clientId: string;
  rewardId: string;
  rewardTitle: string;
  pointsCost: number;
  date: string;
  code?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceIds: string[];
  staffId: string[];
  date: string;
  time: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdBy?: string;
  createdByName?: string;
}

export interface SaleItem {
  type: 'product' | 'service' | 'course';
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  price: number;
  staffId: string;
  staffName: string;
  origin?: 'store' | 'hair_business';
  category?: string;
}

export interface Sale {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  customerCpf?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'dinheiro' | 'cartao' | 'pix' | 'misto';
  mixedPayment?: {
    cash: number;
    card: number;
  };
  businessUnit?: 'salon' | 'hair_business';
  createdBy?: string;
  createdByName?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  businessUnit?: 'salon' | 'hair_business';
}

export interface StaffPayment {
  id: string;
  staffId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface RegisterSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  totalIncome?: number;
  totalExpenses?: number;
  calculatedBalance?: number;
  withdrawnAmount?: number;
  finalBalance?: number;
  status: 'open' | 'closed';
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerWhatsapp: string;
  customerCpf?: string;
  clientId?: string;
  deliveryType: 'pickup' | 'delivery';
  address?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    price: number;
    type?: 'product' | 'course';
  }[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export interface HairOption {
  id: string;
  label: string;
  value: string | number;
  price: number;
  enabled: boolean;
}

export interface HairQuote {
  id: string;
  date: string;
  clientName: string;
  clientPhone?: string;
  location?: string;
  ageGroup?: string;
  hairType?: string;
  quantity?: number;
  totalPrice?: number;
  options?: Record<string, any>;
  status?: 'pending' | 'confirmed' | 'completed';
}

export interface LoyaltyReward {
  id: string;
  name: string;
  pointsRequired: number;
  description?: string;
  discount?: number;
}
