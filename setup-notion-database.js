const { Client } = require('@notionhq/client');

// Configuration
const notion = new Client({
  auth: process.env.NOTION_TOKEN || 'YOUR_NOTION_TOKEN_HERE'
});

const DATABASE_ID = '26c6b77b098e80c18380d27d8156fa9b';

async function setupDatabase() {
  try {
    console.log('🔍 Vérification de la structure de votre base Notion...\n');

    // Récupérer la base de données
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID
    });

    console.log('✅ Base trouvée:', database.title[0]?.plain_text || 'Sans titre');
    console.log('\n📋 Propriétés existantes:');

    const existingProps = Object.keys(database.properties);
    existingProps.forEach(prop => {
      const type = database.properties[prop].type;
      console.log(`  - ${prop} (${type})`);
    });

    // Propriétés requises pour l'application
    const requiredProperties = {
      'Name': { type: 'title', exists: false },
      'Status': {
        type: 'select',
        options: ['À faire', 'En cours', 'Terminé'],
        exists: false
      },
      'Priority': {
        type: 'select',
        options: ['Urgent', 'Normal', 'Pas de panique'],
        exists: false
      },
      'Date': { type: 'date', exists: false },
      'Type': {
        type: 'select',
        options: ['daily', 'weekly', 'routine'],
        exists: false
      },
      'Description': { type: 'rich_text', exists: false },
      'Time': { type: 'rich_text', exists: false },
      'Color': { type: 'rich_text', exists: false },
      'Radar': { type: 'rich_text', exists: false },
      'Subject': { type: 'rich_text', exists: false }
    };

    // Vérifier quelles propriétés existent déjà
    console.log('\n🔄 Vérification des propriétés requises...');

    for (const propName in requiredProperties) {
      const existingProp = database.properties[propName];
      if (existingProp) {
        requiredProperties[propName].exists = true;
        console.log(`  ✅ ${propName} existe déjà (${existingProp.type})`);
      } else {
        console.log(`  ❌ ${propName} manquant - sera créé`);
      }
    }

    // Créer les propriétés manquantes
    const propertiesToAdd = {};
    let hasChanges = false;

    for (const [propName, config] of Object.entries(requiredProperties)) {
      if (!config.exists) {
        hasChanges = true;

        switch (config.type) {
          case 'select':
            propertiesToAdd[propName] = {
              select: {
                options: config.options.map(opt => ({
                  name: opt,
                  color: getColorForOption(opt)
                }))
              }
            };
            break;
          case 'rich_text':
            propertiesToAdd[propName] = {
              rich_text: {}
            };
            break;
          case 'date':
            propertiesToAdd[propName] = {
              date: {}
            };
            break;
          case 'title':
            // Title existe toujours, ne pas essayer de l'ajouter
            if (!database.properties[propName]) {
              console.log('  ⚠️  Propriété Title manquante - utilisez une propriété Title existante');
            }
            break;
        }
      }
    }

    if (hasChanges && Object.keys(propertiesToAdd).length > 0) {
      console.log('\n🔧 Mise à jour de la base de données...');

      try {
        await notion.databases.update({
          database_id: DATABASE_ID,
          properties: propertiesToAdd
        });

        console.log('✅ Base de données mise à jour avec succès!');
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error.message);
        console.log('\n💡 Conseil: Ajoutez manuellement ces propriétés dans Notion:');
        for (const [propName, config] of Object.entries(requiredProperties)) {
          if (!config.exists) {
            console.log(`  - ${propName} (${config.type})`);
          }
        }
      }
    } else {
      console.log('\n✅ Votre base de données est déjà correctement configurée!');
    }

    // Test de création d'une tâche
    console.log('\n🧪 Test de création d\'une tâche...');

    try {
      const testTask = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          'Name': {
            title: [{
              text: {
                content: 'Test de synchronisation'
              }
            }]
          },
          'Status': {
            select: {
              name: 'À faire'
            }
          },
          'Priority': {
            select: {
              name: 'Normal'
            }
          },
          'Type': {
            select: {
              name: 'daily'
            }
          }
        }
      });

      console.log('✅ Tâche de test créée avec succès!');
      console.log('   ID:', testTask.id);

      // Optionnel: supprimer la tâche de test
      // await notion.pages.update({
      //   page_id: testTask.id,
      //   archived: true
      // });

    } catch (error) {
      console.error('❌ Erreur lors de la création de la tâche:', error.message);
    }

    console.log('\n🎉 Configuration terminée!');
    console.log('Vous pouvez maintenant synchroniser vos tâches avec Notion.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

function getColorForOption(option) {
  const colors = {
    'À faire': 'gray',
    'En cours': 'blue',
    'Terminé': 'green',
    'Urgent': 'red',
    'Normal': 'yellow',
    'Pas de panique': 'gray',
    'daily': 'blue',
    'weekly': 'purple',
    'routine': 'green'
  };

  return colors[option] || 'gray';
}

// Lancer la configuration
setupDatabase();