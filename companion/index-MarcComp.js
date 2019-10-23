import * as messaging from "messaging";
//import { encode } from 'cbor';
import { settingsStorage } from "settings";
import { me } from "companion";
import { geolocation } from "geolocation";
import "fitbit-google-analytics/companion"
import asap from "fitbit-asap/companion"
asap.cancel()

me.wakeInterval = 8.5 * 1000 * 60;
if (me.launchReasons.wokenUp) {
  asap.cancel()
  if (manualHighLow === true) {
    settingsPollManual();
    fetchURLsMan();
  } else {
    fetchURLs();
  }
  console.log("Query due to wake interval!")
}

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
             "icon" : 0},
           "bgdata": {},
           "settings": {} };
    
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
var points = [220,220,220,220,220,220,220,220,220,220,220,220,null,null,null,null,null,null,null,null,null,null,null,null];
var pointsPop = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];
var currentTimestamp = Math.round(new Date().getTime()/1000);
var lastTimestamp = 0;
var latestDelta = 0;
var disableAlert;
var snoozeLength;
var weatherUnitF;
var dataUrl = "http://127.0.0.1:17580/sgv.json?count=41";
var dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
var settingsUrl = "http://127.0.0.1:17580/status.json";
var manualHighLow;
var BGUnitSelect;
var snoozeRemove;
var signalAlert;
var dataSource;
var presenceAlert;
var NightURL = "";
var dexSessionResponse;
var dexSessionData;

//----------------end other variables
if(getSettings( 'openKey' )) {
    API_KEY = getSettings('openKey');
    console.log("manual high low: " + manualHighLow)
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
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=41";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
} else if (dataSource === 'spike'){
  dataUrl = "http://127.0.0.1:1979/sgv.json?count=41";
  dataUrlPop = "http://127.0.0.1:1979/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:1979/status.json";
} else if (dataSource === 'nightscout') {
 
  if(getSettings('NightSourceURL')){ //&& (getSettings('dataSourceURL').name.includes('http'))) {
    NightURL = getSettings('NightSourceURL').name;
    var lastChar = NightURL.substr(-1);
      if (lastChar !== '/') {       
        dataUrl = NightURL + "/api/v1/entries/sgv.json?count=41";
        dataUrlPop = NightURL + "/api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "/api/v1/status.json";
        tempURL = NightURL + "/api/v2/properties";
      } else{
        dataUrl = NightURL + "api/v1/entries/sgv.json?count=41";
        dataUrlPop = NightURL + "api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "api/v1/status.json";
        tempURL = NightURL + "/api/v2/properties";
      }
  } 

} else if (dataSource === 'dexcom') {

  let dexcomUsername = null;
  if (settingsStorage.getItem('dexcomUsername')) {
    console.log(settingsStorage.getItem('dexcomUsername'))
    dexcomUsername = JSON.parse(settingsStorage.getItem('dexcomUsername')).name;
  } else if (!dexcomUsername) {
    dexcomUsername = null;
    settingsStorage.setItem("dexcomUsername", JSON.stringify({"name":dexcomUsername}));
  }
 
  let dexcomPassword = null;
  if (settingsStorage.getItem('dexcomPassword')) {
    console.log(settingsStorage.getItem('dexcomPassword'))
    dexcomPassword = JSON.parse(settingsStorage.getItem('dexcomPassword')).name;
  } else if (!dexcomPassword) {
    dexcomPassword = null;
    settingsStorage.setItem("dexcomPassword", JSON.stringify({"name":dexcomPassword}));
  }

  let USAVSInternational = null;
  if (settingsStorage.getItem('USAVSInternational')) {
    USAVSInternational = JSON.parse(settingsStorage.getItem('USAVSInternational'));
  } else if (!USAVSInternational) {
    USAVSInternational = false;
  } 

  let dexbody =  {
    accountName : dexcomUsername,
    applicationId :"d8665ade-9673-4e27-9ff6-92db4ce13d13",
    password : dexcomPassword
  }

  let subDomain = 'share2';
  if(USAVSInternational) {
      subDomain = 'shareous1';
  }
  
  
  fetch(`https://${subDomain}.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountByName`,{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify(dexbody)
  }).then(function(response) {
    //console.log(response)
    dexSessionResponse = response.text();
  }).then(function(data) {
    dexSessionData = data;
    console.log("dexSessionData:" + dexSessionData)
  })
  
  //dataUrl = `https://${subDomain}.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?sessionId=${dexSessionData}&minutes=1440&maxCount=41`;
  dataUrl = "https://${subDomain}.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?sessionId=b4e64424-8e01-452d-841a-39f0fb45b0c4&minutes=1440&maxCount=41" ;
} else {
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=41";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
}

if(getSettings( 'viewSettingSelect' )) {
    manualHighLow = getSettings('viewSettingSelect');
    //console.log("manual high low: " + manualHighLow)
  } else {
    manualHighLow = false;
  }

if (manualHighLow === true){
 //onsole.log("manual high low: " + manualHighLow )
     if(getSettings( 'BGUnitSelect' )) {
        bgDataUnits = getSettings('BGUnitSelect').values[0].name;
        //console.log("bg settings unit: " + bgDataUnits)
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
       // console.log("bg low level: " + bgLowLevel )
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
   // console.log("manual high: " + bgHighLevel + " low:" + bgLowLevel + " unit:" + bgDataUnits)
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
// Fetch Data
//
//----------------------------------------------------------

async function fetchURLs() {
  try {
    var [BGDdata, Settingsdata, Weatherdata] = await Promise.all([
   
      fetch(dataUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'post',
      }).then((response) => response.text()).catch(error => console.log(error.message)),
      fetch(settingsUrl).then((response) => response.text()).catch(error => console.log(error.message)),
      fetch(ENDPOINT + "lat=" + latitude + "&lon=" + longtitude + "&units=metric&APPID=" + API_KEY).then((response) => response.json()).catch(error => console.log(error.message))
    ]);


        DTS.weather.temperature = Weatherdata["main"]["temp"];
        DTS.weather.icon = Weatherdata["weather"]["0"]["id"];
        
        //console.log("BGdata: " + JSON.stringify(BGDdata));
        buildGraphData(BGDdata);
        
        buildSettings(Settingsdata);



  } catch (error) {
    console.log(error);
  }
  console.log("Data: " + JSON.stringify(DTS));
  asap.send(DTS);
}


async function fetchURLsMan() {
  try {
    
    var [BGDdata, Weatherdata] = await Promise.all([
   
      fetch(dataUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'post',
      }).then((response) => response.text()).catch(error => console.log(error.message)),
      fetch(ENDPOINT + "lat=" + latitude + "&lon=" + longtitude + "&units=metric&APPID=" + API_KEY).then((response) => response.json()).catch(error => console.log(error.message))
    ]);

        DTS.weather.temperature = Weatherdata["main"]["temp"];
        DTS.weather.icon = Weatherdata["weather"]["0"]["id"];

       // console.log("BGdata: " + JSON.stringify(BGDdata));
        buildGraphData(BGDdata);
        
        //buildSettings(Settingsdata);

  } catch (error) {
    console.log(error);
  }
  console.log("Data: " + JSON.stringify(DTS));
  asap.send(DTS);
}

//----------------------------------------------------------
//
// Aquire BG
//
//----------------------------------------------------------
function fetchBGD () {
  
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
  



return nDelta;
};




function buildGraphData(data) {
  
  let obj = JSON.parse(data);
  let graphpointindex = 0;
  var runningTimestamp = new Date().getTime();


  let index = 0;
  let validTimeStamp = false;

  if (dataSource === 'dexcom') {

    for (graphpointindex = 0; graphpointindex < 41; graphpointindex++) {
      //if (index < 41) {
       /* while (((runningTimestamp - obj[index].date) >= 305000) && (graphpointindex < 41)) {
          points[graphpointindex] = undefined;
          runningTimestamp = runningTimestamp - 300000;
          graphpointindex++;
        } */
       // if(graphpointindex < 41) {
          points[graphpointindex] = obj[graphpointindex].Value;
       // }
         /* if (!validTimeStamp) {
          lastTimestamp = obj[index].date;
          
          validTimeStamp = true;
        } */
     // }
     // index++
    }
    latestDelta = ((parseInt(points[0])) - (parseInt(points[1])));
    let tempTimestamp = obj[0].WT;
    lastTimestamp = tempTimestamp.replace(/.*\(|\).*/g, '');
    let tempTrend = obj[0].Trend;
   
    switch (tempTrend) {
      case 1:
        bgTrend = "DoubleUP";
        break;
     case 2:
        bgTrend = "SingleUp";
        break;
    case 3:
      bgTrend = "FortyFiveUp";
      break;
    case 4:
      bgTrend = "Even";
      break;
    case 5:
      bgTrend = "FortyFiveDown";
      break;
    case 6:
      bgTrend = "SingleDown";
      break;  
    case 7:
      bgTrend = "DoubleDown";
      break; 
     default:
        bgTrend = "Even";
    } 
 

  DTS.bgdata = {
  "sgv": points, 
  "lastPollTime": lastTimestamp, 
  "currentTrend": bgTrend,
  "delta": latestDelta,
  "BGerror": BGError
  };
 
console.log("DTS.bgdata: " + JSON.stringify(DTS.bgdata))

  } else {

  for (graphpointindex = 0; graphpointindex < 41; graphpointindex++) {
    if (index < 41) {
      while (((runningTimestamp - obj[index].date) >= 305000) && (graphpointindex < 41)) {
        points[graphpointindex] = undefined;
        runningTimestamp = runningTimestamp - 300000;
        graphpointindex++;
      }
      if(graphpointindex < 41) {
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
   latestDelta = fetchBGD();
 } else {
  latestDelta = obj[0].delta;
  }


  let iob;
  let cob;
  if (obj[0].IOB || obj[0].COB){
  iob = obj[0].IOB;
  cob = obj[0].COB;
  
   } else  if (obj[0].aaps){
  
   const regex = /\b(\d+\.?\d+)U\(.+\s+(\d+)g/;
    const str = obj[0].aaps;

    let m;

    if ((m = regex.exec(str)) !== null) {

    m.forEach((match, groupIndex) => {

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
      DTS.bgdata = {
      "sgv": points, 
      "lastPollTime": lastTimestamp, 
      "currentTrend": bgTrend,
      "delta": latestDelta,
      "BGerror": BGError,
      "iob": iob,
      "cob": cob
      };

  }

  return true;
}


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
  DTS.settings = {
      "bgDataUnits" : bgDataUnits,
      "bgHighLevel" : bgHighLevel,
      "bgLowLevel" : bgLowLevel,
      "disableAlert": disableAlert,
      "snoozeLength": snoozeLength,
      "weatherUnitF": weatherUnitF,
      "snoozeRemove": snoozeRemove,
      "signalAlert": signalAlert
    }; // end of messageContent

  return true;
}


function settingsPollManual() {
 
  
  DTS.settings = {
      "bgDataUnits" : bgDataUnits,
      "bgHighLevel" : bgHighLevel,
      "bgLowLevel" : bgLowLevel,
      "disableAlert": disableAlert,
      "snoozeLength": snoozeLength,
      "weatherUnitF": weatherUnitF,
      "snoozeRemove": snoozeRemove,
      "presenceAlert": presenceAlert,
      "signalAlert": signalAlert
    }; // end of messageContent


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
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=41";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
} else if (dataSource === 'spike'){
  dataUrl = "http://127.0.0.1:1979/sgv.json?count=41";
  dataUrlPop = "http://127.0.0.1:1979/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:1979/status.json";
} else if (dataSource === 'nightscout') {
 
  if(getSettings('NightSourceURL')){ //&& (getSettings('dataSourceURL').name.includes('http'))) {
    var NightURL = getSettings('NightSourceURL').name;
    var lastChar = NightURL.substr(-1);
      if (lastChar !== '/') {       
        dataUrl = NightURL + "/api/v1/entries/sgv.json?count=41";
        dataUrlPop = NightURL + "/api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "/api/v1/status.json";
      } else{
        dataUrl = NightURL + "api/v1/entries/sgv.json?count=41";
        dataUrlPop = NightURL + "api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "api/v1/status.json";
      }
  } 

} else if (dataSource === 'dexcom') {

  let dexcomUsername = null;
  if (settingsStorage.getItem('dexcomUsername')) {
    //console.log(settingsStorage.getItem('dexcomUsername'))
    dexcomUsername = JSON.parse(settingsStorage.getItem('dexcomUsername')).name;
  } else if (!dexcomUsername) {
    dexcomUsername = null;
    settingsStorage.setItem("dexcomUsername", JSON.stringify({"name":dexcomUsername}));
  }
 
  let dexcomPassword = null;
  if (settingsStorage.getItem('dexcomPassword')) {
    //console.log(settingsStorage.getItem('dexcomPassword'))
    dexcomPassword = JSON.parse(settingsStorage.getItem('dexcomPassword')).name;
  } else if (!dexcomPassword) {
    dexcomPassword = null;
    settingsStorage.setItem("dexcomPassword", JSON.stringify({"name":dexcomPassword}));
  }

  let USAVSInternational = null;
  if (settingsStorage.getItem('USAVSInternational')) {
    USAVSInternational = JSON.parse(settingsStorage.getItem('USAVSInternational'));
  } else if (!USAVSInternational) {
    USAVSInternational = false;
  } 

  let dexbody =  {
    accountName : dexcomUsername,
    applicationId :"d8665ade-9673-4e27-9ff6-92db4ce13d13",
    password : dexcomPassword
  }

  let subDomain = 'share2';
  if(USAVSInternational) {
      subDomain = 'shareous1';
  }
  
  
  fetch(`https://${subDomain}.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountByName`,{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify(dexbody)
  }).then(function(response) {
    //console.log(response)
    dexSessionResponse = response.text();
  }).then(function(data) {
    dexSessionData = data;
    console.log("dexSessionData:" + dexSessionData)
  })

  dataUrl = `https://${subDomain}.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?sessionId=${dexSessionData}&minutes=1440&maxCount=41`;

} else {
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=41";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
}
  
  
  if(getSettings('disableAlert')) {
    disableAlert = getSettings('disableAlert');
   // console.log("disableAlert on settings change: " + disableAlert)
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
    //console.log("Chnage of unit: " + weatherUnitF)
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
  //console.log("manual high low: " + manualHighLow )
     if(getSettings( 'BGUnitSelect' )) {
        bgDataUnits = getSettings('BGUnitSelect').values[0].name;
        //console.log("bg settings unit: " + bgDataUnits)
      } else {
        bgDataUnits = "mmol";
      }
    
     if (bgDataUnits === "mmol") {
      
       if(getSettings("highThresholdIn")){
         let bgHighLeveltemp = getSettings("highThresholdIn").name;  
         bgHighLevel =  Math.round(bgHighLeveltemp * 18.018);
        // console.log("bg high level: " + bgHighLevel )
          } else {
            bgHighLevel = 164
          }
       
       if(getSettings("lowThresholdIn")){
           let bgLowLeveltemp = getSettings("lowThresholdIn").name;
         bgLowLevel = Math.round(bgLowLeveltemp * 18.018);
       // console.log("bg low level: " + bgLowLevel )
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
    //console.log("manual high: " + bgHighLevel + " low:" + bgLowLevel + " unit:" + bgDataUnits)
  }

  if(getSettings( 'timeSelect' )) {
    timeSelect = getSettings('timeSelect');
    //console.log("manual high low: " + manualHighLow)
  } else {
    timeSelect = false;
  }
  
  asap.cancel()
  if (manualHighLow === true) {
    settingsPollManual();
    fetchURLsMan();
  } else {
    fetchURLs();
  }
//ParallelFlow();
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
asap.onmessage = message => {
  console.log("recieved message " + JSON.stringify(message));
 if (message.hasOwnProperty("RequestType")) {
    if (message.RequestType === "Data" ) {
      if (manualHighLow === true) {
        settingsPollManual();
        fetchURLsMan();
      } else {
        fetchURLs();
      }
    }

    if (message.RequestType === "Snooze" ) {
    
      if (dataUrl.includes("17580")){
        querySnooze1();
          }
      if (dataUrl.includes("1979")){
        querySnooze2();
      }
    
    }

  }

}


/*
let dexbody =  {
    "accountName" : '',
    "applicationId" :"d8665ade-9673-4e27-9ff6-92db4ce13d13",
    "password" : ''
  }

fetch(`https://share2.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountByName`,{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify(dexbody)
  }).then(function(response) {
    console.log(response)
    dexSessionResponse = response.text();
  }).then(function(data) {
    dexSessionData = data;
  alert(data)
  })


https://gist.github.com/StephenBlackWasAlreadyTaken/adb0525344bedade1e25

https://github.com/nightscout/share2nightscout-bridge/issues/15

b4e64424-8e01-452d-841a-39f0fb45b0c4

*/