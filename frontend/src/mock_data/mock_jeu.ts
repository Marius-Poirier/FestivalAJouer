import { JeuDto } from '@interfaces/entites/jeu-dto';

export const MOCK_JEUX: JeuDto[] = [
  {
    id: 1,
    nom: '7 Wonders',
    nb_joueurs_min: 2,
    nb_joueurs_max: 7,
    duree_minutes: 30,
    age_min: 10,
    age_max: undefined,
    description: 'Prenez la tête d\'une des sept grandes cités du monde antique. Développez votre civilisation sur le plan militaire, scientifique, culturel et économique.',
    lien_regles: 'https://www.regledujeu.fr/7-wonders',
    created_at: new Date('2024-01-20T10:00:00'),
    updated_at: new Date('2024-01-20T10:00:00')
  },
  {
    id: 2,
    nom: 'Les Aventuriers du Rail',
    nb_joueurs_min: 2,
    nb_joueurs_max: 5,
    duree_minutes: 60,
    age_min: 8,
    age_max: undefined,
    description: 'Collectionnez des cartes wagons, prenez possession de routes ferroviaires et reliez les villes pour marquer le plus de points.',
    lien_regles: 'https://www.regledujeu.fr/aventuriers-du-rail',
    created_at: new Date('2024-01-22T11:00:00'),
    updated_at: new Date('2024-11-18T15:30:00')
  },
  {
    id: 3,
    nom: 'Splendor',
    nb_joueurs_min: 2,
    nb_joueurs_max: 4,
    duree_minutes: 30,
    age_min: 10,
    age_max: undefined,
    description: 'Devenez un riche marchand de la Renaissance. Achetez des mines et des moyens de transport, recrutez des artisans et attirez les nobles.',
    lien_regles: 'https://www.regledujeu.fr/splendor',
    created_at: new Date('2024-01-25T09:30:00'),
    updated_at: new Date('2024-01-25T09:30:00')
  },
  {
    id: 4,
    nom: 'King of Tokyo',
    nb_joueurs_min: 2,
    nb_joueurs_max: 6,
    duree_minutes: 30,
    age_min: 8,
    age_max: undefined,
    description: 'Incarnez un monstre mutant géant qui veut devenir le Roi de Tokyo. Lancez les dés pour attaquer, gagner de l\'énergie ou des points de victoire.',
    lien_regles: 'https://www.regledujeu.fr/king-of-tokyo',
    created_at: new Date('2024-02-05T14:00:00'),
    updated_at: new Date('2024-02-05T14:00:00')
  },
  {
    id: 5,
    nom: 'Kingdomino',
    nb_joueurs_min: 2,
    nb_joueurs_max: 4,
    duree_minutes: 15,
    age_min: 8,
    age_max: undefined,
    description: 'Construisez votre royaume en choisissant astucieusement vos dominos. Créez des zones de même type pour marquer le plus de points.',
    lien_regles: 'https://www.regledujeu.fr/kingdomino',
    created_at: new Date('2024-02-10T10:00:00'),
    updated_at: new Date('2024-11-22T11:15:00')
  },
  {
    id: 6,
    nom: 'Azul',
    nb_joueurs_min: 2,
    nb_joueurs_max: 4,
    duree_minutes: 45,
    age_min: 8,
    age_max: undefined,
    description: 'Devenez artisan et décorez les murs du palais royal de Evora avec les meilleurs azulejos (carreaux de faïence).',
    lien_regles: 'https://www.regledujeu.fr/azul',
    created_at: new Date('2024-02-15T11:30:00'),
    updated_at: new Date('2024-02-15T11:30:00')
  },
  {
    id: 7,
    nom: 'Catan',
    nb_joueurs_min: 3,
    nb_joueurs_max: 4,
    duree_minutes: 90,
    age_min: 10,
    age_max: undefined,
    description: 'Colonisez l\'île de Catan ! Construisez des routes, villages et villes. Échangez des ressources et devenez le maître de l\'île.',
    lien_regles: 'https://www.regledujeu.fr/catan',
    created_at: new Date('2024-02-20T13:00:00'),
    updated_at: new Date('2024-02-20T13:00:00')
  },
  {
    id: 8,
    nom: 'Dobble',
    nb_joueurs_min: 2,
    nb_joueurs_max: 8,
    duree_minutes: 15,
    age_min: 6,
    age_max: undefined,
    description: 'Jeu d\'observation et de rapidité. Trouvez le symbole identique entre votre carte et celle du centre. Cinq mini-jeux en un !',
    lien_regles: 'https://www.regledujeu.fr/dobble',
    created_at: new Date('2024-03-01T09:00:00'),
    updated_at: new Date('2024-03-01T09:00:00')
  },
  {
    id: 9,
    nom: 'Pandemic',
    nb_joueurs_min: 2,
    nb_joueurs_max: 4,
    duree_minutes: 45,
    age_min: 8,
    age_max: undefined,
    description: 'Jeu coopératif où vous devez sauver l\'humanité de quatre maladies mortelles. Travaillez ensemble avant qu\'il ne soit trop tard !',
    lien_regles: 'https://www.regledujeu.fr/pandemic',
    created_at: new Date('2024-03-05T10:30:00'),
    updated_at: new Date('2024-11-19T16:20:00')
  },
  {
    id: 10,
    nom: 'Carcassonne',
    nb_joueurs_min: 2,
    nb_joueurs_max: 5,
    duree_minutes: 35,
    age_min: 7,
    age_max: undefined,
    description: 'Construisez le paysage médiéval de Carcassonne tuile par tuile. Placez vos partisans stratégiquement pour marquer le plus de points.',
    lien_regles: 'https://www.regledujeu.fr/carcassonne',
    created_at: new Date('2024-03-10T14:00:00'),
    updated_at: new Date('2024-03-10T14:00:00')
  }
];

// Helpers
export const getJeuxByDuree = (dureeMax: number): JeuDto[] => {
  return MOCK_JEUX.filter(jeu => (jeu.duree_minutes || 0) <= dureeMax);
};

export const getJeuxByNbJoueurs = (nbJoueurs: number): JeuDto[] => {
  return MOCK_JEUX.filter(jeu => 
    jeu.nb_joueurs_min <= nbJoueurs && jeu.nb_joueurs_max >= nbJoueurs
  );
};

export const getJeuxFamiliaux = (): JeuDto[] => {
  return MOCK_JEUX.filter(jeu => jeu.age_min <= 8 && (jeu.duree_minutes || 0) <= 45);
};

// Note : Les jeux sont des données globales partagées entre tous les festivals