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
  const animationRef = useRef(null);

  // Configuration du radar
  const size = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7, 600);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

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
    
    if (subjects.length === 0) return;
    
    const angleStep = (Math.PI * 2) / subjects.length;

    // Grilles avec animation
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.055)';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.globalAlpha = animationProgress;
      
      for (let j = 0; j < subjects.length; j++) {
        const angle = j * angleStep - Math.PI / 2;
        const currentRadius = radius * i / 5 * animationProgress;
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Lignes radiales
    subjects.forEach((subject, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * animationProgress;
      const y = centerY + Math.sin(angle) * radius * animationProgress;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.055)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = animationProgress;
      ctx.stroke();

      // Labels
      ctx.save();
      const penalty = penalties.find(p => p.subjectId === subject.id);
      const hasWarning = penalty !== undefined;
      
      ctx.fillStyle = hasWarning ? 'rgb(251, 191, 36)' : 
                     (hoveredSubject === index ? 'rgba(255, 255, 255, 0.81)' : 'rgba(255, 255, 255, 0.46)');
      ctx.font = hoveredSubject === index ? '600 15px -apple-system' : '15px -apple-system';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = animationProgress;
      
      const labelX = centerX + Math.cos(angle) * (radius + 35);
      const labelY = centerY + Math.sin(angle) * (radius + 35);
      ctx.fillText(subject.name, labelX, labelY);
      
      if (hasWarning) {
        ctx.fillStyle = 'rgb(251, 191, 36)';
        ctx.font = '12px -apple-system';
        ctx.fillText('⚠', labelX + ctx.measureText(subject.name).width / 2 + 10, labelY);
      }
      
      ctx.restore();
    });

    // Zone de données avec animation
    ctx.beginPath();
    ctx.fillStyle = 'rgba(35, 131, 226, 0.1)';
    ctx.strokeStyle = 'rgb(35, 131, 226)';
    ctx.lineWidth = 2;
    ctx.globalAlpha = animationProgress;

    subjects.forEach((subject, index) => {
      const angle = index * angleStep - Math.PI / 2;
      let value = subject.value;
      
      const penalty = penalties.find(p => p.subjectId === subject.id);
      if (penalty) {
        value = Math.max(0, value - penalty.penaltyValue);
      }
      
      const displayValue = (value / subject.max) * radius * animationProgress;
      const x = centerX + Math.cos(angle) * displayValue;
      const y = centerY + Math.sin(angle) * displayValue;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Points avec animation
    subjects.forEach((subject, index) => {
      const angle = index * angleStep - Math.PI / 2;
      let value = subject.value;
      
      const penalty = penalties.find(p => p.subjectId === subject.id);
      if (penalty) {
        value = Math.max(0, value - penalty.penaltyValue);
      }
      
      const displayValue = (value / subject.max) * radius * animationProgress;
      const x = centerX + Math.cos(angle) * displayValue;
      const y = centerY + Math.sin(angle) * displayValue;

      ctx.beginPath();
      ctx.arc(x, y, hoveredSubject === index ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = penalty ? 'rgb(251, 191, 36)' : 'rgb(35, 131, 226)';
      ctx.globalAlpha = animationProgress;
      ctx.fill();
      
      if (hoveredSubject === index) {
        ctx.strokeStyle = penalty ? 'rgba(251, 191, 36, 0.3)' : 'rgba(35, 131, 226, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
    
    ctx.globalAlpha = 1;
  }, [subjects, hoveredSubject, penalties, animationProgress, size, centerX, centerY, radius]);

  useEffect(() => {
    drawRadar();
  }, [drawRadar]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (size / rect.width);
    const y = (e.clientY - rect.top) * (size / rect.height);
    
    let foundIndex = null;
    const angleStep = (Math.PI * 2) / subjects.length;
    
    subjects.forEach((subject, index) => {
      const angle = index * angleStep - Math.PI / 2;
      let value = subject.value;
      
      const penalty = penalties.find(p => p.subjectId === subject.id);
      if (penalty) {
        value = Math.max(0, value - penalty.penaltyValue);
      }
      
      const displayValue = (value / subject.max) * radius;
      const px = centerX + Math.cos(angle) * displayValue;
      const py = centerY + Math.sin(angle) * displayValue;
      
      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      
      if (distance < 20) {
        foundIndex = index;
      }
    });
    
    onHoverSubject(foundIndex);
    
    // Tooltip
    if (foundIndex !== null && tooltipRef.current) {
      const subject = subjects[foundIndex];
      const penalty = penalties.find(p => p.subjectId === subject.id);
      
      tooltipRef.current.style.display = 'block';
      tooltipRef.current.style.left = e.clientX + 15 + 'px';
      tooltipRef.current.style.top = e.clientY - 10 + 'px';
      
      const tooltipTitle = tooltipRef.current.querySelector('.tooltip-title');
      const tooltipValue = tooltipRef.current.querySelector('.tooltip-value');
      const tooltipBar = tooltipRef.current.querySelector('.tooltip-bar-fill');
      const tooltipWarning = tooltipRef.current.querySelector('.tooltip-warning');
      
      tooltipTitle.textContent = subject.name;
      
      if (penalty) {
        const adjustedValue = Math.max(0, subject.value - penalty.penaltyValue);
        tooltipValue.textContent = `${adjustedValue}%`;
        tooltipBar.style.width = adjustedValue + '%';
        tooltipBar.style.background = 'rgb(251, 191, 36)';
        tooltipWarning.style.display = 'flex';
        tooltipWarning.textContent = `${penalty.daysSince} jours sans progrès (-${penalty.penaltyValue}%)`;
      } else {
        tooltipValue.textContent = `${subject.value}%`;
        tooltipBar.style.width = subject.value + '%';
        tooltipBar.style.background = 'rgb(35, 131, 226)';
        tooltipWarning.style.display = 'none';
      }
    } else if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };

  const handleClick = (e) => {
    if (hoveredSubject !== null) {
      const subject = subjects[hoveredSubject];
      const penalty = penalties.find(p => p.subjectId === subject.id);
      
      if (penalty) {
        // Si la matière a une pénalité, on demande confirmation
        if (confirm(`Voulez-vous marquer une progression pour ${subject.name} et réinitialiser le timer ?`)) {
          onSelectSubject(hoveredSubject, true); // true = réinitialiser le timer
        }
      } else {
        // Navigation vers la page des chapitres
        navigate(`/radar/${radarId}/subject/${subject.id}`);
      }
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (hoveredSubject !== null) {
      onContextMenu(e, hoveredSubject);
    }
  };

  const handleMouseLeave = () => {
    onHoverSubject(null);
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };

  useEffect(() => {
    const handleResize = () => {
      drawRadar();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawRadar]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer drop-shadow-[0_0_20px_rgba(35,131,226,0.1)] hover:drop-shadow-[0_0_30px_rgba(35,131,226,0.2)] transition-all duration-300"
      />
      
      <div
        ref={tooltipRef}
        className="fixed bg-[rgb(37,37,37)]/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 pointer-events-none opacity-100 z-[200] shadow-2xl hidden"
      >
        <h4 className="tooltip-title text-sm font-semibold text-white/81 mb-1"></h4>
        <div className="flex items-center gap-2 mb-2">
          <p className="tooltip-value text-sm text-white/46"></p>
          <div className="w-20 h-1 bg-white/10 rounded-sm overflow-hidden">
            <div className="tooltip-bar-fill h-full rounded-sm transition-all duration-300"></div>
          </div>
        </div>
        <p className="tooltip-warning text-xs text-[rgb(251,191,36)] items-center gap-1 hidden">
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z" />
          </svg>
        </p>
      </div>
    </>
  );
};

export default RadarChart;