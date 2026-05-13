import { ItemGrade } from "../types/item";

export const ITEM_GRADES: ItemGrade[] = [
  "Normal",
  "Magic",
  "Rare",
  "Legendary",
  "Unique",
  "Holy",
];

export const ITEM_GRADE_COLORS: Record<ItemGrade, string> = {
  Normal: "#c8c8c8",
  Magic: "#8888ff",
  Rare: "#ffff77",
  Legendary: "#af6025",
  Unique: "#a52a2a",
  Holy: "#ffffff",
};

export const ITEM_GRADE_LABELS: Record<ItemGrade, string> = {
  Normal: "Normal",
  Magic: "Magic",
  Rare: "Rare",
  Legendary: "Legendary",
  Unique: "Unique",
  Holy: "Holy",
};
