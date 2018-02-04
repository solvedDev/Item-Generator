# Item-Generator
This generator simplifies the process of adding custom items to Minecraft Bedrock.

## How it works
Download this repository and navigate to the index.html file. Open it in your browser. Now select the file to which you want to add a custom item behavior (logical choice: player.json). The second file you need to select is a file where you have described your new item behavior. To learn the syntax, scroll further down. After you have selected both files, click "Parse" and you will get the edited player.json (saved in your "Downloads"-folder).

## The syntax
This is an example of a simple item behavior:
```javascript
{
	"project": {
		"name": "exampleName",
		"prefix": "example"
	},
	"items": [
		{
			"name": "test",
			"item_replacement": "wooden_sword",
			"activation_domain": "hand",
			"focus_behavior": {
				"consumable": false,
				"turn_into": "potion:0"
			},
			"on_use": {
				"add_components": {
					"minecraft:health": {
						"value": 30,
						"max": 30
					},
					"minecraft:attack": {
						"damage": 9
					}
				},
				"add_families": [ "example_family" ]
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
Within the ```project``` object, one defines a prefix for the whole project. One can find this prefix in front of all component groups and events. The project name doesn't really matter at the moment.

After the project definition, one defines the items.
1. ```name``` = The name of the item  
2. ```item_replacement``` = The item to apply the new behavior to. In order to use data values, simply enter them behind the item ("dye:4").* 
3. ```activate_domain``` = Where the item has to be in order to be considered "activated". Valid inputs are the ones supported by the has_equipment filter by Minecraft (any, armor, feet, hand, head, leg, torso).  
4. ```focus_behavior``` = Define what happens if the player holds the item here. ```consumable``` allows to input *true*/*false* and ```turn_into``` defines which item the player holds after consuming the original item.
5. ```on_use``` = Put the components which shall be added while holding/using the item into the ```add_components``` object. The syntax follows the default Minecraft syntax and one can input any component though some might not work or cause Minecraft to crash. The other arguments are a work-in-progress.

Some components aren't part of the standard entity. One might need to add these components to the ```force_component_reset``` argument. Make sure to define all needed default arguments.