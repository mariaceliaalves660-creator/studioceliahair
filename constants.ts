import { Service, Product, Staff, Client, Appointment, Sale, Expense, StaffPayment, RegisterSession, Order, SocialUser, HairQuote, HairCalcConfig, AdminUser, Course, Student, LoyaltyReward, PointRedemption, StoredHair } from './types';

export const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: 'Retirada de Mega', price: 150, category: 'Mega Hair' },
  { id: 's2', name: 'Aplicação de Mega', price: 300, category: 'Mega Hair' },
  { id: 's3', name: 'Manutenção de Mega', price: 200, category: 'Mega Hair' },
  { id: 's4', name: 'Unha (Mão)', price: 35, category: 'Manicure' },
  { id: 's5', name: 'Unha (Pé)', price: 35, category: 'Manicure' },
  { id: 's6', name: 'Cílios Fio a Fio', price: 120, category: 'Estética' },
  { id: 's7', name: 'Coloração', price: 150, category: 'Cabelo' },
  { id: 's8', name: 'Descoloração', price: 250, category: 'Cabelo' },
  { id: 's9', name: 'Selagem', price: 180, category: 'Cabelo' },
  { id: 's10', name: 'Botox Capilar', price: 120, category: 'Cabelo' },
  { id: 's11', name: 'Hidratação Profunda', price: 80, category: 'Cabelo' },
  { id: 's12', name: 'Escova', price: 45, category: 'Cabelo' },
  { id: 's13', name: 'Chapinha', price: 30, category: 'Cabelo' },
  { id: 's14', name: 'Penteado', price: 150, category: 'Cabelo' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Shampoo Hidratante 1L', category: 'Lavatório', price: 89.90, stock: 5, unit: 'un', imageUrl: 'https://picsum.photos/200/200?random=1' },
  { id: 'p2', name: 'Máscara Reconstrutora 500g', category: 'Tratamento', price: 120.00, stock: 10, unit: 'un', imageUrl: 'https://picsum.photos/200/200?random=2' },
  { id: 'p3', name: 'Óleo Reparador', category: 'Finalização', price: 45.00, stock: 15, unit: 'un', imageUrl: 'https://picsum.photos/200/200?random=3' },
  { id: 'p4', name: 'Tintura Preto 1.0', category: 'Coloração', price: 25.00, stock: 20, unit: 'un', imageUrl: 'https://picsum.photos/200/200?random=4' },
];

// NEW: Initial Courses with Module Structure
export const INITIAL_COURSES: Course[] = [
  { 
    id: 'course-1', 
    title: 'Curso de Mega Hair Profissional', 
    workload: '40 Horas', 
    format: 'Presencial', 
    certificate: 'Sim (Físico e Digital)', 
    materials: 'Apostila + Kit de Agulhas e Linhas', 
    price: 1500.00, 
    active: true,
    imageUrl: 'https://picsum.photos/200/200?random=5',
    modules: [
      {
        id: 'mod-1',
        title: 'Introdução ao Mega Hair',
        lessons: [
          { id: 'les-1', title: 'Boas Vindas e História', type: 'video', url: 'https://www.youtube.com/embed/sample', duration: '10:00' },
          { id: 'les-2', title: 'Apostila - Módulo 1', type: 'pdf', url: '#' }
        ]
      },
      {
        id: 'mod-2',
        title: 'Técnicas de Aplicação',
        lessons: [
          { id: 'les-3', title: 'Preparação do Cabelo', type: 'video', url: 'https://www.youtube.com/embed/sample2', duration: '15:00' }
        ]
      }
    ]
  }
];

// NEW: Initial Students
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    name: 'Aluno Exemplo',
    email: 'aluno@celia.com',
    password: '123',
    phone: '11999999999',
    enrolledCourseIds: ['course-1']
  }
];

export const INITIAL_STAFF: Staff[] = [
  { id: 'st1', name: 'Célia', role: 'cabeleireiro', commissionRate: 50 },
  { id: 'st2', name: 'Ana', role: 'manicure', commissionRate: 40 },
  { id: 'st3', name: 'Beatriz', role: 'cilios', commissionRate: 45 },
  { id: 'st4', name: 'João', role: 'ajudante', commissionRate: 0 }, // Salário fixo provável
];

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Maria Silva', phone: '11999999999', birthday: '15/05', history: [], email: 'maria@email.com', password: '123' },
  { id: 'c2', name: 'Joana Souza', phone: '11988888888', birthday: '20/10', history: [] },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [];
export const INITIAL_SALES: Sale[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_STAFF_PAYMENTS: StaffPayment[] = [];
export const INITIAL_REGISTER_SESSIONS: RegisterSession[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_SOCIAL_USERS: SocialUser[] = [];
export const INITIAL_HAIR_QUOTES: HairQuote[] = [];
export const INITIAL_LOYALTY_REWARDS: LoyaltyReward[] = [];
export const INITIAL_POINT_REDEMPTIONS: PointRedemption[] = [];
export const INITIAL_STORED_HAIR: StoredHair[] = []; // NEW: Initial Stored Hair

// NEW: Default Admin
export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-master',
    name: 'Maria Célia',
    email: 'mariaceliaalves660@gmail.com',
    password: '@#zozo#@03',
    role: 'superadmin'
  }
];

// --- INITIAL HAIR CONFIG (DATABASE) ---
export const INITIAL_HAIR_CONFIG: HairCalcConfig = {
  textures: [
    { id: 't1', label: 'Cacheado', value: 'Cacheado', price: 150, enabled: true },
    { id: 't2', label: 'Liso', value: 'Liso', price: 100, enabled: true },
    { id: 't3', label: 'Ondulado', value: 'Ondulado', price: 100, enabled: true },
  ],
  colors: [
    { id: 'co1', label: 'Loiro', value: 'Loiro', price: 0, enabled: true },
    { id: 'co2', label: 'Castanho Claro', value: 'Castanho Claro', price: 0, enabled: true },
    { id: 'co3', label: 'Castanho Escuro', value: 'Castanho Escuro', price: 0, enabled: true },
    { id: 'co4', label: 'Preto', value: 'Preto', price: 0, enabled: true },
  ],
  conditions: [
    { id: 'c1', label: 'Virgem', value: 'Virgem', price: 60, enabled: true },
    { id: 'c2', label: 'Selagem', value: 'Selagem', price: 20, enabled: true },
    { id: 'c3', label: 'Pintado', value: 'Pintado', price: 20, enabled: true },
  ],
  lengths: [
    { id: 'l40', label: '40 cm', value: 40, price: 0, enabled: true },
    { id: 'l50', label: '50 cm', value: 50, price: 10, enabled: true },
    { id: 'l55', label: '55 cm', value: 55, price: 50, enabled: true },
    { id: 'l60', label: '60 cm', value: 60, price: 100, enabled: true },
    { id: 'l65', label: '65 cm', value: 65, price: 150, enabled: true },
    { id: 'l70', label: '70 cm', value: 70, price: 200, enabled: true },
    { id: 'l75', label: '75 cm', value: 75, price: 250, enabled: true },
    { id: 'l80', label: '80 cm', value: 80, price: 300, enabled: true },
    { id: 'l90', label: '90 cm', value: 90, price: 350, enabled: true },
    { id: 'l100', label: '100 cm', value: 100, price: 400, enabled: true },
    { id: 'l110', label: '110 cm', value: 110, price: 500, enabled: true },
    { id: 'l120', label: '120 cm', value: 120, price: 600, enabled: true },
  ],
  circumferences: [
    { id: 'ci6', label: '6 cm', value: 6, price: 0, enabled: true },
    { id: 'ci7', label: '7 cm', value: 7, price: 30, enabled: true },
    { id: 'ci8', label: '8 cm', value: 8, price: 50, enabled: true },
    { id: 'ci9', label: '9 cm', value: 9, price: 70, enabled: true },
    { id: 'ci10', label: '10 cm', value: 10, price: 130, enabled: true },
    { id: 'ci11', label: '11 cm', value: 11, price: 150, enabled: true },
    { id: 'ci12', label: '12 cm', value: 12, price: 200, enabled: true },
    { id: 'ci13', label: '13 cm', value: 13, price: 230, enabled: true },
    { id: 'ci14', label: '14 cm', value: 14, price: 270, enabled: true },
    { id: 'ci15', label: '15 cm', value: 15, price: 350, enabled: true },
    { id: 'ci16', label: '16 cm', value: 16, price: 450, enabled: true },
  ],
  qualities: [
    { id: 'q1', label: 'Excelente (Fios Finos)', value: 'Excelente', price: 40, enabled: true },
    { id: 'q2', label: 'Bom (Fios Grossos)', value: 'Bom', price: 20, enabled: true },
    { id: 'q3', label: 'Ruim (Ponta dupla/Frizz)', value: 'Ruim', price: 0, enabled: true },
  ],
  maxPriceLimit: 0,
  blockPurchaseMessage: 'Este cabelo não atende aos requisitos mínimos para compra.',
  
  monthlyGoal: 5000,
  monthlyReward: 'Bônus R$ 200,00'
};

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const AGE_GROUPS = ['Criança', 'Adolescente', 'Adulto'];