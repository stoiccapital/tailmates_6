// Supabase configuration
// Using config from config.js
const SUPABASE_URL = window.SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.anonKey;

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const loginForm = document.getElementById('loginForm');
const googleLoginBtn = document.getElementById('googleLogin');
const signupLink = document.getElementById('signupLink');
const messageDiv = document.getElementById('message');
const logoutBtn = document.getElementById('logoutBtn');

// Logout function
async function handleLogout() {
    try {
        await supabase.auth.signOut();
        window.location.href = '/website/index.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/website/index.html';
    }
}

// Show message function
function showMessage(message, type = 'info') {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// Clear message function
function clearMessage() {
    messageDiv.style.display = 'none';
    messageDiv.className = 'message';
}

// Set loading state
function setLoading(isLoading) {
    const loginBtn = document.querySelector('.login-btn');
    const googleBtn = document.querySelector('.google-btn');
    
    if (isLoading) {
        loginBtn.classList.add('loading');
        googleBtn.classList.add('loading');
        loginBtn.textContent = 'Signing in...';
        googleBtn.textContent = 'Connecting...';
    } else {
        loginBtn.classList.remove('loading');
        googleBtn.classList.remove('loading');
        loginBtn.textContent = 'Sign In';
        googleBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
        `;
    }
}

// Handle email/password login
async function handleEmailLogin(email, password) {
    try {
        setLoading(true);
        clearMessage();
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            throw error;
        }
        
        showMessage('Login successful! Redirecting...', 'success');
        
        // Store user data in localStorage (optional)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard or home page after successful login
        setTimeout(() => {
            window.location.href = '/app/dashboard/dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message || 'Login failed. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

// Handle Google OAuth login
async function handleGoogleLogin() {
    try {
        setLoading(true);
        clearMessage();
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/app/dashboard/dashboard.html'
            }
        });
        
        if (error) {
            throw error;
        }
        
        // Google OAuth will redirect automatically
        showMessage('Redirecting to Google...', 'info');
        
    } catch (error) {
        console.error('Google login error:', error);
        showMessage(error.message || 'Google login failed. Please try again.', 'error');
        setLoading(false);
    }
}

// Event listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!email || !password) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    await handleEmailLogin(email, password);
});

googleLoginBtn.addEventListener('click', handleGoogleLogin);
logoutBtn.addEventListener('click', handleLogout);

// Check if user is already logged in
async function checkAuthStatus() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // User is already logged in, redirect to dashboard
            window.location.href = '/app/dashboard/dashboard.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    
    // Add some nice animations
    const loginCard = document.querySelector('.login-card');
    loginCard.style.opacity = '0';
    loginCard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        loginCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        loginCard.style.opacity = '1';
        loginCard.style.transform = 'translateY(0)';
    }, 100);
});

// Handle auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '/app/dashboard/dashboard.html';
        }, 1500);
    }
}); 