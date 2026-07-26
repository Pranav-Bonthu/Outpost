# Village sprite prompts (for PixelLab)

Placeholder emoji currently live in `BUILDING_INFO` and `CENTER_TIERS`
in `src/lib/village.ts`. This file has one prompt per level for every
building, ready to paste into PixelLab. When the art exists, wire it up
by mapping `type + level` (or `type + stage` for the four generators,
see note below) to an image path in those same two spots.

## Style anchor

Append this to the end of every single prompt below — it's what keeps
48 separately-generated sprites reading as one consistent world.

```
pixel art game asset, isometric 3/4 view, single building centered on a small transparent-background base, warm cozy color palette (amber, terracotta, cream, soft browns), clean readable silhouette, soft pixel shading, light source from upper-left, no text, no UI, no drop shadow, charming style like Stardew Valley or Clash of Clans village buildings
```

**Sizing:** author at 64×64 for the four generator buildings, 128×128
for the Village Center (it renders larger on the page). Transparent
background. Render with `image-rendering: pixelated` in CSS — no
smoothing.

**Generate order:** do level 1 of all five buildings first and compare
them side by side before batching the rest of each ladder — cheaper to
catch style drift early.

---

## Village Center (8 levels — sets the overall village tier)

```
Level 1 — Campsite: a tiny cozy campsite with a single canvas tent, a small campfire with glowing embers, a couple of logs as seats, a modest wooden signpost.

Level 2 — Cabin: a small log cabin with a stone chimney gently smoking, a wooden porch, one window glowing warm yellow.

Level 3 — Cottage: a stone-and-timber cottage with a thatched roof, flower boxes under the windows, a round wooden door.

Level 4 — Farmstead: a rustic farmhouse with a small barn attached, a windmill beside it, a fenced garden patch.

Level 5 — Hamlet: a cluster of three small connected houses around a shared stone well, lantern light, a cobblestone path.

Level 6 — Village: a small keep-like hall with a modest tower, a bell, flags on top, a low stone wall around it.

Level 7 — Town: a grand town hall with a tall clock tower, multiple chimneys, big arched windows, bunting flags strung between lampposts.

Level 8 — City: a tall central spire building flanked by smaller rooftops, glowing windows at dusk, a small fountain plaza in front.
```

---

## Zoo 🦁 (10 levels)

```
Level 1: a single wooden fence pen with a friendly lion cub peeking out, one small palm tree, a hand-painted "ZOO" sign on a post.

Level 2: a small ticket booth next to the pen, a second animal (a spotted deer) in a neighboring pen, a few more potted plants.

Level 3: a modest zoo entrance gate with a striped awning, two enclosures visible — a giraffe pen and a lion pen — and a popcorn cart out front.

Level 4: the entrance gate gains an arch with carved animal statues, a third enclosure (a zebra pen), colorful bunting flags strung along the fences.

Level 5: a small aviary cage with parrots added, a snack stand selling drinks, a cobblestone path connecting the enclosures.

Level 6: a larger elephant enclosure with a small pond, a covered walkway between exhibits, tiny pixel-figure visitors strolling through.

Level 7: an ornate stone entrance archway replaces the wooden gate, a small aquarium dome appears, a big-cat exhibit with rock formations.

Level 8: a monorail track begins circling above the zoo, a gift shop building added, string lights strung between lampposts for evening hours.

Level 9: a grand safari-lodge-style entrance building, a large glass-domed aviary, a lion pride-rock centerpiece exhibit.

Level 10: the full safari-park complex — the monorail loops all the way around, lanterns light the night sky, a giant welcome banner over the gate, every enclosure lush and thriving.
```

---

## Arena 🏟️ (10 levels)

```
Level 1: a small dirt sparring circle marked with wooden stakes and rope, two torches burning at the entrance.

Level 2: a low wooden fence now encloses the ring, a single wooden bench for spectators, a hand-painted "ARENA" banner.

Level 3: a small wooden bleacher section added on one side, a referee's podium, a modest crowd of spectators.

Level 4: bleachers now wrap two sides of the ring, a simple scoreboard sign, the torches upgraded to iron braziers.

Level 5: a covered awning appears over part of the seating, a small announcer's booth, banners with a lion crest hung on posts.

Level 6: stone foundations replace the wooden fence, tiered stone seating begins on one side, a grand entrance gate.

Level 7: full stone coliseum walls rise around the ring, arched entryways, banners on every column, a bigger crowd.

Level 8: a second seating tier is added above the first, floodlight torches ring the top wall, a champion's box overlooks the ring.

Level 9: the coliseum gains a partial roof canopy over the best seats, glowing braziers light the whole arena, a large trophy displayed at the entrance.

Level 10: the complete floodlit coliseum at night — packed stadium seating all the way around, fireworks over the arena, a championship trophy proudly displayed above the grand entrance.
```

---

## Fried Chicken Place 🍗 (10 levels)

```
Level 1: a tiny food cart with a striped umbrella, a single sizzling fryer basket, a hand-painted drumstick sign.

Level 2: a small wooden counter added beside the cart, one picnic table, a menu chalkboard.

Level 3: the cart becomes a small shack with a walk-up window, a couple more picnic tables, a string of fairy lights.

Level 4: a proper small diner building appears with a few booths visible through the window, a neon "OPEN" sign.

Level 5: a neon drumstick sign mounted on the roof, an outdoor patio with umbrellas, a growing line of customers.

Level 6: a drive-thru lane added along one side, a bigger kitchen extension with steam vents, more parking.

Level 7: the building gains a second story with a rooftop patio, string lights strung across the whole lot, a delivery scooter parked out front.

Level 8: a giant rooftop drumstick mascot statue is installed, the restaurant expands with a covered outdoor dining hall.

Level 9: a grand entrance with golden awnings, a fountain shaped like a chicken bucket, a long line wrapping around the building.

Level 10: the flagship location — a giant golden drumstick statue towers over the entrance, glowing signage, festive string lights everywhere, a bustling crowd of happy customers and steam rising from every vent.
```

---

## Music Festival 🎪 (10 levels)

```
Level 1: a single small striped circus tent, one wooden stage plank, a lone string of fairy lights.

Level 2: a second smaller tent added beside it, a simple speaker propped on a stand, a few scattered festival flags.

Level 3: a modest stage platform with two speaker stacks, colorful bunting strung between poles, a small crowd of dancing figures.

Level 4: string lights now crisscross overhead, a food stall added at the edge, more banners and flags.

Level 5: the stage gains a backdrop banner and a basic stage-lighting rig, a small merch tent, a bigger dancing crowd.

Level 6: a second stage appears at the far end of the grounds, spotlights added, food trucks lining a path between stages.

Level 7: a ferris wheel silhouette rises in the background, the main stage gets a proper roof truss with hanging lights, a larger crowd.

Level 8: laser lights and a fog machine effect at the main stage, multiple food and merch stalls, string-light-covered walkways connecting everything.

Level 9: a grand main stage with pyrotechnic rigs, the ferris wheel fully lit at night, a sprawling festival ground with several tents.

Level 10: the full festival at its peak — the main stage erupts with pyrotechnics and lasers, a massive cheering crowd, the illuminated ferris wheel turning above a sprawling ground of glowing tents and stalls.
```

---

## Village map background (`public/sprites/village-map/`)

The map background used to be three separately-tiled textures (forest,
clearing, path) stamped repeatedly across the world, plus a standalone
pond sprite. That read as an obvious repeating grid, so it was replaced
with **one single cohesive painted scene** covering the whole world,
generated via `create_map_object` (not a tileable texture at all).

`create_map_object`'s basic mode caps canvases at 400×400px, and
`WORLD_WIDTH:WORLD_HEIGHT` (`src/lib/villageMap.ts`) is 1600:1200 — an
exact 4:3 ratio — so the scene is authored at 400×300 and scaled up 4×
in CSS (`background-size: 1600px 1200px`, `image-rendering: pixelated`),
the same "author small, scale up crisply" convention as the building
sprites above.

**World background** (`world-background.png`, 400×300 — forest border,
clearing, hub-and-spoke dirt paths, and the pond all baked into one
image; matches `BUILDING_SLOTS`' proportions so buildings still land in
the open clearing rather than in the trees):
```
a top-down village clearing scene: sunlit dirt clearing with short grass in the center, a small calm pond with lily pads and a gently sloped grassy bank on the left side of the clearing, dense pine and oak forest bordering all edges, four dirt paths radiating outward from the center like spokes toward four building plots, irregular packed-earth path texture with scattered pebbles, warm cozy color palette (amber, terracotta, cream, soft browns), full-frame scene filling the entire canvas edge-to-edge with no transparent gaps, soft pixel shading, light source from upper-left, no text, no UI, no drop shadow, charming style like Stardew Valley or Clash of Clans village layout
```
(`view: "high top-down"`, `detail: "medium detail"`, `shading: "basic
shading"`, `outline: "lineless"`.) Verified after generation: 0%
transparent pixels (fully opaque, no gaps), and the building slot
coordinates all land inside the clearing/path area, not in the forest
corners.

## HUD icons (`public/sprites/hud/`)

Two small standalone icons for the points/money HUD pill
(`src/components/VillageHud.tsx`), authored at 32×32 via
`create_map_object`, transparent background, same style anchor as the
buildings.

**Points icon** (`points-icon.png`):
```
a golden star badge with a small ribbon tail, collectible achievement icon, pixel art game asset, warm cozy color palette (amber, terracotta, cream, soft browns) with a bright gold accent, clean readable silhouette, soft pixel shading, light source from upper-left, no text, no UI, no drop shadow, charming style like Stardew Valley or Clash of Clans
```

**Money icon** (`money-icon.png`):
```
a single shiny gold coin with an embossed symbol, pixel art game asset, warm cozy color palette (amber, terracotta, cream, soft browns) with a bright gold accent, clean readable silhouette, soft pixel shading, light source from upper-left, no text, no UI, no drop shadow, charming style like Stardew Valley or Clash of Clans
```
(Both: `view: "high top-down"`, `detail: "medium detail"`, `shading:
"basic shading"`, `outline: "single color outline"`.)

## Village characters (`public/sprites/characters/<slug>/`)

Walking pixel-art avatars for the village map (`src/components/PlayerCharacter.tsx`),
picked per-member in the profile screen (`src/components/CharacterPicker.tsx`).
Unlike everything above, these are generated via PixelLab's dedicated
character pipeline (`create_character` + `animate_character`), not
`create_map_object` — that pipeline natively produces a rotating,
animatable humanoid instead of a single static image.

**Generation**: `create_character(mode="standard", n_directions=4,
size=64, view="high top-down", detail="medium detail", shading="basic
shading", outline="single color outline")` per character (1 generation),
then `animate_character(template_animation_id="walking-4-frames")` (4
generations, one per direction). Standard 4-direction mode returns
south/east/north/west natively — used directly as down/right/up/left, no
CSS-mirroring needed (unlike the original placeholder pass, which assumed
only one side sprite and flipped it).

**File layout**, one PNG per direction per frame:
```
public/sprites/characters/<slug>/down/frame-1..4.png   (south)
public/sprites/characters/<slug>/up/frame-1..4.png     (north)
public/sprites/characters/<slug>/left/frame-1..4.png   (west)
public/sprites/characters/<slug>/right/frame-1..4.png  (east)
```

**Generate order**: did both initial characters (Wanderer, Scout) before
batching further presets, comparing them against the existing
building/HUD art side by side — same "catch style drift early" reasoning
as the building ladders.

### Characters

```
Wanderer (wanderer): a friendly traveling wanderer with a rustic hooded cloak, a small backpack, and worn leather boots, warm cozy color palette (amber, terracotta, cream, soft browns), charming style like Stardew Valley village folk.

Scout (scout): a nimble scout wearing a green hooded travel cloak with a leather satchel and a small pouch belt, warm cozy color palette (amber, terracotta, cream, soft browns) with mossy green accents, charming style like Stardew Valley village folk.
```

Color variants are not separate art — `CHARACTER_TINTS` in
`src/lib/villageCharacters.ts` applies a CSS `filter` (hue-rotate +
saturate) to the base sprite at render time instead of pre-baking a
palette-swapped PNG per character per color.
