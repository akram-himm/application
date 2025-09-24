import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import ReactDOM from 'react-dom';
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
  const [tooltipData, setTooltipData] = useState(null);
  const animationRef = useRef(null);

  // Configuration du radar
  const size = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7, 600);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

  // Utiliser un nombre d'axes qui s'adapte mais reste stable
  const MIN_AXES = 6; // Minimum d'axes pour garder une belle forme
  const AXES_COUNT = Math.max(MIN_AXES, subjects.length); // S'adapter au nombre de sujets mais avec un minimum
  const angleStep = (Math.PI * 2) / AXES_COUNT; // Définir angleStep globalement

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
    // Réinitialiser l'animation chaque fois que les sujets changent
    setAnimationProgress(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animateRadar);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [subjects.length]); // Déclencher sur le changement du nombre de sujets

  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

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
        // Utiliser la grille d'axes pour positionner les sujets
        // Si moins de sujets que d'axes, répartir uniformément sur les axes disponibles
        const angleIndex = subjects.length < AXES_COUNT
          ? Math.floor((index / subjects.length) * AXES_COUNT)
          : index;
        const angle = (angleIndex * angleStep) - Math.PI / 2;
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
        // Utiliser la grille d'axes pour positionner les sujets
        // Si moins de sujets que d'axes, répartir uniformément sur les axes disponibles
        const angleIndex = subjects.length < AXES_COUNT
          ? Math.floor((index / subjects.length) * AXES_COUNT)
          : index;
        const angle = (angleIndex * angleStep) - Math.PI / 2;
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
        // Utiliser la grille d'axes pour positionner les sujets
        // Si moins de sujets que d'axes, répartir uniformément sur les axes disponibles
        const angleIndex = subjects.length < AXES_COUNT
          ? Math.floor((index / subjects.length) * AXES_COUNT)
          : index;
        const angle = (angleIndex * angleStep) - Math.PI / 2;
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
    
    // Labels pour les sujets uniquement
    ctx.globalAlpha = 1;
    ctx.font = '14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Afficher les labels seulement pour les sujets existants
    subjects.forEach((subject, index) => {
      // Utiliser la même logique de positionnement que pour les points
      const angleIndex = subjects.length < AXES_COUNT
        ? Math.floor((index / subjects.length) * AXES_COUNT)
        : index;
      const angle = (angleIndex * angleStep) - Math.PI / 2;
      const labelRadius = radius + 30;
      const x = centerX + Math.cos(angle) * labelRadius * animationProgress;
      const y = centerY + Math.sin(angle) * labelRadius * animationProgress;

      const penalty = penalties.find(p => p.subjectId === subject.id);

      // Tous les labels en gris pour cohérence (avec indication de pause)
      if (subject.isPaused) {
        ctx.fillStyle = 'rgb(156, 163, 175)'; // gray-400 pour les pausés
      } else if (index === hoveredSubject) {
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
    });

    // Points de référence discrets sur les axes vides (optionnel, plus léger)
    if (subjects.length < AXES_COUNT) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.2)'; // gray-400 très transparent
      for (let i = 0; i < AXES_COUNT; i++) {
        // Vérifier si cet axe est utilisé par un sujet
        const isUsed = subjects.some((_, subjectIndex) => {
          const angleIndex = Math.floor((subjectIndex / subjects.length) * AXES_COUNT);
          return angleIndex === i;
        });

        if (!isUsed) {
          const angle = i * angleStep - Math.PI / 2;
          const x = centerX + Math.cos(angle) * (radius + 10) * animationProgress;
          const y = centerY + Math.sin(angle) * (radius + 10) * animationProgress;

          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
  }, [size, centerX, centerY, radius, subjects, hoveredSubject, penalties, animationProgress, AXES_COUNT, angleStep]);

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
      const angleIndex = subjects.length < AXES_COUNT
        ? Math.floor((index / subjects.length) * AXES_COUNT)
        : index;
      const angle = (angleIndex * angleStep) - Math.PI / 2;
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
      const angleIndex = subjects.length < AXES_COUNT
        ? Math.floor((index / subjects.length) * AXES_COUNT)
        : index;
      const angle = (angleIndex * angleStep) - Math.PI / 2;
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
      setTooltipData({
        x: e.clientX + 10,
        y: e.clientY - 10,
        content: (
          <>
            <div className="text-sm font-semibold">{stackedSubjects.length} matières empilées</div>
            <div className="text-xs opacity-70">Cliquez pour voir la liste</div>
          </>
        )
      });
      return;
    }

    // Vérifier les points sur les axes
    subjects.forEach((subject, index) => {
      const angleIndex = subjects.length < AXES_COUNT
        ? Math.floor((index / subjects.length) * AXES_COUNT)
        : index;
      const angle = (angleIndex * angleStep) - Math.PI / 2;
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

      // Calculer la position pour éviter le débordement
      const tooltipX = e.clientX + 10;
      const tooltipY = e.clientY - 10;
      const adjustedX = tooltipX + 200 > window.innerWidth ? e.clientX - 210 : tooltipX;
      const adjustedY = tooltipY + 100 > window.innerHeight ? e.clientY - 100 : tooltipY;

      setTooltipData({
        x: adjustedX,
        y: adjustedY,
        content: (
          <>
            <div className="font-semibold">{subject.name}</div>
            <div className="text-sm opacity-70">Progression: {displayValue}%</div>
            {penalty && (
              <div className="text-sm text-yellow-400">Pénalité: -{penalty.penaltyValue}%</div>
            )}
          </>
        )
      });
    } else if (distanceFromCenter > 14) {
      setTooltipData(null);
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
          setTooltipData(null);
        }}
        onContextMenu={handleCanvasContextMenu}
      />
      
      {/* Tooltip avec Portal */}
      {tooltipData && ReactDOM.createPortal(
        <div
          className="fixed bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-lg px-3 py-2 text-gray-200 text-sm pointer-events-none shadow-xl"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y}px`,
            zIndex: 99999
          }}
        >
          {tooltipData.content}
        </div>,
        document.body
      )}
      
      {/* Menu pour les matières empilées */}
      {stackedSubjectsMenu && ReactDOM.createPortal(
        <div
          className="stacked-subjects-menu absolute bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-1 animate-scaleIn"
          style={{
            position: 'fixed',
            left: `${stackedSubjectsMenu.x}px`,
            top: `${stackedSubjectsMenu.y}px`,
            zIndex: 9999
          }}
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
        </div>,
        document.body
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