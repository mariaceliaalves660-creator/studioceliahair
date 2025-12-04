import React, { createContext, useContext, useState } from 'react';
import { Product, Course, Client, Student, Appointment, HairQuote, Sale, LoyaltyReward } from '../types';

type ViewMode = 'client' | 'admin' | 'social';

interface AppContextType {
  // View Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
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
  
  const [socialUsers] = useState([
    { id: '1', username: 'avaliador1', password: '123456', name: 'Avaliador Teste' }
  ]);
  
  const [adminUsers] = useState([
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
  
  // Sales
  const [sales, setSales] = useState<Sale[]>([]);
  
  const addSale = (sale: Sale) => {
    setSales([...sales, { ...sale, id: Date.now().toString() }]);
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
  const [hairConfig, setHairConfig] = useState({});
  
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
    
    // Sales
    sales,
    addSale,
    
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
    pointRedemptions,
    redeemPoints,
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
