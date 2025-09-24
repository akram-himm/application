import React, { memo } from 'react';
import PageWithLayout from '../components/layout/PageWithLayout';
import { LayoutProvider } from '../contexts/LayoutContext';

const HistoryView = memo(() => {
  return (
    <LayoutProvider>
      <PageWithLayout
        pageId="history"
        defaultTitle="Historique"
        defaultIcon="history"
        defaultComponent="history"
        showSplitControls={true}
      />
    </LayoutProvider>
  );
});

HistoryView.displayName = 'HistoryView';

export default HistoryView;