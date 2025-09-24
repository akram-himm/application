import React, { memo } from 'react';
import PageWithLayout from '../components/layout/PageWithLayout';
import { LayoutProvider } from '../contexts/LayoutContext';

const PlanView = memo(() => {
  return (
    <LayoutProvider>
      <PageWithLayout
        pageId="plan"
        defaultTitle="Planification"
        defaultIcon="calendar"
        defaultComponent="plan"
        showSplitControls={true}
      />
    </LayoutProvider>
  );
});

PlanView.displayName = 'PlanView';

export default PlanView;