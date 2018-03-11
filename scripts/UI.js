document.getElementById("json-input").addEventListener("change", function(){
	loadJSON(true, this.files);
});

document.getElementById("apply-to-file").addEventListener("change", function(){
	loadJSON(false, this.files);
});

document.getElementById("parse-json").addEventListener("click", function(){
	updateGUI();
	
	if(!devBuild) {
		try {
			if(!itemJSON || !entityJSON) {
				throw new Error("Please select all files first!");
			}
			
			setProjectData();
			toMinecraftJSON(items);
			location.reload();
		} 
		catch(error) {
			var _errorDiv = document.querySelector(".error");
			_errorDiv.lastChild.textContent = " " + error.message;
			_errorDiv.style.display = "inline-block";
		}
	}
	else {
		setProjectData();
		toMinecraftJSON(items);
	}
});