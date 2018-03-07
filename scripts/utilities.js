var projectZip = new JSZip();
var dataZip = new JSZip();
var resourceZip = new JSZip();
var tmpZip;


function addToDataZip(pFileName, pText, pOption) {
	dataZip.file(pFileName, pText, pOption);
}

function addToResourceZip(pFileName, pText, pOption) {
	resourceZip.file(pFileName, pText, pOption);
}

function addToProjectZip(pFileName, pText, pOption) {
	projectZip.file(pFileName, pText, pOption);
}

async function downloadZip(pType, pTypeString) {
	pType.generateAsync({type:"blob"})
	.then(function(content) {
		if(!checkboxZip.checked) {
			saveAs(content, projectName + " " + pTypeString + ".mcpack");
		}
		else {
			saveAs(content, projectName + " " + pTypeString + ".zip");
		}
	});
}

async function getZip(pZip) {
	await pZip.generateAsync({type:"blob"})
		.then(function(content) {
			tmpZip = content;
		});

	return tmpZip;
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
		if(pItem.on_use.custom_event) {
			return pItem.on_use.custom_event;
		}
		else {
			if(pItem.focus_behavior.consumable) {
				return prefix + ":on_" + pItem.name + "_use";
			}
			else {
				return prefix + ":holds_" + pItem.name;
			}
		}
	}
}

class Manifest {
	constructor(pType, pUUID1, pUUID2, pUUIDResources) {
		this.format_version = 1;
		this.header = {
			description: projectDescription + " | Created with @solvedDev's Item Generator",
			name: projectName,
			uuid: pUUID1,
			version: projectVersion
		}
		
		this.modules = [
			{
				description: prefix + " " + pType,
				type: pType,
				uuid: pUUID2,
				version: [1, 0, 0]
			}
		]

		if(pType == "data" && pUUIDResources) {
			this.dependencies = [
				{
					uuid: pUUIDResources,
					version: projectVersion
				}
			]
		}
	}
}

//From https://jsfiddle.net/briguy37/2MVFd/
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

var languages = [
	"en_US",
	"en_GB",
	"de_DE",
	"es_ES",
	"es_MX",
	"fr_FR",
	"fr_CA",
	"it_IT",
	"ja_JP",
	"ko_KR",
	"pt_BR",
	"pt_PT",
	"ru_RU",
	"zh_CN",
	"zh_TW",
	"nl_NL",
	"bg_BG",
  	"cs_CZ",
	"da_DK",
	"el_GR",
	"fi_FI",
	"hu_HU",
	"id_ID",
	"nb_NO",
	"pl_PL",
	"sk_SK",
	"sv_SE",
	"tr_TR",
	"uk_UA"
]