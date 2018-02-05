function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
  
	element.style.display = 'none';
	document.body.appendChild(element);
  
	element.click();
	
	document.body.removeChild(element);
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