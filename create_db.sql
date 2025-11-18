-- ============================================
-- Base de données Festival de Jeux
-- ============================================

-- Suppression des tables si elles existent (pour réinitialisation)
DROP TABLE IF EXISTS AuditLog;
DROP TABLE IF EXISTS JeuFestivalTable;
DROP TABLE IF EXISTS JeuFestival;
DROP TABLE IF EXISTS ReservationTable;
DROP TABLE IF EXISTS Reservation;
DROP TABLE IF EXISTS ContactEditeur;
DROP TABLE IF EXISTS JeuAuteur;
DROP TABLE IF EXISTS JeuEditeur;
DROP TABLE IF EXISTS EditeurContact;
DROP TABLE IF EXISTS Jeu;
DROP TABLE IF EXISTS Personne;
DROP TABLE IF EXISTS Editeur;
DROP TABLE IF EXISTS Table_Jeu;
DROP TABLE IF EXISTS ZoneDuPlan;
DROP TABLE IF EXISTS ZoneTarifaire;
DROP TABLE IF EXISTS Festival;
DROP TABLE IF EXISTS Utilisateur;

-- ============================================
-- TABLE: Utilisateur
-- Gestion des comptes (organisateurs, admin)
-- ============================================
CREATE TABLE Utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('benevole', 'organisateur', 'super_organisateur', 'admin') NOT NULL,
    statut ENUM('en_attente', 'valide', 'refuse') NOT NULL DEFAULT 'en_attente',
    date_demande DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valide_par INT NULL,
    email_bloque BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (valide_par) REFERENCES Utilisateur(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_statut (statut),
    INDEX idx_role (role)
);

-- ============================================
-- TABLE: Festival
-- Représente un festival de jeux
-- ============================================
CREATE TABLE Festival (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nom (nom)
);

-- ============================================
-- TABLE: ZoneTarifaire
-- Zones avec tarification différente
-- ============================================
CREATE TABLE ZoneTarifaire (
    id INT AUTO_INCREMENT PRIMARY KEY,
    festival_id INT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    nombre_tables_total INT NOT NULL,
    prix_table DECIMAL(10, 2) NOT NULL,
    prix_m2 DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (festival_id) REFERENCES Festival(id) ON DELETE CASCADE,
    UNIQUE KEY unique_zone_festival (festival_id, nom),
    INDEX idx_festival (festival_id)
);

-- ============================================
-- TABLE: ZoneDuPlan
-- Zones géographiques du festival
-- ============================================
CREATE TABLE ZoneDuPlan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    festival_id INT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    nombre_tables INT NOT NULL,
    zone_tarifaire_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (festival_id) REFERENCES Festival(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_tarifaire_id) REFERENCES ZoneTarifaire(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_zone_plan_festival (festival_id, nom),
    INDEX idx_festival (festival_id),
    INDEX idx_zone_tarifaire (zone_tarifaire_id)
);

-- ============================================
-- TABLE: Table_Jeu
-- Tables physiques du festival
-- ============================================
CREATE TABLE Table_Jeu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_du_plan_id INT NOT NULL,
    zone_tarifaire_id INT NOT NULL,
    capacite_jeux INT NOT NULL DEFAULT 2,
    nb_jeux_actuels INT NOT NULL DEFAULT 0,
    statut ENUM('libre', 'reserve', 'plein', 'hors_service') NOT NULL DEFAULT 'libre',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_du_plan_id) REFERENCES ZoneDuPlan(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_tarifaire_id) REFERENCES ZoneTarifaire(id) ON DELETE RESTRICT,
    INDEX idx_zone_plan (zone_du_plan_id),
    INDEX idx_zone_tarifaire (zone_tarifaire_id),
    INDEX idx_statut (statut)
);

-- ============================================
-- TABLE: Editeur
-- Éditeurs de jeux
-- ============================================
CREATE TABLE Editeur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nom (nom)
);

-- ============================================
-- TABLE: Personne
-- Contacts, auteurs, etc.
-- ============================================
CREATE TABLE Personne (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NULL,
    fonction VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_telephone (telephone),
    INDEX idx_nom_prenom (nom, prenom)
);

-- ============================================
-- TABLE: EditeurContact
-- Relation N-N entre Éditeur et Personne (contacts)
-- ============================================
CREATE TABLE EditeurContact (
    editeur_id INT NOT NULL,
    personne_id INT NOT NULL,
    PRIMARY KEY (editeur_id, personne_id),
    FOREIGN KEY (editeur_id) REFERENCES Editeur(id) ON DELETE CASCADE,
    FOREIGN KEY (personne_id) REFERENCES Personne(id) ON DELETE CASCADE,
    INDEX idx_editeur (editeur_id),
    INDEX idx_personne (personne_id)
);

-- ============================================
-- TABLE: Jeu
-- Jeux de société
-- ============================================
CREATE TABLE Jeu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    nb_joueurs_min INT NULL,
    nb_joueurs_max INT NULL,
    duree_minutes INT NULL,
    age_min INT NULL,
    age_max INT NULL,
    description TEXT NULL,
    lien_regles VARCHAR(500) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nom (nom)
);

-- ============================================
-- TABLE: JeuEditeur
-- Relation N-N entre Jeu et Éditeur (co-édition)
-- ============================================
CREATE TABLE JeuEditeur (
    jeu_id INT NOT NULL,
    editeur_id INT NOT NULL,
    PRIMARY KEY (jeu_id, editeur_id),
    FOREIGN KEY (jeu_id) REFERENCES Jeu(id) ON DELETE CASCADE,
    FOREIGN KEY (editeur_id) REFERENCES Editeur(id) ON DELETE CASCADE,
    INDEX idx_jeu (jeu_id),
    INDEX idx_editeur (editeur_id)
);

-- ============================================
-- TABLE: JeuAuteur
-- Relation N-N entre Jeu et Personne (auteurs)
-- ============================================
CREATE TABLE JeuAuteur (
    jeu_id INT NOT NULL,
    personne_id INT NOT NULL,
    PRIMARY KEY (jeu_id, personne_id),
    FOREIGN KEY (jeu_id) REFERENCES Jeu(id) ON DELETE CASCADE,
    FOREIGN KEY (personne_id) REFERENCES Personne(id) ON DELETE CASCADE,
    INDEX idx_jeu (jeu_id),
    INDEX idx_personne (personne_id)
);

-- ============================================
-- TABLE: Reservation
-- Réservations des éditeurs pour un festival
-- ============================================
CREATE TABLE Reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    editeur_id INT NOT NULL,
    festival_id INT NOT NULL,
    statut_workflow ENUM(
        'pas_contacte',
        'contact_pris',
        'discussion_en_cours',
        'sera_absent',
        'considere_absent',
        'present',
        'facture',
        'paiement_recu',
        'paiement_en_retard'
    ) NOT NULL DEFAULT 'pas_contacte',
    editeur_presente_jeux BOOLEAN DEFAULT FALSE,
    remise_pourcentage DECIMAL(5, 2) NULL,
    remise_montant DECIMAL(10, 2) NULL,
    prix_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    prix_final DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    commentaires_paiement TEXT NULL,
    paiement_relance BOOLEAN DEFAULT FALSE,
    date_facture DATETIME NULL,
    date_paiement DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NULL,
    FOREIGN KEY (editeur_id) REFERENCES Editeur(id) ON DELETE CASCADE,
    FOREIGN KEY (festival_id) REFERENCES Festival(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES Utilisateur(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES Utilisateur(id) ON DELETE SET NULL,
    UNIQUE KEY unique_editeur_festival (editeur_id, festival_id),
    INDEX idx_editeur (editeur_id),
    INDEX idx_festival (festival_id),
    INDEX idx_statut (statut_workflow)
);

-- ============================================
-- TABLE: ReservationTable
-- Attribution des tables aux réservations
-- ============================================
CREATE TABLE ReservationTable (
    reservation_id INT NOT NULL,
    table_id INT NOT NULL,
    date_attribution DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attribue_par INT NULL,
    PRIMARY KEY (reservation_id, table_id),
    FOREIGN KEY (reservation_id) REFERENCES Reservation(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES Table_Jeu(id) ON DELETE CASCADE,
    FOREIGN KEY (attribue_par) REFERENCES Utilisateur(id) ON DELETE SET NULL,
    INDEX idx_reservation (reservation_id),
    INDEX idx_table (table_id)
);

-- ============================================
-- TABLE: JeuFestival
-- Jeux présents dans une réservation pour un festival
-- ============================================
CREATE TABLE JeuFestival (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jeu_id INT NOT NULL,
    reservation_id INT NOT NULL,
    festival_id INT NOT NULL,
    dans_liste_demandee BOOLEAN DEFAULT FALSE,
    dans_liste_obtenue BOOLEAN DEFAULT FALSE,
    jeux_recu BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jeu_id) REFERENCES Jeu(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES Reservation(id) ON DELETE CASCADE,
    FOREIGN KEY (festival_id) REFERENCES Festival(id) ON DELETE CASCADE,
    INDEX idx_jeu (jeu_id),
    INDEX idx_reservation (reservation_id),
    INDEX idx_festival (festival_id)
);

-- ============================================
-- TABLE: JeuFestivalTable
-- Attribution des jeux aux tables
-- ============================================
CREATE TABLE JeuFestivalTable (
    jeu_festival_id INT NOT NULL,
    table_id INT NOT NULL,
    PRIMARY KEY (jeu_festival_id, table_id),
    FOREIGN KEY (jeu_festival_id) REFERENCES JeuFestival(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES Table_Jeu(id) ON DELETE CASCADE,
    INDEX idx_jeu_festival (jeu_festival_id),
    INDEX idx_table (table_id)
);

-- ============================================
-- TABLE: ContactEditeur
-- Historique des contacts avec les éditeurs
-- ============================================
CREATE TABLE ContactEditeur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    editeur_id INT NOT NULL,
    festival_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    date_contact DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    FOREIGN KEY (editeur_id) REFERENCES Editeur(id) ON DELETE CASCADE,
    FOREIGN KEY (festival_id) REFERENCES Festival(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE CASCADE,
    INDEX idx_editeur_festival (editeur_id, festival_id),
    INDEX idx_date (date_contact)
);

-- ============================================
-- TABLE: AuditLog
-- Journal d'audit pour tracer les actions importantes
-- ============================================
CREATE TABLE AuditLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NULL,
    action VARCHAR(255) NOT NULL,
    entite_type VARCHAR(100) NOT NULL,
    entite_id INT NOT NULL,
    date_action DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE SET NULL,
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_entite (entite_type, entite_id),
    INDEX idx_date (date_action)
);

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue: Tables disponibles par zone tarifaire
CREATE VIEW v_tables_disponibles_par_zone AS
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
CREATE VIEW v_reservations_festival AS
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

-- Vue: Jeux par zone du plan
CREATE VIEW v_jeux_par_zone_plan AS
SELECT 
    zp.id AS zone_plan_id,
    zp.nom AS zone_plan_nom,
    zp.festival_id,
    j.id AS jeu_id,
    j.nom AS jeu_nom,
    e.nom AS editeur_nom,
    GROUP_CONCAT(DISTINCT p.nom ORDER BY p.nom SEPARATOR ', ') AS auteurs,
    COUNT(DISTINCT jft.table_id) AS nombre_tables
FROM ZoneDuPlan zp
LEFT JOIN Table_Jeu t ON t.zone_du_plan_id = zp.id
LEFT JOIN JeuFestivalTable jft ON jft.table_id = t.id
LEFT JOIN JeuFestival jf ON jf.id = jft.jeu_festival_id
LEFT JOIN Jeu j ON j.id = jf.jeu_id
LEFT JOIN JeuEditeur je ON je.jeu_id = j.id
LEFT JOIN Editeur e ON e.id = je.editeur_id
LEFT JOIN JeuAuteur ja ON ja.jeu_id = j.id
LEFT JOIN Personne p ON p.id = ja.personne_id
GROUP BY zp.id, zp.nom, zp.festival_id, j.id, j.nom, e.nom;

-- ============================================
-- TRIGGERS UTILES
-- ============================================

-- Trigger: Mise à jour du nombre de jeux sur une table
DELIMITER //
CREATE TRIGGER trg_update_table_jeux_count AFTER INSERT ON JeuFestivalTable
FOR EACH ROW
BEGIN
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
END//

DELIMITER ;

-- Trigger: Recalcul du prix lors de l'attribution de tables
DELIMITER //
CREATE TRIGGER trg_recalcul_prix_reservation AFTER INSERT ON ReservationTable
FOR EACH ROW
BEGIN
    DECLARE v_prix_total DECIMAL(10, 2);
    DECLARE v_remise_pct DECIMAL(5, 2);
    DECLARE v_remise_mt DECIMAL(10, 2);
    DECLARE v_prix_final DECIMAL(10, 2);
    
    -- Calculer le prix total
    SELECT SUM(zt.prix_table)
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
    SET v_prix_final = v_prix_total;
    
    IF v_remise_pct IS NOT NULL THEN
        SET v_prix_final = v_prix_final * (1 - v_remise_pct / 100);
    END IF;
    
    IF v_remise_mt IS NOT NULL THEN
        SET v_prix_final = v_prix_final - v_remise_mt;
    END IF;
    
    -- Mise à jour de la réservation
    UPDATE Reservation
    SET prix_total = v_prix_total,
        prix_final = v_prix_final
    WHERE id = NEW.reservation_id;
END//

DELIMITER ;

-- ============================================
-- DONNÉES D'EXEMPLE (optionnel)
-- ============================================

-- Utilisateur admin par défaut
INSERT INTO Utilisateur (email, password_hash, role, statut, valide_par)
VALUES ('admin@festival.com', '$2y$10$ExempleHashMotDePasseSecurise', 'admin', 'valide', NULL);

-- Festival exemple
INSERT INTO Festival (nom) VALUES ('Festival du Jeu 2025');

-- Zone tarifaire exemple
INSERT INTO ZoneTarifaire (festival_id, nom, nombre_tables_total, prix_table, prix_m2)
VALUES (1, 'Zone Premium', 50, 200.00, 44.44);

-- Zone du plan exemple
INSERT INTO ZoneDuPlan (festival_id, nom, nombre_tables, zone_tarifaire_id)
VALUES (1, 'Hall Principal', 50, 1);

-- Tables exemple
INSERT INTO Table_Jeu (zone_du_plan_id, zone_tarifaire_id, capacite_jeux, statut)
SELECT 1, 1, 2, 'libre' FROM 
(SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) AS numbers;