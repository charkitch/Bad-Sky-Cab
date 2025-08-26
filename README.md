[Start flying the unfriendly skies.](https://www.charles.kitchen/Bad-Sky-Cab/)

# Bad-Sky-Cab

## What it is
An airborne sidescroller in a city of the future. Zoom past towering structures, avoid speeding delivery trucks and head onwards ever to the right! Now in two flavors, vanilla javascript or rust+wasm.

## A quick history

The original game came out of a weekend project at App Academy in 2018. I made a few major mistakes at the time, the most serious being coupling the game world to the render state ([see line 281 in lib/game.js](lib/game.js#L281)). Meaning that now, on my relatively old M2 laptop, the vehicles zoom by at speeds never intended.

## The Vibe Rerelease

WASM is one of my blind spots, an area of the browser environment I have never interacted with. I am interested in LLM assisted code generation, but thus far I have always used it collaboratively, and in areas I was familiar with. It occurred to me that it would be very interesting to see: how quickly could Claude Code, operating inside a repository with an existing game, spin up a new version of that game in a language entirely unknown to me (Rust) and environment unknown to me (Web Assembly).

The answer was about 4 hours of back and forth.


## In the future of the future

A future feature to implement will be fares with dialogue boxes. A small icon indicating a person, a blurb of text with items pulled from a career array and a destination array ("I'm a robotics tycoon and need to get to the cheese zeppelin-restaurant") on pickup. With destinations always either being a building, a floater platform, or an entertainment dirigible based on a randomized decision at pickup. Once the mechanics are set, a transition in background (from run-down to upscale cloud apartments or rural) would deepen immersion. A retro opening text box or scroll would be ideal but will follow functional implementation of core game mechanics. 


