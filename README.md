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

## Instructions

There are 3 types of resource in this game, and they all work slightly differently:

1. Products - they have level (int) and colour (3 bits, r/g/b, so there are 3^2=8 colours in total)

2. Workers - they have level (int)

3. Power - each tile has a colour to signify its power level (float r/g/b)

Products are mined from resources. They travel through pipes, and can be stored in storage. Pass products through chains of factories and refiners to merge/filter their colour and increase their level.

Products can be fed into power stations and consumers.

Consumers eat products and produce workers. Workers travel on paths, and can be stored in cities. Load a worker into a power station, factory or refiner, and the unit will start operating. Each time the unit ticks (eg. every time a factory produces something), the level of the worker will be decremented. When it goes below 0, the worker is disposed and a new one is required.

Power stations require products and workers, and they output a coloured field around them. This field spreads more easily on occupied tiles.

Factories, refiners and consumers will all work without power, but they will tick at their respective 'base tick rates' (ie. quite slowly). When on a powered tile however, we check the power colour against the current work being done (for factories this is a logical AND of the current input products colours, for refiners it is the colour of the product being refined, for consumers it is the colour of the product currently being consumed) and reduce the tick rate accordingly. If your consumer is eating red products, they will tick faster on tiles with red power, for example.

## Units

...

* resource - produce a level-0 product (either red, green or blue) every 1s.

* miner - mine a resource every 1s.

* pipe - transport 1 product at a time.

* storage - store 16/32/64 products (click to cycle modes).

* factory - capacity of 2 products. when capacity is full, merge them to create a new product. new product colour will be logical AND of the 2 input product colours, and the level will be the higher of the 2 unless they are the same, in which case it will be level + 1. requires worker to operate, and has worker capacity of 1. upon producing an item, the worker level will be decremented. if the worker level drops below 0, the factory will stop producing. production time is reduced when in powered tile - the amount depends on how the 2 input product's colour channels match the power colour in this tile. at base production rate, produce a product every 2s.

* refiner - capacity of 1 product. when capacity is full, refine it to make a new product. the new product will have one colour channel filtered out (click to cycle filter modes) and the level will be incremented. requires worker to operate; worker and power requirements identical to factory. at base refining rate, refine a product every 4s.

* road - trucks move along this road.

* truck - can transport 16 products and 16 workers. click to cycle between fast mode (will show '!' icon) and slow mode. use pipes and paths to load and unload. in slow mode, can usually pick up/drop off ~8 items while moving past a pipe or path. in fast mode, ~2 items.

* consumer - has a product capacity 1 and worker capacity 8. also has requirements for particular colour channels. will feed on products and, depending on state, produce workers of the same level as the product and same colour as the product filtered by the consumer's colours. base feeding rate is every 3s, increased in powered tiles depending on current food colour and power colour. ...

* path - same as pipes, but for workers.

* city - same as storage, but for workers.

* powerstation - 

* switch - has 1 product and 1 worker capacity, and takes input from any side. will only output on one side at a time. click to cycle between right, bottom, left, top and rotate modes. in rotate mode, will rotate every 1s.

* scope - 

* cheatbox - 
