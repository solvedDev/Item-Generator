function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
  
	element.style.display = 'none';
	document.body.appendChild(element);
  
	element.click();
	
	document.body.removeChild(element);
}

Array.prototype.removeObject = function(pObject) {
	for(var i = 0; i < this.length; i++) {
		if(pObject === this[i]) {
			return this.splice(i, 1);
		}
	}
}

Array.prototype.copy = function(pArray) {
	for(var i = 0; i < pArray.length; i++) {
		this[i] = pArray[i];
	}
}

class EffectEventTemplate {
	constructor(pEffect, pComponentGroupName, pEffectComponentGroup, pActivationItem, pActivationDomain) {
		this.sequence = [
			{
				filters: { test: "is_family", subject: "self", value: pEffect },
				add: {  component_groups: [ pComponentGroupName ] },
				remove: { component_groups: [  ]  }
			},
			{
				filters: { test: "is_family", target: "self", value: "no_effect" },
				add: {  component_groups: [ pComponentGroupName, pEffectComponentGroup ] }
			},
			{
				filters: { 
					all_of: [
						{ test: "has_equipment", subject: "self", domain: pActivationDomain, value: pActivationItem }
					],
					any_of: [
						{ test: "is_family", target: "self", value: "no_effect" },
						{ test: "is_family", target: "self", value: pEffect }
					]
			  	},
			  	add: {  component_groups: [ pComponentGroupName, pEffectComponentGroup ] }
			}
		]
	}

	stringify() {
		return JSON.stringify(this.sequence);
	}
}

class TimerGroupTemplate {
	constructor(pDuration, pEvent, pTable) {
		this["minecraft:timer"] = {
			time: pDuration,
			looping: false,
			time_down_event: {
			  event: pEvent,
			  target: "self"
			}
		}

		this["minecraft:equipment"] = {
			table: "loot_tables/" + pTable
		}
	}
}

class SensorTemplate {
	constructor(pType) {
		if(pType.toLowerCase() == "reset_with_effects") {
			this.on_environment = {
				filters: { 
					any_of: [
						{ test: "is_family", subject: "self", value: "standard" }
					]
				},
				event: ""
			}
		}
		else if(pType.toLowerCase() == "reset") {
			this.on_environment = {
				filters: { 
					any_of: [
						{ test: "is_family", subject: "self", value: "player" }
					]
				},
				event: ""
			}
		}
		else if(pType.toLowerCase() == "standard") {
			this.on_environment = {
				filters: { 
					all_of: [
						{ test: "has_equipment", subject: "self", domain: "", value: "" }
					],
					any_of: [
					]
				},
				event: ""
			}
		}
		else if(pType.toLowerCase() == "consume") {
			this.on_environment = {
				filters: { 
					all_of: [
					],
					any_of: [
						{ test: "has_equipment", subject: "self", domain: "", value: "" },
						{ test: "is_family", subject: "self", value: "" }
					]
				},
				event: ""
			}
		}
		else {
			throw new Error("Unknown SensorTemplate: " + pType);
		}
	}
}

class EventBuilder {
	constructor() {
		
	}

	getEventName(pItem) {
		var _eventName;

		if(pItem.on_use.custom_event) {
			_eventName = pItem.on_use.custom_event;
		}
		else {
			if(pItem.focus_behavior.consumable) {
				_eventName = prefix + ":on_" + pItem.name + "_use";
			}
			else {
				_eventName = prefix + ":holds_" + pItem.name;
			}
		}

		return _eventName;
	}
}