///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
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
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  'dojo/_base/html',
  'dojo/on',
  'dojo/Deferred',
  'dojo/query',
  "./utils",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetBase",
  'esri/undoManager',
  'esri/OperationBase',
  'esri/graphic',
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  'esri/tasks/RelationshipQuery',
  'esri/layers/FeatureLayer',
  "esri/dijit/AttributeInspector",
  'jimu/ConfigManager',
  'jimu/dijit/DropdownMenu',
  'jimu/dijit/LoadingIndicator',
  'jimu/LayerInfos/LayerInfos',
  "esri/tasks/GeometryService",
  "esri/SpatialReference",
  "esri/geometry/Point",
  "esri/geometry/webMercatorUtils"

],
  function (declare, lang, array, html, on, Deferred, domQuery, editUtils,
    _TemplatedMixin, _WidgetBase, UndoManager, operationBase, Graphic,
    Query, QueryTask, RelationshipQuery, FeatureLayer, AttributeInspector,
    ConfigManager, DropdownMenu, LoadingIndicator, jimuLayerInfos, GeometryService, SpatialReference, Point, webMercatorUtils) {
    var Clazz = declare([_WidgetBase, _TemplatedMixin], {
      baseClass: "related-records-editor",
      //templateString: template,
      templateString: "<div>" +
        "<div class='operation-box' data-dojo-attach-point='operationBox'>" +
        "<div class='previos-btn feature-action' data-dojo-attach-point='previouBtn'" +
        "data-dojo-attach-event='click:_onPreviouBtnClick'>" +
        "</div>" +
        "<div class='operation-title' data-dojo-attach-point='operationTitle'></div>" +
        "<div class='add-new-btn' data-dojo-attach-point='addNewBtn'></div>" +
        "</div>" +
        "<div class='content-box' data-dojo-attach-point='contentBox'></div>" +
        "</div>",
      editorATI: null,
      originalFeature: null,
      originalLayer: null,
      originalJimuLayerInfo: null,
      layerInfosObj: null,
      undoManager: null,
      refDomNode: null,
      _temporaryData: null,
      tableInfosParam: null,
      operateur: -1, //operateur 1, planificateur admin 0
      operateurUrl: "",
      expanded: false,
      tabUserName: [],
      tabGrpName: [],
      tabUserGrpName: [],
      //token: "UDHvr6_JQdFpi2Ro5Tf0LloKYeD8ia7mjp-ZLP-zROQJ8hFNyWZH9mFLqNLxTxIBzkP-5jFdNs1QnUKstSAYkrSrCplW2dZafOZwfQKQ8BaScqsF-7Rkov85gopltr3cGbcOnEZuoZvl3n1SNEzTWw..",
      //token: "9-gzwyXv_D9wHgJ7ixWyJyt0-1Ib2060UVUFRxvV4k3yWmmaxtjEBbhubp5QCflWxHbf2n55LQf9oqthWkMsNbKHpK4TADWZz1O3OilROffiwAG1Or7lUD6GGh1upbfy3RaAOnuUgYznLaQeHOUNRJ8ghwfg6tpGqCWwbb0T_1M.",
      token: "Ou7a0ksjsdsYUvPN8cgdJERRlHPiVYAQfDCEjRLVwblkq2rJjDcM3ziuuH4oOiZEJ9qZUa2_nGERAz_b8EOo5NbH-pomjtrXk4_7cn74w8LuKBsCjW4SpDCizJKjXSuCTUJJn4MNOtorQiqshZF7G7ziWy8f2K5gXZjA66lGIuU.",
      exploitantV: null,
      objectidV: null,
      operateurV: null,
      groupeV: null,
      prescripteurV: null,
      activitesV: null,
      categorieV: null,
      mailV: [],
      ptV: null,
      listeOperateur: [],
	  listeOperateur1: [],
      listePrescripteur: [],
      listePrescripteur1: [],
      userMails: "",
      portalUrl: "https://sig.seinegrandslacs.fr", //   todo chnager l'URL
      portalUrl2: "https://sig.seinegrandslacs.fr", 	//"https://dev-sgl.magellium.com:6443", //
      idGroupe: "c61324a126934b8084a7af0a0aceee19", //"aa84f480f9624637844e7bed39724db8", 	//prescripteur
      idGroupeOpe: "e5537b1f854e4cd6bd8ed1219853f72f",  //"af8dcfde3aba431ca8bcb3f2eb81cfb3",
      idGoupeAlerte: "e84bf34e19264b1eb1bbc5cf87ec73b5", //"5837d4707cc84415a992e07c25a1622b", // ginovalertemail
      serviceTravail: "/arcgis/rest/services/Ginov/ginov_creation/FeatureServer/5", //	"/arcgis/rest/services/Collector/ginov_entite2/FeatureServer/4",//
      serviceAnomalie: "/arcgis/rest/services/Ginov/ginov_creation/FeatureServer/4",	//"/arcgis/rest/services/Collector/ginov_entite2/FeatureServer/3",//
      serviceMateriel: "/arcgis/rest/services/Ginov/ginov_creation/FeatureServer/6",
      tabLacMat: [],
      tabLacListe: [],
      materielsV: "",
      lac_matV: "",
      creationTrav: 0,
      creationAno : 0,
      operationData2 : null,
	  utilisateurName: "",
	  utilisateurMail : "",


      postCreate: function () {
        // init
        this._init();
        // place domNode
        html.place(this.domNode, this.refDomNode, "after");
        if (window.isRTL) {
          html.addClass(this.previouBtn, 'icon-arrow-forward');
        } else {
          html.addClass(this.previouBtn, 'icon-arrow-back');
        }

        // create loading indicator
        this.loading = new LoadingIndicator({
          hidden: true
        }).placeAt(this.domNode);

        //  show first page
        this._clearPage();
        this.showFirstPage({
          feature: this.originalFeature,
          oriJimuLayerInfo: this.originalJimuLayerInfo
        });

        //bha modif
        //get user name
        //recuperer l'url du parent de l'iframe
        var username = this.getUrlVars(window.top.location.href)["username"];
		this.utilisateurName = username;
        //this.getPrescGinov(username);
        //this.getUsersFromGinovGrp(this.idGroupe, username);
        //this.getUserViewer(username);

        //recuperer le token 
        this.getValidPortalToken();
        //recuperer la liste des opearteurs et des exploitants

        this.listePrescripteur = [];
        this.listeOperateur = [];
        this.tabLacListe = [];
        //this.getMateriels();
        //this.getGrpId();
        //bha fin modif
      },

      _init: function () {
        this.refDomNode = this.editorATI.domNode;
        this.originalLayer = this.originalFeature.getLayer();
        this.layerInfosObj = jimuLayerInfos.getInstanceSync();
        this.originalJimuLayerInfo = this.layerInfosObj.getLayerOrTableInfoById(this.originalLayer.id);
        this.undoManager = new UndoManager();
        this._temporaryData = {
          eventHandles: [],
          dijits: []
        };
      },

      destroy: function () {
        this._clearPage();
        this.inherited(arguments);
      },

      /***************************
       * Methods for prepare data
       **************************/
      _getRelatedTableInfoArray: function (oriJimuLayerInfo) {
        var def = new Deferred();
        var relatedTableInfoArray = [];
        oriJimuLayerInfo.getRelatedTableInfoArray("esriRelRoleOrigin")
          .then(lang.hitch(this, function (layerInfoArray) {
            array.forEach(layerInfoArray, function (layerInfo) {
              if (this._findTableInfoFromTableInfosParam(layerInfo)) {
                relatedTableInfoArray.push(layerInfo);
              }
            }, this);
            def.resolve(relatedTableInfoArray);
          }));
        return def;
      },

      _getRelatedRecordsByQuery: function (operationData) {
        var def = new Deferred();
        var query = new Query();
        var queryTask = new QueryTask(operationData.destJimuLayerInfo.getUrl());
        var relatedKeyField = operationData.destJimuLayerInfo.layerObject.relationships.keyField;
        var oriLayerObjectIdField = operationData.oriJimuLayerInfo.layerObject.objectIdField;
        if (relatedKeyField) {
          query.where = relatedKeyField + " = " +
            operationData.feature.attributes[relatedKeyField];
        } else {
          query.where = oriLayerObjectIdField + " = " +
            operationData.feature.attributes[oriLayerObjectIdField];
        }
        //query.outSpatialReference = ?
        query.outFields = ["*"];
        queryTask.execute(query, lang.hitch(this, function (relatedRecords) {
          def.resolve(relatedRecords);
        }));
        return def;
      },

      _getRelatedRecordsByRelatedQuery: function (operationData) {
        var def = new Deferred();
        var relatedQuery = new RelationshipQuery();
        var queryRelationship = this._getOriRelationshipByDestLayer(operationData);
        // todo...
        relatedQuery.outFields = ["*"];
        relatedQuery.relationshipId = queryRelationship.id;
        var objectId =
          operationData.feature.attributes[operationData.oriJimuLayerInfo.layerObject.objectIdField];
        relatedQuery.objectIds = [objectId];

        operationData.oriJimuLayerInfo.layerObject.queryRelatedFeatures(
          relatedQuery,
          lang.hitch(this, function (relatedRecords) {
            var features = relatedRecords[objectId] && relatedRecords[objectId].features;
            if (features) {
              def.resolve(features);
            } else {
              def.resolve([]);
            }
          }), lang.hitch(this, function () {
            def.resolve([]);
          })
        );

        return def;
      },

      _getOriRelationshipByDestLayer: function (operationData) {
        var queryRelationship = null;
        // compatible with arcgis service 10.0.
        array.some(operationData.oriJimuLayerInfo.layerObject.relationships, function (relationship) {
          if (relationship.relatedTableId === operationData.destJimuLayerInfo.layerObject.layerId) {//************
            queryRelationship = relationship;
            return true;
          }
        }, this);
        return queryRelationship;
      },


      _getDestRelationshipByDestLayer: function (operationData) {
        var destRelationship = null;
        // compatible with arcgis service 10.0.
        array.some(operationData.destJimuLayerInfo.layerObject.relationships, function (relationship) {
          if (relationship.relatedTableId === operationData.oriJimuLayerInfo.layerObject.layerId) {
            destRelationship = relationship;
            return true;
          }
        }, this);
        return destRelationship;
      },

      _createATI: function (operationData) {
        var relatedJimuLayerInfo = operationData.destJimuLayerInfo;
        var attributeInspector = null;
        // find tableInfo
        var tableInfoResult = this._findTableInfoFromTableInfosParam(relatedJimuLayerInfo);
        if (tableInfoResult) {
          attributeInspector = new Clazz.ATI({
            layerInfos: [tableInfoResult],
            hideNavButtons: true
          }, html.create("div"));
          attributeInspector.startup();
          this._temporaryData.dijits.push(attributeInspector);
        }

        // bindEvent
        var handle = on(attributeInspector, 'delete', lang.hitch(this, this._onDeleteBtnClick, operationData));
        this._temporaryData.eventHandles.push(handle);
        handle = on(attributeInspector, 'attribute-change', lang.hitch(this, this._onAttributeChange, operationData));
        this._temporaryData.eventHandles.push(handle);

        return attributeInspector;
      },

      _findTableInfoFromTableInfosParam: function (jimuLayerInfo) {
        var tableInfoResult = null;
        array.some(this.tableInfosParam, function (tableInfo) {
          if (tableInfo.featureLayer.id === jimuLayerInfo.id) {
            tableInfoResult = tableInfo;
            return true;
          }
        }, this);
        return tableInfoResult;
      },

      _addNewRelatedRecord: function (operationData) {
        var retDef = new Deferred();
        //prepare new related records.
        var attr = {};
        var layerObject = operationData.destJimuLayerInfo.layerObject;
        var oriRelationship = this._getOriRelationshipByDestLayer(operationData);
        var destRelationship = this._getDestRelationshipByDestLayer(operationData);
        // set current date/time for Date field
        array.forEach(layerObject.fields, function (field) {
          if (field.type === "esriFieldTypeDate") {
            var dateObj = new Date();
            attr[field.name] = dateObj.valueOf();
          }
        }, this);
        // keep referential integrity.
        if (oriRelationship.keyField && destRelationship.keyField) {
          var oriKeyField = editUtils.ignoreCaseToGetFieldKey(operationData.oriJimuLayerInfo.layerObject,
            oriRelationship.keyField);
          var destKeyField = editUtils.ignoreCaseToGetFieldKey(operationData.destJimuLayerInfo.layerObject,
            destRelationship.keyField);
          if (oriKeyField && destKeyField) {
            attr[destKeyField] = operationData.feature.attributes[oriKeyField];
          }
        }
        var newRelatedRecordPara = new Graphic(null, null, attr, null);

        // add to related table
        layerObject.applyEdits([newRelatedRecordPara], null, null, lang.hitch(this, function (evt) {
          var addedResult = evt[0];
          if (addedResult.success && addedResult.objectId) {
            var query = new Query();
            var queryTask = new QueryTask(layerObject.url);
            var objectIdField = layerObject.objectIdField;
            query.where = objectIdField + " = " + addedResult.objectId;
            query.outFields = ["*"];
            queryTask.execute(query, lang.hitch(this, function (resultFeatureSet) {
              var newRelatedRecord = resultFeatureSet.features[0];
              if (newRelatedRecord) {
                retDef.resolve(newRelatedRecord);
              } else {
                // This is a guarantee for cannot find newRelatedRecord,
                // newRelatedRecordPara is not having complete attribtes,
                // this can result cannot continuous adding relatedRecord for related table chain.
                newRelatedRecordPara.attributes[layerObject.objectIdField] = addedResult.objectId;
                retDef.resolve(newRelatedRecordPara);
              }
            }), lang.hitch(this, function () {
              retDef.reject();
            }));
          } else {
            retDef.reject();
          }
        }), lang.hitch(this, function () {
          retDef.reject();
        }));
        return retDef;
      },

      _deleteRelatedRecord: function (operationData) {
        var retDef = new Deferred();
        var relatedLayerObject = operationData.destJimuLayerInfo.layerObject;
        relatedLayerObject.applyEdits(null,
          null,
          [operationData.relatedFeature],
          lang.hitch(this, function () {
            retDef.resolve();
          }), lang.hitch(this, function () {
            retDef.reject();
          }));
        return retDef;
      },

      _updateRelatedRecord: function (operationData, attributeChangeEvt) {
        var retDef = new Deferred();
        var relatedLayerObject = operationData.destJimuLayerInfo.layerObject;
        var relatedFeature = operationData.relatedFeature;
        relatedFeature.attributes[attributeChangeEvt.fieldName] = attributeChangeEvt.fieldValue;
        relatedLayerObject.applyEdits(null,
          [relatedFeature],
          null,
          lang.hitch(this, function () {
            retDef.resolve();
          }), lang.hitch(this, function () {
            retDef.reject();
          }));
        return retDef;
      },

      _getDisplayTitleOfRelatedRecord: function (relatedLayerInfo, relatedRecord, displayFieldKey) {
        var displayTitle;
        var popupInfoTemplate = relatedLayerInfo.getInfoTemplate();
        if (displayFieldKey === "popupTitle" && popupInfoTemplate) {
          if (typeof popupInfoTemplate.title === "function") {
            displayTitle = popupInfoTemplate.title(relatedRecord);
          } else {
            displayTitle = popupInfoTemplate.title;
          }
        } else {
          displayTitle = editUtils.getAttrByFieldKey(relatedRecord, displayFieldKey);
        }

        if (displayTitle) {
          var displayFieldObject =
            editUtils.ignoreCaseToGetFieldObject(relatedLayerInfo.layerObject, displayFieldKey);
          if (displayFieldObject &&
            displayFieldObject.type &&
            displayFieldObject.type === "esriFieldTypeDate") {
            displayTitle = editUtils.getLocaleDateTime(displayTitle);
          }
          //todo... supports coded value
        } else {
          displayTitle = "";
        }

        return displayTitle;
      },

      /*************************
       * Methods for operations
       *************************/
      showRelatedRecords: function (operationData) {
        this._changeRefDomNode();
        // set operation title
        var destLayerObject = operationData.destJimuLayerInfo.layerObject;
        var relatedLayerName =
          lang.getObject('_wabProperties.originalLayerName', false, destLayerObject) ||
          operationData.destJimuLayerInfo.title;
        this._setOperationTitle(relatedLayerName);

        this._clearPage();
        this.loading.show();
        this._getRelatedRecordsByRelatedQuery(operationData)
          .then(lang.hitch(this, function (relatedRecords) {


            //bha modif
            //on ajoute pas le bouton + pour travail dans le cas d'un operateur 
            //todo recuperer si le user est un operateur ou pas
            if (this.operateur != -1) {
              if (!relatedLayerName.includes("rav") || this.operateur != 1) {//todo trav
                this._showAddNewBtn(operationData);
              }
            }
            //bha fin modif

            // show title
            if (relatedRecords.length > 0) {
              this._setTitle(window.jimuNls.popup.relatedRecords);
            } else {
              this._setTitle(window.jimuNls.popup.noRelatedRecotds, 'font-normal');
            }

            // show fieldSelector
            var displayFieldName = this._showFieldSelector(operationData.destJimuLayerInfo);

            var scope = this;
            // show related records
            array.forEach(relatedRecords, function (relatedRecord, index) {
              var displayTitle = this._getDisplayTitleOfRelatedRecord(operationData.destJimuLayerInfo,
                relatedRecord,
                displayFieldName);

              var backgroundClass = (index % 2 === 0) ? 'oddLine' : 'evenLine';
              var recordItem = html.create('div', {
                'class': 'item record-item ' + backgroundClass,
                innerHTML: displayTitle
              }, this.contentBox);
              recordItem.relatedRecord = relatedRecord;

              var handle = on(recordItem, 'click', lang.hitch(this, function () {

                //bha modif
                //console.log(relatedLayerName);

                //bha fin modif

                this._addOperation(Clazz.OPERATION_SHOW_RELATED_RECORDS, operationData);
                // show inspector
                this.showInspector(this._createOperationData(operationData.feature,
                  operationData.oriJimuLayerInfo,
                  operationData.destJimuLayerInfo,
                  relatedRecord));
              }));
              this._temporaryData.eventHandles.push(handle);
            }, this);

            this.loading.hide();

            //bha modif 
            //modifier titre Aucun enregistrement...
            var txtDivTab = document.getElementsByClassName("title-box font-normal");
			for(i=0;i<txtDivTab.length;i++){
				var txtDiv = txtDivTab[i];
				if (txtDiv != undefined && txtDiv.textContent == "Aucun enregistrement associé trouvé.") {
				  if (relatedLayerName.includes("rav")) {
					txtDiv.textContent = "Aucun travail trouvé.";
				  }
				  else if (relatedLayerName.includes("nomal")) {
					txtDiv.textContent = "Aucune anomalie trouvée.";
				  }
				}
			}
            //bha fin modif

          }));
      },

      showInspector: function (operationData) {
        this._changeRefDomNode();
        // set operation title
        var destLayerObject = operationData.destJimuLayerInfo.layerObject;
        var relatedLayerName =
          lang.getObject('_wabProperties.originalLayerName', false, destLayerObject) ||
          operationData.destJimuLayerInfo.title;

        var relatedsListDisplayFieldName =
          lang.getObject("_wabProperties.popupInfo.displayFieldOfRelatedRecordList", false, destLayerObject);

        var operationTitle = this._getDisplayTitleOfRelatedRecord(operationData.destJimuLayerInfo,
          operationData.relatedFeature,
          relatedsListDisplayFieldName);

        if (relatedsListDisplayFieldName !== "popupTitle") {
          operationTitle = relatedLayerName + ": " + operationTitle;
        }

        this._setOperationTitle(operationTitle);

        // clear page
        this._clearPage();
        this.loading.show();

        // create ATI for relatedLayer
        var attributeInspector = this._createATI(operationData);
        if (attributeInspector) {
          html.place(attributeInspector.domNode, this.contentBox); //console.log(attributeInspector.domNode);
        }

        // edit related feature
        // related feature is correspond to operationData.destJimuLayerInfo
        var objectIdField = operationData.destJimuLayerInfo.layerObject.objectIdField;
        var tableQuery = new Query();
        tableQuery.where = objectIdField + " = " +
          operationData.relatedFeature.attributes[objectIdField];
        //bha modif
        //todo changer le nom des champs: majuscule , prescripteur...
        //console.log(operationData.relatedFeature.attributes);
        this.objectidV = operationData.relatedFeature.attributes[objectIdField];
        if (operationData.relatedFeature.attributes["operateur"] == null) {
          this.operateurV = "";
        }
        else {
          this.operateurV = operationData.relatedFeature.attributes["operateur"];//console.log(this.operateurV);
        }
        if (operationData.relatedFeature.attributes["groupe"] == null) {
          this.groupeV = "";
        }
        else {
          this.groupeV = operationData.relatedFeature.attributes["groupe"];
        }
        if (operationData.relatedFeature.attributes["prescripteur"] == null) {
          this.prescripteurV = "";
        }
        else {
          this.prescripteurV = operationData.relatedFeature.attributes["prescripteur"];
        }
        if (operationData.relatedFeature.attributes["operateur"] == null) {
          this.operatV = "";
        }
        else {
          this.operatV = operationData.relatedFeature.attributes["operateur"];
        }

        //console.log(operationData.relatedFeature.attributes);
        if (operationData.relatedFeature.attributes["categories"] == null) {		//todo rec "categories"
          this.categorieV = "";
        }
        else {
          this.categorieV = operationData.relatedFeature.attributes["categories"];	//todo rec "categories"
        }

        if (operationData.relatedFeature.attributes["activites"] == null) {
          this.activitesV = "";
        }
        else {
          this.activitesV = operationData.relatedFeature.attributes["activites"];
        }

        if (operationData.relatedFeature.attributes["materiels"] == null) {
          this.materielsV = "";
        }
        else {
          this.materielsV = operationData.relatedFeature.attributes["materiels"];
        }

        if (operationData.relatedFeature.attributes["lac_mat"] == null) {
          this.lac_matV = "";
        }
        else {
          this.lac_matV = operationData.relatedFeature.attributes["lac_mat"];
        }


        this.ptV = operationData.feature.geometry;

        //bha fin modif
        operationData.destJimuLayerInfo.layerObject.selectFeatures(tableQuery,
          FeatureLayer.SELECTION_NEW,
          lang.hitch(this, function () {
            //bha modif
            //champs non modifiable pour un operateur
            this.listeOperateurs(attributeInspector, relatedLayerName);
            this.listeExploitant(attributeInspector, relatedLayerName);
            this.listeMateriels(attributeInspector, relatedLayerName);
            this.creatAnomalie(operationData, attributeInspector, relatedLayerName);
            if (this.operateur != -1) {
              if (this.operateur == 1) {
                //supprmier le bouton supprimer par defaut
                var dBtn = document.getElementsByClassName("dijitReset dijitInline dijitButtonNode");
                for (k = 0; k < dBtn.length; k++) {
                  dBtn[k].textContent = "●Supprimer";
                  dBtn[k].style.display = "none";
                }
                this.modifyFiche(attributeInspector, relatedLayerName);
                this.statutAnomalie(attributeInspector, relatedLayerName);
              }
              else if (this.operateur == 0) {
                //ajout du bouton imprimer pour les planificateurs sur la fiche travail
                this.addPrintBtn(attributeInspector, operationData, relatedLayerName);

                //integration des groupes et utilisateurs Portal
                this.tabUserName = [];
                this.tabGrpName = [];
                this.tabUserGrpName = [];
                this.assignation(attributeInspector, relatedLayerName);
              }
            }
            else {
              this.disabledAttr(attributeInspector, relatedLayerName);
            }
            //bha fin modif
            this.loading.hide();
            /*
            // change/show inspector title
            var atiLayerNameDom = query(".atiLayerName", attributeInspector.domNode)[0];
            if(atiLayerNameDom) {
              html.setStyle(atiLayerNameDom, 'display', 'block');
            }
            */
          }));

        this.showRelatedTables(this._createOperationData(operationData.relatedFeature,
          operationData.destJimuLayerInfo,
          null,
          null),
          operationData);
      },

	  //verifier si une entité libre a des anomalies ou des travaux
	  hasRelatedFeatures: function(id, url, btnD){
		//https://sig.seinegrandslacs.fr/arcgis/rest/services/Ginov/ginov_creation/FeatureServer/1/queryRelatedRecords?f=json&definitionExpression=&relationshipId=2&returnGeometry=false&objectIds=1601&outFields=*&token=iJBRyCJqBYVtNcrA0zu4f7mic7ZYR4JhUhkT2xU5nc4DaKctpMnsEGbBC4YrD3Mdvk4bG1cOSgS5Ou_E4KK2J7nGuVV73v94-zqvOrFtuPJNxQaTzn6BP3_nQbvEPwYGXQhSVxdbv8l8WM_MsGlS2o-AtVwzjb8FVh8MwgjD1Edgtew01VrHgdpeCvC1s7lB7wqmnarPKGAwgo77SQj3YlTXqH3pUOn8bC-LzfH3waQ.  
		  var scope2 = this;
		  //recuperation de la valeur de laisaoon entre la couche et les tables anomalies et travaux
		  var urlIndex = url.split('/');
		  urlIndex = urlIndex[urlIndex.length-1];
		  var ano = -1;
		  var trav = -1;
		  if(urlIndex == 0){
			  ano = 0;
			  trav = 1;
		  }
		  else if (urlIndex == 1){
			  ano = 2;
			  trav = 3;
		  }
		  else if(urlIndex == 3){
			  ano = 6;
			  trav = 7;
		  }
		  
		  token = '';
		  //recuperer le token
		  $.ajax({
			  type: 'GET',
			  url: scope2.portalUrl + '/services/getProfilIds.php',
			  data: {
				idFunc: "getPortalTokenGINOV"
			  },
			  success: function (token0) {
				  token = token0;
				 $.ajax({
				  type: 'GET',
				  url: url + '/queryRelatedRecords?f=json&definitionExpression=&relationshipId='+ ano +'&returnGeometry=false&objectIds='+id+'&outFields=*&token=' + token,
				  success: function (result) {
					result = JSON.parse(result);
					//console.log(result);
					var exist = 0;
					if(result.relatedRecordGroups.length == 0){
						//console.log(result.relatedRecordGroups[0].relatedRecords.length);
						$.ajax({
							  type: 'GET',
							  url: scope2.portalUrl + '/services/getProfilIds.php',
							  data: {
								idFunc: "getPortalTokenGINOV"
							  },
							  success: function (token) {
								 $.ajax({
								  type: 'GET',
								  url: url + '/queryRelatedRecords?f=json&definitionExpression=&relationshipId='+ trav +'&returnGeometry=false&objectIds='+id+'&outFields=*&token=' + token,
								  success: function (result) {
									result = JSON.parse(result);
									//console.log(result);
									if(result.relatedRecordGroups.length == 0){
										exist = 0;
										for(i=0;i<btnD.childNodes.length;i++){
											if(btnD.childNodes[i].className == "dijit dijitReset dijitInline dijitButton atiButton atiDeleteButton"){
												btnD.childNodes[i].style.display = "block";
											}
										}
									}
									else{
										exist = 1;
										for(i=0;i<btnD.childNodes.length;i++){
											if(btnD.childNodes[i].className == "dijit dijitReset dijitInline dijitButton atiButton atiDeleteButton"){
												btnD.childNodes[i].style.display = "none";
											}
										}
									}
								  },
								  error: function () {
								  }
								});
								
								
								
							  },
							  error: function (result) {
								//console.log(result);
							  }
							});						
					}
					else {
						exist = 1;
						for(i=0;i<btnD.childNodes.length;i++){
							if(btnD.childNodes[i].className == "dijit dijitReset dijitInline dijitButton atiButton atiDeleteButton"){
								btnD.childNodes[i].style.display = "none";
							}
						}
					}
				  },
				  error: function () {
				  }
				});
				
				
				
			  },
			  error: function (result) {
				//console.log(result);
			  }
			});

		 
	  },
	  
      showRelatedTables: function (operationData, previouOperationData) {
        this._getRelatedTableInfoArray(operationData.oriJimuLayerInfo)
          .then(lang.hitch(this, function (layerInfoArray) {
            if (layerInfoArray.length > 0) {//bha ouverture de la popup en mode edition
              this._setTitle(window.jimuNls.popup.relatedTables);
            }
            //bha modif
            //masquer id_anomalie pour les entités libres
            var atiAttributesListe = document.getElementsByClassName("atiAttributes")[0].childNodes[0].childNodes[0].childNodes;
            for (i = 0; i < atiAttributesListe.length; i++) {
              if (atiAttributesListe[i].textContent == "id_anomalie") {
                atiAttributesListe[i].style.display = "none";
              }
            }
			//console.log(operationData);
			///
			var btnD = document.getElementsByClassName("atiButtons")[0];
			for(i=0;i<btnD.childNodes.length;i++){
				if(btnD.childNodes[i].className == "dijit dijitReset dijitInline dijitButton atiButton atiDeleteButton"){
					btnD.childNodes[i].style.display = "none";
				}
			}
			if(operationData.feature != undefined && operationData.feature._layer != undefined){
				var id = operationData.feature.attributes.objectid;
				var url = operationData.feature._layer.url;
				this.hasRelatedFeatures(id, url, btnD);
			}
            //bha fin modif

            array.forEach(layerInfoArray, function (relatedLayerInfo, index) {
              var backgroundClass = (index % 2 === 0) ? 'oddLine' : 'evenLine';
              var tableItem = html.create('div', {
                'class': 'item table-item ' + backgroundClass,
                innerHTML: relatedLayerInfo.title
              }, this.contentBox);

              /*
              html.create('div', {
                title: window.jimuNls.common.edit,
                'class': 'edit-icon jimu-icon jimu-icon-edit'
              }, tableItem);
              */

              var handle = on(tableItem, 'click', lang.hitch(this, function () {//bha ouvrir popup anomalie/travail
                relatedLayerInfo.getLayerObject().then(lang.hitch(this, function () {

                  if (previouOperationData) {
                    this._addOperation(Clazz.OPERATION_SHOW_INSPECTOR, previouOperationData);
                  } else {
                    this._addOperation(Clazz.OPERATION_FIRST, operationData);
                  }
                  //this._changeRefDomNode();
                  this.showRelatedRecords(this._createOperationData(operationData.feature,
                    operationData.oriJimuLayerInfo,
                    relatedLayerInfo,
                    null));
                }));
              }));
              this._temporaryData.eventHandles.push(handle);
            }, this);
          }));
      },

      showFirstPage: function (operationData) {
        this._clearPage();
        this._revertRefDomNode();
        this.showRelatedTables(operationData);
      },

      _onAddNewBtnClick: function (operationData) {
        //bha modif
        //nouveau travail
        this.creationTrav = 1;
        this.creationAno = 1;
        //console.log(document.getElementsByClassName("atiAttributes")[0]);
        //bha fin modf
        this.loading.show();
        // add new related record
        this._addNewRelatedRecord(operationData).then(lang.hitch(this, function (newRelatedRecord) {
          this.loading.hide();
          // add previou operation
          this._addOperation(Clazz.OPERATION_SHOW_RELATED_RECORDS, operationData);
          // show inspector
          this.showInspector(this._createOperationData(operationData.feature,
            operationData.oriJimuLayerInfo,
            operationData.destJimuLayerInfo,
            newRelatedRecord));
        }), lang.hitch(this, function () {
          this.loading.hide();
        }));
      },

      _onDeleteBtnClick: function (operationData) {
        this.loading.show();
        this._deleteRelatedRecord(operationData).then(lang.hitch(this, function () {
          this.loading.hide();
          this._onPreviouBtnClick();
        }), lang.hitch(this, function () {
          this.loading.hide();
        }));
      },

      _onAttributeChange: function (operationData, evt) {
        this.loading.show();
        this._updateRelatedRecord(operationData, evt).then(lang.hitch(this, function () {
          this.loading.hide();
        }), lang.hitch(this, function () {
          this.loading.hide();
        }));
      },

      _createOperationData: function (feature,
        oriJimuLayerInfo,
        destJimuLayerInfo,
        relatedFeature) {
        var newOperationData = {
          feature: feature,
          oriJimuLayerInfo: oriJimuLayerInfo,
          destJimuLayerInfo: destJimuLayerInfo,
          relatedFeature: relatedFeature
        };
        return newOperationData;
      },

      _addOperation: function (operationName, operationData) {
        this.undoManager.add(new Clazz.Operation(
          operationName,
          operationData,
          this
        ));
      },

      _onPreviouBtnClick: function () {
        this.creationTrav = 0;
        this.creationAno = 0;
        this.undoManager.undo();
      },


      /*************************
       * Methods for control dom
       *************************/
      _clearPage: function () {
        html.empty(this.contentBox);
        // hide addNewBtn
        html.setStyle(this.addNewBtn, 'display', 'none');

        array.forEach(this._temporaryData.eventHandles, function (handle) {
          if (handle && handle.remove) {
            handle.remove();
          }
        }, this);
        this._temporaryData.eventHandles = [];
        array.forEach(this._temporaryData.dijits, function (dijit) {
          if (dijit && dijit.destroy) {
            dijit.destroy();
          }
        }, this);
        this._temporaryData.dijits = [];
      },

      _changeRefDomNode: function () {
        html.setStyle(this.refDomNode, 'display', 'none');
        html.setStyle(this.operationBox, 'display', 'block');
        html.addClass(this.domNode, 'fix-height-mode');
        this.previouBtn.title = window.jimuNls.common.back;
        this.addNewBtn.title = window.jimuNls.common.newText;
        // just for open edit from popup
        if (this.undoManager.peekUndo()) {
          html.setStyle(this.previouBtn, 'display', 'block');
        } else {
          html.setStyle(this.previouBtn, 'display', 'none');
        }
      },

      _revertRefDomNode: function () {
        html.setStyle(this.refDomNode, 'display', 'block');
        html.setStyle(this.operationBox, 'display', 'none');
        html.removeClass(this.domNode, 'fix-height-mode');
      },

      _showAddNewBtn: function (operationData) {
        var relatedLayerObject = operationData.destJimuLayerInfo.layerObject;
        if (relatedLayerObject.type === "Table" &&
          relatedLayerObject.getEditCapabilities &&
          relatedLayerObject.getEditCapabilities().canCreate) {

          // show addNewBtn
          html.setStyle(this.addNewBtn, 'display', 'block');
          var handle = on(this.addNewBtn, 'click', lang.hitch(this, this._onAddNewBtnClick, operationData));
          this._temporaryData.eventHandles.push(handle);
        }
      },

      _setTitle: function (title, className) {
        if (title) {
          html.create('div', {
            'class': 'title-box ' + (className ? className : ''),
            innerHTML: title
          }, this.contentBox);
        }
      },

      _setOperationTitle: function (title) {
        html.setAttr(this.operationTitle, 'innerHTML', title);
        html.setAttr(this.operationTitle, 'title', title);
      },

      //get field selector
      _showFieldSelector: function (relatedLayerInfo) {
        var defaultDisplayFieldName = "objecid";
        var titleBox = domQuery(".title-box", this.contentBox)[0];
        var relatedLayer = relatedLayerInfo.layerObject;
        var items = [];

        if (!titleBox || !relatedLayerInfo) {
          return defaultDisplayFieldName;
        }

        var popupInfo = relatedLayerInfo.getPopupInfo();
        if (popupInfo && popupInfo.title) {
          items.push({
            label: window.jimuNls.popup.saveAsPopupTitle,
            value: "popupTitle"
          });
        }

        array.forEach(relatedLayer.fields, function (field) {
          if (field.name.toLowerCase() !== "globalid" &&
            field.name.toLowerCase() !== "shape") {
            items.push({
              label: field.alias || field.name,
              value: field.name
            });
          }
        });

        var fieldSelector = new DropdownMenu({
          items: items
        }).placeAt(titleBox);
        fieldSelector.domNode.title = window.jimuNls.popup.chooseFieldTip;

        // get default display field name
        var oldDefaultDisplayFieldName =
          lang.getObject("_wabProperties.popupInfo.displayFieldOfRelatedRecordList", false, relatedLayer);
        var displayOrObjectField = editUtils.ignoreCaseToGetFieldObject(relatedLayerInfo.layerObject,
          relatedLayerInfo.layerObject.displayField ||
          relatedLayerInfo.layerObject.objectIdField);
        var appConfig = ConfigManager.getInstance().getAppConfig();
        if (oldDefaultDisplayFieldName) {
          defaultDisplayFieldName = oldDefaultDisplayFieldName;
        } else if (appConfig.configWabVersion === "2.3" && displayOrObjectField && displayOrObjectField.name) {
          // back compatibility for online4.4
          defaultDisplayFieldName = displayOrObjectField.name;
        } else if (popupInfo && popupInfo.title) {
          defaultDisplayFieldName = "popupTitle";
        } else if (displayOrObjectField && displayOrObjectField.name) {
          defaultDisplayFieldName = displayOrObjectField.name;
        } else if (items.length > 0) {
          defaultDisplayFieldName = items[0].value;
        }

        if (defaultDisplayFieldName) {
          // hilight item
          fieldSelector.setHighlightValue(defaultDisplayFieldName);
          lang.setObject("_wabProperties.popupInfo.displayFieldOfRelatedRecordList",
            defaultDisplayFieldName,
            relatedLayer);
        }
        this._temporaryData.dijits.push(fieldSelector);

        // listen on selcector change
        var fieldSelectorChangeHandle = on(fieldSelector,
          'click-item',
          lang.hitch(this, function (relatedLayerInfo, newValue) {
            domQuery(".item.record-item", this.contentBox).forEach(lang.hitch(this, function (node) {
              lang.setObject("_wabProperties.popupInfo.displayFieldOfRelatedRecordList", newValue, relatedLayer);
              var displayTitle = this._getDisplayTitleOfRelatedRecord(relatedLayerInfo,
                node.relatedRecord,
                newValue);
              node.innerHTML = displayTitle;
            }));
          }, relatedLayerInfo));
        this._temporaryData.eventHandles.push(fieldSelectorChangeHandle);
        return defaultDisplayFieldName;
      },

      //bha modif
      //fonctions pour la gestion des listes deroulantes groupes/users
      /*
      var expanded = false;
      var tabUserName = [];
      var tabGrpName = [];
      var tabUserGrpName = [];
      */
      showGroupes: function () {
        var checkboxes = document.getElementById("groupes");
        if (!this.expanded) {
          checkboxes.style.display = "block";
          this.expanded = true;
        } else {
          checkboxes.style.display = "none";
          this.expanded = false;
        }
      },

      showUsers: function () {
        var checkboxes = document.getElementById("utilisateurs");
        if (!this.expanded) {
          checkboxes.style.display = "block";
          this.expanded = true;
        } else {
          checkboxes.style.display = "none";
          this.expanded = false;
        }
      },

      //on recuperer la liste de tous les utilisateurs Portal
      getUsers: function () {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/portals/self/users?start=0&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            for (i = 0; i < result.users.length; i++) {
				
              if (result.users[i].username != "portaladmin") {
                //scope.tabUserName.push(result.users[i].fullName + "/" + result.users[i].email + "/" + result.users[i].username);
				 scope.tabUserName.push(result.users[i].fullName + "/" + result.users[i].email + "/" + result.users[i].username + "/" + result.users[i].firstName+ "/" + result.users[i].lastName);	//change to fullname
              }			  
            }
            //recuperation des groupes
            scope.getGrps();

			//le cas de plus de 100 utilisateurs
			if(result.total>100){
			  var scope2 = scope;
			  $.ajax({
					  type: 'GET',
					  url: scope2.portalUrl + '/portal/sharing/rest/portals/self/users?start=101&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope2.token,
					  success: function (result) {
						result = JSON.parse(result);
						for (i = 0; i < result.users.length; i++) {
							
						  if (result.users[i].username != "portaladmin") {
							//scope.tabUserName.push(result.users[i].fullName + "/" + result.users[i].email + "/" + result.users[i].username);
							 scope2.tabUserName.push(result.users[i].fullName + "/" + result.users[i].email + "/" + result.users[i].username + "/" + result.users[i].firstName+ "/" + result.users[i].lastName);	//change to fullname
						  }							  
						}
						//recuperation des groupes
						//scope2.getGrps();
					  },
					  error: function () {
					  }
					});
			  
			}
			  
          },
          error: function () {
          }
        });
      },
      //getUsers();

      //on recupere la liste de tous les groupes Portal
      getGrps: function () {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/community/self?f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            for (i = 0; i < result.groups.length; i++) {
              if (result.groups[i].title.toUpperCase().includes('GINOV_')) {
                if (result.groups[i].title.toUpperCase() != "GINOV_PRESCRIPTEUR") {
                  var titre = result.groups[i].title.toString().substr(6);
                  scope.tabGrpName.push(titre + "/" + result.groups[i].id);
                }
              }
            }
            //liste des groupes
            scope.addGrpToListe(scope.tabGrpName);

          },
          error: function () {
          }
        });
      },

      getUsersFromGrp: function (id) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/community/groups/' + id + '/users?f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            var tab = [];
            for (i = 0; i < result.users.length; i++) {
              tab.push(result.users[i]);
            }
            //on rajoute les users sans les ecraser
			
            var t = scope.getInfosUsers(id, tab, scope.tabUserName);
			
            for (j = 0; j < t.length; j++) {
              scope.tabUserGrpName.push(t[j]);
            }
            //remplir la liste des users
            $("#utilisateurs").empty();
            scope.addUserToListe(scope.tabUserGrpName);
          },
          error: function () {
          }
        });
      },

      getUsersFromOper: function (id) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/community/groups/' + id + '/users?f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            var tab = [];
            for (i = 0; i < result.users.length; i++) {
              tab.push(result.users[i]);
            }
            //on rajoute les users sans les ecraser
            var tableau = [];
            var t = scope.getInfosUsers(id, tab, scope.tabUserName);
			
            for (j = 0; j < t.length; j++) {
              tableau.push(t[j]);
            }
            //remplir la liste des users
            $("#utilisateurs").empty();
            scope.addUserToListe(tableau);
          },
          error: function () {
          }
        });
      },

      //remplir la liste des users
      addUserToListe: function (tabUser) {//console.log(tabUser);
        for (i = 0; i < tabUser.length; i++) {
          //var fullName = tabUser[i].split("/")[0];
          var mail = tabUser[i].split("/")[1];
		  //change to fullname
		  var firstname = tabUser[i].split("/")[3];
		  var lastname = tabUser[i].split("/")[4];
		  if(firstname == undefined){
			  var fullName = tabUser[i].split("/")[0];
		  }
		  else{
			   var fullName = firstname + ' '+ lastname; //tabUser[i].split("/")[0];
		  }
		  
          if (tabUser[i].split("/")[2] == undefined) {
            var username = tabUser[i].split("/")[0];
          } else {
            var username = tabUser[i].split("/")[2];
          }
          var str = '<label for="' + fullName + '"><input id="' + fullName + '" fullName="' + fullName + '" type="checkbox" checked />' + fullName + '</label>';
          //$("#utilisateurs").append(str);
          var scope = this;
          this.mailV.push(fullName);

          //creer dynamiquement
          var label = document.createElement('div');
          label.for = fullName;
          //label.innerHTML = username;

          var inpt = document.createElement('input');
          inpt.id = fullName;//username;//fullName;
          inpt.type = "checkbox";
          inpt.checked = true;
          inpt.innerHTML = fullName;//username;

          var label2 = document.createElement('label');
          label2.style.display = "contents";
          label2.for = fullName;
          //label2.innerHTML = username;
		  label2.innerHTML = fullName;//firstname + ' ' + lastname; 	//change to fullname

          label.append(inpt);
          label.append(label2);
          $("#utilisateurs").append(label);
          inpt.onclick = function () {
            scope.changeUser();
          };


        }

        //remplir input dorigine pour les groupes
        var elemI = $("#groupes").find("input");
        var str = "";
        for (j = 0; j < elemI.length; j++) {
          if (elemI[j].checked) {
            str += elemI[j].title + ";"; //getAttribute("fullname") + ";";
          }
        }

        //remplir input dorigine pour les users
        var elemU = $("#utilisateurs").find("input");
        var strU = "";
        for (j = 0; j < elemU.length; j++) {
          if (elemU[j].checked) {
            strU += elemU[j].id + ";"; //getAttribute("fullname") + ";";
          }
        }

        //todo changer oprateur
        var data = '[{' +
          '"attributes": {' +
          '  "objectid": ' + this.objectidV + ',' +
          '  "groupe": "' + str + '",' +
          '"operateur": "' + strU + '"' +
          '}' +
          '}' +
          ']';
        this.saveModification(data);


      },

      //remplir la liste des groupes
      addGrpToListe: function (tabGrp) {
        var scope = this;

        var groupe = this.groupeV;
        groupe = groupe.split(";");
        var tableau = this.operateurV.split(";");
		//console.log(this.operateurV);
		//console.log(tableau);

        for (i = 0; i < tabGrp.length; i++) {

          var title = tabGrp[i].split("/")[0];
          var idGrp = tabGrp[i].split("/")[1];

          var str = '<label for="' + idGrp + '"><input id="' + idGrp + '" title="' + title + '" type="checkbox"  />' + title + '</label>';
          //getUsersFromGrp(idGrp);
          $("#groupes").append(str);
          //add event on click
          $("#" + idGrp).click(function () {
            scope.getGroupes(this);
          });

          for (k = 0; k < groupe.length; k++) {
            if (groupe[k] == title) {
              document.getElementById(idGrp).checked = true;
            }
          }
        }

        //ajout des users qui sont dans la base
        var tab = [];
        for (j = 0; j < tableau.length; j++) {
          if (tableau[j] != "") {
            tab.push(tableau[j]);
          }
        }
		//console.log(tab);
        //console.log(this.tabUserName);
		//change to fullname
		for(k=0;k<this.tabUserName.length;k++){
			for(j=0;j<tab.length;j++){//console.log(this.tabUserName[k].split("/")[2]);
				if(this.tabUserName[k].split("/")[2] == tab[j]){
					//tab[j] = tab[j] + "///" + this.tabUserName[3] + "/" + this.tabUserName[4];
					tab[j] = this.tabUserName[k];
				}
			}			
		}
		//console.log(tab);
        this.addUserToListe(tab);
      },

      //evenement selectionner un groupe
      getGroupes: function (elem) {
        //ajout ou suppression de l'id du groupe de la liste
        if (elem.checked) {
          var elemI = $("#groupes").find("input");
          //if (index == -1) {
          if (elem.id != "all") {
            this.getUsersFromGrp(elem.id);

            for (i = 0; i < elemI.length; i++) {
              if (elemI[i].id == "all") {
                elemI[i].checked = false;
              }
            }
          }
          else {
            this.tabUserGrpName = [];
            for (i = 0; i < elemI.length; i++) {
              if (elemI[i].id != "all") {
                elemI[i].checked = false;
              }
            }
            //remplir la liste des users
            $("#utilisateurs").empty();
            //trello 07
            this.getUsersFromOper(this.idGroupeOpe);
            //this.addUserToListe(this.tabUserName);
          }
          //remplir input dorigine pour les groupes
          var str = "";
          for (j = 0; j < elemI.length; j++) {
            if (elemI[j].checked) {
              str += elemI[j].title + ";";
            }
          }

          //remplir input dorigine pour les users
          var elemU = $("#utilisateurs").find("input");
          var strU = "";
          for (j = 0; j < elemU.length; j++) {
            if (elemU[j].checked) {
              strU += elemU[j].id + ";"; //getAttribute("fullname") + ";";
            }
          }


          //document.getElementById("listeGroupes").value = str;
          //console.log(this.groupeV);
          //this.groupeV.value = str;
          //todo changer operateur
          var data = '[{' +
            '"attributes": {' +
            '  "objectid": ' + this.objectidV + ',' +
            '  "operateur": "' + strU + '",' +
            '"groupe": "' + str + '"' +
            '}' +
            '}' +
            ']';
          this.saveModification(data);

        }
        else {
          var elemI = $("#groupes").find("input");
          if (elem.id == "all") {
            for (i = 0; i < elemI.length; i++) {
              elemI[i].checked = false;
            }
            $("#utilisateurs").empty();
            this.tabUserGrpName = [];
            /*document.getElementById("listeUsers").value = "";*/
          }
          else {
            for (i = 0; i < elemI.length; i++) {
              if (elemI[i].id == "all") {
                elemI[i].checked = false;
              }
            }
            //suppression des users d'un groupe
            var tabIndex = [];
            for (k = 0; k < this.tabUserGrpName.length; k++) {
              if (this.tabUserGrpName[k].split("/")[3] != elem.id) {
                tabIndex.push(this.tabUserGrpName[k]);
              }
            }
            this.tabUserGrpName = tabIndex;
            //remplir la liste des users
            $("#utilisateurs").empty();
            this.addUserToListe(this.tabUserGrpName);
          }
          //remplir input dorigine pour les groupes
          var str = "";
          for (j = 0; j < elemI.length; j++) {
            if (elemI[j].checked) {
              str += elemI[j].title + ";";
            }
          }
          //document.getElementById("listeGroupes").value = str;
          /*console.log(this.groupeV);
          this.groupeV.value = str;*/
        }

      },

      //comparaison des 2 tableaux pour recuperer les mails et fullnames
      getInfosUsers: function (id, array1, array2) {
        var tab = [];
        for (i = 0; i < array1.length; i++) {
          for (j = 0; j < array2.length; j++) {
            if (array2[j] != "" && array2[j] != undefined) {
              var str = array2[j].split("/")[2];
              if (array1[i] == str) {
                tab.push(array2[j] + "/" + id);
              }
            }
          }
        }
        return tab;
      },

      //chnage users
      changeUser: function (id) {
        //
        var scope = this;
        var elemU = $("#utilisateurs").find("input");
        var strU = "";
        for (j = 0; j < elemU.length; j++) {
          if (elemU[j].checked) {
            strU += elemU[j].id + ";"; //getAttribute("fullname") + ";";
          }
        }

        //remplir input dorigine pour les groupes
        var elemI = $("#groupes").find("input");
        var str = "";
        for (j = 0; j < elemI.length; j++) {
          if (elemI[j].checked) {
            str += elemI[j].title + ";"; //getAttribute("fullname") + ";";
          }
        }

        /*document.getElementById(id).value = strU;*/
        //todo chnager operateur
        var data = '[{' +
          '"attributes": {' +
          '  "objectid": ' + scope.objectidV + ',' +
          '  "groupe": "' + str + '",' +
          '"operateur": "' + strU + '"' +
          '}' +
          '}' +
          ']';
        scope.saveModification(data);
      },

      //function apply edit -- travail
      saveModification: function (dataf) {
        var scope = this;
        scope.loading.show();
        $.ajax({
          type: 'POST',
          //url: scope.portalUrl2 + '/arcgis/rest/services/collector/ginov_entite/FeatureServer/4/applyEdits?f=json&token=' + scope.token + '&updates=' + data,
          //url: scope.portalUrl2 + '/arcgis/rest/services/collector/ginov_entite/FeatureServer/4/applyEdits',
          url: scope.portalUrl2 + scope.serviceTravail + '/applyEdits',
          data: {
            f: "json",
            updates: dataf,
            token: scope.token
          },

          success: function (result) {
            //console.log("success", result);
            scope.loading.hide();
          },
          error: function () {
            scope.loading.hide();
          }
        });
      },

      //function apply edit -- anomalie
      saveModification2: function (dataf) {
        //console.log(dataf);
        var scope = this;
        scope.loading.show();
        $.ajax({
          type: 'POST',
          //url: scope.portalUrl2 + '/arcgis/rest/services/collector/ginov_entite/FeatureServer/3/applyEdits?f=json&token=' + scope.token + '&updates=' + data,
          //url: scope.portalUrl2 + '/arcgis/rest/services/collector/ginov_entite/FeatureServer/3/applyEdits',
          url: scope.portalUrl2 + scope.serviceAnomalie + '/applyEdits',
          data: {
            f: "json",
            updates: dataf,
            token: scope.token
          },
          success: function (result) {
            //console.log("success", result);
            scope.loading.hide();
          },
          error: function () {
            scope.loading.hide();
          }
        });
      },


      //reinitialiser liste groupe et user quand on clique sur precedent
      reinitializeListe: function () {
        var previosBtn = document.getElementsByClassName("previos-btn");
        var scope = this;
        previosBtn[0].onclick = function () {
          scope.tabUserName = [];
          scope.tabGrpName = [];
          scope.tabUserGrpName = [];
        };
      },


      //comparaison si value in table
      printFrame: function (ext, tab, url, tab2, basemap) {
        //todo changer l'URL
        printWindow = window.open(this.portalUrl + "/ginov/print.html?" +
          "xmin=" + ext.xmin + "&xmax=" + ext.xmax + "&ymin=" + ext.ymin + "&ymax=" + ext.ymax +
          "&categorie=" + tab[0] + "&activites=" + tab[1] + "&priorite=" + tab[2] +
          "&statut=" + tab[3] + "&groupe=" + tab[4] + "&operateur=" + tab[5] +
          "&exploitant=" + tab[6] + "&lieu=" + tab[7] +
          "&description=" + tab[8] + "&date_creation=" + tab[9] + "&date_fin_prev=" + tab[10] +
          "&date_fin_eff=" + tab[11] + "&commentaire=" + tab[12] + "&duree=" + tab[13] +
          "&lac=" + tab[14] + "&engins=" + tab[15] + "&materiel=" + tab[16] + "&vehicule=" + tab[17] + "&path=" + url + "&echelle=" + tab[18] +
          "&typegeom=" + tab2[0] + "&geom=" + tab2[1] + "&spatialref=" + tab2[2]+"&basemap="+basemap);
        /*printWindow = window.open("https://localhost:3344/webappbuilder/apps/14/fiche.html?" +
        "xmin=" + ext.xmin + "&xmax=" + ext.xmax + "&ymin=" + ext.ymin + "&ymax=" + ext.ymax +
        "&categorie=" + tab[0] + "&activites=" + tab[1] + "&priorite=" + tab[2] +
        "&statut=" + tab[3] + "&groupe=" + tab[4] + "&operateur=" + tab[5] +
        "&exploitant=" + tab[6] + "&lieu=" + tab[7] +
        "&description=" + tab[8] + "&date_creation=" + tab[9] + "&date_fin_prev=" + tab[10] +
        "&date_fin_eff=" + tab[11] + "&commentaire=" + tab[12] + "&duree=" + tab[13] +
        "&engins=" + tab[14]);*/
      },

      //modifier le contenu de la fiche
      modifyFiche: function (attributeInspector, relatedLayerName) {
        if (relatedLayerName.includes("rav")) {
          var elem = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes;
          //nombre de champs pour un travail
          var len = elem[0].childNodes[0].childNodes.length;

          //le travail n'est modifiable que si son statut est = assigné ou en cours ou terminé
          //statut est le 4 de la liste
          var statut = elem[0].childNodes[0].childNodes[6].childNodes[1].childNodes[0].childNodes[2].childNodes[0].id;
          var valueS = document.getElementById(statut).value;

          for (i = 0; i < len; i++) {
            var elementi = elem[0].childNodes[0].childNodes[i];
            if (i != 6 && i != 10 && i != 8 && i != 12 && i != 13 && i != 14 && i != 0 && i != 15 && i != 16 && i != 17) {//les champs autorisés : statut, date fin effective, commentaire, durée
              if (i == 3 || i == 5 || i == 6 || i == 1 || i == 11) {//le cas d'une liste deroulante
                var id = elementi.childNodes[1].childNodes[0].childNodes[2].childNodes[0].id;
              }
              else {
                var id = elementi.childNodes[1].childNodes[0].childNodes[1].childNodes[0].id;
              }
              //console.log(i);
              var value = document.getElementById(id).value;
              elementi.childNodes[1].childNodes[0].remove();
              var newContent = document.createTextNode(value);
              elementi.childNodes[1].appendChild(newContent);
              elementi.childNodes[1].setAttribute("style", "font-size: 16px;");
            }
            //operateur
            if (i == 10) {
              elementi.childNodes[1].childNodes[0].remove();
              var oper = this.operateurV;
              var newContent = document.createTextNode(oper);
              elementi.childNodes[1].appendChild(newContent);
              elementi.childNodes[1].setAttribute("style", "font-size: 16px;");
            }
            if (i == 8) {
              var value = document.getElementById("selectPrescripteur").value;
              elementi.childNodes[1].childNodes[0].remove();
              var newContent = document.createTextNode(value);
              elementi.childNodes[1].appendChild(newContent);
              elementi.childNodes[1].setAttribute("style", "font-size: 16px;");
            }
            //operateur peut modifier quelques champs, si le travail est en cours, assigné
            if (valueS != "Assigné" && valueS != "En cours") {
              if (i == 6 || i == 12 || i == 13 || i == 14 || i == 0 || i == 15 || i == 17) {
                if (i == 6 || i == 12 || i == 0 || i == 17) {
                  //console.log(i);
                  var id = elementi.childNodes[1].childNodes[0].childNodes[2].childNodes[0].id;
                }
                if (i == 13 || i == 14) {
                  var id = elementi.childNodes[1].childNodes[0].childNodes[1].childNodes[0].id;
                }
                if (i == 15) {
                  var id = elementi.childNodes[1].childNodes[0].childNodes[0].id;
                }
                var value = document.getElementById(id).value;
                elementi.childNodes[1].childNodes[0].remove();
                var newContent = document.createTextNode(value);
                elementi.childNodes[1].appendChild(newContent);
                elementi.childNodes[1].setAttribute("style", "font-size: 16px;");
              }

              if (i == 16) {
                var value = this.materielsV;
                document.getElementById("matForm").style.display = "none";
                elementi.childNodes[1].childNodes[0].remove();
                var newContent = document.createTextNode(value);
                elementi.childNodes[1].appendChild(newContent);
                elementi.childNodes[1].setAttribute("style", "font-size: 16px;");
              }
            }
          }

          //restriction de la liste des valeurs statut
          //statut est le 4eme sur la liste childNodes[3]
          var elemS = elem[0].childNodes[0].childNodes[6];
          var id = elemS.childNodes[1].childNodes[0].childNodes;
          //input disabled pour le statut
          if (elemS.childNodes[1].childNodes[0].childNodes[2] != undefined) {
            elemS.childNodes[1].childNodes[0].childNodes[2].childNodes[0].disabled = true;

            id[0].onclick = function () {
              setTimeout(function () {
                var idS = document.getElementsByClassName("dijitMenuItem");

                //suppression de tous les statuts = suspendu, non assigné, annulé, validé
                for (j = 0; j < idS.length; j++) {
                  if (idS[j].textContent == "Suspendu" || idS[j].innerHTML == "Suspendu") {
                    idS[j].remove();
                    j = 0;
                  }
                  else if (idS[j].textContent == "Non assigné") {
                    idS[j].remove();
                    j = 0;
                  }
                  else if (idS[j].textContent == "Annulé") {
                    idS[j].remove();
                    j = 0;
                  }
                  else if (idS[j].textContent == "Validé") {
                    idS[j].remove();
                    j = 0;
                  }
                }
              }, 300);
            };
          }
        }
      },

      //ajout de bouton d'impression
      addPrintBtn: function (attributeInspector, operationData, relatedLayerName) {
        //add button print pour les profils planif et admin pour la fiche travail

        //supprimer btn supprimer (par défaut) dans les fiches Anomalie et Travail
        //console.log("delete");
        var dBtn = document.getElementsByClassName("dijitReset dijitInline dijitButtonNode");
        for (k = 0; k < dBtn.length; k++) {
          dBtn[k].textContent = "●Supprimer";
          dBtn[k].style.display = "none";
        }

        var btnDiv = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiButtons")[0];
        if (relatedLayerName.includes("rav")) {
          var categorie;
          var activites;
          var priorite;
          var statut;
          var groupe;
          var operateur;
          var exploitant;
          var lieu;
          var reference;
          var description;

          var date_creation;
          var date_fin_prev;
          var date_fin_eff;
          var commentaire;
          var duree;
          var engins; var lac; var materiel; var vehicule;

          var btn = document.createElement("BUTTON");
          btn.innerHTML = "Imprimer";
          var scope = this;
          btn.onclick = function () {
            //setTimeout(function () {
            //recuperation des valeurs de champs
            var elem = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes;
            var elementi = elem[0].childNodes[0];
            categorie = elementi.childNodes[3].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            activites = elementi.childNodes[4].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            priorite = elementi.childNodes[5].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            statut = elementi.childNodes[6].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
            //groupe = elementi.childNodes[4].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
            //operateur = elementi.childNodes[5].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            //exploitant = elementi.childNodes[6].childNoexploitant = elementi.childNodes[6].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            lieu = elementi.childNodes[2].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            description = elementi.childNodes[7].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;


            date_creation = elementi.childNodes[1].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            date_fin_prev = elementi.childNodes[11].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            date_fin_eff = elementi.childNodes[12].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            commentaire = elementi.childNodes[13].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            duree = elementi.childNodes[14].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            lac = elementi.childNodes[0].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;


            //engins = elementi.childNodes[15].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            //materiel = elementi.childNodes[16].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            //vehicule = elementi.childNodes[17].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;

            var elemI = $("#materiels").find("input");
            var strE = "";
            for (j = 0; j < elemI.length; j++) {
              if (elemI[j].checked) {
                strE += elemI[j].id + ";"; //getAttribute("fullname") + ";";
              }
            }

            engins = strE;

            categorie = document.getElementById("Categ").value;
            activites = document.getElementById("selectCateg").value;

            var elemI = $("#groupes").find("input");
            var str = "";
            for (j = 0; j < elemI.length; j++) {
              if (elemI[j].checked) {
                str += elemI[j].title + ";"; //getAttribute("fullname") + ";";
              }
            }
            groupe = str;
            var elemU = $("#utilisateurs").find("input");
            var elemUU = $("#utilisateurs").find("label"); 		//change to fullname
            var strU = [];
            for (j = 0; j < elemU.length; j++) {
              if (elemU[j].checked) {
                //strU.push(elemU[j].id); //getAttribute("fullname") + ";";
				strU.push(elemUU[j].textContent); //getAttribute("fullname") + ";";		//change to fullname
              }
            }
            operateur = strU;
            exploitant = document.getElementById("selectPrescripteur").value;

            var tabElem = [];
            tabElem.push(categorie);
            tabElem.push(activites);
            tabElem.push(priorite);
            tabElem.push(statut);
            tabElem.push(groupe);
            tabElem.push(operateur);
            tabElem.push(exploitant);
            tabElem.push(lieu);
            //tabElem.push(reference);
            tabElem.push(description);

            tabElem.push(date_creation);
            tabElem.push(date_fin_prev);
            tabElem.push(date_fin_eff);
            tabElem.push(commentaire);
            tabElem.push(duree);
            tabElem.push(lac);
            tabElem.push(engins);
            tabElem.push(materiel);
            tabElem.push(vehicule);

			//console.log(operationData);
            if(operationData.feature.geometry == undefined ){
              operationData = scope.operationData2;
            }
            

            var ext = operationData.feature._extent;
            var urlS = operationData.feature._layer._url.path;
			var tabUrl = urlS.split("/");
			urlS = "";
			for(i=7;i<tabUrl.length;i++){
				if(urlS != ""){
					urlS += "/" + tabUrl[i];
				}
				else{
					urlS += tabUrl[i];
				}
			}

            var echelle = document.getElementById("selectEchelle").value;

            if(echelle.includes("Rue")){
				echelle = 18;
			}
			else if(echelle.includes("Ville")){
				echelle = 14;
			}
			else if(echelle.includes("Département")){
				echelle = 8;
			}
			else if(echelle.includes("Région")){
				echelle = 7;
			}
			else if(echelle.includes("Pays")){
				echelle = 5;
			}
			else if(echelle.includes("Monde")){
				echelle = 1;
			}


            tabElem.push(echelle);


            //recuperation de lobjet selectionné sur la carte
            var geom = [];
            var features = operationData.feature;
			//var spatialRef = new SpatialReference({ wkid: 102100, latestWkid: 3857 });
            var spatialRef = features.geometry.spatialReference.wkid;
            if (features.geometry.type == "multipoint") {
              geom = features.geometry.points[0];
            }
            else if (features.geometry.type == "point") {
              geom = [features.geometry.x, features.geometry.y];
            }
            else if (features.geometry.type == "polyline") {
              geom = features.geometry.paths[0];
            }
            else if (features.geometry.type == "polygon") {
              geom = features.geometry.rings[0];
            }


            var tab2 = [];
            tab2.push(features.geometry.type, geom, spatialRef);

			//get basemap
			//console.log(operationData);
			//console.log(operationData.feature._layer.getMap().layerIds);
			var carte = operationData.feature._layer.getMap();
			var basemapL = carte.getLayer(carte.layerIds[0]);
			if(basemapL.id == "layer_osm"){
				var basemap = "osm";
			}else{
				var basemap = basemapL.url;
				basemap = basemap.split("https://")[1];
			}
			
            scope.printFrame(ext, tabElem, urlS, tab2, basemap);

            //}, 500);
          }

          //liste deroulante pour les echelles
          var label = document.createElement('label');
          label.innerHTML = "Echelle :";
          label.style.cssText = "margin-left: 20px;";

          var select = document.createElement('select');
          select.id = "selectEchelle";
          select.style.cssText = "width: 30%;margin-left: 20px;";
          select.innerHTML = "";

          /*
          for(i=1;i<19;i++){
            var inpt = document.createElement('option');
            inpt.id = 19 - i;
            inpt.innerHTML = 19 - i;
            select.append(inpt);
          }
          */
          var inpt = document.createElement('option');
		  inpt.id = 18;
		  inpt.innerHTML = "18 - Rue";
		  select.append(inpt);
		  
		  for(i=17;i>14;i--){
			  var inpt = document.createElement('option');
			  inpt.id = i;
			  inpt.innerHTML = i;
			  select.append(inpt);
		  }
		  
		  var inpt = document.createElement('option');
		  inpt.id = 14;
		  inpt.innerHTML = "14 - Ville";
		  select.append(inpt);
		  
		  for(i=13;i>8;i--){
			  var inpt = document.createElement('option');
			  inpt.id = i;
			  inpt.innerHTML = i;
			  select.append(inpt);
		  }
		  
		  var inpt = document.createElement('option');
		  inpt.id = 8;
		  inpt.innerHTML = "8 - Département";
		  select.append(inpt);
		  
		  var inpt = document.createElement('option');
		  inpt.id = 7;
		  inpt.innerHTML = "7 - Région";
		  select.append(inpt);
		  
		  var inpt = document.createElement('option');
		  inpt.id = 6;
		  inpt.innerHTML = 6;
		  select.append(inpt);
		  
		  var inpt = document.createElement('option');
		  inpt.id = 5;
		  inpt.innerHTML = "5 - Pays";
		  select.append(inpt);
		  
		  for(i=4;i>1;i--){
			  var inpt = document.createElement('option');
			  inpt.id = i;
			  inpt.innerHTML = i;
			  select.append(inpt);
		  }
		  
		  var inpt = document.createElement('option');
		  inpt.id = 1;
		  inpt.innerHTML = "1 - Monde";
		  select.append(inpt);
		  



          //bouton supprimer travail
          var btnDelete = document.createElement("BUTTON");
          //btnDelete.className = "atiButton atiDeleteButton dijitButton";
          btnDelete.innerHTML = "Supprimer";
          var scope = this;
          btnDelete.onclick = function () {
            scope.deleteTravail(scope.objectidV);
          };
          btnDiv.appendChild(btnDelete);
          btnDiv.appendChild(btn);
          btnDiv.appendChild(label);
          btnDiv.appendChild(select);


          //bouton envoyer mail
          var btnMail = document.createElement("BUTTON");
          //btnDelete.className = "atiButton atiDeleteButton dijitButton";
          btnMail.innerHTML = "Alerter";
          var scope = this;
          btnMail.onclick = function () {
            var elem = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes;
            var elementi = elem[0].childNodes[0];
            categorie = elementi.childNodes[3].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            activites = elementi.childNodes[4].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            priorite = elementi.childNodes[5].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            statut = elementi.childNodes[6].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
            //groupe = elementi.childNodes[4].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
            //operateur = elementi.childNodes[5].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            //exploitant = elementi.childNodes[6].childNoexploitant = elementi.childNodes[6].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            lieu = elementi.childNodes[2].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            description = elementi.childNodes[7].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;


            date_creation = elementi.childNodes[1].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            date_fin_prev = elementi.childNodes[11].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            date_fin_eff = elementi.childNodes[12].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            commentaire = elementi.childNodes[13].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            duree = elementi.childNodes[14].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;

            lac = elementi.childNodes[0].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            engins = elementi.childNodes[15].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            materiel = elementi.childNodes[16].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;
            vehicule = elementi.childNodes[17].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value;

            var elemU = $("#utilisateurs").find("input");
            var strU = [];
            for (j = 0; j < elemU.length; j++) {
              if (elemU[j].checked) {
                strU.push(elemU[j].id); //getAttribute("fullname") + ";";
              }
            }
            //
            categorie = document.getElementById("Categ").value;
            activites = document.getElementById("selectCateg").value;

            //console.log(strU, priorite, lieu, categorie, activites, date_creation);
            scope.getUserMail(strU, priorite, lieu, categorie, activites, date_creation);
          };
          //btnDiv.appendChild(btnMail);  //fonction envoi mail désactivée pour travail


        }
        else if (relatedLayerName.includes("nomal")) {
          //bouton supprimer anomalie
		  var scope = this;
		  //si des travaux dependent de l'anomalie on peut pas supprimer
			$.ajax({
			  type: 'POST',
			  url: scope.portalUrl2 + scope.serviceAnomalie + '/queryRelatedRecords',
			  data : {f :"json",
					relationshipId: 8,			// a changer (afficher le featureservice ensuite lidentifiant de la table travail
					returnGeometry: false,
					objectIds : operationData.relatedFeature.attributes["objectid"],
					outFields: 'id_anomalie',
					token: scope.token
			  },
			  success: function (result) {
				result = JSON.parse(result);
				//console.log(result);
				if(result.relatedRecordGroups.length == 0 || result.relatedRecordGroups[0].relatedRecords.length == 0){
					//bouton supprimer anomalie
					  var btnDelete = document.createElement("BUTTON");
					  //btnDelete.className = "atiButton atiDeleteButton dijitButton";
					  btnDelete.innerHTML = "Supprimer";
					  var scope2 = scope;
					  btnDelete.onclick = function () {
						scope2.deleteAnomalie(scope2.objectidV);
					  };
					  btnDiv.appendChild(btnDelete);
				}
			  },
			  error: function () {
			  }
			});
          /*var btnDelete = document.createElement("BUTTON");
          //btnDelete.className = "atiButton atiDeleteButton dijitButton";
          btnDelete.innerHTML = "Supprimer";
          var scope = this;
          btnDelete.onclick = function () {
            scope.deleteAnomalie(scope.objectidV);
          };
          btnDiv.appendChild(btnDelete);*/

          //bouton envoyer mail pour anomalie
          /*var btnMail = document.createElement("BUTTON");
          //btnMail.className = "atiButton atiDeleteButton dijitButton";
          btnMail.innerHTML = "MailOld";
		  btnMail.style.display = "none";
		  btnMail.id = "oldMail";*/
          var scope = this;
          /*btnMail.onclick = function () {
            var btnDiv = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiButtons")[0];
			var elemAtt = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes[0].childNodes[0].childNodes;
			
			
			var lac = elemAtt[0].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
			var statut = elemAtt[4].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
			var opera = elemAtt[5].childNodes[1].childNodes[0].childNodes[0].value;
			var lieu = elemAtt[2].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
			var ref = elemAtt[3].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
			var consq = elemAtt[8].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
			var descr = elemAtt[7].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
			var organe = elemAtt[6].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
			var date = elemAtt[1].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
			
			
			console.log("test mail");
			//scope.getListeUserAno(scope.idGoupeAlerte, lac, statut, opera, lieu, ref, consq, descr, organe, date);
          };
          btnDiv.appendChild(btnMail);*/

          var btnMail2 = document.createElement("BUTTON");
          btnMail2.innerHTML = "Alerter";
          btnMail2.onclick = function () {
            var modal = document.getElementById("myModal");
            modal.style.display = "block";

            document.getElementById("accueilModal").style.display = "";
            document.getElementById("okmodal").style.display = "none";
            document.getElementById("komodal").style.display = "none";
            document.getElementById("encours").style.display = "none";


          };
          btnDiv.appendChild(btnMail2);

          document.getElementById("ouimodal").addEventListener("click", envoimail);

          function envoimail() {

            var btnDiv = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiButtons")[0];
            var elemAtt = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes[0].childNodes[0].childNodes;


            var lac = elemAtt[0].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
            var statut = elemAtt[4].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
            var opera = elemAtt[5].childNodes[1].childNodes[0].childNodes[0].value;
            var lieu = elemAtt[2].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            var ref = elemAtt[3].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            var consq = elemAtt[8].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            var descr = elemAtt[7].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            var organe = elemAtt[6].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            var date = elemAtt[1].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;

			if(document.getElementById("copieMail").checked){
				var copieMail = scope.utilisateurMail;
			}
			else{
				var copieMail = "";
			}
            scope.getListeUserAno(scope.idGoupeAlerte, lac, statut, opera, lieu, ref, consq, descr, organe, date, copieMail);
            //document.getElementById("corpsmodal").innerHTML = "Envoi de mail en cours..."; 

            document.getElementById("accueilModal").style.display = "none";
            document.getElementById("okmodal").style.display = "none";
            document.getElementById("komodal").style.display = "none";
            document.getElementById("encours").style.display = "";

          };


        }
      },

      //restriction du champ statut Anomalie pour les operateurs
      statutAnomalie: function (attributeInspector, relatedLayerName) {
        if (relatedLayerName.includes("nomal")) {
          var btnDiv = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiButtons")[0];
          var elemAtt = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes[0].childNodes[0].childNodes;
          //console.log(elemAtt);
          for (k = 0; k < elemAtt.length; k++) {
            if (elemAtt[k].childNodes[0].textContent == "Statut") {
              var value = elemAtt[k].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
              elemAtt[k].childNodes[1].innerHTML = "<input type='text' value='" + value + "' disabled /> ";
            }
          }
          //bouton supprimer travail
          var btnDelete = document.createElement("BUTTON");
          //btnDelete.className = "atiButton atiDeleteButton dijitButton";
          btnDelete.innerHTML = "Supprimer";
          var scope = this;
          btnDelete.onclick = function () {
            scope.deleteAnomalie(scope.objectidV);
          };
          btnDiv.appendChild(btnDelete);

          //bouton envoyer mail pour anomalie
          /*var btnMail = document.createElement("BUTTON");
          //btnMail.className = "atiButton atiDeleteButton dijitButton";
          btnMail.innerHTML = "Mail";
          var scope = this;
          btnMail.onclick = function () {
            var btnDiv = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiButtons")[0];
			var elemAtt = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes[0].childNodes[0].childNodes;
			
			
			var lac = elemAtt[0].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
			var statut = elemAtt[4].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
			var opera = elemAtt[5].childNodes[1].childNodes[0].childNodes[0].value;
			var lieu = elemAtt[2].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
			var ref = elemAtt[3].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
			var consq = elemAtt[8].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
			var descr = elemAtt[7].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
			var organe = elemAtt[6].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
			var date = elemAtt[1].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
			
			scope.getListeUserAno(scope.idGoupeAlerte, lac, statut, opera, lieu, ref, consq, descr, organe, date);
          };
          btnDiv.appendChild(btnMail);*/

          var btnMail2 = document.createElement("BUTTON");
          btnMail2.innerHTML = "Alerter";
          btnMail2.onclick = function () {
            var modal = document.getElementById("myModal");
            modal.style.display = "block";

            document.getElementById("accueilModal").style.display = "";
            document.getElementById("okmodal").style.display = "none";
            document.getElementById("komodal").style.display = "none";
            document.getElementById("encours").style.display = "none";
          };
          btnDiv.appendChild(btnMail2);


          document.getElementById("ouimodal").addEventListener("click", envoimail);

          function envoimail() {

            var btnDiv = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiButtons")[0];
            var elemAtt = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes[0].childNodes[0].childNodes;


            var lac = elemAtt[0].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
            //var statut = elemAtt[4].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;
            var statut = elemAtt[4].childNodes[1].childNodes[0].value;
            var opera = elemAtt[5].childNodes[1].childNodes[0].childNodes[0].value;
            var lieu = elemAtt[2].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            var ref = elemAtt[3].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            var consq = elemAtt[8].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            var descr = elemAtt[7].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            var organe = elemAtt[6].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value;
            var date = elemAtt[1].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value;

			if(document.getElementById("copieMail").checked){
				var copieMail = scope.utilisateurMail;
			}
			else{
				var copieMail = "";
			}
			
			scope.getListeUserAno(scope.idGoupeAlerte, lac, statut, opera, lieu, ref, consq, descr, organe, date, copieMail); 
            //document.getElementById("corpsmodal").innerHTML = "Envoi de mail en cours..."; 

            document.getElementById("accueilModal").style.display = "none";
            document.getElementById("okmodal").style.display = "none";
            document.getElementById("komodal").style.display = "none";
            document.getElementById("encours").style.display = "";

          };
        }
      },

      //modifier la liste des prescripteurs pour la fiche travail
      listeExploitant: function (attributeInspector, relatedLayerName) {
        var scope = this;
        if (relatedLayerName.includes("rav")) {
          var btnDiv = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiButtons")[0];
          var elemAtt = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes[0].childNodes[0].childNodes;
          for (k = 0; k < elemAtt.length; k++) {
            if (elemAtt[k].childNodes[0].textContent == "Prescripteur") {//Prescripteur
              //console.log(elemAtt[k].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value);
              //console.log(elemAtt[k].childNodes[1].childNodes[0]);

              //creer dynamiquement
              var select = document.createElement('select');
              select.id = "selectPrescripteur";
              select.style.cssText = "width: 100%;";
              select.innerHTML = "";

              var inpt = document.createElement('option');
              inpt.id = "";
              inpt.innerHTML = "";
              select.append(inpt);

              /*for (j = 0; j < this.listePrescripteur.length; j++) {
                var inpt = document.createElement('option');
                inpt.id = this.listePrescripteur[j];
                inpt.innerHTML = this.listePrescripteur[j];
                if (this.listePrescripteur[j] == this.prescripteurV) {
                  inpt.selected = true;
                }
                select.append(inpt);
              }*/
			  //change to fullname
			  this.listePrescripteur1 = this.listePrescripteur1.filter(this.distinct);
			  for (j = 0; j < this.listePrescripteur1.length; j++) {
                var inpt = document.createElement('option');
                inpt.id = this.listePrescripteur1[j];
                inpt.innerHTML = this.listePrescripteur1[j];
                if (this.listePrescripteur1[j] == this.prescripteurV) {
                  inpt.selected = true;
                }
                select.append(inpt);
              }

              var id = elemAtt[k].childNodes[1].childNodes[0].id;
              elemAtt[k].childNodes[1].childNodes[0].innerHTML = "";
              $("#" + id).append(select);

              select.onchange = function () {
                //todo changer exploitant -> prescripteur
                var data = '[{' +
                  '"attributes": {' +
                  '  "objectid": ' + scope.objectidV + ',' +
                  '  "prescripteur": "' + this.value + '",' +			//todo rec "prescripteur"
                  '}' +
                  '}' +
                  ']';
                scope.saveModification(data);
              };

            }
			//le champs durée
			else if(elemAtt[k].childNodes[0].textContent.includes("Durée")){
				//console.log(elemAtt[k]);
				//console.log(elemAtt[k].childNodes[1].childNodes[0].childNodes[1].childNodes[0].value);
				var inputDuree = elemAtt[k].childNodes[1].childNodes[0].childNodes[1].childNodes[0];
				inputDuree.oninput = function(){
					//console.log(this.value);
					inputDuree.value = inputDuree.value.replace(",", ".");
				}
				
			}
          }

        }
      },


	  creatAnomalie: function (operationData, attributeInspector, relatedLayerName) {
		  if (relatedLayerName.includes("nomal")) {
			  this.operationData2 = operationData;
			  if(this.creationAno == 1){
				  //console.log("teeesssst");
				  var data = '[{' +
					  '"attributes": {' +
					  '  "objectid": ' + this.objectidV + ',' + 
					  '  "lacreservoir": "Aube",' +
					  '  "statut": "A prendre en compte",' +
					  '  "reference": "Valeur obligatoire : à renseigner"' +
					  '}' +
					  '}' +
					  ']';
					this.saveModification2(data);
				  
			  }
		  }
		  
	  },
      //modifier la liste des materiels
      listeMateriels: function (attributeInspector, relatedLayerName) {
        var scope = this;
        if (relatedLayerName.includes("rav")) {
          var btnDiv = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiButtons")[0];
          var elemAtt = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes[0].childNodes[0].childNodes;



          //creer dynamiquement
          var select = document.createElement('select');
          select.id = "selectLacMat";
          select.style.cssText = "width: 100%;";
          select.innerHTML = "";

          var inpt = document.createElement('option');
          inpt.id = "";
          inpt.innerHTML = "";
          select.append(inpt);



          var exist = elemAtt[16].childNodes[1].innerHTML;
          exist += '<form id="matForm">' +
            '<div class="multiselect">' +
            '<div class="selectBox" id="li" onclick="">' +
            '<select id="listemateriels">' +
            '<option>Liste des matériels</option>' +
            '</select>' +
            '<div class="overSelect"></div>' +
            '</div>' +
            '<div id="materiels" style="display:none;">' +
            '</div>' +
            '</div>' +
            '</form>';

          elemAtt[16].childNodes[1].innerHTML = exist;
          elemAtt[16].childNodes[1].childNodes[0].style.display = "none";

          document.getElementById("li").onclick = function () {
            var checkboxes = document.getElementById("materiels");
            if (!this.expanded) {
              checkboxes.style.display = "block";
              this.expanded = true;
            } else {
              checkboxes.style.display = "none";
              this.expanded = false;
            }
          };



          for (j = 0; j < this.tabLacListe.length; j++) {
            var inpt = document.createElement('option');
            inpt.id = this.tabLacListe[j];
            inpt.innerHTML = this.tabLacListe[j];
            if (this.tabLacListe[j] == this.lac_matV) {
              inpt.selected = true;

              var tab = scope.tabLacMat[this.lac_matV];
              $("#materiels").empty();
              for (i = 0; i < tab.length; i++) {
                //creer dynamiquement
                var label = document.createElement('div');
                label.for = tab[i];
                //label.innerHTML = username;

                var inpt2 = document.createElement('input');
                inpt2.id = tab[i];
                inpt2.type = "checkbox";

                var materielsJ = scope.materielsV.split(";");
                for (k = 0; k < materielsJ.length; k++) {
                  if (tab[i] == materielsJ[k]) {
                    inpt2.checked = true;
                  }
                }
                inpt2.innerHTML = tab[i];

                inpt2.onclick = function () {
                  scope.addMateriels();
                };

                var label2 = document.createElement('label');
                label2.style.display = "contents";
                label2.for = tab[i];
                label2.innerHTML = tab[i];

                label.append(inpt2);
                label.append(label2);

                $("#materiels").append(label);


              }

            }
            select.append(inpt);
          }

          var id = elemAtt[15].childNodes[1].childNodes[0].id;
          elemAtt[15].childNodes[1].childNodes[0].innerHTML = "";
          $("#" + id).append(select);


          //liste des materiels avec des checkbox




          var scope = this;
          select.onchange = function () {
            if (this.value != "") {
              //console.log(scope.tabLacMat[this.value]);
            }
            var tab = scope.tabLacMat[this.value].sort();
            $("#materiels").empty();
            for (i = 0; i < tab.length; i++) {
              //creer dynamiquement
              var label = document.createElement('div');
              label.for = tab[i];
              //label.innerHTML = username;

              var inpt = document.createElement('input');
              inpt.id = tab[i];
              inpt.type = "checkbox";

              if (tab[i] == scope.materielsV) {
                inpt.checked = true;
              }
              inpt.innerHTML = tab[i];

              inpt.onclick = function () {
                scope.addMateriels();
              };

              var label2 = document.createElement('label');
              label2.style.display = "contents";
              label2.for = tab[i];
              label2.innerHTML = tab[i];

              label.append(inpt);
              label.append(label2);

              $("#materiels").append(label);


            }


            //console.log(this.value);
            var data = '[{' +
              '"attributes": {' +
              '  "objectid": ' + scope.objectidV + ',' +
              '  "lac_mat": "' + this.value + '",' +			//todo rec "prescripteur"
              '}' +
              '}' +
              ']';
            scope.saveModification(data);
          };

          //ne rien marquer pour les deux dates fin 
			  /*var elemAtt = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes[0].childNodes[0].childNodes;
          */
			  if(scope.creationTrav == 1){
				  elemAtt[11].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value = "";
				  elemAtt[12].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value = "";
				  
				  var data = '[{' +
					  '"attributes": {' +
					  '  "objectid": ' + this.objectidV + ',' +
					  '  "categories": "Aménagement bâtiment",' +
					  '  "activites": "Carrelage",' +
					  '  "lacreservoir": "Aube",' +
					  '  "priorite": "Moyenne",' +
					  '  "statut": "Non assigné",' +
					  '  "date_fin_prev": 0,' +
					  '"date_fin_effe": 0' +
					  '}' +
					  '}' +
					  ']';
					scope.saveModification(data);
				  
			  }
			  
			 
			  if(elemAtt[11].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value=="1970-01-01"){
				  elemAtt[11].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value = "";
			  }
			  if(elemAtt[12].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value=="1970-01-01"){
				  elemAtt[12].childNodes[1].childNodes[0].childNodes[2].childNodes[0].value = "";
			  }

        }
      },

      addMateriels: function () {
        var elemI = $("#materiels").find("input");
        var str = "";
        for (j = 0; j < elemI.length; j++) {
          if (elemI[j].checked) {
            str += elemI[j].id + ";"; //getAttribute("fullname") + ";";
          }
        }

        var data = '[{' +
          '"attributes": {' +
          '  "objectid": ' + this.objectidV + ',' +
          '  "materiels": "' + str + '",' +			//
          '}' +
          '}' +
          ']';
        this.saveModification(data);

      },

      //modifier la liste des operateurs pour la fiche anomalie
      listeOperateurs: function (attributeInspector, relatedLayerName) {
        var scope = this;
        if (relatedLayerName.includes("nomal")) {
          var btnDiv = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiButtons")[0];
          var elemAtt = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes[0].childNodes[0].childNodes;
          for (k = 0; k < elemAtt.length; k++) {
            if (elemAtt[k].childNodes[0].textContent == "Opérateur") {//todo
              //console.log(elemAtt[k].childNodes[1].childNodes[0].childNodes[2].childNodes[1].value);
              //console.log(elemAtt[k].childNodes[1].childNodes[0]);

              //creer dynamiquement
              var select = document.createElement('select');
              select.id = "selectOperateur";
              select.style.cssText = "width: 100%;";
              select.innerHTML = "";

              var inpt = document.createElement('option');
              inpt.id = "";
              inpt.innerHTML = "";
              select.append(inpt);

              /*for (j = 0; j < this.listeOperateur.length; j++) {
                var inpt = document.createElement('option');
                inpt.id = this.listeOperateur[j];
                inpt.innerHTML = this.listeOperateur[j];
                if (this.listeOperateur[j] == this.operatV) {
                  inpt.selected = true;
                }
                select.append(inpt);
              }*/
			  this.listeOperateur1 = this.listeOperateur1.filter(this.distinct);
			  
			  for (j = 0; j < this.listeOperateur1.length; j++) {
                var inpt = document.createElement('option');
                inpt.id = this.listeOperateur1[j];
                inpt.innerHTML = this.listeOperateur1[j];
                if (this.listeOperateur1[j] == this.operatV) {
                  inpt.selected = true;
                }
                select.append(inpt);
              }


              var id = elemAtt[k].childNodes[1].childNodes[0].id;
              elemAtt[k].childNodes[1].childNodes[0].innerHTML = "";
              $("#" + id).append(select);

              select.onchange = function () {
                var data = '[{' +
                  '"attributes": {' +
                  '  "objectid": ' + scope.objectidV + ',' +
                  '  "operateur": "' + this.value + '"' + //todo prescripteur
                  '}' +
                  '}' +
                  ']';
                scope.saveModification2(data);
              };

            }
          }

        }
      },


      //**************Partie assignation groupes utilisateurs*************************
      //recupere div pour la liste des attributs
      assignation: function (attributeInspector, relatedLayerName) {
        if (relatedLayerName.includes("ravai")) {
          var assigner = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes");

          this.reinitializeListe();

          var scope = this;

          var elemI = assigner[0].childNodes[0].childNodes[0].childNodes;
          for (i = 0; i < elemI.length; i++) {
            if (elemI[i].childNodes[0] != undefined && elemI[i].childNodes[0].textContent == "Groupe opérateurs") {//todo majuscule Groupe
              var exist = elemI[i].childNodes[1].innerHTML;
              exist += '<form>' +
                '<div class="multiselect">' +
                '<div class="selectBox" id="liste1" onclick="">' +
                '<select>' +
                '<option>Liste des groupes</option>' +
                '</select>' +
                '<div class="overSelect"></div>' +
                '</div>' +
                '<div id="groupes" style="display:none;">' +
                '<label for="all"><input id="all" title="tous" type="checkbox" /> Tous les utilisateurs </label>' +
                '</div>' +
                '</div>' +
                '</form>';
              elemI[i].childNodes[1].innerHTML = exist;
              elemI[i].childNodes[1].childNodes[0].style.display = "none";

              //scope.groupeV = elemI[i].childNodes[1].childNodes[0].childNodes[1].childNodes[0];

              document.getElementById("liste1").onclick = function () {
                var checkboxes = document.getElementById("groupes");
                if (!this.expanded) {
                  checkboxes.style.display = "block";
                  this.expanded = true;
                } else {
                  checkboxes.style.display = "none";
                  this.expanded = false;
                }
              };
              setTimeout(function () {
                document.getElementById("all").onclick = function () {
                  scope.getGroupes(this);
                };
              }, 500);

            }
            if (elemI[i].childNodes[0] != undefined && elemI[i].childNodes[0].textContent == "Opérateur") {//todo majuscule Opérateur
              var exist = elemI[i].childNodes[1].innerHTML;
              exist += '<form>' +
                '<div class="multiselect">' +
                '<div class="selectBox" id="liste2" onclick="">' +
                '<select>' +
                '<option>Liste des utilisateurs</option>' +
                '</select>' +
                '<div class="overSelect"></div>' +
                '</div>' +
                '<div id="utilisateurs" style="display:none;">' +
                '</div>' +
                '</div>' +
                '</form>';

              elemI[i].childNodes[1].innerHTML = exist;
              elemI[i].childNodes[1].childNodes[0].style.display = "none";

              scope.exploitantV = elemI[i].childNodes[1].childNodes[0].childNodes[2].childNodes[0];

              document.getElementById("liste2").onclick = function () {
                var checkboxes = document.getElementById("utilisateurs");
                if (!this.expanded) {
                  checkboxes.style.display = "block";
                  this.expanded = true;
                } else {
                  checkboxes.style.display = "none";
                  this.expanded = false;
                }
              };

            }
          }
          //on recuperer les users et les groupes du Portal
          scope.getUsers();


          scope.sousCateg(attributeInspector);
        }

      },

      //function apply edit pour travail
      deleteTravail: function (dataf) {
        var scope = this;
        $.ajax({
          type: 'POST',
          //url: scope.portalUrl2 + '/arcgis/rest/services/collector/ginov_entite/FeatureServer/4/applyEdits?f=json&token=' + scope.token + '&deletes=' + data,
          //url: scope.portalUrl2 + '/arcgis/rest/services/collector/ginov_entite/FeatureServer/4/applyEdits',
          url: scope.portalUrl2 + scope.serviceTravail + '/applyEdits',
          data: {
            f: "json",
            deletes: dataf,
            token: scope.token
          },
          success: function (result) {
            //console.log("success", result);
            scope._onPreviouBtnClick();
          },
          error: function () {
          }
        });
      },

      //function apply edit pour anomalie
      deleteAnomalie: function (dataf) {
        var scope = this;
        $.ajax({
          type: 'POST',
          //url: scope.portalUrl2 + '/arcgis/rest/services/collector/ginov_entite/FeatureServer/3/applyEdits?f=json&token=' + scope.token + '&deletes=' + data,
          //url: scope.portalUrl2 + '/arcgis/rest/services/collector/ginov_entite/FeatureServer/3/applyEdits',
          url: scope.portalUrl2 + scope.serviceAnomalie + '/applyEdits',
          data: {
            f: "json",
            deletes: dataf,
            token: scope.token
          },
          success: function (result) {
            //console.log("success", result);
            scope._onPreviouBtnClick();
          },
          error: function () {
          }
        });
      },

      //generer un token ESRI pour portaladmin si non valide
      //fonction basée sur le portail EPTB
      getValidPortalToken: function () {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/services/getProfilIds.php',
          data: {
            idFunc: "getPortalTokenGINOV"
          },
          success: function (result) {
            //console.log("succes");
            scope.token = result;
            scope.getGrpId();
            var username = scope.getUrlVars(window.top.location.href)["username"];
            //this.getPrescGinov(username);
            scope.getUserViewer(scope.idGroupe, username);
            //scope.getUsersFromGinovGrp(scope.idGroupe, username);
            scope.getMateriels();
			scope.getUserMailL(scope.idGoupeAlerte);
          },
          error: function (result) {
            //console.log(result);
            scope.token = "";
            scope.getGrpId();
            var username = scope.getUrlVars(window.top.location.href)["username"];//console.log("error " + username);
            //this.getPrescGinov(username);
            //scope.getUsersFromGinovGrp(scope.idGroupe, username);
            scope.getUserViewer(scope.idGroupe, username);
            scope.getMateriels();
          }
        });
      },

      //recuperer la liste des operateurs (ginov_operateur)
      getListeUser: function (id, groupe) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/community/groups/' + id + '/users?f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            if (groupe == 'GINOV_OPÉRATEUR') {
              for (i = 0; i < result.users.length; i++) {
                scope.listeOperateur.push(result.users[i]);
              }
            }
            else if (groupe == 'GINOV_PRESCRIPTEUR') {
              for (i = 0; i < result.users.length; i++) {
                //si l'utilisateur connecté est planificateur/prescripteur
                if (result.users[i] == scope.operateurUrl) {
                  this.operateur = 0;
                }
                scope.listePrescripteur.push(result.users[i]);
              }
			}
            
			//change to fullname
			scope.getFullName(scope.listeOperateur);
			scope.getFullName2(scope.listePrescripteur);
          },
          error: function () {
          }
        });
      },
	
	
	//recuperer fullname
	  getFullName: function (user) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/portals/self/users?start=0&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            for (j = 0; j < user.length; j++) {
              for (i = 0; i < result.users.length; i++) {
                if (result.users[i].username == user[j]) {
                  scope.listeOperateur1.push(result.users[i].firstName + " "+ result.users[i].lastName);
                }
              }
            }
			//deuxieme liste des users portal
			var scope2 = scope;
			$.ajax({
			  type: 'GET',
			  url: scope2.portalUrl + '/portal/sharing/rest/portals/self/users?start=101&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope2.token,
			  success: function (result) {
				result = JSON.parse(result);
				for (j = 0; j < user.length; j++) {
				  for (i = 0; i < result.users.length; i++) {
					if (result.users[i].username == user[j]) {
					  scope2.listeOperateur1.push(result.users[i].firstName + " "+ result.users[i].lastName);
					}
				  }
				}
				
			  },
			  error: function () {
			  }
			});
			
            
          },
          error: function () {
          }
        });
      },
	  //prescripteur
	  getFullName2: function (user) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/portals/self/users?start=0&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            for (j = 0; j < user.length; j++) {
              for (i = 0; i < result.users.length; i++) {
                if (result.users[i].username == user[j]) {
                  scope.listePrescripteur1.push(result.users[i].firstName + " "+ result.users[i].lastName);
                }
              }
            }
			
			//deuxieme liste users portal
			var scope2 = scope;
			$.ajax({
			  type: 'GET',
			  url: scope2.portalUrl + '/portal/sharing/rest/portals/self/users?start=101&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope2.token,
			  success: function (result) {
				result = JSON.parse(result);
				for (j = 0; j < user.length; j++) {
				  for (i = 0; i < result.users.length; i++) {
					if (result.users[i].username == user[j]) {
					  scope2.listePrescripteur1.push(result.users[i].firstName + " "+ result.users[i].lastName);
					}
				  }
				}
				
			  },
			  error: function () {
			  }
			});
            
          },
          error: function () {
          }
        });
      },
	  
      //get groupe Portal Id
      getGrpId: function () {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/community/self?f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            for (i = 0; i < result.groups.length; i++) {
              if (result.groups[i].title.toUpperCase() == 'GINOV_PRESCRIPTEUR') {
                //return result.groups[i].id;
                scope.getListeUser(result.groups[i].id, 'GINOV_PRESCRIPTEUR');
              }
              else if (result.groups[i].title.toUpperCase() == 'GINOV_OPÉRATEUR') {
                //return result.groups[i].id;
                scope.getListeUser(result.groups[i].id, 'GINOV_OPÉRATEUR');
              }
            }

          },
          error: function () {
          }
        });
      },

      getUserMail: function (user, priorite, lieu, categorie, activites, date_creation) {
        var scope = this;
        scope.userMails = "";
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/portals/self/users?start=0&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);

            for (j = 0; j < user.length; j++) {
              for (i = 0; i < result.users.length; i++) {
                if (result.users[i].username == user[j]) {
                  scope.userMails += result.users[i].email + ";";
                }
              }
            }
            //console.log(scope.userMails);
            scope.sendMail(scope.userMails, priorite, lieu, categorie, activites, date_creation);
          },
          error: function () {
          }
        });
      },

      sendMail: function (mails, priorite, lieu, categorie, activites, date_creation) {
        var scope = this;
        scope.userMails = "";
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/services/sendGinovMail.php?mails=' + mails + '&priorite=' + priorite + '&lieu=' + lieu + '&categorie=' + categorie + '&activites=' + activites + '&date_creation=' + date_creation,
          success: function (result) {
            //console.log(result);
          },
          error: function () {
          }
        });
      },

      //test si l'utilisateur est un prescripteur ou pas 
      getPrescGinov: function (username) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/services/getProfilIds.php?idFunc=getGINOVid',
          success: function (result) {
            //console.log(result);
            scope.getUsersFromGinovGrp(result, username);
          },
          error: function () {
          }
        });
      },

      //get user from ginov group
      getUsersFromGinovGrp: function (id, username) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/community/groups/' + id + '/users?f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            var tab = [];
            //console.log(scope.operateur, username, result);
            for (i = 0; i < result.users.length; i++) {
              if (result.users[i] == username) {
                scope.operateur = 0; //il est un prescripteur
              }
              tab.push(result.users[i]);
            }
            //console.log(scope.operateur);
          },
          error: function () {
            //console.log(scope.operateur);
          }
        });
      },


      //recuperer les parametres de l'url
      getUrlVars: function (url) {
        var vars = {};
        var parts = decodeURI(url).replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
          vars[key] = value;
        });
        return vars;
      },

      //send mail pour anomalie
      getUserMailAno: function (user, lac, statut, opera, lieu, ref, consq, descr, organe, date, copieMail) {
        var scope = this;
        scope.userMailsAno = "";
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/portals/self/users?start=0&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);

            for (j = 0; j < user.length; j++) {
              for (i = 0; i < result.users.length; i++) {
                if (result.users[i].username == user[j]) {
                  scope.userMailsAno += result.users[i].email + ";";
                }
              }
            }
			
			//deuxieme liste des users portal/sharing/rest/community/groups/
			var scope2 = scope;
			$.ajax({
			  type: 'GET',
			  url: scope2.portalUrl + '/portal/sharing/rest/portals/self/users?start=101&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope2.token,
			  success: function (result) {
				result = JSON.parse(result);

				for (j = 0; j < user.length; j++) {
				  for (i = 0; i < result.users.length; i++) {
					if (result.users[i].username == user[j]) {
					  scope2.userMailsAno += result.users[i].email + ";";
					}
				  }
				}
				  
				  //console.log(scope.userMailsAno);
				  scope2.sendMailAno(scope2.userMailsAno, lac, statut, opera, lieu, ref, consq, descr, organe, date, copieMail);
				},
				error: function () {
				}
			});
			
			
			
            //console.log(scope.userMailsAno);
            //scope.sendMailAno(scope.userMailsAno, lac, statut, opera, lieu, ref, consq, descr, organe, date, copieMail);
          },
          error: function () {
          }
        });
      },

      //recuperer la liste des operateurs (ginov_operateur)
      getListeUserAno: function (id, lac, statut, opera, lieu, ref, consq, descr, organe, date, copieMail) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/community/groups/' + id + '/users?f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            scope.getUserMailAno(result.users, lac, statut, opera, lieu, ref, consq, descr, organe, date, copieMail);

          },
          error: function () {
          }
        });
      },

      sendMailAno: function (mails, lac, statut, operateur, lieu, reference, consequence, description, organe, date_creation, copieMail) {
        var scope = this;
        scope.userMails = "";
        //console.log(mails);
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/services/sendGinovAlerte.php?mails=' + mails + '&lac=' + lac + '&statut=' + statut + '&operateur=' + operateur + '&reference=' + reference + '&consequence=' + consequence + '&description=' + description + '&organe=' + organe + '&lieu=' + lieu + '&date_creation=' + date_creation +'&copieMail='+ copieMail,
          success: function (result) {
            //console.log(result);
            //document.getElementById("corpsmodal").innerHTML = "L'alerte a été envoyée avec succès.  <button id='nonmodal'>  Fermer</button>"; 

            document.getElementById("accueilModal").style.display = "none";
            document.getElementById("okmodal").style.display = "";
            document.getElementById("komodal").style.display = "none";
            document.getElementById("encours").style.display = "none";

          },
          error: function (result) {
            //console.log(result);
            //document.getElementById("corpsmodal").innerHTML = "Impossible d'envoyer l'alerte <br/>Veuillez réessayer ultérieurement.   <button id='nonmodal'>  Fermer</button>"; 

            document.getElementById("accueilModal").style.display = "noe";
            document.getElementById("okmodal").style.display = "none";
            document.getElementById("komodal").style.display = "";
            document.getElementById("encours").style.display = "noe";
          }
        });
      },

      //test si lutilisateur == lecteur
      getUserViewer: function (id, username) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/community/users/' + username + '/userLicenseType?f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
            //console.log(result);
            for (i = 0; i < result.privileges.length; i++) {
              if (result.privileges[i] == "features:user:edit") {
                scope.operateur = 1; //il est au moins un operateur
              }
            }

            scope.getUsersFromGinovGrp(id, username);
          },
          error: function () {
            getUsersFromGinovGrp(id, username);
          }
        });
      },

      //pour un lecteur tous les champs sont verrouillés (anomalie et travail)
      disabledAttr: function (attributeInspector, relatedLayerName) {
        var elem = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes;

        if (relatedLayerName.includes("rav")) {
          var len = elem[0].childNodes[0].childNodes.length;
          for (i = 0; i < len; i++) {
            elementi = elem[0].childNodes[0].childNodes[i];
            elementi.childNodes[0].style.width = "40%";
            if (i != 8 && i != 16) {
              if (i == 3 || i == 5 || i == 6 || i == 10 || i == 1 || i == 11 || i == 12 || i == 0) {//le cas d'une liste deroulante
                var id = elementi.childNodes[1].childNodes[0].childNodes[2].childNodes[0].id;
              }
              else if (i == 15) {
                var id = "selectLacMat";
              }
              else {
                var id = elementi.childNodes[1].childNodes[0].childNodes[1].childNodes[0].id;
              }
              var value = document.getElementById(id).value;
              elementi.childNodes[1].childNodes[0].remove();
              var newContent = document.createTextNode(value);
              elementi.childNodes[1].appendChild(newContent);
              elementi.childNodes[1].setAttribute("style", "font-size: 16px;");
            }
            else if (i == 16) {
              var value = this.materielsV;
              document.getElementById("matForm").style.display = "none";
              elementi.childNodes[1].childNodes[0].remove();
              var newContent = document.createTextNode(value);
              elementi.childNodes[1].appendChild(newContent);
              elementi.childNodes[1].setAttribute("style", "font-size: 16px;");
            }
            else {
              var value = document.getElementById("selectPrescripteur").value;
              elementi.childNodes[1].childNodes[0].remove();
              var newContent = document.createTextNode(value);
              elementi.childNodes[1].appendChild(newContent);
              elementi.childNodes[1].setAttribute("style", "font-size: 16px;");
            }
          }

        }
        else if (relatedLayerName.includes("nomal")) {
          var elemAtt = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes;
          var len = elemAtt[0].childNodes[0].childNodes.length;
          for (i = 0; i < len; i++) {
            if (i != 5) {
              elementi = elemAtt[0].childNodes[0].childNodes[i];
              if (i == 0 || i == 4 || i == 1) {//le cas d'une liste deroulante
                var id = elementi.childNodes[1].childNodes[0].childNodes[2].childNodes[0].id;
              }
              else {
                var id = elementi.childNodes[1].childNodes[0].childNodes[1].childNodes[0].id;
              }
              var value = document.getElementById(id).value;
              elementi.childNodes[1].childNodes[0].remove();
              var newContent = document.createTextNode(value);
              elementi.childNodes[1].appendChild(newContent);
              elementi.childNodes[1].setAttribute("style", "font-size: 16px;");
            }
            else {
              elementi = elemAtt[0].childNodes[0].childNodes[i];
              var value = document.getElementById("selectOperateur").value;
              elementi.childNodes[1].childNodes[0].remove();
              var newContent = document.createTextNode(value);
              elementi.childNodes[1].appendChild(newContent);
              elementi.childNodes[1].setAttribute("style", "font-size: 16px;");
            }
          }
        }

        //suppresion du bouton ajout de pieces jointes
        var attachzone = document.getElementsByClassName("attachmentEditor atiAttachmentEditor")[0].id;
        var formAttach = $("#" + attachzone).find("form");
        formAttach.remove();


        var deleteAttachment = document.getElementsByClassName("deleteAttachment");
        if (deleteAttachment != undefined) {
          var str = "";
          setTimeout(function () {
            var id = deleteAttachment[0].parentElement.parentElement;
            for (k = 0; k < deleteAttachment.length; k++) {
              //console.log(deleteAttachment[k].parentElement.childNodes[0]);
              var textContent = deleteAttachment[k].parentElement.childNodes[0].textContent;
              var href = deleteAttachment[k].parentElement.childNodes[0].href;
              str += '<a href="' + href + '" >' + textContent + '</a><br>';

            }

            id.innerHTML = str;
          }, 500);
        }

      },

      //gestion des sous categories
      sousCateg: function (attributeInspector) {
        var scope = this;
        var elem = document.getElementById(attributeInspector.domNode.id).getElementsByClassName("atiAttributes")[0].childNodes;
        elementi = elem[0].childNodes[0].childNodes[3].childNodes[1].childNodes[0].childNodes[2].childNodes[1];
        //console.log(elem);
        elementi.setAttribute("id", "categorie");

        elem[0].childNodes[0].childNodes[4].childNodes[1].childNodes[0].childNodes[0].style.display = "none";
        elem[0].childNodes[0].childNodes[4].childNodes[1].childNodes[0].childNodes[1].style.display = "none";


        elem[0].childNodes[0].childNodes[3].childNodes[1].childNodes[0].style.display = "none";


        //creer dynamiquement
        var selectCa = document.createElement('select');
        selectCa.id = "Categ";
        selectCa.style.cssText = "width: 100%;";
        selectCa.innerHTML = "";

        var tabC = scope.valueCateg()[0];
        var inpt = document.createElement('option');
        inpt.id = "";
        inpt.innerHTML = "";
        selectCa.append(inpt);

        tabC = Object.keys(tabC);
        for (i = 0; i < tabC.length; i++) {
          var inpt = document.createElement('option');
          inpt.id = tabC[i];
          inpt.innerHTML = tabC[i];
          if (tabC[i] == this.categorieV) {
            inpt.selected = true;
          }
          selectCa.append(inpt);

        }


        var cat = elem[0].childNodes[0].childNodes[3].childNodes[1];
        cat.append(selectCa);

        //**************************************************************

        //creer dynamiquement
        var select = document.createElement('select');
        select.id = "selectCateg";
        select.style.cssText = "width: 100%;";
        select.innerHTML = "";

        //console.log(elem[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0]);
        var activ = elem[0].childNodes[0].childNodes[4].childNodes[1].childNodes[0];
        activ.append(select);

        //////////////////////////////////
        var tab = scope.valueCateg()[0][scope.categorieV];
        $("#selectCateg").empty();
        var inpt = document.createElement('option');
        inpt.id = "";
        inpt.innerHTML = "";
        select.append(inpt);
        //console.log(this.categorieV);
        if (tab != undefined) {
          for (i = 0; i < tab.length; i++) {
            var inpt = document.createElement('option');
            inpt.id = tab[i];
            inpt.innerHTML = tab[i];
            if (tab[i] == scope.activitesV) {
              inpt.selected = true;
            }
            select.append(inpt);
          }
        }
        //////////////////////////////////////////

        select.onchange = function () {
          var valeur = $("#selectCateg")[0].value;
          var data = '[{' +
            '"attributes": {' +
            '  "objectid": ' + scope.objectidV + ',' +
            '  "activites": "' + valeur + '"' +
            '}' +
            '}' +
            ']';
          scope.saveModification(data);
        };

        selectCa.onchange = function () {
          var valeur = $("#Categ")[0].value;//console.log(valeur);
          var tab = scope.valueCateg()[0][valeur];
          $("#selectCateg").empty();
          var inpt = document.createElement('option');
          inpt.id = "";
          inpt.innerHTML = "";
          select.append(inpt);

          for (i = 0; i < tab.length; i++) {
            var inpt = document.createElement('option');
            inpt.id = tab[i];
            inpt.innerHTML = tab[i];

            select.append(inpt);
          }

          var data = '[{' +
            '"attributes": {' +
            '  "objectid": ' + scope.objectidV + ',' +
            '  "categories": "' + valeur + '",' +
            '"activites": ""' +
            '}' +
            '}' +
            ']';
          scope.saveModification(data);
        };

      },


      valueCateg: function () {
        var tabCateg = [{
          "Aménagement bâtiment": [
            "Carrelage",
            "Peinture",
            "Création d’une nouvelle pièce"
          ],
          "Aménagement engins et matériel": [
            "Travaux d’amélioration d’un engin",
            "Travaux d'amélioration d'un véhicule",
            "Travaux d’amélioration d’un matériel"
          ],
          "Aménagement ouvrages": [
            "Serrurerie",
            "Installation d’échelle"
          ],
          "Aménagement des espaces": [
            "Plantation",
            "Aménagement des espaces",
            "Aménagement de berges"
          ],
          "Bucheronnage": [
            "-"
          ],
          "Désherbage": [
            "Brossage",
            "Air chaud pulsé",
            "Mousse chaude",
            "Traitement au pinceau",
            "Application de biocide",
            "Désherbage mécanique",
            "Débouchage des barbacanes"
          ],
          "Dégrillage": [
            "Dégrillage mécanique",
            "Dégrillage manuel"
          ],
          "Entretien bâtiment": [
            "Nettoyage intérieur",
            "Mise en peinture",
            "Nettoyage extérieur",
            "Plomberie"
          ],
          "Entretien engins et matériel": [
            "Mécanique de révision",
            "Entretien courant",
            "Changement de pièce"
          ],
          "Entretien des espaces": [
            "Elagage",
            "Taille",
            "Balayage",
            "Broyage",
            "Tonte",
            "Refection de chemin de service",
            "Retrait de bornes",
            "Peinture de borne"
          ],
          "Entretien des ouvrages": [
            "Nettoyage des ouvrages",
            "Nettoyage des parements amont de digue",
            "Curage de fossés"
          ],
          "Travaux génie civil": [
            "Travaux VRD",
            "Maçonnerie"
          ],
          "Administratif": [
            "-"
          ],
          "Formation": [
            "-"
          ],
          "Renfort Exploitation": [
            "Batardage",
            "Autres"
          ]
        }];
        return tabCateg;
      },

      //liste des materiels a partir dun service
      getMateriels: function () {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + scope.serviceMateriel + '/query',
          data: {
            f: "json",
            where: "1=1",
            outFields: "*",
            token: scope.token
          },
          success: function (result) {
            result = JSON.parse(result);
            //console.log(result.features);
            var features = result.features;
            var tab = [];
            for (i = 0; i < features.length; i++) {
              tab.push(features[i].attributes.lac);
              scope.tabLacListe.push(features[i].attributes.lac);
            }

            //scope.tabLacListe = scope.sort_unique(scope.tabLacListe);
            scope.tabLacListe = scope.tabLacListe.filter(scope.distinct);
            scope.tabLacMat = scope.sort_unique(tab);
            var tab2 = [];
            for (k = 0; k < scope.tabLacMat.length; k++) {
              var j = 0;
              scope.tabLacMat[scope.tabLacMat[k]] = [];
              tab2[scope.tabLacMat[k]] = [];
              for (i = 0; i < features.length; i++) {
                if (scope.tabLacMat[k] == features[i].attributes.lac) {
                  scope.tabLacMat[scope.tabLacMat[k]][j] = features[i].attributes.materiel;
                  tab2[scope.tabLacMat[k]][j] = features[i].attributes.materiel;
                  j++;
                }
              }
            }
            scope.tabLacMat = tab2;
            //console.log(scope.tabLacMat);

          },
          error: function () {
          }
        });
      },

      //valeurs uniques dans un tableau
      sort_unique: function (arr) {
        if (arr.length === 0) return arr;
        arr = arr.sort(function (a, b) { return a * 1 - b * 1; });
        var ret = [arr[0]];
        for (var i = 1; i < arr.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
          if (arr[i - 1] !== arr[i]) {
            ret.push(arr[i]);
          }
        }
        return ret;
      },

      distinct: function (value, index, self) {
        return self.indexOf(value) === index;
      },

	  //liste des destinataires mails affichée dans modal
	  getUserMailListe: function (user, utilisateur) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/portals/self/users?start=0&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
			var tab =[];
			for(i=0;i<result.users.length;i++){
				tab.push(result.users[i]);				
			}
			
			
			var scope2 = scope;
			$.ajax({
				  type: 'GET',
				  url: scope2.portalUrl + '/portal/sharing/rest/portals/self/users?start=101&sortField=fullname&sortOrder=asc&excludeSystemUsers=true&num=1000&f=json&token=' + scope2.token,
				  success: function (result) {
					result = JSON.parse(result);
					for(i=0;i<result.users.length;i++){
						tab.push(result.users[i]);				
					}					
					var str = "";
					for (j = 0; j < user.length; j++) {
					  for (i = 0; i < tab.length; i++) {
						if (tab[i].username == user[j]) {
						  str += "<p>"+tab[i].firstName + " " + tab[i].lastName +"</p>";
						  
						}
						if (tab[i].username == utilisateur) {
						  scope2.utilisateurMail = tab[i].email;
						}
					  }
					}
					document.getElementById("personnes").innerHTML = str;
			
					
				  },
				  error: function () {
				  }
			});
			
			
			
			/*var str = "";
            for (j = 0; j < user.length; j++) {
              for (i = 0; i < result.users.length; i++) {
                if (result.users[i].username == user[j]) {
                  //scope.userMailsAno += result.users[i].email + ";";
				  str += "<p>"+result.users[i].firstName + " " + result.users[i].lastName +"</p>";
				  
                }
				if (result.users[i].username == utilisateur) {
                  //scope.userMailsAno += result.users[i].email + ";";
				  scope.utilisateurMail = result.users[i].email;
				  //console.log(scope.utilisateurMail);
                }
              }
            }
			document.getElementById("personnes").innerHTML = str;*/
           },
          error: function () {
          }
        });
      },
		
      getUserMailL: function (id) {
        var scope = this;
        $.ajax({
          type: 'GET',
          url: scope.portalUrl + '/portal/sharing/rest/community/groups/' + id + '/users?f=json&token=' + scope.token,
          success: function (result) {
            result = JSON.parse(result);
			scope.getUserMailListe(result.users, scope.utilisateurName);
            
          },
          error: function () {
          }
        });
      },
      //bha fin modif

    });

    // operation class
    Clazz.Operation = declare([operationBase], {
      constructor: function (operationName, operationData, relatedRecordsEditor) {
        this.operationName = operationName;
        this.operationData = operationData;
        this.relatedRecordsEditor = relatedRecordsEditor;
      },

      performUndo: function () {
        switch (this.operationName) {
          case Clazz.OPERATION_SHOW_RELATED_TABLES:
            return this.relatedRecordsEditor.showRelatedTables(this.operationData);
          case Clazz.OPERATION_SHOW_RELATED_RECORDS:
            return this.relatedRecordsEditor.showRelatedRecords(this.operationData);
          case Clazz.OPERATION_SHOW_INSPECTOR:
            return this.relatedRecordsEditor.showInspector(this.operationData);
          default:
            return this.relatedRecordsEditor.showFirstPage(this.operationData);
        }
      }
    });

    // Working around for bug of AttributeInspector. Incorrect behavior with
    // multiple instances of AttributeInspector.
    Clazz.ATI = declare([AttributeInspector], {
      constructor: function () {
        this._aiConnects = [];
        this._selection = [];
        this._toolTips = [];
      }
    });

    lang.mixin(Clazz, {
      OPERATION_SHOW_RELATED_TABLES: "showRelatedTables",
      OPERATION_SHOW_RELATED_RECORDS: "showRelatedRecords",
      OPERATION_SHOW_INSPECTOR: "showInspector",
      OPERATION_FIRST: "first"
    });

    return Clazz;
  });
