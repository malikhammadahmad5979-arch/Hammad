// Helper Utilities

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount || 0).replace('PKR', 'Rs');
};

export const formatDate = (dateString) => {
  if(!dateString) return '';
  const parts = dateString.split('-');
  if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateString;
};

// Simple router
export const Router = {
  routes: {},
  currentRoute: null,
  
  add(path, renderFunction) {
    this.routes[path] = renderFunction;
  },
  
  navigate(path, params={}) {
    if(!this.routes[path]) path = 'dashboard';
    this.currentRoute = path;
    const container = document.getElementById('view-container');
    container.innerHTML = this.routes[path](params);
    document.getElementById('page-title').innerText = path.charAt(0).toUpperCase() + path.slice(1);
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
      if(el.getAttribute('data-route') === path) {
        el.classList.add('active');
      }
    });

    if (this.afterRender[path]) this.afterRender[path]();
  },

  afterRender: {},
  onRender(path, cb) {
    this.afterRender[path] = cb;
  }
};
