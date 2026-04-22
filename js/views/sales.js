import { DB } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';

export const renderSales = () => {
    const clients = DB.getClients();
    const allSales = DB.getSales().reverse();
    const inventory = DB.getInventory();

    // Helper to render the table body & footer based on a given array of sales
    const renderTableContent = (salesList) => {
        let tbodyHtml = '';
        let totalWeight = 0;
        let totalAmount = 0;

        salesList.forEach(sale => {
            const cl = clients.find(c => c.id == sale.clientId);
            totalWeight += sale.weight;
            totalAmount += sale.amount;

            tbodyHtml += `
                <tr>
                    <td><span style="font-weight:bold; color: #1e3c72;">#${sale.invoiceId}</span></td>
                    <td>${formatDate(sale.date)}</td>
                    <td>${cl ? cl.name : 'Unknown'}</td>
                    <td>${sale.vehicle}</td>
                    <td><span class="badge" style="background:#e0f2fe; color:#0284c7;">${sale.material}</span></td>
                    <td>${sale.weight.toLocaleString()} kg</td>
                    <td>Rs ${sale.rate}</td>
                    <td style="font-weight:700;">${formatCurrency(sale.amount)}</td>
                    <td style="white-space: nowrap;">
                         <button class="btn btn-outline" onclick="window.editSale(${sale.id})" style="padding: 4px 6px; font-size: 13px; color: #f59e0b; border-color: #f59e0b;" title="Edit"><i class="ri-edit-line"></i></button>
                         <button class="btn btn-outline" onclick="window.deleteSale(${sale.id})" style="padding: 4px 6px; font-size: 13px; color: #ef4444; border-color: #ef4444;" title="Delete"><i class="ri-delete-bin-line"></i></button>
                         <button class="btn btn-outline" onclick="window.router.navigate('invoice', {id: ${sale.invoiceId}})" style="padding: 4px 6px; font-size: 13px;" title="Print"><i class="ri-printer-line"></i></button>
                    </td>
                </tr>
            `;
        });

        if(salesList.length === 0) {
            tbodyHtml = '<tr><td colspan="9" style="text-align:center; padding: 20px; color:#6b7280;">No sales match the selected filters.</td></tr>';
        }

        // Summary Footer
        const summaryHtml = `
            <tr style="background-color: #1e3c72; color: white;">
                <td colspan="5" style="text-align: right; font-weight: 700; font-size: 15px;">TOTAL ENTRIES: ${salesList.length} &nbsp;|&nbsp; GRAND TOTAL:</td>
                <td style="font-weight: 700; font-size: 14px;">${totalWeight.toLocaleString()} kg</td>
                <td></td>
                <td colspan="2" style="font-weight: 800; font-size: 16px;">Rs. ${totalAmount.toLocaleString()}</td>
            </tr>
        `;

        return tbodyHtml + summaryHtml;
    };

    let html = `
        <!-- NAYA MAAL ENTRY FORM -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header" style="background-color: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; border-radius: 8px 8px 0 0; margin: -24px -24px 20px -24px;">
                <h3 id="form-header-title" style="margin: 0; color: #1e3c72;"><i class="ri-add-circle-line"></i> New Sale Entry (Naya Maal)</h3>
            </div>
            
            <form id="add-sale-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Date</label>
                    <input type="date" id="s-date" name="date" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500; display: flex; justify-content: space-between;">
                        Client 
                        <a href="javascript:void(0)" onclick="window.router.navigate('settings')" style="font-size: 11px; color: #0284c7;">+ Add New</a>
                    </label>
                    <select id="s-client" name="clientId" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="" disabled selected>Select Client...</option>
                        ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Vehicle No (Gari Number)</label>
                    <input type="text" id="s-vehicle" name="vehicle" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="e.g. 566-NAB">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Material</label>
                    <select id="s-material" name="material" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        ${inventory.map(inv => `<option value="${inv.material}">${inv.material}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Bilty No</label>
                    <input type="number" id="s-bilty" name="bilty" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Bilty No">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Site / Location</label>
                    <input type="text" id="s-site" name="site" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Site Address">
                </div>

                <div style="grid-column: 1 / -1; background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd; margin-top: 10px;">
                    <h4 style="margin-top:0; margin-bottom: 10px; color: #0369a1; font-size: 15px;"><i class="ri-ruler-line"></i> Safi Paimaish Calculator / پیمائش کیلکولیٹر (Optional)</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 15px;">
                        <div>
                            <label style="font-size: 13px; font-weight: 500;">Length (Lambai)</label>
                            <input type="number" id="calc-length" step="0.01" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;" placeholder="ft">
                        </div>
                        <div>
                            <label style="font-size: 13px; font-weight: 500;">Width (Churaii)</label>
                            <input type="number" id="calc-width" step="0.01" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;" placeholder="ft">
                        </div>
                        <div>
                            <label style="font-size: 13px; font-weight: 500;">Depth (Gehraii)</label>
                            <input type="number" id="calc-depth" step="0.01" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;" placeholder="ft">
                        </div>
                        <div>
                            <label style="font-size: 13px; font-weight: 700; color: #0284c7;">Total (Paimaish)</label>
                            <input type="number" id="calc-total" readonly style="width: 100%; padding: 6px; border: 1px solid #0ea5e9; background: #e0f2fe; border-radius: 4px; font-weight: bold; color: #0369a1;" placeholder="0">
                        </div>
                    </div>
                    
                    <details style="background: #ffffff; border: 1px solid #7dd3fc; border-radius: 8px; margin-top: 15px; padding: 12px; cursor: pointer;">
                        <summary style="font-size: 14px; font-weight: bold; color: #0284c7; outline: none; display: flex; align-items: center; justify-content: space-between;">
                            <span><i class="ri-information-line"></i> Paimaish (Inches) Rules / Conversion Table (Click to View)</span>
                            <i class="ri-arrow-down-s-line"></i>
                        </summary>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-top: 15px; cursor: default;">
                            <!-- Full Inches Section -->
                            <div style="border-right: 1px dashed #bae6fd; padding-right: 10px;">
                                <table style="width: 100%; font-size: 11px; text-align: left; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background-color: #f0f9ff; color: #0369a1;">
                                            <th style="padding: 6px; border-bottom: 2px solid #bae6fd;">Full Inch (")</th>
                                            <th style="padding: 6px; border-bottom: 2px solid #bae6fd;">Decimal (Ft)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">1"</td><td style="font-weight:bold; color: #1e3c72;">.08</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">2"</td><td style="font-weight:bold; color: #1e3c72;">.16</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">3"</td><td style="font-weight:bold; color: #1e3c72;">.25</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">4"</td><td style="font-weight:bold; color: #1e3c72;">.33</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">5"</td><td style="font-weight:bold; color: #1e3c72;">.41</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">6" (Half Foot)</td><td style="font-weight:bold; color: #1e3c72;">.50</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">7"</td><td style="font-weight:bold; color: #1e3c72;">.58</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">8"</td><td style="font-weight:bold; color: #1e3c72;">.66</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">9" (Pauna Foot)</td><td style="font-weight:bold; color: #1e3c72;">.75</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">10"</td><td style="font-weight:bold; color: #1e3c72;">.83</td></tr>
                                        <tr><td style="padding: 4px 6px;">11"</td><td style="font-weight:bold; color: #1e3c72;">.91</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Half Inches Section -->
                            <div style="padding-left: 0px;">
                                <table style="width: 100%; font-size: 11px; text-align: left; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background-color: #f0f9ff; color: #0369a1;">
                                            <th style="padding: 6px; border-bottom: 2px solid #bae6fd;">Half Inch (")</th>
                                            <th style="padding: 6px; border-bottom: 2px solid #bae6fd;">Decimal (Ft)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">1/2" (Aadha)</td><td style="font-weight:bold; color: #1e3c72;">.04</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">1 1/2" (Derh)</td><td style="font-weight:bold; color: #1e3c72;">.12</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">2 1/2" (Dhai)</td><td style="font-weight:bold; color: #1e3c72;">.21</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">3 1/2" (Sade 3)</td><td style="font-weight:bold; color: #1e3c72;">.29</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">4 1/2" (Sade 4)</td><td style="font-weight:bold; color: #1e3c72;">.37</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">5 1/2" (Sade 5)</td><td style="font-weight:bold; color: #1e3c72;">.46</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">6 1/2" (Sade 6)</td><td style="font-weight:bold; color: #1e3c72;">.54</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">7 1/2" (Sade 7)</td><td style="font-weight:bold; color: #1e3c72;">.62</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">8 1/2" (Sade 8)</td><td style="font-weight:bold; color: #1e3c72;">.71</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">9 1/2" (Sade 9)</td><td style="font-weight:bold; color: #1e3c72;">.79</td></tr>
                                        <tr><td style="padding: 4px 6px; border-bottom: 1px solid #eee;">10 1/2" (Sade 10)</td><td style="font-weight:bold; color: #1e3c72;">.87</td></tr>
                                        <tr><td style="padding: 4px 6px;">11 1/2" (Sade 11)</td><td style="font-weight:bold; color: #1e3c72;">.96</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </details>
                </div>

                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Weight / Quantity (Paimaish)</label>
                    <input type="number" id="s-weight" name="weight" step="0.01" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Total Qty/Weight">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Rate (Rs per kg/ft)</label>
                    <input type="number" id="s-rate" name="rate" step="0.01" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Rate">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 700; color: #0369a1;">Total Amount (Rs)</label>
                    <input type="number" id="s-amount" readonly style="width: 100%; padding: 8px; border: 1px solid #0284c7; background: #e0f2fe; border-radius: 4px; font-weight: bold; color: #0369a1;" placeholder="0.00">
                </div>

                <div style="grid-column: 1 / -1; display:flex; justify-content: flex-end; margin-top: 10px;">
                    <button type="submit" id="form-submit-btn" class="btn btn-primary" style="padding: 10px 25px; font-size: 16px;"><i class="ri-save-line"></i> Save Sale Entry (Mehfooz Karein)</button>
                </div>
            </form>
        </div>


        <!-- Filter & Report Tools -->
        <div class="card" style="margin-bottom: 24px; border-left: 5px solid #1e3c72; background: #f8fafc;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; align-items: end;">
                <div>
                    <label style="display:block; margin-bottom: 5px; font-size: 12px; font-weight: bold; color: #475569;">FILTER BY CLIENT</label>
                    <select id="filter-client" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                        <option value="all">All Clients</option>
                        ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-size: 12px; font-weight: bold; color: #475569;">FROM DATE</label>
                    <input type="date" id="filter-from" style="width: 100%; padding: 7px; border: 1px solid #cbd5e1; border-radius: 6px;">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-size: 12px; font-weight: bold; color: #475569;">TO DATE</label>
                    <input type="date" id="filter-to" style="width: 100%; padding: 7px; border: 1px solid #cbd5e1; border-radius: 6px;">
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="btn-apply-filter" class="btn btn-primary" style="flex: 1; padding: 10px; background: #1e3c72;"><i class="ri-filter-3-line"></i> Apply</button>
                    <button id="btn-reset-filter" class="btn btn-outline" style="padding: 10px;"><i class="ri-refresh-line"></i></button>
                </div>
                <button id="btn-print-statement" class="btn btn-outline" style="color: #1e3c72; border-color: #1e3c72; font-weight: bold;"><i class="ri-printer-line"></i> Statement</button>
            </div>
        </div>


        <!-- SALES RECORD (Historical Log) -->
        <div class="card">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #1e3c72;"><i class="ri-list-check"></i> Sales Registry / روزانہ کھاتہ</h3>
            </div>
            
            <div class="table-responsive">
                <table style="width: 100%;">
                    <thead style="background-color: #f1f5f9; color: #475569;">
                        <tr>
                            <th>Invoice Id</th>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Vehicle</th>
                            <th>Material</th>
                            <th>Weight / Paimaish</th>
                            <th>Rate</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="sales-tbody">
                        ${renderTableContent(allSales)}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // JavaScript logic applied after page renders
    window.router.onRender('sales', () => {
        // --- Form Logic ---
        const form = document.getElementById('add-sale-form');
        const len = document.getElementById('calc-length');
        const wid = document.getElementById('calc-width');
        const dep = document.getElementById('calc-depth');
        const total = document.getElementById('calc-total');
        const weightInput = document.getElementById('s-weight');
        const rateInput = document.getElementById('s-rate');
        const amountInput = document.getElementById('s-amount');

        const calculateTotalAmount = () => {
            const w = parseFloat(weightInput.value) || 0;
            const r = parseFloat(rateInput.value) || 0;
            if(w > 0 && r > 0) amountInput.value = (w * r).toFixed(0);
            else amountInput.value = '';
        };

        if(weightInput) weightInput.addEventListener('input', calculateTotalAmount);
        if(rateInput) rateInput.addEventListener('input', calculateTotalAmount);

        const calculatePaimaish = () => {
            const l = parseFloat(len.value) || 0;
            const w = parseFloat(wid.value) || 0;
            const d = parseFloat(dep.value) || 0;
            if(l > 0 && w > 0 && d > 0) {
                const result = (l * w * d).toFixed(2);
                total.value = result;
                weightInput.value = result; 
                calculateTotalAmount();
            } else {
                total.value = '';
            }
        };

        if(len) len.addEventListener('input', calculatePaimaish);
        if(wid) wid.addEventListener('input', calculatePaimaish);
        if(dep) dep.addEventListener('input', calculatePaimaish);

        let editingSaleId = null;

        window.editSale = (id) => {
            const sale = DB.getSaleById(id);
            if(!sale) return;
            editingSaleId = id;
            
            form.date.value = sale.date;
            form.clientId.value = sale.clientId;
            form.vehicle.value = sale.vehicle;
            form.material.value = sale.material;
            form.bilty.value = sale.bilty;
            form.site.value = sale.site;
            form.weight.value = sale.weight;
            form.rate.value = sale.rate;
            
            calculateTotalAmount();
            
            const btn = document.getElementById('form-submit-btn');
            btn.innerHTML = '<i class="ri-save-line"></i> Update Sale Record';
            btn.style.backgroundColor = '#f59e0b';
            btn.style.borderColor = '#f59e0b';
            document.getElementById('form-header-title').innerHTML = '<i class="ri-edit-line"></i> Update Sale Entry (Tabdeeli)';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.deleteSale = (id) => {
            if(confirm("Alert! Are you sure you want to completely DELETE this sale? Balances will be recalculated.")) {
                DB.deleteSale(id);
                window.router.navigate('sales');
            }
        };

        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const newData = {
                    date: form.date.value,
                    clientId: parseInt(form.clientId.value),
                    vehicle: form.vehicle.value,
                    material: form.material.value,
                    bilty: form.bilty.value,
                    site: form.site.value,
                    weight: parseFloat(form.weight.value),
                    rate: parseFloat(form.rate.value)
                };
                
                if(editingSaleId) {
                    DB.updateSale(editingSaleId, newData);
                    alert("Record Updated Successfully! / Record theek ho gaya!");
                } else {
                    newData.invoiceId = Math.floor(Math.random() * 1000) + 10;
                    DB.addSale(newData);
                    alert("Sale Record Saved Successfully! / Naya Maal Add ho gaya hai!");
                }
                window.router.navigate('sales');
            });
        }

        // --- Filter Logic ---
        const filterClient = document.getElementById('filter-client');
        const filterFrom = document.getElementById('filter-from');
        const filterTo = document.getElementById('filter-to');
        const btnApply = document.getElementById('btn-apply-filter');
        const btnReset = document.getElementById('btn-reset-filter');
        const tbodyTemplate = document.getElementById('sales-tbody');

        const applyFilters = () => {
            const cId = filterClient.value;
            const from = filterFrom.value;
            const to = filterTo.value;
            
            let filtered = DB.getSales().reverse();

            // Client Filter
            if(cId && cId !== 'all') {
                filtered = filtered.filter(s => s.clientId == cId);
            }
            // Date Filter
            if(from) {
                filtered = filtered.filter(s => s.date >= from);
            }
            if(to) {
                filtered = filtered.filter(s => s.date <= to);
            }

            // RE-RENDER table rows!
            // I will use a simple eval hook since i am in Vanilla JS, but normally I import the generator.
            // Oh wait, `renderTableContent` is local to the outer scope initially, I can't call it here easily directly without attaching it to window. 
            // Let's create the html string manually or just trigger a refresh with state.
            // Actually `renderTableContent` IS bound in this closure! We can use it!
            tbodyTemplate.innerHTML = renderTableContent(filtered);
        };

        if(btnApply) btnApply.addEventListener('click', applyFilters);
        if(btnReset) btnReset.addEventListener('click', () => {
            filterClient.value = 'all';
            filterFrom.value = '';
            filterTo.value = '';
            tbodyTemplate.innerHTML = renderTableContent(allSales); // reset
        });
        
        // Auto filter on client select
        if(filterClient) filterClient.addEventListener('change', applyFilters);

        const btnPrintStatement = document.getElementById('btn-print-statement');
        if(btnPrintStatement) {
            btnPrintStatement.addEventListener('click', () => {
                window.router.navigate('invoice', {
                    clientId: filterClient.value,
                    from: filterFrom.value, 
                    to: filterTo.value
                });
            });
        }
    });

    return html;
};
