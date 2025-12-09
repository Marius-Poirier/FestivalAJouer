import { Router } from 'express'
import pool from '../db/database.js'
import { requireOrganisateur } from '../middleware/auth-organisateur.js'
import { sanitizeString } from '../utils/validation.js'

const router = Router()
const EDITOR_FIELDS = 'id, nom, created_at, updated_at'

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
    if (!nom) {
        return res.status(400).json({ error: 'Le nom est requis' })
    }
    try {
        const { rows } = await pool.query(
            `INSERT INTO Editeur (nom) VALUES ($1)
            RETURNING ${EDITOR_FIELDS}`,
            [nom]
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
    if (!nom) {
        return res.status(400).json({ error: 'Le nom est requis' })
    }
    try {
        const { rows } = await pool.query(
            `UPDATE Editeur SET nom = $1 WHERE id = $2 RETURNING ${EDITOR_FIELDS}`,
            [nom, editorId]
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

export default router
