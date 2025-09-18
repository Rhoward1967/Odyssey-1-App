// Authentication system for client portal
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        this.isAuthenticated = false;
        this.checkAuthStatus();
    }

    checkAuthStatus() {
        const token = localStorage.getItem('clientToken');
        const userId = localStorage.getItem('clientUserId');
        if (token && userId) {
            this.currentUser = this.subscribers.find(s => s.id === userId);
            this.isAuthenticated = !!this.currentUser;
        }
        this.updateUI();
    }

    async signUp(email, password, name) {
        // Simulate API call
        const newUser = {
            id: Date.now().toString(),
            email,
            name,
            password: btoa(password), // Basic encoding (not for production)
            subscriptionStatus: 'trial',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        this.subscribers.push(newUser);
        localStorage.setItem('subscribers', JSON.stringify(this.subscribers));
        return this.signIn(email, password);
    }

    async signIn(email, password) {
        const user = this.subscribers.find(s => 
            s.email === email && s.password === btoa(password)
        );
        
        if (user) {
            this.currentUser = user;
            this.isAuthenticated = true;
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('clientToken', 'client_' + user.id);
            localStorage.setItem('clientUserId', user.id);
            localStorage.setItem('subscribers', JSON.stringify(this.subscribers));
            this.updateUI();
            return { success: true, user };
        }
        return { success: false, error: 'Invalid credentials' };
    }

    signOut() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUserId');
        this.updateUI();
    }

    updateUI() {
        const body = document.body;
        if (this.isAuthenticated) {
            body.classList.add('authenticated');
        } else {
            body.classList.remove('authenticated');
        }
    }

    hasSubscription() {
        return this.currentUser && 
               ['active', 'trial'].includes(this.currentUser.subscriptionStatus);
    }
}

// Global auth instance
window.authManager = new AuthManager();