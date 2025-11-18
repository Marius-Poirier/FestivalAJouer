# Documentation - Base de données Festival de Jeux

## Vue d'ensemble

Cette base de données gère l'organisation de festivals de jeux de société, incluant la gestion des éditeurs, des réservations de tables, des jeux présentés, et le workflow complet de suivi.

## Architecture

### Principes clés
- **Multi-festival** : Les éditeurs et jeux sont partagés entre tous les festivals
- **Workflow de réservation** : Suivi détaillé de l'état de chaque réservation
- **Gestion des droits** : 4 niveaux d'utilisateurs (bénévole, organisateur, super-organisateur, admin)
- **Audit** : Traçabilité des actions importantes
- **Tarification flexible** : Plusieurs zones tarifaires par festival

---

## Tables principales

### 1. **Utilisateur**
Gestion des comptes organisateurs et administrateurs.

**Champs clés :**
- `role` : benevole | organisateur | super_organisateur | admin
- `statut` : en_attente | valide | refuse
- `email_bloque` : Permet de bloquer une adresse mail pour éviter le spam

**Hiérarchie des droits :**
- **Bénévole** : Lecture seule
- **Organisateur** : Création/modification jeux, éditeurs, affectation jeux aux zones
- **Super-organisateur** : Création festivals, zones du plan, zones tarifaires
- **Admin** : Gestion des comptes utilisateurs

---

### 2. **Festival**
Représente un festival avec un nom unique.

**Relations :**
- Possède plusieurs `ZoneTarifaire`
- Possède plusieurs `ZoneDuPlan`
- A plusieurs `Reservation`

---

### 3. **ZoneTarifaire**
Définit un tarif applicable à des tables.

**Champs clés :**
- `prix_table` : Prix d'une table dans cette zone
- `prix_m2` : Prix au m² (par défaut prix_table / 4.5)
- `nombre_tables_total` : Nombre total de tables avec ce tarif

**Usage :**
Une zone tarifaire peut être appliquée à plusieurs zones du plan.

---

### 4. **ZoneDuPlan**
Zone géographique physique du festival.

**Champs clés :**
- `nom` : Nom de la zone (ex: "Hall Principal")
- `nombre_tables` : Nombre de tables dans cette zone
- `zone_tarifaire_id` : Tarif appliqué par défaut

**Note :** Une zone du plan peut contenir des tables de différentes zones tarifaires.

---

### 5. **Table_Jeu**
Table physique sur le festival.

**Champs clés :**
- `zone_du_plan_id` : Position géographique
- `zone_tarifaire_id` : Tarif de cette table
- `capacite_jeux` : Nombre max de jeux sur cette table (défaut: 2)
- `nb_jeux_actuels` : Nombre actuel de jeux (calculé automatiquement)
- `statut` : libre | reserve | plein | hors_service

**Workflow :**
1. Créée par super-organisateur
2. Réservée par attribution à une réservation
3. Remplie par affectation de jeux
4. Marquée "plein" automatiquement si capacité atteinte

---

### 6. **Editeur**
Éditeur de jeux de société.

**Relations :**
- Édite plusieurs `Jeu` (via JeuEditeur - many-to-many)
- A plusieurs contacts `Personne` (via EditeurContact)
- Fait plusieurs `Reservation` pour différents festivals

**Note :** Un éditeur existe une seule fois et est réutilisable pour tous les festivals.

---

### 7. **Personne**
Représente contacts, auteurs, etc.

**Champs clés :**
- `telephone` : Clé unique (identifiant principal)
- `fonction` : Rôle de la personne (optionnel)

**Usages multiples :**
- Contact d'un éditeur (via EditeurContact)
- Auteur d'un jeu (via JeuAuteur)

---

### 8. **Jeu**
Jeu de société.

**Champs clés :**
- `nom`, `description`
- `nb_joueurs_min`, `nb_joueurs_max`
- `duree_minutes`
- `age_min`, `age_max`
- `lien_regles` : URL vers les règles du jeu

**Relations :**
- Édité par plusieurs `Editeur` (co-édition possible)
- Créé par plusieurs `Personne` (auteurs)

---

### 9. **Reservation**
Réservation d'un éditeur pour un festival.

**Workflow (statut_workflow) :**
1. `pas_contacte` : État initial
2. `contact_pris` : Au moins un contact effectué
3. `discussion_en_cours` : Échanges en cours
4. `sera_absent` : A décliné l'invitation
5. `considere_absent` : Pas de réponse, considéré absent
6. `present` : A confirmé sa présence et réservé
7. `facture` : Facture émise
8. `paiement_recu` : Paiement effectué
9. `paiement_en_retard` : Paiement en retard

**Tarification :**
- `prix_total` : Somme des prix des tables réservées
- `remise_pourcentage` : Remise en % (optionnel)
- `remise_montant` : Remise en € (optionnel)
- `prix_final` : Prix après remises (calculé automatiquement)

**Champs de suivi :**
- `editeur_presente_jeux` : L'éditeur viendra-t-il présenter ?
- `commentaires_paiement` : Notes sur le paiement
- `paiement_relance` : Client relancé ?
- `date_facture`, `date_paiement` : Dates importantes
- `created_by`, `updated_by` : Traçabilité

---

### 10. **ReservationTable**
Attribution des tables à une réservation.

**Process :**
1. Organisateur sélectionne les tables spécifiques
2. `attribue_par` : Qui a attribué les tables
3. Trigger automatique recalcule `prix_total` et `prix_final`
4. Statut de la table passe à "reserve"

---

### 11. **JeuFestival**
Jeu présent dans une réservation pour un festival donné.

**Workflow :**
- `dans_liste_demandee` : Jeu demandé par l'organisateur
- `dans_liste_obtenue` : Éditeur confirme qu'il apportera ce jeu
- `jeux_recu` : Jeu physiquement reçu sur le festival

**Note :** Permet de suivre quels jeux sont confirmés vs demandés.

---

### 12. **JeuFestivalTable**
Affectation d'un jeu à une ou plusieurs tables.

**Règles :**
- Un jeu peut être sur plusieurs tables
- Plusieurs jeux peuvent partager une table (si capacité suffisante)
- Trigger automatique met à jour `nb_jeux_actuels` sur la table
- Table marquée "plein" automatiquement si capacité atteinte

---

### 13. **ContactEditeur**
Historique des contacts avec les éditeurs.

**Champs :**
- `utilisateur_id` : Qui a effectué le contact
- `date_contact` : Quand
- `notes` : Détails du contact

**Usage :** Permet de tracer toutes les relances et échanges.

---

### 14. **AuditLog**
Journal d'audit pour les actions critiques.

**Utilisé pour tracer :**
- Attribution de tables à une réservation
- Modifications importantes de réservations
- Actions d'administration

**Champs :**
- `action` : Description de l'action
- `entite_type` : Type d'entité concernée (ex: "Reservation")
- `entite_id` : ID de l'entité
- `details` : JSON ou texte avec détails supplémentaires

---

## Vues utiles

### v_tables_disponibles_par_zone
Affiche pour chaque zone tarifaire :
- Nombre de tables libres
- Nombre de tables réservées
- Nombre de tables pleines

### v_reservations_festival
Vue d'ensemble des réservations par festival avec :
- Informations éditeur
- Statut du workflow
- Nombre de tables
- Prix
- Dernière date de contact

### v_jeux_par_zone_plan
Liste des jeux par zone du plan avec :
- Nom du jeu
- Éditeur
- Auteurs
- Nombre de tables occupées

---

## Triggers automatiques

### trg_update_table_jeux_count
**Déclenché par :** Insertion dans JeuFestivalTable  
**Action :** 
- Met à jour `nb_jeux_actuels` sur la table
- Marque la table comme "plein" si capacité atteinte

### trg_recalcul_prix_reservation
**Déclenché par :** Insertion dans ReservationTable  
**Action :**
- Recalcule `prix_total` (somme des prix des tables)
- Applique les remises
- Met à jour `prix_final`

---

## Cas d'usage principaux

### 1. Créer un festival
```sql
-- Créer le festival
INSERT INTO Festival (nom) VALUES ('Festival 2026');

-- Créer une zone tarifaire
INSERT INTO ZoneTarifaire (festival_id, nom, nombre_tables_total, prix_table, prix_m2)
VALUES (LAST_INSERT_ID(), 'Zone Premium', 50, 200.00, 44.44);

-- Créer une zone du plan
INSERT INTO ZoneDuPlan (festival_id, nom, nombre_tables, zone_tarifaire_id)
VALUES (1, 'Hall Principal', 50, 1);

-- Créer les tables
INSERT INTO Table_Jeu (zone_du_plan_id, zone_tarifaire_id, capacite_jeux)
VALUES (1, 1, 2); -- Répéter 50 fois
```

### 2. Réserver des tables pour un éditeur
```sql
-- Créer la réservation
INSERT INTO Reservation (editeur_id, festival_id, statut_workflow, created_by)
VALUES (1, 1, 'present', 1);

-- Attribuer des tables
INSERT INTO ReservationTable (reservation_id, table_id, attribue_par)
VALUES (LAST_INSERT_ID(), 5, 1), (LAST_INSERT_ID(), 6, 1);

-- Le prix est calculé automatiquement par trigger
```

### 3. Ajouter des jeux à une réservation
```sql
-- Ajouter le jeu au festival
INSERT INTO JeuFestival (jeu_id, reservation_id, festival_id, dans_liste_demandee)
VALUES (10, 1, 1, TRUE);

-- Affecter le jeu à des tables
INSERT INTO JeuFestivalTable (jeu_festival_id, table_id)
VALUES (LAST_INSERT_ID(), 5), (LAST_INSERT_ID(), 6);

-- nb_jeux_actuels est mis à jour automatiquement
```

### 4. Suivre le workflow de réservation
```sql
-- Marquer qu'un contact a été pris
INSERT INTO ContactEditeur (editeur_id, festival_id, utilisateur_id, notes)
VALUES (1, 1, 1, 'Premier contact téléphonique, intéressé');

UPDATE Reservation 
SET statut_workflow = 'contact_pris' 
WHERE id = 1;

-- Plus tard : facturer
UPDATE Reservation 
SET statut_workflow = 'facture', 
    date_facture = NOW() 
WHERE id = 1;

-- Paiement reçu
UPDATE Reservation 
SET statut_workflow = 'paiement_recu',
    date_paiement = NOW()
WHERE id = 1;
```

---

## Requêtes utiles

### Liste des éditeurs avec état de réservation
```sql
SELECT 
    e.nom AS editeur,
    r.statut_workflow,
    COUNT(DISTINCT rt.table_id) AS nb_tables,
    r.prix_final,
    MAX(ce.date_contact) AS derniere_date_contact
FROM Editeur e
LEFT JOIN Reservation r ON r.editeur_id = e.id AND r.festival_id = 1
LEFT JOIN ReservationTable rt ON rt.reservation_id = r.id
LEFT JOIN ContactEditeur ce ON ce.editeur_id = e.id AND ce.festival_id = 1
GROUP BY e.id, e.nom, r.statut_workflow, r.prix_final
ORDER BY r.statut_workflow, e.nom;
```

### Jeux d'un éditeur avec leurs zones
```sql
SELECT 
    j.nom AS jeu,
    GROUP_CONCAT(DISTINCT p.nom SEPARATOR ', ') AS auteurs,
    zp.nom AS zone_plan,
    COUNT(DISTINCT jft.table_id) AS nb_tables
FROM Jeu j
JOIN JeuEditeur je ON je.jeu_id = j.id
JOIN Editeur e ON e.id = je.editeur_id
LEFT JOIN JeuAuteur ja ON ja.jeu_id = j.id
LEFT JOIN Personne p ON p.id = ja.personne_id
JOIN JeuFestival jf ON jf.jeu_id = j.id
LEFT JOIN JeuFestivalTable jft ON jft.jeu_festival_id = jf.id
LEFT JOIN Table_Jeu t ON t.id = jft.table_id
LEFT JOIN ZoneDuPlan zp ON zp.id = t.zone_du_plan_id
WHERE e.id = 1 AND jf.festival_id = 1
GROUP BY j.id, j.nom, zp.nom;
```

### Tables disponibles par zone tarifaire
```sql
SELECT * FROM v_tables_disponibles_par_zone WHERE festival_id = 1;
```

---

## Points d'attention

### Sécurité
- Les mots de passe doivent être hashés (bcrypt recommandé)
- Vérifier les droits selon le rôle avant toute action
- Les emails bloqués ne peuvent plus créer de compte

### Performance
- Index sur tous les champs de jointure
- Index sur les champs de recherche fréquents (nom, statut, etc.)
- Utiliser les vues pour les requêtes complexes répétitives

### Intégrité
- CASCADE sur les suppressions pour maintenir la cohérence
- RESTRICT sur les zones tarifaires pour éviter les suppressions si utilisées
- Triggers pour maintenir les compteurs à jour

### Workflow
- Toujours vérifier le statut avant de permettre certaines actions
- Enregistrer dans AuditLog les actions importantes
- Maintenir les champs created_by/updated_by pour la traçabilité

---

## Extensions futures possibles

1. **Gestion des bénévoles** : Table pour gérer les bénévoles et leurs affectations
2. **Planning horaire** : Horaires d'animation par table/zone
3. **Inventaire** : Suivi du matériel (tables, chaises, panneaux, etc.)
4. **Statistiques** : Tables agrégées pour analyses et reporting
5. **Documents** : Stockage des contrats, factures PDF, etc.
6. **Notifications** : Système de notifications pour les relances automatiques