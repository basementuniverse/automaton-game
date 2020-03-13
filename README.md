# Automaton

AUT0M4T0N

## TODO

[x] factories
[x] refiners
[x] directional trains, change direction at track end
[x] switches (pipes with variable input rate, multiple inputs and outputs, loop outputs or lock to one)
[x] workers
[x] consumers output workers
[x] paths (pipes for workers)
[x] cities (storage for workers)
[x] trains carry workers as well
[x] update cheatboxes (now handle workers as well)
[x] update scopes (now display workers as well)
[x] power stations (emit power, require products and workers)
[x] factories and refiners require workers
[x] factories and refiners use power for production/refining rate
[x] consumers use power for feeding rate
[x] consumers have terminal states

## Instructions

...

## Units

...

resource - produce a level-0 product (either red, green or blue) every 1s.

miner - mine a resource every 1s.

pipe - transport 1 product at a time.

storage - store 16/32/64 products (click to cycle modes).

factory - capacity of 2 products. when capacity is full, merge them to create a new product. new product colour will be logical AND of the 2 input product colours, and the level will be the higher of the 2 unless they are the same, in which case it will be level + 1. requires worker to operate, and has worker capacity of 1. upon producing an item, the worker level will be decremented. if the worker level drops below 0, the factory will stop producing. production time is reduced when in powered tile - the amount depends on how the 2 input product's colour channels match the power colour in this tile. at base production rate, produce a product every 2s.

refiner - capacity of 1 product. when capacity is full, refine it to make a new product. the new product will have one colour channel filtered out (click to cycle filter modes) and the level will be incremented. requires worker to operate; worker and power requirements identical to factory. at base refining rate, refine a product every 4s.

road - trucks move along this road.

truck - can transport 16 products and 16 workers. click to cycle between fast mode (will show '!' icon) and slow mode. use pipes and paths to load and unload. in slow mode, can usually pick up/drop off ~8 items while moving past a pipe or path. in fast mode, ~2 items.

consumer - has a product capacity 1 and worker capacity 8. also has requirements for particular colour channels. will feed on products and, depending on state, produce workers of the same level as the product and same colour as the product filtered by the consumer's colours. base feeding rate is every 3s, increased in powered tiles depending on current food colour and power colour. ...

path - same as pipes, but for workers.

city - same as storage, but for workers.

powerstation - 

switch - has 1 product and 1 worker capacity, and takes input from any side. will only output on one side at a time. click to cycle between right, bottom, left, top and rotate modes. in rotate mode, will rotate every 1s.

scope - 

cheatbox - 
