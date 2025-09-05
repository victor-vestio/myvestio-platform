import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, DollarSign, FileText, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/ui/sidebar';

function Dashboard() {

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath="/dashboard" />
      
      <main className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Welcome to Vestio Platform</h2>
          <p className="text-muted-foreground">
            Manage your invoice financing with ease
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {[
            { icon: DollarSign, title: 'Total Financed', value: '₦0' },
            { icon: FileText, title: 'Active Invoices', value: '0' },
            { icon: TrendingUp, title: 'Success Rate', value: '0%' },
            { icon: BarChart3, title: 'This Month', value: '₦0' },
          ].map((stat, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Action Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Upload Invoice</h3>
              <p className="text-muted-foreground mb-4">
                Start by uploading your invoice for financing
              </p>
              <Button className="w-full">Upload Invoice</Button>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Browse Opportunities</h3>
              <p className="text-muted-foreground mb-4">
                Explore available investment opportunities
              </p>
              <Button variant="outline" className="w-full">Browse</Button>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Portfolio</h3>
              <p className="text-muted-foreground mb-4">
                View your current investments and returns
              </p>
              <Button variant="outline" className="w-full">View Portfolio</Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default Dashboard;