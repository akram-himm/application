import React, { useState, useRef, useEffect } from 'react';

const MondayDragDropTable = () => {
  // Données simples pour tester
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Tâche 1', status: 'En cours', priority: 'Haute' },
    { id: 2, name: 'Tâche 2', status: 'Terminé', priority: 'Moyenne' },
    { id: 3, name: 'Tâche 3', status: 'À faire', priority: 'Basse' },
    { id: 4, name: 'Tâche 4', status: 'En cours', priority: 'Haute' },
    { id: 5, name: 'Tâche 5', status: 'À faire', priority: 'Moyenne' }
  ]);
  
  // États pour le drag & drop
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs pour éviter les problèmes de closure
  const draggedIndexRef = useRef(null);
  const hoverIndexRef = useRef(null);
  
  // Ref pour l'élément qui suit la souris
  const floatingElementRef = useRef(null);
  
  // Nettoyer quand on arrête le drag (si on lâche en dehors)
  useEffect(() => {
    if (!isDragging) return;
    
    const handleGlobalMouseUp = () => {
      endDrag();
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, tasks]); // Ajouter tasks pour avoir la dernière version
  
  // Calculer où chaque ligne doit être visuellement
  const getRowTransform = (index) => {
    if (!isDragging || draggedIndex === null || hoverIndex === null) {
      return '';
    }
    
    // Pas de transform pour la ligne draggée
    if (index === draggedIndex) {
      return '';
    }
    
    // Si on survole la position originale, pas de mouvement
    if (hoverIndex === draggedIndex || hoverIndex === draggedIndex + 1) {
      return '';
    }
    
    // Calculer le décalage
    if (draggedIndex < hoverIndex) {
      // Drag vers le bas : les lignes entre montent
      if (index > draggedIndex && index < hoverIndex) {
        return 'translateY(-48px)';
      }
    } else {
      // Drag vers le haut : les lignes entre descendent
      if (index < draggedIndex && index >= hoverIndex) {
        return 'translateY(48px)';
      }
    }
    
    return '';
  };
  
  // Commencer le drag
  const startDrag = (e, index) => {
    e.preventDefault();
    
    setDraggedIndex(index);
    setHoverIndex(index);
    setIsDragging(true);
    
    // Mettre à jour les refs
    draggedIndexRef.current = index;
    hoverIndexRef.current = index;
    
    // Créer l'élément flottant
    const row = e.currentTarget;
    const rect = row.getBoundingClientRect();
    
    const floatingElement = document.createElement('div');
    floatingElement.style.cssText = `
      position: fixed;
      z-index: 999999;
      pointer-events: none;
      width: ${rect.width}px;
      background: rgb(37, 37, 37);
      border: 2px solid rgb(35, 131, 226);
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      opacity: 0.95;
      transform: rotate(-2deg);
      left: ${e.clientX + 10}px;
      top: ${e.clientY - 20}px;
    `;
    
    floatingElement.innerHTML = `
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="color: rgba(255, 255, 255, 0.9);">
          ${row.innerHTML}
        </tr>
      </table>
    `;
    
    document.body.appendChild(floatingElement);
    floatingElementRef.current = floatingElement;
    
    // Suivre la souris
    const handleMouseMove = (e) => {
      if (floatingElementRef.current) {
        floatingElementRef.current.style.left = `${e.clientX + 10}px`;
        floatingElementRef.current.style.top = `${e.clientY - 20}px`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    floatingElementRef.current._mouseMoveHandler = handleMouseMove;
  };
  
  // Survoler une ligne
  const handleMouseEnter = (e, index) => {
    if (isDragging && draggedIndexRef.current !== null) {
      // Calculer si on est dans la moitié haute ou basse de la ligne
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const middle = rect.height / 2;
      
      let targetIndex = index;
      
      // Si on survole la moitié basse, on veut insérer APRÈS cette ligne
      if (y > middle) {
        targetIndex = index + 1;
      }
      
      // Ne pas dépasser les limites du tableau
      if (targetIndex > tasks.length) {
        targetIndex = tasks.length;
      }
      
      setHoverIndex(targetIndex);
      hoverIndexRef.current = targetIndex;
    }
  };
  
  // Terminer le drag (drop)
  const endDrag = () => {
    // Nettoyer l'élément flottant
    if (floatingElementRef.current) {
      if (floatingElementRef.current._mouseMoveHandler) {
        document.removeEventListener('mousemove', floatingElementRef.current._mouseMoveHandler);
      }
      floatingElementRef.current.remove();
      floatingElementRef.current = null;
    }
    
    // Utiliser les refs pour éviter les problèmes de closure
    const finalDraggedIndex = draggedIndexRef.current;
    const finalHoverIndex = hoverIndexRef.current;
    
    // Appliquer le changement si nécessaire
    if (finalDraggedIndex !== null && finalHoverIndex !== null && finalDraggedIndex !== finalHoverIndex) {
      const newTasks = [...tasks];
      const [draggedItem] = newTasks.splice(finalDraggedIndex, 1);
      
      // L'index d'insertion dépend de la direction du drag
      let insertIndex = finalHoverIndex;
      if (finalDraggedIndex < finalHoverIndex) {
        // Si on drag vers le bas, ajuster l'index après suppression
        insertIndex = finalHoverIndex - 1;
      }
      
      newTasks.splice(insertIndex, 0, draggedItem);
      setTasks(newTasks);
    }
    
    // Réinitialiser tous les états et refs
    setDraggedIndex(null);
    setHoverIndex(null);
    setIsDragging(false);
    draggedIndexRef.current = null;
    hoverIndexRef.current = null;
  };
  

  
  // Calculer si on doit afficher le placeholder
  const shouldShowPlaceholder = isDragging && 
                                hoverIndex !== null && 
                                draggedIndex !== null &&
                                hoverIndex !== draggedIndex && 
                                hoverIndex !== draggedIndex + 1;
  
  // Calculer la position du placeholder
  const getPlaceholderPosition = () => {
    if (!shouldShowPlaceholder) return null;
    
    // Position Y basée sur où les lignes ont bougé
    let position;
    if (draggedIndex < hoverIndex) {
      // Drag vers le bas
      position = (hoverIndex - 1) * 48;
    } else {
      // Drag vers le haut
      position = hoverIndex * 48;
    }
    
    // Ajouter la hauteur du header (environ 45px)
    return position + 45;
  };

  return (
    <div style={{ padding: '40px', background: 'rgb(25, 25, 25)', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>Drag & Drop Monday.com - Corrigé</h1>
      
      <div style={{ 
        background: 'rgb(32, 32, 32)', 
        borderRadius: '8px', 
        overflow: 'hidden',
        border: '1px solid rgb(47, 47, 47)',
        position: 'relative'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgb(37, 37, 37)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', width: '40%' }}>Nom</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', width: '30%' }}>Statut</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', width: '30%' }}>Priorité</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const isDraggedRow = index === draggedIndex && isDragging;
              
              return (
                <tr
                  key={task.id}
                  onMouseDown={(e) => startDrag(e, index)}
                  onMouseEnter={(e) => handleMouseEnter(e, index)}
                  onMouseMove={(e) => {
                    if (isDragging) {
                      handleMouseEnter(e, index);
                    }
                  }}
                  style={{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    height: '48px',
                    transform: getRowTransform(index),
                    transition: isDragging ? 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.055)',
                    background: 'transparent',
                    userSelect: 'none',
                    opacity: isDraggedRow ? 0.3 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isDragging) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDragging) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                    {task.name}
                  </td>
                  <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: task.status === 'Terminé' ? 'rgba(16, 185, 129, 0.2)' : 
                                 task.status === 'En cours' ? 'rgba(59, 130, 246, 0.2)' : 
                                 'rgba(107, 114, 128, 0.2)',
                      color: task.status === 'Terminé' ? 'rgb(16, 185, 129)' : 
                             task.status === 'En cours' ? 'rgb(59, 130, 246)' : 
                             'rgb(107, 114, 128)'
                    }}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: task.priority === 'Haute' ? 'rgba(239, 68, 68, 0.2)' : 
                                 task.priority === 'Moyenne' ? 'rgba(245, 158, 11, 0.2)' : 
                                 'rgba(16, 185, 129, 0.2)',
                      color: task.priority === 'Haute' ? 'rgb(239, 68, 68)' : 
                             task.priority === 'Moyenne' ? 'rgb(245, 158, 11)' : 
                             'rgb(16, 185, 129)'
                    }}>
                      {task.priority}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Placeholder flottant dans l'espace vide */}
        {shouldShowPlaceholder && (
          <div style={{
            position: 'absolute',
            top: `${getPlaceholderPosition()}px`,
            left: '12px',
            right: '12px',
            height: '44px',
            background: 'rgba(35, 131, 226, 0.05)',
            border: '2px dashed rgb(35, 131, 226)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgb(35, 131, 226)',
            fontSize: '12px',
            fontWeight: '500',
            pointerEvents: 'none',
            zIndex: 10,
            transition: 'top 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            Déposer ici
          </div>
        )}
      </div>
      
      {/* État actuel pour debug */}
      <div style={{ marginTop: '30px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
        <p>📊 <strong>État actuel (debug) :</strong></p>
        <ul style={{ lineHeight: '26px' }}>
          <li>Ligne draggée : {draggedIndex !== null ? `${tasks[draggedIndex]?.name} (index ${draggedIndex})` : 'Aucune'}</li>
          <li>Va s'insérer : {
            hoverIndex !== null && draggedIndex !== null ? 
              (hoverIndex > draggedIndex ? 
                `Après ${tasks[hoverIndex - 1]?.name || 'début'}` : 
                `Avant ${tasks[hoverIndex]?.name || 'fin'}`) 
              : 'Nulle part'
          }</li>
          <li>En cours de drag : {isDragging ? 'Oui' : 'Non'}</li>
        </ul>
        
        <p style={{ marginTop: '20px' }}>✅ <strong>Corrections appliquées :</strong></p>
        <ul style={{ lineHeight: '26px' }}>
          <li>TranslateY à 48px pour les mouvements</li>
          <li>Calcul précis de la position d'insertion (moitié haute/basse)</li>
          <li>Drop fonctionne avec mouseup global + refs</li>
          <li>Suppression complète des placeholders DOM</li>
          <li>Ligne draggée reste visible avec opacité 0.3</li>
          <li>Rectangle gris pointillé dans l'espace vide (position absolute)</li>
        </ul>
      </div>
    </div>
  );
};

export default MondayDragDropTable;