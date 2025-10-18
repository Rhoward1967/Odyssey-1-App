import React from 'react';

const Test: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-purple-600 mb-4">Test Page</h1>
      <p className="text-lg text-gray-700">
        This is a simple test page to verify routing is working.
      </p>
      <div className="mt-8 p-4 bg-blue-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Routing Status:</h2>
        <p>✅ React Router is working</p>
        <p>✅ AppLayout is rendering</p>
        <p>✅ Outlet is displaying content</p>
      </div>
    </div>
  );
};

export default Test;