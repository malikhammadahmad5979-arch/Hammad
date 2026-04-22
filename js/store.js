import { db, auth } from './firebase-init.js';
import { doc, getDoc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let localDB = null;

const initializeDB = () => {
    const defaultData = {
        clients: [], 
        sales: [], 
        inventory: [
            { id: 1, material: "W.BOUND", qty: 0, max: 100000 },
            { id: 2, material: "KHAKA", qty: 0, max: 100000 },
            { id: 3, material: "CRUSH", qty: 0, max: 100000 }
        ], 
        payments: [],
        cashbook: [],
        outsideAccounts: [],
        accountLedger: []
    };
    if (!localStorage.getItem('yb_db')) {
        localStorage.setItem('yb_db', JSON.stringify(defaultData));
    }
};

const getLocalDB = () => JSON.parse(localStorage.getItem('yb_db')) || {};

let syncTimeout = null;

const saveLocalDB = (data) => {
    localStorage.setItem('yb_db', JSON.stringify(data));
    
    // Clear existing timeout to debounce cloud sync
    if (syncTimeout) clearTimeout(syncTimeout);
    
    // If logged in, push to Firestore with a small delay (debounce)
    if (auth.currentUser) {
        syncTimeout = setTimeout(() => {
            console.log("Syncing to cloud...");
            setDoc(doc(db, "business_data", auth.currentUser.uid), data)
                .then(() => console.log("Cloud sync complete"))
                .catch(err => console.error("Cloud sync failed", err));
        }, 1500); // 1.5 second debounce
    }
};

// Cloud Sync Listener
export const initCloudSync = (onUpdate) => {
    if (!auth.currentUser) return;
    
    const docRef = doc(db, "business_data", auth.currentUser.uid);
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            localStorage.setItem('yb_db', JSON.stringify(data));
            if (onUpdate) onUpdate();
        }
    });
};

export const syncLocalToCloud = async () => {
    if (!auth.currentUser) return;
    const local = getLocalDB();
    const docRef = doc(db, "business_data", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
        // First time cloud sync: Upload local to cloud
        await setDoc(docRef, local);
        console.log("Migration successful: Local data moved to Cloud.");
    }
};

export const DB = {
  init: initializeDB,
  sync: syncLocalToCloud,
  
  // Clients
  getClients: () => getLocalDB().clients || [],
  getClientById: (id) => (getLocalDB().clients || []).find(c => c.id == id),
  addClient: (client) => {
    const dbData = getLocalDB();
    client.id = Date.now();
    client.totalDue = 0;
    dbData.clients.push(client);
    saveLocalDB(dbData);
    return client;
  },
  deleteClient: (id) => {
    const dbData = getLocalDB();
    const idx = dbData.clients.findIndex(c => c.id == id);
    if(idx !== -1) {
        const hasSales = (dbData.sales || []).some(s => s.clientId == id);
        if(hasSales) {
            alert("Is Party ke naam pe Sales record maujood hain! Pehle sales delete karein.");
            return false;
        }
        dbData.clients.splice(idx, 1);
        saveLocalDB(dbData);
        return true;
    }
    return false;
  },

  // Sales
  getSales: () => getLocalDB().sales || [],
  getSaleById: (id) => (getLocalDB().sales || []).find(s => s.id == id),
  getSalesByInvoice: (invoiceId) => (getLocalDB().sales || []).filter(s => s.invoiceId == invoiceId),
  addSale: (sale) => {
    const dbData = getLocalDB();
    sale.id = Date.now();
    sale.amount = sale.weight * sale.rate;
    dbData.sales.push(sale);
    const client = dbData.clients.find(c => c.id == sale.clientId);
    if(client) client.totalDue += sale.amount;
    const inv = dbData.inventory.find(i => i.material === sale.material);
    if(inv) inv.qty -= sale.weight;
    saveLocalDB(dbData);
    return sale;
  },
  updateSale: (id, newSaleData) => {
    const dbData = getLocalDB();
    const idx = dbData.sales.findIndex(s => s.id == id);
    if(idx === -1) return null;
    const oldSale = dbData.sales[idx];
    const oldClient = dbData.clients.find(c => c.id == oldSale.clientId);
    if(oldClient) oldClient.totalDue -= oldSale.amount;
    const oldInv = dbData.inventory.find(i => i.material === oldSale.material);
    if(oldInv) oldInv.qty += oldSale.weight;
    newSaleData.amount = newSaleData.weight * newSaleData.rate;
    newSaleData.id = oldSale.id;
    newSaleData.invoiceId = newSaleData.invoiceId || oldSale.invoiceId;
    const newClient = dbData.clients.find(c => c.id == newSaleData.clientId);
    if(newClient) newClient.totalDue += newSaleData.amount;
    const newInv = dbData.inventory.find(i => i.material === newSaleData.material);
    if(newInv) newInv.qty -= newSaleData.weight;
    dbData.sales[idx] = newSaleData;
    saveLocalDB(dbData);
    return newSaleData;
  },
  deleteSale: (id) => {
    const dbData = getLocalDB();
    const idx = dbData.sales.findIndex(s => s.id == id);
    if(idx === -1) return false;
    const oldSale = dbData.sales[idx];
    const client = dbData.clients.find(c => c.id == oldSale.clientId);
    if(client) client.totalDue -= oldSale.amount;
    const inv = dbData.inventory.find(i => i.material === oldSale.material);
    if(inv) inv.qty += oldSale.weight;
    dbData.sales.splice(idx, 1);
    saveLocalDB(dbData);
    return true;
  },

  // Inventory / Materials
  getInventory: () => getLocalDB().inventory || [],
  addMaterial: (name) => {
    const dbData = getLocalDB();
    const newItem = { id: Date.now(), material: name.toUpperCase(), qty: 0, max: 100000 };
    dbData.inventory.push(newItem);
    saveLocalDB(dbData);
    return newItem;
  },
  deleteMaterial: (id) => {
    const dbData = getLocalDB();
    const idx = dbData.inventory.findIndex(i => i.id == id);
    if(idx !== -1) {
        dbData.inventory.splice(idx, 1);
        saveLocalDB(dbData);
        return true;
    }
    return false;
  },

  // Payments / Receipts
  getPayments: () => getLocalDB().payments || [],
  getPaymentById: (id) => (getLocalDB().payments || []).find(p => p.id == id),
  getClientPayments: (clientId) => (getLocalDB().payments || []).filter(p => p.clientId == clientId),
  addPayment: (payment) => {
    const dbData = getLocalDB();
    payment.id = Date.now();
    dbData.payments.push(payment);
    saveLocalDB(dbData);
    return payment;
  },
  updatePayment: (id, newData) => {
      const dbData = getLocalDB();
      const idx = dbData.payments.findIndex(p => p.id == id);
      if(idx === -1) return null;
      newData.id = id;
      dbData.payments[idx] = newData;
      saveLocalDB(dbData);
      return newData;
  },
  deletePayment: (id) => {
      const dbData = getLocalDB();
      const idx = dbData.payments.findIndex(p => p.id == id);
      if(idx === -1) return false;
      dbData.payments.splice(idx, 1);
      saveLocalDB(dbData);
      return true;
  },

  // Roznamcha (Cashbook)
  getCashbook: () => getLocalDB().cashbook || [],
  addCashbookEntry: (entry) => {
      const dbData = getLocalDB();
      entry.id = Date.now();
      dbData.cashbook.push(entry);
      saveLocalDB(dbData);
      return entry;
  },
  deleteCashbookEntry: (id) => {
      const dbData = getLocalDB();
      dbData.cashbook = dbData.cashbook.filter(e => e.id != id);
      saveLocalDB(dbData);
  },

  // Udhaar Khata / Account Books (Outside Accounts)
  getOutsideAccounts: () => getLocalDB().outsideAccounts || [],
  getOutsideAccountById: (id) => (getLocalDB().outsideAccounts || []).find(a => a.id == id),
  addOutsideAccount: (acc) => {
      const dbData = getLocalDB();
      acc.id = Date.now();
      acc.balance = 0;
      dbData.outsideAccounts.push(acc);
      saveLocalDB(dbData);
      return acc;
  },
  deleteOutsideAccount: (id) => {
      const dbData = getLocalDB();
      dbData.outsideAccounts = dbData.outsideAccounts.filter(a => a.id != id);
      dbData.accountLedger = dbData.accountLedger.filter(l => l.accountId != id);
      saveLocalDB(dbData);
  },
  getAccountLedger: (accountId) => (getLocalDB().accountLedger || []).filter(l => l.accountId == accountId),
  addLedgerEntry: (entry) => {
      const dbData = getLocalDB();
      entry.id = Date.now();
      dbData.accountLedger.push(entry);
      const acc = dbData.outsideAccounts.find(a => a.id == entry.accountId);
      if(acc) {
          const debit = parseFloat(entry.debit) || 0;
          const credit = parseFloat(entry.credit) || 0;
          acc.balance += (debit - credit);
      }
      saveLocalDB(dbData);
      return entry;
  },
  deleteLedgerEntry: (id) => {
      const dbData = getLocalDB();
      const idx = dbData.accountLedger.findIndex(l => l.id == id);
      if(idx !== -1) {
          const entry = dbData.accountLedger[idx];
          const acc = dbData.outsideAccounts.find(a => a.id == entry.accountId);
          if(acc) {
              const debit = parseFloat(entry.debit) || 0;
              const credit = parseFloat(entry.credit) || 0;
              acc.balance -= (debit - credit);
          }
          dbData.accountLedger.splice(idx, 1);
          saveLocalDB(dbData);
      }
  },
  
  // Helpers for Client Ledger Math
  getClientTotalReceived: (clientId) => {
    const payments = DB.getClientPayments(clientId);
    return payments.reduce((sum, p) => sum + p.amount, 0);
  },
  
  getDashboardStats: () => {
    const dbData = getLocalDB();
    const sales = dbData.sales || [];
    const payments = dbData.payments || [];
    const clients = dbData.clients || [];
    const inventory = dbData.inventory || [];

    const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
    const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
    const clientBalances = clients.map(c => {
        const received = payments.filter(p => p.clientId == c.id).reduce((sum, p) => sum + p.amount, 0);
        return {
            id: c.id,
            name: c.name,
            totalDue: c.totalDue,
            received: received,
            balance: c.totalDue - received
        };
    }).filter(c => c.balance !== 0);
    const overallDue = clients.reduce((sum, c) => sum + c.totalDue, 0) - totalReceived;
    const lowStockCount = inventory.filter(i => i.qty > 0 && i.qty < 5000).length;
    
    return {
      totalDue: overallDue, 
      totalSales, 
      totalReceived,
      lowStockCount,
      clientBalances,
      recentSales: sales.slice(-5),
      recentPayments: payments.slice(-5)
    };
  },
  
  // Clear Database
  clearAll: () => {
    if(confirm("Are you sure? This will delete ALL data (Sara data khatam ho jaye ga?)")) {
        localStorage.clear(); 
        localStorage.setItem('yb_reset_done', 'true');
        localStorage.setItem('yb_db', JSON.stringify({ 
            clients: [], sales: [], inventory: [], payments: [], 
            cashbook: [], outsideAccounts: [], accountLedger: [] 
        }));
        window.location.reload();
    }
  }
};
