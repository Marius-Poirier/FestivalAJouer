import pool from './database.js'
import bcrypt from 'bcryptjs'

export async function ensureAdmin() {
    const hash = await bcrypt.hash('admin', 10);
    await pool.query(
        `INSERT INTO Utilisateur (email, password_hash, role, statut, valide_par)
        VALUES ('admin@festival.com', $1, 'admin', 'valide', NULL)
        ON CONFLICT (email) DO NOTHING`,
        [hash]
    );
    console.log('Compte admin vérifié ou créé');
}