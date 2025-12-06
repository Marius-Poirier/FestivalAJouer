import { Router } from 'express'
import pool from '../db/database.js'
import { requireOrganisateur } from '../middleware/auth-organisateur.js'
import { parsePositiveInteger } from '../utils/validation.js'

const router = Router()
const FIELDS = 'jeu_festival_id, table_id'

// GET /api/jeu-festival-tables
router.get('/', async (req, res) => {
    if (!req.query.jeuFestivalId) {
        return res.status(400).json({ error: 'jeuFestivalId est requis' })
    }
    const id = Number.parseInt(String(req.query.jeuFestivalId), 10)
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'jeuFestivalId invalide' })
    }
    try {
        const { rows } = await pool.query(
            `SELECT ${FIELDS} FROM JeuFestivalTable WHERE jeu_festival_id = $1`,
            [id]
        )
        res.json(rows)
    } catch (err) {
        console.error('Erreur lors de la récupération des tables d\'un jeu', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// POST /api/jeu-festival-tables
router.post('/', requireOrganisateur, async (req, res) => {
    try {
        const jeuFestivalId = parsePositiveInteger(req.body?.jeu_festival_id, 'jeu_festival_id')
        const tableId = parsePositiveInteger(req.body?.table_id, 'table_id')
        const { rows } = await pool.query(
            `INSERT INTO JeuFestivalTable (jeu_festival_id, table_id)
            VALUES ($1, $2)
            RETURNING ${FIELDS}`,
            [jeuFestivalId, tableId]
        )
        res.status(201).json({ message: 'Table associée au jeu', association: rows[0] })
    } catch (err: any) {
        if (err.message?.includes('champ')) {
            return res.status(400).json({ error: err.message })
        }
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Cette table est déjà associée au jeu' })
        }
        console.error('Erreur lors de l\'association du jeu à la table', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// DELETE /api/jeu-festival-tables
router.delete('/', requireOrganisateur, async (req, res) => {
    try {
        const jeuFestivalId = parsePositiveInteger(req.body?.jeu_festival_id, 'jeu_festival_id')
        const tableId = parsePositiveInteger(req.body?.table_id, 'table_id')
        const { rows } = await pool.query(
            `DELETE FROM JeuFestivalTable WHERE jeu_festival_id = $1 AND table_id = $2 RETURNING ${FIELDS}`,
            [jeuFestivalId, tableId]
        )
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Association non trouvée' })
        }
        res.json({ message: 'Association supprimée', association: rows[0] })
    } catch (err: any) {
        if (err.message?.includes('champ')) {
            return res.status(400).json({ error: err.message })
        }
        console.error('Erreur lors de la suppression de l\'association', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

export default router
