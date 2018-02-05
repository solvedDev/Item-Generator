var devBuild = false;
var items = [];
var prefix;
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

//GUI
document.getElementById("json-input").addEventListener("change", function(){
	var fileList = this.files;
	var reader = new FileReader();
	
	//Reading file
	reader.readAsText(fileList[0]);
	reader.callback = updateGUI;
	reader.onload = function() {
		itemJSON = JSON.parse(reader.result);
		
		this.callback();
	};
});

document.getElementById("apply-to-file").addEventListener("change", function(){
	var fileList = this.files;
	var reader = new FileReader();
	
	//Reading file
	reader.readAsText(fileList[0]);
	editedFile = fileList[0].name;
	reader.callback = updateGUI;
	reader.onload = function() {
		entityJSON = JSON.parse(reader.result);
		
		this.callback();
	};
});

document.getElementById("parse-json").addEventListener("click", function(){
	updateGUI();

	if(!devBuild) {
		try {
			if(!itemJSON || !entityJSON) {
				throw new Error("Please select all files first!");
			}
	
			items = itemJSON.items;
			prefix = itemJSON.project.prefix;
		
			toMinecraftJSON(items);
		
			buildStandardComponentGroup();	
			if(!devBuild) location.reload();
		} 
		catch(error) {
			var _errorDiv = document.querySelector(".error");
			_errorDiv.lastChild.textContent = " " + error.message;
			_errorDiv.style.display = "inline-block";
		}
	}
	else {
		items = itemJSON.items;
		prefix = itemJSON.project.prefix;
	
		toMinecraftJSON(items);
	
		buildStandardComponentGroup();	
		if(!devBuild) location.reload();
	}
});


//MAIN
function toMinecraftJSON(pItems) {
	console.log("Started parsing items.json...");

	components = { };
	var resetEvent = { add: { component_groups: [ prefix + ":standard_player" ] }, remove: { component_groups: [ ] } };
	var standardEvent = { add: { component_groups: [ prefix + ":standard_player" ] } };

	var environment_sensor = [ ];
	var events = { };
	var component_groups = { };
	
	//ItemBuilder
	iB = new ItemBuilder(prefix, environment_sensor, events, component_groups);
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
	combineJSON( environment_sensor, events, component_groups );
}

function buildStandardComponentGroup() {
	console.log("Started building standard player...");
	for(var key in components) {
		components[key] = entityJSON["minecraft:entity"].components[key];
		delete entityJSON["minecraft:entity"].components[key];
	}

	for(var key in itemJSON.force_component_reset) {
		components[key] = itemJSON.force_component_reset[key];
	}

	for(var i = 0; i < itemJSON.force_component_removal.length; i++) {
		delete components[itemJSON.force_component_removal[i]];
	}
}

function combineJSON(pEnvironment_sensor, pEvents, pComponent_groups) {
	console.log("Started combining JSON...");

	entityJSON["minecraft:entity"].components["minecraft:environment_sensor"] = pEnvironment_sensor;
	entityJSON["minecraft:entity"].component_groups = pComponent_groups;
	entityJSON["minecraft:entity"].events = pEvents;

	var result = JSON.stringify(entityJSON, null, "\t");

	console.log(result);
	download(editedFile, result);
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
			console.log(_tmp);
			if(_tmp.any_of != undefined && _tmp.any_of.length == 0) {
				delete _tmp.any_of;
			}
			if(_tmp.all_of != undefined &&_tmp.all_of.length == 0) {
				delete _tmp.all_of;
			}
		}
	}
}