import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/ui/sidebar';
import Profile from './Profile';
import Security from './Security';
import TwoFA from './TwoFA';

type SettingsTab = 'profile' | 'security' | '2fa';

function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');


  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: '2fa', label: 'Two-Factor Auth', icon: Smartphone }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'security':
        return <Security />;
      case '2fa':
        return <TwoFA />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath="/settings" />
      
      <main className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-8">Settings</h1>
          
          {/* Settings Tabs */}
          <div className="flex gap-4 mb-8">
            {settingsTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className="flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Settings Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default Settings;