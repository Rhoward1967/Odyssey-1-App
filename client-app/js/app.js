// Main App Component and Modal System
const { useState, useEffect } = React;

// Auth Modal Component
const AuthModal = ({ isOpen, mode, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;
            if (mode === 'signup') {
                result = await window.authManager.signUp(email, password, name);
            } else {
                result = await window.authManager.signIn(email, password);
            }

            if (result.success) {
                onClose();
                window.location.reload(); // Refresh to show authenticated state
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return React.createElement('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        onClick: onClose
    },
        React.createElement('div', {
            className: 'bg-white rounded-lg p-8 max-w-md w-full mx-4',
            onClick: (e) => e.stopPropagation()
        },
            React.createElement('h2', {
                className: 'text-2xl font-bold mb-6 text-center'
            }, mode === 'signup' ? 'Create Account' : 'Sign In'),
            React.createElement('form', {
                onSubmit: handleSubmit,
                className: 'space-y-4'
            },
                mode === 'signup' && React.createElement('input', {
                    type: 'text',
                    placeholder: 'Full Name',
                    value: name,
                    onChange: (e) => setName(e.target.value),
                    className: 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    required: true
                }),
                React.createElement('input', {
                    type: 'email',
                    placeholder: 'Email',
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    className: 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    required: true
                }),
                React.createElement('input', {
                    type: 'password',
                    placeholder: 'Password',
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                    className: 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    required: true
                }),
                error && React.createElement('p', {
                    className: 'text-red-500 text-sm'
                }, error),
                React.createElement('button', {
                    type: 'submit',
                    disabled: loading,
                    className: 'w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50'
                }, loading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Sign In'))
            ),
            React.createElement('div', {
                className: 'text-center mt-4'
            },
                React.createElement('button', {
                    type: 'button',
                    className: 'text-indigo-600 hover:underline',
                    onClick: () => window.showAuthModal(mode === 'signup' ? 'signin' : 'signup')
                }, mode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Sign Up')
            )
        )
    );
};

// Main App Component
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(window.authManager.isAuthenticated);
    const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' });

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(window.authManager.isAuthenticated);
        };
        const interval = setInterval(checkAuth, 1000);
        return () => clearInterval(interval);
    }, []);

    // Global function to show auth modal
    window.showAuthModal = (mode) => {
        setAuthModal({ isOpen: true, mode });
    };

    const closeAuthModal = () => {
        setAuthModal({ isOpen: false, mode: 'signin' });
    };

    return React.createElement('div', {
        className: 'min-h-screen'
    },
        React.createElement(Navigation),
        isAuthenticated ? 
            React.createElement(SubscriberDashboard) :
            React.createElement('div', null,
                React.createElement(HeroSection),
                React.createElement(FeatureCards),
                React.createElement(ServiceDemos)
            ),
        React.createElement(AuthModal, {
            isOpen: authModal.isOpen,
            mode: authModal.mode,
            onClose: closeAuthModal
        })
    );
};

// Render the app
ReactDOM.render(React.createElement(App), document.getElementById('root'));