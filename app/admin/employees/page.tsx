import React from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import Table from '@/components/Admin/Table/Table';

const employees: React.FC = () => {
    const headers = ["username", "No of ads", "Email", "status"];

    const rows = [
      ["John Doe", 28, "john.doe@example.com", "Developer"],
      ["Jane Smith", 34, "jane.smith@example.com", "Designer"],
      ["Alice Johnson", 22, "alice.johnson@example.com", "Intern"],
      ["Bob Brown", 45, "bob.brown@example.com", "Manager"],
      ["Bob Brown", 45, "bob.brown@example.com", "Manager"],
  
      ["Bob Brown", 45, "bob.brown@example.com", "Manager"],
  
      ["Bob Brown", 45, "bob.brown@example.com", "Manager"],
  
      ["Bob Brown", 45, "bob.brown@example.com", "Manager"],
      ["Bob Brown", 45, "bob.brown@example.com", "Manager"],
      ["Bob Brown", 45, "bob.brown@example.com", "Manager"],
  
    ];
 return (
 <div>
    <AdminLayout>
        <Table headers={headers} rows={rows} />
        </AdminLayout>
 </div>
 );
};

export default employees;