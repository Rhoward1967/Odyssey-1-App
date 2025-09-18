// React components for client portal
const { useState, useEffect } = React;

// Navigation Component
const Navigation = () => {
    const [user, setUser] = useState(window.authManager.currentUser);

    useEffect(() => {
        const checkAuth = () => setUser(window.authManager.currentUser);
        const interval = setInterval(checkAuth, 1000);
        return () => clearInterval(interval);
    }, []);

    return React.createElement('nav', {
        className: 'bg-white shadow-lg sticky top-0 z-50'
    }, 
        React.createElement('div', {
            className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
        },
            React.createElement('div', {
                className: 'flex justify-between items-center h-16'
            },
                React.createElement('div', {
                    className: 'flex items-center'
                },
                    React.createElement('h1', {
                        className: 'text-2xl font-bold text-indigo-600'
                    }, 'HJS Services - Odyssey-1')
                ),
                React.createElement('div', {
                    className: 'flex items-center space-x-4'
                },
                    user ? [
                        React.createElement('span', {
                            key: 'welcome',
                            className: 'text-gray-700'
                        }, `Welcome, ${user.name}`),
                        React.createElement('button', {
                            key: 'signout',
                            className: 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600',
                            onClick: () => {
                                window.authManager.signOut();
                                setUser(null);
                            }
                        }, 'Sign Out')
                    ] : null
                )
            )
        )
    );
};

// Hero Section Component
const HeroSection = () => {
    return React.createElement('section', {
        className: 'gradient-bg text-white py-20'
    },
        React.createElement('div', {
            className: 'max-w-7xl mx-auto px-4 text-center'
        },
            React.createElement('h1', {
                className: 'text-5xl font-bold mb-6 fade-in'
            }, 'HJS Services - Odyssey-1'),
            React.createElement('p', {
                className: 'text-xl mb-8 max-w-3xl mx-auto fade-in'
            }, 'Professional business solutions powered by advanced AI technology. Government contracting, janitorial services, and intelligent automation for your business growth.'),
            React.createElement('div', {
                className: 'space-x-4 fade-in'
            },
                React.createElement('button', {
                    className: 'bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover-scale',
                    onClick: () => window.showAuthModal('signup')
                }, 'Get Started'),
                React.createElement('button', {
                    className: 'border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover-scale',
                    onClick: () => window.showAuthModal('signin')
                }, 'Sign In')
            )
        )
    );
};

// Feature Cards Component
const FeatureCards = () => {
    const features = [
        {
            title: 'Government Contracting',
            description: 'SAM registration, bid management, and compliance tools',
            icon: '🏛️'
        },
        {
            title: 'Janitorial Services',
            description: 'Professional cleaning service management and scheduling',
            icon: '🧽'
        },
        {
            title: 'Business Intelligence',
            description: 'AI-powered analytics and automated reporting',
            icon: '🧠'
        },
        {
            title: 'Document Management',
            description: 'Secure document storage and automated processing',
            icon: '📄'
        },
        {
            title: 'Financial Planning',
            description: 'Budget optimization and financial forecasting',
            icon: '💰'
        },
        {
            title: 'Client Portal',
            description: 'Secure client communication and project tracking',
            icon: '🔐'
        }
    ];

    return React.createElement('section', {
        className: 'py-16 bg-gray-50'
    },
        React.createElement('div', {
            className: 'max-w-7xl mx-auto px-4'
        },
            React.createElement('h2', {
                className: 'text-3xl font-bold text-center mb-12'
            }, 'HJS Services Solutions'),
            React.createElement('div', {
                className: 'grid md:grid-cols-3 gap-8'
            },
                features.map((feature, index) =>
                    React.createElement('div', {
                        key: index,
                        className: 'bg-white p-6 rounded-lg shadow-lg hover-scale'
                    },
                        React.createElement('div', {
                            className: 'text-4xl mb-4'
                        }, feature.icon),
                        React.createElement('h3', {
                            className: 'text-xl font-semibold mb-2'
                        }, feature.title),
                        React.createElement('p', {
                            className: 'text-gray-600'
                        }, feature.description)
                    )
                )
            )
        )
    );
};