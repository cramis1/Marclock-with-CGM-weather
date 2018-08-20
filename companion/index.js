import * as messaging from "messaging";
import { encode } from 'cbor';
import { settingsStorage } from "settings";
import { me } from "companion";
import { geolocation } from "geolocation";


var latitude = 43.76;
var longtitude = -79.41;
var initialLocation = true;
var API_KEY = "8d1816692ae66048d1058d6235a7b3e8";
var ENDPOINT = "https://api.openweathermap.org/data/2.5/weather?";
var DTS = {"weather": {
      "temperature" : 0,
      "icon" : 0}}
var BGError = false;

//--------------------------
//    Other Variables
//--------------------------


var bgDataUnits = "mg/dl";
var bgHighLevel = 0;
var bgLowLevel = 0;
var bgTargetTop = 0;
var bgTargetBottom = 0;
var bgTrend = "Flat";
var points = [220,220,220,220,220,220,220,220,220,220,220,220];
var currentTimestamp = Math.round(new Date().getTime()/1000);
var lastTimestamp = 0;
var latestDelta = 0;
var dataUrl;
var settingsUrl;
var disableAlert = false;
var dataUrl = "http://127.0.0.1:17580/sgv.json?count=12"

var settingsUrl = "http://127.0.0.1:17580/status.json";

//----------------end other variables


//----------------------------------------------------------
//
// Fetch location
//
//----------------------------------------------------------
if (initialLocation === true){
  initialLocation = false;
  getLocation();
}

function getLocation (){
    geolocation.getCurrentPosition(locationSuccess, locationError);
    
    function locationSuccess(position) {
    console.log("Latitude: " + position.coords.latitude + " Longitude: " + position.coords.longitude);
      latitude = Math.round((position.coords.latitude) * 100) / 100;
      longtitude = Math.round((position.coords.longitude) * 100) / 100;
      console.log("Discovered lat and long: " + latitude + ", " + longtitude);
    }

    function locationError(error) {
      console.log("Error: " + error.code,
              "Message: " + error.message);
        }
}

setInterval(getLocation, 900000);

//----------------------------------------------------------
//
// Fetch the weather from OpenWeather
//
//----------------------------------------------------------
function queryOW() {
  console.log("Companion fetching weather");
  console.log("lat and long: " + latitude + ", " + longtitude);
  fetch(ENDPOINT + "lat=" + latitude + "&lon=" + longtitude + "&units=metric&APPID=" + API_KEY)
  .then(function (response) {
      response.json()
      .then(function(data) {
        // We just want the current temperature
        DTS.weather.temperature = data["main"]["temp"];
        DTS.weather.icon = data["weather"]["0"]["id"];
        
        // Send the weather data to the device
        
        console.log(JSON.stringify(DTS));
              if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
                messaging.peerSocket.send(DTS);
              } else {
                console.log("companion - no connection");
                me.wakeInterval = 2000;
                setTimeout(function(){messaging.peerSocket.send(DTS);}, 2500);
                me.wakeInterval = undefined;
              }
           
      });
  })
  .catch(function (err) {
    console.log("Error fetching weather: " + err);
    
  });
}


//----------------------------------------------------------
//
// Aquire BG
//
//----------------------------------------------------------
function queryBGD () {
  
  console.log("fetch BG- dataUrl:" + dataUrl)
  
  fetch(dataUrl,{
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
        "Content-Type": 'application/json; charset=utf-8'
      })
    })
  .then(response => {
       response.text().then(data => {
          console.log('fetched Data from API');
          //let obj = JSON.parse(data);
          let returnval = buildGraphData(data);
          BGError = false;
        })
        .catch(responseParsingError => {
          console.log("Response parsing error in data!");
          console.log(responseParsingError.name);
          console.log(responseParsingError.message);
          console.log(responseParsingError.toString());
          console.log(responseParsingError.stack);
          BGError = true;
        });
      }).catch(fetchError => {
        console.log("Fetch Error in data!");
        console.log(fetchError.name);
        console.log(fetchError.message);
        console.log(fetchError.toString());
        console.log(fetchError.stack);
        BGError = true;
})
  return true;
};

function buildGraphData(data) {
  
  let obj = JSON.parse(data);
  let graphpointindex = 0;
  var runningTimestamp = new Date().getTime();
  var indexarray = [];

  let index = 0;
  let validTimeStamp = false;
//  console.log(JSON.stringify(obj));
  for (graphpointindex = 0; graphpointindex < 12; graphpointindex++) {
    if (index < 12) {
      while (((runningTimestamp - obj[index].date) >= 305000) && (graphpointindex < 12)) {
        points[graphpointindex] = undefined;
        runningTimestamp = runningTimestamp - 300000;
        graphpointindex++;
      }
      if(graphpointindex < 12) {
        points[graphpointindex] = obj[index].sgv;
       runningTimestamp = obj[index].date;
      }
        if (!validTimeStamp) {
        lastTimestamp = obj[index].date;
        bgTrend = obj[index].direction;
        validTimeStamp = true;
      }
    }
    index++
  }
  lastTimestamp = parseInt(lastTimestamp/1000, 10);
  latestDelta = obj[0].delta;
  //var flippedPoints = points.reverse();
        lastTimestamp = obj[0].date;
        bgTrend = obj[0].direction;
      const messageContent = {"bgdata" : {
      "sgv": points, 
      "lastPollTime": lastTimestamp, 
      "currentTrend": bgTrend,
      "delta": latestDelta,
      "BGerror": BGError
    }
  };
  console.log(JSON.stringify(messageContent));
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  } else {
    console.log("companion - no connection");
    me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    me.wakeInterval = undefined;
  }
  return true;
}

//----------------------------------------------------------
//
// Aquire settings
//
//----------------------------------------------------------

function settingsPoll () {
       
       console.log('get settings - settingsUrl' + settingsUrl);
    
       fetch(settingsUrl, {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({
          "Content-Type": 'application/json; charset=utf-8',
        }),
      })
        .then(response => {
   //       console.log('Get Settings From Phone');
          response.text().then(statusreply => {
            console.log("fetched settings from API");
            let returnval = buildSettings(statusreply);
          })
            .catch(responseParsingError => {
              console.log('Response parsing error in settings!');
              console.log(responseParsingError.name);
              console.log(responseParsingError.message);
              console.log(responseParsingError.toString());
              console.log(responseParsingError.stack);
            });
        }).catch(fetchError => {
          console.log('Fetch error in settings!');
          console.log(fetchError.name);
          console.log(fetchError.message);
          console.log(fetchError.toString());
          console.log(fetchError.stack);
        });
   return true;
};

function buildSettings(settings) {
  // Need to setup High line, Low Line, Units.
  var obj = JSON.parse(settings);
  
  bgHighLevel = obj.settings.thresholds.bgHigh;
  bgLowLevel = obj.settings.thresholds.bgLow;
  bgTargetTop = obj.settings.thresholds.bgTargetTop;
  bgTargetBottom = obj.settings.thresholds.bgTargetBottom;
  bgDataUnits = obj.settings.units;
  settingsStorage.setItem("unitsType", JSON.stringify(bgDataUnits));
  
  const messageContent = {"settings": {
      "bgDataUnits" : bgDataUnits,
      "bgTargetTop" : bgTargetTop,
      "bgTargetBottom" : bgTargetBottom,
      "bgHighLevel" : bgHighLevel,
      "bgLowLevel" : bgLowLevel,
      "disableAlert": disableAlert
    },
  }; // end of messageContent
  console.log(JSON.stringify(messageContent));
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  } else {
    console.log("companion - no connection");
    me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    me.wakeInterval = undefined;
  }
  return true;
}

settingsStorage.onchange = function(evt) {
  
  if((getSettings('dataSourceURL').name)){ //&& (getSettings('dataSourceURL').name.includes('http'))) {
    dataUrl = getSettings('dataSourceURL').name + "?count=12";
  } else {
    dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
  }
  console.log("dataURL on settings change: " + dataURL);
  
  
  if(getSettings('settingsSourceURL').name){ //&& (getSettings('settingsSourceURL').name.includes('http'))) {
    settingsUrl = getSettings('settingsSourceURL').name;
  } else {
    settingsUrl = "http://127.0.0.1:17580/status.json";
  }
  console.log("settingsURL on settings change: " + settingsURL);
  
  
  if(settingsStorage.getItem( disableAlert )) {
    disableAlert = JSON.parse(settingsStorage.getItem( key ));
    console.log("disableAlert on settings change: " + disableAlert)
  } else {
    disableAlert = false;
  }
} 

function getSettings(key) {
  if(settingsStorage.getItem( key )) {
    return JSON.parse(settingsStorage.getItem( key ));
  } else {
    return undefined
  }
}

//----------------------------------------------------------
//
// Messaging
//
//----------------------------------------------------------
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data.hasOwnProperty("RequestType")) {
  if (evt.data.RequestType === "Settings" ) {
     settingsPoll();
  }
  if (evt.data.RequestType === "Data" ) {
   queryBGD();
  }
  if (evt.data.RequestType === "Weather" ) {
   queryOW();
  }
} 
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}
