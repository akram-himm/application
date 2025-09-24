import React, { memo } from 'react';
import PageWithLayout from '../components/layout/PageWithLayout';
import { LayoutProvider } from '../contexts/LayoutContext';

const Improvements = memo(() => {
  return (
    <LayoutProvider>
      <PageWithLayout
        pageId="improvements"
        defaultTitle="Améliorations"
        defaultIcon="target"
        defaultComponent="improvements"
        showSplitControls={true}
      />
    </LayoutProvider>
  );
});

Improvements.displayName = 'Improvements';

export default Improvements;