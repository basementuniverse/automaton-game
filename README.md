# Automaton

AUT0M4T0N

## TODO

[x] factories
[x] refiners
[x] directional trains, change direction at track end
[x] switches (pipes with variable input rate, multiple inputs and outputs, loop outputs or lock to one)

## Ideas

Consumers have health (initially 100, min 0 max 250; configurable)
Gradually reduce health slowly
When unhappy, reduce health depending on level of product
When neutral, keep health constant
When happy, increase health depending on level of product

Consumers output power depending on health, colour depending on last product consumed

OR:
all units except power stations and resources require power to tick
(ie. the powermap must be > 0 in their tile)

consumers output workers
    constant output tick rate
    worker amount depends on consumer happiness
worker packet has r, g, b amounts
cities store workers (add worker amount to internal capacity; no maximum)
workers travel on roads (can cross pipes)
also add cars, can travel on tracks, only carries people (some maximum internal capacity)
factories and refiners have internal worker amount
    decrement every tick
    if workers <= 0, don't progress (or progress very slowly?)
    if workers > some threshold amount, progress at fast rate
    progress depends on worker amounts:
        more red = 
        more green = 
        more blue = 

power stations
    output colours depending on products, like consumers do now
    no colour filter
    require workers just like factories and refiners



## Instructions

Press SPACE to toggle pause

Press Z/X to scroll through the debug menu and select a tool

## Options

* `new` press ENTER with this selected to clear the board and start again
* `save` press ENTER with this selected to store the board in local storage
* `load` press ENTER with this selected to load from local storage
* `upload` press ENTER with this selected to reload the board from an uploaded json file
* `download` press ENTER with this selected to download the board as a json file
* `delete` click on units to delete them
* `select` some units can be modified by clicking on them with this tool
* `<everything else>` create a unit of this type

## Units


