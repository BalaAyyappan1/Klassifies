import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  return (
    <div className="flex justify-between items-center mt-4 px-4 py-2 border-t border-[#CFD3D4]">
      {/* Items per page */}
      <div className="flex items-center space-x-2">
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border border-[#CFD3D4] dark:bg-[#333333] dark:text-white rounded-[4px] text-xs p-1"
        >
          {[5, 10, 20].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-xs text-[#53545C] dark:text-white">Items per page</span>
      </div>

      {/* Page selection */}
      <div className="flex items-center space-x-2">
        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="border border-[#CFD3D4] dark:bg-[#333333] dark:text-white rounded-[4px] text-xs p-1"
        >
          {Array.from({ length: totalPages }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <span className="text-xs text-[#53545C] dark:text-white">of {totalPages} Pages</span>
      </div>
    </div>
  );
};

export default Pagination;
