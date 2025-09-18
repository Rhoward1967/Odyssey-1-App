import React from 'react';
import { SimpleCalendar } from './SimpleCalendar';
import { AppointmentScheduler } from './AppointmentScheduler';

export const CalendarSection: React.FC = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Schedule & Manage Appointments
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional appointment scheduling with calendar integration, automated notifications, and seamless client management.
          </p>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
          <SimpleCalendar />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Ready to Schedule?
            </h3>
            <p className="text-blue-100 mb-4">
              Book appointments instantly with automated confirmations
            </p>
            <AppointmentScheduler />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarSection;