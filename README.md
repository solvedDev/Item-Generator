# Item-Generator
This generator simplifies the process of adding custom items to Minecraft Bedrock.

## How it works
Download this repository and navigate to the index.html file. Open it in your browser. Now select the file to which you want to add a custom item behavior (logical choice: player.json). The second file you need to select is a file where you have described your new item behavior. To learn the syntax, scroll further down. After you have selected both files, click "Parse" and you will get the edited player.json (saved in your "Downloads"-folder).

## The syntax
This is an example of a simple item behavior:
```javascript
{
	"project": {
		"name": "xxx",
		"prefix": "example"
	},
	"items": [
		{
			"name": "test",
			"item_replacement": "wooden_sword",
			"activation_domain": "hand",
			"consumable": false,
			"on_use": {
				"minecraft:health": {
					"value": 30,
					"max": 30
				},
				"minecraft:attack": {
					"damage": 9
				}
			}
		}
	]
}
```
Within the project object, one defines a prefix for the whole project. One can find this prefix in front of all component groups and events. The project name doesn't really matter at the moment.

After the project definition, one defines the items.
1. ```name``` = The name of the item  
2. ```item_replacement``` = The item to apply the new behavior to. In order to use data values, simply enter them behind the item ("dye:4").* 
3. ```activate_domain``` = Where the item has to be in order to be considered "activated". Valid inputs are the ones supported by the has_equipment filter by Minecraft (any, armor, feet, hand, head, leg, torso).  
4. ```consumable``` = Whether the item disappears after consuming it (true/false).  
5. ```on_use``` = Put the components which shall be added while holding/using the item here. The syntax follows the default Minecraft syntax and one can input any component though some might not work or cause Minecraft to crash.
