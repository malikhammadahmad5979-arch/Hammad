import { DB } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';

export const renderUdhaar = (params) => {
    const accounts = DB.getOutsideAccounts();
    const activeAccountId = params ? params.accountId : null;
    const activeAccount = activeAccountId ? DB.getOutsideAccountById(activeAccountId) : null;
    const ledger = activeAccountId ? DB.getAccountLedger(activeAccountId) : [];

    let html = `
        <div style="margin-bottom: 25px;">
            <h1 style="color: #1e3c72; margin: 0; font-size: 28px; font-weight: 800; border-bottom: 3px solid #1e3c72; display: inline-block; padding-bottom: 5px;">
                <i class="ri-hand-coin-line"></i> Udhaar Khata / Account Books
            </h1>
            <p style="color: #64748b; margin-top: 10px; font-size: 15px;">Gari rent aur deegar len-den ka hisab kitab yahan manage karein.</p>
        </div>

        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 25px;">
            <!-- Left Panel: Account List -->
            <div class="card" style="padding: 20px;">
                <h3 style="margin-bottom: 15px; color: #1e3c72;"><i class="ri-team-line"></i> Accounts List</h3>
                <button id="btn-add-account" class="btn btn-primary" style="width: 100%; margin-bottom: 20px;">
                    <i class="ri-user-add-line"></i> Naya Khata Kholein
                </button>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${accounts.map(acc => `
                        <div class="account-item ${activeAccountId == acc.id ? 'active' : ''}" 
                             onclick="window.router.navigate('credit-ledger', {accountId: ${acc.id}})"
                             style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: ${activeAccountId == acc.id ? '#f0f9ff' : 'white'}; border-left: ${activeAccountId == acc.id ? '5px solid #1e3c72' : '1px solid #e2e8f0'};">
                            <div style="font-weight: 700; color: #1e3c72;">${acc.name.toUpperCase()}</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Bal: <span style="font-weight: 800; color: ${acc.balance > 0 ? '#ef4444' : '#16a34a'};">${formatCurrency(acc.balance)}</span></div>
                        </div>
                    `).join('')}
                    ${accounts.length === 0 ? '<p style="text-align:center; color:#94a3b8; font-size:13px;">Koi account nahi mila.</p>' : ''}
                </div>
            </div>

            <!-- Right Panel: Ledger Details -->
            <div id="ledger-panel">
                ${activeAccount ? `
                    <div class="card" style="border-top: 5px solid #1e3c72;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                            <div>
                                <h2 style="margin: 0; color: #1e3c72;">${activeAccount.name} <span style="font-size: 14px; font-weight: normal; color: #64748b;">(Ledger)</span></h2>
                                <p style="margin: 5px 0 0 0; color: #64748b;"><i class="ri-whatsapp-line"></i> ${activeAccount.phone}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 12px; color: #64748b; font-weight: bold;">TOTAL PAYABLE (Baqaya)</div>
                                <div style="font-size: 24px; font-weight: 900; color: ${activeAccount.balance > 0 ? '#ef4444' : '#16a34a'};">${formatCurrency(activeAccount.balance)}</div>
                            </div>
                        </div>

                        <!-- Entry Form for Ledger -->
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
                            <h4 style="margin-top: 0; margin-bottom: 15px; color: #1e3c72;"><i class="ri-edit-2-line"></i> Post New Entry (Entry Darj Karein)</h4>
                            <form id="add-ledger-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                                <input type="hidden" name="accountId" value="${activeAccountId}">
                                <div>
                                    <label style="font-size: 12px; font-weight: bold;">Date</label>
                                    <input type="date" name="date" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div style="grid-column: span 2;">
                                    <label style="font-size: 12px; font-weight: bold;">Details (Tafseel)</label>
                                    <input type="text" name="description" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" placeholder="Diesel, Rent for 5 trucks, etc.">
                                </div>
                                <div>
                                    <label style="font-size: 12px; font-weight: bold;">Vehicle No (Optional)</label>
                                    <input type="text" name="vehicleNo" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" placeholder="Gari No">
                                </div>
                                <div>
                                    <label style="font-size: 12px; font-weight: bold;">Type</label>
                                    <select name="type" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;">
                                        <option value="debit">Naam (Hum ne lene hain)</option>
                                        <option value="credit">Jama (Wapis mil gaye/Ayien)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size: 12px; font-weight: bold;">Amount (Raqam)</label>
                                    <input type="number" name="amount" required style="width: 100%; padding: 8px; border: 2px solid #1e3c72; border-radius: 6px; font-weight: 700;">
                                </div>
                                <div style="display: flex; align-items: flex-end;">
                                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px;">Post Entry</button>
                                </div>
                            </form>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 15px;">
                            <button id="btn-print-ledger" class="btn btn-outline" style="color: #1e3c72; border-color: #1e3c72;"><i class="ri-printer-line"></i> Print Account Statement</button>
                            <button class="btn btn-outline" style="color: #ef4444; border-color: #ef4444;" onclick="window.deleteAccount(${activeAccountId})"><i class="ri-delete-bin-line"></i> Delete Account</button>
                        </div>

                        <div id="ledger-print-area" class="table-responsive">
                            <!-- Print Header -->
                            <div class="print-only" style="display:none; text-align:center; margin-bottom:30px;">
                                <h1 style="color: #1e3c72; margin: 0;">YOUSAF BROTHERS</h1>
                                <p style="margin: 5px 0; font-weight: bold;">Account Statement / Ledger Hisab</p>
                                <p style="margin: 0; font-size: 18px; font-weight: 900;">Party: ${activeAccount.name}</p>
                                <hr style="margin: 15px 0;">
                            </div>
                            <table style="width: 100%; border: 1px solid #e2e8f0;">
                                <thead style="background: #f1f5f9; color: #1e3c72;">
                                    <tr>
                                        <th style="border: 1px solid #cbd5e1;">Date</th>
                                        <th style="border: 1px solid #cbd5e1;">Details (Tafseel)</th>
                                        <th style="border: 1px solid #cbd5e1;">Vehicle</th>
                                        <th style="border: 1px solid #cbd5e1; text-align: right; color: #ef4444;">Naam (Debit)</th>
                                        <th style="border: 1px solid #cbd5e1; text-align: right; color: #16a34a;">Jama (Credit)</th>
                                        <th style="border: 1px solid #cbd5e1; text-align: right;">Baqaya (Balance)</th>
                                        <th class="no-print" style="border: 1px solid #cbd5e1;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${renderLedgerRows(ledger)}
                                </tbody>
                                <tfoot>
                                    <tr style="background: #f8fafc; font-weight: 800; font-size: 16px;">
                                        <td colspan="5" style="text-align: right; padding: 15px; border: 1px solid #cbd5e1;">TOTAL BALANCE (Current Status):</td>
                                        <td style="text-align: right; padding: 15px; border: 1px solid #cbd5e1; color: ${activeAccount.balance > 0 ? '#ef4444' : '#16a34a'};">${formatCurrency(activeAccount.balance)}</td>
                                        <td class="no-print" style="border: 1px solid #cbd5e1;"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                ` : `
                    <div class="card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: #94a3b8;">
                        <i class="ri-user-search-line" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                        <h3 style="margin: 0;">Please select an account to view ledger</h3>
                        <p>Bayein patti (left panel) se koi account select karein.</p>
                    </div>
                `}
            </div>
        </div>

        <!-- Add Account Modal Placeholder -->
        <div id="account-modal" style="display:none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: none; align-items: center; justify-content: center;">
            <div class="card" style="width: 400px; margin: 0;">
                <h3 style="margin-bottom: 20px;">Open New Account</h3>
                <form id="create-account-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; margin-bottom: 5px; font-weight: 600;">Full Name (Khata Dar ka Naam)</label>
                        <input type="text" name="name" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display:block; margin-bottom: 5px; font-weight: 600;">Phone Number</label>
                        <input type="text" name="phone" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn btn-primary" style="flex:1;">Create Account</button>
                        <button type="button" class="btn btn-outline" style="flex:1;" onclick="document.getElementById('account-modal').style.display='none'">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <style>
            .account-item:hover { transform: translateX(5px); border-color: #1e3c72; }
            @media print {
                .no-print { display: none !important; }
                .print-only { display: block !important; }
                .card { box-shadow: none !important; border: 1px solid #eee !important; margin: 0 !important; }
                body { background: white !important; }
            }
        </style>
    `;

    function renderLedgerRows(entries) {
        if (entries.length === 0) {
            return '<tr><td colspan="7" style="text-align:center; padding: 30px; color: #94a3b8;">Is account mein abhi koi entries nahi hain.</td></tr>';
        }
        let runningBal = 0;
        return entries.map(e => {
            const debit = parseFloat(e.debit) || 0;
            const credit = parseFloat(e.credit) || 0;
            runningBal += (debit - credit);
            return `
                <tr>
                    <td style="border: 1px solid #cbd5e1;">${formatDate(e.date)}</td>
                    <td style="border: 1px solid #cbd5e1; font-weight: 500;">${e.description}</td>
                    <td style="border: 1px solid #cbd5e1;">${e.vehicleNo || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; text-align: right; color: #ef4444; font-weight: 700;">${debit > 0 ? formatCurrency(debit) : '-'}</td>
                    <td style="border: 1px solid #cbd5e1; text-align: right; color: #16a34a; font-weight: 700;">${credit > 0 ? formatCurrency(credit) : '-'}</td>
                    <td style="border: 1px solid #cbd5e1; text-align: right; font-weight: 800; color: #1e3c72;">${formatCurrency(runningBal)}</td>
                    <td class="no-print" style="border: 1px solid #cbd5e1; text-align: center;">
                        <button class="btn btn-outline" onclick="window.deleteLedgerEntry(${e.id})" style="padding: 4px 8px; color: #ef4444; border-color: #ef4444;">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.router.onRender('credit-ledger', () => {
        const modal = document.getElementById('account-modal');
        const btnAdd = document.getElementById('btn-add-account');
        const createForm = document.getElementById('create-account-form');
        const ledgerForm = document.getElementById('add-ledger-form');

        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                modal.style.display = 'flex';
            });
        }

        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const acc = {
                    name: createForm.name.value,
                    phone: createForm.phone.value
                };
                const newAcc = DB.addOutsideAccount(acc);
                modal.style.display = 'none';
                window.router.navigate('credit-ledger', { accountId: newAcc.id });
            });
        }

        if (ledgerForm) {
            ledgerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const type = ledgerForm.type.value;
                const amount = parseFloat(ledgerForm.amount.value);
                const entry = {
                    accountId: parseInt(ledgerForm.accountId.value),
                    date: ledgerForm.date.value,
                    description: ledgerForm.description.value,
                    vehicleNo: ledgerForm.vehicleNo.value,
                    debit: type === 'debit' ? amount : 0,
                    credit: type === 'credit' ? amount : 0
                };
                DB.addLedgerEntry(entry);
                window.router.navigate('credit-ledger', { accountId: entry.accountId });
            });
        }

        window.deleteAccount = (id) => {
            if (confirm("Are you sure? Is account ka sara record hamesha k liye delete ho jaye ga.")) {
                DB.deleteOutsideAccount(id);
                window.router.navigate('credit-ledger');
            }
        };

        window.deleteLedgerEntry = (id) => {
            if (confirm("Are you sure you want to delete this ledger entry?")) {
                DB.deleteLedgerEntry(id);
                window.router.navigate('credit-ledger', { accountId: activeAccountId });
            }
        };

        const printBtn = document.getElementById('btn-print-ledger');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                const element = document.getElementById('ledger-print-area');
                const opt = {
                    margin: 0.5,
                    filename: `Ledger_${activeAccount.name}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save();
            });
        }
    });

    return html;
};
