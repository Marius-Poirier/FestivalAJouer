-- ============================================
-- Base de données Festival de Jeux (PostgreSQL)
-- ============================================

-- Suppression des tables si elles existent (pour réinitialisation)
DROP TABLE IF EXISTS AuditLog CASCADE;
DROP TABLE IF EXISTS ContactEditeur CASCADE;
DROP TABLE IF EXISTS JeuFestivalTable CASCADE;
DROP TABLE IF EXISTS JeuFestival CASCADE;
DROP TABLE IF EXISTS ReservationTable CASCADE;
DROP TABLE IF EXISTS Reservation CASCADE;
DROP TABLE IF EXISTS JeuMecanisme CASCADE; -- Nouvelle table
DROP TABLE IF EXISTS JeuAuteur CASCADE;
DROP TABLE IF EXISTS JeuEditeur CASCADE;
DROP TABLE IF EXISTS EditeurContact CASCADE;
DROP TABLE IF EXISTS Jeu CASCADE;
DROP TABLE IF EXISTS Mecanisme CASCADE; -- Nouvelle table
DROP TABLE IF EXISTS TypeJeu CASCADE; -- Nouvelle table
DROP TABLE IF EXISTS Personne CASCADE;
DROP TABLE IF EXISTS Editeur CASCADE;
DROP TABLE IF EXISTS Table_Jeu CASCADE;
DROP TABLE IF EXISTS ZoneDuPlan CASCADE;
DROP TABLE IF EXISTS ZoneTarifaire CASCADE;
DROP TABLE IF EXISTS Festival CASCADE;
DROP TABLE IF EXISTS Utilisateur CASCADE;

-- Suppression des types ENUM s'ils existent
DROP TYPE IF EXISTS role_utilisateur CASCADE;
DROP TYPE IF EXISTS statut_utilisateur CASCADE;
DROP TYPE IF EXISTS statut_table CASCADE;
DROP TYPE IF EXISTS statut_workflow_reservation CASCADE;

-- ============================================
-- CRÉATION DES TYPES ENUM
-- ============================================
CREATE TYPE role_utilisateur AS ENUM ('benevole', 'organisateur', 'super_organisateur', 'admin');
CREATE TYPE statut_utilisateur AS ENUM ('en_attente', 'valide', 'refuse');
CREATE TYPE statut_table AS ENUM ('libre', 'reserve', 'plein', 'hors_service');
CREATE TYPE statut_workflow_reservation AS ENUM (
    'pas_contacte',
    'contact_pris',
    'discussion_en_cours',
    'sera_absent',
    'considere_absent',
    'present',
    'facture',
    'paiement_recu',
    'paiement_en_retard'
);

-- ============================================
-- TABLE: Utilisateur
-- Gestion des comptes (organisateurs, admin)
-- ============================================
CREATE TABLE Utilisateur (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role role_utilisateur NOT NULL,
    statut statut_utilisateur NOT NULL DEFAULT 'en_attente',
    date_demande TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valide_par INTEGER NULL,
    email_bloque BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (valide_par) REFERENCES Utilisateur(id) ON DELETE SET NULL
);

CREATE INDEX idx_utilisateur_email ON Utilisateur(email);
CREATE INDEX idx_utilisateur_statut ON Utilisateur(statut);
CREATE INDEX idx_utilisateur_role ON Utilisateur(role);

-- ============================================
-- TABLE: Festival
-- Représente un festival de jeux
-- ============================================
CREATE TABLE Festival (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    lieu VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_festival_nom ON Festival(nom);

-- ============================================
-- TABLE: ZoneTarifaire
-- Zones avec tarification différente
-- ============================================
CREATE TABLE ZoneTarifaire (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER NOT NULL,
    nom VARCHAR(255) NOT NULL,
    nombre_tables_total INTEGER NOT NULL,
    prix_table DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (festival_id) REFERENCES Festival(id) ON DELETE CASCADE,
    UNIQUE (festival_id, nom)
);

CREATE INDEX idx_zonetarifaire_festival ON ZoneTarifaire(festival_id);

-- ============================================
-- TABLE: ZoneDuPlan
-- Zones géographiques du festival
-- ============================================
CREATE TABLE ZoneDuPlan (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER NOT NULL,
    nom VARCHAR(255) NOT NULL,
    nombre_tables INTEGER NOT NULL,
    zone_tarifaire_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (festival_id) REFERENCES Festival(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_tarifaire_id) REFERENCES ZoneTarifaire(id) ON DELETE RESTRICT,
    UNIQUE (festival_id, nom)
);

CREATE INDEX idx_zoneduplan_festival ON ZoneDuPlan(festival_id);
CREATE INDEX idx_zoneduplan_zone_tarifaire ON ZoneDuPlan(zone_tarifaire_id);

-- ============================================
-- TABLE: Table_Jeu
-- Tables physiques du festival
-- ============================================
CREATE TABLE Table_Jeu (
    id SERIAL PRIMARY KEY,
    zone_du_plan_id INTEGER NOT NULL,
    zone_tarifaire_id INTEGER NOT NULL,
    capacite_jeux INTEGER NOT NULL DEFAULT 2,
    nb_jeux_actuels INTEGER NOT NULL DEFAULT 0,
    statut statut_table NOT NULL DEFAULT 'libre',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_du_plan_id) REFERENCES ZoneDuPlan(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_tarifaire_id) REFERENCES ZoneTarifaire(id) ON DELETE RESTRICT
);

CREATE INDEX idx_tablejeu_zone_plan ON Table_Jeu(zone_du_plan_id);
CREATE INDEX idx_tablejeu_zone_tarifaire ON Table_Jeu(zone_tarifaire_id);
CREATE INDEX idx_tablejeu_statut ON Table_Jeu(statut);

-- ============================================
-- TABLE: Editeur
-- Éditeurs de jeux
-- ============================================
CREATE TABLE Editeur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_editeur_nom ON Editeur(nom);

-- ============================================
-- TABLE: Personne
-- Contacts, auteurs, etc.
-- ============================================
CREATE TABLE Personne (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NULL,
    fonction VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_personne_telephone ON Personne(telephone);
CREATE INDEX idx_personne_nom_prenom ON Personne(nom, prenom);

-- ============================================
-- TABLE: EditeurContact
-- Relation N-N entre Éditeur et Personne (contacts)
-- ============================================
CREATE TABLE EditeurContact (
    editeur_id INTEGER NOT NULL,
    personne_id INTEGER NOT NULL,
    PRIMARY KEY (editeur_id, personne_id),
    FOREIGN KEY (editeur_id) REFERENCES Editeur(id) ON DELETE CASCADE,
    FOREIGN KEY (personne_id) REFERENCES Personne(id) ON DELETE CASCADE
);

CREATE INDEX idx_editeurcontact_editeur ON EditeurContact(editeur_id);
CREATE INDEX idx_editeurcontact_personne ON EditeurContact(personne_id);

CREATE TABLE TypeJeu (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Mecanisme (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Jeu (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type_jeu_id INTEGER NULL, -- Ajouté pour le CSV typeJeu
    nb_joueurs_min INTEGER NULL,
    nb_joueurs_max INTEGER NULL,
    duree_minutes INTEGER NULL,
    age_min INTEGER NULL,
    age_max INTEGER NULL,
    theme VARCHAR(255) NULL, -- Ajouté
    description TEXT NULL,
    lien_regles VARCHAR(500) NULL,
    url_image VARCHAR(500) NULL, -- Ajouté
    url_video VARCHAR(500) NULL, -- Ajouté
    prototype BOOLEAN DEFAULT FALSE, -- Ajouté
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_jeu_id) REFERENCES TypeJeu(id) ON DELETE SET NULL
);

CREATE INDEX idx_jeu_nom ON Jeu(nom);
CREATE INDEX idx_jeu_type ON Jeu(type_jeu_id);

-- ============================================
-- TABLE: JeuMecanisme
-- Relation N-N entre Jeu et Mécanisme
-- ============================================
CREATE TABLE JeuMecanisme (
    jeu_id INTEGER NOT NULL,
    mecanisme_id INTEGER NOT NULL,
    PRIMARY KEY (jeu_id, mecanisme_id),
    FOREIGN KEY (jeu_id) REFERENCES Jeu(id) ON DELETE CASCADE,
    FOREIGN KEY (mecanisme_id) REFERENCES Mecanisme(id) ON DELETE CASCADE
);

CREATE INDEX idx_jeumecanisme_jeu ON JeuMecanisme(jeu_id);
CREATE INDEX idx_jeumecanisme_mecanisme ON JeuMecanisme(mecanisme_id);

-- ============================================
-- TABLE: JeuEditeur
-- Relation N-N entre Jeu et Éditeur (co-édition)
-- ============================================
CREATE TABLE JeuEditeur (
    jeu_id INTEGER NOT NULL,
    editeur_id INTEGER NOT NULL,
    PRIMARY KEY (jeu_id, editeur_id),
    FOREIGN KEY (jeu_id) REFERENCES Jeu(id) ON DELETE CASCADE,
    FOREIGN KEY (editeur_id) REFERENCES Editeur(id) ON DELETE CASCADE
);

CREATE INDEX idx_jeuediteur_jeu ON JeuEditeur(jeu_id);
CREATE INDEX idx_jeuediteur_editeur ON JeuEditeur(editeur_id);

-- ============================================
-- TABLE: JeuAuteur
-- Relation N-N entre Jeu et Personne (auteurs)
-- ============================================
CREATE TABLE JeuAuteur (
    jeu_id INTEGER NOT NULL,
    personne_id INTEGER NOT NULL,
    PRIMARY KEY (jeu_id, personne_id),
    FOREIGN KEY (jeu_id) REFERENCES Jeu(id) ON DELETE CASCADE,
    FOREIGN KEY (personne_id) REFERENCES Personne(id) ON DELETE CASCADE
);

CREATE INDEX idx_jeuauteur_jeu ON JeuAuteur(jeu_id);
CREATE INDEX idx_jeuauteur_personne ON JeuAuteur(personne_id);

-- ============================================
-- TABLE: Reservation
-- Réservations des éditeurs pour un festival
-- ============================================
CREATE TABLE Reservation (
    id SERIAL PRIMARY KEY,
    editeur_id INTEGER NOT NULL,
    festival_id INTEGER NOT NULL,
    statut_workflow statut_workflow_reservation NOT NULL DEFAULT 'pas_contacte',
    editeur_presente_jeux BOOLEAN DEFAULT FALSE,
    remise_pourcentage DECIMAL(5, 2) NULL,
    remise_montant DECIMAL(10, 2) NULL,
    prix_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    prix_final DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    commentaires_paiement TEXT NULL,
    paiement_relance BOOLEAN DEFAULT FALSE,
    date_facture TIMESTAMP NULL,
    date_paiement TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER NULL,
    FOREIGN KEY (editeur_id) REFERENCES Editeur(id) ON DELETE CASCADE,
    FOREIGN KEY (festival_id) REFERENCES Festival(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES Utilisateur(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES Utilisateur(id) ON DELETE SET NULL,
    UNIQUE (editeur_id, festival_id)
);

CREATE INDEX idx_reservation_editeur ON Reservation(editeur_id);
CREATE INDEX idx_reservation_festival ON Reservation(festival_id);
CREATE INDEX idx_reservation_statut ON Reservation(statut_workflow);

-- ============================================
-- TABLE: ReservationTable
-- Attribution des tables aux réservations
-- ============================================
CREATE TABLE ReservationTable (
    reservation_id INTEGER NOT NULL,
    table_id INTEGER NOT NULL,
    date_attribution TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attribue_par INTEGER NULL,
    PRIMARY KEY (reservation_id, table_id),
    FOREIGN KEY (reservation_id) REFERENCES Reservation(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES Table_Jeu(id) ON DELETE CASCADE,
    FOREIGN KEY (attribue_par) REFERENCES Utilisateur(id) ON DELETE SET NULL
);

CREATE INDEX idx_reservationtable_reservation ON ReservationTable(reservation_id);
CREATE INDEX idx_reservationtable_table ON ReservationTable(table_id);

-- ============================================
-- TABLE: JeuFestival
-- Jeux présents dans une réservation pour un festival
-- ============================================
CREATE TABLE JeuFestival (
    id SERIAL PRIMARY KEY,
    jeu_id INTEGER NOT NULL,
    reservation_id INTEGER NOT NULL,
    festival_id INTEGER NOT NULL,
    dans_liste_demandee BOOLEAN DEFAULT FALSE,
    dans_liste_obtenue BOOLEAN DEFAULT FALSE,
    jeux_recu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jeu_id) REFERENCES Jeu(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES Reservation(id) ON DELETE CASCADE,
    FOREIGN KEY (festival_id) REFERENCES Festival(id) ON DELETE CASCADE
);

CREATE INDEX idx_jeufestival_jeu ON JeuFestival(jeu_id);
CREATE INDEX idx_jeufestival_reservation ON JeuFestival(reservation_id);
CREATE INDEX idx_jeufestival_festival ON JeuFestival(festival_id);

-- ============================================
-- TABLE: JeuFestivalTable
-- Attribution des jeux aux tables
-- ============================================
CREATE TABLE JeuFestivalTable (
    jeu_festival_id INTEGER NOT NULL,
    table_id INTEGER NOT NULL,
    PRIMARY KEY (jeu_festival_id, table_id),
    FOREIGN KEY (jeu_festival_id) REFERENCES JeuFestival(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES Table_Jeu(id) ON DELETE CASCADE
);

CREATE INDEX idx_jeufestivaltable_jeu_festival ON JeuFestivalTable(jeu_festival_id);
CREATE INDEX idx_jeufestivaltable_table ON JeuFestivalTable(table_id);

-- ============================================
-- TABLE: ContactEditeur
-- Historique des contacts avec les éditeurs
-- ============================================
CREATE TABLE ContactEditeur (
    id SERIAL PRIMARY KEY,
    editeur_id INTEGER NOT NULL,
    festival_id INTEGER NOT NULL,
    utilisateur_id INTEGER NOT NULL,
    date_contact TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    FOREIGN KEY (editeur_id) REFERENCES Editeur(id) ON DELETE CASCADE,
    FOREIGN KEY (festival_id) REFERENCES Festival(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

CREATE INDEX idx_contactediteur_editeur_festival ON ContactEditeur(editeur_id, festival_id);
CREATE INDEX idx_contactediteur_date ON ContactEditeur(date_contact);

-- ============================================
-- TABLE: AuditLog
-- Journal d'audit pour tracer les actions importantes
-- ============================================
CREATE TABLE AuditLog (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NULL,
    action VARCHAR(255) NOT NULL,
    entite_type VARCHAR(100) NOT NULL,
    entite_id INTEGER NOT NULL,
    date_action TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE SET NULL
);

CREATE INDEX idx_auditlog_utilisateur ON AuditLog(utilisateur_id);
CREATE INDEX idx_auditlog_entite ON AuditLog(entite_type, entite_id);
CREATE INDEX idx_auditlog_date ON AuditLog(date_action);

-- ============================================
-- FONCTION: Mise à jour automatique de updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application du trigger updated_at sur toutes les tables concernées
CREATE TRIGGER trg_utilisateur_updated_at BEFORE UPDATE ON Utilisateur
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_festival_updated_at BEFORE UPDATE ON Festival
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_zonetarifaire_updated_at BEFORE UPDATE ON ZoneTarifaire
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_zoneduplan_updated_at BEFORE UPDATE ON ZoneDuPlan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_tablejeu_updated_at BEFORE UPDATE ON Table_Jeu
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_editeur_updated_at BEFORE UPDATE ON Editeur
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_personne_updated_at BEFORE UPDATE ON Personne
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_typejeu_updated_at BEFORE UPDATE ON TypeJeu
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mecanisme_updated_at BEFORE UPDATE ON Mecanisme
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_jeu_updated_at BEFORE UPDATE ON Jeu
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reservation_updated_at BEFORE UPDATE ON Reservation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_jeufestival_updated_at BEFORE UPDATE ON JeuFestival
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Mise à jour du nombre de jeux sur une table
-- ============================================
CREATE OR REPLACE FUNCTION trg_update_table_jeux_count_func()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le compteur de jeux
    UPDATE Table_Jeu 
    SET nb_jeux_actuels = (
        SELECT COUNT(DISTINCT jeu_festival_id) 
        FROM JeuFestivalTable 
        WHERE table_id = NEW.table_id
    )
    WHERE id = NEW.table_id;
    
    -- Marquer la table comme pleine si capacité atteinte
    UPDATE Table_Jeu 
    SET statut = 'plein'
    WHERE id = NEW.table_id 
    AND nb_jeux_actuels >= capacite_jeux
    AND statut != 'hors_service';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_table_jeux_count 
AFTER INSERT ON JeuFestivalTable
FOR EACH ROW 
EXECUTE FUNCTION trg_update_table_jeux_count_func();

-- ============================================
-- TRIGGER: Recalcul du prix lors de l'attribution de tables
-- ============================================
CREATE OR REPLACE FUNCTION trg_recalcul_prix_reservation_func()
RETURNS TRIGGER AS $$
DECLARE
    v_prix_total DECIMAL(10, 2);
    v_remise_pct DECIMAL(5, 2);
    v_remise_mt DECIMAL(10, 2);
    v_prix_final DECIMAL(10, 2);
BEGIN
    -- Calculer le prix total
    SELECT COALESCE(SUM(zt.prix_table), 0)
    INTO v_prix_total
    FROM ReservationTable rt
    JOIN Table_Jeu t ON t.id = rt.table_id
    JOIN ZoneTarifaire zt ON zt.id = t.zone_tarifaire_id
    WHERE rt.reservation_id = NEW.reservation_id;
    
    -- Récupérer les remises
    SELECT remise_pourcentage, remise_montant
    INTO v_remise_pct, v_remise_mt
    FROM Reservation
    WHERE id = NEW.reservation_id;
    
    -- Calculer le prix final
    v_prix_final := v_prix_total;
    
    IF v_remise_pct IS NOT NULL THEN
        v_prix_final := v_prix_final * (1 - v_remise_pct / 100);
    END IF;
    
    IF v_remise_mt IS NOT NULL THEN
        v_prix_final := v_prix_final - v_remise_mt;
    END IF;
    
    -- Mise à jour de la réservation
    UPDATE Reservation
    SET prix_total = v_prix_total,
        prix_final = v_prix_final
    WHERE id = NEW.reservation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalcul_prix_reservation 
AFTER INSERT ON ReservationTable
FOR EACH ROW 
EXECUTE FUNCTION trg_recalcul_prix_reservation_func();

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue: Tables disponibles par zone tarifaire
CREATE OR REPLACE VIEW v_tables_disponibles_par_zone AS
SELECT 
    zt.id AS zone_tarifaire_id,
    zt.festival_id,
    zt.nom AS zone_tarifaire_nom,
    zt.nombre_tables_total,
    COUNT(CASE WHEN t.statut = 'libre' THEN 1 END) AS tables_libres,
    COUNT(CASE WHEN t.statut = 'reserve' THEN 1 END) AS tables_reservees,
    COUNT(CASE WHEN t.statut = 'plein' THEN 1 END) AS tables_pleines
FROM ZoneTarifaire zt
LEFT JOIN Table_Jeu t ON t.zone_tarifaire_id = zt.id
GROUP BY zt.id, zt.festival_id, zt.nom, zt.nombre_tables_total;

-- Vue: Résumé des réservations par festival
CREATE OR REPLACE VIEW v_reservations_festival AS
SELECT 
    f.id AS festival_id,
    f.nom AS festival_nom,
    e.id AS editeur_id,
    e.nom AS editeur_nom,
    r.statut_workflow,
    COUNT(DISTINCT rt.table_id) AS nombre_tables,
    r.prix_total,
    r.prix_final,
    (SELECT MAX(ce.date_contact) 
     FROM ContactEditeur ce 
     WHERE ce.editeur_id = e.id AND ce.festival_id = f.id) AS derniere_date_contact
FROM Festival f
CROSS JOIN Editeur e
LEFT JOIN Reservation r ON r.festival_id = f.id AND r.editeur_id = e.id
LEFT JOIN ReservationTable rt ON rt.reservation_id = r.id
GROUP BY f.id, f.nom, e.id, e.nom, r.statut_workflow, r.prix_total, r.prix_final;

-- Vue: Jeux par zone du plan (MISE À JOUR)
CREATE OR REPLACE VIEW v_jeux_par_zone_plan AS
SELECT 
    zp.id AS zone_plan_id,
    zp.nom AS zone_plan_nom,
    zp.festival_id,
    j.id AS jeu_id,
    j.nom AS jeu_nom,
    tj.nom AS type_jeu, -- Ajouté
    e.nom AS editeur_nom,
    STRING_AGG(DISTINCT p.nom, ', ' ORDER BY p.nom) AS auteurs,
    STRING_AGG(DISTINCT m.nom, ', ' ORDER BY m.nom) AS mecanismes, -- Ajouté
    COUNT(DISTINCT jft.table_id) AS nombre_tables
FROM ZoneDuPlan zp
LEFT JOIN Table_Jeu t ON t.zone_du_plan_id = zp.id
LEFT JOIN JeuFestivalTable jft ON jft.table_id = t.id
LEFT JOIN JeuFestival jf ON jf.id = jft.jeu_festival_id
LEFT JOIN Jeu j ON j.id = jf.jeu_id
LEFT JOIN TypeJeu tj ON j.type_jeu_id = tj.id -- Ajouté
LEFT JOIN JeuEditeur je ON je.jeu_id = j.id
LEFT JOIN Editeur e ON e.id = je.editeur_id
LEFT JOIN JeuAuteur ja ON ja.jeu_id = j.id
LEFT JOIN Personne p ON p.id = ja.personne_id
LEFT JOIN JeuMecanisme jm ON jm.jeu_id = j.id -- Ajouté
LEFT JOIN Mecanisme m ON m.id = jm.mecanisme_id -- Ajouté
GROUP BY zp.id, zp.nom, zp.festival_id, j.id, j.nom, tj.nom, e.nom;

-- ============================================
-- DONNÉES D'EXEMPLE
-- ============================================

INSERT INTO Festival (nom, date_debut, date_fin, lieu)
VALUES ('Festival du Jeu 2025', '2025-05-01', '2025-05-03', 'Parc des Expositions, Nantes')
ON CONFLICT (nom) DO NOTHING;

INSERT INTO ZoneTarifaire (festival_id, nom, nombre_tables_total, prix_table)
SELECT 1, 'Zone Premium', 50, 200.00
WHERE EXISTS (SELECT 1 FROM Festival WHERE id = 1)
ON CONFLICT (festival_id, nom) DO NOTHING;

INSERT INTO ZoneDuPlan (festival_id, nom, nombre_tables, zone_tarifaire_id)
SELECT 1, 'Hall Principal', 50, 1
WHERE EXISTS (SELECT 1 FROM Festival WHERE id = 1)
  AND EXISTS (SELECT 1 FROM ZoneTarifaire WHERE id = 1)
ON CONFLICT (festival_id, nom) DO NOTHING;

INSERT INTO Table_Jeu (zone_du_plan_id, zone_tarifaire_id, capacite_jeux, statut)
SELECT 1, 1, 2, 'libre'
FROM generate_series(1, 5)
WHERE EXISTS (SELECT 1 FROM ZoneDuPlan WHERE id = 1)
  AND EXISTS (SELECT 1 FROM ZoneTarifaire WHERE id = 1);