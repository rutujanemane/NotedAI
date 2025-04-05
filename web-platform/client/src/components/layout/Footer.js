import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-primary-600">NotedAI</h2>
            <p className="text-sm text-gray-500">AI-Powered Smart Note Assistant</p>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} NotedAI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;