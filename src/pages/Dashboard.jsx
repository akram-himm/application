import React, { memo } from 'react';
import PageWithLayout from '../components/layout/PageWithLayout';
import { LayoutProvider } from '../contexts/LayoutContext';

const Dashboard = memo(() => {
  return (
    <LayoutProvider>
      <PageWithLayout
        pageId="dashboard"
        defaultTitle="Tableau de bord"
        defaultIcon="home"
        defaultComponent="dashboard"
        showSplitControls={true}
      />
    </LayoutProvider>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;