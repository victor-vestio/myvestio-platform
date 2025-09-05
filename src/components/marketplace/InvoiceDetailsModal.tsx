import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  Building2, 
  User, 
  Clock, 
  Percent,
  Users,
  TrendingUp,
  FileText,
  Mail
} from 'lucide-react';
import { formatCurrency, type MarketplaceInvoice } from '@/lib/marketplace';

interface InvoiceDetailsModalProps {
  invoice: MarketplaceInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onMakeOffer?: (invoice: MarketplaceInvoice) => void;
}

export function InvoiceDetailsModal({ 
  invoice, 
  isOpen, 
  onClose, 
  onMakeOffer 
}: InvoiceDetailsModalProps) {
  if (!invoice) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Details"
      size="lg"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => onMakeOffer?.(invoice)}
            disabled={invoice.marketplace.hasMyOffer}
          >
            {invoice.marketplace.hasMyOffer ? 'Offer Submitted' : 'Make Offer'}
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Invoice Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {invoice.invoiceId}
            </h3>
            <p className="text-muted-foreground mt-1">
              {invoice.description}
            </p>
          </div>
          <Badge 
            variant={invoice.marketplace.hasMyOffer ? "default" : "secondary"}
            className="ml-4"
          >
            {invoice.marketplace.hasMyOffer ? 'Your Offer' : 'Available'}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Invoice Amount</p>
                  <p className="font-bold text-green-600">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Max Funding</p>
                  <p className="font-bold text-purple-600">
                    {formatCurrency(invoice.fundingTerms.maxFundingAmount, invoice.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Interest Rate</p>
                  <p className="font-bold text-blue-600">
                    {invoice.fundingTerms.recommendedInterestRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Days Until Due</p>
                  <p className="font-bold text-orange-600">
                    {invoice.daysUntilDue} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                <p className="text-sm">
                  {formatDate(invoice.issueDate || new Date().toISOString())}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p className="text-sm">
                  {formatDate(invoice.dueDate || new Date().toISOString())}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currency</p>
                <p className="text-sm">{invoice.currency}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Tenure</p>
                <p className="text-sm">{invoice.fundingTerms.maxTenure} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parties Involved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seller Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Seller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">{invoice.seller.name}</p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <p className="text-sm">{invoice.seller.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anchor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Anchor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">{invoice.anchor.name}</p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <p className="text-sm">{invoice.anchor.email || 'No email provided'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Marketplace Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Marketplace Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Listed At</p>
                <p className="text-sm">{formatDate(invoice.marketplace.listedAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Offers</p>
                <p className="text-sm font-bold">{invoice.marketplace.offerCount} offers</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Competitive Rate</p>
                <p className="text-sm font-bold text-blue-600">
                  {invoice.marketplace.bestCompetitiveRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}