var totalConsumableItems = 0;
var timerGroups = [];

class ItemBuilder {
	constructor(pEnvironment_sensor, pEvents, pComponent_groups) {
		this._environment_sensor = pEnvironment_sensor;
		this._events = pEvents;
		this._component_groups = pComponent_groups;
	}

	buildItem(pItem, pResetEvent) {
		//If consumable item, create consume-loot_table
		if(pItem.focus_behavior.consumable) {
			totalConsumableItems++;

			if(!pItem.focus_behavior.turn_into) {
				throw new Error("Please define an item under 'turn_into'!");
			}

			var _t_i = pItem.focus_behavior.turn_into;
			var table = new LootTable( "consume_" + pItem.name, _t_i.item_name, _t_i.item_data, _t_i.item_count );
			table.addTableToZip();

			this.buildEffectTimer(pItem);

			//Loop: A consumable item needs to be before normal items in the environment_sensor
			this._environment_sensor.splice(1, 0, this.buildLoop(pItem));
		}
		else {
			//Loop
			this._environment_sensor.push(this.buildLoop(pItem));
		}
		
		//Test whether no custom event is defined
		if(!pItem.on_use.custom_event) {
			//Event
			this._events[eB.getEventName(pItem)] = this.buildEvent(pItem, pResetEvent);
			
			//Component Group
			this._component_groups[ prefix + ":" + pItem.name ] = this.buildComponentGroup(pItem);
		}
	}

	buildEffectTimer(pItem) {
		var _effect = pItem.focus_behavior.consume_effect;
		var _effectName = prefix + ":active_" + pItem.name + "_timer";
		if(_effect.custom_remove_event) {
			var _tGT = new TimerGroupTemplate(_effect.duration, _effect.custom_remove_event, prefix + "/consume_" + pItem.name + ".json");
		}
		else {
			var _tGT = new TimerGroupTemplate(_effect.duration, prefix + ":reset_player", prefix + "/consume_" + pItem.name + ".json");
		}
		
		this._component_groups[ _effectName ] = _tGT;
	}	

	buildLoop(pItem) {
		if(pItem.focus_behavior.consumable) {
			var _loop = new SensorTemplate("consume");
			_loop.on_environment.filters.any_of[0].value = pItem.item_replacement;
			_loop.on_environment.filters.any_of[0].domain = pItem.activation_domain;
			_loop.on_environment.filters.any_of[1].value =  "effect_" + pItem.name;
		}
		else {
			var _loop = new SensorTemplate("standard");
			_loop.on_environment.filters.all_of[0].value = pItem.item_replacement;
			_loop.on_environment.filters.all_of[0].domain = pItem.activation_domain;
		}
	
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
		var _cGroup = prefix + ":" + pItem.name;

		if (pItem.focus_behavior.consumable) {
			var _effect = pItem.focus_behavior.consume_effect;
			var _effectName = prefix + ":active_" + pItem.name + "_timer";

			var _mEvent = new EffectEventTemplate( "effect_" + pItem.name, prefix + ":" + pItem.name, _effectName, pItem.item_replacement, pItem.activation_domain );
			pResetEvent.remove.component_groups.push( _effectName );
			timerGroups.push( _effectName );
			if(! pItem.focus_behavior.consume_effect.allow_renewing) {
				_mEvent.sequence[2].filters.any_of.splice(1, 1);
			}
		}
		else {
			var _mEvent = { };
			_mEvent.add = { component_groups: [  ] };
			_mEvent.remove = { component_groups: [ ] };
			
			_mEvent.add.component_groups.push( _cGroup );

			if(_mEvent.remove.component_groups.length == 0) {
				delete _mEvent.remove;
			}
		}

		pResetEvent.remove.component_groups.push( _cGroup );
		return _mEvent;
	}

	buildComponentGroup(pItem) {
		var _component_group = pItem.on_use.add_components;

		if(pItem.focus_behavior.consumable) {
			_component_group["minecraft:type_family"] = {
				family: [ "player", "effect_" + pItem.name, "active_effect"  ]
			}

			itemJSON.force_component_reset["minecraft:type_family"] = {
				family: [ "player", "standard", "no_effect"  ]
			}
		}
	
		for(var key in pItem.on_use.add_components) {
			components[key] = pItem.on_use.add_components[key];
		}
	
		return _component_group;
	}

	finishEvents(pItems, pComponentGroups) {
		var _consumableItems = this.getConsumableItems(pItems);
		var _groupsWithoutTimers = [];
		_groupsWithoutTimers.copy(pComponentGroups);
		this.removeAllTimerGroups( _groupsWithoutTimers );

		for(var i = 0; i < _consumableItems.length; i++) {
			var _currentResetGroups = [];

			_currentResetGroups.copy(_groupsWithoutTimers);
			_currentResetGroups.removeObject( prefix + ":" + _consumableItems[i].name );
			this._events[ eB.getEventName( _consumableItems[i] ) ].sequence[0].remove.component_groups = _currentResetGroups;
		}
	}

	removeAllTimerGroups(pArray) {
		for(var i = 0; i < timerGroups.length; i++) {
			pArray.removeObject( timerGroups[i] );
		}
	}

	//Turn a normal item group into a group which holds all standardComponents (necessary for consumable item groups)
	upgradeGroup(pComponents, pStandardComponents) {
		for(var key in pStandardComponents) {
			if(!pComponents[key]) {
				pComponents[key] = pStandardComponents[key];
			}
		}
	}

	//Returns all consumable items
	getConsumableItems(pItems) {
		var _tmp = [];
		for(var i = 0; i < pItems.length; i++) {
			if(pItems[i].focus_behavior.consumable) {
				_tmp.push(pItems[i]);
			}
		}

		return _tmp;
	}
}