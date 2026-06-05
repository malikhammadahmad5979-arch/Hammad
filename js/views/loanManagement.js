import { DB } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';

export const renderLoanManagement = (params) => {
    const loans = DB.getLoans();
    const activeLoanId = params ? params.loanId : null;
    const activeLoan = activeLoanId ? DB.getLoanById(activeLoanId) : null;
    const ledger = activeLoanId ? DB.getLoanTransactions(activeLoanId) : [];

    // Profit Calculations for Suggestions
    const stats = DB.getDashboardStats();
    const cashbook = DB.getCashbook();
    const totalExpenses = cashbook.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const netProfit = stats.totalSales - totalExpenses;

    const totalLoans = loans.reduce((sum, l) => sum + (l.balance || 0), 0);

    // Dynamic Suggestion Engine HTML
    let suggestionHtml = '';
    if (totalLoans === 0) {
        suggestionHtml = `
            <div class="card" style="border-left: 5px solid #22c55e; background: #f0fdf4; margin-bottom: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="background: #22c55e; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2);">
                        <i class="ri-checkbox-circle-fill"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0; color: #166534; font-size: 16px; font-weight: 700;">MashaAllah! Koi Karza Nahi Hai</h4>
                        <p style="margin: 4px 0 0 0; font-size: 13px; color: #15803d; font-weight: 500;">Aap pe abhi koi outstanding karza nahi hai. Sab records saaf hain!</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        const sortedLoans = [...loans].filter(l => l.balance > 0).sort((a, b) => b.balance - a.balance);
        if (sortedLoans.length > 0) {
            const highestLender = sortedLoans[0];
            if (netProfit <= 0) {
                suggestionHtml = `
                    <div class="card" style="border-left: 5px solid #eab308; background: #fef9c3; margin-bottom: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background: #eab308; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 6px rgba(234, 179, 8, 0.2);">
                                <i class="ri-information-fill"></i>
                            </div>
                            <div>
                                <h4 style="margin: 0; color: #854d0e; font-size: 16px; font-weight: 700;">💡 Smart Karz Repayment Suggestions</h4>
                                <p style="margin: 4px 0 0 0; font-size: 13px; color: #a16207; font-weight: 500;">
                                    Abhi business mein safi munafa (Net Profit) kam ya loss mein hai. Cash flow save rakhein. 
                                    Agar mumkin ho, to <strong>${highestLender.name}</strong> ko choti installment (e.g. <strong>Rs. 2,000 ya 5,000</strong>) pay kar k karza halka karein.
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                let suggestedPay = 5000;
                if (netProfit > 100000) {
                    suggestedPay = 20000;
                } else if (netProfit > 50000) {
                    suggestedPay = 10000;
                } else if (netProfit > 20000) {
                    suggestedPay = 5000;
                } else {
                    suggestedPay = Math.max(2000, Math.floor(netProfit * 0.15));
                }
                
                suggestedPay = Math.min(suggestedPay, highestLender.balance);
                suggestedPay = Math.floor(suggestedPay / 500) * 500; // round to nearest 500
                if (suggestedPay === 0) suggestedPay = Math.min(1000, highestLender.balance);

                suggestionHtml = `
                    <div class="card" style="border-left: 5px solid #3b82f6; background: #eff6ff; margin-bottom: 25px; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.15); border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                            <div style="display: flex; align-items: center; gap: 15px; flex: 1; min-width: 250px;">
                                <div style="background: #3b82f6; color: white; width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);">
                                    <i class="ri-lightbulb-fill"></i>
                                </div>
                                <div>
                                    <h4 style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 700;">💡 Smart Karz Repayment Plan (Tajweez)</h4>
                                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #1e3a8a; font-weight: 500;">
                                        Safi munafa <strong>${formatCurrency(netProfit)}</strong> ki bunyad par, hum mashwara detey hain k aap <strong>${highestLender.name}</strong> ko <strong>${formatCurrency(suggestedPay)}</strong> pay kar dein. 
                                        Is tarah ahsta ahsta saara karza utar jaye ga!
                                    </p>
                                </div>
                            </div>
                            <button class="btn btn-primary" onclick="window.quickPayLoan(${highestLender.id}, ${suggestedPay})" style="background: #3b82f6; font-weight: 800; padding: 12px 20px; border: none; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);">
                                <i class="ri-wallet-3-line"></i> Rs. ${suggestedPay.toLocaleString()} Pay Karein
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }

    let html = `
        <div style="margin-bottom: 25px;">
            <h1 style="color: #1e3c72; margin: 0; font-size: 28px; font-weight: 800; border-bottom: 3px solid #1e3c72; display: inline-block; padding-bottom: 5px;">
                <i class="ri-hand-coin-line"></i> Loan Management (Karza Khata)
            </h1>
            <p style="color: #64748b; margin-top: 10px; font-size: 15px;">Karzon ka mukammal hisab kitab aur wapsi k mashwaray yahan mulahiza karein.</p>
        </div>

        <!-- Suggestion Panel -->
        ${suggestionHtml}

        <div style="display: grid; grid-template-columns: 320px 1fr; gap: 25px;">
            <!-- Left Panel: Lenders List -->
            <div class="card" style="padding: 20px; border-radius: 12px;">
                <h3 style="margin-bottom: 15px; color: #1e3c72; font-weight: 700; font-size: 18px;"><i class="ri-team-line"></i> Lenders List (Members)</h3>
                <button id="btn-add-lender" class="btn btn-primary" style="width: 100%; margin-bottom: 20px; font-weight: 700; background: #1e3c72; border: none;">
                    <i class="ri-user-add-line"></i> Naya Loan Account
                </button>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${loans.map(l => `
                        <div class="lender-item ${activeLoanId == l.id ? 'active' : ''}" 
                             onclick="window.router.navigate('loan-management', {loanId: ${l.id}})"
                             style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: ${activeLoanId == l.id ? '#f0f9ff' : 'white'}; border-left: ${activeLoanId == l.id ? '5px solid #1e3c72' : '1px solid #e2e8f0'};">
                            <div style="font-weight: 700; color: #1e3c72; font-size: 14px;">${l.name.toUpperCase()}</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Payable: <span style="font-weight: 800; color: ${l.balance > 0 ? '#ef4444' : '#16a34a'};">${formatCurrency(l.balance)}</span></div>
                        </div>
                    `).join('')}
                    ${loans.length === 0 ? '<p style="text-align:center; color:#94a3b8; font-size:13px; padding: 20px 0;">Koi loan account nahi mila.</p>' : ''}
                </div>
            </div>

            <!-- Right Panel: Ledger details -->
            <div id="ledger-panel">
                ${activeLoan ? `
                    <div class="card" style="border-top: 5px solid #1e3c72; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                            <div>
                                <h2 style="margin: 0; color: #1e3c72; font-weight: 800; font-size: 22px;">${activeLoan.name} <span style="font-size: 14px; font-weight: normal; color: #64748b;">(Loan Ledger)</span></h2>
                                <p style="margin: 5px 0 0 0; color: #64748b; font-weight: 500;"><i class="ri-phone-line"></i> ${activeLoan.phone}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 11px; color: #64748b; font-weight: 800; letter-spacing: 0.5px;">TOTAL OUTSTANDING</div>
                                <div style="font-size: 26px; font-weight: 900; color: ${activeLoan.balance > 0 ? '#ef4444' : '#16a34a'};">${formatCurrency(activeLoan.balance)}</div>
                            </div>
                        </div>

                        <!-- Add transaction form -->
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
                            <h4 style="margin-top: 0; margin-bottom: 15px; color: #1e3c72; font-weight: 700; font-size: 15px;"><i class="ri-edit-2-line"></i> Transaction Input (Raqam Ka Indiraj)</h4>
                            <form id="add-loan-tx-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px;">
                                <input type="hidden" name="loanId" value="${activeLoanId}">
                                <div>
                                    <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">Date</label>
                                    <input type="date" name="date" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div style="grid-column: span 2;">
                                    <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">Details (Tafseel)</label>
                                    <input type="text" name="description" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px;" placeholder="Borrowed, paid installment, etc.">
                                </div>
                                <div>
                                    <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">Type</label>
                                    <select name="type" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 600;">
                                        <option value="borrow">Hum ne liye (+ Borrowed)</option>
                                        <option value="payback">Hum ne diye (- Paid Back)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">Amount (Raqam)</label>
                                    <input type="number" id="tx-amount-input" name="amount" required style="width: 100%; padding: 8px; border: 2px solid #1e3c72; border-radius: 6px; font-weight: 800;">
                                </div>
                                <div style="display: flex; align-items: flex-end;">
                                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px; font-weight: 700; background: #1e3c72; border: none;">Post Entry</button>
                                </div>
                            </form>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 15px;">
                            <button id="btn-print-loan-ledger" class="btn btn-outline" style="color: #1e3c72; border-color: #1e3c72; font-weight: 600;"><i class="ri-printer-line"></i> Print Statement</button>
                            <button class="btn btn-outline" style="color: #ef4444; border-color: #ef4444; font-weight: 600;" onclick="window.deleteLoanAccount(${activeLoanId})"><i class="ri-delete-bin-line"></i> Delete Account</button>
                        </div>

                        <div id="loan-print-area" class="table-responsive">
                            <div class="print-only" style="display:none; text-align:center; margin-bottom:30px;">
                                <h1 style="color: #1e3c72; margin: 0; font-weight: 900;">YOUSAF BROTHERS</h1>
                                <p style="margin: 5px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Loan Statement / Karza Khata</p>
                                <p style="margin: 0; font-size: 18px; font-weight: 800;">Lender: ${activeLoan.name}</p>
                                <hr style="margin: 15px 0;">
                            </div>
                            <table style="width: 100%; border: 1px solid #e2e8f0; border-collapse: collapse;">
                                <thead style="background: #f1f5f9; color: #1e3c72;">
                                    <tr>
                                        <th style="border: 1px solid #cbd5e1; padding: 10px;">Date</th>
                                        <th style="border: 1px solid #cbd5e1; padding: 10px;">Details (Tafseel)</th>
                                        <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #ef4444;">Borrowed (+)</th>
                                        <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #16a34a;">Paid Back (-)</th>
                                        <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">Balance</th>
                                        <th class="no-print" style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${renderLedgerRows(ledger)}
                                </tbody>
                                <tfoot>
                                    <tr style="background: #f8fafc; font-weight: 800; font-size: 16px;">
                                        <td colspan="4" style="text-align: right; padding: 15px; border: 1px solid #cbd5e1;">OUTSTANDING BALANCE:</td>
                                        <td style="text-align: right; padding: 15px; border: 1px solid #cbd5e1; color: ${activeLoan.balance > 0 ? '#ef4444' : '#16a34a'};">${formatCurrency(activeLoan.balance)}</td>
                                        <td class="no-print" style="border: 1px solid #cbd5e1;"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                ` : `
                    <div class="card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: #94a3b8; border-radius: 12px;">
                        <i class="ri-user-search-line" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                        <h3 style="margin: 0; font-weight: 700;">Select Lender Account</h3>
                        <p>Bayein patti (left panel) se koi loan account select karein.</p>
                    </div>
                `}
            </div>
        </div>

        <!-- Add Lender Modal -->
        <div id="lender-modal" style="display:none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div class="card" style="width: 400px; margin: 0; border-radius: 12px; border-top: 5px solid #1e3c72; padding: 25px;">
                <h3 style="margin-bottom: 20px; color: #1e3c72; font-weight: 800;"><i class="ri-user-add-line"></i> Open Loan Account</h3>
                <form id="create-lender-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; margin-bottom: 5px; font-weight: 700; color: #334155;">Lender Name (Karz Dahn ka Naam)</label>
                        <input type="text" name="name" required style="width: 100%; padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display:block; margin-bottom: 5px; font-weight: 700; color: #334155;">Phone Number</label>
                        <input type="text" name="phone" required style="width: 100%; padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 8px;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn btn-primary" style="flex:1; justify-content: center; font-weight: 700; background: #1e3c72;">Create Account</button>
                        <button type="button" class="btn btn-outline" style="flex:1; justify-content: center; font-weight: 700;" onclick="document.getElementById('lender-modal').style.display='none'">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <style>
            .lender-item:hover { transform: translateX(5px); border-color: #1e3c72; }
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
            return '<tr><td colspan="6" style="text-align:center; padding: 30px; color: #94a3b8; border: 1px solid #cbd5e1;">Is account mein abhi koi entries nahi hain.</td></tr>';
        }
        let runningBal = 0;
        return entries.map(e => {
            const borrowed = e.type === 'borrow' ? (parseFloat(e.amount) || 0) : 0;
            const payback = e.type === 'payback' ? (parseFloat(e.amount) || 0) : 0;
            runningBal += (borrowed - payback);
            return `
                <tr>
                    <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">${formatDate(e.date)}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: 500;">${e.description}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #ef4444; font-weight: 700;">${borrowed > 0 ? formatCurrency(borrowed) : '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #16a34a; font-weight: 700;">${payback > 0 ? formatCurrency(payback) : '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: 800; color: #1e3c72;">${formatCurrency(runningBal)}</td>
                    <td class="no-print" style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">
                        <button class="btn btn-outline" onclick="window.deleteLoanTxEntry(${e.id})" style="padding: 4px 8px; color: #ef4444; border-color: #ef4444;">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Set up globally accessible routing helpers & event handlers
    window.router.onRender('loan-management', () => {
        const modal = document.getElementById('lender-modal');
        const btnAdd = document.getElementById('btn-add-lender');
        const createForm = document.getElementById('create-lender-form');
        const txForm = document.getElementById('add-loan-tx-form');

        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                modal.style.display = 'flex';
            });
        }

        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const lender = {
                    name: createForm.name.value,
                    phone: createForm.phone.value
                };
                const newLender = DB.addLoan(lender);
                modal.style.display = 'none';
                window.router.navigate('loan-management', { loanId: newLender.id });
            });
        }

        if (txForm) {
            txForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const type = txForm.type.value;
                const amount = parseFloat(txForm.amount.value);
                const entry = {
                    loanId: parseInt(txForm.loanId.value),
                    date: txForm.date.value,
                    description: txForm.description.value,
                    type: type,
                    amount: amount
                };
                DB.addLoanTransaction(entry);
                window.router.navigate('loan-management', { loanId: entry.loanId });
            });
        }

        window.deleteLoanAccount = (id) => {
            if (confirm("Kya aap waqai delete karna chahte hain? Is loan account ka sara record hamesha k liye delete ho jaye ga.")) {
                DB.deleteLoan(id);
                window.router.navigate('loan-management');
            }
        };

        window.deleteLoanTxEntry = (id) => {
            if (confirm("Kya aap waqai is entry ko delete karna chahte hain?")) {
                DB.deleteLoanTransaction(id);
                window.router.navigate('loan-management', { loanId: activeLoanId });
            }
        };

        window.quickPayLoan = (lenderId, amount) => {
            window.router.navigate('loan-management', { loanId: lenderId });
            // After navigating, fill form
            setTimeout(() => {
                const txFormEl = document.getElementById('add-loan-tx-form');
                if (txFormEl) {
                    txFormEl.type.value = 'payback';
                    txFormEl.description.value = 'Suggested Profit Payback';
                    const amountInput = document.getElementById('tx-amount-input');
                    if (amountInput) {
                        amountInput.value = amount;
                        amountInput.focus();
                        amountInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 100);
        };

        const printBtn = document.getElementById('btn-print-loan-ledger');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                const element = document.getElementById('loan-print-area');
                const opt = {
                    margin: 0.5,
                    filename: `Loan_Ledger_${activeLoan.name}.pdf`,
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
