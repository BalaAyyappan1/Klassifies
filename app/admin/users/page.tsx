import Adminlayout from '@/components/Admin/AdminLayout';
import Table from '@/components/Admin/Table/Table';
import React from 'react';

const page: React.FC = () => {
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
            <Adminlayout>
                <div>
                    <Table headers={headers} rows={rows} />
                </div>
            </Adminlayout>
        </div>
    );
};

export default page;