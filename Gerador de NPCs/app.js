const RESOURCE_LOCATION_RE = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;
const NAMESPACE_RE = /^[a-z0-9_.-]+$/;
const PATH_RE = /^[a-z0-9_./-]+$/;
const PARTY_SIZE = 6;
const STAT_FIELDS = [
  { suffix: "Hp", label: "HP", token: "hp" },
  { suffix: "Atk", label: "Atk", token: "atk" },
  { suffix: "Def", label: "Def", token: "def" },
  { suffix: "SpAtk", label: "SpA", token: "spatk" },
  { suffix: "SpDef", label: "SpD", token: "spdef" },
  { suffix: "Spd", label: "Spe", token: "spd" }
];
const POKEMON_FIELDS = [
  "Name",
  "Level",
  "Nature",
  "Ability",
  "HeldItem",
  "Move1",
  "Move2",
  "Move3",
  "Move4",
  ...STAT_FIELDS.map((stat) => "Iv" + stat.suffix),
  ...STAT_FIELDS.map((stat) => "Ev" + stat.suffix)
];
const DEFAULT_PARTY = [
  { name: "Pikachu", level: 12, nature: "", ability: "", heldItem: "", moves: ["", "", "", ""], ivs: [31, 31, 31, 31, 31, 31], evs: [0, 0, 0, 0, 0, 0] },
  { name: "Bulbasaur", level: 10, nature: "", ability: "", heldItem: "", moves: ["", "", "", ""], ivs: [31, 31, 31, 31, 31, 31], evs: [0, 0, 0, 0, 0, 0] },
  { name: "", level: "", nature: "", ability: "", heldItem: "", moves: ["", "", "", ""], ivs: ["", "", "", "", "", ""], evs: ["", "", "", "", "", ""] },
  { name: "", level: "", nature: "", ability: "", heldItem: "", moves: ["", "", "", ""], ivs: ["", "", "", "", "", ""], evs: ["", "", "", "", "", ""] },
  { name: "", level: "", nature: "", ability: "", heldItem: "", moves: ["", "", "", ""], ivs: ["", "", "", "", "", ""], evs: ["", "", "", "", "", ""] },
  { name: "", level: "", nature: "", ability: "", heldItem: "", moves: ["", "", "", ""], ivs: ["", "", "", "", "", ""], evs: ["", "", "", "", "", ""] }
];
const DEFAULT_DRAFT = {
  namespace: "customnpcs",
  presetPath: "trainers/meu_treinador",
  names: ["Ari"],
  titleText: "",
  titleColor: "",
  titleBold: false,
  textures: ["pixelmon:textures/steve/bugcatcher1.png"],
  slim: true,
  health: 20,
  eyeHeight: 1.9,
  width: 0.65,
  height: 2,
  lookDistance: 10,
  swim: false,
  nameplate: true,
  pushable: false,
  child: false,
  invulnerable: false,
  immovable: false,
  partyPokemon: DEFAULT_PARTY,
  dialogueTitle: "pixelmon.npc.dialogue.battle.trainer.wild",
  battleRules: "",
  introMessage: "Hora de batalhar!",
  winMessage: "Boa batalha.",
  loseMessage: "Você foi melhor desta vez.",
  noBattleMessage: "Você não tem nenhum Pokémon apto para batalhar!",
  money: 100,
  cooldownEnabled: false,
  cooldownKey: "customnpcs:trainers_meu_treinador",
  cooldownAmount: 1,
  cooldownUnit: "MINUTES",
  cooldownMessage: "Você já batalhou com este treinador recentemente."
};

const form = document.querySelector("#npcForm");
const jsonPreview = document.querySelector("#jsonPreview");
const suggestedPath = document.querySelector("#suggestedPath");
const statusLine = document.querySelector("#statusLine");
const issuesBlock = document.querySelector("#issuesBlock");
const issuesList = document.querySelector("#issuesList");
const warningsBlock = document.querySelector("#warningsBlock");
const warningsList = document.querySelector("#warningsList");
const cooldownFields = document.querySelector("#cooldownFields");
const toast = document.querySelector("#toast");
const loadJsonInput = document.querySelector("#loadJsonInput");
const themeToggleButton = document.querySelector("#themeToggleButton");
const openPokePasteButton = document.querySelector("#openPokePasteButton");
const closePokePasteButton = document.querySelector("#closePokePasteButton");
const applyPokePasteButton = document.querySelector("#applyPokePasteButton");
const pokePasteImportPanel = document.querySelector("#pokePasteImportPanel");
const pokePasteInput = document.querySelector("#pokePasteInput");
let cooldownKeyWasEdited = false;
const THEME_STORAGE_KEY = "pixelmonTrainerGeneratorTheme";
const PIXELMON_DATA = window.PixelmonNpcData || {};
const databaseLookupCache = {};

function pokemonFieldIds() {
  const ids = [];
  for (let slot = 1; slot <= PARTY_SIZE; slot += 1) {
    POKEMON_FIELDS.forEach((field) => {
      ids.push("pokemon" + slot + field);
    });
  }
  return ids;
}

function setupPokemonStatFields() {
  document.querySelectorAll(".pokemon-slot").forEach((slotElement, index) => {
    const grid = slotElement.querySelector(".party-slot-grid");
    if (!grid || grid.querySelector(".stat-block")) {
      return;
    }

    const slot = index + 1;
    [
      { prefix: "Iv", title: "IVs", min: 0, max: 31, placeholder: 31 },
      { prefix: "Ev", title: "EVs", min: 0, max: 252, placeholder: 0 }
    ].forEach((group) => {
      const block = document.createElement("div");
      block.className = "field full stat-block";

      const heading = document.createElement("div");
      heading.className = "stat-heading";

      const title = document.createElement("span");
      title.className = "field-label stat-title";
      title.textContent = group.title;
      heading.appendChild(title);
      block.appendChild(heading);

      const statGrid = document.createElement("div");
      statGrid.className = "stat-grid";
      STAT_FIELDS.forEach((stat, statIndex) => {
        const defaultPokemon = DEFAULT_PARTY[index] || emptyPokemon();
        const defaultValue = group.prefix === "Iv" ? defaultPokemon.ivs?.[statIndex] : defaultPokemon.evs?.[statIndex];
        const field = document.createElement("label");
        field.className = "stat-field";
        field.setAttribute("for", "pokemon" + slot + group.prefix + stat.suffix);

        const label = document.createElement("span");
        label.textContent = stat.label;
        field.appendChild(label);

        const input = document.createElement("input");
        input.id = "pokemon" + slot + group.prefix + stat.suffix;
        input.name = input.id;
        input.type = "number";
        input.min = String(group.min);
        input.max = String(group.max);
        input.step = "1";
        input.placeholder = String(group.placeholder);
        if (defaultValue !== "" && typeof defaultValue !== "undefined") {
          input.value = String(defaultValue);
        }
        field.appendChild(input);

        const actions = document.createElement("div");
        actions.className = "stat-actions";

        const minButton = document.createElement("button");
        minButton.type = "button";
        minButton.textContent = "Min";
        minButton.setAttribute("title", "Definir " + group.title + " " + stat.label + " no mínimo");
        minButton.addEventListener("click", () => {
          input.value = String(group.min);
          render();
        });
        actions.appendChild(minButton);

        const maxButton = document.createElement("button");
        maxButton.type = "button";
        maxButton.textContent = "Máx";
        maxButton.setAttribute("title", "Definir " + group.title + " " + stat.label + " no máximo");
        maxButton.addEventListener("click", () => {
          input.value = String(group.max);
          render();
        });
        actions.appendChild(maxButton);

        field.appendChild(actions);
        statGrid.appendChild(field);
      });

      block.appendChild(statGrid);
      grid.appendChild(block);
    });
  });
}

setupPokemonStatFields();

const fieldIds = [
  "namespace",
  "presetPath",
  "names",
  "titleText",
  "titleColor",
  "titleBold",
  "textures",
  "slim",
  "health",
  "eyeHeight",
  "width",
  "height",
  "lookDistance",
  "nameplate",
  "pushable",
  "child",
  "invulnerable",
  "immovable",
  "swim",
  ...pokemonFieldIds(),
  "dialogueTitle",
  "battleRules",
  "introMessage",
  "winMessage",
  "loseMessage",
  "noBattleMessage",
  "money",
  "cooldownEnabled",
  "cooldownKey",
  "cooldownAmount",
  "cooldownUnit",
  "cooldownMessage"
];

const byId = Object.fromEntries(fieldIds.map((id) => [id, document.querySelector("#" + id)]));

function normalizeDatabaseEntry(entry) {
  if (typeof entry === "string") {
    return { value: entry, label: "" };
  }
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const value = entry.value || entry.id || entry.name;
  if (!value) {
    return null;
  }
  return {
    value: String(value),
    label: entry.label || entry.displayName || entry.name || ""
  };
}

function databaseValues(key) {
  return (PIXELMON_DATA[key] || [])
    .map(normalizeDatabaseEntry)
    .filter(Boolean)
    .sort((a, b) => a.value.localeCompare(b.value));
}

function lookupKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function databaseLookup(key) {
  if (!databaseLookupCache[key]) {
    const lookup = new Map();
    databaseValues(key).forEach((entry) => {
      [entry.value, entry.label].forEach((value) => {
        const normalized = lookupKey(value);
        if (normalized && !lookup.has(normalized)) {
          lookup.set(normalized, entry.value);
        }
      });
    });
    databaseLookupCache[key] = lookup;
  }
  return databaseLookupCache[key];
}

function fallbackToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9-]+/g, "_")
    .replace(/^_|_$/g, "");
}

function resolveDatabaseValue(key, value, fallback = "token") {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }
  return databaseLookup(key).get(lookupKey(trimmed)) || (fallback === "raw" ? trimmed : fallbackToken(trimmed));
}

function createDatalist(id, entries) {
  const datalist = document.createElement("datalist");
  datalist.id = id;
  entries.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.value;
    if (entry.label && entry.label !== entry.value) {
      option.label = entry.label;
    }
    datalist.appendChild(option);
  });
  document.body.appendChild(datalist);
}

function pokemonInputIds(field) {
  return Array.from({ length: PARTY_SIZE }, (_, index) => "pokemon" + (index + 1) + field);
}

function pokemonMoveInputIds() {
  const ids = [];
  for (let slot = 1; slot <= PARTY_SIZE; slot += 1) {
    for (let move = 1; move <= 4; move += 1) {
      ids.push("pokemon" + slot + "Move" + move);
    }
  }
  return ids;
}

function setupAutocompleteLists() {
  [
    { key: "species", datalistId: "speciesOptions", inputs: pokemonInputIds("Name") },
    { key: "natures", datalistId: "natureOptions", inputs: pokemonInputIds("Nature") },
    { key: "abilities", datalistId: "abilityOptions", inputs: pokemonInputIds("Ability") },
    { key: "heldItems", datalistId: "heldItemOptions", inputs: pokemonInputIds("HeldItem") },
    { key: "moves", datalistId: "moveOptions", inputs: pokemonMoveInputIds() }
  ].forEach((config) => {
    createDatalist(config.datalistId, databaseValues(config.key));
    config.inputs.forEach((id) => {
      byId[id]?.setAttribute("list", config.datalistId);
    });
  });
}

function lines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // Local files can be opened in restrictive contexts; the toggle still works in memory.
  }
}

function preferredTheme() {
  const stored = getStoredTheme();
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function setTheme(theme, persist = true) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  themeToggleButton.textContent = nextTheme === "dark" ? "Modo claro" : "Modo escuro";
  themeToggleButton.setAttribute("aria-pressed", String(nextTheme === "dark"));
  if (persist) {
    storeTheme(nextTheme);
  }
}

function setupCollapsiblePanels() {
  document.querySelectorAll("#npcForm > .panel").forEach((panel, index) => {
    const header = panel.querySelector(".panel-header");
    const body = panel.querySelector(".panel-body");
    const title = header?.querySelector("h2")?.textContent?.trim() || "seção";
    if (!header || !body || header.querySelector(".collapse-button")) {
      return;
    }

    if (!body.id) {
      body.id = "panelBody" + index;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "collapse-button";
    button.textContent = "Recolher";
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-controls", body.id);
    button.setAttribute("title", "Recolher " + title);
    header.appendChild(button);

    button.addEventListener("click", () => {
      const collapsed = panel.classList.toggle("is-collapsed");
      button.textContent = collapsed ? "Expandir" : "Recolher";
      button.setAttribute("aria-expanded", String(!collapsed));
      button.setAttribute("title", (collapsed ? "Expandir " : "Recolher ") + title);
    });
  });
}

function numberValue(id) {
  const value = Number(byId[id].value);
  return Number.isFinite(value) ? value : NaN;
}

function intValue(id) {
  const value = Number.parseInt(byId[id].value, 10);
  return Number.isFinite(value) ? value : NaN;
}

function boolSelectValue(id) {
  return byId[id].value === "true";
}

function emptyPokemon() {
  return { name: "", level: "", nature: "", ability: "", heldItem: "", moves: ["", "", "", ""], ivs: ["", "", "", "", "", ""], evs: ["", "", "", "", "", ""] };
}

function normalizeStatValues(values) {
  return Array.from({ length: STAT_FIELDS.length }, (_, index) => {
    const value = values?.[index];
    return value === "" || value === null || typeof value === "undefined" ? "" : Number(value);
  });
}

function normalizePartyPokemon(pokemon) {
  const normalized = Array.from({ length: PARTY_SIZE }, (_, index) => ({
    ...emptyPokemon(),
    ...(pokemon?.[index] || {})
  }));
  return normalized.map((entry) => ({
    name: String(entry.name || "").trim(),
    level: entry.level === "" || entry.level === null || typeof entry.level === "undefined" ? "" : Number(entry.level),
    nature: String(entry.nature || "").trim(),
    ability: String(entry.ability || "").trim(),
    heldItem: String(entry.heldItem || "").trim(),
    moves: Array.from({ length: 4 }, (_, moveIndex) => String(entry.moves?.[moveIndex] || "").trim()),
    ivs: normalizeStatValues(entry.ivs),
    evs: normalizeStatValues(entry.evs)
  }));
}

function readPartyPokemon() {
  return Array.from({ length: PARTY_SIZE }, (_, index) => {
    const slot = index + 1;
    const levelValue = byId["pokemon" + slot + "Level"].value.trim();
    const ivs = STAT_FIELDS.map((stat) => {
      const value = byId["pokemon" + slot + "Iv" + stat.suffix].value.trim();
      return value ? Number(value) : "";
    });
    const evs = STAT_FIELDS.map((stat) => {
      const value = byId["pokemon" + slot + "Ev" + stat.suffix].value.trim();
      return value ? Number(value) : "";
    });
    return {
      name: byId["pokemon" + slot + "Name"].value.trim(),
      level: levelValue ? Number(levelValue) : "",
      nature: byId["pokemon" + slot + "Nature"].value.trim(),
      ability: byId["pokemon" + slot + "Ability"].value.trim(),
      heldItem: byId["pokemon" + slot + "HeldItem"].value.trim(),
      moves: [1, 2, 3, 4].map((moveIndex) => byId["pokemon" + slot + "Move" + moveIndex].value.trim()),
      ivs,
      evs
    };
  });
}

function writePartyPokemon(pokemon) {
  normalizePartyPokemon(pokemon).forEach((entry, index) => {
    const slot = index + 1;
    byId["pokemon" + slot + "Name"].value = entry.name;
    byId["pokemon" + slot + "Level"].value = entry.level === "" || Number.isNaN(entry.level) ? "" : entry.level;
    byId["pokemon" + slot + "Nature"].value = entry.nature;
    byId["pokemon" + slot + "Ability"].value = entry.ability;
    byId["pokemon" + slot + "HeldItem"].value = entry.heldItem;
    entry.moves.forEach((move, moveIndex) => {
      byId["pokemon" + slot + "Move" + (moveIndex + 1)].value = move;
    });
    entry.ivs.forEach((iv, statIndex) => {
      byId["pokemon" + slot + "Iv" + STAT_FIELDS[statIndex].suffix].value = iv === "" || Number.isNaN(iv) ? "" : iv;
    });
    entry.evs.forEach((ev, statIndex) => {
      byId["pokemon" + slot + "Ev" + STAT_FIELDS[statIndex].suffix].value = ev === "" || Number.isNaN(ev) ? "" : ev;
    });
  });
}

function pokemonHasAnyValue(pokemon) {
  return Boolean(
    pokemon.name ||
    pokemon.level !== "" ||
    pokemon.nature ||
    pokemon.ability ||
    pokemon.heldItem ||
    pokemon.moves.some(Boolean) ||
    pokemon.ivs.some((value) => value !== "") ||
    pokemon.evs.some((value) => value !== "")
  );
}

function buildPokemonSpec(pokemon) {
  const parts = [pokemon.name];
  if (pokemon.level !== "" && Number.isFinite(Number(pokemon.level))) {
    parts.push("lvl:" + Number(pokemon.level));
  }
  if (pokemon.ability) {
    parts.push("ability:" + pokemon.ability);
  }
  if (pokemon.heldItem) {
    parts.push("helditem:" + pokemon.heldItem);
  }
  if (pokemon.nature) {
    parts.push("nature:" + pokemon.nature);
  }
  pokemon.ivs.forEach((iv, index) => {
    if (iv !== "" && Number.isFinite(Number(iv))) {
      parts.push("iv" + STAT_FIELDS[index].token + ":" + Number(iv));
    }
  });
  pokemon.evs.forEach((ev, index) => {
    if (ev !== "" && Number.isFinite(Number(ev))) {
      parts.push("ev" + STAT_FIELDS[index].token + ":" + Number(ev));
    }
  });
  pokemon.moves.forEach((move, index) => {
    if (move) {
      parts.push("move" + (index + 1) + ":" + move);
    }
  });
  return parts.filter(Boolean).join(" ");
}

function parsePokemonSpec(spec) {
  const pokemon = emptyPokemon();
  const parts = String(spec || "").trim().split(/\s+/).filter(Boolean);
  const baseParts = [];
  const statTokenIndexes = Object.fromEntries(STAT_FIELDS.map((stat, index) => [stat.token, index]));

  parts.forEach((part) => {
    const separator = part.indexOf(":");
    const key = separator > 0 ? part.slice(0, separator).toLowerCase() : "";
    const value = separator > 0 ? part.slice(separator + 1) : "";

    if ((key === "lvl" || key === "level") && value) {
      pokemon.level = Number(value);
    } else if (key === "nature" && value) {
      pokemon.nature = value;
    } else if (key === "ability" && value) {
      pokemon.ability = value;
    } else if (key === "helditem" && value) {
      pokemon.heldItem = value;
    } else if (/^move[1-4]$/.test(key) && value) {
      pokemon.moves[Number(key.slice(4)) - 1] = value;
    } else if (key.startsWith("iv") && typeof statTokenIndexes[key.slice(2)] !== "undefined" && value) {
      pokemon.ivs[statTokenIndexes[key.slice(2)]] = Number(value);
    } else if (key.startsWith("ev") && typeof statTokenIndexes[key.slice(2)] !== "undefined" && value) {
      pokemon.evs[statTokenIndexes[key.slice(2)]] = Number(value);
    } else {
      baseParts.push(part);
    }
  });

  pokemon.name = baseParts.join(" ");
  if (!Number.isFinite(pokemon.level)) {
    pokemon.level = "";
  }
  return pokemon;
}

function parsePokePasteHeader(line) {
  const parts = String(line || "").split(/\s+@\s+/);
  const rawIdentity = (parts.shift() || "").trim();
  const rawHeldItem = parts.join(" @ ").trim();
  const parentheticals = [...rawIdentity.matchAll(/\(([^()]+)\)/g)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  const parentheticalSpecies = [...parentheticals].reverse().find((value) => !/^(m|f|male|female)$/i.test(value));
  const cleanedIdentity = rawIdentity
    .replace(/\s+\((?:M|F|Male|Female)\)\s*$/i, "")
    .trim();
  const species = parentheticalSpecies || cleanedIdentity;

  return {
    species,
    heldItem: rawHeldItem
  };
}

function parsePokePasteStats(value, defaults) {
  const stats = defaults.slice();
  const indexes = {
    hp: 0,
    atk: 1,
    def: 2,
    spa: 3,
    spd: 4,
    spe: 5
  };

  String(value || "").split("/").forEach((part) => {
    const match = part.trim().match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i);
    if (!match) {
      return;
    }
    const index = indexes[match[2].toLowerCase()];
    if (typeof index !== "undefined") {
      stats[index] = Number(match[1]);
    }
  });

  return stats;
}

function parsePokePasteSet(block) {
  const setLines = String(block || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!setLines.length || /^=+/.test(setLines[0])) {
    return null;
  }

  const pokemon = {
    ...emptyPokemon(),
    level: 100,
    ivs: [31, 31, 31, 31, 31, 31],
    evs: [0, 0, 0, 0, 0, 0]
  };
  const header = parsePokePasteHeader(setLines[0]);
  pokemon.name = resolveDatabaseValue("species", header.species, "raw");
  pokemon.heldItem = resolveDatabaseValue("heldItems", header.heldItem);
  let recognizedDetails = Boolean(header.heldItem);

  setLines.slice(1).forEach((line) => {
    if (/^Ability:/i.test(line)) {
      pokemon.ability = resolveDatabaseValue("abilities", line.replace(/^Ability:\s*/i, ""));
      recognizedDetails = true;
    } else if (/^Level:/i.test(line)) {
      const level = Number(line.replace(/^Level:\s*/i, ""));
      pokemon.level = Number.isFinite(level) ? level : pokemon.level;
      recognizedDetails = true;
    } else if (/^EVs:/i.test(line)) {
      pokemon.evs = parsePokePasteStats(line.replace(/^EVs:\s*/i, ""), [0, 0, 0, 0, 0, 0]);
      recognizedDetails = true;
    } else if (/^IVs:/i.test(line)) {
      pokemon.ivs = parsePokePasteStats(line.replace(/^IVs:\s*/i, ""), [31, 31, 31, 31, 31, 31]);
      recognizedDetails = true;
    } else if (/^(.+?)\s+Nature$/i.test(line)) {
      pokemon.nature = resolveDatabaseValue("natures", line.replace(/\s+Nature$/i, ""));
      recognizedDetails = true;
    } else if (/^-\s+/.test(line) && pokemon.moves.filter(Boolean).length < 4) {
      const move = line.replace(/^-\s+/, "").trim();
      pokemon.moves[pokemon.moves.filter(Boolean).length] = resolveDatabaseValue("moves", move);
      recognizedDetails = true;
    }
  });

  if (!pokemon.name || (!recognizedDetails && !pokemon.moves.some(Boolean))) {
    return null;
  }
  return pokemon;
}

function parsePokePasteParty(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map(parsePokePasteSet)
    .filter(Boolean)
    .slice(0, PARTY_SIZE);
}

function importPokePasteParty() {
  const importedParty = parsePokePasteParty(pokePasteInput.value);
  if (!importedParty.length) {
    showToast("Nenhuma party PokePaste encontrada.");
    return;
  }

  writePartyPokemon(importedParty);
  render();
  pokePasteImportPanel.classList.add("hidden");
  showToast("PokePaste importado: " + importedParty.length + " Pokemon.");
}

function readDraft() {
  return {
    namespace: byId.namespace.value.trim(),
    presetPath: byId.presetPath.value.trim(),
    names: lines(byId.names.value),
    titleText: byId.titleText.value.trim(),
    titleColor: byId.titleColor.value,
    titleBold: byId.titleBold.checked,
    textures: lines(byId.textures.value),
    slim: byId.slim.checked,
    health: numberValue("health"),
    eyeHeight: numberValue("eyeHeight"),
    width: numberValue("width"),
    height: numberValue("height"),
    lookDistance: numberValue("lookDistance"),
    nameplate: boolSelectValue("nameplate"),
    pushable: byId.pushable.checked,
    child: byId.child.checked,
    invulnerable: byId.invulnerable.checked,
    immovable: byId.immovable.checked,
    swim: byId.swim.checked,
    partyPokemon: readPartyPokemon(),
    dialogueTitle: byId.dialogueTitle.value.trim(),
    battleRules: byId.battleRules.value.trim(),
    introMessage: byId.introMessage.value.trim(),
    winMessage: byId.winMessage.value.trim(),
    loseMessage: byId.loseMessage.value.trim(),
    noBattleMessage: byId.noBattleMessage.value.trim(),
    money: numberValue("money"),
    cooldownEnabled: byId.cooldownEnabled.checked,
    cooldownKey: byId.cooldownKey.value.trim(),
    cooldownAmount: intValue("cooldownAmount"),
    cooldownUnit: byId.cooldownUnit.value,
    cooldownMessage: byId.cooldownMessage.value.trim()
  };
}

function writeDraft(draft) {
  const next = { ...DEFAULT_DRAFT, ...draft };
  byId.namespace.value = next.namespace;
  byId.presetPath.value = next.presetPath;
  byId.names.value = next.names.join("\n");
  byId.titleText.value = next.titleText;
  byId.titleColor.value = next.titleColor;
  byId.titleBold.checked = Boolean(next.titleBold);
  byId.textures.value = next.textures.join("\n");
  byId.slim.checked = Boolean(next.slim);
  byId.health.value = next.health;
  byId.eyeHeight.value = next.eyeHeight;
  byId.width.value = next.width;
  byId.height.value = next.height;
  byId.lookDistance.value = next.lookDistance;
  byId.nameplate.value = String(Boolean(next.nameplate));
  byId.pushable.checked = Boolean(next.pushable);
  byId.child.checked = Boolean(next.child);
  byId.invulnerable.checked = Boolean(next.invulnerable);
  byId.immovable.checked = Boolean(next.immovable);
  byId.swim.checked = Boolean(next.swim);
  writePartyPokemon(next.partyPokemon);
  byId.dialogueTitle.value = next.dialogueTitle;
  byId.battleRules.value = next.battleRules;
  byId.introMessage.value = next.introMessage;
  byId.winMessage.value = next.winMessage;
  byId.loseMessage.value = next.loseMessage;
  byId.noBattleMessage.value = next.noBattleMessage;
  byId.money.value = next.money;
  byId.cooldownEnabled.checked = Boolean(next.cooldownEnabled);
  byId.cooldownKey.value = next.cooldownKey;
  byId.cooldownAmount.value = next.cooldownAmount;
  byId.cooldownUnit.value = next.cooldownUnit;
  byId.cooldownMessage.value = next.cooldownMessage;
  cooldownKeyWasEdited = next.cooldownKey !== defaultCooldownKey(next.namespace, next.presetPath);
  render();
}

function normalizePath(path) {
  return path.replace(/^\/+/, "").replace(/\/+$/g, "");
}

function defaultCooldownKey(namespace, presetPath) {
  const normalized = normalizePath(presetPath || "trainer").replace(/\//g, "_");
  return (namespace || "customnpcs") + ":" + normalized;
}

function contextPlayer() {
  return {
    key: "pixelmon:player",
    type: "pixelmon:context_player"
  };
}

function resultList(value) {
  return {
    value,
    type: "pixelmon:constant"
  };
}

function constantBoolean(value) {
  return {
    value,
    type: "pixelmon:constant_boolean"
  };
}

function constantString(value) {
  return {
    value,
    type: "pixelmon:constant_string"
  };
}

function messagePlayer(message) {
  return {
    messages: [
      {
        text: message
      }
    ],
    type: "pixelmon:message_player"
  };
}

function dialogue(title, message, fireCloseEvent) {
  const result = {
    title,
    message,
    type: "pixelmon:open_dialogue"
  };
  if (typeof fireCloseEvent === "boolean") {
    result.fire_close_event = fireCloseEvent;
  }
  return result;
}

function interaction(event, conditions, results) {
  return {
    event,
    conditions,
    results: resultList(results)
  };
}

function interactionCondition(condition) {
  return {
    condition,
    type: "pixelmon:interaction_condition"
  };
}

function interactionConditions(conditions) {
  return conditions.map(interactionCondition);
}

function notInteractionCondition(condition) {
  return {
    condition: interactionCondition(condition),
    type: "pixelmon:logical_not"
  };
}

function mainHandCondition() {
  return {
    first: constantString("MAIN_HAND"),
    second: {
      type: "pixelmon:hand_used"
    },
    type: "pixelmon:string_compare"
  };
}

function canBattleCondition() {
  return {
    player: contextPlayer(),
    type: "pixelmon:can_battle"
  };
}

function onCooldownCondition(draft) {
  return {
    player: contextPlayer(),
    cooldown_key: draft.cooldownKey,
    cooldown: draft.cooldownAmount,
    unit: draft.cooldownUnit,
    type: "pixelmon:on_cooldown"
  };
}

function trainerContextValue(draft) {
  return normalizePath(draft.presetPath || "trainer").replace(/\//g, "_");
}

function setTrainerContext(draft) {
  return {
    key: "pixelmon:trainer",
    value: trainerContextValue(draft),
    type: "pixelmon:set_string_context"
  };
}

function buildModels(draft) {
  const models = draft.textures.map((texture) => ({
    slim: draft.slim,
    texture,
    type: "pixelmon:player"
  }));

  if (models.length === 1) {
    return {
      value: models[0],
      type: "pixelmon:constant"
    };
  }

  return {
    values: models,
    type: "pixelmon:uniformly_random"
  };
}

function buildParty(draft) {
  return {
    value: {
      specs: draft.partyPokemon
        .filter((pokemon) => pokemon.name)
        .map(buildPokemonSpec),
      type: "pixelmon:spec"
    },
    type: "pixelmon:constant"
  };
}

function buildProperties(draft) {
  const value = {
    health: draft.health,
    eyeHeight: draft.eyeHeight,
    dimensions: {
      width: draft.width,
      height: draft.height
    },
    pushable: draft.pushable,
    child: draft.child,
    invulnerable: draft.invulnerable,
    immovable: draft.immovable,
    nameplate: draft.nameplate
  };

  if (draft.titleText) {
    value.title = {
      text: draft.titleText
    };
    if (draft.titleColor) {
      value.title.color = draft.titleColor;
    }
    if (draft.titleBold) {
      value.title.bold = true;
    }
  }

  return {
    value,
    type: "pixelmon:constant"
  };
}

function buildInteractions(draft) {
  const interactions = [];
  const canBattle = canBattleCondition();
  const mainHand = mainHandCondition();
  const canStart = draft.cooldownEnabled
    ? [
      mainHand,
      canBattle,
      notInteractionCondition(onCooldownCondition(draft))
      ]
    : [mainHand, canBattle];
  const pokeBallCanStart = draft.cooldownEnabled
    ? interactionConditions([canBattle, notInteractionCondition(onCooldownCondition(draft))])
    : canBattle;
  const startResults = [dialogue(draft.dialogueTitle, draft.introMessage)];

  interactions.push(interaction("pixelmon:hit_with_poke_ball", pokeBallCanStart, startResults));
  interactions.push(interaction("pixelmon:right_click", interactionConditions(canStart), startResults));
  interactions.push(interaction("pixelmon:right_click", interactionConditions([
    mainHand,
    notInteractionCondition(canBattle)
  ]), [messagePlayer(draft.noBattleMessage)]));

  if (draft.cooldownEnabled) {
    interactions.push(interaction(
      "pixelmon:right_click",
      interactionConditions([mainHand, onCooldownCondition(draft)]),
      [messagePlayer(draft.cooldownMessage)]
    ));
  }

  const battleStart = {
    type: "pixelmon:player_start_npc_battle"
  };
  if (draft.battleRules) {
    battleStart.battle_rules = draft.battleRules;
  }

  interactions.push(interaction("pixelmon:close_dialogue", [constantBoolean(true)], [battleStart]));
  interactions.push(interaction("pixelmon:lose_battle", { type: "pixelmon:true" }, [
    dialogue(draft.dialogueTitle, draft.winMessage, false),
    setTrainerContext(draft),
    {
      type: "pixelmon:trigger_interaction_event",
      event: "pixelmon:lose_to_trainer"
    }
  ]));

  const winResults = [
    dialogue(draft.dialogueTitle, draft.loseMessage, false),
    {
      money: draft.money,
      type: "pixelmon:give_money"
    }
  ];

  if (draft.cooldownEnabled) {
    winResults.push({
      player: contextPlayer(),
      key: draft.cooldownKey,
      type: "pixelmon:set_cooldown"
    });
  }

  winResults.push(setTrainerContext(draft));
  winResults.push({
    type: "pixelmon:trigger_interaction_event",
    event: "pixelmon:defeat_trainer"
  });

  interactions.push(interaction("pixelmon:win_battle", { type: "pixelmon:true" }, winResults));

  return {
    value: {
      interactions
    },
    type: "pixelmon:constant"
  };
}

function buildPresetJson(draft) {
  return {
    interactions: buildInteractions(draft),
    properties: buildProperties(draft),
    party: buildParty(draft),
    names: {
      values: draft.names,
      type: "pixelmon:uniformly_random"
    },
    models: buildModels(draft),
    ai_provider: {
      type: "pixelmon:constant",
      value: {
        type: "pixelmon:stand_and_look",
        look_distance: draft.lookDistance,
        swim: draft.swim
      }
    }
  };
}

function validateDraft(draft) {
  const issues = [];
  const warnings = [
    "Pokémon, natures, abilities, held items, texturas e battle rules não são checados contra arquivos do jogo nesta v1."
  ];

  if (!NAMESPACE_RE.test(draft.namespace)) {
    issues.push("Namespace inválido.");
  }
  const normalizedPresetPath = normalizePath(draft.presetPath);
  if (!PATH_RE.test(normalizedPresetPath) || normalizedPresetPath.includes("//")) {
    issues.push("Preset path inválido.");
  }
  if (!draft.names.length) {
    issues.push("Informe ao menos um nome.");
  }
  if (!draft.textures.length) {
    issues.push("Informe ao menos uma textura.");
  }
  draft.textures.forEach((texture) => {
    if (!RESOURCE_LOCATION_RE.test(texture)) {
      issues.push("Textura inválida: " + texture);
    }
  });
  ["health", "eyeHeight", "width", "height"].forEach((key) => {
    if (!Number.isFinite(draft[key]) || draft[key] <= 0) {
      issues.push("Valor positivo obrigatório em " + key + ".");
    }
  });
  if (!Number.isFinite(draft.lookDistance) || draft.lookDistance < 0) {
    issues.push("Distância do olhar não pode ser negativa.");
  }
  if (!Number.isFinite(draft.money) || draft.money < 0) {
    issues.push("Dinheiro não pode ser negativo.");
  }
  const configuredPokemon = draft.partyPokemon.filter(pokemonHasAnyValue);
  if (!configuredPokemon.length) {
    issues.push("Informe ao menos um Pokémon na equipe.");
  }
  draft.partyPokemon.forEach((pokemon, index) => {
    const slot = index + 1;
    if (!pokemonHasAnyValue(pokemon)) {
      return;
    }
    if (!pokemon.name) {
      issues.push("Pokémon " + slot + " precisa de nome/spec base.");
    }
    if (pokemon.level === "" || !Number.isInteger(Number(pokemon.level)) || Number(pokemon.level) < 1 || Number(pokemon.level) > 100) {
      issues.push("Pokémon " + slot + " precisa de lvl entre 1 e 100.");
    }
    pokemon.ivs.forEach((iv, statIndex) => {
      if (iv !== "" && (!Number.isInteger(Number(iv)) || Number(iv) < 0 || Number(iv) > 31)) {
        issues.push("IV " + STAT_FIELDS[statIndex].label + " do Pokémon " + slot + " deve ficar entre 0 e 31.");
      }
    });
    let evTotal = 0;
    pokemon.evs.forEach((ev, statIndex) => {
      if (ev === "") {
        return;
      }
      evTotal += Number(ev);
      if (!Number.isInteger(Number(ev)) || Number(ev) < 0 || Number(ev) > 252) {
        issues.push("EV " + STAT_FIELDS[statIndex].label + " do Pokémon " + slot + " deve ficar entre 0 e 252.");
      }
    });
    if (evTotal > 510) {
      issues.push("Total de EVs do Pokémon " + slot + " não pode passar de 510.");
    }
  });
  if (!draft.dialogueTitle) {
    issues.push("Título do diálogo é obrigatório.");
  }
  if (!draft.introMessage) {
    issues.push("Fala inicial é obrigatória.");
  }
  if (!draft.winMessage) {
    issues.push("Fala ao vencer o jogador é obrigatória.");
  }
  if (!draft.loseMessage) {
    issues.push("Fala ao perder para o jogador é obrigatória.");
  }
  if (!draft.noBattleMessage) {
    issues.push("Mensagem sem Pokémon apto é obrigatória.");
  }
  if (draft.battleRules && !RESOURCE_LOCATION_RE.test(draft.battleRules)) {
    issues.push("Battle rule deve ser uma ResourceLocation.");
  }
  if (draft.cooldownEnabled) {
    if (!RESOURCE_LOCATION_RE.test(draft.cooldownKey)) {
      issues.push("Cooldown key deve ser uma ResourceLocation.");
    }
    if (!Number.isInteger(draft.cooldownAmount) || draft.cooldownAmount < 1) {
      issues.push("Duração do cooldown deve ser maior que zero.");
    }
    if (!draft.cooldownMessage) {
      issues.push("Mensagem de cooldown é obrigatória.");
    }
  }

  return { issues, warnings };
}

function renderMessages(listEl, blockEl, messages) {
  listEl.textContent = "";
  messages.forEach((message) => {
    const item = document.createElement("li");
    item.textContent = message;
    listEl.appendChild(item);
  });
  blockEl.classList.toggle("hidden", messages.length === 0);
}

function renderStatus(validation) {
  const dot = statusLine.querySelector(".status-dot");
  const text = statusLine.querySelector("span:last-child");
  dot.classList.remove("warn", "error");
  if (validation.issues.length) {
    dot.classList.add("error");
    text.textContent = "Corrija os campos marcados antes de exportar.";
  } else if (validation.warnings.length) {
    dot.classList.add("warn");
    text.textContent = "JSON válido com avisos.";
  } else {
    text.textContent = "JSON válido.";
  }
}

function getSuggestedPath(draft) {
  return "data/" + (draft.namespace || "<namespace>") + "/pixelmon/npc/preset/" + (normalizePath(draft.presetPath) || "<preset_path>") + ".json";
}

function render() {
  const draft = readDraft();
  if (!cooldownKeyWasEdited && !byId.cooldownEnabled.matches(":focus") && !byId.cooldownKey.matches(":focus")) {
    const generatedKey = defaultCooldownKey(draft.namespace, draft.presetPath);
    byId.cooldownKey.value = generatedKey;
    draft.cooldownKey = generatedKey;
  }
  cooldownFields.classList.toggle("hidden", !draft.cooldownEnabled);

  const validation = validateDraft(draft);
  const json = buildPresetJson(draft);
  suggestedPath.textContent = getSuggestedPath(draft);
  jsonPreview.textContent = JSON.stringify(json, null, 2);
  renderStatus(validation);
  renderMessages(issuesList, issuesBlock, validation.issues);
  renderMessages(warningsList, warningsBlock, validation.warnings);
}

function currentJsonOrThrow() {
  const draft = readDraft();
  const validation = validateDraft(draft);
  if (validation.issues.length) {
    showToast("Corrija os erros antes de exportar.");
    throw new Error("Draft inválido");
  }
  return {
    draft,
    jsonText: JSON.stringify(buildPresetJson(draft), null, 2) + "\n"
  };
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

async function copyJson() {
  try {
    const { jsonText } = currentJsonOrThrow();
    await navigator.clipboard.writeText(jsonText);
    showToast("JSON copiado.");
  } catch (error) {
    if (error.message !== "Draft inválido") {
      showToast("Não foi possível copiar.");
    }
  }
}

function downloadJson() {
  let payload;
  try {
    payload = currentJsonOrThrow();
  } catch (error) {
    return;
  }
  const blob = new Blob([payload.jsonText], { type: "application/json;charset=utf-8" });
  const link = document.createElement("a");
  const baseName = normalizePath(payload.draft.presetPath).split("/").pop() || "npc";
  link.href = URL.createObjectURL(blob);
  link.download = baseName + ".json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  showToast("Download iniciado.");
}

function flattenModels(models) {
  const values = models?.values || (models?.value ? [models.value] : []);
  return values.map((model) => {
    if (typeof model.texture === "string") {
      return model.texture;
    }
    return model.texture?.resource?.resource || "";
  }).filter(Boolean);
}

function findInteractions(preset, event) {
  return preset?.interactions?.value?.interactions?.filter((item) => item.event === event) || [];
}

function resultValues(interactionItem) {
  return interactionItem?.results?.value || [];
}

function firstResultByType(interactionItem, type) {
  return resultValues(interactionItem).find((result) => result.type === type);
}

function findConditionType(condition, type) {
  if (!condition || typeof condition !== "object") {
    return null;
  }
  if (condition.type === type) {
    return condition;
  }
  for (const value of Object.values(condition)) {
    if (Array.isArray(value)) {
      for (const child of value) {
        const found = findConditionType(child, type);
        if (found) {
          return found;
        }
      }
    } else if (value && typeof value === "object") {
      const found = findConditionType(value, type);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function textFromMessagePlayer(result) {
  return result?.messages?.map((message) => message.text || message.translate || "").filter(Boolean).join("\n") || "";
}

function draftFromPresetJson(preset, fileName) {
  const draft = {
    ...DEFAULT_DRAFT,
    partyPokemon: normalizePartyPokemon(DEFAULT_DRAFT.partyPokemon)
  };
  const fileBase = fileName ? fileName.replace(/\.json$/i, "") : "";
  if (fileBase && PATH_RE.test(fileBase)) {
    draft.presetPath = "trainers/" + fileBase;
  }

  const props = preset.properties?.value || {};
  draft.health = props.health ?? draft.health;
  draft.eyeHeight = props.eyeHeight ?? draft.eyeHeight;
  draft.width = props.dimensions?.width ?? draft.width;
  draft.height = props.dimensions?.height ?? draft.height;
  draft.pushable = Boolean(props.pushable);
  draft.child = Boolean(props.child);
  draft.invulnerable = Boolean(props.invulnerable);
  draft.immovable = Boolean(props.immovable);
  draft.nameplate = props.nameplate ?? draft.nameplate;
  draft.titleText = props.title?.text || props.title?.translate || "";
  draft.titleColor = props.title?.color || "";
  draft.titleBold = Boolean(props.title?.bold);

  draft.names = preset.names?.values || (preset.names?.value ? [preset.names.value] : draft.names);
  draft.textures = flattenModels(preset.models);
  const firstModel = preset.models?.values?.[0] || preset.models?.value;
  draft.slim = firstModel?.slim ?? draft.slim;
  const aiProvider = preset.ai_provider?.value;
  if (aiProvider?.type === "pixelmon:stand_and_look") {
    draft.lookDistance = aiProvider.look_distance ?? draft.lookDistance;
    draft.swim = Boolean(aiProvider.swim);
  }

  const party = preset.party?.value;
  if (party?.type === "pixelmon:random_combination") {
    draft.partyPokemon = normalizePartyPokemon((party.options || []).slice(0, PARTY_SIZE).map((spec) => ({
      ...parsePokemonSpec(spec),
      level: ""
    })));
  } else if (party?.type === "pixelmon:spec") {
    draft.partyPokemon = normalizePartyPokemon((party.specs || []).slice(0, PARTY_SIZE).map(parsePokemonSpec));
  }

  const rightClicks = findInteractions(preset, "pixelmon:right_click");
  const intro = rightClicks.map((item) => firstResultByType(item, "pixelmon:open_dialogue")).find(Boolean);
  if (intro) {
    draft.dialogueTitle = intro.title || draft.dialogueTitle;
    draft.introMessage = intro.message || draft.introMessage;
  }
  const noBattle = rightClicks.map((item) => firstResultByType(item, "pixelmon:message_player")).find(Boolean);
  if (noBattle) {
    draft.noBattleMessage = textFromMessagePlayer(noBattle) || draft.noBattleMessage;
  }

  const closeDialogue = findInteractions(preset, "pixelmon:close_dialogue")
    .map((item) => firstResultByType(item, "pixelmon:player_start_npc_battle"))
    .find(Boolean);
  draft.battleRules = closeDialogue?.battle_rules || "";

  const loseDialogue = findInteractions(preset, "pixelmon:lose_battle")
    .map((item) => firstResultByType(item, "pixelmon:open_dialogue"))
    .find(Boolean);
  if (loseDialogue) {
    draft.winMessage = loseDialogue.message || draft.winMessage;
  }

  const winInteraction = findInteractions(preset, "pixelmon:win_battle")[0];
  const winDialogue = firstResultByType(winInteraction, "pixelmon:open_dialogue");
  const money = firstResultByType(winInteraction, "pixelmon:give_money");
  const setCooldown = firstResultByType(winInteraction, "pixelmon:set_cooldown");
  if (winDialogue) {
    draft.loseMessage = winDialogue.message || draft.loseMessage;
  }
  if (money && Number.isFinite(Number(money.money))) {
    draft.money = Number(money.money);
  }
  if (setCooldown) {
    draft.cooldownEnabled = true;
    draft.cooldownKey = setCooldown.key || draft.cooldownKey;
  }

  const cooldownInteraction = rightClicks.find((item) => findConditionType(item.conditions, "pixelmon:on_cooldown"));
  const cooldownCondition = findConditionType(cooldownInteraction?.conditions, "pixelmon:on_cooldown");
  if (cooldownCondition) {
    draft.cooldownEnabled = true;
    draft.cooldownKey = cooldownCondition.cooldown_key || draft.cooldownKey;
    draft.cooldownAmount = cooldownCondition.cooldown ?? draft.cooldownAmount;
    draft.cooldownUnit = cooldownCondition.unit || draft.cooldownUnit;
    const cooldownMessage = firstResultByType(cooldownInteraction, "pixelmon:message_player");
    draft.cooldownMessage = textFromMessagePlayer(cooldownMessage) || draft.cooldownMessage;
  }

  return draft;
}

function loadJsonFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const preset = JSON.parse(String(reader.result));
      writeDraft(draftFromPresetJson(preset, file.name));
      showToast("JSON carregado.");
    } catch (error) {
      showToast("JSON inválido.");
    } finally {
      loadJsonInput.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

form.addEventListener("input", render);
form.addEventListener("change", render);
byId.cooldownKey.addEventListener("input", () => {
  cooldownKeyWasEdited = true;
});
document.querySelector("#copyButton").addEventListener("click", copyJson);
document.querySelector("#downloadButton").addEventListener("click", downloadJson);
document.querySelector("#resetButton").addEventListener("click", () => {
  writeDraft(DEFAULT_DRAFT);
  showToast("Formulário resetado.");
});
document.querySelector("#loadJsonButton").addEventListener("click", () => loadJsonInput.click());
openPokePasteButton.addEventListener("click", () => {
  pokePasteImportPanel.classList.toggle("hidden");
  if (!pokePasteImportPanel.classList.contains("hidden")) {
    pokePasteInput.focus();
  }
});
closePokePasteButton.addEventListener("click", () => {
  pokePasteImportPanel.classList.add("hidden");
});
applyPokePasteButton.addEventListener("click", importPokePasteParty);
themeToggleButton.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});
loadJsonInput.addEventListener("change", () => {
  const file = loadJsonInput.files?.[0];
  if (file) {
    loadJsonFile(file);
  }
});

setTheme(preferredTheme(), false);
setupCollapsiblePanels();
setupAutocompleteLists();
render();
