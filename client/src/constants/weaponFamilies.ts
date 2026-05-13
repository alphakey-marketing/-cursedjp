import { WeaponFamily } from "../types/item";

export const WEAPON_FAMILIES: WeaponFamily[] = [
  "Katana",
  "Nodachi",
  "Tanto",
  "Naginata",
  "Yumi",
  "Staff",
  "Ofuda",
];

export const WEAPON_FAMILY_LABELS: Record<WeaponFamily, string> = {
  Katana: "Katana",
  Nodachi: "Nodachi (Great Sword)",
  Tanto: "Tanto (Dagger)",
  Naginata: "Naginata (Polearm)",
  Yumi: "Yumi (Bow)",
  Staff: "Staff",
  Ofuda: "Ofuda (Talisman)",
};

export const MELEE_WEAPON_FAMILIES: WeaponFamily[] = [
  "Katana",
  "Nodachi",
  "Tanto",
  "Naginata",
];

export const RANGED_WEAPON_FAMILIES: WeaponFamily[] = ["Yumi"];

export const CASTER_WEAPON_FAMILIES: WeaponFamily[] = ["Staff", "Ofuda"];
