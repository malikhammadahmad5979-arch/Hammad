import { DB } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';

export const renderDashboard = () => {
    const stats = DB.getDashboardStats();
    
    let html = `
        <!-- Professional Real-time Header -->
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 15px -3px rgba(30, 60, 114, 0.2);">
            <div>
                <h2 style="margin:0; font-size: 22px; letter-spacing: 0.5px;">Welcome Back! 👋</h2>
                <p style="margin:8px 0 0 0; opacity: 0.8; font-size: 14px; font-weight:500;">Yousaf Brothers Stone Crusher Management</p>
            </div>
            <div style="text-align: right;">
                <div id="real-time-clock" style="font-size: 32px; font-weight: 800; font-family: 'Montserrat', sans-serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">00:00:00</div>
                <div id="real-time-date" style="font-size: 14px; opacity: 0.95; font-weight: 600; margin-top: 2px;">Thursday, 16 April 2026</div>
            </div>
        </div>

        <div class="grid-4">
            <div id="card-total-sales" class="stat-card clickable-card" style="cursor: pointer; transition: transform 0.2s; border: 2px solid transparent;">
                <div class="stat-info">
                    <p>Total Sales (Kul Bikri)</p>
                    <h3>${formatCurrency(stats.totalSales)}</h3>
                </div>
                <div class="stat-icon"><i class="ri-line-chart-line"></i></div>
                <div style="position: absolute; bottom: 8px; right: 12px; font-size: 10px; color: #64748b; font-weight: bold;">CLICK FOR LIST</div>
            </div>
            <div id="card-total-received" class="stat-card clickable-card" style="cursor: pointer; transition: transform 0.2s; border: 2px solid transparent;">
                <div class="stat-info">
                    <p>Total Received (Wasooli)</p>
                    <h3>${formatCurrency(stats.totalReceived)}</h3>
                </div>
                <div class="stat-icon" style="background: rgba(46, 125, 50, 0.1); color: var(--success-color)"><i class="ri-wallet-3-line"></i></div>
                <div style="position: absolute; bottom: 8px; right: 12px; font-size: 10px; color: #64748b; font-weight: bold;">CLICK FOR LIST</div>
            </div>
            <div id="card-total-due" class="stat-card clickable-card" style="cursor: pointer; transition: transform 0.2s; border: 2px solid transparent;">
                <div class="stat-info">
                    <p>Total Due (Baqaya)</p>
                    <h3 style="color: var(--danger-color)">${formatCurrency(stats.totalDue)}</h3>
                </div>
                <div class="stat-icon" style="background: rgba(229, 57, 53, 0.1); color: var(--danger-color)"><i class="ri-alert-line"></i></div>
                <div style="position: absolute; bottom: 8px; right: 12px; font-size: 10px; color: #64748b; font-weight: bold;">CLICK FOR DETAILS</div>
            </div>
        </div>

        <!-- HIDDEN DETAIL SECTION FOR SALES -->
        <div id="sales-details-section" class="card" style="display: none; margin-top: -10px; margin-bottom: 24px; border-top: 4px solid var(--primary-color); animation: slideDown 0.3s ease-out;">
            <div class="card-header">
                <h3 style="color: var(--primary-color);"><i class="ri-history-line"></i> Recent Sales List (Aakhri Farokht)</h3>
                <button class="btn btn-outline" onclick="document.getElementById('sales-details-section').style.display='none'">Close</button>
            </div>
            <div class="table-responsive">
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Party</th>
                            <th>Material</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.recentSales.reverse().map(s => `
                            <tr>
                                <td>${formatDate(s.date)}</td>
                                <td style="font-weight: 600;">${(DB.getClientById(s.clientId) || {}).name}</td>
                                <td><span class="badge" style="background: #e0f2fe; color: #0284c7;">${s.material}</span></td>
                                <td style="font-weight: 700;">${formatCurrency(s.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="padding: 15px; text-align: right;">
                    <button class="btn btn-link" onclick="window.router.navigate('sales')" style="color: var(--primary-color); font-weight: bold;">View Full Sales Register →</button>
                </div>
            </div>
        </div>

        <!-- HIDDEN DETAIL SECTION FOR RECEIVED -->
        <div id="received-details-section" class="card" style="display: none; margin-top: -10px; margin-bottom: 24px; border-top: 4px solid var(--success-color); animation: slideDown 0.3s ease-out;">
            <div class="card-header">
                <h3 style="color: var(--success-color);"><i class="ri-history-line"></i> Recent Payments Received (Aakhri Wasooliyan)</h3>
                <button class="btn btn-outline" onclick="document.getElementById('received-details-section').style.display='none'">Close</button>
            </div>
            <div class="table-responsive">
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Party</th>
                            <th>Method</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.recentPayments.reverse().map(p => `
                            <tr>
                                <td>${formatDate(p.date)}</td>
                                <td style="font-weight: 600;">${(DB.getClientById(p.clientId) || {}).name}</td>
                                <td><span class="badge" style="background: #f0fdf4; color: #166534;">${p.method}</span></td>
                                <td style="font-weight: 700; color: var(--success-color);">${formatCurrency(p.amount)}</td>
                            </tr>
                        `).join('')}
                        ${stats.recentPayments.length === 0 ? '<tr><td colspan="4" style="text-align:center">Abhi tak koi wasooli nahi hui.</td></tr>' : ''}
                    </tbody>
                </table>
                <div style="padding: 15px; text-align: right;">
                    <button class="btn btn-link" onclick="window.router.navigate('payments')" style="color: var(--success-color); font-weight: bold;">View Full Payment Register →</button>
                </div>
            </div>
        </div>

        <!-- HIDDEN DETAIL SECTION FOR CLIENT BALANCES -->
        <div id="due-details-section" class="card" style="display: none; margin-top: -10px; margin-bottom: 24px; border-top: 4px solid var(--danger-color); animation: slideDown 0.3s ease-out;">
            <div class="card-header">
                <h3 style="color: var(--danger-color);"><i class="ri-bank-card-line"></i> Party-wise Balance Details (Kis se kitne lene hain)</h3>
                <button class="btn btn-outline" onclick="document.getElementById('due-details-section').style.display='none'">Close</button>
            </div>
            <div class="table-responsive">
                <table style="width: 100%;">
                    <thead>
                        <tr style="background: #fff5f5;">
                            <th>Party Name (Khata Dar)</th>
                            <th>Total Sales</th>
                            <th>Received</th>
                            <th style="color: var(--danger-color)">Current Balance</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.clientBalances.map(cb => `
                            <tr>
                                <td style="font-weight: 700;">${cb.name}</td>
                                <td>${formatCurrency(cb.totalDue)}</td>
                                <td>${formatCurrency(cb.received)}</td>
                                <td style="font-weight: 800; color: var(--danger-color);">${formatCurrency(cb.balance)}</td>
                                <td>
                                    <button class="btn btn-outline" onclick="window.router.navigate('invoice', {clientId: ${cb.id}})" style="padding: 4px 8px; font-size: 11px;">View Ledger</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${stats.clientBalances.length === 0 ? '<tr><td colspan="5" style="text-align:center">Sab clients ka hisab bara-bar hai (No pending dues).</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>

        <style>
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .clickable-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                border-color: #1e3c72 !important;
            }
        </style>

        <!-- Low Stock Notification -->
        ${stats.lowStockCount > 0 ? `
            <div class="card" style="border-left: 5px solid #ef4444; background: #fff5f5; margin-bottom: 24px; animation: slideDown 0.4s ease-out;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <div style="background: #ef4444; color: white; width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);">
                            <i class="ri-error-warning-fill"></i>
                        </div>
                        <div>
                            <h4 style="margin:0; color: #991b1b; font-size: 16px;">Low Stock Alert! (Maal Khatam Hone Wala Hai)</h4>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #b91c1c;">Attention: <strong>${stats.lowStockCount}</strong> material(s) are running low in inventory.</p>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="window.router.navigate('settings')" style="background: #dc2626; border: none; padding: 8px 16px; font-weight: 700;">Manage Stock</button>
                </div>
            </div>
        ` : ''}

        <div class="card">
            <div class="card-header">
                <h3>Recent Transactions</h3>
                <button class="btn btn-outline" onclick="window.router.navigate('sales')">View All</button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Vehicle</th>
                            <th>Material</th>
                            <th>Weight</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.recentSales.reverse().map(sale => `
                            <tr>
                                <td>${formatDate(sale.date)}</td>
                                <td>${sale.vehicle || '-'}</td>
                                <td><span class="badge" style="background: #e0f2fe; color: #0284c7;">${sale.material}</span></td>
                                <td>${(sale.weight).toLocaleString()} kg</td>
                                <td><strong>${formatCurrency(sale.amount)}</strong></td>
                            </tr>
                        `).join('')}
                        ${stats.recentSales.length === 0 ? '<tr><td colspan="5" style="text-align:center">No recent transactions.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    window.router.onRender('dashboard', () => {
        const clockEl = document.getElementById('real-time-clock');
        const dateEl = document.getElementById('real-time-date');
        
        const updateClock = () => {
            const now = new Date();
            if(!clockEl) return;
            clockEl.innerText = now.toLocaleTimeString('en-GB', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase();
            dateEl.innerText = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        };
        
        // Initial call
        updateClock();
        // Set interval and store ID to clear it later if needed (simple app so we just let it run)
        const clockInterval = setInterval(() => {
            if(!document.getElementById('real-time-clock')) {
                clearInterval(clockInterval);
                return;
            }
            updateClock();
        }, 1000);

        // Toggle Logic for all cards
        const setupToggle = (cardId, sectionId) => {
            const card = document.getElementById(cardId);
            const section = document.getElementById(sectionId);
            if(card && section) {
                card.addEventListener('click', () => {
                    const sections = ['sales-details-section', 'received-details-section', 'due-details-section'];
                    sections.forEach(sId => {
                        if(sId !== sectionId) document.getElementById(sId).style.display = 'none';
                    });
                    const isHidden = section.style.display === 'none';
                    section.style.display = isHidden ? 'block' : 'none';
                    if(isHidden) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            }
        };

        setupToggle('card-total-sales', 'sales-details-section');
        setupToggle('card-total-received', 'received-details-section');
        setupToggle('card-total-due', 'due-details-section');
    });

    return html;
};
