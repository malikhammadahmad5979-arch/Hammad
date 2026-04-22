import { DB } from '../store.js';

export const renderSettings = () => {
    
    let html = `
        <!-- System Configuration Section -->
        <h2 style="color: #1e3c72; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;"><i class="ri-settings-5-fill"></i> System Configuration & Storage</h2>
        <div class="card" style="margin-bottom: 30px; border-top: 5px solid #ef4444;">
            <p style="color: #64748b; margin-bottom: 20px; font-weight: 500;">Manage system memory, take backups, or perform a master reset.</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                <!-- Danger Zone -->
                <div style="border: 2px dashed #fecaca; background-color: #fef2f2; padding: 25px; border-radius: 12px;">
                    <h4 style="color: #dc2626; margin-top: 0; font-size: 18px;"><i class="ri-error-warning-fill"></i> Master Reset (Sara Data Khatam)</h4>
                    <p style="font-size: 13px; color: #7f1d1d; margin-bottom: 20px; line-height: 1.5;">Agar aap yahan se Data Clear karte hain, toh tamam Khatay (Sales, Payments) hamesha ke liye Delete ho jayengy!</p>
                    <button onclick="window.handleClearData()" class="btn btn-primary" style="background-color: #dc2626; border-color: #dc2626; width: 100%; font-weight: 700; padding: 12px;">
                        <i class="ri-delete-bin-2-line"></i> RESET EVERYTHING TO ZERO
                    </button>
                </div>
                <!-- Database Backup -->
                <div style="border: 2px solid #bae6fd; background-color: #f0f9ff; padding: 25px; border-radius: 12px;">
                    <h4 style="color: #0369a1; margin-top: 0; font-size: 18px;"><i class="ri-save-3-fill"></i> Secure Data Backup</h4>
                    <p style="font-size: 13px; color: #0c4a6e; margin-bottom: 20px; line-height: 1.5;">Apne record ki offline copy mehfooz farmaiye taa ke computer kharab hone par data bacha rahay.</p>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button class="btn btn-primary" style="background-color: #0284c7; width: 100%; font-weight: 700; padding: 12px;" onclick="window.downloadBackup()">
                            <i class="ri-download-cloud-2-line"></i> SAVE BACKUP FILE
                        </button>
                        <input type="file" id="restore-file" style="display:none;" accept=".json">
                        <button class="btn btn-outline" style="width: 100%; border-color: #0284c7; color: #0284c7; font-weight: 700; padding: 12px;" onclick="document.getElementById('restore-file').click()">
                            <i class="ri-upload-cloud-2-line"></i> RESTORE FROM FILE
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Material Management Section -->
        <h2 style="color: #1e3c72; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;"><i class="ri-stack-fill"></i> Inventory & Material Management</h2>
        <div class="card" style="margin-bottom: 30px; border-top: 5px solid #1e3c72;">
             <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Yahan se aap apne pathar ya maal ki iqsaam (Jaise: Crush, Khaka) add ya khatam kar sakte hain.</p>
             <form id="add-material-form" style="display: flex; gap: 15px; margin-bottom: 25px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <input type="text" id="m-name" required style="flex: 1; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600;" placeholder="New Material Name (e.g. SUB-BASE)">
                <button type="submit" class="btn btn-primary" style="background: #1e3c72; padding: 0 30px; font-weight: 700;"><i class="ri-add-circle-line"></i> ADD MATERIAL TYPE</button>
             </form>
             <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                ${DB.getInventory().map(inv => `
                    <div style="background: white; padding: 10px 20px; border-radius: 30px; display: flex; align-items: center; gap: 12px; border: 2px solid #1e3c72; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <span style="font-weight: 800; color: #1e3c72; font-size: 14px; letter-spacing: 0.5px;">${inv.material}</span>
                        <a href="javascript:void(0)" onclick="window.handleDeleteMaterial(${inv.id})" style="color: #ef4444; font-size: 20px; display: flex;"><i class="ri-close-circle-fill"></i></a>
                    </div>
                `).join('')}
             </div>
        </div>

        <!-- Client Management Section -->
        <h2 style="color: #1e3c72; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;"><i class="ri-user-settings-fill"></i> Client & Party Registration</h2>
        <div class="card" style="margin-bottom: 30px; border-top: 5px solid #2563eb;">
             <form id="add-client-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; align-items: end; background: #f0f7ff; padding: 25px; border-radius: 12px; border: 1px solid #bfdbfe;">
                <div>
                    <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:700; color: #1e40af;">Party Name (Khata Dar Ka Naam)</label>
                    <input type="text" id="c-name" required style="width:100%; padding:12px; border:1px solid #93c5fd; border-radius:8px; font-weight: 600;" placeholder="e.g. Jahanzeb Baloch">
                </div>
                <div>
                    <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:700; color: #1e40af;">WhatsApp Phone (Contact Number)</label>
                    <input type="text" id="c-phone" required style="width:100%; padding:12px; border:1px solid #93c5fd; border-radius:8px; font-weight: 600;" placeholder="e.g. 03060711529">
                </div>
                <button type="submit" class="btn btn-primary" style="padding: 14px; font-weight: 800; background: #1e3c72; letter-spacing: 1px;"><i class="ri-user-add-fill"></i> REGISTER NEW PARTY</button>
             </form>
             
             <div style="margin-top: 30px;">
                <h4 style="margin-bottom: 15px; color: #1e3c72;"><i class="ri-team-fill"></i> List of Registered Parties</h4>
                <div class="table-responsive" style="border: 1px solid #e2e8f0; border-radius: 8px;">
                    <table style="width: 100%;">
                        <thead style="background: #f8fafc;">
                            <tr>
                                <th style="text-align: left; padding: 12px;">Party Name</th>
                                <th style="text-align: left; padding: 12px;">Phone / WhatsApp</th>
                                <th style="text-align: right; padding: 12px;">Current Balance</th>
                                <th style="text-align: center; padding: 12px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${DB.getClients().map(c => `
                                <tr>
                                    <td style="padding: 12px; font-weight: 700; color: #334155;">${c.name}</td>
                                    <td style="padding: 12px; color: #64748b;"><i class="ri-whatsapp-line" style="color: #25d366;"></i> ${c.phone}</td>
                                    <td style="padding: 12px; text-align: right; font-weight: 800; color: #1e3c72;">Rs. ${c.totalDue.toLocaleString()}</td>
                                    <td style="padding: 12px; text-align: center;">
                                        <button class="btn btn-outline" onclick="window.handleDeleteClient(${c.id})" style="border-color: #ef4444; color: #ef4444; padding: 4px 8px; font-size: 11px;">
                                            <i class="ri-delete-bin-line"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                            ${DB.getClients().length === 0 ? '<tr><td colspan="3" style="text-align:center; padding: 20px; color: #94a3b8;">Abhi tak koi party register nahi hui.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    `;

    // Global utility for Backup (attached to window since called inline)
    window.handleDeleteMaterial = (id) => {
        if(confirm("Are you sure? This material will be removed from future lists.")) {
            DB.deleteMaterial(id);
            window.location.reload();
        }
    };

    window.handleDeleteClient = (id) => {
        if(confirm("Caution! Kya aap waqai is Party (Client) ko delete karna chahte hain?")) {
            if(DB.deleteClient(id)) {
                window.location.reload();
            }
        }
    };

    window.downloadBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('yb_db'));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `YousafBrothers_Backup_${new Date().toISOString().split('T')[0]}.json`);
        dlAnchorElem.click();
    };

    // Global Helper for Clear Data
    window.handleClearData = () => {
        if(confirm("Are you sure? Puray system ka data hamesha k liye khatam ho jaye ga. (Completely Clear Data?)")) {
            localStorage.clear();
            localStorage.setItem('yb_reset_done', 'true'); // Flag to prevent re-init with mock data
            localStorage.setItem('yb_db', JSON.stringify({ clients: [], sales: [], inventory: [], payments: [] })); // Forced empty structure
            alert("Data Cleared! System is resetting...");
            window.location.reload();
        }
    };

    window.router.onRender('settings', () => {
        const clientForm = document.getElementById('add-client-form');
        if(clientForm) {
            clientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('c-name').value;
                const phone = document.getElementById('c-phone').value;
                DB.addClient({ name, phone, city: 'Local', status: 'Active' });
                alert("Client Registered Successfully!");
                window.location.reload(); // Refresh to show in list
            });
        }

        const materialForm = document.getElementById('add-material-form');
        if(materialForm) {
            materialForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('m-name').value;
                DB.addMaterial(name);
                alert("Material Added Successfully!");
                window.location.reload();
            });
        }

        const fileInput = document.getElementById('restore-file');
        if(fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if(file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        try {
                            const data = JSON.parse(evt.target.result);
                            if(data.sales && data.clients) {
                                localStorage.setItem('yb_db', JSON.stringify(data));
                                alert("Backup Restored Successfully! Page will reload.");
                                window.location.reload();
                            } else {
                                alert("Invalid Backup File format.");
                            }
                        } catch(err) {
                            alert("Error reading backup file.");
                        }
                    };
                    reader.readAsText(file);
                }
            });
        }
    });

    return html;
};
