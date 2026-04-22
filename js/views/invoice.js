import { DB } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';

export const renderInvoice = (params) => {
    let sales = [];
    let invoiceInfoStr = "";

    // If params are passed (from filter), filter accordingly
    if (params && (params.clientId || params.from || params.to)) {
        sales = DB.getSales().reverse();
        if(params.clientId && params.clientId !== 'all') {
            sales = sales.filter(s => s.clientId == params.clientId);
            invoiceInfoStr = `<span style="color: #1e3c72; font-size: 15px;">STATEMENT</span>`;
        } else {
            invoiceInfoStr = `<span style="color: #1e3c72; font-size: 15px;">MASTER RECORD</span>`;
        }
        if(params.from) sales = sales.filter(s => s.date >= params.from);
        if(params.to) sales = sales.filter(s => s.date <= params.to);
    } else {
        // Default to latest invoice or master view if no params
        const invoiceId = params ? (params.id || 1) : 1;
        sales = DB.getSales(); 
        if(sales.length > 0) {
             invoiceInfoStr = `<span style="color: #1e3c72; font-size: 15px;">LATEST RECORD</span>`;
        }
    }

    const clients = DB.getClients();
    
    // Fetch client based on the first sale entry (or mark as Multiple Clients)
    let clientName = 'MULTIPLE CLIENTS';
    let clientPhone = '';
    let totalDueForWA = 0;
    let received = 0;
    let overallDue = 0;
    
    if (params && params.clientId && params.clientId !== 'all') {
        const cl = DB.getClientById(params.clientId);
        if(cl) {
             clientName = cl.name;
             clientPhone = cl.phone;
             overallDue = cl.totalDue;
             received = DB.getClientTotalReceived(params.clientId);
        }
    } else if (sales.length > 0) {
        const cl = DB.getClientById(sales[0].clientId);
        if(cl) {
             clientName = cl.name;
             clientPhone = cl.phone;
             overallDue = cl.totalDue;
             received = DB.getClientTotalReceived(sales[0].clientId);
        }
    }
    
    const totalWeight = sales.reduce((sum, s) => sum + s.weight, 0);
    const totalAmount = sales.reduce((sum, s) => sum + s.amount, 0);
    
    let displayBalance = 0;
    let displayReceived = 0;
    
    if (clientName !== 'MULTIPLE CLIENTS') {
        displayBalance = overallDue - received;
        displayReceived = received;
        totalDueForWA = displayBalance;
    } else {
        displayReceived = 0;
        displayBalance = totalAmount;
    }

    let html = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
            
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; text-align: center; }
            .invoice-table th { background-color: #f1f5f9; color: #1e3c72; border: 1px solid #cbd5e1; padding: 10px 8px; font-weight: 700; text-transform: uppercase; font-family: 'Montserrat', sans-serif; font-size: 11px;}
            .invoice-table td { border: 1px solid #cbd5e1; padding: 8px; font-weight: 500; font-family: 'Montserrat', sans-serif;}
            .invoice-table .total-row td { background-color: #1e3c72; color: #fff; font-size: 14px; font-weight: 700; border-color: #1e3c72; }
            .report-generator-box { background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 25px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: end; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        </style>

        <!-- MAIN PAGE HEADING -->
        <div style="margin-bottom: 25px;">
            <h1 style="color: #1e3c72; margin: 0; font-size: 28px; font-weight: 800; border-bottom: 3px solid #1e3c72; display: inline-block; padding-bottom: 5px;"><i class="ri-survey-line"></i> Party Ledger & Report Center</h1>
            <p style="color: #64748b; margin-top: 10px; font-size: 15px;">Yahan se aap kisi bhi party ka mukammal khata (Ledger) aur report nikal sakty hain.</p>
        </div>

        <!-- MANUAL REPORT GENERATOR HEADER -->
        <div class="card" id="filter-card" style="margin-bottom: 20px; border-top: 5px solid #1e3c72; ${(params && params.view === 'print') ? 'display:none;' : ''}">
            <h3 style="margin: 0 0 15px 0; color: #1e3c72;"><i class="ri-equalizer-line"></i> Generator Filters (Report Banayien)</h3>
            <div class="report-generator-box">
                <div>
                    <label style="display:block; margin-bottom: 5px; font-size: 12px; font-weight: bold; color: #475569;">SELECT PARTY (Client)</label>
                    <select id="inv-filter-client" style="width: 100%; padding: 11px; border: 1px solid #cbd5e1; border-radius: 6px; border-left: 4px solid #1e3c72; font-weight: 600;">
                        <option value="all">ALL PARTIES (Combined)</option>
                        ${clients.map(c => `<option value="${c.id}" ${params && params.clientId == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-size: 12px; font-weight: bold; color: #475569;">DATE FROM (Starting)</label>
                    <input type="date" id="inv-filter-from" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;" value="${params ? (params.from || '') : ''}">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-size: 12px; font-weight: bold; color: #475569;">DATE TO (Ending)</label>
                    <input type="date" id="inv-filter-to" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;" value="${params ? (params.to || '') : ''}">
                </div>
                <button id="btn-re-generate" class="btn btn-primary" style="padding: 12px; font-weight: 700; background: #1e3c72; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                    <i class="ri-refresh-line"></i> LOAD REPORT
                </button>
            </div>
        </div>

        <div class="card print-tools" style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; border-left: 5px solid #10b981;">
            <div>
                <h4 style="margin:0; color: #1e3c72;">Report Operations</h4>
                <p style="margin: 3px 0 0 0; font-size: 13px; color: #64748b;">Aap nichey di gayi live report ko download ya share kar saktay hain.</p>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="window.downloadPDF()" style="background: #1e3c72; padding: 10px 15px;"><i class="ri-download-2-line"></i> Download PDF</button>
                <button class="btn btn-primary" onclick="window.sharePDF('${clientName}')" style="background: #2563eb; padding: 10px 15px;"><i class="ri-share-forward-line"></i> Direct Share (PDF)</button>
                <button class="btn btn-outline" style="color: #128c7e; border-color: #128c7e; font-weight: bold; padding: 10px 15px;" onclick="window.shareWhatsApp('${clientPhone}', {clientName: '${clientName}', balance: '${displayBalance.toLocaleString()}', totalSales: '${totalAmount.toLocaleString()}', totalReceived: '${displayReceived.toLocaleString()}'})"><i class="ri-whatsapp-line"></i> Send Digital Receipt (1-Click)</button>
            </div>
        </div>

        ${sales.length === 0 ? `
            <div class="card" style="margin-top: 20px;">
                <p style="text-align: center; color: #ef4444; font-weight: bold; padding: 20px;">Selected filter ke mutabiq koi record nahi mila. (No data found)</p>
            </div>
        ` : `
            <div id="invoice-canvas" style="background: white; width: 210mm; min-height: 297mm; padding: 15mm; margin: 0 auto; box-shadow: 0 0 30px rgba(0,0,0,0.1); font-family: 'Montserrat', sans-serif; position: relative; color: #334155;">
                
                <!-- PERFECTED PREMIUM HEADER -->
                <div style="position: relative; width: 100%; height: 180px; margin-bottom: 40px; border-radius: 15px; overflow: hidden; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); display: flex; align-items: center; justify-content: space-between; padding: 0 45px; box-shadow: 0 10px 20px rgba(30, 60, 114, 0.15); border: 2px solid white; outline: 3px solid #1e3c72;">
                    
                    <!-- English Section -->
                    <div style="z-index: 2; color: white; display: flex; flex-direction: column; justify-content: center; height: 100%;">
                        <h1 style="font-weight: 900; font-size: 38px; margin: 0; letter-spacing: 0.5px; line-height: 1.1; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">YOUSAF BROTHERS</h1>
                        <p style="font-weight: 700; font-size: 14px; margin: 6px 0 20px 0; color: #93c5fd; text-transform: uppercase; letter-spacing: 3px;">General Order & Stone Supplier</p>
                        
                        <!-- Phone Pill (Strong Contrast) -->
                        <div style="background: white; color: #1e3c72; padding: 10px 22px; border-radius: 50px; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.15); width: fit-content;">
                            <i class="ri-phone-fill" style="font-size: 18px; color: #1e3c72;"></i>
                            <span style="font-weight: 900; font-size: 15px; letter-spacing: 0.5px; color: #1e3c72; display: inline-block;">0300-6805666 | 0333-8568500</span>
                        </div>
                    </div>

                    <!-- Urdu Section -->
                    <div style="z-index: 2; text-align: right; color: white; height: 100%; display: flex; flex-direction: column; justify-content: center; padding-top: 10px;" dir="rtl">
                        <h1 style="font-family: 'Noto Nastaliq Urdu', serif; font-weight: 700; font-size: 48px; margin: 0; line-height: 1.4; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">یوسف برادرز</h1>
                        <p style="font-family: 'Noto Nastaliq Urdu', serif; font-weight: bold; font-size: 22px; margin: 2px 0 8px 0; color: #93c5fd;">جنرل آرڈر اینڈ سٹون سپلائرز</p>
                        <p style="font-weight: 800; font-size: 16px; color: white; margin: 0; letter-spacing: 1px;">سخی سرور، ڈیرہ غازی خان</p>
                    </div>
                </div>

                <!-- INVOICE BILL DIVIDER -->
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
                        <div style="height: 2px; width: 60px; background: #e2e8f0;"></div>
                        <span style="color: #1e3c72; font-weight: 900; font-size: 26px; letter-spacing: 10px; text-transform: uppercase;">Invoice Bill</span>
                        <div style="height: 2px; width: 60px; background: #e2e8f0;"></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 40px; margin-bottom: 35px; padding: 30px; background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    <div style="display: grid; grid-template-columns: 140px 1fr; gap: 15px; font-size: 16px; align-items: center;">
                        <span style="color: #94a3b8; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Customer:</span>
                        <span style="font-weight: 900; color: #1e3c72; font-size: 24px; line-height: 1;">${clientName.toUpperCase()}</span>
                        
                        <span style="color: #94a3b8; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Document:</span>
                        <span style="font-weight: 800; color: #475569; letter-spacing: 0.5px;">${invoiceInfoStr.replace(/<\/?[^>]+(>|$)/g, "")}</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; font-size: 15px; border-left: 2px solid #f1f5f9; padding-left: 40px;">
                        <span style="color: #64748b; font-weight: 600;">Issue Date:</span>
                        <span style="font-weight: 800; color: #1e3c72;">${formatDate(new Date().toISOString().split('T')[0])}</span>

                        <span style="color: #64748b; font-weight: 600;">Due Period:</span>
                        <span style="font-weight: 800;">${params && params.from ? formatDate(params.from) : 'START'} - ${params && params.to ? formatDate(params.to) : 'LATEST'}</span>

                        <span style="color: #64748b; font-weight: 600;">Net Amount:</span>
                        <span style="font-weight: 900; color: #ef4444; font-size: 22px;">Rs. ${(totalAmount).toLocaleString()}</span>
                    </div>
                </div>

                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>S.NO</th>
                            <th>DATE</th>
                            <th>VEHICLE</th>
                            <th>BILTY NO</th>
                            <th>MATERIAL</th>
                            <th>SITE</th>
                            <th>WEIGHT (KG)</th>
                            <th>RATE</th>
                            <th>AMOUNT (RS)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map((sale, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${formatDate(sale.date)}</td>
                                <td>${sale.vehicle}</td>
                                <td>${sale.bilty}</td>
                                <td>${sale.material}</td>
                                <td>${sale.site}</td>
                                <td style="font-weight: 700; color: #1e3c72;">${sale.weight.toLocaleString()}</td>
                                <td style="font-weight: 700;">${sale.rate}</td>
                                <td style="font-weight: 700; color: #1e3c72;">${sale.amount.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="6" style="text-align: right; padding-right: 15px;">TOTAL</td>
                            <td>${totalWeight.toLocaleString()}</td>
                            <td></td>
                            <td>${totalAmount.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="display: flex; justify-content: flex-end; margin-top: 40px;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);" dir="ltr">
                        <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                            <span style="color: #1e3c72; font-size: 20px; font-weight: 700;">TOTAL RECEIVED</span> 
                            <span style="border-bottom: 2px dashed #1e3c72; width: 220px; text-align: right; padding-right: 10px; color: #334155; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 20px;">RS. ${displayReceived.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <span style="color: #1e3c72; font-size: 20px; font-weight: 700;">REMAINING DUE</span> 
                            <span style="border-bottom: 2px dashed #1e3c72; width: 220px; text-align: right; padding-right: 10px; color: #e53e3e; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 20px;">RS. ${displayBalance.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 40px;">
                     <div style="text-align: center; color: #94a3b8; font-size: 11px; font-weight: 600;">
                        <p style="margin: 0; letter-spacing: 0.5px;">System Created by</p>
                        <p style="margin: 3px 0 0 0; color: #1e3c72; font-weight: 800; font-size: 13px; text-transform: uppercase;">Jahanzeb Baloch</p>
                        <p style="margin: 2px 0 0 0; color: #64748b; font-size: 10px;">03060711529</p>
                     </div>
                     <div style="text-align: center;">
                        <br><br>
                        <div style="border-bottom: 1px solid #000; width: 150px; margin-bottom: 5px; height: 10px;"></div>
                        <span style="font-weight: 700; font-size: 13px; color: #334155;">Authorized Signature</span>
                     </div>
                </div>
            </div>
        `}
    `;

    window.router.onRender('invoice', () => {
        const btn = document.getElementById('btn-re-generate');
        if(btn) {
            btn.addEventListener('click', () => {
                const clientId = document.getElementById('inv-filter-client').value;
                const from = document.getElementById('inv-filter-from').value;
                const to = document.getElementById('inv-filter-to').value;
                window.router.navigate('invoice', { clientId, from, to });
            });
        }
    });

    return html;
};
