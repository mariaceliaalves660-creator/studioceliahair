import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Course, Client, Student, Appointment, HairQuote, Sale, LoyaltyReward } from '../types';

type ViewMode = 'client' | 'admin' | 'social';

// LocalStorage Helper Functions
const STORAGE_KEY = 'studioceliahair_data';

const saveToLocalStorage = (key: string, data: any) => {
  try {
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    allData[key] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromLocalStorage = (key: string, defaultValue: any) => {
  try {
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return allData[key] !== undefined ? allData[key] : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

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
  
  const [socialUsers, setSocialUsers] = useState(() => 
    loadFromLocalStorage('socialUsers', [
      { id: '1', username: 'avaliador1', password: '123456', name: 'Avaliador Teste', fullName: 'Avaliador Teste', cpf: '', address: '', unit: '' }
    ])
  );
  
  const addSocialUser = (user: any) => {
    setSocialUsers([...socialUsers, { ...user, id: Date.now().toString() }]);
  };
  
  const updateSocialUser = (user: any) => {
    setSocialUsers(socialUsers.map(u => u.id === user.id ? user : u));
  };
  
  const removeSocialUser = (id: string) => {
    setSocialUsers(socialUsers.filter(u => u.id !== id));
  };
  
  const [adminUsers, setAdminUsers] = useState(() =>
    loadFromLocalStorage('adminUsers', [
      { id: '1', email: 'admin@celia.com', password: 'admin123', name: 'Admin Célia', role: 'superadmin' }
    ])
  );
  
  // Products
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromLocalStorage('products', [
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
    ])
  );
  
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
  const [courses, setCourses] = useState<Course[]>(() =>
    loadFromLocalStorage('courses', [
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
    ])
  );
  
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
  const [clients, setClients] = useState<Client[]>(() =>
    loadFromLocalStorage('clients', [
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
    ])
  );
  
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
  const [students, setStudents] = useState<Student[]>(() =>
    loadFromLocalStorage('students', [
      {
        id: '1',
        name: 'Aluno Teste',
        email: 'aluno@email.com',
        phone: '11999999999',
        registrationDate: new Date(),
        courses: [],
        progress: {}
      }
    ])
  );
  
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
  const [orders, setOrders] = useState<any[]>(() => loadFromLocalStorage('orders', []));
  
  const addOrder = (order: any) => {
    // Decrementar estoque dos produtos imediatamente ao criar o pedido
    order.items.forEach((item: any) => {
      if (item.type === 'product') {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          updateProduct({ ...product, stock: Math.max(0, newStock) });
        }
      }
    });
    
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
    // Restaurar estoque ao excluir pedido pendente
    const order = orders.find(o => o.id === id);
    if (order && order.status === 'pending') {
      order.items.forEach((item: any) => {
        if (item.type === 'product') {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const newStock = product.stock + item.quantity;
            updateProduct({ ...product, stock: newStock });
          }
        }
      });
    }
    
    setOrders(orders.filter(o => o.id !== id));
  };
  
  // Stored Hair
  const [storedHair, setStoredHair] = useState<any[]>(() => loadFromLocalStorage('storedHair', []));
  
  const addStoredHair = (hair: any) => {
    setStoredHair([...storedHair, { ...hair, id: Date.now().toString() }]);
  };
  
  const updateStoredHair = (hair: any) => {
    setStoredHair(storedHair.map(h => h.id === hair.id ? hair : h));
  };
  
  const removeStoredHair = (id: string) => {
    setStoredHair(storedHair.filter(h => h.id !== id));
  };
  
  // Cashier Sessions
  const [cashierSessions, setCashierSessions] = useState<any[]>(() => loadFromLocalStorage('cashierSessions', []));
  
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
  const [sales, setSales] = useState<Sale[]>(() => loadFromLocalStorage('sales', []));
  const [expenses, setExpenses] = useState<any[]>(() => loadFromLocalStorage('expenses', []));
  
  const addSale = (sale: Sale) => {
    setSales([...sales, { ...sale, id: Date.now().toString() }]);
  };
  
  const addExpense = (expense: any) => {
    setExpenses([...expenses, { ...expense, id: Date.now().toString() }]);
  };
  
  // Services
  const [services, setServices] = useState<any[]>(() => loadFromLocalStorage('services', [
    // 💇‍♀️ Cabelos - Cortes e Finalizações
    { id: 's1', name: 'Corte feminino', price: 50, durationMinutes: 40, category: 'cabelos_corte' },
    { id: 's2', name: 'Corte masculino', price: 30, durationMinutes: 30, category: 'cabelos_corte' },
    { id: 's3', name: 'Corte infantil', price: 25, durationMinutes: 25, category: 'cabelos_corte' },
    { id: 's4', name: 'Escova simples', price: 35, durationMinutes: 40, category: 'cabelos_corte' },
    { id: 's5', name: 'Escova modelada', price: 45, durationMinutes: 50, category: 'cabelos_corte' },
    { id: 's6', name: 'Prancha (chapinha)', price: 40, durationMinutes: 45, category: 'cabelos_corte' },
    
    // 🎨 Coloração e Química Capilar
    { id: 's7', name: 'Coloração global', price: 150, durationMinutes: 120, category: 'coloracao' },
    { id: 's8', name: 'Retoque de raiz', price: 80, durationMinutes: 90, category: 'coloracao' },
    { id: 's9', name: 'Luzes', price: 200, durationMinutes: 150, category: 'coloracao' },
    { id: 's10', name: 'Ombré Hair', price: 250, durationMinutes: 180, category: 'coloracao' },
    { id: 's11', name: 'Morena iluminada', price: 220, durationMinutes: 150, category: 'coloracao' },
    { id: 's12', name: 'Californianas', price: 280, durationMinutes: 180, category: 'coloracao' },
    
    // 💆‍♀️ Tratamentos Capilares
    { id: 's13', name: 'Hidratação', price: 60, durationMinutes: 45, category: 'tratamentos' },
    { id: 's14', name: 'Nutrição', price: 70, durationMinutes: 50, category: 'tratamentos' },
    { id: 's15', name: 'Reconstrução', price: 80, durationMinutes: 60, category: 'tratamentos' },
    { id: 's16', name: 'Botox capilar', price: 120, durationMinutes: 90, category: 'tratamentos' },
    { id: 's17', name: 'Cauterização', price: 100, durationMinutes: 75, category: 'tratamentos' },
    
    // 🔥 Alisamentos
    { id: 's18', name: 'Progressiva', price: 180, durationMinutes: 150, category: 'alisamentos' },
    { id: 's19', name: 'Progressiva orgânica', price: 200, durationMinutes: 150, category: 'alisamentos' },
    { id: 's20', name: 'Escova definitiva', price: 220, durationMinutes: 180, category: 'alisamentos' },
    { id: 's21', name: 'Relaxamento', price: 150, durationMinutes: 120, category: 'alisamentos' },
    
    // 💇‍♀️ Mega Hair / Extensões
    { id: 's22', name: 'Mega Hair fio a fio', price: 500, durationMinutes: 300, category: 'mega_hair' },
    { id: 's23', name: 'Mega Hair na fita', price: 400, durationMinutes: 180, category: 'mega_hair' },
    { id: 's24', name: 'Manutenção de Mega Hair', price: 150, durationMinutes: 120, category: 'mega_hair' },
    { id: 's25', name: 'Remoção de Mega Hair', price: 100, durationMinutes: 90, category: 'mega_hair' },
    
    // 👁️ Design de Sobrancelhas
    { id: 's26', name: 'Design de sobrancelha', price: 25, durationMinutes: 20, category: 'sobrancelhas' },
    { id: 's27', name: 'Design com henna', price: 35, durationMinutes: 30, category: 'sobrancelhas' },
    { id: 's28', name: 'Design com tintura', price: 30, durationMinutes: 25, category: 'sobrancelhas' },
    { id: 's29', name: 'Micropigmentação', price: 600, durationMinutes: 180, category: 'sobrancelhas' },
    
    // ✨ Cílios
    { id: 's30', name: 'Extensão de cílios fio a fio', price: 150, durationMinutes: 120, category: 'cilios' },
    { id: 's31', name: 'Volume russo', price: 180, durationMinutes: 150, category: 'cilios' },
    { id: 's32', name: 'Lash lifting (curvatura)', price: 100, durationMinutes: 60, category: 'cilios' },
    { id: 's33', name: 'Manutenção de cílios', price: 80, durationMinutes: 60, category: 'cilios' },
    
    // 💅 Unhas - Manicure e Pedicure
    { id: 's34', name: 'Manicure tradicional', price: 30, durationMinutes: 40, category: 'unhas' },
    { id: 's35', name: 'Pedicure tradicional', price: 35, durationMinutes: 50, category: 'unhas' },
    { id: 's36', name: 'Unha em gel', price: 60, durationMinutes: 90, category: 'unhas' },
    { id: 's37', name: 'Unha decorada', price: 50, durationMinutes: 60, category: 'unhas' },
    { id: 's38', name: 'Alongamento de unhas', price: 80, durationMinutes: 120, category: 'unhas' },
    
    // 💄 Maquiagem
    { id: 's39', name: 'Maquiagem social', price: 80, durationMinutes: 60, category: 'maquiagem' },
    { id: 's40', name: 'Maquiagem para festas', price: 100, durationMinutes: 75, category: 'maquiagem' },
    { id: 's41', name: 'Maquiagem para noivas', price: 200, durationMinutes: 120, category: 'maquiagem' },
    
    // 💆‍♀️ Estética Facial e Corporal
    { id: 's42', name: 'Limpeza de pele', price: 120, durationMinutes: 90, category: 'estetica' },
    { id: 's43', name: 'Drenagem linfática', price: 100, durationMinutes: 60, category: 'estetica' },
    { id: 's44', name: 'Massagem relaxante', price: 90, durationMinutes: 60, category: 'estetica' },
  ]));
  
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
  const [staff, setStaff] = useState<any[]>(() => loadFromLocalStorage('staff', []));
  const [staffPayments, setStaffPayments] = useState<any[]>(() => loadFromLocalStorage('staffPayments', []));
  
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
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadFromLocalStorage('appointments', []));
  
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
  const [hairQuotes, setHairQuotes] = useState<HairQuote[]>(() => loadFromLocalStorage('hairQuotes', []));
  const [hairConfig, setHairConfig] = useState(() => loadFromLocalStorage('hairConfig', {
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
      { value: 40, label: '40cm', price: 50, enabled: true },
      { value: 50, label: '50cm', price: 80, enabled: true },
      { value: 60, label: '60cm', price: 120, enabled: true },
      { value: 70, label: '70cm', price: 160, enabled: true },
      { value: 80, label: '80cm', price: 200, enabled: true },
      { value: 90, label: '90cm', price: 250, enabled: true },
      { value: 100, label: '100cm', price: 300, enabled: true },
      { value: 110, label: '110cm', price: 350, enabled: true },
      { value: 120, label: '120cm', price: 400, enabled: true }
    ],
    circumferences: [
      { value: 6, label: '6cm (Muito Fina)', price: 20, enabled: true },
      { value: 8, label: '8cm (Fina)', price: 30, enabled: true },
      { value: 10, label: '10cm (Média-Fina)', price: 50, enabled: true },
      { value: 12, label: '12cm (Média)', price: 70, enabled: true },
      { value: 14, label: '14cm (Média-Grossa)', price: 90, enabled: true },
      { value: 16, label: '16cm (Grossa)', price: 120, enabled: true }
    ],
    qualities: [
      { value: 'basica', label: 'Básica', price: 0, enabled: true },
      { value: 'premium', label: 'Premium', price: 100, enabled: true },
      { value: 'luxo', label: 'Luxo', price: 200, enabled: true }
    ],
    maxPriceLimit: 1000,
    monthlyGoal: 5000
  }));
  
  const addHairQuote = (quote: HairQuote) => {
    setHairQuotes([...hairQuotes, { ...quote, id: Date.now().toString() }]);
  };
  
  const updateHairQuote = (quote: HairQuote) => {
    setHairQuotes(hairQuotes.map(q => q.id === quote.id ? quote : q));
  };
  
  const approveHairQuote = (quoteId: string) => {
    const quote = hairQuotes.find(q => q.id === quoteId);
    if (quote) {
      const updatedQuote = { ...quote, status: 'stock' as const };
      updateHairQuote(updatedQuote);
      
      // Registrar despesa no fluxo de caixa exclusivo
      const expense = {
        id: `exp-hair-${Date.now()}`,
        date: new Date().toISOString(),
        description: `Compra de cabelo - ${quote.sellerName}`,
        amount: quote.totalValue,
        category: 'Compra de Cabelo',
        businessUnit: 'hair_business'
      };
      addExpense(expense);
    }
  };
  
  const registerHairPurchase = (quote: HairQuote) => {
    addHairQuote(quote);
  };
  
  const updateHairConfig = (config: any) => {
    setHairConfig(config);
  };
  
  // Loyalty Rewards
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyReward[]>(() => 
    loadFromLocalStorage('loyaltyRewards', [
      {
        id: '1',
        name: 'Desconto 10%',
        pointsRequired: 100,
        description: 'Desconto de 10% em próxima compra'
      }
    ])
  );
  
  const [pointRedemptions, setPointRedemptions] = useState<any[]>(() => loadFromLocalStorage('pointRedemptions', []));
  
  const redeemPoints = (clientId: string, points: number) => {
    setPointRedemptions([...pointRedemptions, { clientId, points, date: new Date() }]);
  };

  // Auto-save to localStorage whenever data changes
  useEffect(() => { saveToLocalStorage('products', products); }, [products]);
  useEffect(() => { saveToLocalStorage('courses', courses); }, [courses]);
  useEffect(() => { saveToLocalStorage('clients', clients); }, [clients]);
  useEffect(() => { saveToLocalStorage('students', students); }, [students]);
  useEffect(() => { saveToLocalStorage('appointments', appointments); }, [appointments]);
  useEffect(() => { saveToLocalStorage('sales', sales); }, [sales]);
  useEffect(() => { saveToLocalStorage('expenses', expenses); }, [expenses]);
  useEffect(() => { saveToLocalStorage('services', services); }, [services]);
  useEffect(() => { saveToLocalStorage('staff', staff); }, [staff]);
  useEffect(() => { saveToLocalStorage('orders', orders); }, [orders]);
  useEffect(() => { saveToLocalStorage('socialUsers', socialUsers); }, [socialUsers]);
  useEffect(() => { saveToLocalStorage('adminUsers', adminUsers); }, [adminUsers]);
  useEffect(() => { saveToLocalStorage('hairQuotes', hairQuotes); }, [hairQuotes]);
  useEffect(() => { saveToLocalStorage('hairConfig', hairConfig); }, [hairConfig]);
  useEffect(() => { saveToLocalStorage('loyaltyRewards', loyaltyRewards); }, [loyaltyRewards]);
  useEffect(() => { saveToLocalStorage('pointRedemptions', pointRedemptions); }, [pointRedemptions]);
  useEffect(() => { saveToLocalStorage('cashierSessions', cashierSessions); }, [cashierSessions]);
  useEffect(() => { saveToLocalStorage('staffPayments', staffPayments); }, [staffPayments]);
  useEffect(() => { saveToLocalStorage('storedHair', storedHair); }, [storedHair]);

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
    updateStoredHair,
    removeStoredHair,
    
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
    updateHairQuote,
    approveHairQuote,
    registerHairPurchase,
    hairConfig,
    setHairConfig,
    updateHairConfig,
    
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
