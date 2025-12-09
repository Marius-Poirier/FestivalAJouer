import { Router } from 'express'
import pool from '../db/database.js'
import { requireSuperOrga } from '../middleware/auth-superOrga.js'
import { parsePositiveInteger, parseInteger } from '../utils/validation.js'

const router = Router()
router.use(requireSuperOrga)

const TABLE_FIELDS = 'id, zone_du_plan_id, zone_tarifaire_id, capacite_jeux, nb_jeux_actuels, statut, created_at, updated_at'

// GET /api/tables
router.get('/', async (req, res) => {
    try {
        const params: unknown[] = []
        const clauses: string[] = []
        if (req.query.zoneDuPlanId) {
            const val = Number.parseInt(String(req.query.zoneDuPlanId), 10)
            if (!Number.isInteger(val)) {
                return res.status(400).json({ error: 'zoneDuPlanId doit être un entier' })
            }
            params.push(val)
            clauses.push(`zone_du_plan_id = $${params.length}`)
        }
        if (req.query.zoneTarifaireId) {
            const val = Number.parseInt(String(req.query.zoneTarifaireId), 10)
            if (!Number.isInteger(val)) {
                return res.status(400).json({ error: 'zoneTarifaireId doit être un entier' })
            }
            params.push(val)
            clauses.push(`zone_tarifaire_id = $${params.length}`)
        }
        const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
        const { rows } = await pool.query(
            `SELECT ${TABLE_FIELDS} FROM Table_Jeu ${whereClause} ORDER BY created_at DESC`,
            params
        )
        res.json(rows)
    } catch (err) {
        console.error('Erreur lors de la récupération des tables', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// GET /api/tables/:id
router.get('/:id', async (req, res) => {
    const tableId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(tableId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }
    try {
        const { rows } = await pool.query(
            `SELECT ${TABLE_FIELDS} FROM Table_Jeu WHERE id = $1`,
            [tableId]
        )
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Table non trouvée' })
        }
        res.json(rows[0])
    } catch (err) {
        console.error(`Erreur lors de la lecture de la table ${tableId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// POST /api/tables
router.post('/', async (req, res) => {
    try {
        const zoneDuPlanId = parsePositiveInteger(req.body?.zone_du_plan_id, 'zone_du_plan_id')
        const zoneTarifaireId = parsePositiveInteger(req.body?.zone_tarifaire_id, 'zone_tarifaire_id')
        const capacite = parsePositiveInteger(req.body?.capacite_jeux ?? 2, 'capacite_jeux')

        const { rows } = await pool.query(
            `INSERT INTO Table_Jeu (zone_du_plan_id, zone_tarifaire_id, capacite_jeux)
            VALUES ($1, $2, $3)
            RETURNING ${TABLE_FIELDS}`,
            [zoneDuPlanId, zoneTarifaireId, capacite]
        )
        res.status(201).json({ message: 'Table créée', table: rows[0] })
    } catch (err: any) {
        if (err.message?.startsWith('Le champ')) {
            return res.status(400).json({ error: err.message })
        }
        console.error('Erreur lors de la création de la table', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// PUT /api/tables/:id
router.put('/:id', async (req, res) => {
    const tableId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(tableId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }
    try {
        const zoneDuPlanId = parsePositiveInteger(req.body?.zone_du_plan_id, 'zone_du_plan_id')
        const zoneTarifaireId = parsePositiveInteger(req.body?.zone_tarifaire_id, 'zone_tarifaire_id')
        const capacite = parsePositiveInteger(req.body?.capacite_jeux, 'capacite_jeux')
        const statut = req.body?.statut

        if (statut && !['libre', 'reserve', 'plein', 'hors_service'].includes(statut)) {
            return res.status(400).json({ error: 'Statut de table invalide' })
        }

        const { rows } = await pool.query(
            `UPDATE Table_Jeu
            SET zone_du_plan_id = $1,
                zone_tarifaire_id = $2,
                capacite_jeux = $3,
                statut = COALESCE($4, statut)
            WHERE id = $5
            RETURNING ${TABLE_FIELDS}`,
            [zoneDuPlanId, zoneTarifaireId, capacite, statut, tableId]
        )

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Table non trouvée' })
        }

        res.json({ message: 'Table mise à jour', table: rows[0] })
    } catch (err: any) {
        if (err.message?.startsWith('Le champ')) {
            return res.status(400).json({ error: err.message })
        }
        console.error(`Erreur lors de la mise à jour de la table ${tableId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// DELETE /api/tables/:id
router.delete('/:id', async (req, res) => {
    const tableId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(tableId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }

    try {
        const { rows } = await pool.query(
            `DELETE FROM Table_Jeu WHERE id = $1 RETURNING id`,
            [tableId]
        )

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Table non trouvée' })
        }

        res.json({ message: 'Table supprimée', table: rows[0] })
    } catch (err) {
        console.error(`Erreur lors de la suppression de la table ${tableId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

export default router
