# Pixelmon NPC Data

These files feed the searchable dropdowns in the trainer generator.

Use one string per entry:

```js
window.PixelmonNpcData.species = [
  "Pikachu",
  "Bulbasaur",
];
```

Categories:

- `species.js`: Pokemon species or simple spec base names.
- `natures.js`: nature ids such as `adamant`.
- `abilities.js`: ability ids such as `multiscale`.
- `held-items.js`: held item ids such as `leftovers`, without `helditem:`.
- `moves.js`: move ids such as `dragon_dance`, without `move1:`.
