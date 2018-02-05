class ItemBuilder {
	constructor(pPrefix, pEnvironment_sensor, pEvents, pComponent_groups) {
		this._prefix = pPrefix;
		this._environment_sensor = pEnvironment_sensor;
		this._events = pEvents;
		this._component_groups = pComponent_groups;
	}

	buildItem(pItem, pResetEvent) {
		//If consumable item, create consume-loot_table
		if(pItem.focus_behavior.consumable) {
			var _tmp = pItem.focus_behavior.turn_into;
			var table = new LootTable( "consume_" + pItem.name, _tmp.item_name, _tmp.item_data, _tmp.item_count );
			table.downloadTable();

			this.buildEffectTimer(pItem);
		}

		//Loop
		this._environment_sensor.push(this.buildLoop(pItem));
		
		//Test whether no custom event is defined
		if(!pItem.on_use.custom_event) {
			//Event
			this._events[eB.getEventName(pItem)] = this.buildEvent(pItem, pResetEvent);
			
			//Component Group
			this._component_groups[ this._prefix + ":" + pItem.name ] = this.buildComponentGroup(pItem);
		}
	}

	buildEffectTimer(pItem) {
		var _effect = pItem.focus_behavior.consume_effect;
		var _effectName = this._prefix + ":active_" + pItem.name + "_timer_" + _effect.duration + "s";
		if(_effect.custom_remove_event) {
			var _tGT = new TimerGroupTemplate(_effect.duration, _effect.custom_remove_event, this._prefix + "/consume_" + pItem.name + ".json");
		}
		else {
			var _tGT = new TimerGroupTemplate(_effect.duration, this._prefix + ":reset_player", this._prefix + "/consume_" + pItem.name + ".json");
		}
		
		this._component_groups[ _effectName ] = _tGT;
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
		
		var _cGroup = this._prefix + ":" + pItem.name;
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