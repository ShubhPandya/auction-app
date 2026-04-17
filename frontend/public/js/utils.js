/**
 * Utility Functions
 */

class Utils {
  // Show error notification
  static showError(message) {
    const template = document.getElementById('error-notification');
    if (!template) { console.error('Error notification template missing'); return; }
    const notification = template.content.cloneNode(true);
    notification.querySelector('#notificationText').textContent = message;

    const wrapper = document.createElement('div');
    wrapper.appendChild(notification);
    const notifElem = wrapper.firstElementChild;
    document.body.appendChild(notifElem);

    const closeBtn = notifElem.querySelector('.notification-close');
    closeBtn?.addEventListener('click', () => notifElem.remove());

    setTimeout(() => notifElem.remove(), 5000);
  }

  // Show success notification
  static showSuccess(message) {
    const template = document.getElementById('success-notification');
    if (!template) { console.log(message); return; }
    const notification = template.content.cloneNode(true);
    notification.querySelector('#notificationText').textContent = message;

    const wrapper = document.createElement('div');
    wrapper.appendChild(notification);
    const notifElem = wrapper.firstElementChild;
    document.body.appendChild(notifElem);

    const closeBtn = notifElem.querySelector('.notification-close');
    closeBtn?.addEventListener('click', () => notifElem.remove());

    setTimeout(() => notifElem.remove(), 5000);
  }

  // Format date
  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Format time
  static formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get query parameter from URL
  static getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // Parse hash for navigation
  static parseHash() {
    const hash = window.location.hash.substring(1);
    const parts = hash.split('/');
    return {
      page: parts[0] || 'auth',
      id: parts[1] || null,
      subId: parts[2] || null
    };
  }

  // Navigate to page
  static navigate(page, id = null, subId = null) {
    if (id && subId) {
      window.location.hash = `${page}/${id}/${subId}`;
    } else if (id) {
      window.location.hash = `${page}/${id}`;
    } else {
      window.location.hash = page;
    }
  }

  // Show/hide element
  static show(element) {
    if (element) element.style.display = '';
  }

  static hide(element) {
    if (element) element.style.display = 'none';
  }

  // Clear form
  static clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
  }

  // Validate email
  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Get stored user info
  static getUser() {
    return {
      userId: localStorage.getItem('userId'),
      username: localStorage.getItem('username'),
      email: localStorage.getItem('email'),
      token: localStorage.getItem('token')
    };
  }

  // Check if user is logged in
  static isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  // Logout user
  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    window.location.hash = '#auth';
  }

  // Create element with classes
  static createElement(tag, classes = [], content = '') {
    const element = document.createElement(tag);
    if (classes.length) element.className = classes.join(' ');
    if (content) element.innerHTML = content;
    return element;
  }

  // Safe JSON parse
  static safeJsonParse(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  // Convert array to select options
  static createSelectOptions(array, labelKey, valueKey) {
    return array.map(item => ({
      label: item[labelKey],
      value: item[valueKey]
    }));
  }

  // Popular cricket players list
  static getPopularPlayers() {
    return [
      { name: 'Virat Kohli', team: 'RCB', role: 'batsman' },
      { name: 'Rohit Sharma', team: 'MI', role: 'batsman' },
      { name: 'Jasprit Bumrah', team: 'MI', role: 'bowler' },
      { name: 'Suryakumar Yadav', team: 'MI', role: 'all-rounder' },
      { name: 'KL Rahul', team: 'LSG', role: 'batsman' },
      { name: 'Yuzvendra Chahal', team: 'RR', role: 'bowler' },
      { name: 'Siraj', team: 'RCB', role: 'bowler' },
      { name: 'Hardik Pandya', team: 'GT', role: 'all-rounder' },
      { name: 'MS Dhoni', team: 'CSK', role: 'wicket-keeper' },
      { name: 'Shubhman Gill', team: 'GT', role: 'batsman' }
    ];
  }

  // IPL Teams list
  static getIPLTeams() {
    return [
      'MI', 'CSK', 'RCB', 'KKR', 'DC', 'RR', 'PBKS', 'GT', 'LSG', 'SRH'
    ];
  }
}
