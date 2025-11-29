import { Router } from 'express'
import pool from '../db/database.js'
import { requireOrganisateur } from '../middleware/auth-organisateur.js'
import { parsePositiveInteger } from '../utils/validation.js'

const router = Router()
const FIELDS = `id, jeu_id, reservation_id, festival_id, dans_liste_demandee, dans_liste_obtenue, jeux_recu, created_at, updated_at`

router.get('/', async (req, res) => {
    try {
        const params: unknown[] = []
        const clauses: string[] = []
        if (req.query.festivalId) {
            const id = Number.parseInt(String(req.query.festivalId), 10)
            if (!Number.isInteger(id)) {
                return res.status(400).json({ error: 'festivalId invalide' })
            }
            params.push(id)
            clauses.push(`festival_id = $${params.length}`)
        }
        if (req.query.reservationId) {
            const id = Number.parseInt(String(req.query.reservationId), 10)
            if (!Number.isInteger(id)) {
                return res.status(400).json({ error: 'reservationId invalide' })
            }
            params.push(id)
            clauses.push(`reservation_id = $${params.length}`)
        }
        const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
        const { rows } = await pool.query(
            `SELECT ${FIELDS} FROM JeuFestival ${whereClause} ORDER BY updated_at DESC`,
            params
        )
        res.json(rows)
    } catch (err) {
        console.error('Erreur lors de la récupération des jeux festival', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

router.post('/', requireOrganisateur, async (req, res) => {
    try {
        const jeuId = parsePositiveInteger(req.body?.jeu_id, 'jeu_id')
        const reservationId = parsePositiveInteger(req.body?.reservation_id, 'reservation_id')
        const festivalId = parsePositiveInteger(req.body?.festival_id, 'festival_id')
        const dansListeDemandee = Boolean(req.body?.dans_liste_demandee)
        const dansListeObtenue = Boolean(req.body?.dans_liste_obtenue)
        const jeuxRecu = Boolean(req.body?.jeux_recu)

        const { rows } = await pool.query(
            `INSERT INTO JeuFestival (jeu_id, reservation_id, festival_id, dans_liste_demandee, dans_liste_obtenue, jeux_recu)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING ${FIELDS}`,
            [jeuId, reservationId, festivalId, dansListeDemandee, dansListeObtenue, jeuxRecu]
        )
        res.status(201).json({ message: 'Jeu ajouté au festival', jeuFestival: rows[0] })
    } catch (err: any) {
        if (err.message?.includes('champ')) {
            return res.status(400).json({ error: err.message })
        }
        console.error('Erreur lors de l\'ajout du jeu festival', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

router.put('/:id', requireOrganisateur, async (req, res) => {
    const recordId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(recordId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }
    try {
        const dansListeDemandee = req.body?.dans_liste_demandee !== undefined ? Boolean(req.body?.dans_liste_demandee) : undefined
        const dansListeObtenue = req.body?.dans_liste_obtenue !== undefined ? Boolean(req.body?.dans_liste_obtenue) : undefined
        const jeuxRecu = req.body?.jeux_recu !== undefined ? Boolean(req.body?.jeux_recu) : undefined

        const { rows } = await pool.query(
            `UPDATE JeuFestival
            SET dans_liste_demandee = COALESCE($1, dans_liste_demandee),
                dans_liste_obtenue = COALESCE($2, dans_liste_obtenue),
                jeux_recu = COALESCE($3, jeux_recu)
            WHERE id = $4
            RETURNING ${FIELDS}`,
            [dansListeDemandee, dansListeObtenue, jeuxRecu, recordId]
        )
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Jeu festival non trouvé' })
        }
        res.json({ message: 'Jeu festival mis à jour', jeuFestival: rows[0] })
    } catch (err) {
        console.error(`Erreur lors de la mise à jour du jeu festival ${recordId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

router.delete('/:id', requireOrganisateur, async (req, res) => {
    const recordId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(recordId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }
    try {
        const { rows } = await pool.query(
            `DELETE FROM JeuFestival WHERE id = $1 RETURNING id`,
            [recordId]
        )
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Jeu festival non trouvé' })
        }
        res.json({ message: 'Jeu festival supprimé', jeuFestival: rows[0] })
    } catch (err) {
        console.error(`Erreur lors de la suppression du jeu festival ${recordId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

export default router
