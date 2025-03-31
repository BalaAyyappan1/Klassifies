"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import Table from '@/components/Admin/Table/Table';
import Image from 'next/image';

interface AdWithUser {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'rejected' | 'blocked';
  createdAd: string;
  mainCategory: string;
  subCategory?: string;
  images: string[];
  mobile: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    isBlocked: boolean;
  };
}

const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        <div className="inline-block w-full max-w-4xl transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
          <div className="absolute right-2 top-2">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const page: React.FC = () => {
  const [ads, setAds] = useState<AdWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAd, setSelectedAd] = useState<AdWithUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const headers = ["Title", "User", "Category", "Status", "Date", "Actions"];

  const fetchAds = async (status = 'all') => {
    try {
      setLoading(true);
      const url = `/api/all-ads${status !== 'all' ? `?status=${status}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch ads');
      const data = await response.json();
      
      setAds(data.ads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds(statusFilter === 'all' ? undefined : statusFilter);
  }, [statusFilter]);

  const updateAdStatus = async (adId: string, newStatus: 'pending' | 'active' | 'rejected' | 'blocked') => {
    try {
      const response = await fetch('/api/all-ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update ad status');
      
      setAds(ads.map(ad => ad._id === adId ? { ...ad, status: newStatus } : ad));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const openAdDetails = (ad: AdWithUser) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  const rows = ads.map(ad => [
    <span 
      key={`title-${ad._id}`}
      className="text-blue-600 hover:underline cursor-pointer"
      onClick={() => openAdDetails(ad)}
    >
      {ad.title}
    </span>,
    <div key={`user-${ad._id}`}>
      <div className="font-medium">{ad.user.name}</div>
      <div className="text-sm text-gray-500">{ad.user.email}</div>
    </div>,
    ad.mainCategory,
    <span 
      key={`status-${ad._id}`}
      className={`px-2 py-1 rounded-full text-xs ${
        ad.status === 'active' ? 'bg-green-100 text-green-800' :
        ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        ad.status === 'rejected' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}
    >
      {ad.status}
    </span>,
    new Date(ad.createdAd).toLocaleDateString(),
    <select
      key={`actions-${ad._id}`}
      value={ad.status}
      onChange={(e) => updateAdStatus(ad._id, e.target.value as 'pending' | 'active' | 'rejected' | 'blocked')}
      className="border rounded px-2 py-1 text-sm"
    >
      <option value="pending">Pending</option>
      <option value="active">Active</option>
      <option value="rejected">Rejected</option>
      <option value="blocked">Blocked</option>
    </select>
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
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ads Management</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
      
      <Table headers={headers} rows={rows} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedAd && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{selectedAd.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Images</h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* <Image
                    src={selectedAd.images[0]}
                    alt="Ad main image"
                    className="w-full h-64 object-cover rounded"
                  /> */}
                 {selectedAd.images.map((image, index) => (
  <div key={index} className="w-full h-40 relative">
    <Image
      src={image}
      alt={`Ad image ${index + 1}`}
      fill
      className="object-cover rounded"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  </div>
))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="space-y-3">
                  <p><span className="font-medium">Description:</span> {selectedAd.description}</p>
                  <p><span className="font-medium">Category:</span> {selectedAd.mainCategory}</p>
                  {selectedAd.subCategory && (
                    <p><span className="font-medium">Sub Category:</span> {selectedAd.subCategory}</p>
                  )}
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedAd.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedAd.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedAd.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedAd.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Date Posted:</span> {new Date(selectedAd.createdAd).toLocaleString()}</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">User:</span> {selectedAd.user.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedAd.user.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedAd.user.phoneNumber}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Address:</span> {selectedAd.address}</p>
                    <p><span className="font-medium">City:</span> {selectedAd.city}</p>
                    <p><span className="font-medium">State:</span> {selectedAd.state}</p>
                    <p><span className="font-medium">Pincode:</span> {selectedAd.pincode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default page;