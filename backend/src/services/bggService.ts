import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import pool from '../db/database.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

const BGG_API_URL = "https://boardgamegeek.com/xmlapi2";

export async function populateDatabase() {
  console.log("🔥 Starting BGG Database Population...");
  
  // Check if Token exists
  if (!process.env.BGG_TOKEN) {
    console.error("❌ MISSING BGG_TOKEN in environment variables. Aborting.");
    return;
  }

  // ✅ AUTH CONFIGURATION
  const axiosConfig = {
    headers: {
      'User-Agent': 'FestivalAJouer/1.0 (contact@votre-email.com)',
      'Accept': 'application/xml, text/xml, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Authorization': `Bearer ${process.env.BGG_TOKEN}` // <--- THE FIX
    }
  };

  try {
    // 1. Get Popular Games
    console.log("📡 Fetching Hot List...");
    const hotResponse = await axios.get(`${BGG_API_URL}/hot?type=boardgame`, axiosConfig);
    const hotParsed = parser.parse(hotResponse.data);

    if (!hotParsed.items || !hotParsed.items.item) {
        console.error("❌ No items found in BGG Hot list.");
        return;
    }

    const items = hotParsed.items.item.slice(0, 20); 
    const ids = items.map((item: any) => item.id).join(',');

    console.log(`✅ Found ${items.length} games. Fetching details...`);

    // 2. Get Details
    const detailsResponse = await axios.get(`${BGG_API_URL}/thing?id=${ids}`, axiosConfig);
    const detailsParsed = parser.parse(detailsResponse.data);
    
    const games = Array.isArray(detailsParsed.items.item) 
      ? detailsParsed.items.item 
      : [detailsParsed.items.item];

    // 3. Insert into Database
    for (const game of games) {
      const nameObj = Array.isArray(game.name) 
        ? game.name.find((n: any) => n.type === 'primary') 
        : game.name;
      const nom = nameObj ? nameObj.value : 'Unknown';

      const check = await pool.query('SELECT id FROM games WHERE nom = $1', [nom]);
      if (check.rows.length > 0) {
        console.log(`⚠️ Game "${nom}" already exists. Skipping.`);
        continue;
      }

      const values = [
        nom,
        game.minplayers ? parseInt(game.minplayers.value) : null,
        game.maxplayers ? parseInt(game.maxplayers.value) : null,
        game.playingtime ? parseInt(game.playingtime.value) : null,
        game.minage ? parseInt(game.minage.value) : null,
        null, 
        game.description || null,
        `https://boardgamegeek.com/boardgame/${game.id}` 
      ];

      const sql = `
        INSERT INTO games 
        (nom, nb_joueurs_min, nb_joueurs_max, duree_minutes, age_min, age_max, description, lien_regles) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      await pool.query(sql, values);
      console.log(`✅ Inserted: ${nom}`);
    }

    console.log("🏁 Database population finished!");

  } catch (error: any) {
    if (error.response) {
        console.error(`❌ BGG API Error: ${error.response.status} ${error.response.statusText}`);
        // Log detailed error data if available
        console.error("Details:", error.response.data); 
    } else {
        console.error("❌ Error fetching BGG data:", error.message);
    }
  }
}