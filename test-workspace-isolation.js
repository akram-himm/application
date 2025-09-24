// Script pour tester l'isolation des données entre workspaces
// À exécuter dans la console du navigateur

async function testWorkspaceIsolation() {
  console.log('=== TEST D\'ISOLATION DES WORKSPACES ===\n');

  // 1. Récupérer le workspace actuel
  const currentWorkspaceKey = localStorage.getItem('app_current_workspace');
  const workspaces = JSON.parse(localStorage.getItem('app_workspaces') || '[]');
  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceKey);

  if (!currentWorkspace) {
    console.error('❌ Aucun workspace actuel trouvé');
    return;
  }

  console.log(`📌 Workspace actuel: ${currentWorkspace.name} (${currentWorkspace.id})`);
  console.log(`   Clés de données:`);
  Object.entries(currentWorkspace.dataKeys || {}).forEach(([key, value]) => {
    const data = localStorage.getItem(value);
    const itemCount = data ? (JSON.parse(data).length || 0) : 0;
    console.log(`   - ${key}: ${value} (${itemCount} éléments)`);
  });

  // 2. Vérifier les autres workspaces
  console.log('\n📊 Autres workspaces:');
  workspaces.filter(ws => ws.id !== currentWorkspaceKey).forEach(ws => {
    console.log(`   ${ws.name} (${ws.id})`);
    Object.entries(ws.dataKeys || {}).forEach(([key, value]) => {
      const data = localStorage.getItem(value);
      const itemCount = data ? (JSON.parse(data).length || 0) : 0;
      console.log(`   - ${key}: ${value} (${itemCount} éléments)`);
    });
  });

  // 3. Vérifier l'unicité des clés
  console.log('\n🔍 Vérification de l\'unicité des clés:');
  const allKeys = new Set();
  let hasConflict = false;

  workspaces.forEach(ws => {
    Object.entries(ws.dataKeys || {}).forEach(([dataType, storageKey]) => {
      if (allKeys.has(storageKey)) {
        console.error(`   ❌ CONFLIT: La clé "${storageKey}" est utilisée par plusieurs workspaces!`);
        hasConflict = true;
      } else {
        allKeys.add(storageKey);
      }
    });
  });

  if (!hasConflict) {
    console.log('   ✅ Toutes les clés sont uniques');
  }

  // 4. Test d'ajout de données
  console.log('\n🧪 Test d\'ajout de données:');
  const testRadarKey = currentWorkspace.dataKeys.radars;
  const currentRadars = JSON.parse(localStorage.getItem(testRadarKey) || '[]');
  console.log(`   Radars actuels dans ${currentWorkspace.name}: ${currentRadars.length}`);

  // Ajouter un radar de test
  const testRadar = {
    id: `test-${Date.now()}`,
    name: 'Test Radar',
    color: '#FF0000',
    items: [],
    createdAt: new Date().toISOString()
  };
  currentRadars.push(testRadar);
  localStorage.setItem(testRadarKey, JSON.stringify(currentRadars));
  console.log(`   ✅ Radar de test ajouté`);

  // 5. Vérifier que les autres workspaces ne sont pas affectés
  console.log('\n🔒 Vérification de l\'isolation:');
  let isolationOk = true;

  workspaces.filter(ws => ws.id !== currentWorkspaceKey).forEach(ws => {
    const otherRadarKey = ws.dataKeys.radars;
    const otherRadars = JSON.parse(localStorage.getItem(otherRadarKey) || '[]');
    const hasTestRadar = otherRadars.some(r => r.id === testRadar.id);

    if (hasTestRadar) {
      console.error(`   ❌ Le radar de test a été trouvé dans ${ws.name}!`);
      isolationOk = false;
    } else {
      console.log(`   ✅ ${ws.name} n'est pas affecté`);
    }
  });

  // 6. Nettoyer le radar de test
  const cleanedRadars = currentRadars.filter(r => r.id !== testRadar.id);
  localStorage.setItem(testRadarKey, JSON.stringify(cleanedRadars));
  console.log('\n🧹 Radar de test supprimé');

  // Résultat final
  console.log('\n=== RÉSULTAT DU TEST ===');
  if (!hasConflict && isolationOk) {
    console.log('✅ L\'isolation des workspaces fonctionne correctement!');
  } else {
    console.log('❌ Problèmes détectés dans l\'isolation des workspaces');
  }
}

// Lancer le test
testWorkspaceIsolation();