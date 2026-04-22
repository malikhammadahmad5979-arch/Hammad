import { DB } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';

export const renderRoznamcha = () => {
    const cashbookEntries = DB.getCashbook().reverse();
    
    // Helper to calculate totals
    const calculateTotal = (list) => list.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);

    let html = `
        <div style="margin-bottom: 25px;">
            <h1 style="color: #1e3c72; margin: 0; font-size: 28px; font-weight: 800; border-bottom: 3px solid #1e3c72; display: inline-block; padding-bottom: 5px;">
                <i class="ri-book-3-line"></i> Roznamcha (Daily Ledger)
            </h1>
            <p style="color: #64748b; margin-top: 10px; font-size: 15px;">Daily kharchy aur gariyon ka hisab kitab yahan darj karein.</p>
        </div>

        <div class="card" style="border-top: 5px solid #1e3c72;">
            <div class="card-header" style="margin: -24px -24px 20px -24px; background: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; border-radius: 8px 8px 0 0;">
                <h3 style="margin:0; color: #1e3c72;"><i class="ri-add-box-line"></i> New Entry (Nayi Tafseel)</h3>
            </div>
            <form id="add-cash-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 600;">Date (Tareekh)</label>
                    <input type="date" name="date" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 600;">Details (Tafseel / Kharch)</label>
                    <input type="text" name="description" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;" placeholder="e.g. Diesel, Repair, Khana">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 600;">Vehicle No (Gari No)</label>
                    <input type="text" name="vehicleNo" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;" placeholder="Optional">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 600;">Location (Site / Kahan Gaii)</label>
                    <input type="text" name="location" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;" placeholder="Optional">
                </div>
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 700; color: #1e3c72;">Amount (Raqam / Rupee)</label>
                    <input type="number" name="amount" required style="width: 100%; padding: 10px; border: 2px solid #1e3c72; border-radius: 6px; font-weight: 700;" placeholder="0.00">
                </div>
                <div style="grid-column: 1 / -1; display: flex; justify-content: flex-end; margin-top: 10px;">
                    <button type="submit" class="btn btn-primary" style="padding: 12px 30px; font-weight: 700; background: #1e3c72;">
                        <i class="ri-save-line"></i> Save Entry (Mehfooz Karein)
                    </button>
                </div>
            </form>
        </div>

        <div class="card" style="background: #f8fafc; border-left: 5px solid #1e3c72; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div>
                        <label style="display:block; font-size: 12px; font-weight: 800; color: #64748b; margin-bottom: 4px;">FILTER BY DATE</label>
                        <input type="date" id="cash-filter-date" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <button id="btn-cash-today" class="btn btn-outline" style="margin-top: 18px;">Today</button>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-print-cashbook" class="btn btn-primary" style="background: #1e3c72;"><i class="ri-printer-line"></i> Print Daily Report</button>
                </div>
            </div>
        </div>

        <div id="cashbook-print-area" class="card">
            <div class="print-only" style="display: none; text-align: center; margin-bottom: 30px;">
                 <h1 style="color: #1e3c72; margin: 0;">YOUSAF BROTHERS</h1>
                 <p style="margin: 5px 0; font-weight: bold;">Daily Roznamcha Report</p>
                 <p id="print-date-display" style="font-size: 14px;"></p>
                 <hr style="border: 1px solid #eee; margin: 20px 0;">
            </div>

            <div class="table-responsive">
                <table style="width: 100%;">
                    <thead style="background: #f1f5f9;">
                        <tr>
                            <th>Date</th>
                            <th>Details (Tafseel)</th>
                            <th>Vehicle</th>
                            <th>Location</th>
                            <th style="text-align: right;">Amount</th>
                            <th class="no-print">Action</th>
                        </tr>
                    </thead>
                    <tbody id="cashbook-tbody">
                        ${renderTableRows(cashbookEntries)}
                    </tbody>
                    <tfoot>
                        <tr style="background: #1e3c72; color: white; font-weight: 800;">
                            <td colspan="4" style="text-align: right; padding: 15px;">TOTAL EXPENDITURE:</td>
                            <td id="cash-total-display" style="text-align: right; padding: 15px; font-size: 18px;">${formatCurrency(calculateTotal(cashbookEntries))}</td>
                            <td class="no-print"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <style>
            @media print {
                .no-print { display: none !important; }
                .print-only { display: block !important; }
                .card { box-shadow: none !important; border: 1px solid #eee !important; }
                body { background: white !important; }
            }
        </style>
    `;

    function renderTableRows(entries) {
        if (entries.length === 0) {
            return '<tr><td colspan="6" style="text-align:center; padding: 30px; color: #94a3b8;">No entries found.</td></tr>';
        }
        return entries.map(e => `
            <tr>
                <td>${formatDate(e.date)}</td>
                <td style="font-weight: 500;">${e.description}</td>
                <td>${e.vehicleNo || '-'}</td>
                <td>${e.location || '-'}</td>
                <td style="text-align: right; font-weight: 700; color: #1e3c72;">${formatCurrency(e.amount)}</td>
                <td class="no-print">
                    <button class="btn btn-outline" onclick="window.deleteCashEntry(${e.id})" style="padding: 4px 8px; color: #ef4444; border-color: #ef4444;">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.router.onRender('cashbook', () => {
        const form = document.getElementById('add-cash-form');
        const filterDate = document.getElementById('cash-filter-date');
        const tbody = document.getElementById('cashbook-tbody');
        const totalDisplay = document.getElementById('cash-total-display');

        const updateTable = () => {
            const date = filterDate.value;
            let filtered = DB.getCashbook();
            if (date) {
                filtered = filtered.filter(e => e.date === date);
            }
            tbody.innerHTML = renderTableRows(filtered.reverse());
            totalDisplay.innerText = formatCurrency(calculateTotal(filtered));
        };

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const entry = {
                    date: form.date.value,
                    description: form.description.value,
                    vehicleNo: form.vehicleNo.value,
                    location: form.location.value,
                    amount: parseFloat(form.amount.value)
                };
                DB.addCashbookEntry(entry);
                form.reset();
                form.date.value = new Date().toISOString().split('T')[0];
                updateTable();
            });
        }

        if (filterDate) {
            filterDate.addEventListener('change', updateTable);
        }

        document.getElementById('btn-cash-today').addEventListener('click', () => {
            filterDate.value = new Date().toISOString().split('T')[0];
            updateTable();
        });

        window.deleteCashEntry = (id) => {
            if (confirm("Are you sure you want to delete this entry?")) {
                DB.deleteCashbookEntry(id);
                updateTable();
            }
        };

        document.getElementById('btn-print-cashbook').addEventListener('click', () => {
            const date = filterDate.value || 'All Time';
            document.getElementById('print-date-display').innerText = `Date: ${date}`;
            
            const element = document.getElementById('cashbook-print-area');
            const opt = {
                margin: 0.5,
                filename: `Roznamcha_${date}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        });
        
        // Initial load
        updateTable();
    });

    return html;
};
