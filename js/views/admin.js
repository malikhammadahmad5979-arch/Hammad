import { DB } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';

export const renderAdmin = () => {
    const stats = DB.getDashboardStats();
    const cashbook = DB.getCashbook();
    const outsideAccounts = DB.getOutsideAccounts();
    const inventory = DB.getInventory();
    
    // Calculate total expenses from cashbook
    const totalExpenses = cashbook.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const netProfit = stats.totalSales - totalExpenses;
    
    // Calculate total market dues (Stone Clients + Account Books)
    const totalMarketDues = stats.totalDue + outsideAccounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    let html = `
        <div style="margin-bottom: 30px;">
            <h1 style="color: #1e3c72; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -0.5px;">
                <i class="ri-shield-user-line"></i> Admin Command Center
            </h1>
            <p style="color: #64748b; margin-top: 5px; font-size: 16px;">Professional Enterprise Overview & Control Hub</p>
        </div>

        <!-- LEVEL 1: Executive Metrics -->
        <div class="grid-4" style="margin-bottom: 30px;">
            <div class="stat-card" style="border-bottom: 4px solid #1e3c72;">
                <div class="stat-info">
                    <p>Total Revenue (Gross Kamai)</p>
                    <h3 style="font-weight: 900;">${formatCurrency(stats.totalSales)}</h3>
                </div>
                <div class="stat-icon" style="background: #e0f2fe; color: #1e3c72;"><i class="ri-funds-box-line"></i></div>
            </div>
            <div class="stat-card" style="border-bottom: 4px solid #ef4444;">
                <div class="stat-info">
                    <p>Total Expenses (Kul Kharach)</p>
                    <h3 style="color: #ef4444; font-weight: 900;">${formatCurrency(totalExpenses)}</h3>
                </div>
                <div class="stat-icon" style="background: #fee2e2; color: #ef4444;"><i class="ri-exchange-funds-line"></i></div>
            </div>
            <div class="stat-card" style="border-bottom: 4px solid #22c55e; background: #f0fdf4;">
                <div class="stat-info">
                    <p>Net Profit (Safi Munafa)</p>
                    <h3 style="color: #166534; font-weight: 900;">${formatCurrency(netProfit)}</h3>
                </div>
                <div class="stat-icon" style="background: #dcfce7; color: #166534;"><i class="ri-hand-coin-line"></i></div>
            </div>
            <div class="stat-card" style="border-bottom: 4px solid #f59e0b;">
                <div class="stat-info">
                    <p>Market Outstanding (Baqaya)</p>
                    <h3 style="color: #b45309; font-weight: 900;">${formatCurrency(totalMarketDues)}</h3>
                </div>
                <div class="stat-icon" style="background: #fef3c7; color: #b45309;"><i class="ri-bank-card-line"></i></div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; margin-bottom: 30px;">
            <!-- Column 1: Control Sections -->
            <div>
                <!-- Inventory Insights -->
                <div class="card" style="margin-bottom: 30px;">
                    <div class="card-header">
                        <h3 style="color: #1e3c72;"><i class="ri-stack-line"></i> Inventory & Stock Value</h3>
                        <span class="badge ${stats.lowStockCount > 0 ? 'danger' : 'success'}">
                            ${stats.lowStockCount > 0 ? `${stats.lowStockCount} Low Stock Items` : 'Stocks Healthy'}
                        </span>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Stock Level</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${inventory.map(i => `
                                    <tr>
                                        <td style="font-weight: 700;">${i.material}</td>
                                        <td>${i.qty.toLocaleString()} units</td>
                                        <td>
                                            <span class="badge ${i.qty < 5000 ? 'danger' : (i.qty < 15000 ? 'warning' : 'success')}">
                                                ${i.qty < 5000 ? 'Critical' : (i.qty < 15000 ? 'Low' : 'Good')}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Market Balances (Combined) -->
                <div class="card">
                    <div class="card-header">
                        <h3 style="color: #1e3c72;"><i class="ri-file-list-3-line"></i> Market Debt (Udhaar Summary)</h3>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Account Name</th>
                                    <th style="text-align: right;">Amount Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.clientBalances.slice(0, 5).map(cb => `
                                    <tr>
                                        <td><span class="badge" style="background: #e0f2fe; color: #0284c7;">Stone Client</span></td>
                                        <td style="font-weight: 600;">${cb.name}</td>
                                        <td style="text-align: right; color: #ef4444; font-weight: 700;">${formatCurrency(cb.balance)}</td>
                                    </tr>
                                `).join('')}
                                ${outsideAccounts.slice(0, 5).map(acc => `
                                    <tr>
                                        <td><span class="badge" style="background: #fef3c7; color: #b45309;">Vehicle/Acc</span></td>
                                        <td style="font-weight: 600;">${acc.name}</td>
                                        <td style="text-align: right; color: #ef4444; font-weight: 700;">${formatCurrency(acc.balance)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Column 2: Reporting & Audit -->
            <div>
                <!-- Professional Printing Hub -->
                <div class="card" style="background: #1e3c72; color: white;">
                    <h3 style="margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px;">
                        <i class="ri-printer-line"></i> Reporting & Audits
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="btn btn-outline" style="color: white; border-color: rgba(255,255,255,0.4); justify-content: flex-start; background: rgba(255,255,255,0.1);" onclick="window.router.navigate('invoice')">
                            <i class="ri-file-chart-line"></i> Generate Master Sales Report
                        </button>
                        <button class="btn btn-outline" style="color: white; border-color: rgba(255,255,255,0.4); justify-content: flex-start; background: rgba(255,255,255,0.1);" onclick="window.router.navigate('cashbook')">
                            <i class="ri-money-dollar-circle-line"></i> Daily Expense Statement
                        </button>
                        <button class="btn btn-outline" style="color: white; border-color: rgba(255,255,255,0.4); justify-content: flex-start; background: rgba(255,255,255,0.1);" onclick="window.router.navigate('credit-ledger')">
                            <i class="ri-hand-coin-line"></i> All Account Ledgers
                        </button>
                    </div>
                </div>

                <!-- Recent Audit Log -->
                <div class="card" style="margin-top: 30px;">
                    <h3 style="color: #1e3c72; margin-bottom: 15px;"><i class="ri-history-line"></i> Recent Activities</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        ${stats.recentSales.slice(-3).map(s => `
                            <div style="border-left: 3px solid #1e3c72; padding-left: 10px; font-size: 13px;">
                                <div style="font-weight: 700;">New Sale: ${s.vehicle}</div>
                                <div style="color: #64748b;">${formatDate(s.date)} | ${formatCurrency(s.amount)}</div>
                            </div>
                        `).join('')}
                        ${stats.recentPayments.slice(-3).map(p => `
                            <div style="border-left: 3px solid #22c55e; padding-left: 10px; font-size: 13px;">
                                <div style="font-weight: 700;">Payment Recv: ${(DB.getClientById(p.clientId) || {}).name}</div>
                                <div style="color: #64748b;">${formatDate(p.date)} | ${formatCurrency(p.amount)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    window.router.onRender('admin', () => {
        // Reserved for future charts (Chart.js integration)
    });

    return html;
};
