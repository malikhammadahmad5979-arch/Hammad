import { DB, initCloudSync, syncLocalToCloud } from './store.js';
import { Router } from './utils.js';
import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import { renderDashboard } from './views/dashboard.js';
import { renderInvoice } from './views/invoice.js';
import { renderSales } from './views/sales.js';
import { renderPayments } from './views/payments.js';
import { renderSettings } from './views/settings.js';
import { renderRoznamcha } from './views/roznamcha.js';
import { renderUdhaar } from './views/creditLedger.js';
import { renderLogin } from './views/login.js';
import { renderAdmin } from './views/admin.js';

// Setup Mock DB
DB.init();

// Global Utils Actions
window.logout = () => {
    signOut(auth).then(() => {
        window.location.reload();
    });
};

// ... (downloadPDF, shareWhatsApp, sharePDF actions remain the same)

// Define Sidebars (Staff Only)
const sidebarNavHtml = `
    <a class="nav-item active" data-route="dashboard" onclick="window.router.navigate('dashboard')">
        <i class="ri-dashboard-line"></i> Dashboard
    </a>
    <a class="nav-item" data-route="sales" onclick="window.router.navigate('sales')">
        <i class="ri-shopping-cart-2-line"></i> Sales Register
    </a>
    <a class="nav-item" data-route="payments" onclick="window.router.navigate('payments')">
        <i class="ri-money-dollar-circle-line"></i> Payments (Wasooli)
    </a>
    <div style="margin-top: 25px; margin-bottom: 10px; padding: 0 15px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Daily Logs & Accounts</div>
    <a class="nav-item" data-route="cashbook" onclick="window.router.navigate('cashbook')">
        <i class="ri-book-3-line"></i> Roznamcha (Daily Ledger)
    </a>
    <a class="nav-item" data-route="credit-ledger" onclick="window.router.navigate('credit-ledger')">
        <i class="ri-user-add-line"></i> Udhaar Khata / Account Books
    </a>
    <div style="margin-top: 25px; margin-bottom: 10px; padding: 0 15px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Reports & Bills</div>
    <a class="nav-item" data-route="invoice" onclick="window.router.navigate('invoice')">
        <i class="ri-file-chart-line"></i> Party Ledger (Manual)
    </a>
    <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 10px;">
        <a class="nav-item" data-route="settings" onclick="window.router.navigate('settings')" style="color: #475569;">
            <i class="ri-settings-4-line" style="color: #475569;"></i> Settings & Backups
        </a>
    </div>
`;

// Setup Router
Router.add('dashboard', renderDashboard);
Router.add('sales', renderSales);
Router.add('payments', renderPayments);
Router.add('cashbook', renderRoznamcha);
Router.add('credit-ledger', renderUdhaar);
Router.add('invoice', renderInvoice);
Router.add('settings', renderSettings);

window.router = Router;

// Init App
document.addEventListener('DOMContentLoaded', () => {
    const sidebarNav = document.getElementById('sidebar-nav');
    sidebarNav.innerHTML = sidebarNavHtml;
    
    // Background cloud sync for staff (if already setup)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Office Sync Active.");
            await syncLocalToCloud();
            initCloudSync(() => {
                const current = Router.currentRoute;
                if (current) Router.navigate(current, Router.currentParams);
            });
        }
    });

    // Toggle Mobile menu
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    };

    document.getElementById('mobile-menu-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebar-close').addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);

    // Close sidebar on nav click (mobile)
    sidebarNav.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && e.target.closest('.nav-item')) {
            toggleSidebar();
        }
    });

    // Initial Start
    Router.navigate('dashboard');
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('SW Registered', reg);
        }).catch(err => {
            console.log('SW Registration Failed', err);
        });
    });
}
