export const BALANCE = {
  // Pipeline caps
  CRIT_DAMAGE_CAP: 4.0,
  ARMOR_MITIGATION_CAP: 0.85,
  RESISTANCE_CAP: 0.80,
  DODGE_CAP: 0.80,
  DAMAGE_TAKEN_DEC_CAP: 0.80,
  MAX_ADDITIVE_TOTAL: 4.0,
  MAX_MULTIPLICATIVE_TOTAL: 10.0,

  // TTK targets (seconds)
  TTK_TARGETS: {
    earlyGame_common: { min: 2, max: 7 },
    midGame_elite: { min: 4, max: 10 },
    lateGame_rare: { min: 6, max: 18 },
    boss: { min: 15, max: 60 },
    idleFarm_common: { min: 1, max: 5 },
  },

  // Offline accrual
  MAX_OFFLINE_SECONDS: 8 * 60 * 60,
  BASE_EXP_RATE: 12,

  // Item drops
  BOSS_SIGNATURE_RUNE_RATE: 0.04,
  BOSS_UNIQUE_RATE: 0.01,

  // Item affix slot counts by grade
  MAX_AFFIX_SLOTS: {
    Normal: 1,
    Magic: 2,
    Rare: 4,
    Legendary: 5,
    Unique: 0,
    Holy: 6,
  },

  // Economy balance
  EXP_PER_NODE: {
    EnemyCamp: 45,
    Miniboss: 120,
    BossArena: 400,
  },
  GOLD_PER_ENEMY: {
    Common: { min: 10, max: 40 },
    Elite: { min: 40, max: 100 },
    Boss: { min: 200, max: 500 },
  },
  PITY_COUNTER_THRESHOLD: 15,  // guaranteed drop after N kills without rare drop
  OFFLINE_EXP_CAP_RATIO: 0.7,  // offline EXP max = 70% of active rate
  GUARANTEED_BOSS_UPGRADE: true,  // boss first kill gives upgrade material

  // Power gate levels
  CHAPTER_POWER_GATES: {
    chapter_1_mid: 130,
    chapter_1_boss: 200,
    chapter_2_entry: 280,
    chapter_2_boss: 450,
  },
} as const;
