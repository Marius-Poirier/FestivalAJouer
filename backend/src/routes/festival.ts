import { Router } from 'express'
import pool from '../db/database.js'
import { requireSuperOrga } from '../middleware/auth-superOrga.js'

const router = Router()

// Applique le garde super organisateur à toutes les routes du module
router.use(requireSuperOrga)

const FESTIVAL_FIELDS = 'id, nom, date_creation, created_at, updated_at'

// --- Liste de tous les festivals ---
router.get('/', async (_req, res) => {
	try {
		const { rows } = await pool.query(
			`SELECT ${FESTIVAL_FIELDS} FROM Festival ORDER BY created_at DESC`
		)
		res.json(rows)
	} catch (err) {
		console.error('Erreur lors de la récupération des festivals', err)
		res.status(500).json({ error: 'Erreur serveur' })
	}
})

// --- Récupération d'un festival par ID ---
router.get('/:id', async (req, res) => {
	const festivalId = Number.parseInt(req.params.id, 10)
	if (!Number.isInteger(festivalId)) {
		return res.status(400).json({ error: 'Identifiant de festival invalide' })
	}

	try {
		const { rows } = await pool.query(
			`SELECT ${FESTIVAL_FIELDS} FROM Festival WHERE id = $1`,
			[festivalId]
		)

		if (rows.length === 0) {
			return res.status(404).json({ error: 'Festival non trouvé' })
		}

		res.json(rows[0])
	} catch (err) {
		console.error(`Erreur lors de la récupération du festival ${festivalId}`, err)
		res.status(500).json({ error: 'Erreur serveur' })
	}
})

// --- Création d'un festival ---
router.post('/', async (req, res) => {
	const { nom } = req.body
	const trimmedName = typeof nom === 'string' ? nom.trim() : ''

	if (!trimmedName) {
		return res.status(400).json({ error: 'Le nom du festival est requis' })
	}

	try {
		const { rows } = await pool.query(
			`INSERT INTO Festival (nom) VALUES ($1)
			RETURNING ${FESTIVAL_FIELDS}`,
			[trimmedName]
		)

		res.status(201).json({ message: 'Festival créé', festival: rows[0] })
	} catch (err: any) {
		if (err.code === '23505') {
			return res.status(409).json({ error: 'Un festival avec ce nom existe déjà' })
		}

		console.error('Erreur lors de la création du festival', err)
		res.status(500).json({ error: 'Erreur serveur' })
	}
})

// --- Mise à jour d'un festival ---
router.put('/:id', async (req, res) => {
	const festivalId = Number.parseInt(req.params.id, 10)
	if (!Number.isInteger(festivalId)) {
		return res.status(400).json({ error: 'Identifiant de festival invalide' })
	}

	const { nom } = req.body
	const trimmedName = typeof nom === 'string' ? nom.trim() : ''

	if (!trimmedName) {
		return res.status(400).json({ error: 'Le nom du festival est requis' })
	}

	try {
		const { rows } = await pool.query(
			`UPDATE Festival
			SET nom = $1
			WHERE id = $2
			RETURNING ${FESTIVAL_FIELDS}`,
			[trimmedName, festivalId]
		)

		if (rows.length === 0) {
			return res.status(404).json({ error: 'Festival non trouvé' })
		}

		res.json({ message: 'Festival mis à jour', festival: rows[0] })
	} catch (err: any) {
		if (err.code === '23505') {
			return res.status(409).json({ error: 'Un festival avec ce nom existe déjà' })
		}

		console.error(`Erreur lors de la mise à jour du festival ${festivalId}`, err)
		res.status(500).json({ error: 'Erreur serveur' })
	}
})

// --- Suppression d'un festival ---
router.delete('/:id', async (req, res) => {
	const festivalId = Number.parseInt(req.params.id, 10)
	if (!Number.isInteger(festivalId)) {
		return res.status(400).json({ error: 'Identifiant de festival invalide' })
	}

	try {
		const { rows } = await pool.query(
			`DELETE FROM Festival WHERE id = $1 RETURNING id, nom`,
			[festivalId]
		)

		if (rows.length === 0) {
			return res.status(404).json({ error: 'Festival non trouvé' })
		}

		res.json({ message: 'Festival supprimé', festival: rows[0] })
	} catch (err) {
		console.error(`Erreur lors de la suppression du festival ${festivalId}`, err)
		res.status(500).json({ error: 'Erreur serveur' })
	}
})

export default router
