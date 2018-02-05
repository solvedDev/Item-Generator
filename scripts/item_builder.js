class ItemBuilder {
	constructor(pPrefix, pEnvironment_sensor, pEvents, pComponent_groups) {
		this._prefix = pPrefix;
		this._environment_sensor = pEnvironment_sensor;
		this._events = pEvents;
		this._component_groups = pComponent_groups;
	}

	buildItem(pItem, pResetEvent) {
		if(pItem.focus_behavior.consumable) {
			var _tmp = pItem.focus_behavior.turn_into;
			var table = new LootTable(this._prefix + ":consume_" + pItem.name, _tmp.item_name, _tmp.data, _tmp.count );
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
			this._component_groups[ this._prefix + ":" + pItem.name ] = this.buildComponentGroup(pItem);
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