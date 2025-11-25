import { Router } from 'express'
import pool from '../db/database.js'
import bcrypt from 'bcryptjs'

import { requireAdmin } from '../middleware/auth-admin.js'

const router = Router()

// Création d'un utilisateur avec rôle spécifique (réservée aux admins)
router.post('/', requireAdmin, async (req, res) => {
    const { email, password, role } = req.body
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' })
    }
    
    // Validation du rôle
    const validRoles = ['benevole', 'organisateur', 'super_organisateur', 'admin']
    const userRole = role || 'benevole'
    
    if (!validRoles.includes(userRole)) {
        return res.status(400).json({ 
            error: 'Rôle invalide. Rôles autorisés: benevole, organisateur, super_organisateur, admin' 
        })
    }
    
    try {
        const hash = await bcrypt.hash(password, 10)
        const { rows } = await pool.query(
            `INSERT INTO Utilisateur (email, password_hash, role, statut, valide_par)
            VALUES ($1, $2, $3, 'valide', $4) 
            RETURNING id, email, role, statut`,
            [email, hash, userRole, req.user?.id]
        );
        res.status(201).json({ message: 'Utilisateur créé', user: rows[0] })
    } catch (err: any) {
        if (err.code === '23505') {
            res.status(409).json({ error: 'Email déjà existant' })
        } else {
            console.error(err);
            res.status(500).json({ error: 'Erreur serveur' })
        }
    }
})

// Récupération du profil utilisateur connecté
router.get('/me', async (req, res) => {
    const user = req.user
    const { rows } = await pool.query(
        'SELECT id, email, role, statut, date_demande, email_bloque, created_at FROM Utilisateur WHERE id=$1',
        [user?.id]
    )
    res.json(rows[0]);
})

// Liste de toutes les demandes en attente (réservée aux admins)
router.get('/pending', requireAdmin, async (_req, res) => {
    const { rows } = await pool.query(
        `SELECT id, email, role, statut, date_demande, created_at 
        FROM Utilisateur 
        WHERE statut = 'en_attente' 
        ORDER BY date_demande ASC`
    )
    res.json(rows)
})

// Liste de tous les utilisateurs (réservée aux admins)
router.get('/', requireAdmin, async (_req, res) => {
    const { rows } = await pool.query(
        `SELECT id, email, role, statut, date_demande, email_bloque, created_at 
        FROM Utilisateur 
        ORDER BY id`
    )
    res.json(rows)
})

// Valider une demande de compte (réservée aux admins)
router.patch('/:id/validate', requireAdmin, async (req, res) => {
    const { id } = req.params
    const { role } = req.body
    
    // Validation du rôle
    const validRoles = ['benevole', 'organisateur', 'super_organisateur', 'admin']
    const userRole = role || 'benevole'
    
    if (!validRoles.includes(userRole)) {
        return res.status(400).json({ 
            error: 'Rôle invalide. Rôles autorisés: benevole, organisateur, super_organisateur, admin' 
        })
    }
    
    try {
        const { rows } = await pool.query(
            `UPDATE Utilisateur 
            SET statut = 'valide', role = $1, valide_par = $2 
            WHERE id = $3 AND statut = 'en_attente'
            RETURNING id, email, role, statut`,
            [userRole, req.user?.id, id]
        )
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé ou déjà traité' })
        }
        
        res.json({ message: 'Compte validé', user: rows[0] })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// Refuser une demande de compte (réservée aux admins)
router.patch('/:id/reject', requireAdmin, async (req, res) => {
    const { id } = req.params
    
    try {
        const { rows } = await pool.query(
            `UPDATE Utilisateur 
            SET statut = 'refuse', valide_par = $1 
            WHERE id = $2 AND statut = 'en_attente'
            RETURNING id, email, role, statut`,
            [req.user?.id, id]
        )
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé ou déjà traité' })
        }
        
        res.json({ message: 'Compte refusé', user: rows[0] })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// Bloquer/débloquer un email (réservée aux admins)
router.patch('/:id/block', requireAdmin, async (req, res) => {
    const { id } = req.params
    const { blocked } = req.body
    
    if (typeof blocked !== 'boolean') {
        return res.status(400).json({ error: 'Le paramètre "blocked" doit être un booléen' })
    }
    
    try {
        const { rows } = await pool.query(
            `UPDATE Utilisateur 
            SET email_bloque = $1 
            WHERE id = $2
            RETURNING id, email, role, statut, email_bloque`,
            [blocked, id]
        )
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' })
        }
        
        res.json({ 
            message: blocked ? 'Email bloqué' : 'Email débloqué', 
            user: rows[0] 
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

// Modifier le rôle d'un user (réservée aux admins)
router.patch('/:id/role', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['benevole', 'organisateur', 'super_organisateur', 'admin'];

    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Rôle invalide' });
    }

    try {
        const { rows } = await pool.query(
            `UPDATE Utilisateur 
             SET role = $1
             WHERE id = $2
             RETURNING id, email, role, statut, email_bloque`,
            [role, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }

        res.json({ message: 'Rôle mis à jour', user: rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router