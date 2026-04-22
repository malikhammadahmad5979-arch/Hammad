import { auth } from '../firebase-init.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export const renderLogin = () => {
    let html = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 120px); background: #f5f7fa;">
            <div class="card" style="width: 100%; max-width: 450px; padding: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border-top: 5px solid #1e3c72;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background: #1e3c72; color: white; width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 15px;">
                        <i class="ri-lock-password-fill"></i>
                    </div>
                    <h1 style="color: #1e3c72; margin: 0; font-size: 24px; font-weight: 800;">Admin Secure Login</h1>
                    <p style="color: #64748b; margin-top: 8px;">Yousaf Brothers Management System</p>
                </div>

                <form id="login-form">
                    <div style="margin-bottom: 20px;">
                        <label style="display:block; margin-bottom: 8px; font-weight: 700; color: #334155;">Admin Email</label>
                        <div style="position: relative;">
                            <i class="ri-mail-line" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                            <input type="email" name="email" required style="width: 100%; padding: 12px 12px 12px 40px; border: 1.5px solid #e2e8f0; border-radius: 8px; outline: none; transition: border-color 0.2s;" placeholder="admin@example.com">
                        </div>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <label style="display:block; margin-bottom: 8px; font-weight: 700; color: #334155;">Password</label>
                        <div style="position: relative;">
                            <i class="ri-key-2-line" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                            <input type="password" name="password" required style="width: 100%; padding: 12px 12px 12px 40px; border: 1.5px solid #e2e8f0; border-radius: 8px; outline: none; transition: border-color 0.2s;" placeholder="••••••••">
                        </div>
                    </div>

                    <div id="login-error" style="display:none; background: #fff1f2; color: #e11d48; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-bottom: 20px; text-align: center; border: 1px solid #fda4af;">
                        <i class="ri-error-warning-fill"></i> Invalid credentials.
                    </div>

                    <button type="submit" id="login-btn" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 16px; font-weight: 800; background: #1e3c72; border: none; box-shadow: 0 4px 6px -1px rgba(30, 60, 114, 0.2);">
                        <i class="ri-login-box-line"></i> LOGIN TO SYSTEM
                    </button>
                    
                    <div style="margin-top: 30px; text-align: center; font-size: 13px; color: #94a3b8;">
                        <p><i class="ri-shield-check-line"></i> Fully Encrypted Cloud Connection</p>
                    </div>
                </form>
            </div>
        </div>
    `;

    window.router.onRender('login', () => {
        const form = document.getElementById('login-form');
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = form.email.value;
                const password = form.password.value;

                btn.disabled = true;
                btn.innerHTML = '<i class="ri-loader-4-line" style="animation: spin 1s infinite linear;"></i> Authenticating...';
                errorEl.style.display = 'none';

                try {
                    await signInWithEmailAndPassword(auth, email, password);
                    // Successful login will be handled by auth listener in app.js
                } catch (err) {
                    console.error("Login failed", err);
                    errorEl.style.display = 'block';
                    btn.disabled = false;
                    btn.innerHTML = '<i class="ri-login-box-line"></i> LOGIN TO SYSTEM';
                }
            });
        }
    });

    return html;
};
