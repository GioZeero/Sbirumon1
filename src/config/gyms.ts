
export interface GymTrainer {
  level: number;
}

export interface GymConfig {
  gymId: number;
  name: string;
  trainers: GymTrainer[];
  reward: number; // Money reward for beating the gym
}

export const ALL_GYMS: GymConfig[] = [
  { gymId: 1, name: "Palestra di Smeraldo", trainers: [{ level: 10 }, { level: 10 }, { level: 10 }, { level: 10 }, { level: 12 }], reward: 100 },
  { gymId: 2, name: "Palestra di Zaffiro", trainers: [{ level: 12 }, { level: 12 }, { level: 12 }, { level: 12 }, { level: 14 }], reward: 150 },
  { gymId: 3, name: "Palestra di Rubino", trainers: [{ level: 14 }, { level: 14 }, { level: 14 }, { level: 14 }, { level: 16 }], reward: 200 },
  { gymId: 4, name: "Palestra d'Ambra", trainers: [{ level: 16 }, { level: 16 }, { level: 16 }, { level: 16 }, { level: 19 }], reward: 250 },
  { gymId: 5, name: "Palestra di Onice", trainers: [{ level: 19 }, { level: 19 }, { level: 24 }], reward: 350 },
  { gymId: 6, name: "Palestra d'Opale", trainers: [{ level: 21 }, { level: 21 }, { level: 21 }, { level: 21 }, { level: 24 }], reward: 400 },
  { gymId: 7, name: "Palestra di Giada", trainers: [{ level: 24 }, { level: 24 }, { level: 24 }, { level: 24 }, { level: 26 }], reward: 450 },
  { gymId: 8, name: "Palestra di Topazio", trainers: [{ level: 26 }, { level: 26 }, { level: 26 }, { level: 26 }, { level: 29 }], reward: 500 },
  { gymId: 9, name: "Palestra di Ametista", trainers: [{ level: 29 }, { level: 29 }, { level: 34 }], reward: 600 },
  { gymId: 10, name: "Palestra di Diamante", trainers: [{ level: 39 }], reward: 1000 },
];
