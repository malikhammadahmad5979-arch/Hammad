import { db, auth } from './firebase-init.js';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ─── In-Memory Cache ─────────────────────────────────────────────────────────
// Avoids repeated JSON.parse on every read — huge speed improvement
let _memCache = null;

const getLocalDB = () => {
    if (_memCache) return _memCache;
    try {
        _memCache = JSON.parse(localStorage.getItem('yb_db')) || {};
    } catch(e) {
        _memCache = {};
    }
    return _memCache;
};

// ─── Debounced Cloud Sync ─────────────────────────────────────────────────────
let _syncTimeout = null;

const saveLocalDB = (data) => {
    _memCache = data; // update in-memory cache instantly
    localStorage.setItem('yb_db', JSON.stringify(data));

    if (_syncTimeout) clearTimeout(_syncTimeout);
    if (auth.currentUser) {
        // Increased to 4000ms to reduce Firestore write frequency
        _syncTimeout = setTimeout(() => {
            setDoc(doc(db, "business_data", auth.currentUser.uid), data)
                .catch(err => console.error("Cloud sync failed", err));
        }, 4000);
    }
};

// ─── Default Empty DB Structure ───────────────────────────────────────────────
const defaultData = () => ({
    clients: [],
    sales: [],
    inventory: [
        { id: 1, material: "W.BOUND", qty: 0, max: 100000 },
        { id: 2, material: "KHAKA",   qty: 0, max: 100000 },
        { id: 3, material: "CRUSH",   qty: 0, max: 100000 }
    ],
    payments: [],
    cashbook: [],
    outsideAccounts: [],
    accountLedger: [],
    loans: [],
    loanTransactions: [],
    sentPaymentsAccounts: [],
    sentPaymentsLedger: []
});

const initializeDB = () => {
    if (!localStorage.getItem('yb_db')) {
        const d = defaultData();
        localStorage.setItem('yb_db', JSON.stringify(d));
        _memCache = d;
    }
};

// ─── Cloud Sync: Pull from Firestore on login ─────────────────────────────────
export const syncLocalToCloud = async () => {
    if (!auth.currentUser) return;
    const docRef = doc(db, "business_data", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        // Cloud is source of truth — pull down
        const cloudData = docSnap.data();
        _memCache = cloudData;
        localStorage.setItem('yb_db', JSON.stringify(cloudData));
        console.log("Synced from cloud.");
    } else {
        // First time — push local to cloud
        const local = getLocalDB();
        await setDoc(docRef, local);
        console.log("First sync: local data uploaded to cloud.");
    }
};

// ─── Live Sync Listener ───────────────────────────────────────────────────────
let _lastRenderTime = 0;

export const initCloudSync = (onUpdate) => {
    if (!auth.currentUser) return;
    const docRef = doc(db, "business_data", auth.currentUser.uid);
    let _isFirstSnapshot = true; // skip the first snapshot (already synced on login)
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            // Skip first snapshot — data was already loaded in syncLocalToCloud
            if (_isFirstSnapshot) { _isFirstSnapshot = false; return; }

            const data = docSnap.data();
            _memCache = data;
            localStorage.setItem('yb_db', JSON.stringify(data));

            // Throttle UI re-renders to max once every 5 seconds
            const now = Date.now();
            if (onUpdate && (now - _lastRenderTime > 5000)) {
                _lastRenderTime = now;
                onUpdate();
            }
        }
    });
};

// ─── Main DB Object ───────────────────────────────────────────────────────────
export const DB = {
  init: initializeDB,
  sync: syncLocalToCloud,

  // Clients
  getClients: () => getLocalDB().clients || [],
  getClientById: (id) => (getLocalDB().clients || []).find(c => c.id == id),
  addClient: (client) => {
    const d = getLocalDB();
    client.id = Date.now();
    client.totalDue = 0;
    d.clients.push(client);
    saveLocalDB(d);
    return client;
  },
  deleteClient: (id) => {
    const d = getLocalDB();
    const idx = d.clients.findIndex(c => c.id == id);
    if (idx !== -1) {
        if ((d.sales || []).some(s => s.clientId == id)) {
            alert("Is Party ke naam pe Sales record maujood hain! Pehle sales delete karein.");
            return false;
        }
        d.clients.splice(idx, 1);
        saveLocalDB(d);
        return true;
    }
    return false;
  },

  // Sales
  getSales: () => getLocalDB().sales || [],
  getSaleById: (id) => (getLocalDB().sales || []).find(s => s.id == id),
  getSalesByInvoice: (invoiceId) => (getLocalDB().sales || []).filter(s => s.invoiceId == invoiceId),
  addSale: (sale) => {
    const d = getLocalDB();
    sale.id = Date.now();
    sale.amount = sale.weight * sale.rate;
    d.sales.push(sale);
    const client = d.clients.find(c => c.id == sale.clientId);
    if (client) client.totalDue += sale.amount;
    const inv = d.inventory.find(i => i.material === sale.material);
    if (inv) inv.qty -= sale.weight;
    saveLocalDB(d);
    return sale;
  },
  updateSale: (id, newSaleData) => {
    const d = getLocalDB();
    const idx = d.sales.findIndex(s => s.id == id);
    if (idx === -1) return null;
    const old = d.sales[idx];
    const oldClient = d.clients.find(c => c.id == old.clientId);
    if (oldClient) oldClient.totalDue -= old.amount;
    const oldInv = d.inventory.find(i => i.material === old.material);
    if (oldInv) oldInv.qty += old.weight;
    newSaleData.amount = newSaleData.weight * newSaleData.rate;
    newSaleData.id = old.id;
    newSaleData.invoiceId = newSaleData.invoiceId || old.invoiceId;
    const newClient = d.clients.find(c => c.id == newSaleData.clientId);
    if (newClient) newClient.totalDue += newSaleData.amount;
    const newInv = d.inventory.find(i => i.material === newSaleData.material);
    if (newInv) newInv.qty -= newSaleData.weight;
    d.sales[idx] = newSaleData;
    saveLocalDB(d);
    return newSaleData;
  },
  deleteSale: (id) => {
    const d = getLocalDB();
    const idx = d.sales.findIndex(s => s.id == id);
    if (idx === -1) return false;
    const old = d.sales[idx];
    const client = d.clients.find(c => c.id == old.clientId);
    if (client) client.totalDue -= old.amount;
    const inv = d.inventory.find(i => i.material === old.material);
    if (inv) inv.qty += old.weight;
    d.sales.splice(idx, 1);
    saveLocalDB(d);
    return true;
  },

  // Inventory
  getInventory: () => getLocalDB().inventory || [],
  addMaterial: (name) => {
    const d = getLocalDB();
    const newItem = { id: Date.now(), material: name.toUpperCase(), qty: 0, max: 100000 };
    d.inventory.push(newItem);
    saveLocalDB(d);
    return newItem;
  },
  deleteMaterial: (id) => {
    const d = getLocalDB();
    const idx = d.inventory.findIndex(i => i.id == id);
    if (idx !== -1) { d.inventory.splice(idx, 1); saveLocalDB(d); return true; }
    return false;
  },

  // Payments
  getPayments: () => getLocalDB().payments || [],
  getPaymentById: (id) => (getLocalDB().payments || []).find(p => p.id == id),
  getClientPayments: (clientId) => (getLocalDB().payments || []).filter(p => p.clientId == clientId),
  addPayment: (payment) => {
    const d = getLocalDB();
    payment.id = Date.now();
    d.payments.push(payment);
    saveLocalDB(d);
    return payment;
  },
  updatePayment: (id, newData) => {
    const d = getLocalDB();
    const idx = d.payments.findIndex(p => p.id == id);
    if (idx === -1) return null;
    newData.id = id;
    d.payments[idx] = newData;
    saveLocalDB(d);
    return newData;
  },
  deletePayment: (id) => {
    const d = getLocalDB();
    const idx = d.payments.findIndex(p => p.id == id);
    if (idx === -1) return false;
    d.payments.splice(idx, 1);
    saveLocalDB(d);
    return true;
  },

  // Roznamcha (Cashbook)
  getCashbook: () => getLocalDB().cashbook || [],
  addCashbookEntry: (entry) => {
    const d = getLocalDB();
    entry.id = Date.now();
    d.cashbook.push(entry);
    saveLocalDB(d);
    return entry;
  },
  deleteCashbookEntry: (id) => {
    const d = getLocalDB();
    d.cashbook = d.cashbook.filter(e => e.id != id);
    saveLocalDB(d);
  },

  // Udhaar / Account Books
  getOutsideAccounts: () => getLocalDB().outsideAccounts || [],
  getOutsideAccountById: (id) => (getLocalDB().outsideAccounts || []).find(a => a.id == id),
  addOutsideAccount: (acc) => {
    const d = getLocalDB();
    acc.id = Date.now();
    acc.balance = 0;
    d.outsideAccounts.push(acc);
    saveLocalDB(d);
    return acc;
  },
  deleteOutsideAccount: (id) => {
    const d = getLocalDB();
    d.outsideAccounts = d.outsideAccounts.filter(a => a.id != id);
    d.accountLedger = d.accountLedger.filter(l => l.accountId != id);
    saveLocalDB(d);
  },
  getAccountLedger: (accountId) => (getLocalDB().accountLedger || []).filter(l => l.accountId == accountId),
  addLedgerEntry: (entry) => {
    const d = getLocalDB();
    entry.id = Date.now();
    d.accountLedger.push(entry);
    const acc = d.outsideAccounts.find(a => a.id == entry.accountId);
    if (acc) acc.balance += (parseFloat(entry.debit) || 0) - (parseFloat(entry.credit) || 0);
    saveLocalDB(d);
    return entry;
  },
  deleteLedgerEntry: (id) => {
    const d = getLocalDB();
    const idx = d.accountLedger.findIndex(l => l.id == id);
    if (idx !== -1) {
        const entry = d.accountLedger[idx];
        const acc = d.outsideAccounts.find(a => a.id == entry.accountId);
        if (acc) acc.balance -= (parseFloat(entry.debit) || 0) - (parseFloat(entry.credit) || 0);
        d.accountLedger.splice(idx, 1);
        saveLocalDB(d);
    }
  },

  // Helpers
  getClientTotalReceived: (clientId) => {
    return DB.getClientPayments(clientId).reduce((sum, p) => sum + p.amount, 0);
  },

  // Loans
  getLoans: () => {
    const d = getLocalDB();
    if (!d.loans) d.loans = [];
    return d.loans;
  },
  getLoanById: (id) => {
    const d = getLocalDB();
    if (!d.loans) d.loans = [];
    return d.loans.find(l => l.id == id);
  },
  addLoan: (loan) => {
    const d = getLocalDB();
    if (!d.loans) d.loans = [];
    if (!d.loanTransactions) d.loanTransactions = [];
    loan.id = Date.now();
    loan.balance = 0;
    d.loans.push(loan);
    saveLocalDB(d);
    return loan;
  },
  deleteLoan: (id) => {
    const d = getLocalDB();
    if (!d.loans) d.loans = [];
    if (!d.loanTransactions) d.loanTransactions = [];
    d.loans = d.loans.filter(l => l.id != id);
    d.loanTransactions = d.loanTransactions.filter(t => t.loanId != id);
    saveLocalDB(d);
  },
  getLoanTransactions: (loanId) => {
    const d = getLocalDB();
    if (!d.loanTransactions) d.loanTransactions = [];
    return d.loanTransactions.filter(t => t.loanId == loanId);
  },
  addLoanTransaction: (entry) => {
    const d = getLocalDB();
    if (!d.loans) d.loans = [];
    if (!d.loanTransactions) d.loanTransactions = [];
    entry.id = Date.now();
    d.loanTransactions.push(entry);
    const loan = d.loans.find(l => l.id == entry.loanId);
    if (loan) {
        const amt = parseFloat(entry.amount) || 0;
        if (entry.type === 'borrow') {
            loan.balance += amt;
        } else if (entry.type === 'payback') {
            loan.balance -= amt;
        }
    }
    saveLocalDB(d);
    return entry;
  },
  deleteLoanTransaction: (id) => {
    const d = getLocalDB();
    if (!d.loans) d.loans = [];
    if (!d.loanTransactions) d.loanTransactions = [];
    const idx = d.loanTransactions.findIndex(t => t.id == id);
    if (idx !== -1) {
        const entry = d.loanTransactions[idx];
        const loan = d.loans.find(l => l.id == entry.loanId);
        if (loan) {
            const amt = parseFloat(entry.amount) || 0;
            if (entry.type === 'borrow') {
                loan.balance -= amt;
            } else if (entry.type === 'payback') {
                loan.balance += amt;
            }
        }
        d.loanTransactions.splice(idx, 1);
        saveLocalDB(d);
    }
  },

  // Sent Payments
  getSentPaymentsAccounts: () => {
    const d = getLocalDB();
    if (!d.sentPaymentsAccounts) d.sentPaymentsAccounts = [];
    return d.sentPaymentsAccounts;
  },
  getSentPaymentsAccountById: (id) => {
    const d = getLocalDB();
    if (!d.sentPaymentsAccounts) d.sentPaymentsAccounts = [];
    return d.sentPaymentsAccounts.find(a => a.id == id);
  },
  addSentPaymentsAccount: (acc) => {
    const d = getLocalDB();
    if (!d.sentPaymentsAccounts) d.sentPaymentsAccounts = [];
    if (!d.sentPaymentsLedger) d.sentPaymentsLedger = [];
    acc.id = Date.now();
    acc.balance = 0;
    d.sentPaymentsAccounts.push(acc);
    saveLocalDB(d);
    return acc;
  },
  deleteSentPaymentsAccount: (id) => {
    const d = getLocalDB();
    if (!d.sentPaymentsAccounts) d.sentPaymentsAccounts = [];
    if (!d.sentPaymentsLedger) d.sentPaymentsLedger = [];
    d.sentPaymentsAccounts = d.sentPaymentsAccounts.filter(a => a.id != id);
    d.sentPaymentsLedger = d.sentPaymentsLedger.filter(l => l.accountId != id);
    saveLocalDB(d);
  },
  getSentPaymentsLedger: (accountId) => {
    const d = getLocalDB();
    if (!d.sentPaymentsLedger) d.sentPaymentsLedger = [];
    return d.sentPaymentsLedger.filter(l => l.accountId == accountId);
  },
  addSentPaymentsEntry: (entry) => {
    const d = getLocalDB();
    if (!d.sentPaymentsAccounts) d.sentPaymentsAccounts = [];
    if (!d.sentPaymentsLedger) d.sentPaymentsLedger = [];
    entry.id = Date.now();
    d.sentPaymentsLedger.push(entry);
    const acc = d.sentPaymentsAccounts.find(a => a.id == entry.accountId);
    if (acc) {
        acc.balance += parseFloat(entry.amount) || 0;
    }
    saveLocalDB(d);
    return entry;
  },
  deleteSentPaymentsEntry: (id) => {
    const d = getLocalDB();
    if (!d.sentPaymentsAccounts) d.sentPaymentsAccounts = [];
    if (!d.sentPaymentsLedger) d.sentPaymentsLedger = [];
    const idx = d.sentPaymentsLedger.findIndex(l => l.id == id);
    if (idx !== -1) {
        const entry = d.sentPaymentsLedger[idx];
        const acc = d.sentPaymentsAccounts.find(a => a.id == entry.accountId);
        if (acc) {
            acc.balance -= parseFloat(entry.amount) || 0;
        }
        d.sentPaymentsLedger.splice(idx, 1);
        saveLocalDB(d);
    }
  },

  getDashboardStats: () => {
    const d = getLocalDB();
    const sales    = d.sales    || [];
    const payments = d.payments || [];
    const clients  = d.clients  || [];
    const inventory = d.inventory || [];

    const totalSales    = sales.reduce((s, x) => s + x.amount, 0);
    const totalReceived = payments.reduce((s, x) => s + x.amount, 0);
    const clientBalances = clients.map(c => {
        const received = payments.filter(p => p.clientId == c.id).reduce((s, p) => s + p.amount, 0);
        return { id: c.id, name: c.name, totalDue: c.totalDue, received, balance: c.totalDue - received };
    }).filter(c => c.balance !== 0);

    return {
        totalDue: clients.reduce((s, c) => s + c.totalDue, 0) - totalReceived,
        totalSales, totalReceived,
        lowStockCount: inventory.filter(i => i.qty > 0 && i.qty < 5000).length,
        clientBalances,
        recentSales:    sales.slice(-5),
        recentPayments: payments.slice(-5)
    };
  },

  // ─── Reset: Clears localStorage AND Firestore ─────────────────────────────
  clearAll: async () => {
    if (confirm("Are you sure? This will delete ALL data permanently (Sara data khatam ho jaye ga?)")) {
        const empty = defaultData();
        _memCache = empty;
        localStorage.clear();
        localStorage.setItem('yb_db', JSON.stringify(empty));

        // Also clear Firestore so other devices reset too
        if (auth.currentUser) {
            try {
                await setDoc(doc(db, "business_data", auth.currentUser.uid), empty);
                console.log("Firestore also cleared.");
            } catch(e) {
                console.error("Firestore clear failed", e);
            }
        }
        window.location.reload();
    }
  }
};
