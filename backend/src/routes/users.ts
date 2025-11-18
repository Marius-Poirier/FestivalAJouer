import { Router } from 'express'
import pool from '../db/database.js'
import bcrypt from 'bcryptjs'

import { requireAdmin } from '../middleware/auth-admin.js'

const router = Router()

// Création d'un utilisateur (réservée aux admins)
router.post('/', requireAdmin, async (req, res) => {
    const { login, password, role } = req.body
    if (!login || !password) {
        return res.status(400).json({ error: 'Login et mot de passe requis' })
    }
    
    // Validation du rôle
    const validRoles = ['user', 'admin']
    const userRole = role || 'user'
    
    if (!validRoles.includes(userRole)) {
        return res.status(400).json({ error: 'Rôle invalide. Rôles autorisés: user, admin' })
    }
    
    try {
        const hash = await bcrypt.hash(password, 10)
        const { rows } = await pool.query(
            'INSERT INTO users (login, password_hash, role) VALUES ($1, $2, $3) RETURNING id, login, role',
            [login, hash, userRole]
        );
        res.status(201).json({ message: 'Utilisateur créé', user: rows[0] })
    } catch (err: any) {
        if (err.code === '23505') {
            res.status(409).json({ error: 'Login déjà existant' })
        } else {
            console.error(err);
            res.status(500).json({ error: 'Erreur serveur' })
        }
    }
})
// Récupération du profil utilisateur (authentifié)
router.get('/me', async (req, res) => {
    const user = req.user
    const { rows } = await pool.query(
        'SELECT id, login, role FROM users WHERE id=$1',
        [user?.id]
    )
    res.json(rows[0]);
})
// Liste de tous les utilisateurs (réservée aux admins)
router.get('/', requireAdmin, async (_req, res) => {
    const { rows } = await pool.query(
        'SELECT id, login, role FROM users ORDER BY id'
    )
    res.json(rows)
})
export default router