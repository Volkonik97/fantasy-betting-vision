
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MatchesPaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const MatchesPagination = ({
  currentPage,
  pageCount,
  onPageChange,
}: MatchesPaginationProps) => {
  if (pageCount <= 1) return null;
  
  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {[...Array(pageCount)].map((_, i) => (
          <PaginationItem key={i}>
            <PaginationLink 
              onClick={() => onPageChange(i + 1)}
              isActive={currentPage === i + 1}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
            className={currentPage === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default MatchesPagination;
