export interface CraftingMaterial {
  id: string;
  name: string;
  description: string;
  iconId: string;
  stackSize: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  inputMaterials: Array<{ materialId: string; quantity: number }>;
  outputItemTemplateId?: string;
  outputRuneId?: string;
  requiredLevel: number;
}
