import { computed, inject, Injectable, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '@env/environment'
import { catchError, finalize, of, tap } from 'rxjs'
import { UtilisateurDto } from '../../types/interfaces/entites/utilisateur-dto'
import { RoleUtilisateur } from '../../types/enum/role-utilisateur'
import { StatutUtilisateur } from '../../types/enum/statut-utilisateur'

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private readonly http = inject(HttpClient)
    // --- État interne (signaux) ---
    private readonly _currentUser = signal<UtilisateurDto | null>(null)
    private readonly _isLoading = signal(false)
    private readonly _error = signal<string | null>(null)
    private readonly _registerSuccess = signal(false);
    // --- État exposé (readonly, computed) ---
    readonly currentUser = this._currentUser.asReadonly()
    readonly isLoggedIn = computed(() => this._currentUser() != null)
    readonly isLoading = this._isLoading.asReadonly()
    readonly error = this._error.asReadonly()
    readonly registerSuccess = this._registerSuccess.asReadonly();
    readonly isAdmin = computed(() => {
        const user = this.currentUser();
        if (!user) return false;
        const role: any = user.role;
        if (!role) return false;
        if (typeof role === 'string') {
            return role.toLowerCase() === 'admin';
        }
        return role === RoleUtilisateur.ADMIN;
        });

    // --- Connexion ---
    login(email: string, password: string) {
        this._isLoading.set(true)
        this._error.set(null)
        this.http.post<{ user: UtilisateurDto }>(
                `${environment.apiUrl}/auth/login`,
                { email, password },
                { withCredentials: true }
        ).pipe(
            tap(res => {
            if (res?.user) {

                    // Normalisation rôle + statut
                    res.user.role = res.user.role.toUpperCase() as RoleUtilisateur;
                    res.user.statut_utilisateur = res.user.statut_utilisateur.toUpperCase() as StatutUtilisateur;

                    this._currentUser.set(res.user)
                    console.log(`Utilisateur connecté : ${JSON.stringify(res.user)}`)
                } else {
                    this._error.set('Identifiants invalides')
                    this._currentUser.set(null)
                }
            }),
            catchError((err) => {
                console.error('Erreur HTTP', err)
                if (err.status === 401) { this._error.set('Identifiants invalides')}
                else if (err.status === 0) {
                    this._error.set('Serveur injoignable (vérifiez HTTPS ou CORS)')
                } else { this._error.set(`Erreur serveur (${err.status})`) }
                this._currentUser.set(null)
                return of(null)
            }),
            finalize(() => this._isLoading.set(false))
        ).subscribe()  
    }

    // --- Déconnexion ---
    logout() {
        this._isLoading.set(true) ; this._error.set(null)
        this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
            .pipe(
                tap(() => { this._currentUser.set(null) }),
                catchError( err => {this._error.set('Erreur de déconnexion') ; return of(null)} ),
                finalize(() => this._isLoading.set(false))
            )
        .subscribe()
    }

    resetRegisterSuccess() {
        this._registerSuccess.set(false);
    }

    register(login: string, password: string) {
        this._isLoading.set(true);
        this._error.set(null);
        this._registerSuccess.set(false);

        this.http.post(
            `${environment.apiUrl}/auth/register`,
            { email: login, password },
            { withCredentials: true }
        ).pipe(
            tap(() => {
            this._registerSuccess.set(true);
            }),
            catchError(err => {
            console.error('Erreur register', err);
            if (err.status === 409) {
                this._error.set('Un compte avec cet email existe déjà');
            } else if (err.status === 400) {
                this._error.set('Email ou mot de passe invalide');
            } else {
                this._error.set('Erreur lors de la création du compte');
            }
            this._registerSuccess.set(false);
            return of(null);
            }),
            finalize(() => this._isLoading.set(false))
        ).subscribe();
    }
    
    // --- Vérifie la session actuelle (cookie httpOnly) ---
    whoami() {
        this._isLoading.set(true) ; this._error.set(null)
        this.http.get<UtilisateurDto>(`${environment.apiUrl}/users/me`, { withCredentials: true })
            .pipe(
                tap(res => { 
                    
                    if (!res) {
                        this._currentUser.set(null);
                        return;
                    }

                    // Normalisation rôle + statut
                    const normalized: UtilisateurDto = {
                        ...res,
                        role: res.role?.toUpperCase() as RoleUtilisateur,
                        statut_utilisateur: res.statut_utilisateur?.toUpperCase() as StatutUtilisateur
                    };

                    this._currentUser.set(normalized);
                }),
                catchError(err => {
                    console.error('whoami failed', err);
                    this._currentUser.set(null);
                    return of(null);
                }),
                finalize(() => this._isLoading.set(false))
            )
        .subscribe()
    }

    // --- Rafraîchissement pour l'interceptor ---
    refresh$() { 
        return this.http.post(`${environment.apiUrl}/auth/refresh`,{}, { withCredentials: true } )
        .pipe( catchError(() => of(null)) )
    }

    whoamiOnce(): Promise<void> {
        return new Promise(resolve => {
            this.http.get<any>(`${environment.apiUrl}/users/me`, {
            withCredentials: true
            })
            .pipe(
            tap(user => {
                this._currentUser.set(user ?? null);
            }),
            catchError(err => {
                this._currentUser.set(null);
                return of(null);
            }),
            finalize(() => resolve())
            )
            .subscribe();
        });
    }
}