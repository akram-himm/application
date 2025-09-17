import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AkramContext } from '../../contexts/AkramContext';

const RadarChart = ({ subjects, hoveredSubject, onHoverSubject, onSelectSubject, onContextMenu }) => {
  const navigate = useNavigate();
  const { radarId } = useParams();
  const canvasRef = useRef(null);
  const tooltipRef = useRef(null);
  const { penalties } = useContext(AkramContext);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [stackedSubjectsMenu, setStackedSubjectsMenu] = useState(null);
  const animationRef = useRef(null);

  // Configuration du radar
  const size = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7, 600);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

  // Minimum 6 axes, mais peut augmenter selon le nombre de matières
  const AXES_COUNT = Math.max(6, subjects.length);

  const animateRadar = useCallback(() => {
    setAnimationProgress(prev => {
      const newProgress = Math.min(prev + 0.05, 1);
      if (newProgress >= 1) {
        cancelAnimationFrame(animationRef.current);
      }
      return newProgress;
    });
    
    if (animationProgress < 1) {
      animationRef.current = requestAnimationFrame(animateRadar);
    }
  }, [animationProgress]);

  useEffect(() => {
    setAnimationProgress(0);
    animationRef.current = requestAnimationFrame(animateRadar);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [subjects]);

  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    
    const angleStep = (Math.PI * 2) / AXES_COUNT;

    // Grilles circulaires - style simple et cohérent
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)'; // gray-400 avec opacité
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.globalAlpha = animationProgress;
      
      for (let j = 0; j < AXES_COUNT; j++) {
        const angle = j * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * (i / 5) * animationProgress;
        const y = centerY + Math.sin(angle) * radius * (i / 5) * animationProgress;
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.stroke();
    }
    
    // Axes radiaux - lignes discrètes
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)'; // gray-400 avec opacité
    ctx.lineWidth = 1;
    
    for (let i = 0; i < AXES_COUNT; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.globalAlpha = animationProgress;
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius * animationProgress,
        centerY + Math.sin(angle) * radius * animationProgress
      );
      ctx.stroke();
    }
    
    // Forme du radar (seulement pour les matières existantes)
    if (subjects.length > 0) {
      // Forme remplie - couleur simple
      ctx.beginPath();
      ctx.globalAlpha = 0.25 * animationProgress; // Opacité augmentée
      ctx.fillStyle = 'rgb(107, 114, 128)'; // gray-500 pour cohérence
      
      subjects.forEach((subject, index) => {
        const angle = index * angleStep - Math.PI / 2;
        let value = subject.value;
        
        const penalty = penalties.find(p => p.subjectId === subject.id);
        if (penalty) {
          value = Math.max(0, value - penalty.penaltyValue);
        }
        
        const x = centerX + Math.cos(angle) * radius * (value / 100) * animationProgress;
        const y = centerY + Math.sin(angle) * radius * (value / 100) * animationProgress;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.closePath();
      ctx.fill();
      
      // Bordure de la forme - ligne simple
      ctx.beginPath();
      ctx.globalAlpha = 1 * animationProgress;
      ctx.strokeStyle = 'rgb(55, 65, 81)'; // gray-700 pour un look sérieux
      ctx.lineWidth = 2;
      
      subjects.forEach((subject, index) => {
        const angle = index * angleStep - Math.PI / 2;
        let value = subject.value;
        
        const penalty = penalties.find(p => p.subjectId === subject.id);
        if (penalty) {
          value = Math.max(0, value - penalty.penaltyValue);
        }
        
        const x = centerX + Math.cos(angle) * radius * (value / 100) * animationProgress;
        const y = centerY + Math.sin(angle) * radius * (value / 100) * animationProgress;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.closePath();
      ctx.stroke();
      
      // Points sur les axes
      subjects.forEach((subject, index) => {
        const angle = index * angleStep - Math.PI / 2;
        let value = subject.value;
        
        const penalty = penalties.find(p => p.subjectId === subject.id);
        let hasPenalty = false;
        if (penalty) {
          value = Math.max(0, value - penalty.penaltyValue);
          hasPenalty = true;
        }
        
        const x = centerX + Math.cos(angle) * radius * (value / 100) * animationProgress;
        const y = centerY + Math.sin(angle) * radius * (value / 100) * animationProgress;
        
        // Point extérieur blanc
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white';
        ctx.arc(x, y, index === hoveredSubject ? 10 : 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Point intérieur coloré
        ctx.beginPath();
        if (hasPenalty) {
          ctx.fillStyle = 'rgb(251, 191, 36)'; // Orange pour pénalités
        } else if (index === hoveredSubject) {
          ctx.fillStyle = 'rgb(55, 65, 81)'; // gray-700 au survol
        } else {
          ctx.fillStyle = 'rgb(107, 114, 128)'; // gray-500 par défaut
        }
        ctx.arc(x, y, index === hoveredSubject ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordure pour les pénalités
        if (hasPenalty) {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
      
      // Indicateur spécial pour les matières empilées au centre
      const stackedSubjects = getStackedSubjectsAtCenter();
      if (stackedSubjects && stackedSubjects.length > 0) {
        // Cercle plus grand au centre pour indiquer l'empilement
        ctx.beginPath();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = 'rgb(251, 191, 36)';
        ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
        ctx.fill();
        
        // Nombre de matières empilées
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stackedSubjects.length.toString(), centerX, centerY);
      }
    }
    
    // Labels pour tous les axes
    ctx.globalAlpha = 1;
    ctx.font = '14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < AXES_COUNT; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = radius + 30;
      const x = centerX + Math.cos(angle) * labelRadius * animationProgress;
      const y = centerY + Math.sin(angle) * labelRadius * animationProgress;
      
      if (i < subjects.length) {
        const subject = subjects[i];
        const penalty = penalties.find(p => p.subjectId === subject.id);

        // Tous les labels en gris pour cohérence (avec indication de pause)
        if (subject.isPaused) {
          ctx.fillStyle = 'rgb(156, 163, 175)'; // gray-400 pour les pausés
        } else if (i === hoveredSubject) {
          ctx.fillStyle = 'rgb(55, 65, 81)'; // gray-700 plus foncé au survol
        } else {
          ctx.fillStyle = 'rgb(107, 114, 128)'; // gray-500 par défaut
        }
        
        // Tronquer le texte s'il est trop long
        let text = subject.name;
        if (subject.isPaused) {
          text = `⏸ ${text}`; // Ajouter l'icône pause
        }
        if (text.length > 15) {
          text = text.substring(0, 13) + '...';
        }
        ctx.fillText(text, x, y);
      } else {
        // Axes vides quand moins de 6 matières
        ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'; // gray-400 à 50%
        ctx.fillText('—', x, y);
      }
    }
    
  }, [size, centerX, centerY, radius, subjects, hoveredSubject, penalties, animationProgress, AXES_COUNT]);

  useEffect(() => {
    drawRadar();
  }, [drawRadar]);

  // Détecter les matières empilées au centre
  const getStackedSubjectsAtCenter = () => {
    const stacked = [];
    subjects.forEach(subject => {
      let value = subject.value;
      const penalty = penalties.find(p => p.subjectId === subject.id);
      if (penalty) {
        value = Math.max(0, value - penalty.penaltyValue);
      }
      if (value === 0) {
        stacked.push(subject);
      }
    });
    return stacked.length > 1 ? stacked : null;
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Vérifier d'abord si on clique au centre (matières empilées)
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    if (distanceFromCenter <= 14) {
      const stackedSubjects = getStackedSubjectsAtCenter();
      if (stackedSubjects && stackedSubjects.length > 0) {
        e.stopPropagation();
        setStackedSubjectsMenu({
          x: e.clientX,
          y: e.clientY,
          subjects: stackedSubjects,
          type: 'select'
        });
        return;
      }
    }
    
    // Si le menu est ouvert et qu'on clique ailleurs sur le canvas, le fermer
    if (stackedSubjectsMenu) {
      setStackedSubjectsMenu(null);
      return;
    }
    
    // Sinon, vérifier les points sur les axes
    const angleStep = (Math.PI * 2) / AXES_COUNT;
    
    subjects.forEach((subject, index) => {
      const angle = index * angleStep - Math.PI / 2;
      let value = subject.value;
      
      const penalty = penalties.find(p => p.subjectId === subject.id);
      if (penalty) {
        value = Math.max(0, value - penalty.penaltyValue);
      }
      
      const pointX = centerX + Math.cos(angle) * radius * (value / 100);
      const pointY = centerY + Math.sin(angle) * radius * (value / 100);
      
      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      
      if (distance <= 12) {
        onSelectSubject(index);
        return;
      }
    });
  };

  const handleCanvasContextMenu = (e) => {
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Vérifier si on fait un clic droit au centre
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    if (distanceFromCenter <= 14) {
      const stackedSubjects = getStackedSubjectsAtCenter();
      if (stackedSubjects && stackedSubjects.length > 0) {
        setStackedSubjectsMenu({
          x: e.clientX,
          y: e.clientY,
          subjects: stackedSubjects,
          type: 'context'
        });
        return;
      }
    }
    
    // Sinon, vérifier les points sur les axes
    const angleStep = (Math.PI * 2) / AXES_COUNT;
    
    subjects.forEach((subject, index) => {
      const angle = index * angleStep - Math.PI / 2;
      let value = subject.value;
      
      const penalty = penalties.find(p => p.subjectId === subject.id);
      if (penalty) {
        value = Math.max(0, value - penalty.penaltyValue);
      }
      
      const pointX = centerX + Math.cos(angle) * radius * (value / 100);
      const pointY = centerY + Math.sin(angle) * radius * (value / 100);
      
      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      
      if (distance <= 12) {
        onContextMenu(e, index);
        return;
      }
    });
  };

  const handleCanvasMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const angleStep = (Math.PI * 2) / AXES_COUNT;
    let hovered = null;
    
    // Vérifier d'abord le centre
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const stackedSubjects = getStackedSubjectsAtCenter();
    
    if (distanceFromCenter <= 14 && stackedSubjects && stackedSubjects.length > 0) {
      canvasRef.current.style.cursor = 'pointer';
      tooltipRef.current.innerHTML = `<div class="text-sm font-semibold">${stackedSubjects.length} matières empilées</div><div class="text-xs opacity-70">Cliquez pour voir la liste</div>`;
      tooltipRef.current.style.display = 'block';
      tooltipRef.current.style.left = e.clientX + 10 + 'px';
      tooltipRef.current.style.top = e.clientY - 10 + 'px';
      return;
    }
    
    // Vérifier les points sur les axes
    subjects.forEach((subject, index) => {
      const angle = index * angleStep - Math.PI / 2;
      let value = subject.value;
      
      const penalty = penalties.find(p => p.subjectId === subject.id);
      if (penalty) {
        value = Math.max(0, value - penalty.penaltyValue);
      }
      
      const pointX = centerX + Math.cos(angle) * radius * (value / 100);
      const pointY = centerY + Math.sin(angle) * radius * (value / 100);
      
      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      
      if (distance <= 12) {
        hovered = index;
        return;
      }
    });
    
    onHoverSubject(hovered);
    canvasRef.current.style.cursor = hovered !== null ? 'pointer' : 'default';
    
    // Tooltip pour les points normaux
    if (hovered !== null && subjects[hovered]) {
      const subject = subjects[hovered];
      const penalty = penalties.find(p => p.subjectId === subject.id);
      let displayValue = subject.value;
      
      if (penalty) {
        displayValue = Math.max(0, displayValue - penalty.penaltyValue);
      }
      
      tooltipRef.current.innerHTML = `
        <div class="font-semibold">${subject.name}</div>
        <div class="text-sm opacity-70">Progression: ${displayValue}%</div>
        ${penalty ? `<div class="text-sm text-yellow-400">Pénalité: -${penalty.penaltyValue}%</div>` : ''}
      `;
      
      tooltipRef.current.style.display = 'block';
      tooltipRef.current.style.left = e.clientX + 10 + 'px';
      tooltipRef.current.style.top = e.clientY - 10 + 'px';
    } else if (distanceFromCenter > 14) {
      tooltipRef.current.style.display = 'none';
    }
  };

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Ne pas fermer si on clique sur le canvas (pour permettre l'ouverture du menu)
      if (stackedSubjectsMenu && 
          !e.target.closest('.stacked-subjects-menu') && 
          !e.target.closest('canvas')) {
        setStackedSubjectsMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [stackedSubjectsMenu]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="max-w-full h-auto mx-auto"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => {
          onHoverSubject(null);
          tooltipRef.current.style.display = 'none';
        }}
        onContextMenu={handleCanvasContextMenu}
      />
      
      <div
        ref={tooltipRef}
        className="fixed bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-lg px-3 py-2 text-gray-200 text-sm z-[100] pointer-events-none shadow-xl"
        style={{ display: 'none' }}
      />
      
      {/* Menu pour les matières empilées */}
      {stackedSubjectsMenu && (
        <div
          className="stacked-subjects-menu fixed bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-1 z-[300] animate-scaleIn"
          style={{ left: stackedSubjectsMenu.x, top: stackedSubjectsMenu.y }}
        >
          <div className="text-xs text-gray-400 px-3 py-1.5 border-b border-gray-700/50">
            Matières au centre
          </div>
          {stackedSubjectsMenu.subjects.map((subject, index) => (
            <button
              key={subject.id}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-200 rounded-lg transition-all duration-150 hover:bg-gray-700/50"
              onClick={(e) => {
                e.stopPropagation();
                const subjectIndex = subjects.indexOf(subject);
                if (stackedSubjectsMenu.type === 'select') {
                  // Navigation directe
                  navigate(`/radar/${radarId}/subject/${subject.id}`);
                } else {
                  // Menu contextuel
                  onContextMenu({ 
                    clientX: stackedSubjectsMenu.x, 
                    clientY: stackedSubjectsMenu.y,
                    preventDefault: () => {} // Ajouter une fonction preventDefault factice
                  }, subjectIndex);
                }
                setStackedSubjectsMenu(null);
              }}
            >
              {subject.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Message si pas de matières */}
      {subjects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">Aucune matière créée</p>
            <p className="text-gray-400 text-sm">Cliquez sur "Ajouter une matière" pour commencer</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadarChart;