// Supabase configuration
const SUPABASE_URL = window.SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.anonKey;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const signupForm = document.getElementById('signupForm');
const messageDiv = document.getElementById('message');
const loginLink = document.getElementById('loginLink');
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

function showMessage(message, type = 'info') {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

function clearMessage() {
    messageDiv.style.display = 'none';
    messageDiv.className = 'message';
}

function setLoading(isLoading) {
    const signupBtn = document.querySelector('.signup-btn');
    if (isLoading) {
        signupBtn.classList.add('loading');
        signupBtn.textContent = 'Signing up...';
    } else {
        signupBtn.classList.remove('loading');
        signupBtn.textContent = 'Sign Up';
    }
}

async function handleSignup(email, password) {
    try {
        setLoading(true);
        clearMessage();
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        if (error) {
            throw error;
        }
        showMessage('Account created! Please check your email to confirm.', 'success');
        setTimeout(() => {
            window.location.href = '/app/dashboard/dashboard.html';
        }, 1500);
    } catch (error) {
        showMessage(error.message || 'Signup failed. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long.', 'error');
        return;
    }
    await handleSignup(email, password);
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '../login/login.html';
});

logoutBtn.addEventListener('click', handleLogout); 