/** APPLICATION GRAND PUBLIQUE  **/

///////////////////////////////////////////////////////////////////////////
// Copyright ? 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

var dojoConfig, jimuConfig;

/*global weinreUrl, loadResources, _loadPolyfills, loadingCallback, debug, allCookies, unescape */

var ie = (function() {

  var undef,
    v = 3,
    div = document.createElement('div'),
    all = div.getElementsByTagName('i');

  div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
  while(all[0]){
    div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
  }
  return v > 4 ? v : undef;
}());



// ajout mag

// Recuperation du profil de l'utilisateur (profil sur le pratil edritorial)
var profilettb = "default";
if(parent.getUserProfi){
	profilettb = parent.getUserProfi();
	if(profilettb){
		
		switch (profilettb) {
			case "interne":
				profilettb = "sgl_3_interne";
				break;
			case "partenaire":
				profilettb = "sgl_2_partenaire";
				break;
		}
	}
}

/**
 * Fonction qui fait appel a notre WS pour extraire l'url de detail
 * de l'element au niveau de Isogeo
 */
magFctGetIsogeoFromUri = function(itemLayerId, layerUrl, _layerInfoTitle) {
	
	var base_url = "https://sig.seinegrandslacs.fr";
	
	// on recuperère l'url de base depuis la config drupal
	if (parent && parent.Drupal && parent.Drupal.settings && parent.Drupal.settings.mag_bloks.url) {
		base_url = parent.Drupal.settings.mag_bloks.url;
	}
	
	
	// verification de l'url pour determiner si on recherche une sous-couche, si c'est le cas, on renvoit pas d'url
	var isSubLayer = false;
	if(layerUrl.split("MapServer/")[1]){
		layerUrl = layerUrl.split("MapServer/")[0] + "MapServer";
		isSubLayer = true;
	}
	
	var queryStr = "";
	if(itemLayerId){
		queryStr = 'q=(id%3A' + itemLayerId + ')%20-type%3A%22Layer%22%20-type%3A%20%22Map%20Document%22%20-type%3A%22Map%20Package%22%20-type%3A%22Basemap%20Package%22%20-type%3A%22Mobile%20Basemap%20Package%22%20-type%3A%22Mobile%20Map%20Package%22%20-type%3A%22ArcPad%20Package%22%20-type%3A%22Project%20Package%22%20-type%3A%22Project%20Template%22%20-type%3A%22Desktop%20Style%22%20-type%3A%22Pro%20Map%22%20-type%3A%22Layout%22%20-type%3A%22Explorer%20Map%22%20-type%3A%22Globe%20Document%22%20-type%3A%22Scene%20Document%22%20-type%3A%22Published%20Map%22%20-type%3A%22Map%20Template%22%20-type%3A%22Windows%20Mobile%20Package%22%20-type%3A%22Layer%20Package%22%20-type%3A%22Explorer%20Layer%22%20-type%3A%22Geoprocessing%20Package%22%20-type%3A%22Desktop%20Application%20Template%22%20-type%3A%22Code%20Sample%22%20-type%3A%22Geoprocessing%20Package%22%20-type%3A%22Geoprocessing%20Sample%22%20-type%3A%22Locator%20Package%22%20-type%3A%22Workflow%20Manager%20Package%22%20-type%3A%22Windows%20Mobile%20Package%22%20-type%3A%22Explorer%20Add%20In%22%20-type%3A%22Desktop%20Add%20In%22%20-type%3A%22File%20Geodatabase%22%20-type%3A%22Feature%20Collection%20Template%22%20-type%3A%22Code%20Attachment%22%20-type%3A%22Featured%20Items%22%20-type%3A%22Symbol%20Set%22%20-type%3A%22Color%20Set%22%20-type%3A%22Windows%20Viewer%20Add%20In%22%20-type%3A%22Windows%20Viewer%20Configuration%22%20&num=10&f=json&profil=' + profilettb;
	}else{
		// on ne devrait jamais passer ici
		queryStr = 'q=(' + layerUrl + ')%20-type%3A%22Layer%22%20-type%3A%20%22Map%20Document%22%20-type%3A%22Map%20Package%22%20-type%3A%22Basemap%20Package%22%20-type%3A%22Mobile%20Basemap%20Package%22%20-type%3A%22Mobile%20Map%20Package%22%20-type%3A%22ArcPad%20Package%22%20-type%3A%22Project%20Package%22%20-type%3A%22Project%20Template%22%20-type%3A%22Desktop%20Style%22%20-type%3A%22Pro%20Map%22%20-type%3A%22Layout%22%20-type%3A%22Explorer%20Map%22%20-type%3A%22Globe%20Document%22%20-type%3A%22Scene%20Document%22%20-type%3A%22Published%20Map%22%20-type%3A%22Map%20Template%22%20-type%3A%22Windows%20Mobile%20Package%22%20-type%3A%22Layer%20Package%22%20-type%3A%22Explorer%20Layer%22%20-type%3A%22Geoprocessing%20Package%22%20-type%3A%22Desktop%20Application%20Template%22%20-type%3A%22Code%20Sample%22%20-type%3A%22Geoprocessing%20Package%22%20-type%3A%22Geoprocessing%20Sample%22%20-type%3A%22Locator%20Package%22%20-type%3A%22Workflow%20Manager%20Package%22%20-type%3A%22Windows%20Mobile%20Package%22%20-type%3A%22Explorer%20Add%20In%22%20-type%3A%22Desktop%20Add%20In%22%20-type%3A%22File%20Geodatabase%22%20-type%3A%22Feature%20Collection%20Template%22%20-type%3A%22Code%20Attachment%22%20-type%3A%22Featured%20Items%22%20-type%3A%22Symbol%20Set%22%20-type%3A%22Color%20Set%22%20-type%3A%22Windows%20Viewer%20Add%20In%22%20-type%3A%22Windows%20Viewer%20Configuration%22%20&num=10&f=json&profil=' + profilettb;
	}
	
	var esri_token = "";
	if(esri_token){
		queryStr = queryStr + "&token=" + esri_token.token + '&=profil' + profilettb;
	}
	
	var url_rqt_mag = base_url + "/services/getCatalogData.php?" + queryStr;
	
	var xhrArgs = {
		url: url_rqt_mag,
		handleAs: "json",
		sync : true
	};
	
	var reponse = dojo.xhrGet(xhrArgs).results[0];
	//console.log(reponse);
	
	if(reponse.results.length > 0){
		if(isSubLayer == false){
			if(reponse.results[0].detailsPageUrl){
				return reponse.results[0].detailsPageUrl;
			}
		}else{
			if(reponse.results[0].isogeo_layers.length > 0){
				var isogeo_layers = reponse.results[0].isogeo_layers;
				for(var i = 0; i < isogeo_layers.length; i++) {
					var isogeo_layer = isogeo_layers[i];
					console.log("isSubLayer - " + isogeo_layer.title);
					if(isogeo_layer.title == _layerInfoTitle){
						console.log("isSubLayer bingo");
						return isogeo_layer.detailsPageUrl;
					}
				}
			}else{
				console.log("pas de sous couche dans le premier service trouvé");
			}
		}
	}
	
	console.log("magFctGetIsogeoFromUri : pas de lien");
	
	/*
	request(url_rqt_mag).then(function(data){
			var searchResponse = JSON.parse(data);
			
			
		}
	).otherwise(function(error) {
	  // TODO handle the error
	  console.warn("searchError", error);
	});
	*/
};

/**
 * Fonction qui fait appel a notre WS pour extraire l'url de detail
 * de l'element au niveau de Isogeo
 */
magFctIsogeosetLayerVisibility = function(layerAfterAdd) {
	
	var layerAfterAdd_id = layerAfterAdd.id;
	
	console.log(layerAfterAdd_id);
	
	//window.parent
			
	var layertrnode = $("[layertrnodeid=" + layerAfterAdd_id + "]");
	var layercontenttrnode = $("[layercontenttrnodeid=" + layerAfterAdd_id + "]");

	
	var sublayersControl = layercontenttrnode.children;
	for(var i = 0; i < sublayersControl.length; i++){
		var subLayerChilds = sublayersControl[i].children[i].children;
		//console.log(subLayerChilds);
		for(var j = 0; j < subLayerChilds.length; j++){
			
			if(subLayerChilds[j].hasAttribute("layercontenttrnodeid")){
				var tables = subLayerChilds[j].querySelectorAll("table");
				for (var ji = 0; ji < tables.length; ji++){
					if(tables[ji].style.display == "table"){
						//console.log(tables[ji]);
						var subSubLayerChilds = tables[ji].children;
						for (var jit = 0; jit < subSubLayerChilds.length; jit++){
							if(subSubLayerChilds[jit].classList.contains("layer-row")){
								console.log(subSubLayerChilds[jit]);
							}
						}
						break;
					}
					
				}
			}
		}
		
	};
};

/**
 * 
 */
magGetGETParam = function (key) {
	var url_string = window.location.href;
	var url = new URL(url_string);
	var c = url.searchParams.get(key);
	//console.log(c);
	
	return c;
};


/**
 * 
 */
magGetUrlItemIdOnPortal = function (layerUrl) {
	var base_url = "https://sig.seinegrandslacs.fr";
	
	// on recuperère l'url de base depuis la config drupal
	if (parent && parent.Drupal && parent.Drupal.settings && parent.Drupal.settings.mag_bloks.url) {
		base_url = parent.Drupal.settings.mag_bloks.url;
	}
	
	var queryStr = "";
	if(layerUrl){
		// on ne devrait jamais passer ici
		queryStr = 'q=(' + layerUrl + ')%20-type%3A%22Layer%22%20-type%3A%20%22Map%20Document%22%20-type%3A%22Map%20Package%22%20-type%3A%22Basemap%20Package%22%20-type%3A%22Mobile%20Basemap%20Package%22%20-type%3A%22Mobile%20Map%20Package%22%20-type%3A%22ArcPad%20Package%22%20-type%3A%22Project%20Package%22%20-type%3A%22Project%20Template%22%20-type%3A%22Desktop%20Style%22%20-type%3A%22Pro%20Map%22%20-type%3A%22Layout%22%20-type%3A%22Explorer%20Map%22%20-type%3A%22Globe%20Document%22%20-type%3A%22Scene%20Document%22%20-type%3A%22Published%20Map%22%20-type%3A%22Map%20Template%22%20-type%3A%22Windows%20Mobile%20Package%22%20-type%3A%22Layer%20Package%22%20-type%3A%22Explorer%20Layer%22%20-type%3A%22Geoprocessing%20Package%22%20-type%3A%22Desktop%20Application%20Template%22%20-type%3A%22Code%20Sample%22%20-type%3A%22Geoprocessing%20Package%22%20-type%3A%22Geoprocessing%20Sample%22%20-type%3A%22Locator%20Package%22%20-type%3A%22Workflow%20Manager%20Package%22%20-type%3A%22Windows%20Mobile%20Package%22%20-type%3A%22Explorer%20Add%20In%22%20-type%3A%22Desktop%20Add%20In%22%20-type%3A%22File%20Geodatabase%22%20-type%3A%22Feature%20Collection%20Template%22%20-type%3A%22Code%20Attachment%22%20-type%3A%22Featured%20Items%22%20-type%3A%22Symbol%20Set%22%20-type%3A%22Color%20Set%22%20-type%3A%22Windows%20Viewer%20Add%20In%22%20-type%3A%22Windows%20Viewer%20Configuration%22%20&num=10&f=json&profil=' + profilettb;
	}else{
		return null;
	}
	
	var esri_token = "";
	if(esri_token){
		queryStr = queryStr + "&token=" + esri_token.token + '&=profil' + profilettb;
	}
	
	var url_rqt_mag = base_url + "/portal/sharing/rest/search?" + queryStr;
		
		
	var xhrArgs = {
		url: url_rqt_mag,
		handleAs: "json",
		sync : true
	};
	
	var reponse = dojo.xhrGet(xhrArgs).results[0];
	//console.log(reponse);
	
	if(reponse.results.length > 0){
		if(reponse.results[0].id){
			return reponse.results[0].id;
		}
	}

};



(function(argument) {
  if (ie < 8){
    var mainLoading = document.getElementById('main-loading');
    var appLoading = document.getElementById('app-loading');
    var ieNotes = document.getElementById('ie-note');
    appLoading.style.display = 'none';
    ieNotes.style.display = 'block';
    mainLoading.style.backgroundColor = "#fff";
    return;
  }

  //handle edit=true parameter
  if(!window.isXT && window.location.pathname.indexOf('/apps/webappviewer') > -1 &&
    window.queryObject.edit === 'true' && window.queryObject.appid){
    window.location.href = window.location.href.replace('webappviewer', 'webappbuilder');
    return;
  }

  var resources = [];
  if (debug) {
    resources.push(weinreUrl);
  }

  if (!window.apiUrl) {
    console.error('no apiUrl.');
  } else if (!window.path) {
    console.error('no path.');
  } else {
    if(window.location.protocol === 'https:'){
      var reg = /^http:\/\//i;
      if(reg.test(window.apiUrl)){
        window.apiUrl = window.apiUrl.replace(reg, 'https://');
      }
      if(reg.test(window.path)){
        window.path = window.path.replace(reg, 'https://');
      }
    }

    /*jshint unused:false*/
    dojoConfig = {
      parseOnLoad: false,
      async: true,
      tlmSiblingOfDojo: false,
      has: {
        'extend-esri': 1
      }
    };

    setLocale();

    resources = resources.concat([
      window.apiUrl + 'dojo/resources/dojo.css',
      window.apiUrl + 'dijit/themes/claro/claro.css',
      window.apiUrl + 'esri/css/esri.css',
      window.apiUrl + 'dojox/layout/resources/ResizeHandle.css',
      window.path + 'jimu.js/css/jimu-theme.css',
      window.path + 'libs/caja-html-sanitizer-minified.js'
    ]);

    if (window.apiUrl.substr(window.apiUrl.length - 'arcgis-js-api/'.length,
      'arcgis-js-api/'.length) === 'arcgis-js-api/') {
      //after build, we put js api here
      //user can also download release api package and put here
      dojoConfig.baseUrl = window.path;
      dojoConfig.packages = [{
        name: "dojo",
        location: window.apiUrl + "dojo"
      }, {
        name: "dijit",
        location: window.apiUrl + "dijit"
      }, {
        name: "dojox",
        location: window.apiUrl + "dojox"
      }, {
        name: "put-selector",
        location: window.apiUrl + "put-selector"
      }, {
        name: "xstyle",
        location: window.apiUrl + "xstyle"
      }, {
        name: "dgrid",
        location: window.apiUrl + "dgrid"
      }, {
        name: "dgrid1",
        location: window.apiUrl + "dgrid1"
      }, {
        name: "dstore",
        location: window.apiUrl + "dstore"
      }, {
        name: "moment",
        location: window.apiUrl + "moment"
      }, {
        name: "esri",
        location: window.apiUrl + "esri"
      }, {
        name: "widgets",
        location: "widgets"
      }, {
        name: "jimu",
        location: "jimu.js"
      }, {
        name: "themes",
        location: "themes"
      }, {
        name: "libs",
        location: "libs"
      }, {
        name: "dynamic-modules",
        location: "dynamic-modules"
      }];

      resources.push(window.apiUrl + '/dojo/dojo.js');
    } else {
      dojoConfig.baseUrl = window.apiUrl + 'dojo';
      dojoConfig.packages = [{
        name: "widgets",
        location: window.path + "widgets"
      }, {
        name: "jimu",
        location: window.path + "jimu.js"
      }, {
        name: "themes",
        location: window.path + "themes"
      }, {
        name: "libs",
        location: window.path + "libs"
      }, {
        name: "dynamic-modules",
        location: window.path + "dynamic-modules"
      }, {
        name: "configs",
        location: window.path + "configs"
      }];

      resources.push(window.apiUrl + 'init.js');
    }

    jimuConfig = {
      loadingId: 'main-loading',
      mainPageId: 'main-page',
      layoutId: 'jimu-layout-manager',
      mapId: 'map'
    };

    loadResources(resources, null, function(url, loaded) {
      if (typeof loadingCallback === 'function') {
        loadingCallback(url, loaded, resources.length);
      }
    }, function() {
      continueLoad();

      function continueLoad(){
        if(typeof require === 'undefined'){
          if (window.console){
            console.log('Waiting for API loaded.');
          }
          setTimeout(continueLoad, 100);
          return;
        }

        _loadPolyfills("", function() {
          window.appInfo.appPath = window.path;
          window.avoidRequireCache(require);
          require(['dojo/aspect', 'dojo/request/util'], function(aspect, requestUtil) {
            window.avoidRequestCache(aspect, requestUtil);

            require(['jimu/main', 'libs/main'], function(jimuMain) {
              //loadingCallback('jimu', resources.length + 1, resources.length);
              jimuMain.initApp();
            });
          });
        });
      }
    });
  }

  function setLocale(){
    if(window.queryObject.locale){
      dojoConfig.locale = window.queryObject.locale.toLowerCase();
      window._setRTL(dojoConfig.locale);
      return;
    }

    if(allCookies.esri_auth){
      /*jshint -W061 */
      var userObj = eval('(' + unescape(allCookies.esri_auth) + ')');
      if(userObj.culture){
        dojoConfig.locale = userObj.culture;
      }
    }

    if(window.queryObject.mode){
      if(allCookies.wab_locale){
        dojoConfig.locale = allCookies.wab_locale;
      }
    }else{
      if(allCookies.wab_app_locale){
        dojoConfig.locale = allCookies.wab_app_locale;
      }
    }


    if(!dojoConfig.locale){
      dojoConfig.locale = navigator.language ? navigator.language : navigator.userLanguage;
    }

    dojoConfig.locale = dojoConfig.locale.toLowerCase();
    window._setRTL(dojoConfig.locale);
  }
})();