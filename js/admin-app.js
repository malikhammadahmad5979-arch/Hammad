import { DB, initCloudSync, syncLocalToCloud } from './store.js';
import { Router } from './utils.js';
import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import { renderAdmin } from './views/admin.js';
import { renderLogin } from './views/login.js';
import { renderInvoice } from './views/invoice.js';
import { renderSettings } from './views/settings.js';

// Setup Mock DB
DB.init();

// Global Utils Actions
window.logout = () => {
    signOut(auth).then(() => {
        window.location.reload();
    });
};

// Define Sidebars
const getAdminSidebarHtml = (user) => {
    if (!user) return `
        <a class="nav-item active" data-route="login" onclick="window.router.navigate('login')">
            <i class="ri-lock-line"></i> Admin Login
        </a>
    `;

    return `
        <a class="nav-item active" data-route="admin" onclick="window.router.navigate('admin')">
            <i class="ri-dashboard-line"></i> Summary Dashboard
        </a>
        <a class="nav-item" data-route="admin-reports" onclick="window.router.navigate('invoice')">
            <i class="ri-file-chart-line"></i> Business Reports
        </a>
        <div style="margin-top: 50px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
            <a class="nav-item" data-route="settings" onclick="window.router.navigate('settings')">
                <i class="ri-settings-4-line"></i> System Settings
            </a>
            <a class="nav-item" onclick="window.logout()" style="color: #ff4d4d !important;">
                <i class="ri-logout-box-line"></i> Logout
            </a>
        </div>
    `;
};

// Setup Router
Router.add('login', renderLogin);
Router.add('admin', renderAdmin);
Router.add('invoice', renderInvoice);
Router.add('settings', renderSettings);

window.router = Router;

// Init App
document.addEventListener('DOMContentLoaded', () => {
    const sidebarNav = document.getElementById('sidebar-nav');
    
    onAuthStateChanged(auth, async (user) => {
        sidebarNav.innerHTML = getAdminSidebarHtml(user);
        
        if (user) {
            console.log("Admin Cloud Sync Active.");
            await syncLocalToCloud();
            initCloudSync(() => {
                const current = Router.currentRoute;
                if (current && current !== 'login') {
                    Router.navigate(current, Router.currentParams);
                }
            });
            
            // Always navigate to admin if no route is set or if on login page
            if (!Router.currentRoute || Router.currentRoute === 'login') {
                Router.navigate('admin');
            }
        } else {
            console.log("Admin session required.");
            Router.navigate('login');
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
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Registering SW from the root
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('Admin SW Registered', reg);
        }).catch(err => {
            console.log('Admin SW Registration Failed', err);
        });
    });
}
