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

document.getElementById("json-input").addEventListener("change", function(){
	var fileList = this.files;
	var reader = new FileReader();
	
	//Reading file
	reader.readAsText(fileList[0]);

	reader.onload = function() {
		itemJSON = JSON.parse(reader.result);
	};
});

document.getElementById("apply-to-file").addEventListener("change", function(){
	var fileList = this.files;
	var reader = new FileReader();
	
	//Reading file
	reader.readAsText(fileList[0]);
	editedFile = fileList[0].name;
	reader.onload = function() {
		entityJSON = JSON.parse(reader.result);
	};
});

document.getElementById("parse-json").addEventListener("click", function(){
	items = itemJSON.items;
	prefix = itemJSON.project.prefix;

	toMinecraftJSON(items);

	buildStandardComponentGroup();
});

function toMinecraftJSON(pItems) {
	components = { };
	var resetEvent = { add: { component_groups: [ prefix + ":standard_player" ] }, remove: { component_groups: [ ] } };

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
		if(pItems[i].consumable) {
			events[prefix + ":on_" + pItems[i].name + "_use"] = buildEvent(pItems[i], resetEvent);
		}
		else {
			events[prefix + ":holds_" + pItems[i].name] = buildEvent(pItems[i], resetEvent);
		}

		//Component Group
		component_groups[ prefix + ":" + pItems[i].name ] = buildComponentGroup(pItems[i]);
		
	}
	
	events[ prefix + ":reset_player" ] = resetEvent;

	buildStandardComponentGroup();
	component_groups[ prefix + ":standard_player" ] = components;

	combineJSON( environment_sensor, events, component_groups );
}

function buildLoop(pItem) {
	var loop = {};

	var loop = new sensorTemplate();
	loop.on_environment.filters.any_of[0].value = pItem.item_replacement;
	loop.on_environment.filters.any_of[0].domain = pItem.activate_domain;

	if(pItem.consumable) {
		loop.on_environment.event = prefix + ":on_" + pItem.name + "_use";
	}
	else {
		loop.on_environment.event = prefix + ":holds_" + pItem.name;
	}

	return loop;
}

function buildEvent(pItem, pResetEvent) {
	var mEvent = { };
	mEvent.add = { component_groups: [  ] };
	mEvent.remove = { component_groups: [ ] };

	var cGroup = prefix + ":" + pItem.name;
	mEvent.add.component_groups.push( cGroup );
	pResetEvent.remove.component_groups.push( cGroup );

	return mEvent;
}

function buildComponentGroup(pItem) {
	var component_group = pItem.on_use;

	for(key in pItem.on_use) {
		components[key] = pItem.on_use[key];
	}

	return component_group;
}

function buildStandardComponentGroup() {
	for(key in components) {
		components[key] = entityJSON["minecraft:entity"].components[key];
		delete entityJSON["minecraft:entity"].components[key];
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