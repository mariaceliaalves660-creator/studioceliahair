import React, { createContext, useContext, useState } from 'react';
import { Product, Course, Client, Student, Appointment, HairQuote, Sale, LoyaltyReward } from '../types';

type ViewMode = 'client' | 'admin' | 'social';

interface AppContextType {
  // View Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Navigation
  navigateToScreen?: (screen: string) => void;
  
  // Authentication
  socialUsers: any[];
  setCurrentUser: (user: any) => void;
  currentUser: any;
  adminUsers: any[];
  setCurrentAdmin: (admin: any) => void;
  currentAdmin: any;
  loggedInClient: any;
  setLoggedInClient: (client: any) => void;
  
  // Products & Store
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  
  // Courses
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
  
  // Clients & Students
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  removeClient: (id: string) => void;
  
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  removeStudent: (id: string) => void;
  
  // Orders & Sales
  orders: any[];
  addOrder: (order: any) => void;
  sales: Sale[];
  addSale: (sale: Sale) => void;
  
  // Appointments
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  removeAppointment: (id: string) => void;
  
  // Hair Quotes & Business
  hairQuotes: HairQuote[];
  addHairQuote: (quote: HairQuote) => void;
  registerHairPurchase: (quote: HairQuote) => void;
  hairConfig: any;
  setHairConfig: (config: any) => void;
  
  // Loyalty
  loyaltyRewards: LoyaltyReward[];
  pointRedemptions: any[];
  redeemPoints: (clientId: string, points: number) => void;
  
  [key: string]: any;
}

const DataContext = createContext<AppContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('client');
  
  // Authentication
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loggedInClient, setLoggedInClient] = useState(null);
  
  const [socialUsers, setSocialUsers] = useState([
    { id: '1', username: 'avaliador1', password: '123456', name: 'Avaliador Teste', fullName: 'Avaliador Teste', cpf: '', address: '', unit: '' }
  ]);
  
  const addSocialUser = (user: any) => {
    setSocialUsers([...socialUsers, { ...user, id: Date.now().toString() }]);
  };
  
  const updateSocialUser = (user: any) => {
    setSocialUsers(socialUsers.map(u => u.id === user.id ? user : u));
  };
  
  const removeSocialUser = (id: string) => {
    setSocialUsers(socialUsers.filter(u => u.id !== id));
  };
  
  const [adminUsers, setAdminUsers] = useState([
    { id: '1', email: 'admin@celia.com', password: 'admin123', name: 'Admin Célia', role: 'admin' }
  ]);
  
  // Products
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Cabelo Liso Premium',
      description: 'Cabelo 100% humano de alta qualidade',
      price: 350,
      stock: 10,
      category: 'hair',
      unitType: 'piece' as const,
      image: '',
      location: 'SP',
      specifications: {}
    },
    {
      id: '2',
      name: 'Shampoo Profissional',
      description: 'Shampoo neutro para cabelos',
      price: 45,
      stock: 50,
      category: 'products',
      unitType: 'unit' as const,
      image: '',
      location: 'SP',
      specifications: {}
    }
  ]);
  
  const addProduct = (product: Product) => {
    setProducts([...products, { ...product, id: Date.now().toString() }]);
  };
  
  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };
  
  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };
  
  // Courses
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Curso de Aplicação de Cabelo',
      description: 'Aprenda técnicas profissionais de aplicação',
      price: 500,
      duration: '4 semanas',
      instructor: 'Célia',
      modules: [],
      students: [],
      image: '',
      specifications: {}
    }
  ]);
  
  const addCourse = (course: Course) => {
    setCourses([...courses, { ...course, id: Date.now().toString() }]);
  };
  
  const updateCourse = (course: Course) => {
    setCourses(courses.map(c => c.id === course.id ? course : c));
  };
  
  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };
  
  // Clients
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Cliente Teste',
      email: 'cliente@email.com',
      phone: '11999999999',
      city: 'São Paulo',
      state: 'SP',
      cpf: '123.456.789-00',
      loyaltyPoints: 100
    }
  ]);
  
  const addClient = (client: Client) => {
    setClients([...clients, { ...client, id: Date.now().toString() }]);
  };
  
  const updateClient = (client: Client) => {
    setClients(clients.map(c => c.id === client.id ? client : c));
  };
  
  const removeClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };
  
  // Students
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Aluno Teste',
      email: 'aluno@email.com',
      phone: '11999999999',
      registrationDate: new Date(),
      courses: [],
      progress: {}
    }
  ]);
  
  const addStudent = (student: Student) => {
    setStudents([...students, { ...student, id: Date.now().toString() }]);
  };
  
  const updateStudent = (student: Student) => {
    setStudents(students.map(s => s.id === student.id ? student : s));
  };
  
  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };
  
  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  
  const addOrder = (order: any) => {
    setOrders([...orders, { ...order, id: Date.now().toString() }]);
  };
  
  const updateOrder = (order: any, adminId?: string, adminName?: string) => {
    // Se o pedido foi aceito/concluído, registrar no caixa e adicionar pontos
    if (order.status === 'completed') {
      // Encontrar o cliente
      const client = clients.find(c => c.email === order.customerEmail || c.phone === order.customerWhatsapp);
      
      // Adicionar venda no caixa
      const newSale = {
        id: `sale-${Date.now()}`,
        date: new Date().toISOString(),
        items: order.items.map((item: any) => ({
          ...item,
          type: 'product',
          id: item.productId || `prod-${Date.now()}`,
          name: item.productName,
          staffId: adminId || ''
        })),
        total: order.total,
        paymentMethod: order.deliveryType === 'delivery' ? 'pix' : 'dinheiro',
        clientId: client?.id,
        createdBy: adminId,
        createdByName: adminName || 'Admin'
      };
      
      setSales([...sales, newSale]);
      
      // Adicionar pontos de fidelidade (1 ponto por R$1)
      if (client) {
        const pointsToAdd = Math.floor(order.total);
        // Pontos são calculados automaticamente nas telas de cliente baseado em sales
      }
    }
    
    setOrders(orders.map(o => o.id === order.id ? order : o));
  };
  
  const removeOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };
  
  // Stored Hair
  const [storedHair, setStoredHair] = useState<any[]>([]);
  
  const addStoredHair = (hair: any) => {
    setStoredHair([...storedHair, { ...hair, id: Date.now().toString() }]);
  };
  
  // Cashier Sessions
  const [cashierSessions, setCashierSessions] = useState<any[]>([]);
  
  const getCurrentSession = () => {
    return cashierSessions.find(s => s.status === 'open');
  };
  
  const openRegister = (openingAmount: number) => {
    const newSession = {
      id: Date.now().toString(),
      openedAt: new Date().toISOString(),
      openedBy: currentAdmin?.name || 'Admin',
      openingBalance: openingAmount,
      status: 'open'
    };
    setCashierSessions([...cashierSessions, newSession]);
  };
  
  const closeRegister = (withdrawAmount: number) => {
    setCashierSessions(cashierSessions.map(s => 
      s.status === 'open' 
        ? { ...s, status: 'closed', closedAt: new Date().toISOString(), closedBy: currentAdmin?.name || 'Admin', withdrawAmount }
        : s
    ));
  };
  
  // Sales & Expenses
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  const addSale = (sale: Sale) => {
    setSales([...sales, { ...sale, id: Date.now().toString() }]);
  };
  
  const addExpense = (expense: any) => {
    setExpenses([...expenses, { ...expense, id: Date.now().toString() }]);
  };
  
  // Services
  const [services, setServices] = useState<any[]>([]);
  
  const addService = (service: any) => {
    setServices([...services, { ...service, id: Date.now().toString() }]);
  };
  
  const updateService = (service: any) => {
    setServices(services.map(s => s.id === service.id ? service : s));
  };
  
  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };
  
  // Staff
  const [staff, setStaff] = useState<any[]>([]);
  const [staffPayments, setStaffPayments] = useState<any[]>([]);
  
  const addStaff = (member: any) => {
    setStaff([...staff, { ...member, id: Date.now().toString() }]);
  };
  
  const updateStaff = (member: any) => {
    setStaff(staff.map(s => s.id === member.id ? member : s));
  };
  
  const removeStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
  };
  
  const addStaffPayment = (payment: any) => {
    setStaffPayments([...staffPayments, { ...payment, id: Date.now().toString() }]);
  };
  
  // Admin Users
  const addAdminUser = (admin: any) => {
    setAdminUsers([...adminUsers, { ...admin, id: Date.now().toString() }]);
  };
  
  const updateAdminUser = (admin: any) => {
    setAdminUsers(adminUsers.map(a => a.id === admin.id ? admin : a));
  };
  
  const removeAdminUser = (id: string) => {
    setAdminUsers(adminUsers.filter(a => a.id !== id));
  };
  
  // Loyalty Rewards
  const addLoyaltyReward = (reward: any) => {
    // Not implemented yet
  };
  
  const removeLoyaltyReward = (id: string) => {
    // Not implemented yet
  };
  
  // Register Sessions (for courses)
  const registerSessions = (sessions: any[]) => {
    // Not implemented yet
  };
  
  // Reset Data
  const resetTransactionalData = () => {
    setSales([]);
    setExpenses([]);
    setAppointments([]);
    setHairQuotes([]);
  };
  
  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const addAppointment = (appointment: Appointment) => {
    setAppointments([...appointments, { ...appointment, id: Date.now().toString() }]);
  };
  
  const updateAppointment = (appointment: Appointment) => {
    setAppointments(appointments.map(a => a.id === appointment.id ? appointment : a));
  };
  
  const removeAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };
  
  // Hair Quotes
  const [hairQuotes, setHairQuotes] = useState<HairQuote[]>([]);
  const [hairConfig, setHairConfig] = useState({
    textures: [
      { value: 'liso', label: 'Liso', price: 100, enabled: true },
      { value: 'ondulado', label: 'Ondulado', price: 120, enabled: true },
      { value: 'cacheado', label: 'Cacheado', price: 150, enabled: true },
      { value: 'crespo', label: 'Crespo', price: 180, enabled: true }
    ],
    colors: [
      { value: 'preto', label: 'Preto', price: 0, enabled: true },
      { value: 'castanho', label: 'Castanho', price: 20, enabled: true },
      { value: 'loiro', label: 'Loiro', price: 50, enabled: true }
    ],
    conditions: [
      { value: 'novo', label: 'Novo/Excelente', price: 100, enabled: true },
      { value: 'usado', label: 'Usado/Bom', price: 50, enabled: true }
    ],
    lengths: [
      { value: 30, label: '30cm', price: 50, enabled: true },
      { value: 40, label: '40cm', price: 80, enabled: true },
      { value: 50, label: '50cm', price: 120, enabled: true },
      { value: 60, label: '60cm+', price: 180, enabled: true }
    ],
    circumferences: [
      { value: 50, label: 'Pequena (50cm)', price: 30, enabled: true },
      { value: 55, label: 'Média (55cm)', price: 50, enabled: true },
      { value: 60, label: 'Grande (60cm)', price: 80, enabled: true }
    ],
    qualities: [
      { value: 'basica', label: 'Básica', price: 0, enabled: true },
      { value: 'premium', label: 'Premium', price: 100, enabled: true },
      { value: 'luxo', label: 'Luxo', price: 200, enabled: true }
    ],
    maxPriceLimit: 1000,
    monthlyGoal: 5000
  });
  
  const addHairQuote = (quote: HairQuote) => {
    setHairQuotes([...hairQuotes, { ...quote, id: Date.now().toString() }]);
  };
  
  const registerHairPurchase = (quote: HairQuote) => {
    addHairQuote(quote);
  };
  
  // Loyalty Rewards
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyReward[]>([
    {
      id: '1',
      name: 'Desconto 10%',
      pointsRequired: 100,
      description: 'Desconto de 10% em próxima compra'
    }
  ]);
  
  const [pointRedemptions, setPointRedemptions] = useState<any[]>([]);
  
  const redeemPoints = (clientId: string, points: number) => {
    setPointRedemptions([...pointRedemptions, { clientId, points, date: new Date() }]);
  };

  const value: AppContextType = {
    // View Mode
    viewMode,
    setViewMode,
    
    // Authentication
    socialUsers,
    addSocialUser,
    updateSocialUser,
    removeSocialUser,
    setCurrentUser,
    currentUser,
    adminUsers,
    setCurrentAdmin,
    currentAdmin,
    loggedInClient,
    setLoggedInClient,
    
    // Products
    products,
    addProduct,
    updateProduct,
    removeProduct,
    
    // Courses
    courses,
    addCourse,
    updateCourse,
    removeCourse,
    
    // Clients
    clients,
    addClient,
    updateClient,
    removeClient,
    
    // Students
    students,
    addStudent,
    updateStudent,
    removeStudent,
    
    // Orders
    orders,
    addOrder,
    updateOrder,
    removeOrder,
    
    // Sales
    sales,
    addSale,
    expenses,
    addExpense,
    
    // Services
    services,
    addService,
    updateService,
    removeService,
    
    // Staff
    staff,
    addStaff,
    updateStaff,
    removeStaff,
    staffPayments,
    addStaffPayment,
    
    // Stored Hair
    storedHair,
    addStoredHair,
    
    // Cashier Sessions
    cashierSessions,
    getCurrentSession,
    openRegister,
    closeRegister,
    
    // Admin
    addAdminUser,
    updateAdminUser,
    removeAdminUser,
    
    // Appointments
    appointments,
    addAppointment,
    updateAppointment,
    removeAppointment,
    
    // Hair
    hairQuotes,
    addHairQuote,
    registerHairPurchase,
    hairConfig,
    setHairConfig,
    
    // Loyalty
    loyaltyRewards,
    addLoyaltyReward,
    removeLoyaltyReward,
    pointRedemptions,
    redeemPoints,
    
    // Other
    registerSessions,
    resetTransactionalData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): AppContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
};
