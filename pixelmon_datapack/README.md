# Pixelmon NPC Datapack

Base inicial para presets de NPC treinador do Pixelmon em Minecraft 1.21.1.

## Caminho dos presets

Coloque os JSONs exportados pelo gerador em:

```text
data/customnpcs/pixelmon/npc/preset/trainers/
```

O exemplo incluido pode ser invocado como:

```text
/npc spawn customnpcs:trainers/example_trainer
```

O primeiro treinador oficial do datapack pode ser invocado como:

```text
/npc spawn customnpcs:trainers/peguel
```

## Caminho dos spawns naturais

Os arquivos `.set.json` de spawn ficam em:

```text
data/customnpcs/spawning/npcs/
```

O arquivo `official_trainers.set.json` adiciona o Peguel ao spawn natural de NPCs do Pixelmon como `typeID: "npc"`.

## Observacoes

- `pack.mcmeta` usa `pack_format` 48 para Minecraft 1.21.1.
- O namespace padrao e `customnpcs`.
- Texturas customizadas ainda exigem resource pack separado; este datapack apenas referencia ResourceLocations.
