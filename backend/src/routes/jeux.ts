import { Router } from 'express'
import pool from '../db/database.js'
import { requireOrganisateur } from '../middleware/auth-organisateur.js'
import { sanitizeString, parsePositiveInteger, parseInteger } from '../utils/validation.js'

const router = Router()
const GAME_FIELDS = `id, nom, nb_joueurs_min, nb_joueurs_max, duree_minutes, age_min, age_max, description, lien_regles, created_at, updated_at`

router.get('/', async (_req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT ${GAME_FIELDS} FROM Jeu ORDER BY nom ASC`
        )
        res.json(rows)
    } catch (err) {
        console.error('Erreur lors de la récupération des jeux', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

router.get('/:id', async (req, res) => {
    const gameId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(gameId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }
    try {
        const { rows } = await pool.query(
            `SELECT ${GAME_FIELDS} FROM Jeu WHERE id = $1`,
            [gameId]
        )
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Jeu non trouvé' })
        }
        res.json(rows[0])
    } catch (err) {
        console.error(`Erreur lors de la récupération du jeu ${gameId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

router.post('/', requireOrganisateur, async (req, res) => {
    const nom = sanitizeString(req.body?.nom)
    if (!nom) {
        return res.status(400).json({ error: 'Le nom est requis' })
    }

    const payload = {
        nbMin: req.body?.nb_joueurs_min ? parseInteger(req.body?.nb_joueurs_min, 'nb_joueurs_min') : null,
        nbMax: req.body?.nb_joueurs_max ? parseInteger(req.body?.nb_joueurs_max, 'nb_joueurs_max') : null,
        duree: req.body?.duree_minutes ? parsePositiveInteger(req.body?.duree_minutes, 'duree_minutes') : null,
        ageMin: req.body?.age_min ? parseInteger(req.body?.age_min, 'age_min') : null,
        ageMax: req.body?.age_max ? parseInteger(req.body?.age_max, 'age_max') : null,
        description: sanitizeString(req.body?.description),
        lienRegles: sanitizeString(req.body?.lien_regles)
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO Jeu (nom, nb_joueurs_min, nb_joueurs_max, duree_minutes, age_min, age_max, description, lien_regles)
            VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, ''), NULLIF($8, ''))
            RETURNING ${GAME_FIELDS}`,
            [
                nom,
                payload.nbMin,
                payload.nbMax,
                payload.duree,
                payload.ageMin,
                payload.ageMax,
                payload.description,
                payload.lienRegles
            ]
        )
        res.status(201).json({ message: 'Jeu créé', jeu: rows[0] })
    } catch (err) {
        console.error('Erreur lors de la création du jeu', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

router.put('/:id', requireOrganisateur, async (req, res) => {
    const gameId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(gameId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }
    const nom = sanitizeString(req.body?.nom)
    if (!nom) {
        return res.status(400).json({ error: 'Le nom est requis' })
    }

    const payload = {
        nbMin: req.body?.nb_joueurs_min ? parseInteger(req.body?.nb_joueurs_min, 'nb_joueurs_min') : null,
        nbMax: req.body?.nb_joueurs_max ? parseInteger(req.body?.nb_joueurs_max, 'nb_joueurs_max') : null,
        duree: req.body?.duree_minutes ? parsePositiveInteger(req.body?.duree_minutes, 'duree_minutes') : null,
        ageMin: req.body?.age_min ? parseInteger(req.body?.age_min, 'age_min') : null,
        ageMax: req.body?.age_max ? parseInteger(req.body?.age_max, 'age_max') : null,
        description: sanitizeString(req.body?.description),
        lienRegles: sanitizeString(req.body?.lien_regles)
    }

    try {
        const { rows } = await pool.query(
            `UPDATE Jeu
            SET nom = $1,
                nb_joueurs_min = $2,
                nb_joueurs_max = $3,
                duree_minutes = $4,
                age_min = $5,
                age_max = $6,
                description = NULLIF($7, ''),
                lien_regles = NULLIF($8, '')
            WHERE id = $9
            RETURNING ${GAME_FIELDS}`,
            [
                nom,
                payload.nbMin,
                payload.nbMax,
                payload.duree,
                payload.ageMin,
                payload.ageMax,
                payload.description,
                payload.lienRegles,
                gameId
            ]
        )
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Jeu non trouvé' })
        }
        res.json({ message: 'Jeu mis à jour', jeu: rows[0] })
    } catch (err) {
        console.error(`Erreur lors de la mise à jour du jeu ${gameId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

router.delete('/:id', requireOrganisateur, async (req, res) => {
    const gameId = Number.parseInt(req.params.id, 10)
    if (!Number.isInteger(gameId)) {
        return res.status(400).json({ error: 'Identifiant invalide' })
    }
    try {
        const { rows } = await pool.query(
            `DELETE FROM Jeu WHERE id = $1 RETURNING id, nom`,
            [gameId]
        )
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Jeu non trouvé' })
        }
        res.json({ message: 'Jeu supprimé', jeu: rows[0] })
    } catch (err) {
        console.error(`Erreur lors de la suppression du jeu ${gameId}`, err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

export default router
