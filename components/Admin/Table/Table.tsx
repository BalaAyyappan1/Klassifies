"use client";
import React, { JSX, useState } from "react";

// Define types for the props
interface TableProps {
  headers: string[];
  rows: (string | number | JSX.Element)[][];
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
}

const Table: React.FC<TableProps> = ({
  headers,
  rows,
  itemsPerPageOptions = [5, 10, 20],
  defaultItemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(defaultItemsPerPage);

  // Calculate total pages and paginated data
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const paginatedRows = rows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page
  };

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto rounded-lg">
          <thead className="border-t border-b border-gray-300 h-13">
            <tr className="text-left">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white"
                >
                  <div className="flex items-center">
                    <span>{header}</span>
                    {/* Optional: Add sorting icons here */}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-white"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 px-4 py-2 border-t border-[#CFD3D4]">
        <div className="flex items-center space-x-2">
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-[#CFD3D4] dark:bg-[#333333] dark:text-white rounded-[4px] text-xs p-1"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <label
            htmlFor="items-per-page"
            className="text-xs text-[#53545C] dark:text-white"
          >
            Items per page
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <select
            id="page-select"
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            className="border border-[#CFD3D4] dark:bg-[#333333] dark:text-white rounded-[4px] text-xs p-1"
          >
            {Array.from({ length: totalPages }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
          <span className="text-xs text-[#53545C] dark:text-white">
            of {totalPages}
          </span>
          <label
            htmlFor="page-select"
            className="text-xs dark:text-white text-[#53545C]"
          >
            Pages
          </label>
        </div>
      </div>
    </div>
  );
};

export default Table;