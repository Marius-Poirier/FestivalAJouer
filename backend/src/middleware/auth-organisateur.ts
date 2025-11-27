import type { Response, NextFunction } from 'express'

const ORGANISATEUR_ROLES = new Set(['organisateur', 'super_organisateur', 'admin'])

export function requireOrganisateur(req: Express.Request, res: Response, next: NextFunction) {
	if (!req.user || !ORGANISATEUR_ROLES.has(req.user.role)) {
		return res.status(403).json({ error: 'Accès réservé aux organisateurs' })
	}
	return next()
}