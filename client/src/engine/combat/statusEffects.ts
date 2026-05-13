import type { StatusEffect } from "../../types/combat";

// Duration of each status effect in combat ticks
export const STATUS_DURATIONS: Record<StatusEffect, number> = {
  Burn: 5,
  Chill: 3,
  Freeze: 2,
  Shock: 4,
  Stun: 1,
  Poison: 6,
  Bleed: 4,
  Blind: 3,
  Slow: 4,
  Weaken: 3,
};

// Stat modifiers applied by status effects
export const STATUS_EFFECTS: Record<
  StatusEffect,
  {
    description: string;
    // modifiers applied to the afflicted entity
    dodgeChanceMod?: number;
    attackSpeedMod?: number;
    movementSpeedMod?: number;
    canAct?: boolean;
  }
> = {
  Burn: {
    description: "Deals Fire damage over time.",
  },
  Chill: {
    description: "Reduces movement and attack speed by 30%.",
    attackSpeedMod: -0.3,
    movementSpeedMod: -0.3,
  },
  Freeze: {
    description: "Cannot act for duration.",
    canAct: false,
    attackSpeedMod: -1.0,
  },
  Shock: {
    description: "Takes 20% increased damage.",
  },
  Stun: {
    description: "Cannot act briefly.",
    canAct: false,
  },
  Poison: {
    description: "Deals Poison damage over time. Stacks.",
  },
  Bleed: {
    description: "Deals Physical damage over time, bypasses armor.",
  },
  Blind: {
    description: "Reduces hit chance by 50%.",
    dodgeChanceMod: 0.5,
  },
  Slow: {
    description: "Reduces movement speed by 40%.",
    movementSpeedMod: -0.4,
  },
  Weaken: {
    description: "Deals 15% less damage.",
  },
};

// TODO: Implement full status effect application and tick logic in future milestones
