import { Router } from 'express'
import pool from '../db/database.js'
import { requireOrganisateur } from '../middleware/auth-organisateur.js'
import { sanitizeString } from '../utils/validation.js'

const router = Router()
const EDITOR_FIELDS = 'id, nom, logo_url, created_at, updated_at'

// GET /api/editeurs?search=ludo
router.get('/', async (req, res) => {
    const search = typeof req.query?.search === 'string' ? sanitizeString(req.query.search) : null

    try {
        const filters: string[] = []
        const params: unknown[] = []

        if (search) {
            params.push(`%${search}%`)
            filters.push(`nom ILIKE $${params.length}`)
        }

        // Optional filter: only editors with a reservation for a given festival
        if (req.query?.festivalId !== undefined) {
            const id = Number.parseInt(String(req.query.festivalId), 10)
            if (!Number.isInteger(id)) {
                return res.status(400).json({ error: 'festivalId invalide' })
            }
            params.push(id)
            filters.push(
                `EXISTS (SELECT 1 FROM Reservation r WHERE r.editeur_id = Editeur.id AND r.festival_id = $${params.length})`
            )
        }

        const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

        const { rows } = await pool.query(
            `SELECT ${EDITOR_FIELDS} FROM Editeur ${whereClause} ORDER BY nom ASC`,
            params
        )
        res.json(rows)
    } catch (err) {
        console.error('Erreur lors de la récupération des éditeurs', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// GET /api/editeurs/:id
router.get('/:id', async (req, res) => {
    const editorId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(editorId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }
    try {
        const { rows } = await pool.query(
            `SELECT ${EDITOR_FIELDS} FROM Editeur WHERE id = $1`,
            [editorId]
        )
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Éditeur non trouvé' })
        }
        res.json(rows[0])
    } catch (err) {
        console.error(`Erreur lors de la récupération de l'éditeur ${editorId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// POST /api/editeurs
router.post('/', requireOrganisateur, async (req, res) => {
    const nom = sanitizeString(req.body?.nom)
    const logoInput = sanitizeString(req.body?.logoUrl ?? req.body?.logo_url)
    const logoUrl = logoInput || null
    if (!nom) {
        return res.status(400).json({ error: 'Le nom est requis' })
    }
    try {
        const { rows } = await pool.query(
            `INSERT INTO Editeur (nom, logo_url) VALUES ($1, $2)
            RETURNING ${EDITOR_FIELDS}`,
            [nom, logoUrl]
        )
        res.status(201).json({ message: 'Éditeur créé', editeur: rows[0] })
    } catch (err: any) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Ce nom d\'éditeur existe déjà' })
        }
        console.error('Erreur lors de la création de l\'éditeur', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// PUT /api/editeurs/:id
router.put('/:id', requireOrganisateur, async (req, res) => {
    const editorId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(editorId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }
    const nom = sanitizeString(req.body?.nom)
    const logoInput = sanitizeString(req.body?.logoUrl ?? req.body?.logo_url)
    const logoUrl = logoInput || null
    if (!nom) {
        return res.status(400).json({ error: 'Le nom est requis' })
    }
    try {
        const { rows } = await pool.query(
            `UPDATE Editeur SET nom = $1, logo_url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING ${EDITOR_FIELDS}`,
            [nom, logoUrl, editorId]
        )
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Éditeur non trouvé' })
        }
        res.json({ message: 'Éditeur mis à jour', editeur: rows[0] })
    } catch (err: any) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Ce nom d\'éditeur existe déjà' })
        }
        console.error(`Erreur lors de la mise à jour de l\'éditeur ${editorId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// DELETE /api/editeurs/:id
router.delete('/:id', requireOrganisateur, async (req, res) => {
    const editorId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(editorId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }
    try {
        const { rows } = await pool.query(
            `DELETE FROM Editeur WHERE id = $1 RETURNING id, nom`,
            [editorId]
        )
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Éditeur non trouvé' })
        }
        res.json({ message: 'Éditeur supprimé', editeur: rows[0] })
    } catch (err) {
        console.error(`Erreur lors de la suppression de l\'éditeur ${editorId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// GET /api/editeurs/:id/jeux
router.get('/:id/jeux', async (req, res) => {
  const editorId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(editorId)) {
    return res.status(400).json({ error: 'Identifiant invalide' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT j.id, j.nom, j.nb_joueurs_min, j.nb_joueurs_max, j.duree_minutes, j.age_min, j.age_max, j.description, j.lien_regles, j.created_at, j.updated_at
       FROM Jeu j
       JOIN JeuEditeur je ON je.jeu_id = j.id
       WHERE je.editeur_id = $1
       ORDER BY j.nom ASC`,
      [editorId]
    );

    res.json(rows);
  } catch (err) {
    console.error(
      `Erreur lors de la récupération des jeux pour l'éditeur ${editorId}`,
      err
    );
    res.status(500).json({ error: 'Erreur serveur' });
  }
})


export default router
