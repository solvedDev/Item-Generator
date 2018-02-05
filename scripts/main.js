var devBuild = true;
var items = [];
var prefix;
var components;
var itemJSON;
var entityJSON;
var editedFile;
var eB = new EventBuilder();

class ItemBuilder {
	constructor(pEnvironment_sensor, pEvents, pComponent_groups) {
		this._environment_sensor = pEnvironment_sensor;
		this._events = pEvents;
		this._component_groups = pComponent_groups;
	}

	buildItem(pItem, pResetEvent) {
		if(pItem.focus_behavior.consumable) {
			var _tmp = pItem.focus_behavior.turn_into;
			var table = new LootTable(prefix + ":consume_" + pItem.name, _tmp.item_name, _tmp.data, _tmp.count );
			table.downloadTable();
		}

		//Loop
		console.log("1) Build loop!");
		this._environment_sensor.push(this.buildLoop(pItem));
		
		//Test whether no custom event is defined
		if(!pItem.on_use.custom_event) {
			console.log("2) Build event!");
			//Event
			this._events[eB.getEventName(pItem)] = this.buildEvent(pItem, pResetEvent);
			
			//Component Group
			console.log("3) Build component group!");
			this._component_groups[ prefix + ":" + pItem.name ] = this.buildComponentGroup(pItem);
		}
	}

	buildLoop(pItem) {
		var _loop = new SensorTemplate(false);
		_loop.on_environment.filters.all_of[0].value = pItem.item_replacement;
		_loop.on_environment.filters.all_of[0].domain = pItem.activation_domain;
	
		if(pItem.filters) {
			var _tmp = _loop.on_environment.filters.any_of;
			_tmp.push.apply(_tmp, pItem.filters.any_of);
	
			_tmp = _loop.on_environment.filters.all_of;
			_tmp.push.apply(_tmp, pItem.filters.all_of);
		}
	
		_loop.on_environment.event = eB.getEventName(pItem);
		
		return _loop;
	}

	buildEvent(pItem, pResetEvent) {
		var _mEvent = { };
		_mEvent.add = { component_groups: [  ] };
		_mEvent.remove = { component_groups: [ ] };
	
		var _cGroup = prefix + ":" + pItem.name;
		_mEvent.add.component_groups.push( _cGroup );
		pResetEvent.remove.component_groups.push( _cGroup );
	
		return _mEvent;
	}

	buildComponentGroup(pItem) {
		var _component_group = pItem.on_use.add_components;
	
		for(var key in pItem.on_use.add_components) {
			components[key] = pItem.on_use.add_components[key];
		}
	
		return _component_group;
	}
} 

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
	
	updateGUI();
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

	//Building the player reset sensor
	var resetSensor = new SensorTemplate(true);
	resetSensor.on_environment.event = prefix + ":reset_player";
	environment_sensor.push( resetSensor );

	//ItemBuilder
	iB = new ItemBuilder(environment_sensor, events, component_groups);

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

	//Combining the JSON and creating the output file
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