const { Client } = require('@notionhq/client');

// Test simple de l'API Notion
const notion = new Client({
  auth: process.env.NOTION_TOKEN || 'YOUR_NOTION_TOKEN_HERE'
});

const DATABASE_ID = '26c6b77b098e80c18380d27d8156fa9b';

async function test() {
  try {
    console.log('Test 1: Connexion...');
    const user = await notion.users.me();
    console.log('✅ Connecté en tant que:', user.name);

    console.log('\nTest 2: Récupération de la base de données...');
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID
    });
    console.log('✅ Base de données trouvée:', database.title[0]?.plain_text || 'Sans titre');

    console.log('\nTest 3: Récupération des tâches...');
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      page_size: 5
    });
    console.log(`✅ ${response.results.length} tâches trouvées`);

    // Afficher les propriétés disponibles
    if (response.results.length > 0) {
      console.log('\nPropriétés disponibles dans Notion:');
      const props = Object.keys(response.results[0].properties);
      props.forEach(prop => {
        const type = response.results[0].properties[prop].type;
        console.log(`  - ${prop} (${type})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Détails:', error);
  }
}

test();