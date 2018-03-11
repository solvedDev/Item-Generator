var conversion = {
	"dye": "dye_powder",
	"wooden": 0,
	"stone": 1,
	"chainmail": 1,
	"iron": 2,
	"golden": 3,
	"diamond": 4
}
var tmpTerrainTextures = {
	resource_pack_name: "vanilla",
	texture_name: "atlas.terrain",
	padding: 8,
	num_mip_levels: 4,
	texture_data: { }
}

var editedTerrainTextures = false;
var usedRedFlowers = false;
var usedYellowFlowers = false;
var usedYellowFlowersDefault = 0;
var langItemNames = "";

function generateAllItemPictures(pItems) {
	for(var i = 0; i < pItems.length; i++) {
		var path = getPathOfItem(pItems[i].item_replacement, pItems[i].name, pItems[i].show_name);
		
		addToResourceZip(path + ".png", itemIMG, {base64: true});
	}

	if(editedTerrainTextures) addToResourceZip("textures/blocks/unknown.png", itemIMG, {base64: true});
}

function getPathOfItem(pItemName, pNewName, pActualName) {
	var _itemID = pItemName.split(":")[0];
	var _itemData = pItemName.split(":")[1];
	if(itemTextures.texture_data[_itemID]) {
		langItemNames += getTranslation(_itemID, _itemData, pActualName, false);

		if(_itemData) {	
			return itemTextures.texture_data[_itemID].textures[_itemData];
		}
		else {
			return itemTextures.texture_data[_itemID].textures;
		}
	}
	else if(terrainTextures.texture_data[_itemID]) {
		langItemNames += getTranslation(_itemID, _itemData, pActualName, true);

		if(_itemData) {
			if(typeof terrainTextures.texture_data[_itemID].textures != "string") {
				if(terrainTextures.texture_data[_itemID].textures[_itemData]) {
					return terrainTextures.texture_data[_itemID].textures[_itemData];
				}
				else {
					createPath(pNewName, _itemID, _itemData);
					return terrainTextures.texture_data[_itemID].textures[_itemData];
				}
			}
			else {
				if(_itemData == 0) {
					return terrainTextures.texture_data[_itemID].textures;
				}
				else {
					terrainTextures.texture_data[_itemID].textures = [terrainTextures.texture_data[_itemID].textures];
					createPath(pNewName, _itemID, _itemData);
					return terrainTextures.texture_data[_itemID].textures[_itemData];
				}
			}
		}
		else {
			return terrainTextures.texture_data[_itemID].textures;
		}
	}
	else {
		var _item = cleverIdFinder(_itemID);

		if(itemTextures.texture_data[_item.id]) {
			langItemNames += getTranslation(_itemID, _itemData, pActualName, false);

			if(_item.data != undefined) {
				return itemTextures.texture_data[_item.id].textures[_item.data];
			}
			else if(_itemData) {
				return itemTextures.texture_data[_item.id].textures[_itemData];
			}
			else {
				return itemTextures.texture_data[_item.id].textures;
			}
		}
		else {
			console.warn("Texture path not found for item/block: " + pItemName + ". Please report this issue to @solvedDev.");
			return "textures/items/unknown";
		}	
	}	
}

function cleverIdFinder(pItemName) {
	var _itemID = pItemName.split("_")[1];
	var _itemData = conversion[pItemName.split("_")[0]];
	if(pItemName == "dye") {
		_itemID = conversion["dye"];
		_itemData = undefined;
	}

	return { id: _itemID, data: _itemData };
}

function createPath(pItemName, pID, pData) {
	if(!editedTerrainTextures) tmpTerrainTextures.resource_pack_name = prefix;
	editedTerrainTextures = true;

	var _tmpArr =  terrainTextures.texture_data[pID].textures;

	for(var i = _tmpArr.length; i < pData; i++ ) {
		_tmpArr.push("textures/blocks/unknown");
	}
	
	_tmpArr.push("textures/blocks/" + pItemName);
	tmpTerrainTextures.texture_data[pID] = {};
	tmpTerrainTextures.texture_data[pID].textures = _tmpArr;
}

function getTranslation(pItemID, pItemData, pActualName, pIsBlock) {
	if(!pIsBlock) {
		return "item." + pItemID + ".name=" + pActualName + "\n";
	}
	else {	
		return getBlockTranslations(pItemID, pItemData, pActualName);
	}
}

function getBlockTranslations(pItemID, pItemData, pActualName) {
	if(pItemID == "yellow_flower") {
		if(pItemData == 0 || pItemData > 8) {
			if(usedYellowFlowersDefault == 0) {
				usedYellowFlowersDefault++;
				return "tile.yellow_flower.dandelion.name=" + pActualName + "\n";
			}
			else if(usedYellowFlowersDefault == 1) {
				usedYellowFlowersDefault++;
				return "tile.yellow_flower.dandelion.name=" + fallbackItemName + "\n";
			}
			return "";
		}
		else {
			if(!usedYellowFlowers) {
				usedYellowFlowers = true;
				return "tile.yellow_flower..name=" + fallbackItemName + "\n";
			}
			return "";
		}
	}
	else if(pItemID == "red_flower") {
		switch(pItemData) {
			case 0: 
				if(!usedRedFlowers) {
					return "tile.red_flower.poppy.name=" + pActualName + "\n";
				}
				return "tile.red_flower.poppy.name=" + fallbackItemName + "\n";
			case 1: return "tile.red_flower.blueOrchid.name=" + pActualName + "\n";
			case 2: return "tile.red_flower.allium.name=" + pActualName + "\n";
			case 3: return "tile.red_flower.houstonia.name=" + pActualName + "\n";
			case 4: return "tile.red_flower.tulipRed.name" + pActualName + "\n";
			case 5: return "tile.red_flower.tulipOrange.name=" + pActualName + "\n";
			case 6: return "tile.red_flower.tulipWhite.name=" + pActualName + "\n";
			case 7: return "tile.red_flower.tulipPink.name=" + pActualName + "\n";
			case 8: return "tile.red_flower.oxeyeDaisy.name=" + pActualName + "\n";
			default: usedRedFlowers = true; return "tile.red_flower.poppy.name=" + fallbackItemName + "\n";
		}
	}
	else {
		return "tile." + pItemID + ".name=" + pActualName + "\n";
	}
}

function generateAllLangFiles() {
	for(var i = 0; i < languages.length; i++) {
		addToResourceZip("texts/" + languages[i] + ".lang", langItemNames);
	}
}