import { DB } from '../store.js';
import { formatCurrency } from '../utils.js';

export const renderSentPayments = (params) => {
    const accounts = DB.getSentPaymentsAccounts();
    const activeId  = params && params.accId ? params.accId : null;
    const activeAcc = activeId ? DB.getSentPaymentsAccountById(activeId) : null;
    const ledger    = activeId ? DB.getSentPaymentsLedger(activeId) : [];

    const today = new Date().toISOString().split('T')[0];

    const ledgerRows = () => {
        if (!ledger.length) return `<tr><td colspan="5" style="text-align:center;padding:25px;color:#94a3b8;">Koi record nahi mila.</td></tr>`;
        return [...ledger].reverse().map(e => `
            <tr>
                <td style="border:1px solid #e2e8f0;padding:10px;">${e.date}</td>
                <td style="border:1px solid #e2e8f0;padding:10px;font-weight:500;">${e.purpose}</td>
                <td style="border:1px solid #e2e8f0;padding:10px;">${e.method}</td>
                <td style="border:1px solid #e2e8f0;padding:10px;text-align:right;color:#0284c7;font-weight:700;">${formatCurrency(e.amount)}</td>
                <td style="border:1px solid #e2e8f0;padding:10px;text-align:center;">
                    <button class="btn btn-outline" onclick="window.deleteSpEntry(${e.id})" style="padding:4px 8px;color:#ef4444;border-color:#ef4444;">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    };

    const html = `
        <div style="margin-bottom:25px;">
            <h1 style="color:#1e3c72;margin:0;font-size:28px;font-weight:800;border-bottom:3px solid #1e3c72;display:inline-block;padding-bottom:5px;">
                <i class="ri-arrow-up-circle-line"></i> Sent Payments (Bheji Gai Raqam)
            </h1>
            <p style="color:#64748b;margin-top:10px;font-size:15px;">Jis ko bhi paisy bheje hain unka mukammal record yahan rakhen.</p>
        </div>

        <div style="display:grid;grid-template-columns:300px 1fr;gap:25px;">

            <!-- LEFT: Recipients List -->
            <div class="card" style="padding:20px;border-radius:12px;">
                <h3 style="margin-bottom:15px;color:#1e3c72;font-weight:700;font-size:18px;"><i class="ri-team-line"></i> Recipients (Log)</h3>
                <button id="btn-add-sp-acc" class="btn btn-primary" style="width:100%;margin-bottom:20px;font-weight:700;background:#1e3c72;border:none;">
                    <i class="ri-user-add-line"></i> Naya Recipient Add Karein
                </button>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    ${accounts.map(acc => `
                        <div onclick="window.router.navigate('sent-payments',{accId:${acc.id}})"
                             style="padding:14px;border-radius:8px;cursor:pointer;transition:all 0.2s;
                                    background:${activeId == acc.id ? '#f0f9ff' : 'white'};
                                    border:${activeId == acc.id ? '2px solid #0284c7' : '1px solid #e2e8f0'};
                                    border-left:${activeId == acc.id ? '5px solid #0284c7' : '1px solid #e2e8f0'};">
                            <div style="font-weight:700;color:#1e3c72;font-size:14px;">${acc.name.toUpperCase()}</div>
                            <div style="font-size:12px;color:#64748b;margin-top:4px;">Total Bheji: <span style="font-weight:800;color:#0284c7;">${formatCurrency(acc.balance || 0)}</span></div>
                            ${acc.phone ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;"><i class="ri-phone-line"></i> ${acc.phone}</div>` : ''}
                        </div>
                    `).join('')}
                    ${accounts.length === 0 ? '<p style="text-align:center;color:#94a3b8;font-size:13px;padding:20px 0;">Koi recipient nahi mila.<br>Upar button se add karein.</p>' : ''}
                </div>
            </div>

            <!-- RIGHT: Detail Panel -->
            <div id="sp-right-panel">
                ${activeAcc ? `
                    <div class="card" style="border-top:5px solid #0284c7;border-radius:12px;padding:25px;">

                        <!-- Header -->
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #e2e8f0;padding-bottom:15px;flex-wrap:wrap;gap:12px;">
                            <div>
                                <h2 style="margin:0;color:#1e3c72;font-weight:800;font-size:22px;">${activeAcc.name}</h2>
                                ${activeAcc.phone ? `<p style="margin:5px 0 0;color:#64748b;"><i class="ri-phone-line"></i> ${activeAcc.phone}</p>` : ''}
                            </div>
                            <div style="display:flex;align-items:center;gap:12px;">
                                <div style="text-align:right;">
                                    <div style="font-size:11px;color:#64748b;font-weight:800;letter-spacing:0.5px;">KUL BHEJI RAQAM</div>
                                    <div style="font-size:26px;font-weight:900;color:#0284c7;">${formatCurrency(activeAcc.balance || 0)}</div>
                                </div>
                                <button onclick="window.deleteSpAccount(${activeAcc.id})" class="btn btn-outline" style="color:#ef4444;border-color:#ef4444;padding:8px 14px;">
                                    <i class="ri-delete-bin-line"></i> Delete
                                </button>
                            </div>
                        </div>

                        <!-- Add Entry Form -->
                        <div style="background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:25px;">
                            <h4 style="margin-top:0;margin-bottom:15px;color:#1e3c72;font-weight:700;font-size:15px;"><i class="ri-edit-2-line"></i> Naya Payment Add Karein</h4>
                            <form id="sp-entry-form" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;">
                                <input type="hidden" name="accId" value="${activeAcc.id}">
                                <div>
                                    <label style="font-size:12px;font-weight:bold;display:block;margin-bottom:4px;">Tarikh (Date)</label>
                                    <input type="date" name="date" required value="${today}" style="width:100%;padding:9px;border:1px solid #cbd5e1;border-radius:6px;">
                                </div>
                                <div style="grid-column:span 2;">
                                    <label style="font-size:12px;font-weight:bold;display:block;margin-bottom:4px;">Maqsad / Q Bheji (Purpose)</label>
                                    <input type="text" name="purpose" required placeholder="e.g. Advance, Material Buy, Share..." style="width:100%;padding:9px;border:1px solid #cbd5e1;border-radius:6px;">
                                </div>
                                <div>
                                    <label style="font-size:12px;font-weight:bold;display:block;margin-bottom:4px;">Tariqa (Method)</label>
                                    <select name="method" required style="width:100%;padding:9px;border:1px solid #cbd5e1;border-radius:6px;font-weight:600;">
                                        <option value="">-- Select --</option>
                                        <option>Bank Transfer</option>
                                        <option>EasyPaisa</option>
                                        <option>JazzCash</option>
                                        <option>Cash</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size:12px;font-weight:bold;display:block;margin-bottom:4px;">Raqam (Amount)</label>
                                    <input type="number" name="amount" required min="1" style="width:100%;padding:9px;border:2px solid #0284c7;border-radius:6px;font-weight:800;">
                                </div>
                                <div style="display:flex;align-items:flex-end;">
                                    <button type="submit" class="btn btn-primary" style="width:100%;padding:10px;font-weight:700;background:#0284c7;border:none;">
                                        <i class="ri-check-line"></i> Post Entry
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Ledger Table -->
                        <div class="table-responsive">
                            <table style="width:100%;border-collapse:collapse;">
                                <thead style="background:#f1f5f9;color:#0284c7;">
                                    <tr>
                                        <th style="border:1px solid #cbd5e1;padding:10px;">Tarikh</th>
                                        <th style="border:1px solid #cbd5e1;padding:10px;">Maqsad (Purpose)</th>
                                        <th style="border:1px solid #cbd5e1;padding:10px;">Tariqa</th>
                                        <th style="border:1px solid #cbd5e1;padding:10px;text-align:right;">Raqam</th>
                                        <th style="border:1px solid #cbd5e1;padding:10px;text-align:center;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>${ledgerRows()}</tbody>
                            </table>
                        </div>
                    </div>
                ` : `
                    <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;color:#94a3b8;border-radius:12px;">
                        <i class="ri-user-search-line" style="font-size:64px;margin-bottom:20px;opacity:0.3;"></i>
                        <h3 style="margin:0;font-weight:700;">Recipient Select Karein</h3>
                        <p>Bayein taraf (left panel) se koi recipient select karein ya naya add karein.</p>
                    </div>
                `}
            </div>
        </div>

        <!-- Add Recipient Modal -->
        <div id="sp-add-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;">
            <div class="card" style="width:400px;margin:0;border-radius:12px;border-top:5px solid #0284c7;padding:25px;">
                <h3 style="margin-bottom:20px;color:#1e3c72;font-weight:800;"><i class="ri-user-add-line"></i> Naya Recipient</h3>
                <form id="sp-create-acc-form">
                    <div style="margin-bottom:15px;">
                        <label style="display:block;margin-bottom:5px;font-weight:700;color:#334155;">Naam (Name)</label>
                        <input type="text" name="name" required style="width:100%;padding:10px;border:1.5px solid #cbd5e1;border-radius:8px;">
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="display:block;margin-bottom:5px;font-weight:700;color:#334155;">Phone (Optional)</label>
                        <input type="text" name="phone" style="width:100%;padding:10px;border:1.5px solid #cbd5e1;border-radius:8px;">
                    </div>
                    <div style="display:flex;gap:10px;">
                        <button type="submit" class="btn btn-primary" style="flex:1;justify-content:center;font-weight:700;background:#0284c7;">Add Karein</button>
                        <button type="button" class="btn btn-outline" onclick="document.getElementById('sp-add-modal').style.display='none'" style="flex:1;justify-content:center;font-weight:700;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <style>
            @media(max-width:768px){
                div[style*="grid-template-columns:300px 1fr"]{grid-template-columns:1fr!important;}
            }
        </style>
    `;

    window.router.onRender('sent-payments', () => {
        const modal    = document.getElementById('sp-add-modal');
        const addBtn   = document.getElementById('btn-add-sp-acc');
        const createForm = document.getElementById('sp-create-acc-form');
        const entryForm  = document.getElementById('sp-entry-form');

        if (addBtn) addBtn.addEventListener('click', () => { modal.style.display = 'flex'; });

        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const acc = DB.addSentPaymentsAccount({ name: createForm.name.value.trim(), phone: createForm.phone.value.trim() });
                modal.style.display = 'none';
                window.router.navigate('sent-payments', { accId: acc.id });
            });
        }

        if (entryForm) {
            entryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                DB.addSentPaymentsEntry({
                    accountId : parseInt(entryForm.accId.value),
                    date      : entryForm.date.value,
                    purpose   : entryForm.purpose.value.trim(),
                    method    : entryForm.method.value,
                    amount    : parseFloat(entryForm.amount.value) || 0
                });
                window.router.navigate('sent-payments', { accId: parseInt(entryForm.accId.value) });
            });
        }

        window.deleteSpEntry = (id) => {
            if (confirm('Ye entry delete karni hai?')) {
                DB.deleteSentPaymentsEntry(id);
                window.router.navigate('sent-payments', { accId: activeId });
            }
        };

        window.deleteSpAccount = (id) => {
            if (confirm('Is recipient aur uske saare records delete karne hain?')) {
                DB.deleteSentPaymentsAccount(id);
                window.router.navigate('sent-payments');
            }
        };
    });

    return html;
};
