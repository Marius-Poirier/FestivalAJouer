import 'dotenv/config';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import pool from '../db/database.js';

const HOT_LIMIT = 100;
const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi2';
// We use the token from .env if available, BGG generally blocks AWS/Azure IPs without it/User-Agent
const BGG_TOKEN = process.env.BGG_TOKEN;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

const toInt = (value: unknown) => {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
};

const pickPrimaryName = (name: any) => name || 'Unknown';

async function fetchHot() {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; FestivalAJouer/1.0)',
    };
    if (BGG_TOKEN) {
      headers['Authorization'] = `Bearer ${BGG_TOKEN}`;
    }

    const { data } = await axios.get(`${BGG_API_BASE}/hot?type=boardgame`, { headers });
    const parsed = parser.parse(data);

    const items = parsed.items?.item;
    if (!items) return [];

    const itemsArray = Array.isArray(items) ? items : [items];

    // Map to expected structure (we just need gameId essentially)
    return itemsArray.slice(0, HOT_LIMIT).map((item: any) => ({
      gameId: item['@_id'],
      name: item.name?.['@_value'],
      yearPublished: item.yearpublished?.['@_value']
    }));
  } catch (error) {
    console.error('Error fetching hot list:', error);
    return [];
  }
}

async function fetchThing(id: number) {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; FestivalAJouer/1.0)',
    };
    if (BGG_TOKEN) {
      headers['Authorization'] = `Bearer ${BGG_TOKEN}`;
    }

    const { data } = await axios.get(`${BGG_API_BASE}/thing?id=${id}&stats=1`, { headers });
    const parsed = parser.parse(data);

    const item = parsed.items?.item;
    if (!item) return null;

    const game = Array.isArray(item) ? item[0] : item;

    let primaryName = 'Unknown';
    if (Array.isArray(game.name)) {
      const found = game.name.find((n: any) => n['@_type'] === 'primary');
      primaryName = found ? found['@_value'] : game.name[0]['@_value'];
    } else {
      primaryName = game.name['@_value'];
    }

    return {
      gameId: game['@_id'],
      name: primaryName,
      minPlayers: game.minplayers?.['@_value'],
      maxPlayers: game.maxplayers?.['@_value'],
      playingTime: game.playingtime?.['@_value'],
      minAge: game.minage?.['@_value'],
      description: game.description,
      thumbnail: game.thumbnail,
      image: game.image
    };
  } catch (error) {
    console.error(`Error fetching thing ${id}:`, error);
    return null;
  }
}
async function fetchThingsBatch(ids: number[]) {
  if (ids.length === 0) return [];
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; FestivalAJouer/1.0)',
    };
    if (BGG_TOKEN) {
      headers['Authorization'] = `Bearer ${BGG_TOKEN}`;
    }

    const idString = ids.join(',');
    const { data } = await axios.get(`${BGG_API_BASE}/thing?id=${idString}&stats=1`, { headers });
    const parsed = parser.parse(data);

    const items = parsed.items?.item;
    if (!items) return [];

    const itemsArray = Array.isArray(items) ? items : [items];

    return itemsArray.map((game: any) => {
      let primaryName = 'Unknown';
      if (Array.isArray(game.name)) {
        const found = game.name.find((n: any) => n['@_type'] === 'primary');
        primaryName = found ? found['@_value'] : game.name[0]['@_value'];
      } else {
        primaryName = game.name?.['@_value'] ?? 'Unknown';
      }

      return {
        gameId: game['@_id'],
        name: primaryName,
        minPlayers: game.minplayers?.['@_value'],
        maxPlayers: game.maxplayers?.['@_value'],
        playingTime: game.playingtime?.['@_value'],
        minAge: game.minage?.['@_value'],
        description: game.description,
        thumbnail: game.thumbnail,
        image: game.image
      };
    });
  } catch (error) {
    console.error(`Error fetching things batch:`, error);
    return [];
  }
}

export async function populateDatabase() {
  try {
    // Sync sequence to avoid "duplicate key value" errors
    try {
      await pool.query("SELECT setval('jeu_id_seq', COALESCE((SELECT MAX(id) FROM Jeu), 1))");
      console.log('Database sequence synchronized.');
    } catch (seqError) {
      console.warn('Could not sync sequence (might be first run or different schema):', seqError);
    }

    const hotItems = await fetchHot();
    if (!hotItems.length) {
      console.warn('No items found in BGG hot list.');
      return { inserted: 0, skipped: 0, total: 0 };
    }

    const allGameIds = hotItems.map((item: any) => Number(item.gameId)).filter((id: number) => !isNaN(id));

    // Process in chunks of 20 to be safe with URL length and server load
    const CHUNK_SIZE = 20;
    const games = [] as any[];

    for (let i = 0; i < allGameIds.length; i += CHUNK_SIZE) {
      const chunk = allGameIds.slice(i, i + CHUNK_SIZE);
      const batchDetails = await fetchThingsBatch(chunk);
      games.push(...batchDetails);

      // Small polite delay between batches
      if (i + CHUNK_SIZE < allGameIds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    let inserted = 0;
    let skipped = 0;

    for (const game of games) {
      const nom = pickPrimaryName(game.name);

      const existing = await pool.query('SELECT id FROM Jeu WHERE nom = $1 LIMIT 1', [nom]);
      if (existing.rows.length > 0) {
        console.log(`> Skipped (exists): "${nom}"`);
        skipped += 1;
        continue;
      }

      const sql = `
        INSERT INTO Jeu (
          nom,
          nb_joueurs_min,
          nb_joueurs_max,
          duree_minutes,
          age_min,
          age_max,
          description,
          lien_regles,
          url_image,
          url_video,
          prototype
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;

      const values = [
        nom,
        toInt(game.minPlayers),
        toInt(game.maxPlayers),
        toInt(game.playingTime),
        toInt(game.minAge),
        null,
        game.description || null,
        `https://boardgamegeek.com/boardgame/${game.gameId}`,
        game.thumbnail || game.image || null,
        null,
        false,
      ];

      await pool.query(sql, values);
      console.log(`> Inserted: "${nom}"`);
      inserted += 1;
    }

    return { inserted, skipped, total: games.length };
  } catch (err: any) {
    console.error('BGG import failed (network or DNS). Set BGG_JSON_BASE if using a proxy or mirror.', {
      message: err?.message,
      code: err?.code,
      hostname: err?.hostname,
    });
    return { inserted: 0, skipped: 0, total: 0 };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  populateDatabase()
    .then((result) => {
      const summary = result
        ? `BGG import finished. Inserted: ${result.inserted}, skipped: ${result.skipped}, total processed: ${result.total}`
        : 'BGG import finished.';
      console.log(summary);
      process.exit(0);
    })
    .catch((err) => {
      console.error('BGG import failed:', err?.message || err);
      process.exit(1);
    });
}