// Supabase config (using config.js)
const SUPABASE_URL = window.SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.anonKey;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if user is logged in
async function checkAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '/website/login/login.html';
        } else {
            // Display user email in main content
            document.getElementById('user-email').textContent = `Logged in as: ${session.user.email}`;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/website/login/login.html';
    }
}

// Logout function
async function handleLogout() {
    try {
        await supabase.auth.signOut();
        // Redirect to home page after logout
        window.location.href = '/website/index.html';
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if logout fails
        window.location.href = '/website/index.html';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Add logout event listeners to logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Set active state for current page
    const currentPage = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && currentPage.includes(href.split('/').pop())) {
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            // Add active class to current page link
            link.classList.add('active');
        }
    });
}); 