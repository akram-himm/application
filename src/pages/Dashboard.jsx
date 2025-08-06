import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';

const Dashboard = () => {
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

  const stats = calculateGlobalStats();
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  });

  const completedTasks = tasks.filter(task => task.completed).length;
  const taskCompletionRate = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[rgb(25,25,25)]">
      <div className="max-w-[1200px] mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[40px] font-bold text-white/81 mb-2">Tableau de bord</h1>
          <p className="text-white/46 text-base">Vue d'ensemble de votre progression</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Progression globale */}
          <div className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white/81">Progression globale</h3>
              <span className="text-3xl">📊</span>
            </div>
            <div className="text-4xl font-bold text-[rgb(35,131,226)] mb-2">{stats.total}%</div>
            <p className="text-sm text-white/46">Moyenne de tous les radars</p>
          </div>

          {/* Tâches aujourd'hui */}
          <div className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white/81">Tâches du jour</h3>
              <span className="text-3xl">📋</span>
            </div>
            <div className="text-4xl font-bold text-[rgb(251,191,36)] mb-2">{todayTasks.length}</div>
            <p className="text-sm text-white/46">À accomplir aujourd'hui</p>
          </div>

          {/* Taux de complétion */}
          <div className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white/81">Taux de complétion</h3>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-4xl font-bold text-[rgb(34,197,94)] mb-2">{taskCompletionRate}%</div>
            <p className="text-sm text-white/46">{completedTasks} sur {tasks.length} tâches</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diagramme circulaire */}
          <div className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white/81 mb-6">Progression par radar</h3>
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
          <div className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white/81 mb-6">Détail par radar</h3>
            <div className="space-y-4">
              {stats.byRadar.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-white/46">Aucun radar créé</p>
                  <button
                    onClick={() => navigate('/improvements')}
                    className="mt-4 px-4 py-2 bg-[rgb(35,131,226)] text-white rounded-lg hover:bg-[rgb(28,104,181)] transition-colors"
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
                        <span className="text-white/81 font-medium">{radar.name}</span>
                        <span className="text-white/46 text-sm">{radar.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/[0.055] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${radar.progress}%`,
                            backgroundColor: radar.color 
                          }}
                        />
                      </div>
                      <span className="text-xs text-white/46 mt-1">{radar.subjects} matières</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          <button
            onClick={() => navigate('/improvements')}
            className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-6 hover:bg-[rgb(37,37,37)] transition-colors text-left"
          >
            <span className="text-2xl mb-3 block">🎯</span>
            <h4 className="text-white/81 font-medium mb-1">Gérer les radars</h4>
            <p className="text-sm text-white/46">Créer et organiser vos domaines</p>
          </button>

          <button
            onClick={() => navigate('/plan')}
            className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-6 hover:bg-[rgb(37,37,37)] transition-colors text-left"
          >
            <span className="text-2xl mb-3 block">📝</span>
            <h4 className="text-white/81 font-medium mb-1">Planifier</h4>
            <p className="text-sm text-white/46">Organiser vos tâches</p>
          </button>

          <button
            onClick={() => navigate('/calendar')}
            className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-6 hover:bg-[rgb(37,37,37)] transition-colors text-left"
          >
            <span className="text-2xl mb-3 block">📅</span>
            <h4 className="text-white/81 font-medium mb-1">Calendrier</h4>
            <p className="text-sm text-white/46">Vue mensuelle (bientôt)</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;