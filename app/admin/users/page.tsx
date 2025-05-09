"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import Table from '@/components/Admin/Table/Table';

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isBlocked: boolean;
  ads?: Array<{
    _id: string;
    title: string;
    status: string;
    createdAd: string;
    mainCategory: string;
  }>;
  adsCount?: number;
}

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/all-users?role=user&includeAds=true');
      console.log('response', response.status);
      console.log('response', response.formData);

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlockStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('api/all-users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isBlocked: !currentStatus
        })
      });

      if (!response.ok) throw new Error('Failed to update user status');
      
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isBlocked: !currentStatus } 
          : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserId(selectedUserId === userId ? null : userId);
  };

  const headers = ["Username", "Email", "Status", "Number", "Ads", "Actions"];

  const rows = users.map(user => [
    <span 
      key={`name-${user._id}`}
      className="text-blue-500 cursor-pointer hover:underline"
      onClick={() => toggleUserSelection(user._id)}
    >
      {user.name}
    </span>,
    <span key={`email-${user._id}`}>{user.email}</span>,
    user.isBlocked ? (
      <span key={`status-${user._id}`} className="text-red-500 font-medium">Blocked</span>
    ) : (
      <span key={`status-${user._id}`} className="text-green-500 font-medium">Active</span>
    ),
    <span key={`phone-${user._id}`}>{user.phoneNumber}</span>,
    <span key={`ads-${user._id}`} className="font-medium">{user.ads?.length || 0}</span>,
    <button
      key={`action-${user._id}`}
      onClick={() => toggleBlockStatus(user._id, user.isBlocked)}
      className={`px-3 py-1 rounded-md text-white ${
        user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
      }`}
    >
      {user.isBlocked ? 'Unblock' : 'Block'}
    </button>
  ]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-red-500 p-4 bg-red-50 rounded-md">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Table 
          headers={headers} 
          rows={rows}
        />
        
        {selectedUserId && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              {users.find(u => u._id === selectedUserId)?.name}&apos;s Ads
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({users.find(u => u._id === selectedUserId)?.ads?.length || 0} ads)
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.find(u => u._id === selectedUserId)?.ads?.map(ad => (
                <div key={`ad-${ad._id}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-lg">{ad.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      ad.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ad.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(ad.createdAd).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{ad.mainCategory}</p>
                </div>
              ))}
            </div>
            
            {users.find(u => u._id === selectedUserId)?.ads?.length === 0 && (
              <p className="text-gray-500 text-center py-4">No ads found for this user</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Page;