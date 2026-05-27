window.PixelmonNpcData = window.PixelmonNpcData || {};

// Nature values are lowercase because that is the format used in Pixelmon specs.
// Extra metadata is kept here for future UI hints/filters.
window.PixelmonNpcData.natures = [
  { value: "adamant", label: "Adamant", increasedStat: "attack", decreasedStat: "special_attack", pixelmonId: 7 },
  { value: "bashful", label: "Bashful", increasedStat: null, decreasedStat: null, pixelmonId: 3 },
  { value: "bold", label: "Bold", increasedStat: "defense", decreasedStat: "attack", pixelmonId: 9 },
  { value: "brave", label: "Brave", increasedStat: "attack", decreasedStat: "speed", pixelmonId: 6 },
  { value: "calm", label: "Calm", increasedStat: "special_defense", decreasedStat: "attack", pixelmonId: 21 },
  { value: "careful", label: "Careful", increasedStat: "special_defense", decreasedStat: "special_attack", pixelmonId: 24 },
  { value: "docile", label: "Docile", increasedStat: null, decreasedStat: null, pixelmonId: 2 },
  { value: "gentle", label: "Gentle", increasedStat: "special_defense", decreasedStat: "defense", pixelmonId: 22 },
  { value: "hardy", label: "Hardy", increasedStat: null, decreasedStat: null, pixelmonId: 0 },
  { value: "hasty", label: "Hasty", increasedStat: "speed", decreasedStat: "defense", pixelmonId: 14 },
  { value: "impish", label: "Impish", increasedStat: "defense", decreasedStat: "special_attack", pixelmonId: 11 },
  { value: "jolly", label: "Jolly", increasedStat: "speed", decreasedStat: "special_attack", pixelmonId: 15 },
  { value: "lax", label: "Lax", increasedStat: "defense", decreasedStat: "special_defense", pixelmonId: 12 },
  { value: "lonely", label: "Lonely", increasedStat: "attack", decreasedStat: "defense", pixelmonId: 5 },
  { value: "mild", label: "Mild", increasedStat: "special_attack", decreasedStat: "defense", pixelmonId: 18 },
  { value: "modest", label: "Modest", increasedStat: "special_attack", decreasedStat: "attack", pixelmonId: 17 },
  { value: "naive", label: "Naive", increasedStat: "speed", decreasedStat: "special_defense", pixelmonId: 16 },
  { value: "naughty", label: "Naughty", increasedStat: "attack", decreasedStat: "special_defense", pixelmonId: 8 },
  { value: "quiet", label: "Quiet", increasedStat: "special_attack", decreasedStat: "speed", pixelmonId: 19 },
  { value: "quirky", label: "Quirky", increasedStat: null, decreasedStat: null, pixelmonId: 4 },
  { value: "rash", label: "Rash", increasedStat: "special_attack", decreasedStat: "special_defense", pixelmonId: 20 },
  { value: "relaxed", label: "Relaxed", increasedStat: "defense", decreasedStat: "speed", pixelmonId: 10 },
  { value: "sassy", label: "Sassy", increasedStat: "special_defense", decreasedStat: "speed", pixelmonId: 23 },
  { value: "serious", label: "Serious", increasedStat: null, decreasedStat: null, pixelmonId: 1 },
  { value: "timid", label: "Timid", increasedStat: "speed", decreasedStat: "attack", pixelmonId: 13 },
];
