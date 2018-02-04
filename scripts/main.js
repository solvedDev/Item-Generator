var items = [];
var prefix;
var components;
var itemJSON;
var entityJSON;
var editedFile;

function sensorTemplate() {
	this.on_environment = {
		filters: { 
			any_of: [
				{ test: "has_equipment", subject: "self", domain: "hand", value: "" }
			]
		},
		event: ""
	}
};
function resetSensorTemplate() {
	this.on_environment = {
		filters: { 
			any_of: [
				{ test: "is_family", subject: "self", value: "player" }
			]
		},
		event: ""
	}
};

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
	try {
		if(!itemJSON || !entityJSON) {
			throw new Error("Please select all files first!");
		}
		items = itemJSON.items;
		prefix = itemJSON.project.prefix;
	
		toMinecraftJSON(items);
	
		buildStandardComponentGroup();
	} 
	catch(error) {
		var _errorDiv = document.querySelector(".error");
		_errorDiv.lastChild.textContent = " " + error.message;
		_errorDiv.style.display = "inline-block";
	}
	updateGUI();

	location.reload();
});


//MAIN
function toMinecraftJSON(pItems) {
	components = { };
	var resetEvent = { add: { component_groups: [ prefix + ":standard_player" ] }, remove: { component_groups: [ ] } };
	var standardEvent = { add: { component_groups: [ prefix + ":standard_player" ] } };

	var environment_sensor = [ ];
	var events = { };
	var component_groups = { };

	//Building the player reset sensor
	var resetSensor = new resetSensorTemplate();
	resetSensor.on_environment.event = prefix + ":reset_player";
	environment_sensor.push( resetSensor );

	//Building all custom items
	for(var i = 0; i < pItems.length; i++) {
		//Loop
		environment_sensor.push(buildLoop(pItems[i]));

		//Event
		if(pItems[i].focus_behavior.consumable) {
			events[prefix + ":on_" + pItems[i].name + "_use"] = buildEvent(pItems[i], resetEvent);
		}
		else {
			events[prefix + ":holds_" + pItems[i].name] = buildEvent(pItems[i], resetEvent);
		}

		//Component Group
		component_groups[ prefix + ":" + pItems[i].name ] = buildComponentGroup(pItems[i]);
		
	}
	
	events[ prefix + ":reset_player" ] = resetEvent;
	events[ "minecraft:entity_spawned" ] = standardEvent;

	//This method analyzes which components are used for the item behavior, 
	//removes them from the "components"-object and moves them into an own component group
	buildStandardComponentGroup();
	component_groups[ prefix + ":standard_player" ] = components;

	//Combining the JSON and creating the output file
	combineJSON( environment_sensor, events, component_groups );
}

function buildLoop(pItem) {
	var _loop = {};

	var _loop = new sensorTemplate();
	_loop.on_environment.filters.any_of[0].value = pItem.item_replacement;
	_loop.on_environment.filters.any_of[0].domain = pItem.activation_domain;

	if(pItem.focus_behavior.consumable) {
		_loop.on_environment.event = prefix + ":on_" + pItem.name + "_use";
	}
	else {
		_loop.on_environment.event = prefix + ":holds_" + pItem.name;
	}

	return _loop;
}

function buildEvent(pItem, pResetEvent) {
	var _mEvent = { };
	_mEvent.add = { component_groups: [  ] };
	_mEvent.remove = { component_groups: [ ] };

	var _cGroup = prefix + ":" + pItem.name;
	_mEvent.add.component_groups.push( _cGroup );
	pResetEvent.remove.component_groups.push( _cGroup );

	return _mEvent;
}

function buildComponentGroup(pItem) {
	var _component_group = pItem.on_use.add_components;

	for(var key in pItem.on_use.add_components) {
		components[key] = pItem.on_use.add_components[key];
	}

	return _component_group;
}

function buildStandardComponentGroup() {
	for(var key in components) {
		components[key] = entityJSON["minecraft:entity"].components[key];
		delete entityJSON["minecraft:entity"].components[key];
	}

	for(var key in itemJSON.force_component_reset) {
		components[key] = itemJSON.force_component_reset[key];
	}
}

function combineJSON(pEnvironment_sensor, pEvents, pComponent_groups) {
	entityJSON["minecraft:entity"].components["minecraft:environment_sensor"] = pEnvironment_sensor;
	entityJSON["minecraft:entity"].component_groups = pComponent_groups;
	entityJSON["minecraft:entity"].events = pEvents;

	var result = JSON.stringify(entityJSON, null, "\t");

	console.log(result);
	download(editedFile, result);
}

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
  
	element.style.display = 'none';
	document.body.appendChild(element);
  
	element.click();
	
	document.body.removeChild(element);
}