import React from 'react';
import { Button } from '@codepilot/ui';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="bg-white shadow rounded-lg divide-y">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 text-gray-900">{user?.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 text-gray-900">{user?.email}</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Model</label>
                <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>GPT-4 Turbo</option>
                  <option>GPT-3.5 Turbo</option>
                  <option>Claude 3 Opus</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h2>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
