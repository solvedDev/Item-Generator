var devBuild = true;
var items = [];
var components;
var itemJSON;
var entityJSON;
var editedFile;
var eB = new EventBuilder();

function updateGUI() {
	if(itemJSON) {
		var _doneIcon = document.querySelectorAll("div.input i")[1];
		_doneIcon.style.display = "inline-block";
	}

	if(entityJSON) {
		var _doneIcon = document.querySelectorAll("div.input i")[0];
		_doneIcon.style.display = "inline-block";
	}

	if(itemJSON && entityJSON) {
		var _allDoneIcon = document.querySelectorAll("button#parse-json i")[0];
		_allDoneIcon.style.display = "inline-block";

		var _errorDiv = document.querySelector(".error");
		_errorDiv.style.display = "none";
	}
}

function loadJSON(pIsItem, pFiles) {
	var fileList = pFiles;
	var reader = new FileReader();
	
	//Reading file
	reader.readAsText(fileList[0]);
	reader.callback = window.updateGUI;
	if(!pIsItem) editedFile = fileList[0].name;

	reader.onload = function() {
		if(pIsItem) itemJSON = JSON.parse(reader.result);
		if(!pIsItem) entityJSON = JSON.parse(reader.result);
		this.callback();
	};
}

function setProjectData() {
	items = itemJSON.items;

	prefix = itemJSON.project.prefix;
	projectName = itemJSON.project.name;
	projectDescription = itemJSON.project.description;
	projectVersion = itemJSON.project.version;
	fallbackItemName = itemJSON.project.fallback_item_name;
}

function toMinecraftJSON(pItems) {

	components = { };
	var resetEvent = { add: { component_groups: [ prefix + ":standard_player" ] }, remove: { component_groups: [ ] } };
	var standardEvent = { add: { component_groups: [ prefix + ":standard_player" ] } };

	var environment_sensor = [ ];
	var events = { };
	var component_groups = { };
	
	//ItemBuilder
	iB = new ItemBuilder(environment_sensor, events, component_groups);
	var _consumableItems = iB.getConsumableItems(pItems);
	
	//Building the player reset sensor
	if(_consumableItems.length > 0) {
		var resetSensor = new SensorTemplate("reset_with_effects");
	}
	else {
		var resetSensor = new SensorTemplate("reset");
	}
	resetSensor.on_environment.event = prefix + ":reset_player";
	environment_sensor.push( resetSensor );

	//Building all custom items
	for(var i = 0; i < pItems.length; i++) {
		iB.buildItem(pItems[i], resetEvent);
	}
	
	events[ prefix + ":reset_player" ] = resetEvent;
	events[ "minecraft:entity_spawned" ] = standardEvent;

	//This method analyzes which components are used for the item behavior, 
	//removes them from the "components"-object and moves them into an own component group
	buildStandardComponentGroup();
	component_groups[ prefix + ":standard_player" ] = components;
	for(var i = 0; i < _consumableItems.length; i++) {
		iB.upgradeGroup( component_groups[ prefix + ":" + _consumableItems[i].name ], components );
	}

	//Adding removal of all component_groups for consumable items
	iB.finishEvents( pItems, getComponentGroupNames( component_groups ) );

	//Combining the JSON and creating the output file
	removeEmptyFilters(environment_sensor);
	packageAddon( combineJSON( environment_sensor, events, component_groups ) );
}

function buildStandardComponentGroup() {
	for(var key in components) {
		components[key] = entityJSON["minecraft:entity"].components[key];
		delete entityJSON["minecraft:entity"].components[key];
	}

	if(itemJSON.force_component_reset) {
		for(var key in itemJSON.force_component_reset) {
			components[key] = itemJSON.force_component_reset[key];
		}
	}

	if(itemJSON.force_component_removal) {
		for(var i = 0; i < itemJSON.force_component_removal.length; i++) {
			delete components[itemJSON.force_component_removal[i]];
		}
	}
}

function combineJSON(pEnvironment_sensor, pEvents, pComponent_groups) {
	entityJSON["minecraft:entity"].components["minecraft:environment_sensor"] = pEnvironment_sensor;
	entityJSON["minecraft:entity"].component_groups = pComponent_groups;
	entityJSON["minecraft:entity"].events = pEvents;

	return JSON.stringify(entityJSON, null, "\t");
}

async function packageAddon(pEntityJSON) {
	addToDataZip("entities/" + editedFile, pEntityJSON);

	if(checkboxRes.checked) {
		var rUUID = generateUUID();
		var rManifest = new Manifest("resources", rUUID, generateUUID());
		var dManifest = new Manifest("data", generateUUID(), generateUUID(), rUUID);

		addToResourceZip("manifest.json", JSON.stringify(rManifest, null, "\t"));
		addToResourceZip("pack_icon.png", iconIMG, {base64: true});

		generateAllItemPictures(items);
		generateAllLangFiles();

		if(editedTerrainTextures) addToResourceZip("textures/terrain_texture.json", JSON.stringify(tmpTerrainTextures, null, "\t"));
	}
	else {
		var dManifest = new Manifest("data", generateUUID(), generateUUID());
	}
	
	addToDataZip("manifest.json", JSON.stringify(dManifest, null, "\t"));
	addToDataZip("pack_icon.png", iconIMG, {base64: true});

	if(!checkboxZip.checked && checkboxRes.checked) {
		getAddon();
	}
	else {
		downloadZip(dataZip, "Data");	
		if(checkboxRes.checked) downloadZip(resourceZip, "Res");
	}
}

async function getAddon() {
	var _data = await getZip(dataZip);
	var _res = await getZip(resourceZip);

	projectZip.file(projectName + " Data.mcpack", _data);
	projectZip.file(projectName + " Res.mcpack", _res);

	projectZip.generateAsync({type:"blob"})
		.then(function(content) {
			saveAs(content, projectName +  ".mcaddon");
		});
}

function getComponentGroupNames(pComponentGroups) {
	var _tmp = [];
	for(var key in pComponentGroups) {
		_tmp.push(key);
	}

	return _tmp;
}

function removeEmptyFilters(pEnvironment_sensor) {
	for(var key in pEnvironment_sensor) {
		if(pEnvironment_sensor[key].on_environment) {
			var _tmp = pEnvironment_sensor[key].on_environment.filters;
			if(_tmp.any_of != undefined && _tmp.any_of.length == 0) {
				delete _tmp.any_of;
			}
			if(_tmp.all_of != undefined &&_tmp.all_of.length == 0) {
				delete _tmp.all_of;
			}
		}
	}
}