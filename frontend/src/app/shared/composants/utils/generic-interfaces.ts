export interface Attributs {
  label: string;        // nom de l'attribut
  value: any;          // valeur
  type?: 'text' | 'date' | 'currency' | 'link';  // type 
  pipe?: string;       // Pipe Angular à appliquer
  pipeArgs?: any[];    // Arguments du pipe
  style?: string;      // Style CSS optionnel
}

//interfaces pour les actions nécessaire a l'élément à afficher 
export interface Action {
  label: string;
  callback: () => void;
  style?: string;
}