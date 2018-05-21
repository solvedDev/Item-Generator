# Item-Generator
This generator simplifies the process of adding custom items to Minecraft Bedrock. The result of this generator can be part of a normal Minecraft addon and is therefor fully compatible with every Bedrock platform.

## How it works
Visit https://solveddev.github.io/Item-Generator. Alternatively, download this repository, navigate to the index.html file and open it in your browser. Now select the file to which you want to add a custom item behavior (logical choice: player.json). The second file you need to select is a file where you have described your new item behavior. To learn the syntax, scroll further down. After you have selected both files, click "Parse" and you will get the edited player.json (saved in your "Downloads"-folder as a .zip, .mcpack or .mcaddon file). The download includes a pack icon and a completely set up manifest.json. This means you can just click the downloaded file (if you have chosen the .mcpack download) and quickly test your items while working on them.

## The syntax
The syntax I invented is both simple & logical. Below, one can see all at the moment implemented options. You can also find examples further down...

```javascript
{
	"project": {
		"name": "exampleName",
		"description": "example example example",
		"version": [1, 0, 0],
		"prefix": "example",
		"fallback_item_name": "Example Item"
	},
	"items": [
		{
			"name": "test",
			"show_name": "example",
			"item_replacement": "wooden_sword",
			"activation_domain": "hand",
			"filters": {
				"all_of": [ 
					{ "test": "is_example", "value": true }
				],
				"any_of": [
					{ "test": "is_bad_example", "operator": "not", "value": true }
				]
			},
			"focus_behavior": {
				"consumable": false,
				"turn_into": {
					"item_name": "glass_bottle",
					"item_data": 0,
					"item_count": 1
				},
				"consume_effect": {
					"duration": 10,
					"allow_renewing": true,
					"custom_remove_event": "example:reset_player"
				}
			},
			"on_use": {
				"custom_event": "example:holds_example",
				"add_components": {
					"minecraft:health": {
						"value": 30,
						"max": 30
					},
					"minecraft:attack": {
						"damage": 9
					}
				}
			}
		}
	],
	"force_component_reset": {
		"minecraft:health": {
			"value": 20,
			"max": 20
		}
	},
	"force_component_removal": [ "minecraft:attack" ]
}
```
Within the ```project``` object, one defines a prefix for the whole project. One can find this ```prefix``` in front of all component groups and events. The arguments ```name```, ```description``` and ```version``` are used to generate the manifest.json. A ```fallback_item_name``` gets used whenever only one translation can be applied to multiple items.

After the project definition, one defines the items.
1. ```name``` = The unique (!) name of the item  
2. ```show_name``` = The name visible to players in-game
3. ```item_replacement``` = The item to apply the new behavior to. In order to use data values, simply enter them behind the item ("dye:4").  
4. ```activation_domain``` = Where the item has to be in order to be considered "activated". Valid inputs are the ones supported by the has_equipment filter by Minecraft (any, armor, feet, hand, head, leg, torso)
5. ```filters```: Define additional filters for the item here. The syntax follows the normal Minecraft filters
6. ```focus_behavior``` = Define what happens if the player holds the item here. ```consumable``` allows to input *true*/*false* and ```turn_into``` defines which item the player holds after consuming the original item. Use ```consume_effect``` to define how long the component groups stay on the player and whether the effect can be re-applied before it ran out (```allow_renewing```). Advanced users can also define a ```custom_remove_event``` here
7. ```on_use``` = Put the components which shall be added while holding/using the item into the ```add_components``` object. The syntax follows the default Minecraft syntax and one can input any component though some might not work or cause Minecraft to crash. Define a ```custom_event``` to fire when the player holds this item. The automatically generated events follow this naming convention: *prefix:holds_itemName*, *prefix:on_itemName_use* and *prefix:reset_player*. Normally, one doesn't need the custom event so just do not use it if you don't know what you do! The other arguments are a work-in-progress

Some components aren't part of the standard entity. One might need to add these components to the ```force_component_reset``` argument. Make sure to define all needed default arguments.

Some components do not work well with standard values on the player or simply do not need to be resetted. You can force the removal (out of the standard player component group) of a component by adding it to the ```force_component_removal```-array.

## Loot Tables
Consumable items need loot tables. This program automatically generates them and puts them into a folder called your ```prefix``` name.

##	Confused?
Here's the most basic layout of a custom (non-consumable) item:
```javascript
{
	"project": {
		"name": "exampleName",
		"description": "example example example",
		"version": [1, 0, 0],
		"prefix": "example",
		"fallback_item_name": "Sword"
	},
	"items": [
		{
			"name": "ruby_sword",
			"show_name": "Ruby Sword",
			"item_replacement": "wooden_hoe",
			"activation_domain": "hand",
			"focus_behavior": {
				"consumable": false
			},
			"on_use": {
				"add_components": {
					"minecraft:attack": {
						"damage": 9
					}
				}
			}
		}
	]
}
```

A basic consumable item looks like this:

```javascript
{
	"project": {
		"name": "exampleName",
		"description": "example example example",
		"version": [1, 0, 0],
		"prefix": "example",
		"fallback_item_name": "Potion"
	},
	"items": [
		{
			"name": "health_boost_potion",
			"show_name": "Health Boost Potion",
			"item_replacement": "yellow_flower:1",
			"activation_domain": "hand",
			"focus_behavior": {
				"consumable": true,
				"turn_into": {
					"item_name": "glass_bottle",
					"item_data": 0,
					"item_count": 1
				},
				"consume_effect": {
					"duration": 30,
					"allow_renewing": true
				}
			},
			"on_use": {
				"add_components": {
					"minecraft:health": {
						"value": 30,
						"max": 30
					}
				}
			}
		}
	],
	"force_component_reset": {
		"minecraft:health": {
			"value": 20,
			"max": 20
		}
	}
}
```

One can add two custom items like this:
```javascript
{
	"project": {
		"name": "exampleName",
		"description": "example example example",
		"version": [1, 0, 0],
		"prefix": "example",
		"fallback_item_name": "Sword"
	},
	"items": [
		{
			"name": "ruby_sword",
			"show_name": "Ruby Sword",
			"item_replacement": "wooden_hoe",
			"activation_domain": "hand",
			"focus_behavior": {
				"consumable": false
			},
			"on_use": {
				"add_components": {
					"minecraft:attack": {
						"damage": 9
					}
				}
			}
		},
		{
			"name": "emerald_sword",
			"show_name": "Emerald Sword",
			"item_replacement": "stone_hoe",
			"activation_domain": "hand",
			"focus_behavior": {
				"consumable": false
			},
			"on_use": {
				"add_components": {
					"minecraft:attack": {
						"damage": 6
					}
				}
			}
		}
	]
}
```

## Technologies used:
JSZip: https://stuk.github.io/jszip/

FileSaver.js: https://github.com/eligrey/FileSaver.js/

UUID-generator from: https://jsfiddle.net/briguy37/2MVFd/