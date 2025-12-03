

export type UnitType = 'un' | 'kg' | 'g';
export type ViewMode = 'admin' | 'client' | 'social';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: UnitType;
  imageUrl?: string;
  images?: string[]; // NEW: Array for multiple photos (Gallery)
  origin?: 'store' | 'hair_business'; // To separate financial reports
  isOnline?: boolean; // NEW: Flag for online visibility
  hairQuoteId?: string; // NEW: Link back to the origin quote
}

export interface Service {
  id: string;
  name: string;
  price: number; // Estimated price
  durationMinutes?: number;
}

// NEW: Course Content Structure
export interface CourseLesson {
  id: string;
  title: string;
  type: 'video' | 'pdf';
  url: string; // URL for video or PDF
  duration?: string; // e.g. "10:00"
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  workload: string; // e.g. "40h"
  format: 'Presencial' | 'Online' | 'Misto';
  certificate: string; // e.g. "Incluso (Digital)"
  materials: string; // e.g. "Apostila PDF + Kit Prático"
  price: number;
  imageUrl?: string;
  active: boolean;
  maxStudents?: number; // NEW: Capacity limit
  modules?: CourseModule[]; // NEW: Structured Content
}

// NEW: Student Interface
export interface Student {
  id: string;
  name: string;
  email: string; // Login
  password: string; // Login
  phone: string;
  enrolledCourseIds: string[]; // List of IDs of courses they have access to
  progress?: Record<string, number>; // courseId -> percentage
}

export interface Staff {
  id: string;
  name: string;
  role: string; // Changed from union type to string to allow custom text
  commissionRate: number; // Percentage 0-100
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  birthday?: string; // DD/MM
  email?: string; // NEW: For Login
  password?: string; // NEW: For Login
  history: Sale[]; // IDs of past sales/appointments
}

export interface PointRedemption {
  id: string;
  clientId: string;
  rewardId: string;
  rewardTitle: string;
  pointsCost: number;
  date: string;
  code?: string; // NEW: Voucher code generated upon redemption
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string; // Denormalized for display ease
  clientPhone: string;
  serviceId: string;
  staffId: string;
  date: string; // ISO Date string YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface SaleItem {
  type: 'product' | 'service' | 'course'; // Added course
  id: string;
  name: string;
  quantity: number;
  unit?: string; // Added unit support
  price: number; // Unit price
  staffId: string; // Item-specific staff assignment
  staffName: string; // Denormalized for display
  origin?: 'store' | 'hair_business'; // Item-level financial separation
}

export interface Sale {
  id: string;
  date: string; // ISO datetime
  clientId: string;
  clientName: string;
  customerCpf?: string; // NEW: Track CPF for invoices/courses
  items: SaleItem[];
  total: number;
  paymentMethod: 'dinheiro' | 'cartao' | 'pix';
  businessUnit?: 'salon' | 'hair_business'; 
  createdBy?: string; // ID of the user/admin who registered the sale
  createdByName?: string; // Name of the user/admin
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  businessUnit?: 'salon' | 'hair_business'; // NEW: Financial separation
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
  
  // Historical Snapshots (saved when closing)
  totalIncome?: number; 
  totalExpenses?: number;
  calculatedBalance?: number; // Opening + Income - Expenses
  withdrawnAmount?: number; // Sangria
  finalBalance?: number; // Calculated - Withdrawn (What remains/missing)
  
  status: 'open' | 'closed';
}

// NEW: Online Order Interface
export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerWhatsapp: string;
  customerCpf?: string; // NEW: CPF Requirement
  clientId?: string; // NEW: Link to registered client
  deliveryType: 'pickup' | 'delivery';
  address?: string; // Required if delivery
  items: {
    productId: string; // Can be product or course ID
    productName: string;
    quantity: number;
    unit: string;
    price: number;
    type?: 'product' | 'course'; // Track type
  }[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

// NEW: Detailed Hair Configuration Item
export interface HairOption {
  id: string;
  label: string;
  value: string | number;
  price: number;
  enabled: boolean;
}

// NEW: Global Calculator Configuration
export interface HairCalcConfig {
  textures: HairOption[];
  colors: HairOption[];
  conditions: HairOption[];
  lengths: HairOption[];
  circumferences: HairOption[];
  qualities: HairOption[];
  
  // Global Limits
  maxPriceLimit: number;
  blockPurchaseMessage: string;

  // Goals & Rewards
  monthlyGoal: number; // Value in R$ to reach
  monthlyReward: string; // Name of the prize
}

// NEW: Social User (Evaluator)
export interface SocialUser {
  id: string;
  fullName: string;
  cpf: string;
  address: string;
  unit: string; // e.g. "Unidade Centro"
  username: string; // For login
  password: string; // For login
  customConfig?: HairCalcConfig; // NEW: Individual config per user
}

// NEW: Admin User (Management)
export type AdminRole = 'superadmin' | 'manager';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions?: string[]; // List of specific screen IDs the user can access
}

// NEW: Hair Calculation Quote
export interface HairQuote {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  date: string;
  hairType: string;
  length: number;
  circumference: number;
  condition: string;
  quality: string;
  totalValue: number;
  color: string;
  status: 'quoted' | 'purchased' | 'stock' | 'sold'; // Status tracking including lifecycle
  
  // Purchase Details (filled if purchased)
  sellerName?: string;
  sellerCpf?: string;
  sellerPix?: string;
  sellerState?: string; // UF
  sellerAgeGroup?: 'Criança' | 'Adolescente' | 'Adulto';
  photos?: {
    front?: string;
    side?: string;
    back?: string;
  };
}

export interface HairPurchaseRules {
  targetAudience: 'all' | 'specific';
  specificEvaluatorIds: string[];
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  stock?: number; // NEW: Limit number of available rewards
  limitPerClient?: number; // NEW: Limit redemptions per client
}

export interface AppData {
  services: Service[];
  products: Product[];
  courses: Course[]; // NEW
  students: Student[]; // NEW
  staff: Staff[];
  clients: Client[];
  appointments: Appointment[];
  sales: Sale[];
  expenses: Expense[];
  staffPayments: StaffPayment[];
  registerSessions: RegisterSession[];
  orders: Order[];
  socialUsers: SocialUser[]; 
  hairQuotes: HairQuote[]; 
  hairConfig: HairCalcConfig;
  adminUsers: AdminUser[]; 
  loyaltyRewards: LoyaltyReward[];
  pointRedemptions: PointRedemption[]; // NEW
}

export interface AppContextType extends AppData {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  currentUser: SocialUser | null; // Track logged in social user
  setCurrentUser: (user: SocialUser | null) => void;

  currentAdmin: AdminUser | null; // Track logged in admin
  setCurrentAdmin: (user: AdminUser | null) => void;

  loggedInClient: Client | null; // NEW: Track logged in client (Shop)
  setLoggedInClient: (client: Client | null) => void;

  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  removeService: (id: string) => void;
  
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;

  addCourse: (course: Course) => void; // NEW
  updateCourse: (course: Course) => void; // NEW
  removeCourse: (id: string) => void; // NEW

  addStudent: (student: Student) => void; // NEW
  updateStudent: (student: Student) => void; // NEW
  removeStudent: (id: string) => void; // NEW

  addStaff: (staff: Staff) => void;
  updateStaff: (staff: Staff) => void;
  removeStaff: (id: string) => void;

  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  removeClient: (id: string) => void;

  addAppointment: (apt: Appointment) => void;
  updateAppointment: (apt: Appointment) => void;
  
  addSale: (sale: Sale) => void;
  addExpense: (expense: Expense) => void;
  
  addStaffPayment: (payment: StaffPayment) => void;

  // Register management
  openRegister: (amount: number) => void;
  closeRegister: (withdrawAmount: number) => void;
  getCurrentSession: () => RegisterSession | undefined;

  // Order management
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;

  // Social/Hair Mgmt
  addSocialUser: (user: SocialUser) => void;
  updateSocialUser: (user: SocialUser) => void; 
  removeSocialUser: (id: string) => void;
  
  addHairQuote: (quote: HairQuote) => void;
  updateHairQuote: (quote: HairQuote) => void;
  updateHairConfig: (config: HairCalcConfig) => void;
  registerHairPurchase: (quote: HairQuote) => void;

  // Admin Mgmt
  addAdminUser: (user: AdminUser) => void;
  updateAdminUser: (user: AdminUser) => void;
  removeAdminUser: (id: string) => void;

  // Loyalty
  addLoyaltyReward: (reward: LoyaltyReward) => void;
  removeLoyaltyReward: (id: string) => void;
  redeemPoints: (clientId: string, reward: LoyaltyReward) => void; // NEW
}