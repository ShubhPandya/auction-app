/**
 * Authentication Page
 */

class AuthPage {
  static async init() {
    const template = document.getElementById('auth-page');
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));

    // Hide navbar on auth page
    document.getElementById('navbar').style.display = 'none';

    this.setupToggle();
    this.setupLoginForm();
    this.setupRegisterForm();
  }

  static setupToggle() {
    const toggleRegister = document.getElementById('toggleRegister');
    const toggleLogin = document.getElementById('toggleLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    toggleRegister?.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    });

    toggleLogin?.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    });
  }

  static setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail')?.value?.trim();
      const password = document.getElementById('loginPassword')?.value;
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!email || !password) {
        this.showError('Please fill in all fields');
        return;
      }

      if (!Utils.isValidEmail(email)) {
        this.showError('Please enter a valid email');
        return;
      }

      if (password.length < 6) {
        this.showError('Password must be at least 6 characters');
        return;
      }

      // Disable button during API call
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      try {
        const result = await API.login(email, password);

        if (result.status === 'success') {
          // Store user data
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('userId', result.data.userId);
          localStorage.setItem('username', result.data.username);
          localStorage.setItem('email', result.data.email);

          Utils.showSuccess('Login successful!');
          // Clear form
          form.reset();
          // Redirect after success
          setTimeout(() => {
            window.location.hash = '#dashboard';
            window.location.reload();
          }, 300);
        } else {
          this.showError(result.message || 'Login failed');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Login';
        }
      } catch (error) {
        console.error('Login error:', error);
        this.showError('An error occurred during login');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    });
  }

  static setupRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('regUsername')?.value?.trim();
      const email = document.getElementById('regEmail')?.value?.trim();
      const password = document.getElementById('regPassword')?.value;
      const confirmPassword = document.getElementById('regConfirmPassword')?.value;
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!username || !email || !password || !confirmPassword) {
        this.showError('Please fill in all fields');
        return;
      }

      // Validation
      if (username.length < 3) {
        this.showError('Username must be at least 3 characters');
        return;
      }

      if (!Utils.isValidEmail(email)) {
        this.showError('Please enter a valid email');
        return;
      }

      if (password.length < 6) {
        this.showError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        this.showError('Passwords do not match');
        return;
      }

      // Disable button during API call
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering...';

      try {
        const result = await API.register(username, email, password);

        if (result.status === 'success') {
          // Store user data
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('userId', result.data.userId);
          localStorage.setItem('username', result.data.username);
          localStorage.setItem('email', result.data.email);

          Utils.showSuccess('Registration successful!');
          // Clear form
          form.reset();
          // Redirect after success
          setTimeout(() => {
            window.location.hash = '#dashboard';
            window.location.reload();
          }, 300);
        } else {
          this.showError(result.message || 'Registration failed');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Register';
        }
      } catch (error) {
        console.error('Registration error:', error);
        this.showError('An error occurred during registration');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
      }
    });
  }

  static showError(message) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }
}
