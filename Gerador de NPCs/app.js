const RESOURCE_LOCATION_RE = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;
const NAMESPACE_RE = /^[a-z0-9_.-]+$/;
const PATH_RE = /^[a-z0-9_./-]+$/;
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
  partyMode: "spec",
  partySpecs: ["Pikachu lvl:12", "Bulbasaur lvl:10"],
  partyOptions: ["Caterpie", "Metapod", "Butterfree"],
  minSelections: 1,
  maxSelections: 3,
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
const specPartyPanel = document.querySelector("#specPartyPanel");
const randomPartyPanel = document.querySelector("#randomPartyPanel");
const cooldownFields = document.querySelector("#cooldownFields");
const toast = document.querySelector("#toast");
const loadJsonInput = document.querySelector("#loadJsonInput");
const themeToggleButton = document.querySelector("#themeToggleButton");
let cooldownKeyWasEdited = false;
const THEME_STORAGE_KEY = "pixelmonTrainerGeneratorTheme";

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
  "partySpecs",
  "partyOptions",
  "minSelections",
  "maxSelections",
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

function getPartyMode() {
  return document.querySelector("input[name='partyMode']:checked").value;
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
    partyMode: getPartyMode(),
    partySpecs: lines(byId.partySpecs.value),
    partyOptions: lines(byId.partyOptions.value),
    minSelections: intValue("minSelections"),
    maxSelections: intValue("maxSelections"),
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
  document.querySelector("input[name='partyMode'][value='" + next.partyMode + "']").checked = true;
  byId.partySpecs.value = next.partySpecs.join("\n");
  byId.partyOptions.value = next.partyOptions.join("\n");
  byId.minSelections.value = next.minSelections;
  byId.maxSelections.value = next.maxSelections;
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
  if (draft.partyMode === "random") {
    return {
      value: {
        options: draft.partyOptions,
        min_selections: draft.minSelections,
        max_selections: draft.maxSelections,
        type: "pixelmon:random_combination"
      },
      type: "pixelmon:constant"
    };
  }

  return {
    value: {
      specs: draft.partySpecs,
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
  const startResults = [dialogue(draft.dialogueTitle, draft.introMessage)];

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

  interactions.push(interaction("pixelmon:close_dialogue", interactionConditions([constantBoolean(true)]), [battleStart]));
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
    "Pokémon/specs, texturas e battle rules não são checados contra arquivos do jogo nesta v1."
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
  if (draft.partyMode === "spec") {
    if (!draft.partySpecs.length) {
      issues.push("A equipe fixa precisa de ao menos uma spec.");
    }
  } else {
    if (!draft.partyOptions.length) {
      issues.push("A pool aleatória precisa de ao menos uma opção.");
    }
    if (!Number.isInteger(draft.minSelections) || draft.minSelections < 1) {
      issues.push("Mínimo da pool deve ser maior que zero.");
    }
    if (!Number.isInteger(draft.maxSelections) || draft.maxSelections < 1) {
      issues.push("Máximo da pool deve ser maior que zero.");
    }
    if (draft.minSelections > draft.maxSelections) {
      issues.push("Mínimo da pool não pode ser maior que o máximo.");
    }
    if (draft.maxSelections > draft.partyOptions.length) {
      issues.push("Máximo da pool não pode exceder a quantidade de opções.");
    }
  }
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
  specPartyPanel.classList.toggle("hidden", draft.partyMode !== "spec");
  randomPartyPanel.classList.toggle("hidden", draft.partyMode !== "random");
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
  const draft = { ...DEFAULT_DRAFT };
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
    draft.partyMode = "random";
    draft.partyOptions = party.options || draft.partyOptions;
    draft.minSelections = party.min_selections ?? draft.minSelections;
    draft.maxSelections = party.max_selections ?? draft.maxSelections;
  } else if (party?.type === "pixelmon:spec") {
    draft.partyMode = "spec";
    draft.partySpecs = party.specs || draft.partySpecs;
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
render();
