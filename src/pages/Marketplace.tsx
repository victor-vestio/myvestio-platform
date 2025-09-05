/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, TableColumn, TableAction } from '@/components/ui/data-table';
import { 
  ShoppingCart, 
  DollarSign, 
  Calendar, 
  Building2, 
  Users, 
  Percent,
  TrendingUp
} from 'lucide-react';
import Sidebar from '@/components/ui/sidebar';
import { tokenStorage } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';
import { useProfile } from '@/contexts/ProfileContext';
import { marketplaceAPI, formatCurrency, type BrowseFilters, type MarketplaceInvoice } from '@/lib/marketplace';
import { ShimmerCard } from '@/components/ui/shimmer';
import { InvoiceDetailsModal } from '@/components/marketplace/InvoiceDetailsModal';
import { useModal } from '@/components/ui/modal';

function Marketplace() {
  // ALL HOOKS FIRST - NEVER CONDITIONALLY CALLED
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<MarketplaceInvoice | null>(null);
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const { addToast } = useToast();
  const { profile, isLoading: profileLoading } = useProfile();
  const accessToken = tokenStorage.getAccessToken();

  // Only call API if user is a lender
  const { data: marketplaceData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['marketplace', 'browse', currentPage],
    queryFn: async () => {
      console.log('🚀 API CALL START - Page:', currentPage);
      
      const filters: BrowseFilters = {
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      console.log('📋 Request filters:', filters);
      
      try {
        const response = await marketplaceAPI.browseMarketplace(accessToken!, filters);
        console.log('✅ API SUCCESS - Page:', currentPage);
        console.log('📊 Full response:', response);
        console.log('🔍 Response.data type:', typeof response.data);
        console.log('🔍 Response.data is Array:', Array.isArray(response.data));
        console.log('🔍 Response.data structure:', response.data);
        
        // Validate response structure
        if (!response || !response.data) {
          throw new Error('Invalid response structure');
        }
        
        // Don't extract invoices here - let the useMemo handle it
        console.log('📄 Response validated, will be processed by useMemo');
        
        setIsChangingPage(false); // Reset changing page flag
        return response;
        
      } catch (error) {
        console.error('❌ API ERROR - Page:', currentPage, error);
        setIsChangingPage(false);
        throw error;
      }
    },
    enabled: !!accessToken && !profileLoading && profile?.role === 'lender',
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: any) => {
      console.error('❌ QUERY ERROR:', error);
      addToast('error', error.message || 'Failed to load marketplace');
      setIsChangingPage(false);
    }
  });

  // Robust data extraction with fallbacks - handles both array and object responses
  const invoices = React.useMemo(() => {
    if (!marketplaceData || !marketplaceData.data) {
      console.log('❌ No marketplace data available');
      return [];
    }
    
    let invoiceList = [];
    
    // Handle array format (Page 1): data: Array(1)
    if (Array.isArray(marketplaceData.data)) {
      invoiceList = marketplaceData.data[0]?.invoices || [];
      console.log('📊 Extracted invoices (ARRAY format):', invoiceList.length);
    } 
    // Handle object format (Page 2+): data: {...}
    else if (marketplaceData.data && typeof marketplaceData.data === 'object') {
      invoiceList = marketplaceData.data.invoices || [];
      console.log('📊 Extracted invoices (OBJECT format):', invoiceList.length);
    }
    
    console.log('📊 Final invoiceList:', invoiceList);
    return invoiceList;
  }, [marketplaceData]);

  const pagination = React.useMemo(() => {
    if (!marketplaceData || !marketplaceData.data) {
      return null;
    }
    
    let paginationInfo = null;
    
    // Handle array format (Page 1): data: Array(1)
    if (Array.isArray(marketplaceData.data)) {
      paginationInfo = marketplaceData.data[0]?.pagination;
      console.log('📄 Pagination info (ARRAY format):', paginationInfo);
    } 
    // Handle object format (Page 2+): data: {...}
    else if (marketplaceData.data && typeof marketplaceData.data === 'object') {
      paginationInfo = marketplaceData.data.pagination;
      console.log('📄 Pagination info (OBJECT format):', paginationInfo);
    }
    
    console.log('📄 Final pagination:', paginationInfo);
    return paginationInfo;
  }, [marketplaceData]);

  // Handle pagination with loading states
  const handlePreviousPage = React.useCallback(() => {
    if (isFetching || isChangingPage) return;
    
    const newPage = Math.max(1, currentPage - 1);
    console.log('⬅️ PREVIOUS PAGE:', currentPage, '→', newPage);
    setIsChangingPage(true);
    setCurrentPage(newPage);
  }, [currentPage, isFetching, isChangingPage]);

  const handleNextPage = React.useCallback(() => {
    if (isFetching || isChangingPage) return;
    
    const newPage = currentPage + 1;
    console.log('➡️ NEXT PAGE:', currentPage, '→', newPage);
    setIsChangingPage(true);
    setCurrentPage(newPage);
  }, [currentPage, isFetching, isChangingPage]);

  // Handle modal actions
  const handleViewInvoice = React.useCallback((invoice: MarketplaceInvoice) => {
    setSelectedInvoice(invoice);
    openModal();
  }, [openModal]);

  const handleMakeOffer = React.useCallback((invoice: MarketplaceInvoice) => {
    console.log('Make offer on invoice:', invoice);
    addToast('info', `Making offer for invoice ${invoice.invoiceId}`);
    closeModal();
    // TODO: Implement offer functionality
  }, [addToast, closeModal]);

  // Determine if we should show loading state
  const isTableLoading = isLoading || isFetching || isChangingPage;
  
  // Determine if we should show data
  const shouldShowData = !isTableLoading && invoices.length > 0;
  const shouldShowEmptyState = !isTableLoading && invoices.length === 0 && !error;

  // Define table columns
  const columns: TableColumn<MarketplaceInvoice>[] = React.useMemo(() => [
    {
      id: 'invoice',
      header: 'Invoice',
      accessor: 'invoiceId',
      sortable: true,
      filterable: true,
      className: 'whitespace-nowrap',
      render: (value, row) => (
        <div>
          <p className="font-medium text-sm">{value}</p>
          <p className="text-xs text-muted-foreground">
            {row.description}
          </p>
        </div>
      )
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      render: (value) => (
        <p className="font-semibold text-green-600">
          {formatCurrency(value)}
        </p>
      )
    },
    {
      id: 'seller',
      header: 'Seller',
      accessor: (row) => row.seller.name,
      sortable: true,
      filterable: true,
      className: 'whitespace-nowrap',
      render: (_, row) => (
        <div>
          <p className="font-medium text-sm">{row.seller.name}</p>
          <p className="text-xs text-muted-foreground">{row.seller.email}</p>
        </div>
      )
    },
    {
      id: 'anchor',
      header: 'Anchor',
      accessor: (row) => row.anchor.name,
      sortable: true,
      filterable: true,
      className: 'whitespace-nowrap',
      render: (_, row) => (
        <p className="text-sm">{row.anchor.name}</p>
      )
    },
    {
      id: 'rate',
      header: 'Rate',
      accessor: (row) => row.fundingTerms.recommendedInterestRate,
      sortable: true,
      render: (value) => (
        <p className="font-semibold text-blue-600">{value}%</p>
      )
    },
    {
      id: 'daysUntilDue',
      header: 'Days Due',
      accessor: 'daysUntilDue',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      id: 'maxFunding',
      header: 'Max Funding',
      accessor: (row) => row.fundingTerms.maxFundingAmount,
      sortable: true,
      render: (value) => (
        <p className="font-semibold text-purple-600">
          {formatCurrency(value)}
        </p>
      )
    },
    {
      id: 'competition',
      header: 'Competition',
      accessor: (row) => row.marketplace.offerCount,
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => row.marketplace.hasMyOffer,
      className: 'whitespace-nowrap',
      render: (hasMyOffer) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          hasMyOffer 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {hasMyOffer ? 'Your Offer' : 'Available'}
        </span>
      )
    }
  ], []);

  // Define table actions
  const actions: TableAction<MarketplaceInvoice>[] = React.useMemo(() => [
    {
      label: 'View',
      onClick: handleViewInvoice,
      variant: 'outline'
    },
    {
      label: 'Offer',
      onClick: (row) => handleMakeOffer(row),
      disabled: (row) => row.marketplace.hasMyOffer,
      variant: 'default'
    }
  ], [handleViewInvoice, handleMakeOffer]);

  // Debug logging
  console.log('🔍 RENDER STATE:');
  console.log('- Current page:', currentPage);
  console.log('- Is loading:', isLoading);
  console.log('- Is fetching:', isFetching);
  console.log('- Is changing page:', isChangingPage);
  console.log('- Is table loading:', isTableLoading);
  console.log('- Has error:', !!error);
  console.log('- Invoices count:', invoices.length);
  console.log('- Should show data:', shouldShowData);
  console.log('- Should show empty:', shouldShowEmptyState);
  console.log('- Pagination:', pagination);

  if (profileLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar currentPath="/marketplace" />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show access denied for non-lenders
  if (profile?.role !== 'lender') {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar currentPath="/marketplace" />
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
            </div>
            
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                <p className="text-muted-foreground">
                  Marketplace browsing is only available for Lender accounts. Your current role: {profile?.role}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar currentPath="/marketplace" />
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
            </div>
            
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-600 mb-4">Failed to load marketplace</p>
                <Button onClick={() => refetch()}>Try Again</Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar currentPath="/marketplace" />
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath="/marketplace" />
      
      <main className="flex-1 p-8 min-w-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
            <span className="text-sm text-muted-foreground">({profile?.role})</span>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Available Invoices</p>
                    <p className="font-semibold">{pagination?.totalInvoices || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="font-semibold">
                      {formatCurrency(
                        invoices.reduce((sum, inv) => sum + inv.amount, 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Percent className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Rate</p>
                    <p className="font-semibold">
                      {invoices.length > 0 
                        ? `${(invoices.reduce((sum, inv) => sum + inv.fundingTerms.recommendedInterestRate, 0) / invoices.length).toFixed(1)}%`
                        : '0%'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Competition</p>
                    <p className="font-semibold">
                      {invoices.length > 0 
                        ? `${(invoices.reduce((sum, inv) => sum + inv.marketplace.offerCount, 0) / invoices.length).toFixed(1)} offers`
                        : '0 offers'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <DataTable
              data={shouldShowData ? invoices : []}
              columns={columns}
              actions={actions}
              itemsPerPage={invoices.length || 10}
              searchable={!isTableLoading}
              filterable={!isTableLoading}
              sortable={!isTableLoading}
              loading={isTableLoading}
              emptyMessage={shouldShowEmptyState ? "There are currently no invoices available in the marketplace." : ""}
              emptyIcon={shouldShowEmptyState ? <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto" /> : undefined}
              className="w-full max-w-full"
            />
            
            {/* Server-side Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {isTableLoading ? (
                          <span className="text-blue-600">Loading page {currentPage}...</span>
                        ) : (
                          <>
                            Showing {(currentPage - 1) * 10 + 1} to{' '}
                            {Math.min(currentPage * 10, pagination.totalInvoices)} of {pagination.totalInvoices} invoices
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={!pagination.hasPrev || isTableLoading}
                        >
                          {isChangingPage && currentPage > 1 ? 'Loading...' : 'Previous'}
                        </Button>
                        
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {pagination.totalPages}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={!pagination.hasNext || isTableLoading}
                        >
                          {isChangingPage && currentPage < pagination.totalPages ? 'Loading...' : 'Next'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={closeModal}
        onMakeOffer={handleMakeOffer}
      />
    </div>
  );
}

export default Marketplace;