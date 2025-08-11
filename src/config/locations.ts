

export const CITIES = {
  small: [
    'Atrani', 'Morterone', 'Moncenisio', 'Bagnone', 'Fénis', 'Gressoney-Saint-Jean', 'Chamois'
  ],
  medium: [
    'Siena', 'Urbino', 'Orvieto', 'Lucca', 'Assisi', 'Spoleto', 'Gubbio', 'Pistoia'
  ],
  large: [
    'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze'
  ],
};

export const TRAINER_NAMES = [
  "Marione", "Gigi", "Carla", "Ugo", "Pina", "Aldo", "Giovanni", "Giacomo", "Franca", "Lucia"
];

export const COVO_CONFIG = {
    small: { opponents: 3, reward: 15 },
    medium: { opponents: 5, reward: 50 },
    large: { opponents: 10, reward: 100 },
};

export type CovoSize = keyof typeof COVO_CONFIG;
