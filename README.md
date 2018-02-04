# Item-Generator
This generator simplifies the process of adding custom items to Minecraft Bedrock.

## How it works
Download this repository and navigate to the index.html file. Open it in your browser. Now select the file to which you want to add a custom item behavior (logical choice: player.json). The second file you need to select is a file where you have described your new item behavior. To learn the syntax, scroll further down. After you have selected both files, click "Parse" and you will get the edited player.json (saved in your "Downloads"-folder).

## The syntax
This is an example of a simple item behavior:
>{
	"project": {
		"name": "xxx",
		"prefix": "example"
	},
	"items": [
		{
			"name": "test",
			"item_replacement": "wooden_sword",
			"activate_domain": "hand",
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
