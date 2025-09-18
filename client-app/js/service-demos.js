// HJS Services Demo Features for Potential Subscribers
const ServiceDemos = () => {
    const [activeDemo, setActiveDemo] = useState('contracting');

    const demos = {
        contracting: {
            title: 'Government Contracting Tools',
            description: 'SAM registration assistance and bid management',
            component: ContractingDemo
        },
        janitorial: {
            title: 'Janitorial Service Management',
            description: 'Scheduling, quality control, and client communication',
            component: JanitorialDemo
        },
        intelligence: {
            title: 'Business Intelligence Dashboard',
            description: 'AI-powered analytics and reporting',
            component: IntelligenceDemo
        }
    };

    return React.createElement('section', {
        className: 'py-16 bg-white'
    },
        React.createElement('div', {
            className: 'max-w-7xl mx-auto px-4'
        },
            React.createElement('h2', {
                className: 'text-3xl font-bold text-center mb-12'
            }, 'Try Our Services'),
            React.createElement('div', {
                className: 'flex justify-center mb-8'
            },
                React.createElement('div', {
                    className: 'flex space-x-4'
                },
                    Object.keys(demos).map(key =>
                        React.createElement('button', {
                            key: key,
                            className: `px-6 py-3 rounded-lg font-medium ${
                                activeDemo === key 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`,
                            onClick: () => setActiveDemo(key)
                        }, demos[key].title)
                    )
                )
            ),
            React.createElement('div', {
                className: 'bg-gray-50 rounded-lg p-8'
            },
                React.createElement(demos[activeDemo].component)
            )
        )
    );
};

const ContractingDemo = () => {
    return React.createElement('div', {
        className: 'space-y-6'
    },
        React.createElement('h3', {
            className: 'text-xl font-semibold mb-4'
        }, 'SAM Registration Status Checker'),
        React.createElement('div', {
            className: 'grid md:grid-cols-2 gap-6'
        },
            React.createElement('div', {
                className: 'space-y-4'
            },
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Enter DUNS Number',
                    className: 'w-full p-3 border rounded-lg'
                }),
                React.createElement('button', {
                    className: 'bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700',
                    onClick: () => alert('Demo: SAM status would be checked here')
                }, 'Check SAM Status')
            ),
            React.createElement('div', {
                className: 'bg-white p-4 rounded-lg border'
            },
                React.createElement('h4', {
                    className: 'font-semibold mb-2'
                }, 'Demo Results:'),
                React.createElement('p', {
                    className: 'text-green-600'
                }, '✓ SAM Registration: Active'),
                React.createElement('p', {
                    className: 'text-blue-600'
                }, '📅 Expiration: 12/15/2024'),
                React.createElement('p', {
                    className: 'text-gray-600'
                }, '🏢 Entity Type: Small Business')
            )
        )
    );
};

const JanitorialDemo = () => {
    return React.createElement('div', {
        className: 'space-y-6'
    },
        React.createElement('h3', {
            className: 'text-xl font-semibold mb-4'
        }, 'Service Schedule Manager'),
        React.createElement('div', {
            className: 'grid md:grid-cols-3 gap-4'
        },
            ['Office Building A', 'Retail Store B', 'Medical Facility C'].map((location, index) =>
                React.createElement('div', {
                    key: index,
                    className: 'bg-white p-4 rounded-lg border'
                },
                    React.createElement('h4', {
                        className: 'font-semibold mb-2'
                    }, location),
                    React.createElement('p', {
                        className: 'text-sm text-gray-600 mb-2'
                    }, `Next service: ${new Date(Date.now() + index * 86400000).toLocaleDateString()}`),
                    React.createElement('div', {
                        className: 'flex justify-between items-center'
                    },
                        React.createElement('span', {
                            className: 'text-green-600 text-sm'
                        }, '✓ Up to date'),
                        React.createElement('button', {
                            className: 'text-indigo-600 text-sm hover:underline'
                        }, 'View Details')
                    )
                )
            )
        )
    );
};

const IntelligenceDemo = () => {
    return React.createElement('div', {
        className: 'space-y-6'
    },
        React.createElement('h3', {
            className: 'text-xl font-semibold mb-4'
        }, 'Business Analytics Dashboard'),
        React.createElement('div', {
            className: 'grid md:grid-cols-4 gap-4 mb-6'
        },
            [
                { label: 'Monthly Revenue', value: '$45,230', change: '+12%' },
                { label: 'Active Contracts', value: '23', change: '+3' },
                { label: 'Client Satisfaction', value: '94%', change: '+2%' },
                { label: 'Cost Efficiency', value: '87%', change: '+5%' }
            ].map((metric, index) =>
                React.createElement('div', {
                    key: index,
                    className: 'bg-white p-4 rounded-lg border'
                },
                    React.createElement('p', {
                        className: 'text-sm text-gray-600'
                    }, metric.label),
                    React.createElement('p', {
                        className: 'text-2xl font-bold'
                    }, metric.value),
                    React.createElement('p', {
                        className: 'text-green-600 text-sm'
                    }, metric.change)
                )
            )
        ),
        React.createElement('div', {
            className: 'bg-white p-4 rounded-lg border'
        },
            React.createElement('h4', {
                className: 'font-semibold mb-2'
            }, 'AI Insights:'),
            React.createElement('ul', {
                className: 'space-y-1 text-sm text-gray-700'
            },
                React.createElement('li', null, '• Recommend increasing janitorial staff for Q2 demand'),
                React.createElement('li', null, '• 3 new government contracts likely to be awarded next month'),
                React.createElement('li', null, '• Cost optimization could save $2,400 monthly')
            )
        )
    );
};