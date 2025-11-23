export interface WODInput {
  goal: string;
  available_equipment: string;
  preferences: string;
  limitations: string;
  notes: string;
}

export interface WODSection {
  name: string;
  items: string[];
}

export interface WODOutput {
  wod_title: string;
  format: string;
  time_cap_minutes: number;
  sections: WODSection[];
  equipment: string[];
  notes: string;
}

