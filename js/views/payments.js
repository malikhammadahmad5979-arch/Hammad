import { DB } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';

export const renderPayments = () => {
    const clients = DB.getClients();
    const paymentsList = DB.getPayments() ? DB.getPayments().reverse() : [];

    let html = `
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header" style="background-color: #f0fdf4; padding: 15px 20px; border-bottom: 1px solid #bbf7d0; border-radius: 8px 8px 0 0; margin: -24px -24px 20px -24px;">
                <h3 id="p-form-title" style="margin: 0; color: #166534;"><i class="ri-money-dollar-circle-line"></i> Receive Payment (Wasooli / Jama Khata)</h3>
            </div>
            
            <form id="add-payment-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Payment Date</label>
                    <input type="date" id="p-date" name="date" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" value="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Client</label>
                    <select id="p-client" name="clientId" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="" disabled selected>Select Client...</option>
                        ${clients.map(c => {
                            const received = DB.getClientTotalReceived(c.id);
                            const balance = c.totalDue - received;
                            return `<option value="${c.id}">${c.name} (Balance: ${balance})</option>`;
                        }).join('')}
                    </select>
                </div>
                
                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 700; color: #16a34a;">Amount Received (Rs)</label>
                    <input type="number" id="p-amount" name="amount" required style="width: 100%; padding: 8px; border: 2px solid #22c55e; border-radius: 4px;" placeholder="Amount">
                </div>

                <div>
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Payment Method</label>
                    <select id="p-method" name="method" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="Cash">Cash (Naqad)</option>
                        <option value="Bank/Online">Bank / Online / Easypaisa</option>
                        <option value="Cheque">Cheque</option>
                    </select>
                </div>

                <div style="grid-column: 1 / -1;">
                    <label style="display:block; margin-bottom: 5px; font-weight: 500;">Note / Description (Optional)</label>
                    <input type="text" id="p-note" name="note" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="e.g. Cleared past due">
                </div>

                <div style="grid-column: 1 / -1; display:flex; justify-content: flex-end; margin-top: 10px;">
                    <button type="submit" id="btn-p-submit" class="btn btn-primary" style="background-color: #16a34a; border-color: #16a34a; padding: 10px 30px; font-size: 16px;">
                        <i class="ri-check-line"></i> Save Payment (Raqam Jama Karein)
                    </button>
                </div>
            </form>
        </div>

        <div class="card">
            <div class="card-header" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #1e3c72;"><i class="ri-history-line"></i> Payment History (Wasoolian)</h3>
            </div>
            
            <div class="table-responsive">
                <table style="width: 100%; text-align: left;">
                    <thead style="background-color: #f1f5f9; color: #475569;">
                        <tr>
                            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1;">Date</th>
                            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1;">Client</th>
                            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1;">Amount Received</th>
                            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1;">Method</th>
                            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1;">Note</th>
                            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paymentsList.map(p => {
                            const cl = clients.find(c => c.id == p.clientId);
                            return `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${formatDate(p.date)}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight:bold;">${cl ? cl.name : 'Unknown'}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight:700; color: #16a34a;">${formatCurrency(p.amount)}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><span class="badge" style="background:#dcfce7; color:#166534;">${p.method}</span></td>
                                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${p.note || '-'}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">
                                     <button class="btn btn-outline" onclick="window.editPayment(${p.id})" style="padding: 4px 6px; font-size: 13px; color: #f59e0b; border-color: #f59e0b;" title="Edit"><i class="ri-edit-line"></i></button>
                                     <button class="btn btn-outline" onclick="window.deletePayment(${p.id})" style="padding: 4px 6px; font-size: 13px; color: #ef4444; border-color: #ef4444;" title="Delete"><i class="ri-delete-bin-line"></i></button>
                                </td>
                            </tr>
                        `}).join('')}
                        ${paymentsList.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#6b7280;">Koi record shamil nahi kiya gaya. (No payments received yet)</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    window.router.onRender('payments', () => {
        const form = document.getElementById('add-payment-form');
        let editingPaymentId = null;

        window.editPayment = (id) => {
            const payment = DB.getPaymentById(id);
            if(!payment) return;
            editingPaymentId = id;
            
            form.date.value = payment.date;
            form.clientId.value = payment.clientId;
            form.amount.value = payment.amount;
            form.method.value = payment.method;
            form.note.value = payment.note || '';
            
            const btn = document.getElementById('btn-p-submit');
            if(btn) {
                btn.innerHTML = '<i class="ri-save-line"></i> Update Payment';
                btn.style.backgroundColor = '#f59e0b';
                btn.style.borderColor = '#f59e0b';
            }
            document.getElementById('p-form-title').innerHTML = '<i class="ri-edit-line"></i> Update Payment (Tabdeeli)';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.deletePayment = (id) => {
            if(confirm("Alert! Are you sure you want to completely DELETE this payment? The client's remaining balance will increase again.")) {
                DB.deletePayment(id);
                window.router.navigate('payments');
            }
        };

        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const newData = {
                    date: form.date.value,
                    clientId: parseInt(form.clientId.value),
                    amount: parseFloat(form.amount.value),
                    method: form.method.value,
                    note: form.note.value
                };
                
                if(editingPaymentId) {
                    DB.updatePayment(editingPaymentId, newData);
                    alert("Payment Updated! / Record theek ho gaya!");
                } else {
                    DB.addPayment(newData);
                    alert("Payment Received! / Raqam Jama ho gayi!");
                }
                
                window.router.navigate('payments');
            });
        }
    });

    return html;
};
