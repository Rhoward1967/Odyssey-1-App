// Subscriber Dashboard Components
const SubscriberDashboard = () => {
    const [user, setUser] = useState(window.authManager.currentUser);
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', name: 'Overview', icon: '📊' },
        { id: 'services', name: 'Services', icon: '⚙️' },
        { id: 'billing', name: 'Billing', icon: '💳' },
        { id: 'support', name: 'Support', icon: '🎧' }
    ];

    const renderTabContent = () => {
        switch(activeTab) {
            case 'overview':
                return React.createElement(OverviewTab, { user });
            case 'services':
                return React.createElement(ServicesTab, { user });
            case 'billing':
                return React.createElement(BillingTab, { user });
            case 'support':
                return React.createElement(SupportTab, { user });
            default:
                return React.createElement(OverviewTab, { user });
        }
    };

    return React.createElement('div', {
        className: 'min-h-screen bg-gray-100'
    },
        React.createElement('div', {
            className: 'max-w-7xl mx-auto px-4 py-8'
        },
            React.createElement('div', {
                className: 'bg-white rounded-lg shadow-lg overflow-hidden'
            },
                React.createElement('div', {
                    className: 'border-b border-gray-200'
                },
                    React.createElement('nav', {
                        className: 'flex space-x-8 px-6'
                    },
                        tabs.map(tab =>
                            React.createElement('button', {
                                key: tab.id,
                                className: `py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id 
                                        ? 'border-indigo-500 text-indigo-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`,
                                onClick: () => setActiveTab(tab.id)
                            },
                                React.createElement('span', {
                                    className: 'mr-2'
                                }, tab.icon),
                                tab.name
                            )
                        )
                    )
                ),
                React.createElement('div', {
                    className: 'p-6'
                }, renderTabContent())
            )
        )
    );
};

const OverviewTab = ({ user }) => {
    return React.createElement('div', {
        className: 'space-y-6'
    },
        React.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900'
        }, 'Account Overview'),
        React.createElement('div', {
            className: 'grid md:grid-cols-3 gap-6'
        },
            React.createElement('div', {
                className: 'bg-blue-50 p-4 rounded-lg'
            },
                React.createElement('h3', {
                    className: 'font-semibold text-blue-900'
                }, 'Subscription Status'),
                React.createElement('p', {
                    className: 'text-blue-700 capitalize'
                }, user?.subscriptionStatus || 'Inactive')
            ),
            React.createElement('div', {
                className: 'bg-green-50 p-4 rounded-lg'
            },
                React.createElement('h3', {
                    className: 'font-semibold text-green-900'
                }, 'Member Since'),
                React.createElement('p', {
                    className: 'text-green-700'
                }, new Date(user?.createdAt).toLocaleDateString())
            ),
            React.createElement('div', {
                className: 'bg-purple-50 p-4 rounded-lg'
            },
                React.createElement('h3', {
                    className: 'font-semibold text-purple-900'
                }, 'Last Login'),
                React.createElement('p', {
                    className: 'text-purple-700'
                }, new Date(user?.lastLogin).toLocaleDateString())
            )
        )
    );
};

const ServicesTab = ({ user }) => {
    const services = [
        { name: 'Government Contracting Tools', status: 'Active', usage: '75%' },
        { name: 'Janitorial Management', status: 'Active', usage: '45%' },
        { name: 'Business Intelligence', status: 'Active', usage: '60%' },
        { name: 'Document Processing', status: 'Limited', usage: '90%' },
        { name: 'Financial Analytics', status: 'Active', usage: '35%' },
        { name: 'Client Communication', status: 'Active', usage: '80%' }
    ];

    return React.createElement('div', {
        className: 'space-y-6'
    },
        React.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900'
        }, 'Your Services'),
        React.createElement('div', {
            className: 'space-y-4'
        },
            services.map((service, index) =>
                React.createElement('div', {
                    key: index,
                    className: 'border rounded-lg p-4'
                },
                    React.createElement('div', {
                        className: 'flex justify-between items-center'
                    },
                        React.createElement('h3', {
                            className: 'font-semibold'
                        }, service.name),
                        React.createElement('span', {
                            className: `px-2 py-1 rounded text-sm ${
                                service.status === 'Active' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`
                        }, service.status)
                    ),
                    React.createElement('div', {
                        className: 'mt-2'
                    },
                        React.createElement('div', {
                            className: 'text-sm text-gray-600 mb-1'
                        }, `Usage: ${service.usage}`),
                        React.createElement('div', {
                            className: 'w-full bg-gray-200 rounded-full h-2'
                        },
                            React.createElement('div', {
                                className: 'bg-blue-600 h-2 rounded-full',
                                style: { width: service.usage }
                            })
                        )
                    )
                )
            )
        )
    );
};