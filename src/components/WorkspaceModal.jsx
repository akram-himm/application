import React, { useState, useEffect } from 'react';
import { WORKSPACE_ICONS, WORKSPACE_COLORS } from '../services/workspaceService';

const WorkspaceModal = ({ isOpen, onClose, onSubmit, workspace = null }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏢');
  const [color, setColor] = useState('blue');
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setIcon(workspace.icon || '🏢');
      setColor(workspace.color || 'blue');
    } else {
      setName('');
      setIcon('🏢');
      setColor('blue');
    }
  }, [workspace]);

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        icon,
        color
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-[1000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg p-6 w-full max-w-[500px] shadow-lg"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            {workspace ? 'Modifier le workspace' : 'Créer un nouveau workspace'}
          </h2>

          {/* Form */}
          <div className="space-y-4">
            {/* Icon and Name */}
            <div className="flex gap-3">
              {/* Icon Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-[50px] h-[50px] bg-gray-50 rounded-lg flex items-center justify-center text-2xl hover:bg-gray-100 transition-all duration-20 border border-gray-200"
                  type="button"
                >
                  {icon}
                </button>

                {/* Icon Picker Dropdown */}
                {showIconPicker && (
                  <div className="absolute top-[54px] left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-8 gap-1 w-[320px] z-[1001]">
                    {WORKSPACE_ICONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setIcon(emoji);
                          setShowIconPicker(false);
                        }}
                        className="w-[35px] h-[35px] flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-all duration-20"
                        type="button"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Name Input */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Nom du workspace"
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all duration-20 text-sm"
                autoFocus
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Couleur d'accent</label>
              <div className="flex gap-2">
                {WORKSPACE_COLORS.map(({ name, value }) => (
                  <button
                    key={name}
                    onClick={() => setColor(name)}
                    className={`w-8 h-8 rounded-full transition-all duration-20 ${
                      color === name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: value }}
                    type="button"
                    aria-label={name}
                  />
                ))}
              </div>
            </div>

            {/* Settings (for edit mode) */}
            {workspace && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Créé le : {new Date(workspace.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p>Dernier accès : {new Date(workspace.lastAccessed).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-all duration-20 text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {workspace ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkspaceModal;