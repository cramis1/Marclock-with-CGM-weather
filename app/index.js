import clock from "clock";
import document from "document";
//import { preferences } from "user-settings";
import { today } from "user-activity";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";
import * as util from "../common/utils";
import * as messaging from "messaging";
import { vibration } from "haptics";
import Graph from "graph.js"
import { memory } from "system";

// Update the clock every minute
clock.granularity = "minutes";

const leftArc = document.getElementById("leftArc");


//non bg variables
var charge;
const lblActive = document.getElementById("active");
const lblSteps = document.getElementById("steps");
const lblDist = document.getElementById("dist");
const lblHR = document.getElementById("hr");
const lblDate = document.getElementById("date");
const lblBatt = document.getElementById("battery");
const time = document.getElementById("time");
const icon = document.getElementById("weatherIMG");
let iconNumber = 800;
const hrm = new HeartRateSensor();
let BGErrorGray1 = false;
let BGErrorGray2 = false;
let BGErrorGray3 = false;
let BGRed = false;
let BGOrange = false;
let vibrationTimeout;

//bg variables
const high = document.getElementById("high");
const middle = document.getElementById("middle");
const low = document.getElementById("low");
const docGraph = document.getElementById("docGraph");
const myGraph = new Graph(docGraph);
const deltaDisplay = document.getElementById("delta");
const minutesSinceQuery = document.getElementById("minutes");
const bgDisplay = document.getElementById("bg");
const strikeLine = document.getElementById("strikeLine");

let prefBgUnits = "mmol";
let prefHighLevel = 164;
let prefLowLevel = 74;
let points; 
let trend;
let latestDelta = 0;
let lastPollTime = (Math.round(Date.now()/1000));
let weatherCount = 7;
let settingsCount = 4;
let disableAlert = false;
let Heartratecheck;
let previousMuteBG;
let recordedBG;
let reminderTimer = 0;

hrm.onreading = function (){
  lblHR.text = `${hrm.heartRate}`;
  Heartratecheck = hrm.heartRate;
}

hrm.start();


//----------------------------------------------------------
//
// Data requests
//
//----------------------------------------------------------

var mainTimer; //= setInterval(updateBGPollingStatus, 120000);
var weatherTimer;


initialCall();

function updateBGPollingStatus() {
 
      if (settingsCount === 4){   
          requestData("Settings");
          settingsCount = 0;
      } else {
          settingsCount++
        }
      
      if (weatherCount === 7){
        weatherTimer = setTimeout(requestData("Weather"), 30000);
        weatherCount = 0;
      } else {
        weatherCount++
      }
   
      requestData("Data");
} 

function requestData(DataType) {
  console.log("Asking for a data update from companion.");
  var messageContent = {"RequestType" : DataType };
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(messageContent);
      console.log("Sent request to companion.");
  } else {
      console.log("companion - no connection");
      //setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
  }
}

function refrshTimers(){
    clearInterval(mainTimer);
    clearTimeout(weatherTimer);
    weatherCount = 0;
    mainTimer = setInterval(updateBGPollingStatus, 120000);
    requestData("Data");
    setTimeout(requestData("Weather"), 15000);
}

function initialCall(){
    clearInterval(mainTimer);
    clearTimeout(weatherTimer);
    weatherCount = 0;
    settingsCount = 0;
    setTimeout(requestData("Settings"), 1500);
    setTimeout(requestData("Data"), 4000);
    setTimeout(requestData("Weather"), 8000);
  
    mainTimer = setInterval(updateBGPollingStatus, 120000);
}

//----------------------------------------------------------
//
// Weather processing
//
//----------------------------------------------------------
function processWeatherData(data) {
 
  console.log("The temperature is: " + Math.round(data.weather.temperature));
  
  if(isNaN(data.weather.temperature)){} else {
    lblDist.text = Math.round(data.weather.temperature) + "°C";
    iconNumber = data.weather.icon;
  }
  
  if (iconNumber > 800 && iconNumber < 806) {
    icon.href = "icons/cloudy.png";
    console.log("The icon is cloudy");
    
  } else if (iconNumber > 599 && iconNumber < 625){
    icon.href = "icons/snow.png";    
    console.log("The icon is snow");
    
    } 
  else if (iconNumber > 499 && iconNumber < 550){
    icon.href = "icons/rain.png";
    console.log("The icon is rain");
    
    }
  else if (iconNumber > 299 && iconNumber < 350){
    icon.href = "icons/drizzle.png";    
    console.log("The icon is drizzle");
    
    }
  else if (iconNumber > 199 && iconNumber < 250){
    icon.href = "icons/thunder.png";   
    console.log("The icon is thunder");
    
    }
  else {
    icon.href = "icons/sunny.png";
    console.log("The icon is sunny");
    
  }
}


//----------------------------------------------------------
//
// Settings processing
//
//----------------------------------------------------------

function updateSettings(data) {
      console.log("Whatsettings:" + JSON.stringify(data));
      prefBgUnits = data.settings.bgDataUnits;
      prefHighLevel = data.settings.bgHighLevel;
      prefLowLevel = data.settings.bgLowLevel;
      disableAlert = data.settings.disableAlert;
    }

//----------------------------------------------------------
//
// BG processing
//
//----------------------------------------------------------

function mmol( bg ) {
  let mmolBG2 = bg / 18.018018;
  return mmolBG2;
}

function processOneBg(data) {
  console.log("bg data is: " + data + " prefBGunits is: " + prefBgUnits);
  setArrowDirection(trend);
  
   recordedBG = data;
   
      console.log("latestDelta:" + latestDelta);
      console.log("recordedBG:" + recordedBG);
      console.log("Trend:" + trend);
      
      
        if(prefBgUnits === 'mmol') { 
            if (latestDelta > 0) {
            deltaDisplay.text = "+" + (Math.round(mmol(latestDelta)*100))/100 + " mmol";
            } else{
            deltaDisplay.text = (Math.round(mmol(latestDelta)*100))/100 + " mmol";
            }
            
          
            bgDisplay.text = (mmol(recordedBG)).toFixed(1);
          
        
        } else{
            if (latestDelta > 0) {
              deltaDisplay.text = "+" (Math.round(latestDelta)) + " mg/dl";
            } else {
              deltaDisplay.text = (Math.round(latestDelta)) + " mg/dl";
            }
            bgDisplay.text = recordedBG;
        }
      
        minutesSinceQuery.text = (Math.floor(((Date.now()/1000) - (lastPollTime/1000)) /60)) + " mins";    
      
        if ((Math.floor(((Date.now()/1000) - (lastPollTime/1000)) /60)) > 999){
            minutesSinceQuery.text = "N/A";
        }
      
      strikeLine.style.display = "none";  
      
  
}
  
  
// Event occurs when new file(s) are received
function processBgs(data) {
      points = data.bgdata.sgv;
      trend = data.bgdata.currentTrend;
      lastPollTime = data.bgdata.lastPollTime;
      latestDelta = data.bgdata.delta; 
      BGErrorGray1 = data.bgdata.BGerror;
  
      let currentBG = points[0];
      console.log("currentBG: " + currentBG);
       console.log("points:" + JSON.stringify(points));
      
      if(isNaN(currentBG) || BGErrorGray1 === true) {
        deltaDisplay.text = 'no data';
        setArrowDirection("Even");
        strikeLine.style.display = "inline";
        leftArc.style.fill = "#708090"; 
       
      } 
      else {
        strikeLine.style.display = "none";
        colorSet(currentBG); 
        processOneBg(currentBG);
      
  
     
      
      console.log(currentBG + typeof currentBG);
  
   
  //alerts
        if( (currentBG >= prefHighLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
         
          if(!disableAlert) { 
             if((previousMuteBG - currentBG) > 35){
                console.log('BG REALLY HIGH') ;
                    reminderTimer = (Math.round(Date.now()/1000)) - 10;
                   if(prefBgUnits === 'mmol') {
                      startAlertProcess("nudge-max", ((Math.round(mmol(currentBG)*10))/10));
                    } else {
                      startAlertProcess("nudge-max", currentBG);
                    }
                } 
             else {
                console.log('BG HIGH') ;
                    if(prefBgUnits === 'mmol') {
                      startAlertProcess("nudge-max", ((Math.round(mmol(currentBG)*10))/10));
                    } else {
                      startAlertProcess("nudge-max", currentBG);
                    }
              } 
          }   
        } 
         
   
        if((currentBG <= 55) && ((reminderTimer + 500) <= Math.round(Date.now()/1000))) {
                          
                console.log('BG VERY LOW') ;
                  if(prefBgUnits === 'mmol') {
                  startAlertProcess("confirmation-max", ((Math.round(mmol(currentBG)*10))/10));
                   } else {
                  startAlertProcess("confirmation-max", currentBG);
                   } 
            
        } else if((currentBG <= prefLowLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
           
            if(!disableAlert) {  
                  console.log('BG LOW') ;
                  if(prefBgUnits === 'mmol') {
                  startAlertProcess("nudge-max", ((Math.round(mmol(currentBG)*10))/10));
                   } else {
                  startAlertProcess("nudge-max", currentBG);
                   } 
           }
        }
  }
      // graph text axis
      console.log("prefhighlevel: " + prefHighLevel + "preflowlevel: " + prefLowLevel);
      if(prefBgUnits === 'mmol') {  
          let tempprefHighLevel =  (Math.round(mmol(prefHighLevel)*10))/10;
          let tempprefLowLevel = (Math.round(mmol(prefLowLevel)*10))/10;  
          high.text = tempprefHighLevel;
          //middle.text = Math.floor((tempprefHighLevel + tempprefLowLevel) *0.5);//Math.floor(ymin + ((ymax-ymin) *0.5));
          low.text = tempprefLowLevel;
      } else {
          high.text = prefHighLevel;
          //middle.text = Math.floor((prefHighLevel + prefLowLevel) *0.5);//Math.floor(ymin + ((ymax-ymin) *0.5));
          low.text = prefLowLevel;
      }
          
          //graph inputs
          myGraph.setYRange(36, 250);
          myGraph.setSize(135, 80);     
          myGraph.update(points);
          myGraph.setHighLow(prefHighLevel, prefLowLevel);
          if ((80 - (80 * (Math.round( ( (prefHighLevel - 36) / (250 - 36) )*100 )/100))) < 0){
              high.y = 0;
              } else{
               high.y = (80 - (80 * (Math.round( ( (prefHighLevel - 36) / (250 - 36) )*100 )/100)));
            }
          low.y = (80 - (80 * (Math.round( ( (prefLowLevel - 36) / (250 - 36) )*100 )/100)));
          
};

function colorSet(currentBG){
  //set the colors
      if ((currentBG < prefHighLevel) && (currentBG > prefLowLevel)){
        leftArc.style.fill = "greenyellow";
        bgDisplay.style.fill="white"; 
        BGErrorGray1 = false;
      } 
      if (currentBG <= prefLowLevel){
      leftArc.style.fill = "red";
      bgDisplay.style.fill="red";
      BGErrorGray1 = false;
      } 
      if (currentBG >= prefHighLevel){
       leftArc.style.fill = "#FFA500";
       bgDisplay.style.fill="#FFA500";
       BGErrorGray1 = false;
       
      } 

}

function setArrowDirection(delta) {
  let arrow = document.getElementById("arrow");
  let BGWidth = bgDisplay.getBBox().width;
  let BGstart = bgDisplay.x;
  let dWidth = deltaDisplay.getBBox().width;
  let dStart = deltaDisplay.x;
    arrow.style.visibility = "visible";
    arrow.style.display = "inline";
 
  if ((dWidth + dStart) > (BGstart + BGWidth)){
    arrow.x = dWidth + dStart + 3;
  } else {
  
  arrow.x = BGstart + BGWidth + 3;
  }
    
  if(delta === "FortyFiveUp" ) {
    arrow.href = "icons/up.png";

  }
  else if(delta === "SingleUp" ) {
   arrow.href = "icons/singleUp.png";

  }
  else if(delta === "DoubleUp" ) {
    arrow.href = "icons/doubleUp.png";
 
  }
  else if(delta === "FortyFiveDown" ) {
    arrow.href = "icons/down.png";

  }
  else if(delta === "SingleDown" ) {
   arrow.href = "icons/singleDown.png";

  }
  else if(delta === "DoubleDown") {
    arrow.href = "icons/doubleDown.png";
  } else if (delta === "Even") {
    arrow.href = "icons/even.png";
  } else {
    arrow.href = "icons/even.png"; 
  }
}


 


//----------------------------------------------------------
//
// Deals with Vibrations 
//
//----------------------------------------------------------
function startAlertProcess(type, message) {
  showAlert(message);
  startVibration(type);
  vibrationTimeout = setTimeout(function(){ startVibration(type); console.log("triggered vibe by setTimeout"); }, 3000);
}

function startVibration(type) {
  vibration.start(type);
}

function stopVibration() {
  clearTimeout(vibrationTimeout);
  vibration.stop();
}
//----------------------------------------------------------
//
// Alerts
//
//----------------------------------------------------------
let myPopup = document.getElementById("popup");
let btnLeft = myPopup.getElementById("btnLeft");
let btnRight = myPopup.getElementById("btnRight");
let alertHeader = document.getElementById("alertHeader");


function showAlert(message) {
  console.log('ALERT BG')
  console.log(message); 
  alertHeader.text = message;
  myPopup.style.display = "inline";
 
}

btnLeft.onclick = function(evt) {
  console.log("Mute");
  previousMuteBG = recordedBG;
  reminderTimer = (Math.round(Date.now()/1000) + 14400);
  myPopup.style.display = "none";
  stopVibration();
   refrshTimers();
}

btnRight.onclick = function(evt) {
  reminderTimer = (Math.round(Date.now()/1000) + 900);
  console.log("Snooze");
  myPopup.style.display = "none";
  stopVibration();
  refrshTimers();
}

//----------------------------------------------------------
//
// Messaging
//
//----------------------------------------------------------

messaging.peerSocket.onopen = function() {
  console.log("App Socket Open");
}

messaging.peerSocket.onerror = function(err) {
  console.log("Connection error: " + err.code + " - " + err.message);
}

messaging.peerSocket.onmessage = function(evt) {
  console.log(JSON.stringify(evt));
  if (evt.data.hasOwnProperty("settings")) {
    updateSettings(evt.data)
  } 
  if (evt.data.hasOwnProperty("bgdata")) {
    processBgs(evt.data);
  } 
  if (evt.data.hasOwnProperty("weather")) {
    processWeatherData(evt.data);
  }
}

//check for clicks on the device
var svgclass = document.getElementsByClassName("SVGobjects");
for (var i = 0; i < svgclass.length; i++) {
  svgclass[i].addEventListener('click', function(){
    console.log("refetch from click");
    refrshTimers()    
    });
}

//----------------------------------------------------------
//
// Clock
//
//----------------------------------------------------------

//update with clock tick
clock.ontick = (evt) => {
  console.log("JS memory: " + memory.js.used + "/" + memory.js.total+ "---peak:" + memory.js.peak);
  charge = battery.chargeLevel;
  const now = evt.date;
  const month = now.getMonth();
  const dayofMonth = now.getDate();
  //const day = now.getDay();
  const hours = now.getHours();
  const mins = util.zeroPad(now.getMinutes());
  const displayHours = hours % 12 || 12;
  const displayMonth = util.getDisplayMonth(month);
  
  
  leftArc.startAngle = -105 + (((210) - (2.1 * charge)) / 2);
  leftArc.sweepAngle = (2.1 * charge);

  lblActive.text = (today.local.activeMinutes) + "m";
  lblSteps.text = (today.local.steps);
  
  lblDate.text = `${displayMonth} ${dayofMonth}`;
  lblBatt.text = `${charge}%`;
  time.text = `${displayHours}:${mins}`;
  
  
}

