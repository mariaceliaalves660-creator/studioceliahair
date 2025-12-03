import { 
  Service, Product, Course, Student, Staff, Client, Appointment, Sale, Expense, 
  StaffPayment, RegisterSession, Order, SocialUser, HairQuote, HairCalcConfig, 
  AdminUser, LoyaltyReward, PointRedemption, AppData, SaleItem 
} from '../types';
import { 
  INITIAL_SERVICES, INITIAL_PRODUCTS, INITIAL_COURSES, INITIAL_STUDENTS, 
  INITIAL_STAFF, INITIAL_CLIENTS, INITIAL_APPOINTMENTS, INITIAL_SALES, 
  INITIAL_EXPENSES, INITIAL_STAFF_PAYMENTS, INITIAL_REGISTER_SESSIONS, 
  INITIAL_ORDERS, INITIAL_SOCIAL_USERS, INITIAL_HAIR_QUOTES, INITIAL_HAIR_CONFIG, 
  INITIAL_ADMIN_USERS, INITIAL_LOYALTY_REWARDS, INITIAL_POINT_REDEMPTIONS 
} from '../constants';

const DB_KEY = 'celia_app_data';

// --- MOCK DATABASE HELPER ---
// This simulates a database connection. In a real app, these would be SQL/NoSQL queries.
const getDB = (): AppData => {
  const loaded = localStorage.getItem(DB_KEY);
  if (!loaded) {
    // Seed Database
    const initialData: AppData = {
      services: INITIAL_SERVICES,
      products: INITIAL_PRODUCTS,
      courses: INITIAL_COURSES,
      students: INITIAL_STUDENTS,
      staff: INITIAL_STAFF,
      clients: INITIAL_CLIENTS,
      appointments: INITIAL_APPOINTMENTS,
      sales: INITIAL_SALES,
      expenses: INITIAL_EXPENSES,
      staffPayments: INITIAL_STAFF_PAYMENTS,
      registerSessions: INITIAL_REGISTER_SESSIONS,
      orders: INITIAL_ORDERS,
      socialUsers: INITIAL_SOCIAL_USERS,
      hairQuotes: INITIAL_HAIR_QUOTES,
      hairConfig: INITIAL_HAIR_CONFIG,
      adminUsers: INITIAL_ADMIN_USERS,
      loyaltyRewards: INITIAL_LOYALTY_REWARDS,
      pointRedemptions: INITIAL_POINT_REDEMPTIONS
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(loaded);
};

const saveDB = (data: AppData) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// --- API CONTROLLERS ---
// All methods return Promises to simulate Async Network Requests (like axios/fetch)

export const api = {
  // --- GENERAL ---
  loadAllData: async (): Promise<AppData> => {
    return new Promise((resolve) => {
      // Simulate network latency if desired: setTimeout(() => resolve(getDB()), 500);
      resolve(getDB());
    });
  },

  // --- PRODUCTS & STOCK ---
  products: {
    create: async (product: Product): Promise<Product> => {
      const db = getDB();
      db.products.push(product);
      saveDB(db);
      return product;
    },
    update: async (product: Product): Promise<Product> => {
      const db = getDB();
      db.products = db.products.map(p => p.id === product.id ? product : p);
      saveDB(db);
      return product;
    },
    delete: async (id: string): Promise<void> => {
      const db = getDB();
      db.products = db.products.filter(p => p.id !== id);
      saveDB(db);
    }
  },

  // --- SALES (Complex Logic moved here) ---
  sales: {
    create: async (sale: Sale): Promise<Sale> => {
      const db = getDB();
      
      // 1. Add Sale Record
      db.sales.push(sale);

      // 2. Deduct Stock Logic (Backend Logic)
      sale.items.forEach(item => {
        if (item.type === 'product') {
          const productIndex = db.products.findIndex(p => p.id === item.id);
          if (productIndex > -1) {
            const product = db.products[productIndex];
            
            let quantityToDeduct = item.quantity;
            // Unit Conversion Logic
            if (product.unit === 'kg') { 
                if (item.unit === 'g') quantityToDeduct = item.quantity / 1000; 
            } else if (product.unit === 'g') { 
                if (item.unit === 'kg') quantityToDeduct = item.quantity * 1000; 
            }
            
            db.products[productIndex] = {
              ...product,
              stock: Math.max(0, product.stock - quantityToDeduct)
            };

            // 3. Hair Lifecycle: If this product came from a Hair Quote, mark quote as SOLD
            if (product.hairQuoteId) {
                const quoteIndex = db.hairQuotes.findIndex(q => q.id === product.hairQuoteId);
                if (quoteIndex > -1) {
                    db.hairQuotes[quoteIndex].status = 'sold';
                }
            }
          }
        }
      });

      // 4. Auto-Calculate Loyalty (Optional: could be done here or on read)
      // (Points are calculated on the fly in frontend for now, but could be stored here)

      saveDB(db);
      return sale;
    }
  },

  // --- ORDERS ---
  orders: {
    create: async (order: Order): Promise<Order> => {
      const db = getDB();
      db.orders.push(order);
      saveDB(db);
      return order;
    },
    update: async (order: Order, approvedByAdminId?: string, approvedByAdminName?: string): Promise<Order> => {
      const db = getDB();
      
      // Check previous state to handle stock logic only once
      const existingOrder = db.orders.find(o => o.id === order.id);
      
      if (existingOrder && order.status === 'completed' && existingOrder.status !== 'completed') {
         // Convert Order to Sale automatically
         const newSale: Sale = {
            id: `sale-ord-${order.id}`,
            date: new Date().toISOString(),
            clientId: order.clientId || 'online-guest',
            clientName: order.customerName,
            customerCpf: order.customerCpf,
            total: order.total,
            paymentMethod: 'pix',
            createdBy: approvedByAdminId || 'system-online', // Usar ID do admin se fornecido
            createdByName: approvedByAdminName || 'Venda Online', // Usar nome do admin se fornecido
            items: order.items.map(i => {
                // Find origin
                const prod = db.products.find(p => p.id === i.productId);
                const course = db.courses.find(c => c.id === i.productId);
                let origin: 'store' | 'hair_business' = 'store';
                let type: 'product' | 'course' = 'product';
                if (prod) origin = prod.origin || 'store';
                if (course) { type = 'course'; origin = 'store'; }

                const saleItem: SaleItem = {
                    id: i.productId,
                    name: i.productName,
                    price: i.price,
                    quantity: i.quantity,
                    unit: i.unit,
                    type: type,
                    staffId: 'system',
                    staffName: 'Online',
                    origin: origin,
                    category: prod?.category || course?.title || 'Online' // Use product/course category
                };
                return saleItem;
            })
         };
         
         // Reuse the sale creation logic (recursive call not possible easily in obj, so we replicate or call internal)
         // For simplicity, we implement the stock deduction for order completion here:
         newSale.items.forEach(item => {
             if (item.type === 'product') {
                 const pIdx = db.products.findIndex(p => p.id === item.id);
                 if (pIdx > -1) {
                     const p = db.products[pIdx];
                     let deduct = item.quantity;
                     if (p.unit === 'kg' && item.unit === 'g') deduct /= 1000;
                     else if (p.unit === 'g' && item.unit === 'kg') deduct *= 1000;
                     
                     db.products[pIdx].stock = Math.max(0, p.stock - deduct);
                     
                     if (p.hairQuoteId) {
                         const qIdx = db.hairQuotes.findIndex(q => q.id === p.hairQuoteId);
                         if (qIdx > -1) db.hairQuotes[qIdx].status = 'sold';
                     }
                 }
             }
         });
         db.sales.push(newSale);
      }

      // Handle Cancellation (Return Stock)
      if (existingOrder && order.status === 'cancelled' && existingOrder.status !== 'completed') {
          order.items.forEach(item => {
              const pIdx = db.products.findIndex(p => p.id === item.productId);
              if (pIdx > -1) {
                  const p = db.products[pIdx];
                  let addBack = item.quantity;
                  if (p.unit === 'kg' && item.unit === 'g') addBack /= 1000;
                  else if (p.unit === 'g' && item.unit === 'kg') addBack *= 1000;
                  
                  db.products[pIdx].stock += addBack;
                  
                  if (p.hairQuoteId) {
                      const qIdx = db.hairQuotes.findIndex(q => q.id === p.hairQuoteId);
                      if (qIdx > -1) db.hairQuotes[qIdx].status = 'stock';
                  }
              }
          });
      }

      db.orders = db.orders.map(o => o.id === order.id ? order : o);
      saveDB(db);
      return order;
    }
  },

  // --- HAIR BUSINESS ---
  hair: {
    createQuote: async (quote: HairQuote): Promise<HairQuote> => {
        const db = getDB();
        db.hairQuotes.push(quote);
        saveDB(db);
        return quote;
    },
    updateQuote: async (quote: HairQuote): Promise<HairQuote> => {
        const db = getDB();
        db.hairQuotes = db.hairQuotes.map(q => q.id === quote.id ? quote : q);
        saveDB(db);
        return quote;
    },
    purchase: async (quote: HairQuote): Promise<void> => {
        const db = getDB();
        // 1. Update Quote Status (already done in updateQuote, but ensure it's 'purchased' here)
        db.hairQuotes = db.hairQuotes.map(q => q.id === quote.id ? quote : q);
        
        // 2. Generate Expense (This is the actual purchase from the seller)
        db.expenses.push({
            id: `exp-hair-${Date.now()}`,
            description: `Compra de Cabelo: ${quote.hairType} (${quote.sellerName}) - Cód: ${quote.approvalCode}`,
            amount: quote.totalValue,
            date: new Date().toISOString(),
            category: 'Compra de Cabelo',
            businessUnit: 'hair_business'
        });
        saveDB(db);
    },
    approveQuote: async (quoteId: string): Promise<void> => { // NEW FUNCTION
        const db = getDB();
        const quoteIndex = db.hairQuotes.findIndex(q => q.id === quoteId);
        if (quoteIndex > -1 && db.hairQuotes[quoteIndex].status === 'purchased') {
            db.hairQuotes[quoteIndex].status = 'stock'; // Mark as approved and in stock
            saveDB(db);
        }
    },
    updateConfig: async (config: HairCalcConfig): Promise<void> => {
        const db = getDB();
        db.hairConfig = config;
        saveDB(db);
    }
  },

  // --- CLIENTS & LOYALTY ---
  clients: {
      create: async (client: Client): Promise<Client> => {
          const db = getDB();
          db.clients.push(client);
          saveDB(db);
          return client;
      },
      update: async (client: Client): Promise<Client> => {
          const db = getDB();
          db.clients = db.clients.map(c => c.id === client.id ? client : c);
          saveDB(db);
          return client;
      },
      delete: async (id: string): Promise<void> => {
          const db = getDB();
          db.clients = db.clients.filter(c => c.id !== id);
          saveDB(db);
      },
      redeemPoints: async (redemption: PointRedemption, rewardId: string): Promise<void> => {
          const db = getDB();
          db.pointRedemptions.push(redemption);
          
          const rewardIndex = db.loyaltyRewards.findIndex(r => r.id === rewardId);
          if (rewardIndex > -1) {
              const reward = db.loyaltyRewards[rewardIndex];
              if (reward.stock !== undefined) {
                  db.loyaltyRewards[rewardIndex].stock = Math.max(0, reward.stock - 1);
              }
          }
          saveDB(db);
      }
  },

  // --- GENERIC CRUD HANDLERS (Services, Staff, etc) ---
  services: {
      create: async (s: Service) => { const db = getDB(); db.services.push(s); saveDB(db); },
      update: async (s: Service) => { const db = getDB(); db.services = db.services.map(i => i.id === s.id ? s : i); saveDB(db); },
      delete: async (id: string) => { const db = getDB(); db.services = db.services.filter(i => i.id !== id); saveDB(db); }
  },
  courses: {
      create: async (c: Course) => { const db = getDB(); db.courses.push(c); saveDB(db); },
      update: async (c: Course) => { const db = getDB(); db.courses = db.courses.map(i => i.id === c.id ? c : i); saveDB(db); },
      delete: async (id: string) => { const db = getDB(); db.courses = db.courses.filter(i => i.id !== id); saveDB(db); }
  },
  students: {
      create: async (s: Student) => { const db = getDB(); db.students.push(s); saveDB(db); },
      update: async (s: Student) => { const db = getDB(); db.students = db.students.map(i => i.id === s.id ? s : i); saveDB(db); },
      delete: async (id: string) => { const db = getDB(); db.students = db.students.filter(i => i.id !== id); saveDB(db); }
  },
  staff: {
      create: async (s: Staff) => { const db = getDB(); db.staff.push(s); saveDB(db); },
      update: async (s: Staff) => { const db = getDB(); db.staff = db.staff.map(i => i.id === s.id ? s : i); saveDB(db); },
      delete: async (id: string) => { const db = getDB(); db.staff = db.staff.filter(i => i.id !== id); saveDB(db); }
  },
  expenses: {
      create: async (e: Expense) => { const db = getDB(); db.expenses.push(e); saveDB(db); }
  },
  staffPayments: {
      create: async (p: StaffPayment) => { const db = getDB(); db.staffPayments.push(p); saveDB(db); }
  },
  loyaltyRewards: {
      create: async (r: LoyaltyReward) => { const db = getDB(); db.loyaltyRewards.push(r); saveDB(db); },
      delete: async (id: string) => { const db = getDB(); db.loyaltyRewards = db.loyaltyRewards.filter(i => i.id !== id); saveDB(db); }
  },
  
  // --- CASHIER SESSIONS ---
  cashier: {
      open: async (amount: number) => {
          const db = getDB();
          if (db.registerSessions.find(s => s.status === 'open')) return; // Already open
          db.registerSessions.push({ 
              id: `reg-${Date.now()}`, 
              openedAt: new Date().toISOString(), 
              openingBalance: amount, 
              status: 'open' 
          });
          saveDB(db);
      },
      close: async (withdrawAmount: number) => {
          const db = getDB();
          db.registerSessions = db.registerSessions.map(session => {
              if (session.status === 'open') {
                  const sessionStart = new Date(session.openedAt).getTime();
                  // Calculate totals right now for snapshot
                  const sessionSales = db.sales.filter(s => new Date(s.date).getTime() >= sessionStart);
                  const sessionExpenses = db.expenses.filter(e => new Date(e.date).getTime() >= sessionStart);
                  
                  const totalIncome = sessionSales.reduce((acc, sale) => {
                      return acc + sale.items.reduce((itemAcc, item) => (item.origin !== 'hair_business' ? itemAcc + (item.price * item.quantity) : itemAcc), 0);
                  }, 0);
                  const totalExpenses = sessionExpenses.reduce((acc, e) => (e.businessUnit !== 'hair_business' ? acc + e.amount : acc), 0);
                  
                  return { 
                      ...session, 
                      status: 'closed', 
                      closedAt: new Date().toISOString(), 
                      totalIncome, 
                      totalExpenses, 
                      calculatedBalance: session.openingBalance + totalIncome - totalExpenses, 
                      withdrawnAmount: withdrawAmount, 
                      finalBalance: (session.openingBalance + totalIncome - totalExpenses) - withdrawAmount 
                  };
              }
              return session;
          });
          saveDB(db);
      }
  },

  // --- USERS ---
  users: {
      social: {
          create: async (u: SocialUser) => { const db = getDB(); db.socialUsers.push(u); saveDB(db); },
          update: async (u: SocialUser) => { const db = getDB(); db.socialUsers = db.socialUsers.map(i => i.id === u.id ? u : i); saveDB(db); },
          delete: async (id: string) => { const db = getDB(); db.socialUsers = db.socialUsers.filter(i => i.id !== id); saveDB(db); }
      },
      admin: {
          create: async (u: AdminUser) => { const db = getDB(); db.adminUsers.push(u); saveDB(db); },
          update: async (u: AdminUser) => { const db = getDB(); db.adminUsers = db.adminUsers.map(i => i.id === u.id ? u : i); saveDB(db); },
          delete: async (id: string) => { const db = getDB(); db.adminUsers = db.adminUsers.filter(i => i.id !== id); saveDB(db); }
      }
  }
};