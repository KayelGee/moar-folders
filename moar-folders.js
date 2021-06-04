var FOLDER_MAX_DEPTH_MOAR_FOLDERS = CONST.FOLDER_MAX_DEPTH;
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
				default: CONST.FOLDER_MAX_DEPTH
			  });
		}

		static initialize(){
			FOLDER_MAX_DEPTH_MOAR_FOLDERS = game.settings.get(moduleName, "folderDepth") || CONST.FOLDER_MAX_DEPTH;
				
			for (const key in game) {
				if (game.hasOwnProperty(key)) {
					if(game[key]?.directory){
						let dir = game[key].directory;
						let protoclass = eval(game[key].directory.constructor.name);

						if(protoclass?.setupFolders){
							let setupFolders_string = protoclass.setupFolders.toString();
							setupFolders_string = setupFolders_string.replace(/CONST.FOLDER_MAX_DEPTH/g, "FOLDER_MAX_DEPTH_MOAR_FOLDERS");
							protoclass.setupFolders = new Function(`return (function ${setupFolders_string})`)();
						}

						if(protoclass?.setupFolders){
							let _handleDroppedFolder_string = dir._handleDroppedFolder.toString();
							_handleDroppedFolder_string = _handleDroppedFolder_string.replace(/CONST.FOLDER_MAX_DEPTH/g, "FOLDER_MAX_DEPTH_MOAR_FOLDERS");
							_handleDroppedFolder_string = _handleDroppedFolder_string.replace("async", "async function");

							dir._handleDroppedFolder = new Function(`return (${_handleDroppedFolder_string})`)();
						}
					}				
				}
			}

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

    				html.find(".folder ".repeat(FOLDER_MAX_DEPTH_MOAR_FOLDERS)+".create-folder").remove(); 
					if ( game.user.isGM ) {
						html.find('.create-folder').off();
						html.find('.create-folder').click(ev => this._onCreateFolder(ev));
					}
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
						if(ui_elem.constructor.name.includes("Directory") && !ui_elem.constructor.name.includes("MacroDirectory")) ui_elem.render();

					}
				}
			}, 1000);
		}


	}
	Hooks.on('init', () => MoarFolders.registerSettings());
	Hooks.on('ready', () => MoarFolders.initialize());
})();
