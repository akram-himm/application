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
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      path: '/',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 1H1v14h5V1zm9 0h-5v5h5V1zm0 9h-5v5h5v-5z" opacity="0.9"/>
        </svg>
      )
    },
    { 
      id: 'history', 
      label: 'Historique', 
      path: '/history',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5ZM4 8.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4Zm3.5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5Z" />
        </svg>
      )
    },
    { 
      id: 'progression', 
      label: 'Progression', 
      path: '/improvements', 
      accent: true,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z" />
        </svg>
      )
    },
    { 
      id: 'todo', 
      label: 'To do', 
      path: '/plan',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
          <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z" />
        </svg>
      )
    },
    { 
      id: 'calendar', 
      label: 'Calendrier', 
      path: '/calendar',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
        </svg>
      )
    },
    {
      id: 'notes',
      label: 'Notes',
      path: '/notes',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z" />
          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z" />
        </svg>
      )
    },
    {
      id: 'notion-todo',
      label: 'Todo Notion',
      path: '/notion-todo',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
        </svg>
      )
    },
    {
      id: 'notion-calendar',
      label: 'Calendrier Notion',
      path: '/notion-calendar',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
          <path d="M8 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM4 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
        </svg>
      )
    }
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
              <span className={isActive(item.path) ? 'text-blue-500' : 'text-gray-400'}>{item.icon}</span>
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
