import type { Response, NextFunction } from 'express'

// --- Middleware d'autorisation pour les super organisateurs ---
export function requireSuperOrga( req: Express.Request, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== 'super_organisateur') {
        return res.status(403).json(
        { error: 'Accès réservé aux super organisateurs' }
        )
    }
    next()
}