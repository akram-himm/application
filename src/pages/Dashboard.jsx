import React, { useContext, useEffect, useRef, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { uniformStyles } from '../styles/uniformStyles';

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const { radars, tasks } = useContext(AppContext);
  const canvasRef = useRef(null);

  // Calculer les statistiques globales
  const calculateGlobalStats = () => {
    if (radars.length === 0) return { total: 0, byRadar: [] };

    const byRadar = radars.map(radar => {
      const subjects = radar.subjects || [];
      const progress = subjects.length > 0
        ? Math.round(subjects.reduce((sum, s) => sum + s.value, 0) / subjects.length)
        : 0;
      return {
        name: radar.name,
        icon: radar.icon,
        progress,
        subjects: subjects.length,
        color: getRadarColor(radar.id)
      };
    });

    const total = Math.round(
      byRadar.reduce((sum, r) => sum + r.progress, 0) / byRadar.length
    );

    return { total, byRadar };
  };

  const getRadarColor = (id) => {
    const colors = [
      'rgb(35, 131, 226)',  // Bleu
      'rgb(34, 197, 94)',   // Vert
      'rgb(251, 191, 36)',  // Jaune
      'rgb(239, 68, 68)',   // Rouge
      'rgb(168, 85, 247)',  // Violet
      'rgb(236, 72, 153)',  // Rose
    ];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Dessiner le diagramme circulaire
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { byRadar } = calculateGlobalStats();
    
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    // Clear canvas
    ctx.clearRect(0, 0, 300, 300);

    if (byRadar.length === 0) {
      // Cercle vide
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 20;
      ctx.stroke();
      return;
    }

    // Dessiner les segments
    let currentAngle = -Math.PI / 2; // Commencer en haut

    byRadar.forEach(radar => {
      const sliceAngle = (radar.progress / 100) * (2 * Math.PI / byRadar.length);
      
      // Segment rempli
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, radius - 20, currentAngle + sliceAngle, currentAngle, true);
      ctx.fillStyle = radar.color;
      ctx.fill();

      // Segment vide
      const emptyAngle = ((100 - radar.progress) / 100) * (2 * Math.PI / byRadar.length);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle + sliceAngle, currentAngle + sliceAngle + emptyAngle);
      ctx.arc(centerX, centerY, radius - 20, currentAngle + sliceAngle + emptyAngle, currentAngle + sliceAngle, true);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();

      currentAngle += sliceAngle + emptyAngle;
    });
  }, [radars]);

  const stats = useMemo(() => calculateGlobalStats(), [radars]);
  
  const todayTasks = useMemo(() => 
    tasks.filter(task => {
      const taskDate = new Date(task.date);
      const today = new Date();
      return taskDate.toDateString() === today.toDateString();
    }), [tasks]
  );

  const { completedTasks, taskCompletionRate } = useMemo(() => {
    const completed = tasks.filter(task => task.status === 'Terminé').length;
    const rate = tasks.length > 0 
      ? Math.round((completed / tasks.length) * 100)
      : 0;
    return { completedTasks: completed, taskCompletionRate: rate };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E9E9E9] via-[#F4F4F4] to-[#F9F9F9]">
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Titre de la page */}
        <div className={uniformStyles.pageHeader.container}>
          <h1 className={uniformStyles.text.pageTitle}>Tableau de bord</h1>
          <p className={uniformStyles.text.pageSubtitle}>Vue d'ensemble de votre progression</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Progression globale */}
          <div className={uniformStyles.card.default + ' ' + uniformStyles.card.padding}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1E1F22]">Progression globale</h3>
              <span className="text-2xl text-blue-500">📊</span>
            </div>
            <div className="text-4xl font-bold text-blue-500 mb-2">{stats.total}%</div>
            <p className="text-sm text-gray-600">Moyenne de tous les radars</p>
          </div>

          {/* Tâches aujourd'hui */}
          <div className={uniformStyles.card.default + ' ' + uniformStyles.card.padding}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1E1F22]">Tâches du jour</h3>
              <span className="text-2xl text-amber-500">📋</span>
            </div>
            <div className="text-4xl font-bold text-amber-500 mb-2">{todayTasks.length}</div>
            <p className="text-sm text-gray-600">À accomplir aujourd'hui</p>
          </div>

          {/* Taux de complétion */}
          <div className={uniformStyles.card.default + ' ' + uniformStyles.card.padding}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1E1F22]">Taux de complétion</h3>
              <span className="text-2xl text-green-500">✅</span>
            </div>
            <div className="text-4xl font-bold text-green-500 mb-2">{taskCompletionRate}%</div>
            <p className="text-sm text-gray-600">{completedTasks} sur {tasks.length} tâches</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diagramme circulaire */}
          <div className="rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] p-6">
            <h3 className="text-lg font-semibold text-[#1E1F22] mb-6">Progression par radar</h3>
            <div className="flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={300}
                className="max-w-full"
              />
            </div>
          </div>

          {/* Liste des radars */}
          <div className="rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] p-6">
            <h3 className="text-lg font-semibold text-[#1E1F22] mb-6">Détail par radar</h3>
            <div className="space-y-4">
              {stats.byRadar.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600">Aucun radar créé</p>
                  <button
                    onClick={() => navigate('/improvements')}
                    className={"mt-4 " + uniformStyles.button.primary}
                  >
                    Créer un radar
                  </button>
                </div>
              ) : (
                stats.byRadar.map((radar, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${radar.color}20` }}
                    >
                      {radar.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#1E1F22] font-medium">{radar.name}</span>
                        <span className="text-gray-600 text-sm">{radar.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${radar.progress}%`,
                            backgroundColor: radar.color 
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{radar.subjects} matières</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/improvements')}
            className={uniformStyles.card.hover + ' ' + uniformStyles.card.padding + ' cursor-pointer text-left'}
          >
            <span className="text-2xl mb-3 block">🎯</span>
            <h4 className="text-[#1E1F22] font-medium mb-1">Gérer les radars</h4>
            <p className="text-sm text-gray-600">Créer et organiser vos domaines</p>
          </div>

          <div
            onClick={() => navigate('/plan')}
            className={uniformStyles.card.hover + ' ' + uniformStyles.card.padding + ' cursor-pointer text-left'}
          >
            <span className="text-2xl mb-3 block">📝</span>
            <h4 className="text-[#1E1F22] font-medium mb-1">Planifier</h4>
            <p className="text-sm text-gray-600">Organiser vos tâches</p>
          </div>

          <div
            onClick={() => navigate('/calendar')}
            className={uniformStyles.card.hover + ' ' + uniformStyles.card.padding + ' cursor-pointer text-left'}
          >
            <span className="text-2xl mb-3 block">📅</span>
            <h4 className="text-[#1E1F22] font-medium mb-1">Calendrier</h4>
            <p className="text-sm text-gray-600">Vue mensuelle (bientôt)</p>
          </div>
        </div>
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;