require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Editor",
    "esri/widgets/Search",
    "esri/widgets/Expand",
    "esri/core/watchUtils",
    "esri/Graphic",
    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",
    "esri/widgets/Track",
    "esri/widgets/Home",
    "esri/tasks/RouteTask",
    "esri/tasks/support/RouteParameters",
    "esri/tasks/support/FeatureSet",
    "esri/support/actions/ActionButton",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/widgets/Popup",
    "esri/widgets/Legend" 
    
  ], function(Map, MapView,FeatureLayer,BasemapGallery,Editor,Search,Expand,watchUtils,Graphic,Query,QueryTask,Track,Home,RouteTask,RouteParameters,FeatureSet,ActionButton,Point,Polyline,Popup,Legend) {

      var map = new Map({
          basemap: "dark-gray-vector"
      }); 

      var view = new MapView({
      container: "viewDiv",
      map: map,
      center: [32.8,39.9],
      zoom: 10
    });
    
    //Show image Action in Popup

    var showImageAction = {
      image: "https://www.beycon.com.tr/webyazilim/wp-content/uploads/2016/09/png-nedir.jpg",
      title: "Show Image",
      id: "show-image"

    };

    //Find Route Action in Popup

    var routeFindAction = {
      image: "https://img.icons8.com/pastel-glyph/2x/route.png",
      title: "Find the Route",
      id: "find-route"
    };

    //Renders Logos on top of Basketball Fields

    var basketballFieldLogoRenderer = {
      type: "simple",
      color: "#BA55D3",
      symbol: {
        type: "picture-marker",
        url: "https://static.arcgis.com/arcgis/styleItems/Icons/web/resource/SportsComplex.svg",
        width: "15px",
        height: "15px",
        
      }
    };

    //Displays the Names of Basketball Fields

    var basketballFiledLabels = {

      symbol: {
        type: "text",
        color: "#FFFFFF",
        haloColor: "#5E8D74",
        haloSize: "1.4px",
        font: {
          size: "10px",
          family: "noto-sans",
          style: "italic",
          weight: "normal"
        }
      },
      labelPlacement: "above-center",
      labelExpressionInfo: {
        expression: "$feature.NAME"
      }
    };
    
    //Popup that displays when basketball field is clicked
    //Contains information about fields and has buttons so that
    //Actions can be performed such as find route and showImgae

    const popupTemplate = {
        
        title: "{NAME}",
        actions: [showImageAction,routeFindAction],
        autoCloseEnabled: true,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "ADDRESS",
                label: "Address:",
                format: {
                  places: 0,
                  digitSeparator: true
                }
              },
              {
                fieldName: "NEIGHBORHOOD",
                label: "Neighborhood:",
                format: {
                  places: 0,
                  digitSeparator: true
                }
              },
              {
                fieldName: "CLOSING_TIME",
                label: "Closes at ",
                format: {
                  places: 0,
                  digitSeparator: true
                }
              }              
            ]
          }
        ]
      };
      
      //Basketbal Field object with labeling and popup information

      var basketballFields = new FeatureLayer({
          url:
              "https://services7.arcgis.com/bNLjDotbYJVS3u6n/arcgis/rest/services/Turkiye_Basketbol_Sahalari/FeatureServer/0",
          renderer: basketballFieldLogoRenderer,
          labelingInfo: [basketballFiledLabels],
          outFields: ["*"],
          popupTemplate: popupTemplate
      });

      //Gallery of Basemaps where use can chose whichever you want

      var basemapGallery = new BasemapGallery({
          view: view,
          container: document.createElement("div")

      })
    
      //Search widget that enables user to search certain locations

      var searchWidget = new Search({
          view: view,
        
      });

      //Editor widget that enable editing and creating new Basketball fields on the map

      var editor = new Editor({
          view: view,
          container: document.createElement("div")
      });

      //Expand widget that includes editor

      var editExpand = new Expand({
          view: view,
          content: editor,
          group: "top-right"
      }); 

      //Expand widget that includes basemap gallery
      //!Both grouped in right so that one of them is opened the other closes

      var galleryExpand = new Expand({
          view: view,
          content: basemapGallery,
          group: "top-right"
      })

      //Home button that enables to go back to the default view 

      var homeBtn = new Home({
          view: view
      });

      //All of these widgets and objects added to the ui

      view.ui.add(homeBtn,"top-left");
      view.ui.add(searchWidget,"top-right");
      view.ui.add(editExpand,"top-right");
      view.ui.add(galleryExpand,"top-right");
      //view.ui.add(legend,"bottom-left");
      
      map.add(basketballFields);

      //Route displayment variable

      var isRouteShowed = false,isDirectionsShowed = false,isFieldOptionsShowed = false;

      //Once user gives permission users location is stored

      var user_latitude,user_longitude;
      
      //At every click, it displays the coordinates in console
      
      view.on("click", function(event){
          
          var clickedLat = Math.round(event.mapPoint.latitude * 1000) / 1000;
          var clickedLong = Math.round(event.mapPoint.longitude * 1000) / 1000;
          console.log("x: "+clickedLat+" y: "+clickedLong);
          
          //When popup opened, move to the selected field

          view.popup.watch("visible",function(event) {

              var opts = {
                  duration: 2000  // Duration of animation will be 5 seconds
              };

              view.goTo({
                  center: [clickedLong, clickedLat],
                  zoom: 12
              }, opts);
              
          });
      });
      
      //The code that gets users location

      var x = document.getElementById("viewDiv");

      function getLocation() {

          if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(storePosition);
          } 
          else { 
          x.innerHTML = "Geolocation is not supported by this browser.";
          }
      }
  
      //If users position taken correctly it is stored in location variables
      function storePosition(position) {

          user_latitude =  position.coords.latitude;
          user_longitude =  position.coords.longitude;
          console.log("User Loceted.");
          console.log("Ux: "+user_latitude+" Uy: "+user_longitude);

      }

      //Function calls
      
      getLocation();
      addButtons();
      
      //Function with ugly buttons that will be changed later

      var isLocationShowed = false;
      
      function addButtons(){
      
          //Show location button that displays a point on your location once it is clicked

          var btn_showLocation = document.createElement('button');
          btn_showLocation.title = "Show my Location";
          var img = document.createElement('img');
          img.width = 16;
          img.height = 16;
          img.src = 'https://png.pngtree.com/png-vector/20190118/ourmid/pngtree-vector-location-icon-png-image_328697.jpg';
          btn_showLocation.appendChild(img);
          
          //Close Location button is enabled after show location is clicked
          //It stops the location displayment

          var btn_closeLocation = document.createElement('button');
          btn_closeLocation.title = 'Close location view';
          var img2 = document.createElement('img');
          img2.width = 16;
          img2.height = 16;
          img2.src = 'https://cdn4.iconfinder.com/data/icons/flat-design-basic-set-10-1/24/symbol-cancel-cross-red-512.png';
          btn_closeLocation.appendChild(img2);
          
          //Find's closest basketball field acoording to user's location
          
          var btn_findClosestField = document.createElement('button');
          btn_findClosestField.title = 'Find closest field';
          var img3 = document.createElement('img');
          img3.width = 16;
          img3.height = 16;
          img3.src = "data:image/jpeg;base64,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";
          btn_findClosestField.appendChild(img3);

          //Gives User an option to control Fields according to the regions
          //When button is clicked it opens a span and shows the regions as 
          //Checkboxs.

          var btn_findFieldIn = document.createElement('button');
          btn_findFieldIn.title = "Find Field In";
          var img4 = document.createElement("img");
          img4.width = 16;
          img4.height = 16;
          img4.src = "https://img.icons8.com/cotton/2x/search.png";
          btn_findFieldIn.appendChild(img4);
          
        //Show button 

          var btn_showSelectedLayers = document.createElement('button');
          btn_showSelectedLayers.innerHTML = "Show Selected"
          
          var span1 = document.createElement("span");
          span1.id = "span1";

          var br1  = document.createElement("br");
          var br2  = document.createElement("br");
          //Buttons added to the ui

          view.ui.add(btn_findClosestField,"top-left");
          view.ui.add(btn_showLocation, 'top-left');
          view.ui.add(btn_findFieldIn,"top-right");
          
          //When show location button is clicked, it calls the showLocation method,
          //removes button from ui and adds close button, updates isLocationShowed 
          
          btn_showLocation.addEventListener('click', () => {
              
              if(!isLocationShowed){

                showLocation(user_longitude,user_latitude);
                isLocationShowed = true;
                view.ui.remove(btn_showLocation);
                view.ui.add(btn_closeLocation,"top-left");
              }
          });

          //When close location method is clicked, it removes the graphics, updates 
          //isLocationShowed, and changes buttons

          btn_closeLocation.addEventListener('click', () => {

            if(isLocationShowed){

              view.graphics.remove(locGraphic);
              view.ui.remove(btn_closeLocation);
              view.ui.add(btn_showLocation, 'top-left');
              isLocationShowed = false;
            }
          });

          //When Button is Clicked it opens a span which contains region checkboxes.
          //Later, the filter option will be activated.

          btn_findFieldIn.addEventListener('click',()=>{

            if(!isFieldOptionsShowed){
              
              view.ui.add(span1,"top-right");

              //Exacutes a query task in FeatureServer and get distinct Neighborhood attributes

              var fieldRegionQuery = new Query();
              fieldRegionQuery.where = "NEIGHBORHOOD IS NOT NULL"
              fieldRegionQuery.outFields = ["NEIGHBORHOOD"];
              fieldRegionQuery.returnDistinctValues = true;
              fieldRegionQuery.orderByFields = 'NEIGHBORHOOD';
              fieldRegionQuery.returnGeometry = true;
        
              var queryTask = new QueryTask({

                  url:"https://services7.arcgis.com/bNLjDotbYJVS3u6n/arcgis/rest/services/Turkiye_Basketbol_Sahalari/FeatureServer/0",
              });
              
              window.prev = undefined;

              queryTask.execute(fieldRegionQuery).then(function(result){

                  //For each distinct neighborhood, it creates a checkbox and label objects and appends them to the span

                  result.features.forEach(function(field){
                      
                      if(prev!==field.attributes.NEIGHBORHOOD){
                          
                          
                          var checkBox = document.createElement('INPUT');
                          checkBox.setAttribute("type", "checkbox");
                          checkBox.id = field.attributes.NEIGHBORHOOD;

                          var label_CB = document.createElement('label');
                          label_CB.htmlFor = field.attributes.NEIGHBORHOOD;
                          label_CB.appendChild(document.createTextNode(" "+field.attributes.NEIGHBORHOOD));

                          var br  = document.createElement("br");

                          span1.appendChild(checkBox);
                          span1.appendChild(label_CB);
                          span1.appendChild(br);
                          
                      }
              
                      prev = field.attributes.NEIGHBORHOOD;

                  });
                  span1.appendChild(br1);
                  span1.appendChild(btn_showSelectedLayers);            
              });

              isFieldOptionsShowed = true;
              
            }
            else{
              
              //removes span and childs of span when panel is closed

              view.ui.remove(span1);
              
              var node = span1;
              
              while (node.firstChild) {
                  node.removeChild(node.firstChild);
              }               
              isFieldOptionsShowed = false;
            }
            
          });
          
          //When findClosestField button is clicked, it calls findCloses function and 
          //shows the closest field to the user's location on the map

          btn_findClosestField.addEventListener("click",findClosest); 
      
      }

      //Find Closest function runs a Query and gets all Basketball Fields that are on the FeatureLayer
      //Then it pushes all Field objects to the array, calculates the disdance between fields and user 
      //location. After all, it finds the closest one and puts a label on it then zoom to it.

      function findClosest(event){

        //Executing the Query

        var fieldQuery = new Query();
        fieldQuery.where = "1=1"
        fieldQuery.outFields = ["*"];
        fieldQuery.returnGeometry = true;
        
        var queryTask = new QueryTask({

          url:"https://services7.arcgis.com/bNLjDotbYJVS3u6n/arcgis/rest/services/Turkiye_Basketbol_Sahalari/FeatureServer/0",
        });

        queryTask.execute(fieldQuery)
        .then(function(result){

          var fields = [];

          //Pushing fields to the array

          result.features.forEach(function(field){
            fields.push(field);
          });

          var closestIndex,shortestDistance = Number.MAX_VALUE;

          //Calculates the distance for all fields and finds the closest one's index

          for(var i=0;i<fields.length;i++){
            var dis = calculateDistance(user_latitude,user_longitude,fields[i].geometry);
            
            if(shortestDistance>dis){
              shortestDistance = dis;
              closestIndex = i;
            }
          }
          
          var closestPoint = fields[closestIndex].geometry;
          
          //zoom in to the field

          view.goTo({
              center: [closestPoint.longitude,closestPoint.latitude],
              zoom: 13
            }, opts); 

          //Putting simple marker to it

          var locPointSymbol = {

            type: "simple-marker",
            size: 6,
            color: [226, 119, 40],  // orange
            outline: {
              color: [255, 255, 255], // white
              width: 1
            }
          };

          var closGrap = new Graphic({
            geometry:closestPoint,
            symbol: locPointSymbol
          });

          view.graphics.add(closGrap);
          
        });
        
        //Snackbar message for 5 seconds which basically says found it
        
        var snackbar = document.createElement("snackbar");
        snackbar.id = "snackbar";
        snackbar.className = "show";
        snackbar.innerHTML = "Closest field has found...<br>Click on top to see further details";
        view.ui.add(snackbar,"bottom-left"); 
        setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); view.ui.remove(snackbar); }, 5000);
        
      }

      //Calculates the distance between two points

      function calculateDistance(user_latitude,user_longitude,fieldPoint){
        var lat = (fieldPoint.latitude-user_latitude)*(fieldPoint.latitude-user_latitude);
        var lng =(fieldPoint.longitude-user_longitude)*(fieldPoint.longitude-user_longitude);
        var dist = Math.sqrt(lat+lng);
        return dist;
      }

      //Show location function draws point on the user's location once button is clicked 

      var locGraphic;
      var opts = {
        duration: 1000  
      }; 

      function showLocation(x,y){
          
          var locPoint = {

              type: "point",
              longitude: x,
              latitude: y

          };

          var locPointSymbol = {

              type: "simple-marker",
              size: 8,
              color: [226, 119, 40],  // orange
              outline: {
                  color: [255, 255, 255], // white
                  width: 1
              }
          };

          locGraphic = new Graphic({
              geometry: locPoint,
              symbol: locPointSymbol

          });
   
          view.graphics.add(locGraphic);

          //Move to the location Point

          var opts = {
                  duration: 1000  // Duration of animation will be 5 seconds
              }; 

          view.goTo(locGraphic,opts);
      }
      
      var directionsService = new google.maps.DirectionsService;
      
      //Popup action functions
      //Once show Image is called it is opening google maps page on new window

      function showImageActionFunction(){
          var win = window.open("https://www.google.com/maps?q=ankara+basketbol+sahalari&rlz=1C1RUCY_trTR710TR710&um=1&ie=UTF-8&sa=X&ved=0ahUKEwif1NHA-OjiAhWBw8QBHTzNAQYQ_AUIEygE", '_blank');  
          win.focus();
      }

      //Directions popup that will be opened when route found

      var directionsPopup = new Popup({

        title: "Directions",
        view: view,
        visible: false,
        
      });

      //show directions button of directions Popup

      var showDirections = {
        
        image: "https://image.flaticon.com/icons/png/512/68/68537.png",
        title: "Directions",
        id: "show-directions"

      };
      
      //next Button in directions Popup

      var nextDirectionAction = {

        image: "data:image/png;base64,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",
        title: "Next",
        id: "next-direction"

      };

      //Line symbol is used while displaying route

      var simpleLineSymbol1 = {
          type: "simple-line",
          color: [226,119,40], //orange
          width: 2,
          outline: {
                  color: [255, 255, 255], // white
                  width: 0.8
              }
      };
      
      //Display route method takes google's directionService data and shows the path

      function displayRoute(data){
          
          if(isRouteShowed){
              view.graphics.removeAll();
              if(isLocationShowed){
                  showLocation(user_longitude,user_latitude);
              }
          }

          //For every step of the route data it calls this function where polyline is displayed 

          data.routes[0].legs[0].steps.forEach(function(result){

              //Every path points are pushed into pathArray
                                             
              var pathArray = [];
              
              for(var i=0;i<result.path.length;i++){
                  pathArray.push([result.path[i].lng(),result.path[i].lat()]);

              }
       
              //Polyline object with path points

              var polyL = new Polyline({
                  paths: pathArray
                  
              });
              
              var polylineGraphic = new Graphic({
                  geometry: polyL,
                  symbol: simpleLineSymbol1
              });
              
              //Polyline graphics are added to the view

              view.graphics.add(polylineGraphic);
              isRouteShowed = true;

          });
                   
      }

      //Displays directions in popup. 

      window.j = 0;
      window.stepsLength = 0;
      
      function displayDirections(data){
        
        //Total time and distance to reach destination

        var totalDistance = data.routes[0].legs[0].distance.text;
        var totalTime = data.routes[0].legs[0].duration.text;
        
        //Set popup's template

        directionsPopup.visible = true;
        directionsPopup.title = ""+totalDistance+" "+totalTime;
        directionsPopup.content = "<b>From: </b>"+data.routes[0].legs[0].start_address+"\r\n "+"<br><b>To: </b> "+data.routes[0].legs[0].end_address;
        directionsPopup.actions = [showDirections];
        view.ui.add(directionsPopup,"bottom-left");
        
        console.log("Distance---"+totalDistance);
        console.log("Time---"+totalTime);
        
        //moves view to start position

        view.goTo([user_longitude,user_latitude],opts);

        //When show directions button clicked it starts to show directions of Google's data

        directionsPopup.on("trigger-action", function(event) {

          if(event.action.id === "show-directions"){

            //pushes directions string and start positions of every step

            var steps = [];
            var stepPoints = [];
            
            data.routes[0].legs[0].steps.forEach(function(result){
              
              steps.push(result.instructions);
              stepPoints.push(result.start_location);

            });

            stepsLength = steps.length;
            
            //when next button is clicked it changes the directions string and zooms to the point

            directionsPopup.content = steps[j];
            directionsPopup.actions = [nextDirectionAction];
            view.goTo({
                  center: [stepPoints[j].lng(), stepPoints[j].lat()],
                  zoom: 16
              }, opts);

            j++;

            directionsPopup.on("trigger-action",function(event){
              
              if(event.action.id === "next-direction"){
                console.log("--"+stepsLength+"--"+j);
                if((stepsLength) === j){
                  console.log("gldim");
                  directionsPopup.content = "Destination Reached!";
                  directionsPopup.actions = [];
                  j = 0;
                  stepsLength = 0;
                }
                else{
                directionsPopup.content = steps[j];
                view.goTo({
                  center: [stepPoints[j].lng(), stepPoints[j].lat()],
                  zoom: 16
                }, opts);
                j++;
              }
              }
            });    
            
          }
        });


      }
      
      //Find route function calls Google Directions API's directionService.route function
      //where route is solved. It takes user's location as origin and field's coordinates 
      //as destination. After calculating the route displayRoute method is called

      function findRoute(lat,long){
          
          var origin = new google.maps.LatLng(user_latitude,user_longitude);
          var destination = new google.maps.LatLng(lat,long);

          console.log(lat+" "+long);
          var request = {
              origin: origin,
              destination: destination,
              travelMode: 'DRIVING',

          };

          directionsService.route(request,function(result,status){
              
              if(status == "OK"){
                  console.log(result)
                  
                  displayRoute(result);   
                  displayDirections(result);
                  
                                      
              }
          })
      };

      //Calls needed method depending on the button of the popup that is clicked

      view.popup.on("trigger-action", function(event) {
        
          if (event.action.id === "show-image") {
              showImageActionFunction();
          }
          else if(event.action.id === "find-route"){
              
              var fieldLat = Math.round(view.center.latitude * 1000) / 1000;
              var fieldLong = Math.round(view.center.longitude * 1000) / 1000;
              findRoute(fieldLat,fieldLong);

              //Closes popup when route is found

              view.popup.close();
          }

      });
  });