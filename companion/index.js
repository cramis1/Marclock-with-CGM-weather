import * as messaging from "messaging";
//import { encode } from 'cbor';
import { settingsStorage } from "settings";
import { me } from "companion";
import { geolocation } from "geolocation";
import "fitbit-google-analytics/companion"


var latitude = 43.76;
var longtitude = -79.41;
var initialLocation = true;
var randKey = Math.floor((Math.random() * 10) + 1);
var API_KEY;
var nDelta;
var tempURL;
switch(randKey) {
  case 1:
    API_KEY = "8d1816692ae66048d1058d6235a7b3e8";
    break;
  case 2:
    API_KEY = "febb7b22b29883d74014982a3c2f56c1";
    break;
  case 3:
    API_KEY = "36461821ccd46bc9e0cd77253829b169";
    break;
  case 4:
    API_KEY = "fe5f92599d68e21ee8174d5f686719a2";
    break;
  case 5:
    API_KEY = "f16977ffd38c1a4728d7a3c0c8d14b75";
    break;
   case 6:
    API_KEY = "f53c9c7af3dba0d6f9b8d11d195575bd";
   break;
  case 7:
    API_KEY = "3b2ecaa29306a60d35e5f281fc1899bd";
    break;
  case 8:
    API_KEY = "aa3c90f1a13369e46d6a4c706c4c1b33";
    break;
  case 9:
    API_KEY = "d462bb6d9ab472a48bbc85e9462e9f07";
    break;
  case 10:
    API_KEY = "f01217a758763f6d7d139fc6b04a7328";
    break;
  default:
    API_KEY = "8d1816692ae66048d1058d6235a7b3e8";
}
console.log("API_KEY " + API_KEY)
var ENDPOINT = "https://api.openweathermap.org/data/2.5/weather?";
//Yahoo endpoint:
//https://query.yahooapis.com/v1/public/yql?q=select item from weather.forecast where woeid in (select woeid from geo.places(1) where text='(43.6,-79.4)') and u='c'&format=json
//var searchtext = "select item from weather.forecast where woeid in (select woeid from geo.places(1) where text='(" + latitude + "," + longtitude + ")')"
 // return fetch("https://query.yahooapis.com/v1/public/yql?q=" + searchtext + " and u='c'&format=json")



var DTS = {"weather": {
      "temperature" : 0,
      "icon" : 0}}
var BGError = false;
var timeSelect = false;

//--------------------------
//    Other Variables
//--------------------------


var bgDataUnits = "mg/dl";
var bgHighLevel = 0;
var bgLowLevel = 0;
//var bgTargetTop = 0;
//var bgTargetBottom = 0;
var bgTrend = "Flat";
var points = [220,220,220,220,220,220,220,220,220,220,220,220];
var pointsPop = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];
var currentTimestamp = Math.round(new Date().getTime()/1000);
var lastTimestamp = 0;
var latestDelta = 0;
var disableAlert;
var snoozeLength;
var weatherUnitF;
var dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
var dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
var settingsUrl = "http://127.0.0.1:17580/status.json";
var manualHighLow;
var BGUnitSelect;
var snoozeRemove;
var signalAlert;
var dataSource;
var presenceAlert;
var NightURL = "";

//----------------end other variables
if(getSettings( 'openKey' )) {
    API_KEY = getSettings('openKey');
    //console.log("manual high low: " + manualHighLow)
  } 

  if(getSettings( 'signalAlert' )) {
    signalAlert = getSettings('signalAlert');
    console.log("signalalert: " + signalAlert)
  } else {
    signalAlert = false;
  }

if(getSettings( 'snoozeRemove' )) {
    snoozeRemove = getSettings('snoozeRemove');
    //console.log("manual high low: " + manualHighLow)
  } else {
    snoozeRemove = false;
  }

if(getSettings( 'presenceAlert' )) {
    presenceAlert = getSettings('presenceAlert');
    //console.log("manual high low: " + manualHighLow)
  } else {
    presenceAlert = false;
  }


if(getSettings( 'timeSelect' )) {
    timeSelect = getSettings('timeSelect');
    //console.log("manual high low: " + manualHighLow)
  } else {
    timeSelect = false;
  }
 
if(getSettings('disableAlert')) {
    disableAlert = getSettings('disableAlert');
    console.log("disableAlert on settings change: " + disableAlert)
  } else {
    disableAlert = false;
  }
  
  if(getSettings('snoozeLength')){ //&& (getSettings('settingsSourceURL').name.includes('http'))) {
    snoozeLength = getSettings('snoozeLength');
  } else {
    snoozeLength = 15;
  }
  
  if(getSettings('selection')){ //&& (getSettings('settingsSourceURL').name.includes('http'))) {
    weatherUnitF = getSettings('selection');
    console.log("Chnage of unit on settings change: " + weatherUnitF)
  } else {
    weatherUnitF = false;
  }

if(getSettings('SourceSelect')){
dataSource = getSettings('SourceSelect').values[0].name;
}

if (dataSource === 'xdrip'){
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
} else if (dataSource === 'spike'){
  dataUrl = "http://127.0.0.1:1979/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:1979/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:1979/status.json";
} else if (dataSource === 'nightscout') {
 
  if(getSettings('NightSourceURL')){ //&& (getSettings('dataSourceURL').name.includes('http'))) {
    NightURL = getSettings('NightSourceURL').name;
    var lastChar = NightURL.substr(-1);
      if (lastChar !== '/') {       
        dataUrl = NightURL + "/api/v1/entries/sgv.json?count=12";
        dataUrlPop = NightURL + "/api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "/api/v1/status.json";
        tempURL = NightURL + "/api/v2/properties";
      } else{
        dataUrl = NightURL + "api/v1/entries/sgv.json?count=12";
        dataUrlPop = NightURL + "api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "api/v1/status.json";
        tempURL = NightURL + "/api/v2/properties";
      }
  } 
} else {
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
}
 /* if(getSettings('settingsSourceURL')){ //&& (getSettings('settingsSourceURL').name.includes('http'))) {
    settingsUrl = getSettings('settingsSourceURL').name;
  } else {
    settingsUrl = "http://127.0.0.1:17580/status.json";
  }
*/
if(getSettings( 'viewSettingSelect' )) {
    manualHighLow = getSettings('viewSettingSelect');
    //console.log("manual high low: " + manualHighLow)
  } else {
    manualHighLow = false;
  }

if (manualHighLow === true){
  console.log("manual high low: " + manualHighLow )
     if(getSettings( 'BGUnitSelect' )) {
        bgDataUnits = getSettings('BGUnitSelect').values[0].name;
        console.log("bg settings unit: " + bgDataUnits)
      } else {
        bgDataUnits = "mmol";
      }
    
     if (bgDataUnits === "mmol") {
      
       if(getSettings("highThresholdIn")){
         let bgHighLeveltemp = getSettings("highThresholdIn").name;  
         bgHighLevel =  Math.round(bgHighLeveltemp * 18.018);
         console.log("bg high level: " + bgHighLevel )
          } else {
            bgHighLevel = 164
          }
       
       if(getSettings("lowThresholdIn")){
           let bgLowLeveltemp = getSettings("lowThresholdIn").name;
         bgLowLevel = Math.round(bgLowLeveltemp * 18.018);
        console.log("bg low level: " + bgLowLevel )
          } else {
           bgLowLevel = 72
          }
      
      }  else{
    
        if(getSettings("highThresholdIn")){
            bgHighLevel = getSettings("highThresholdIn").name
          } else {
            bgHighLevel = 164
          }

          if(getSettings("lowThresholdIn")){
           bgLowLevel = getSettings("lowThresholdIn").name
          } else {
           bgLowLevel = 72
          }

      } 
    console.log("manual high: " + bgHighLevel + " low:" + bgLowLevel + " unit:" + bgDataUnits)
  }
//console.log("dataURL: " + dataUrl,
              //"   settingsURL: " + settingsUrl);
        


//----------------------------------------------------------
//
// Fetch location
//
//----------------------------------------------------------
if (initialLocation === true){
  initialLocation = false;
  getLocation();
  //setTimeout(settingsPoll(), 500);
  //setTimeout(queryBGD(), 1000);
}

function getLocation (){
    geolocation.getCurrentPosition(locationSuccess, locationError);
    
    function locationSuccess(position) {
    console.log("Latitude: " + position.coords.latitude + " Longitude: " + position.coords.longitude);
      latitude = Math.round((position.coords.latitude) * 100) / 100;
      longtitude = Math.round((position.coords.longitude) * 100) / 100;
      //console.log("Discovered lat and long: " + latitude + ", " + longtitude);
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
  //console.log("Companion fetching weather");
  //console.log("lat and long: " + latitude + ", " + longtitude);
  //searchtext = "select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='(" + latitude + "," + longtitude + ")')"
 //fetch("https://query.yahooapis.com/v1/public/yql?q=" + searchtext + " and u='c'&format=json")
  fetch(ENDPOINT + "lat=" + latitude + "&lon=" + longtitude + "&units=metric&APPID=" + API_KEY)
  .then(function (response) {
      response.json()
      .then(function(data) {
        // We just want the current temperature
        DTS.weather.temperature = data["main"]["temp"];
        DTS.weather.icon = data["weather"]["0"]["id"];
        
       //DTS.weather.temperature = data.query.results.channel.item.condition.temp;
       //DTS.weather.icon = data.query.results.channel.item.condition.code;
        
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
async function fetchBGD () {
  
  if (dataSource === 'nightscout') {
    fetch(tempURL,{
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
        "Content-Type": 'application/json; charset=utf-8'
      })
    })
  .then(response => {
       response.text().then(data => {
          //console.log('properties ' + JSON.stringify(data));
          let tobj = JSON.parse(data);
          nDelta = tobj.delta.mgdl;
          BGError = false;
          console.log('properties ' + nDelta);
         // fetchBGD ();
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
  
  }
  //console.log("fetch BG- dataUrl:" + dataUrl)
  
//else {
//fetchBGD (); 
//}
  


return nDelta;
};

function queryBGD (stepCount, heartRate) {
  var dataUrlExtended = dataUrl;
  if (dataSource === 'xdrip')
  {
   if (stepCount > 0) {
    dataUrlExtended += '&steps=' + stepCount;
   }
   if (heartRate > 0) {
    dataUrlExtended += '&heart=' + heartRate;
   }
  }
  console.log("API call: " + dataUrlExtended);
  fetch(dataUrlExtended,{
    method: 'GET',
    mode: 'cors',
    headers: new Headers({
      "Content-Type": 'application/json; charset=utf-8'
    })
  })
.then(response => {
     response.text().then(data => {
        //console.log('fetched Data from API');
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
}

async function fetchBGDPop () {
  console.log("companion queryBGDPop")  
  //console.log("fetch BG- dataUrl:" + dataUrl)
  if (dataSource === 'nightscout') {
    fetch(tempURL,{
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
        "Content-Type": 'application/json; charset=utf-8'
      })
    })
  .then(response => {
       response.text().then(data => {
          //console.log('properties ' + JSON.stringify(data));
          let tobj = JSON.parse(data);
          nDelta = tobj.delta.mgdl;
          BGError = false;
          console.log('properties ' + nDelta);
          //fetchBGDPop();
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
  
  }
 // else {
   // fetchBGDPop();
 // }


 return nDelta;
};

function queryBGDPop () {
  fetch(dataUrlPop,{
    method: 'GET',
    mode: 'cors',
    headers: new Headers({
      "Content-Type": 'application/json; charset=utf-8'
    })
  })
.then(response => {
     response.text().then(data => {
        console.log('fetched Graph Data from API');
        //let obj = JSON.parse(data);
        let returnval = buildGraphDataPop(data);
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
}




async function buildGraphData(data) {
  
  let obj = JSON.parse(data);
  let graphpointindex = 0;
  var runningTimestamp = new Date().getTime();
  //var indexarray = [];

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
  if (dataSource === 'nightscout') {
    latestDelta = await fetchBGD();
  } else {
  latestDelta = obj[0].delta;}
  
  //let testiob = '12.36U(0.18|0.18) -1.07 13g'//'1.50U\/h 0.36U(0.18|0.18) -1.07 0g'
  let iob;
  let cob;
  if (obj[0].IOB || obj[0].COB){
  iob = obj[0].IOB;
  cob = obj[0].COB;
  
   } else  if (obj[0].aaps){
   //https://regex101.com/r/qFDNIG/4   
   const regex = /\b(\d+\.?\d+)U\(.+\s+(\d+)g/;
    const str = obj[0].aaps;
     //const str = `137.90U(0.18|0.18) -1.07 937g`;
    let m;

    if ((m = regex.exec(str)) !== null) {
    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
        console.log(`Found match, group ${groupIndex}: ${match}`);
    });
    }


    if (m){
     iob = m[1];
     cob = m[2];
    } 
    
  } else {
    iob = 0;
    cob = 0;
  }
  
  
  //var flippedPoints = points.reverse();
        lastTimestamp = obj[0].date;
        bgTrend = obj[0].direction;
      const messageContent = {"bgdata" : {
      "sgv": points, 
      "lastPollTime": lastTimestamp, 
      "currentTrend": bgTrend,
      "delta": latestDelta,
      "BGerror": BGError,
      "iob": iob,
      "cob": cob
    }
  };
  console.log("message content sent: " + JSON.stringify(messageContent));
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

async function buildGraphDataPop(data) {
  console.log("companion buildGraphDataPop") 
  let obj = JSON.parse(data);
  let graphpointindex = 0;
  var runningTimestamp = new Date().getTime();
  var indexarray = [];

  let index = 0;
  //let validTimeStamp = false;
//  console.log(JSON.stringify(obj));
  for (graphpointindex = 0; graphpointindex < 41; graphpointindex++) {
    if (index < 41) {
      while (((runningTimestamp - obj[index].date) >= 305000) && (graphpointindex < 41)) {
        pointsPop[graphpointindex] = undefined;
        runningTimestamp = runningTimestamp - 300000;
        graphpointindex++;
      }
      if(graphpointindex < 41) {
        pointsPop[graphpointindex] = obj[index].sgv;
       runningTimestamp = obj[index].date;
      }
        
    }
    index++
  }
  if (dataSource === 'nightscout') { 
    latestDelta = await fetchBGDPop();
  } else {
  latestDelta = obj[0].delta;}
  
  //let testiob = '12.36U(0.18|0.18) -1.07 13g'//'1.50U\/h 0.36U(0.18|0.18) -1.07 0g'
  let iob;
  let cob;
  if (obj[0].IOB || obj[0].COB){
  iob = obj[0].IOB;
  cob = obj[0].COB;
  
   } else  if (obj[0].aaps){
   //https://regex101.com/r/qFDNIG/4   
   const regex = /\b(\d+\.?\d+)U\(.+\s+(\d+)g/;
    const str = obj[0].aaps;
     //const str = `137.90U(0.18|0.18) -1.07 937g`;
    let m;

    if ((m = regex.exec(str)) !== null) {
    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
        console.log(`Found match, group ${groupIndex}: ${match}`);
    });
    }


    if (m){
     iob = m[1];
     cob = m[2];
    } 
    
  } else {
    iob = 0;
    cob = 0;
  }
  
  
  //var flippedPoints = points.reverse();
        lastTimestamp = obj[0].date;
        bgTrend = obj[0].direction;  
  
  
  const messageContent = {"bgdataPop" : {
      "sgv": pointsPop, 
      "lastPollTime": lastTimestamp, 
      "currentTrend": bgTrend,
      "delta": latestDelta,
      "BGerror": BGError,
      "iob": iob,
      "cob": cob
      }
  };
  console.log("message content sent: " + JSON.stringify(messageContent));
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

function settingsPoll (){
  console.log("manualHighLow " + manualHighLow)
  if (manualHighLow === true) {
    settingsPollManual();
  } else {
    settingsPollAPI();
  }
}

function settingsPollAPI () {
       
       //console.log('get settings - settingsUrl' + settingsUrl);
    
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
           // console.log("fetched settings from API");
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
  bgDataUnits = obj.settings.units;
 
  //bgTargetTop = obj.settings.thresholds.bgTargetTop;
  //bgTargetBottom = obj.settings.thresholds.bgTargetBottom;
  
  settingsStorage.setItem("unitsType", JSON.stringify(bgDataUnits));
  //console.log("bgDataUnits:" + bgDataUnits);
  const messageContent = {"settings": {
      "bgDataUnits" : bgDataUnits,
      "bgHighLevel" : bgHighLevel,
      "bgLowLevel" : bgLowLevel,
      "disableAlert": disableAlert,
      "snoozeLength": snoozeLength,
      "weatherUnitF": weatherUnitF,
      "snoozeRemove": snoozeRemove,
      "signalAlert": signalAlert
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


function settingsPollManual() {
 
  
  const messageContent = {"settings": {
      "bgDataUnits" : bgDataUnits,
      "bgHighLevel" : bgHighLevel,
      "bgLowLevel" : bgLowLevel,
      "disableAlert": disableAlert,
      "snoozeLength": snoozeLength,
      "weatherUnitF": weatherUnitF,
      "snoozeRemove": snoozeRemove,
      "presenceAlert": presenceAlert,
      "signalAlert": signalAlert
    },
  }; // end of messageContent
  console.log(JSON.stringify(messageContent));
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  } else {
    console.log("companion - no connection");
    //me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    //me.wakeInterval = undefined;
  }
  return true;
  
}


settingsStorage.onchange = function(evt) {
  
 if(getSettings( 'openKey' )) {
    API_KEY = getSettings('openKey');
    //console.log("manual high low: " + manualHighLow)
  } 

  if(getSettings( 'signalAlert' )) {
    signalAlert = getSettings('signalAlert');
    console.log("signalalert: " + signalAlert)
  } else {
    signalAlert = false;
  }

  
  if(getSettings( 'snoozeRemove' )) {
    snoozeRemove = getSettings('snoozeRemove');
    //console.log("manual high low: " + manualHighLow)
  } else {
    snoozeRemove = false;
  }
  
  if(getSettings( 'presenceAlert' )) {
    presenceAlert = getSettings('presenceAlert');
    //console.log("manual high low: " + manualHighLow)
  } else {
    presenceAlert = false;
  }

  
 if(getSettings('SourceSelect')){
dataSource = getSettings('SourceSelect').values[0].name;
}

if (dataSource === 'xdrip'){
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
} else if (dataSource === 'spike'){
  dataUrl = "http://127.0.0.1:1979/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:1979/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:1979/status.json";
} else if (dataSource === 'nightscout') {
 
  if(getSettings('NightSourceURL')){ //&& (getSettings('dataSourceURL').name.includes('http'))) {
    var NightURL = getSettings('NightSourceURL').name;
    var lastChar = NightURL.substr(-1);
      if (lastChar !== '/') {       
        dataUrl = NightURL + "/api/v1/entries/sgv.json?count=12";
        dataUrlPop = NightURL + "/api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "/api/v1/status.json";
      } else{
        dataUrl = NightURL + "api/v1/entries/sgv.json?count=12";
        dataUrlPop = NightURL + "api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "api/v1/status.json";
      }
  } 
} else {
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
}
  
  
  if(getSettings('disableAlert')) {
    disableAlert = getSettings('disableAlert');
    console.log("disableAlert on settings change: " + disableAlert)
  } else {
    disableAlert = false;
  }
  
  if(getSettings('snoozeLength')){ //&& (getSettings('settingsSourceURL').name.includes('http'))) {
    snoozeLength = getSettings('snoozeLength');
  } else {
    snoozeLength = 15;
  }
  
 if(getSettings('selection')){ //&& (getSettings('settingsSourceURL').name.includes('http'))) {
    weatherUnitF = getSettings('selection');
    console.log("Chnage of unit: " + weatherUnitF)
  } else {
    weatherUnitF = false;
  }
  
 if(getSettings( 'viewSettingSelect' )) {
    manualHighLow = getSettings('viewSettingSelect');
    //console.log("manual high low: " + manualHighLow)
  } else {
    manualHighLow = false;
  }
  
  if (manualHighLow === true){
  console.log("manual high low: " + manualHighLow )
     if(getSettings( 'BGUnitSelect' )) {
        bgDataUnits = getSettings('BGUnitSelect').values[0].name;
        console.log("bg settings unit: " + bgDataUnits)
      } else {
        bgDataUnits = "mmol";
      }
    
     if (bgDataUnits === "mmol") {
      
       if(getSettings("highThresholdIn")){
         let bgHighLeveltemp = getSettings("highThresholdIn").name;  
         bgHighLevel =  Math.round(bgHighLeveltemp * 18.018);
         console.log("bg high level: " + bgHighLevel )
          } else {
            bgHighLevel = 164
          }
       
       if(getSettings("lowThresholdIn")){
           let bgLowLeveltemp = getSettings("lowThresholdIn").name;
         bgLowLevel = Math.round(bgLowLeveltemp * 18.018);
        console.log("bg low level: " + bgLowLevel )
          } else {
           bgLowLevel = 72
          }
      
      }  else{
    
        if(getSettings("highThresholdIn")){
            bgHighLevel = getSettings("highThresholdIn").name
          } else {
            bgHighLevel = 164
          }

          if(getSettings("lowThresholdIn")){
           bgLowLevel = getSettings("lowThresholdIn").name
          } else {
           bgLowLevel = 72
          }

      } 
    console.log("manual high: " + bgHighLevel + " low:" + bgLowLevel + " unit:" + bgDataUnits)
  }

  if(getSettings( 'timeSelect' )) {
    timeSelect = getSettings('timeSelect');
    //console.log("manual high low: " + manualHighLow)
  } else {
    timeSelect = false;
  }
  
  

settingsPoll();
//setTimeout(queryBGD(), 500);
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
// Snooze Messaging
//
//----------------------------------------------------------


function querySnooze1(){
  fetch("http://127.0.0.1:17580/sgv.json?tasker=osnooze")
   .then(function (response) {
      
      if (response.status !== 200) {
          console.log('Did not snooze fetch xdrip. Status Code: ' +
            response.status);
           
          return;
        }
    
        response.json()
      .then(function(data) {
        
       console.log("fetched xdrip snooze: " + JSON.stringify(data));   
      });
  });
}

function querySnooze2(){
  fetch("http://127.0.0.1:1979/spikesnooze?snoozeTime=" + snoozeLength)
   .then(function (response) {
       if (response.status !== 200) {
          console.log('Did not snooze fetch spike. Status Code: ' +
            response.status);

          return;
        }
    
        response.json()
      .then(function(data) {
        
       console.log("fetched spike snooze: " + JSON.stringify(data));
   
      });
  });
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
   if (evt.data.hasOwnProperty("Steps") &&
       evt.data.hasOwnProperty("HeartRate")) {
    queryBGD(evt.data.Steps, evt.data.HeartRate)
   } else {
    queryBGD(0, 0);
   }
  }
  if (evt.data.RequestType === "DataPop" ) {
   console.log("companion received DataPop") 
    queryBGDPop();
  }
  if (evt.data.RequestType === "Weather" ) {
   queryOW();
  }
  if (evt.data.RequestType === "Snooze" ) {
  
    if (dataUrl.includes("17580")){
      querySnooze1();
        }
    if (dataUrl.includes("1979")){
      querySnooze2();
    }
  
  }
} 
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}
