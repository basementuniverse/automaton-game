# Automaton

AUT0M4T0N

## TODO

* [x] factories
* [x] refiners
* [x] directional trains, change direction at track end
* [x] switches (pipes with variable input rate, multiple inputs and outputs, loop outputs or lock to one)
* [x] workers
* [x] consumers output workers
* [x] paths (pipes for workers)
* [x] cities (storage for workers)
* [x] trains carry workers as well
* [x] update cheatboxes (now handle workers as well)
* [x] update scopes (now display workers as well)
* [x] power stations (emit power, require products and workers)
* [x] factories and refiners require workers
* [x] factories and refiners use power for production/refining rate
* [x] consumers use power for feeding rate
* [x] consumers have terminal states

## Ideas

Resources should be placed randomly on the map, player can't place them manually (except maybe in 'Creative Mode' - create different game modes? or map editor/generator)

Consumers have requirements, but the player can choose these requirements. Might be cool if these were locked somehow. Like, as the game progresses, the player is rewarded with consumers that they can place, but they have preset requirements...

Terrain:

3 types of terrain (like ground, water, mountains). use perlin noise or voronoi regions or something to make nice looking regions, then use marching squares for 45degree angles, then texture the background with different icons for each. so, the background will be 3 shades of gray, slightly different grid pattern in different places.

different terrain types have different restrictions. powermap spread doesn't cross region boundaries (or it is highly attenuated at these boundaries). maybe can only build pipes, paths, tracks and trains on one of the types. resources appear in abundance on another type, but can't place consumers here, etc...

## Instructions

There are 3 types of resource in this game, and they all work slightly differently:

1. Products - they have level (int) and colour (3 bits, r/g/b, so there are 3^2=8 colours in total)

2. Workers - they have level (int)

3. Power - each tile has a colour to signify its power level (float r/g/b)

Products are extracted from resources. They travel through pipes, and can be stored in storage. Pass products through chains of factories and refiners to merge/filter their colour and increase their level.

Products can be fed into power stations and consumers.

Consumers eat products and produce workers. Workers travel on paths, and can be stored in cities. Load a worker into a power station, factory or refiner, and the unit will start operating. Each time the unit ticks (eg. every time a factory produces something), the level of the worker will be decremented. When it goes below 0, the worker is disposed and a new one is required.

Power stations require products and workers, and they output a coloured field around them. This field spreads more easily on occupied tiles.

Factories, refiners and consumers will all work without power, but they will tick at their respective 'base tick rates' (ie. quite slowly). When on a powered tile however, we check the power colour against the current work being done (for factories this is a logical AND of the current input products colours, for refiners it is the colour of the product being refined, for consumers it is the colour of the product currently being consumed) and reduce the tick rate accordingly. For example, if your consumer is eating red products, they will tick faster on tiles with red power.

## Units

Product:
```
{
    int level
    bool r, g, b
}
```

Worker:
```
{
    int level
}
```

Power:
```
{
    float r, g, b
}
```

* resource - produce a level-0 product (either red, green or blue) every 1s.

* extractor - extract a product from a resource every 1s.

* pipe - transport 1 product at a time.

* storage - store 16/32/64 products (click with the select tool to cycle modes).

* factory - capacity of 2 products. when capacity is full, merge them to create a new product. new product colour will be logical AND of the 2 input product colours, and the level will be the higher of the 2 unless they are the same, in which case it will be level + 1. requires worker to operate, and has worker capacity of 1. upon producing an item, the worker level will be decremented. if the worker level drops below 0, the factory will stop producing. production time is reduced when in powered tile - the amount depends on how the 2 input product's colour channels match the power colour in this tile. at base production rate, produce a product every 2s.

* refiner - capacity of 1 product. when capacity is full, refine it to make a new product. the new product will have one colour channel filtered out (click to cycle filter modes) and the level will be incremented. requires worker to operate; worker and power requirements identical to factory. at base refining rate, refine a product every 4s.

* road - trucks move along this road.

* truck - can transport 16 products and 16 workers. click with the select tool to cycle between fast mode (will show '!' icon) and slow mode. use pipes and paths to load and unload. in slow mode, can usually pick up/drop off ~8 items while moving past a pipe or path. in fast mode, ~2 items.

* consumer - has a product capacity 1 and worker capacity 8. also has requirements for particular colour channels. will feed on products and, depending on state, produce workers of the same level as the product and same colour as the product filtered by the consumer's colours. base feeding rate is every 3s, increased in powered tiles depending on current food colour and power colour. if the consumer consumes a product that fulfills all colour channel requirements, it is happy. if the product doesn't fulfill all requirements, it is neutral, and if the product fulfills no requirements, the consumer is unhappy. there are 4 levels of happiness and unhappiness. the consumer will only produce workers when happy, and the worker level will be the level of the product. if a consumer reaches happiness level 4 and the current product being consumed contains a colour channel that the consumer doesn't have, the colour channel will be added to the consumer's requirements. if a consumer reaches unhappiness level 4, a required colour channel will be removed.

* path - same as pipes, but for workers.

* city - same as storage, but for workers.

* powerstation - has 1 product and 1 worker capacity. requires a worker to operate. will output coloured tiles that spread more easily over occupied tiles. the colour and strength depend on the current product colour and level. these power level and colour of a tile will reduce the tick rate for certain other units depending on the colour of product they are currently processing.

* switch - has 1 product and 1 worker capacity, and takes input from any side. will only output on one side at a time. click with the select tool to cycle between right, bottom, left, top and rotate modes. in rotate mode, will rotate every 1s.

* scope - displays information about the last 5 items that travelled through it. click with the select tool to switch between products/workers/both modes. ticks as quickly as pipes/paths, so doesn't add any delay.

* cheatbox - when empty, outputs level 0 products and level 0 workers as quickly as a pipe or path. click with the select tool to cycle product colours. has 1 product and 1 worker capacity. when it recognises that an input pipe/path has a product or worker, it will clear its inventory before taking the item. when there is a product or worker in its inventory, the level of the produced item will be the highest of their levels + 1. run multiple cheatboxes into each other using pipes or paths to set to the level. useful for debugging and testing.
