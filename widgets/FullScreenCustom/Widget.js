///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2017 Esri. All Rights Reserved.
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

define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  "dojo/query",
  "dojo/dom-attr",
  'jimu/BaseWidget',
  "dojo/_base/window",
  "dojo/dom",
  'jimu/utils'
], function (declare, lang, html, on, query, domAttr, BaseWidget, win, dom, jimuUtils) {
  var clazz = declare([BaseWidget], {
    name: 'FullScreen',
    baseClass: 'jimu-widget-fullScreen',
    domsCache: {
      appDoc: null
    },
    ACTION: {
      HIDE: "hide",
      SHOW: "show"
    },
    MODE: {
      RESTORE: "restore",
      MAXIMIZE: "maximize"
    },
    state: null,
    _changeColorThemes: ["BillboardTheme", "BoxTheme", "DartTheme", "PlateauTheme"],
	center: null,

    postCreate: function () {
      this.element = dojo.query("[data-widget-name=FullScreenCustom]")[0];
      this.image = dojo.query("[data-widget-name=FullScreenCustom]").children()[0];

      on(this.element, "click", lang.hitch(this, function (evt) {
        this.fullScreenInPortal();
      }));
		
    },

    toggleImage: function () {
      // Si pas de classe ou class == "RESTORE", on restaure
      if (!dojo.hasClass(this.element, this.MODE.RESTORE) && !dojo.hasClass(this.element, this.MODE.MAXIMIZE)) {
        dojo.addClass(this.element, this.MODE.RESTORE);
      }

      if (dojo.hasClass(this.element, this.MODE.RESTORE)) {
        // On change l'image en mode RESTAURE.
        this.element.innerHTML = "<img src=\"/consultation/public/widgets/FullScreenCustom/images/reduire.png\" />";
		query("[data-widget-name=FullScreenCustom]")[0].title = "Ecran réduit";
        // On met la classe "MAXIMIZE" pour indiquer qu'on doit le rendre "MAXIMIZE".
        dojo.removeClass(this.element, this.MODE.RESTORE);
        dojo.addClass(this.element, this.MODE.MAXIMIZE);
      }
     else if (dojo.hasClass(this.element, this.MODE.MAXIMIZE)) {
        this.element.innerHTML = "<img src=\"/consultation/public/widgets/FullScreenCustom/images/icon.png?wab_dv=2.4\" />";
		query("[data-widget-name=FullScreenCustom]")[0].title = "Plein écran";
        // On met la classe "RESTAURE" pour indiquer qu'on doit le rendre "RESTAURE".
        dojo.removeClass(this.element, this.MODE.MAXIMIZE);
        dojo.addClass(this.element, this.MODE.RESTORE);
	
      }
      dojo.removeClass(this.element, "jimu-state-selected");

    },

    startup: function () {
      this.fullScreenBtn.click();
      // this.domsCache.appDoc = win.doc;

      // this.state = this.MODE.RESTORE;
      // //init btn style
      // html.addClass(this.fullScreenBtn, this.state);
      // //need change color in those Themes
      // var themeName = this.appConfig.theme.name;
      // if (this._changeColorThemes.indexOf(themeName) > -1) {
      //   // html.addClass(this.domNode, "jimu-main-background");
      //   html.addClass(this.fullScreenBtn, this.ACTION.HIDE);
      // }

      //click btn fullscreened, and then press F11 restore. At that time must handle event manually.
      // this.own(on(this.domsCache.appDoc,
      //   'webkitfullscreenchange,mozfullscreenchange,MSFullscreenChange,fullscreenchange',
      //   lang.hitch(this, function () {
      //     this._onFullScreenChangeEvent();
      //   })));
      //js test when press F11 btn
      // this.own(on(this.map, 'resize', lang.hitch(this, function () {
      //   setTimeout(lang.hitch(this, function () {
      //     if (jimuUtils.isInConfigOrPreviewWindow()) {
      //       //F11 do nothing in builder here
      //     } else {
      //       this._onFullScreenChangeEvent();
      //     }
      //   }), 400);
      // })));
    },

    fullScreenInPortal: function () {
	  //bha modif
	  this.center = this.map.extent.getCenter();
	  //bha fin modif
      if (parent && parent.appConsultationToFullScreen) {
        parent.appConsultationToFullScreen();
      }
      this.toggleImage();
	  this._repositionMap();
    },
    setPosition: function ( /*position*/ ) {
      this.inherited(arguments);
      var appConfig = window.getAppConfig();
      if (appConfig.theme.name === "DashboardTheme" && !window.appInfo.isRunInMobile) {
        html.setStyle(this.domNode, 'z-index', 110);
        this.placeAt(this._getDBThemeContainer());
      }

      //hide button in mobile
      if (window.appInfo.isRunInMobile || jimuUtils.isMobileUa()) {
        html.addClass(this.domNode, 'mobile');
      } else {
        html.removeClass(this.domNode, 'mobile');
      }
    },

    onAppConfigChanged: function (appConfig) {
      //need change color in those Themes
      var themeName = appConfig.theme.name;
      if (this._changeColorThemes.indexOf(themeName) > -1) {
        html.addClass(this.domNode, "jimu-main-background");
      } else {
        html.removeClass(this.domNode, "jimu-main-background");
      }
    },

    _onFullScreenClick: function () {
      // this._toggleFullScreen();
      // Appel de la fonction d'Abdel
      this.fullScreenInPortal();
    },
    _onFullScreenChangeEvent: function () {
      if (!this._isFullScreen()) {
        this.state = this.MODE.RESTORE;
        this._toggleFullScreen(this.state);
      } else {
        this.state = this.MODE.MAXIMIZE;
      }
      this._toggleBtnIcon();
    },

    _toggleFullScreen: function (mode) {
      if (this._isFullScreen() || mode === this.MODE.RESTORE) {
        this._cancelFullScreen(this.domsCache.appDoc);
      } else {
        this._launchFullScreen(this.domsCache.appDoc.body);
      }
    },

    _toggleBtnIcon: function () {
      if (this.state === this.MODE.RESTORE) {
        html.addClass(this.fullScreenBtn, "restore");
        html.removeClass(this.fullScreenBtn, "maximize");
        html.removeClass(this.domsCache.appDoc.body, "body-fullscreened");
        //html.removeClass(this.fullScreenBtn, "f11");
      } else {
        html.addClass(this.fullScreenBtn, "maximize");
        html.removeClass(this.fullScreenBtn, "restore");
        html.addClass(this.domsCache.appDoc.body, "body-fullscreened");
      }
    },

    _isFullScreen: function () {
      var isFullScreen = this._isElementFullScreen(this.domsCache.appDoc);
      /*test F11: isFullScreen = isFullScreen || this._isFullScreenCountByJS(window);*/
      if (jimuUtils.isInConfigOrPreviewWindow()) {
        //under builder mode
        if (false === this._isFullScreenCountByJS(window) &&
          true === this._isFullScreenCountByJS(this._getBuilderWindow())) {
          isFullScreen = false; //after press F11 in builder, NOT really fullscreen the map
        }
      }
      /* else {
              //launch mode
              // if (this.MODE.RESTORE === this.state && true === this._isFullScreenCountByJS(window)) {
              //   html.addClass(this.fullScreenBtn, "f11");//fullscreened by press f11, can't "restore" window by JS, so mark it
              // }
            }*/
      return isFullScreen;
    },
    _getBuilderWindow: function () {
      //window obj for builder
      return window.parent;
    },
    //for dashboard theme
    _getDBThemeContainer: function () {
      var layoutContainer = null;
      if (window.appInfo.isRunInMobile) {
        layoutContainer = query("#main-page .DashboardTheme")[0];
      } else {
        layoutContainer = query(".jimu-dnd-layout")[0];
      }

      return layoutContainer;
    },
    _isFullScreenCountByJS: function (win) {
      //whether window full of screen
      return (Math.floor(win.innerWidth) === Math.floor(screen.width) &&
        Math.floor(win.innerHeight) === Math.floor(screen.height));
    },
    //fullscreen element is in the window.top.doc
    _isElementFullScreen: function (element) {
      return !(!element.fullscreenElement &&
        !element.mozFullScreenElement &&
        !element.webkitFullscreenElement &&
        !element.msFullscreenElement);
    },
    //in iframe , allowfullscreen="true" is necessary
    _launchFullScreen: function (element) {
      if (element.requestFullScreen) {
        element.requestFullScreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else {
        return false;
      }
    },
    _cancelFullScreen: function (element) {
      if (element.exitFullscreen) {
        element.exitFullscreen();
      } else if (element.mozCancelFullScreen) {
        element.mozCancelFullScreen();
      } else if (element.webkitCancelFullScreen) {
        element.webkitCancelFullScreen();
      } else if (element.msExitFullscreen) {
        element.msExitFullscreen();
      } else {
        return false;
      }
    },
	
	//bha modif		
	_repositionMap: function(){
		var scope = this;		
		setTimeout(function(){
			scope.map.centerAt(scope.center);
		},600);
	}
	//bha fin modif
  });

  return clazz;
});