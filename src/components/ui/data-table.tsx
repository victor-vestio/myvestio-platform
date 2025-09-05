import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Input } from './input';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

export interface TableColumn<T = any> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface TableAction<T = any> {
  label: string;
  onClick: (row: T) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  disabled?: (row: T) => boolean;
  className?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  itemsPerPage?: number;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  itemsPerPage = 10,
  searchable = true,
  filterable = false,
  sortable = true,
  emptyMessage = 'No data available',
  emptyIcon,
  className = '',
  loading = false
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Get value from row using accessor
  const getValue = (row: T, accessor: keyof T | ((row: T) => any)) => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    return row[accessor];
  };

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchable) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = getValue(row, column.accessor);
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    if (filterable) {
      Object.entries(filters).forEach(([columnId, filterValue]) => {
        if (filterValue) {
          const column = columns.find(col => col.id === columnId);
          if (column) {
            filtered = filtered.filter(row => {
              const value = getValue(row, column.accessor);
              return String(value).toLowerCase().includes(filterValue.toLowerCase());
            });
          }
        }
      });
    }

    return filtered;
  }, [data, searchTerm, filters, columns, searchable, filterable]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortable) return filteredData;

    const column = columns.find(col => col.id === sortConfig.key);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getValue(a, column.accessor);
      const bValue = getValue(b, column.accessor);

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig, columns, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    setSortConfig(current => {
      if (current?.key === columnId) {
        return {
          key: columnId,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prev => ({ ...prev, [columnId]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 w-full max-w-full ${className}`}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Global Search */}
              {searchable && (
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Column Filters */}
              {filterable && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-2 flex-wrap">
                    {columns
                      .filter(col => col.filterable)
                      .map(column => (
                        <Input
                          key={column.id}
                          placeholder={`Filter ${column.header.toLowerCase()}...`}
                          value={filters[column.id] || ''}
                          onChange={(e) => handleFilterChange(column.id, e.target.value)}
                          className="w-40"
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedData.length === 0 ? (
            <div className="p-12 text-center">
              {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {columns.map((column) => (
                      <th
                        key={column.id}
                        className={`text-left p-4 font-medium ${
                          column.sortable && sortable ? 'cursor-pointer hover:bg-muted/50' : ''
                        } ${column.className || ''}`}
                        onClick={() => sortable && handleSort(column.id)}
                      >
                        <div className="flex items-center gap-2">
                          {column.header}
                          {sortable && column.sortable && (
                            <div className="flex flex-col">
                              <SortAsc 
                                className={`w-3 h-3 ${
                                  sortConfig?.key === column.id && sortConfig.direction === 'asc'
                                    ? 'text-primary' 
                                    : 'text-muted-foreground'
                                }`} 
                              />
                              <SortDesc 
                                className={`w-3 h-3 -mt-1 ${
                                  sortConfig?.key === column.id && sortConfig.direction === 'desc'
                                    ? 'text-primary' 
                                    : 'text-muted-foreground'
                                }`} 
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                    {actions && actions.length > 0 && (
                      <th className="text-left p-4 font-medium">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      {columns.map((column) => {
                        const value = getValue(row, column.accessor);
                        return (
                          <td key={column.id} className={`p-4 ${column.className || ''}`}>
                            {column.render ? column.render(value, row) : String(value)}
                          </td>
                        );
                      })}
                      {actions && actions.length > 0 && (
                        <td className="p-4">
                          <div className="flex gap-2">
                            {actions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                size="sm"
                                variant={action.variant || 'outline'}
                                onClick={() => action.onClick(row)}
                                disabled={action.disabled ? action.disabled(row) : false}
                                className={action.className}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedData.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}