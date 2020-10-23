(async () => {
	const moduleName = "moar-folders";
	class MoarFolders {
		static registerSettings(){
			game.settings.register(moduleName, "folderDepth", {
				name: game.i18n.localize("MF.SettingFolderDepth"),
				hint: game.i18n.localize("MF.SettingFolderDepthHint"),
				scope: "world",
				config: true,
				type: Number,
				default: 3
			  });
		}

		static initialize(){
			MoarFolders.registerSettings();
		
			CONST.FOLDER_MAX_DEPTH = game.settings.get(moduleName, "folderDepth") || 3;

			//Monkey patch activateListeners so the create folder button is only removed from the final folder
			var oldactivateListeners= SidebarDirectory.prototype.activateListeners;
			SidebarDirectory.prototype.activateListeners= function() {
				let addFunc= function(html){
    				html.find(".folder .folder .folder .create-folder").addClass("create-folder-moar"); 
    				html.find(".folder .folder .folder .create-folder").removeClass("create-folder"); 
				}
				let removeFunc= function(html){
    				html.find(".folder .folder .folder .create-folder-moar").addClass("create-folder"); 
					html.find(".folder .folder .folder .create-folder-moar").removeClass("create-folder-moar"); 

    				html.find(".folder ".repeat(CONST.FOLDER_MAX_DEPTH)+".create-folder").remove(); 
					if ( game.user.isGM ) html.find('.create-folder').click(ev => this._onCreateFolder(ev));
				}
				addFunc.apply(this, arguments);
				const result = oldactivateListeners.apply(this, arguments);
				removeFunc.apply(this, arguments);
				return result;
			};
			//Reload all directories after some time for the changes to take effect
			setTimeout(()=>{
				for (const key in ui) {
					if (ui.hasOwnProperty(key)) {
						const ui_elem = ui[key];
						if(ui_elem.constructor.name.includes("Directory") && !ui_elem.constructor.name.includes("MacroDirectory")) ui_elem.render(true);

					}
				}
			}, 1000);
		}


	}
	Hooks.on('canvasReady', () => MoarFolders.initialize());
})();
