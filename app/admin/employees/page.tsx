"use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import Table from '@/components/Admin/Table/Table';

interface Employee {
  _id: string;
  username: string;
  email: string;
  status: string;
  // Add other fields you expect from your API
  adsCount?: number; // Assuming you might want to show number of ads
}

const employees  = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const headers = ["Username", "No of Ads", "Email", "Status"];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/all-users?role=employee');
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Transform employee data into table rows
  const rows = employees.map(employee => [
    employee.username,
    employee.adsCount?.toString() || '0', // Handle potential undefined
    employee.email,
    employee.status
  ]);

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading employees...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-red-500">Error: {error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Table 
        headers={headers} 
        rows={rows} 
        // emptyMessage={employees.length === 0 ? "No employees found" : undefined}
      />
    </AdminLayout>
  );
};

export default employees;