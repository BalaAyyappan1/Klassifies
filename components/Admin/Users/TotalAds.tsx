import React from 'react';
import Table from '../Table/Table';

const TotalAdsTable: React.FC = () => {
  const headers = ["username", "Title", "Email", "status"];

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
 <Table headers={headers} rows={rows} />
 </div>
 );
};

export default TotalAdsTable;