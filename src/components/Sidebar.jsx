import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { radars } = useContext(AppContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedRadars, setExpandedRadars] = useState({});
  
  // Vérifier si on doit inverser les styles
  const altStyle = new URLSearchParams(window.location.search).get('alt') === 'true';

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '□', path: '/' },
    { id: 'progression', label: 'Progression', icon: '→', path: '/improvements', accent: true },
    { id: 'todo', label: 'To do', icon: '✓', path: '/plan' },
    { id: 'calendar', label: 'Calendrier', icon: '○', path: '/calendar' },
    { id: 'notes', label: 'Notes', icon: '≡', path: '/notes' }
  ];

  const toggleRadar = (radarId) => {
    setExpandedRadars(prev => ({
      ...prev,
      [radarId]: !prev[radarId]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isRadarActive = (radarId) => {
    return location.pathname.includes(`/radar/${radarId}`);
  };

  return (
    <aside className={`${isCollapsed ? 'w-[50px]' : 'w-[260px]'} h-screen ${altStyle ? 'bg-white/70 backdrop-blur-sm ring-1 ring-gray-200 shadow-[12px_0_32px_rgba(0,0,0,0.06)]' : 'bg-gradient-to-b from-[#E9E9E9] via-[#F4F4F4] to-[#F9F9F9]'} flex flex-col transition-all duration-200`}>
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200/70">
        {!isCollapsed && (
          <h2 className="text-[#1E1F22] font-light tracking-wide">Gestion Desktop</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-[#EFF2F6] rounded-md transition-colors"
        >
          <svg className="w-4 h-4 text-[#6B7280]" viewBox="0 0 16 16" fill="currentColor">
            <path d={isCollapsed ? 
              "M6.5 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z" :
              "M2.5 2.5a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11z"
            } />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {/* Menu principal */}
        <div className="px-2 mb-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                isActive(item.path) 
                  ? 'text-blue-500 bg-white/80 shadow-sm ring-1 ring-gray-200 font-medium focus:ring-2 focus:ring-blue-200' 
                  : 'text-gray-600 hover:bg-white/60'
              }`}
            >
              <span className={`text-base ${isActive(item.path) ? 'text-blue-500' : 'text-gray-400'}`}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Séparateur */}
        <div className="mx-4 border-t border-gray-200/70 mb-4"></div>

        {/* Radars */}
        <div className="px-2">
          <div className="flex items-center justify-between px-2 mb-2">
            {!isCollapsed && (
              <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Radars</span>
            )}
          </div>
          
          {radars.map(radar => (
            <div key={radar.id}>
              <div
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-all duration-150 ${
                  isRadarActive(radar.id)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-[#6B7280] hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <button
                  onClick={() => toggleRadar(radar.id)}
                  className="p-0.5 hover:bg-[#EFF2F6] rounded"
                >
                  <svg 
                    className={`w-3 h-3 transition-transform ${expandedRadars[radar.id] ? 'rotate-90' : ''}`} 
                    viewBox="0 0 16 16" 
                    fill="currentColor"
                  >
                    <path d="M5.5 4a.5.5 0 0 0 0 .707L8.293 7.5 5.5 10.293a.5.5 0 0 0 .707.707l3.147-3.146a.5.5 0 0 0 0-.708L6.207 4a.5.5 0 0 0-.707 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate(`/radar/${radar.id}`)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <span className="text-base">{radar.icon}</span>
                  {!isCollapsed && <span>{radar.name}</span>}
                </button>
              </div>
              
              {/* Matières du radar */}
              {!isCollapsed && expandedRadars[radar.id] && radar.subjects && (
                <div className="ml-6 mt-1">
                  {radar.subjects.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => navigate(`/radar/${radar.id}/subject/${subject.id}`)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-all duration-150 ${
                        location.pathname === `/radar/${radar.id}/subject/${subject.id}`
                          ? 'bg-[#F9FAFB] text-[#1E1F22]'
                          : 'text-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-[#6B7280]'
                      }`}
                    >
                      <span className="w-1 h-1 bg-[#9CA3AF] rounded-full"></span>
                      <span>{subject.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200/70">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-white/80 rounded-md text-sm ring-1 ring-gray-200/60 shadow-sm transition-all">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
          </svg>
          {!isCollapsed && <span>Paramètres</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
