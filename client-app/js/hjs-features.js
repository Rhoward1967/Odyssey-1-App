// HJS Services Specific Features for Subscribers
const BillingTab = ({ user }) => {
    const billingHistory = [
        { date: '2024-01-15', amount: '$99.00', service: 'Professional Plan', status: 'Paid' },
        { date: '2023-12-15', amount: '$99.00', service: 'Professional Plan', status: 'Paid' },
        { date: '2023-11-15', amount: '$99.00', service: 'Professional Plan', status: 'Paid' }
    ];

    return React.createElement('div', {
        className: 'space-y-6'
    },
        React.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900'
        }, 'Billing & Subscription'),
        React.createElement('div', {
            className: 'bg-blue-50 p-4 rounded-lg mb-6'
        },
            React.createElement('h3', {
                className: 'font-semibold text-blue-900 mb-2'
            }, 'Current Plan: Professional'),
            React.createElement('p', {
                className: 'text-blue-700'
            }, 'Next billing date: January 15, 2024 - $99.00')
        ),
        React.createElement('div', {
            className: 'space-y-4'
        },
            React.createElement('h3', {
                className: 'font-semibold text-gray-900'
            }, 'Billing History'),
            billingHistory.map((bill, index) =>
                React.createElement('div', {
                    key: index,
                    className: 'flex justify-between items-center p-3 border rounded'
                },
                    React.createElement('div', null,
                        React.createElement('p', {
                            className: 'font-medium'
                        }, bill.service),
                        React.createElement('p', {
                            className: 'text-sm text-gray-600'
                        }, bill.date)
                    ),
                    React.createElement('div', {
                        className: 'text-right'
                    },
                        React.createElement('p', {
                            className: 'font-semibold'
                        }, bill.amount),
                        React.createElement('span', {
                            className: 'text-sm bg-green-100 text-green-800 px-2 py-1 rounded'
                        }, bill.status)
                    )
                )
            )
        )
    );
};

const SupportTab = ({ user }) => {
    const [message, setMessage] = useState('');
    const [tickets, setTickets] = useState([
        { id: '001', subject: 'SAM Registration Help', status: 'Open', date: '2024-01-10' },
        { id: '002', subject: 'Billing Question', status: 'Resolved', date: '2024-01-05' }
    ]);

    return React.createElement('div', {
        className: 'space-y-6'
    },
        React.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900'
        }, 'Support Center'),
        React.createElement('div', {
            className: 'grid md:grid-cols-2 gap-6'
        },
            React.createElement('div', {
                className: 'space-y-4'
            },
                React.createElement('h3', {
                    className: 'font-semibold text-gray-900'
                }, 'Contact Support'),
                React.createElement('textarea', {
                    className: 'w-full p-3 border rounded-lg',
                    rows: 4,
                    placeholder: 'Describe your issue or question...',
                    value: message,
                    onChange: (e) => setMessage(e.target.value)
                }),
                React.createElement('button', {
                    className: 'bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700',
                    onClick: () => {
                        alert('Support ticket submitted!');
                        setMessage('');
                    }
                }, 'Submit Ticket')
            ),
            React.createElement('div', {
                className: 'space-y-4'
            },
                React.createElement('h3', {
                    className: 'font-semibold text-gray-900'
                }, 'Your Support Tickets'),
                tickets.map((ticket, index) =>
                    React.createElement('div', {
                        key: index,
                        className: 'border rounded-lg p-3'
                    },
                        React.createElement('div', {
                            className: 'flex justify-between items-start'
                        },
                            React.createElement('div', null,
                                React.createElement('p', {
                                    className: 'font-medium'
                                }, `#${ticket.id} - ${ticket.subject}`),
                                React.createElement('p', {
                                    className: 'text-sm text-gray-600'
                                }, ticket.date)
                            ),
                            React.createElement('span', {
                                className: `px-2 py-1 rounded text-sm ${
                                    ticket.status === 'Open' 
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                }`
                            }, ticket.status)
                        )
                    )
                )
            )
        )
    );
};