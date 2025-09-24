import React from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

const WorkspaceDebug = () => {
  const { currentWorkspace, workspaces } = useWorkspace();

  if (!currentWorkspace) return null;

  // Ne s'afficher qu'en mode développement
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-gray-900 text-white rounded-lg shadow-xl z-50 text-xs font-mono max-w-xs">
      <div className="font-bold mb-1">🔍 Workspace Debug</div>
      <div>Current: {currentWorkspace.name}</div>
      <div>ID: {currentWorkspace.id?.slice(0, 12)}...</div>
      <div className="mt-1 text-gray-400">
        Total: {workspaces.length} workspace(s)
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer hover:text-blue-300">Data Keys</summary>
        <div className="mt-1 pl-2 text-[10px]">
          {Object.entries(currentWorkspace.dataKeys || {}).map(([key, value]) => (
            <div key={key}>
              {key}: {value.slice(0, 20)}...
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default WorkspaceDebug;