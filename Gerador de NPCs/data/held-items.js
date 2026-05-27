window.PixelmonNpcData = window.PixelmonNpcData || {};

// Values are item ids without the helditem: prefix, e.g. "King's Rock" -> "kings_rock".
const heldItemLabels = `
Absorb Bulb
Air Balloon
Amulet Coin
Assault Vest
Berry Juice
Big Root
Binding Band
Black Belt
Black Glasses
Black Sludge
Bright Powder
Cell Battery
Charcoal
Choice Band
Choice Scarf
Choice Specs
Damp Rock
Deep Sea Scale
Deep Sea Tooth
Destiny Knot
Dragon Fang
Eject Button
Eviolite
Grassy Seed
Electric Seed
Psychic Seed
Misty Seed
Expert Belt
Flame Orb
Float Stone
Focus Band
Focus Sash
Grip Claw
Griseous Orb
Hard Stone
Heat Rock
Icy Rock
Iron Ball
King's Rock
Lagging Tail
Leek
Leftovers
Life Orb
Light Ball
Light Clay
Lucky Punch
Luminous Moss
Magnet
Mental Herb
Metal Coat
Metal Powder
Metronome
Miracle Seed
Muscle Band
Mystic Water
Never-Melt Ice
Pixie Plate
Poison Barb
Power Herb
Quick Claw
Quick Powder
Razor Claw
Razor Fang
Red Card
Ring Target
Rocky Helmet
Safety Goggles
Scope Lens
Sharp Beak
Shed Shell
Shell Bell
Silk Scarf
Silver Powder
Smoke Ball
Smooth Rock
Snowball
Soft Sand
Soothe Bell
Soul Dew
Spell Tag
Sticky Barb
Thick Club
Toxic Orb
Twisted Spoon
Weakness Policy
White Herb
Wide Lens
Wise Glasses
Zoom Lens
Throat Spray
Room Service
Heavy-Duty Boots
Abomasite
Absolite
Aerodactylite
Aggronite
Alakazite
Altarianite
Ampharosite
Audinite
Banettite
Beedrillite
Blastoisinite
Blazikenite
Cameruptite
Charizardite X
Charizardite Y
Diancite
Galladite
Garchompite
Gardevoirite
Gengarite
Glalitite
Gyaradosite
Heracronite
Houndoominite
Kangaskhanite
Latiasite
Latiosite
Lopunnite
Lucarionite
Manectite
Mawilite
Medichamite
Metagrossite
Mewtwonite X
Mewtwonite Y
Pidgeotite
Pinsirite
Sablenite
Salamencite
Sceptilite
Scizorite
Sharpedonite
Slowbronite
Steelixite
Swampertite
Tyranitarite
Venusaurite
Bug Gem
Dark Gem
Dragon Gem
Electric Gem
Fairy Gem
Fighting Gem
Fire Gem
Flying Gem
Ghost Gem
Grass Gem
Ground Gem
Ice Gem
Normal Gem
Poison Gem
Psychic Gem
Rock Gem
Steel Gem
Water Gem
Buginium Z
Darkinium Z
Dragonium Z
Electrium Z
Fairium Z
Fightinium Z
Firium Z
Flyinium Z
Ghostium Z
Grassium Z
Groundium Z
Icium Z
Normalium Z
Poisonium Z
Psychium Z
Rockium Z
Steelium Z
Waterium Z
Aloraichium Z
Decidium Z
Eevium Z
Incinium Z
Kommonium Z
Lunalium Z
Lycanium Z
Marshadium Z
Mewnium Z
Mimikium Z
Pikanium Z
Pikashunium Z
Primarium Z
Snorlium Z
Solganium Z
Tapunium Z
Ultranecrozium Z
Blank Plate
Draco Plate
Dread Plate
Earth Plate
Fist Plate
Flame Plate
Icicle Plate
Insect Plate
Iron Plate
Meadow Plate
Mind Plate
Pixie Plate
Sky Plate
Splash Plate
Spooky Plate
Stone Plate
Toxic Plate
Zap Plate
`.trim().split(/\r?\n/);

function heldItemValue(label) {
  return label
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

window.PixelmonNpcData.heldItems = [...new Set(heldItemLabels)].map((label) => ({
  value: heldItemValue(label),
  label,
}));
