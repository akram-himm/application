import React, { memo } from 'react';
import PageWithLayout from '../components/layout/PageWithLayout';
import { LayoutProvider } from '../contexts/LayoutContext';

const NotesView = memo(() => {
  return (
    <LayoutProvider>
      <PageWithLayout
        pageId="notes"
        defaultTitle="Notes"
        defaultIcon="note"
        defaultComponent="notes"
        showSplitControls={true}
      />
    </LayoutProvider>
  );
});

NotesView.displayName = 'NotesView';

export default NotesView;