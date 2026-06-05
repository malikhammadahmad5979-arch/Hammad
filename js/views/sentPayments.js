import { DB } from '../store.js';

// Helper to format currency
const formatAmt = (amt) => Number(amt).toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });

export const renderSentPayments = () => {
    // Render base layout
    const container = document.createElement('div');
    container.className = 'sent-payments-container';
    container.innerHTML = `
        <style>
        .sent-payments-container { display:flex; gap:20px; padding:20px; }
        .sp-sidebar { width:250px; background:#f9fafb; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05); }
        .sp-sidebar h3 { margin:0; padding:12px 16px; background:#e0f2fe; font-size:1rem; color:#0284c7; }
        .sp-account-list { list-style:none; margin:0; padding:0; max-height:60vh; overflow-y:auto; }
        .sp-account-item { padding:10px 16px; cursor:pointer; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; }
        .sp-account-item:hover { background:#e5f6ff; }
        .sp-main { flex:1; background:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); padding:20px; }
        .sp-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .sp-header h2 { margin:0; font-size:1.25rem; color:#111827; }
        .sp-form { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; margin-bottom:20px; }
        .sp-form input, .sp-form select { padding:8px 12px; border:1px solid #d1d5db; border-radius:4px; }
        .sp-form button { grid-column:1/-1; padding:10px 16px; background:#0284c7; color:#fff; border:none; border-radius:4px; cursor:pointer; }
        .sp-form button:hover { background:#0369a1; }
        .sp-ledger-table { width:100%; border-collapse:collapse; }
        .sp-ledger-table th, .sp-ledger-table td { padding:8px 12px; border-bottom:1px solid #e5e7eb; text-align:left; }
        .sp-ledger-table th { background:#f3f4f6; font-weight:600; }
        .sp-delete { color:#dc2626; cursor:pointer; }
        </style>
        <div class="sp-sidebar">
            <h3>Recipients</h3>
            <ul class="sp-account-list" id="spAccountList"></ul>
            <button id="spAddAccountBtn" style="width:100%;margin-top:10px;padding:8px;background:#10b981;color:#fff;border:none;cursor:pointer;">Naya Recipient Add Karein</button>
        </div>
        <div class="sp-main">
            <div class="sp-header">
                <h2 id="spAccountHeader">Select a Recipient</h2>
                <button id="spDeleteAccountBtn" class="sp-delete" style="display:none;">Delete Recipient</button>
            </div>
            <form class="sp-form" id="spEntryForm" style="display:none;">
                <input type="date" id="spDate" required />
                <input type="text" id="spPurpose" placeholder="Purpose / Description" required />
                <select id="spMethod" required>
                    <option value="">Select Method</option>
                    <option>Bank Transfer</option>
                    <option>EasyPaisa</option>
                    <option>JazzCash</option>
                    <option>Cash</option>
                </select>
                <input type="number" id="spAmount" placeholder="Amount (PKR)" step="0.01" required />
                <button type="submit">Add Payment</button>
            </form>
            <table class="sp-ledger-table" id="spLedgerTable" style="display:none;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Purpose</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="spLedgerBody"></tbody>
            </table>
        </div>
    `;
    // Append to root element (assuming app has a #root div)
    const root = document.getElementById('root');
    if (!root) {
        console.error('Root element not found for Sent Payments view');
        return;
    }
    root.innerHTML = '';
    root.appendChild(container);

    const accountListEl = document.getElementById('spAccountList');
    const addAccountBtn = document.getElementById('spAddAccountBtn');
    const accountHeader = document.getElementById('spAccountHeader');
    const deleteAccountBtn = document.getElementById('spDeleteAccountBtn');
    const entryForm = document.getElementById('spEntryForm');
    const ledgerTable = document.getElementById('spLedgerTable');
    const ledgerBody = document.getElementById('spLedgerBody');

    let selectedAccountId = null;

    const refreshAccounts = () => {
        const accounts = DB.getSentPaymentsAccounts();
        accountListEl.innerHTML = '';
        accounts.forEach(acc => {
            const li = document.createElement('li');
            li.className = 'sp-account-item';
            li.dataset.id = acc.id;
            li.innerHTML = `<span>${acc.name || 'Unnamed'}</span><span>${formatAmt(acc.balance || 0)}</span>`;
            li.addEventListener('click', () => selectAccount(acc.id));
            accountListEl.appendChild(li);
        });
    };

    const selectAccount = (id) => {
        selectedAccountId = id;
        const acc = DB.getSentPaymentsAccountById(id);
        accountHeader.textContent = `${acc.name || 'Recipient'} (Total Sent: ${formatAmt(acc.balance || 0)})`;
        deleteAccountBtn.style.display = 'inline';
        entryForm.style.display = 'grid';
        ledgerTable.style.display = 'table';
        refreshLedger();
    };

    const refreshLedger = () => {
        if (!selectedAccountId) return;
        const entries = DB.getSentPaymentsLedger(selectedAccountId);
        ledgerBody.innerHTML = '';
        entries.forEach(ent => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${ent.date}</td>
                <td>${ent.purpose}</td>
                <td>${ent.method}</td>
                <td>${formatAmt(ent.amount)}</td>
                <td><span class="sp-delete" data-id="${ent.id}">Delete</span></td>
            `;
            tr.querySelector('.sp-delete').addEventListener('click', () => deleteEntry(ent.id));
            ledgerBody.appendChild(tr);
        });
    };

    const deleteEntry = (entryId) => {
        DB.deleteSentPaymentsEntry(entryId);
        refreshLedger();
        refreshAccounts();
    };

    addAccountBtn.addEventListener('click', () => {
        const name = prompt('Recipient ka naam darj karein');
        if (!name) return;
        const phone = prompt('Phone number (optional)');
        DB.addSentPaymentsAccount({ name, phone });
        refreshAccounts();
    });

    deleteAccountBtn.addEventListener('click', () => {
        if (!selectedAccountId) return;
        if (confirm('Is recipient ke saare records delete karne hain?')) {
            DB.deleteSentPaymentsAccount(selectedAccountId);
            selectedAccountId = null;
            accountHeader.textContent = 'Select a Recipient';
            deleteAccountBtn.style.display = 'none';
            entryForm.style.display = 'none';
            ledgerTable.style.display = 'none';
            refreshAccounts();
        }
    });

    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedAccountId) return;
        const entry = {
            accountId: selectedAccountId,
            date: document.getElementById('spDate').value,
            purpose: document.getElementById('spPurpose').value,
            method: document.getElementById('spMethod').value,
            amount: parseFloat(document.getElementById('spAmount').value) || 0
        };
        DB.addSentPaymentsEntry(entry);
        entryForm.reset();
        refreshLedger();
        refreshAccounts();
    });

    // Initial load
    refreshAccounts();
};
