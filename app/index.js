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
import { preferences } from "user-settings";

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
let vibrationInterval;

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
const myPopup = document.getElementById("popup");
const btnLeft = myPopup.getElementById("btnLeft");
const btnRight = myPopup.getElementById("btnRight");
const alertHeader = document.getElementById("alertHeader");
let iobcob = document.getElementById("iob");
const disableIcon = document.getElementById("disableIcon");
const muteIcon = document.getElementById("muteIcon");
const snoozeIcon = document.getElementById("snoozeIcon");

let prefBgUnits;
let prefHighLevel;
let prefLowLevel;
let points; 
let trend;
let latestDelta = 0;
let lastPollTime = Date.now();
let weatherCount = 7;
let settingsCount = 4;
let disableAlert = false;
let snoozeLength = 15;
let weatherUnitF = "celsius";
let tempRead;
let Heartratecheck;
let previousMuteBG;
let recordedBG;
let reminderTimer = 0;
var snoozeRemove = false;
var muteIconOn = false;


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



initialCall();

function updateBGPollingStatus() {
 
      if (settingsCount === 6){   
          requestData("Settings");
          settingsCount = 0;
      } else {
          settingsCount++
        }
      
      if (weatherCount === 7){
        requestData("Weather");
        weatherCount = 0;
      } else {
        weatherCount++
      }
   
      requestData("Data");
} 

function requestData(DataType) {
  //console.log("Asking for a data update from companion.");
  var messageContent = {"RequestType" : DataType };
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(messageContent);
     // console.log("Sent request to companion.");
  } else {
      console.log("companion - no connection");
      //setTimeout(function(){messaging.peerSocket.send(messageContent);}, 5000);
  }
}

function refrshTimers(){
    clearInterval(mainTimer);
    
    weatherCount = 0;
    mainTimer = setInterval(updateBGPollingStatus, 120000);
    requestData("Data");
    setTimeout(requestData("Weather"), 15000);
}

function initialCall(){
    
  clearInterval(mainTimer);
    
    weatherCount = 0;
    settingsCount = 0;
    setTimeout(requestData("Settings"), 500);
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
 
  //console.log("The temperature is: " + Math.round(data.weather.temperature));
  
  if(isNaN(data.weather.temperature)){} else {
    if (weatherUnitF === "fahrenheit") {
    lblDist.text = Math.round( (((data.weather.temperature) * 9) / 5) + 32 ) + "°F";
    } else {
      lblDist.text = Math.round(data.weather.temperature) + "°C";
    }
    tempRead = data.weather.temperature;
    iconNumber = data.weather.icon;
  }
  
  //if (iconNumber > 800 && iconNumber < 806) {
  if ((iconNumber >= 19 && iconNumber <= 30) || (iconNumber == 44)) {
    icon.href = "icons/cloudy.png";
    //console.log("The icon is cloudy");
    
 // } else if (iconNumber > 599 && iconNumber < 625){
    } else if ((iconNumber >= 13 && iconNumber <= 18) || (iconNumber == 7) || (iconNumber == 41) || (iconNumber == 42) || (iconNumber == 43) || (iconNumber == 46)){
    icon.href = "icons/snow.png";    
  //  console.log("The icon is snow");
    
    } 
  //else if (iconNumber > 499 && iconNumber < 550){
  else if ((iconNumber >= 10 && iconNumber <= 12) || (iconNumber >= 5 && iconNumber <= 6) || (iconNumber == 35) || (iconNumber == 40)){  
  icon.href = "icons/rain.png";
 //   console.log("The icon is rain");
    
    }
  //else if (iconNumber > 299 && iconNumber < 350){
    else if ((iconNumber >= 8 && iconNumber <= 9)  ){  
  icon.href = "icons/drizzle.png";    
   //console.log("The icon is drizzle");
    
    }
  //else if (iconNumber > 199 && iconNumber < 250){
    else if ((iconNumber >= 0 && iconNumber <= 4) || (iconNumber >= 37 && iconNumber <= 39) || (iconNumber == 45) || (iconNumber == 47) ){ 
  icon.href = "icons/thunder.png";   
   // console.log("The icon is thunder");
    
    }
  else {
    icon.href = "icons/sunny.png";
   // console.log("The icon is sunny");
    
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
      snoozeLength = data.settings.snoozeLength;
      weatherUnitF = data.settings.weatherUnitF;
      snoozeRemove = data.settings.snoozeRemove;

  
  if (weatherUnitF === "fahrenheit") {
    lblDist.text = Math.round( (((tempRead) * 9) / 5) + 32 ) + "°F";
    } else {
      lblDist.text = Math.round(tempRead) + "°C";
    }
 
  if (disableAlert === true){
    disableIcon.style.display = "inline";
  } else {
    disableIcon.style.display = "none";
  }

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
 // console.log("bg data is: " + data + " prefBGunits is: " + prefBgUnits);
  
  
   recordedBG = data;
   
     // console.log("latestDelta:" + latestDelta);
     // console.log("recordedBG:" + recordedBG);
     // console.log("Trend:" + trend);
      
      
        if(prefBgUnits === 'mmol') { 
            if (latestDelta > 0) {
            deltaDisplay.text = "+" + (Math.round(mmol(latestDelta)*100))/100 + " mmol";
            } else{
            deltaDisplay.text = (Math.round(mmol(latestDelta)*100))/100 + " mmol";
            }
            
          
            bgDisplay.text = (mmol(recordedBG)).toFixed(1);
          
        
        } else{
            if (latestDelta > 0) {
              deltaDisplay.text = "+" + (Math.round(latestDelta)) + " mg/dl";
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
      
  setArrowDirection(trend);
}
  
  
// Event occurs when new file(s) are received
function processBgs(data) {
      points = data.bgdata.sgv;
      trend = data.bgdata.currentTrend;
      lastPollTime = data.bgdata.lastPollTime;
      latestDelta = data.bgdata.delta; 
      BGErrorGray1 = data.bgdata.BGerror;
      
      
      let iob = parseFloat(data.bgdata.iob);
      let cob = parseFloat(data.bgdata.cob);
      let iobtemp;
      let cobtemp;
      if ((iob > 0) || (cob > 0)){
          iobcob.style.display = "inline";
          if(isNaN(iob)) {
            iobtemp = "--";
          } else {
            iobtemp = iob.toFixed(1);
          }
           if(isNaN(cob)) {
            cobtemp = "-";
          } else {
            cobtemp = cob.toFixed(0);
          }
          iobcob.text = " - " + iobtemp + "i/" + cobtemp + "c";
          //console.log(iobcob.text)
          let minutesWidth = minutesSinceQuery.getBBox().width;
          iobcob.x = (minutesWidth) + (minutesSinceQuery.x) + 10;
      } else {
        iobcob.style.display = "none";
      }
      
  let currentBG = points[0];
     // console.log("currentBG: " + currentBG);
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
      
  
     
      
     // console.log(currentBG + typeof currentBG);
      //   console.log('reminder timer left: ' + (reminderTimer - Math.round(Date.now()/1000)))
  //
 
        
    
    console.log((reminderTimer - Math.round(Date.now()/1000)) )
  //alerts
        if( (currentBG >= prefHighLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
         
          if(!disableAlert) {
            
             if((previousMuteBG - currentBG) > 35){
              //  console.log('BG REALLY HIGH') ;
                    reminderTimer = (Math.round(Date.now()/1000)) - 10;
                   if(prefBgUnits === 'mmol') {
                      startAlertProcess("nudge-max", ((Math.round(mmol(currentBG)*10))/10));
                    } else {
                      startAlertProcess("nudge-max", currentBG);
                    }
                } 
             else {
               // console.log('BG HIGH') ;
                    if(prefBgUnits === 'mmol') {
                      startAlertProcess("nudge-max", ((Math.round(mmol(currentBG)*10))/10));
                    } else {
                      startAlertProcess("nudge-max", currentBG);
                    }
              } 
          }   
        } 
         
   
        if((currentBG <= 55) && ((reminderTimer) <= Math.round(Date.now()/1000))) {
                          
               // console.log('BG VERY LOW') ;
                  if(prefBgUnits === 'mmol') {
                  startAlertProcess("confirmation-max", ((Math.round(mmol(currentBG)*10))/10));
                   } else {
                  startAlertProcess("confirmation-max", currentBG);
                   } 
            
        } else if((currentBG <= prefLowLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
           
            if(!disableAlert) {  
                //  console.log('BG LOW') ;
                  if(prefBgUnits === 'mmol') {
                  startAlertProcess("nudge-max", ((Math.round(mmol(currentBG)*10))/10));
                   } else {
                  startAlertProcess("nudge-max", currentBG);
                   } 
           }
        }
    
    
    if (disableAlert === true){
    disableIcon.style.display = "inline";
  } else {
    disableIcon.style.display = "none";
  }
    
     
    if( ( (currentBG < prefHighLevel ) && (currentBG > prefLowLevel ) ) && (snoozeRemove === true) ) {
      reminderTimer = Math.round(Date.now()/1000);
      muteIcon.style.display = "none";
      snoozeIcon.style.display = "none";
      muteIconOn = false;
      console.log("Reset snooze/mute")
    } else if ((reminderTimer > Math.round(Date.now()/1000)) && muteIconOn === true) {    
        muteIcon.style.display = "inline";
        snoozeIcon.style.display = "none";
        console.log("muteIcon")
    } else if (reminderTimer > Math.round(Date.now()/1000)) {
          muteIcon.style.display = "none";
          snoozeIcon.style.display = "inline";
           console.log("snoozeIcon")
    } else {
         muteIcon.style.display = "none";
         snoozeIcon.style.display = "none";
         muteIconOn = false;
         console.log("noIcon")
     }
    
    
    
  }
      // graph text axis
     // console.log("prefhighlevel: " + prefHighLevel + "preflowlevel: " + prefLowLevel);
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
          
          if (prefHighLevel && prefLowLevel) {
          myGraph.setHighLow(prefHighLevel, prefLowLevel);
          if ((80 - (80 * (Math.round( ( (prefHighLevel - 36) / (250 - 36) )*100 )/100))) < 0){
              high.y = 0;
              } else{
               high.y = (80 - (80 * (Math.round( ( (prefHighLevel - 36) / (250 - 36) )*100 )/100)));
            }
          low.y = (80 - (80 * (Math.round( ( (prefLowLevel - 36) / (250 - 36) )*100 )/100)));
          } else {
            requestData("Settings");
          }
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
  vibration.start(type);
 // console.log('vibration')
  vibrationInterval = setTimeout(function(){ startAlertProcess(type, message) }, 3000);
}



function stopVibration() {
  clearTimeout(vibrationInterval);
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
 // console.log('ALERT BG')
  //console.log(message); 
  alertHeader.text = message;
  myPopup.style.display = "inline";
 
}

btnLeft.onclick = function(evt) {
  //console.log("Mute");
  previousMuteBG = recordedBG;
  reminderTimer = (Math.round(Date.now()/1000) + 14400);
  myPopup.style.display = "none";
  muteIcon.style.display = "inline";
  snoozeIcon.style.display = "none";
  muteIconOn = true;
  stopVibration();
  requestData("Snooze");
  //refrshTimers();
}

btnRight.onclick = function(evt) {
  let snoozeInt = parseInt(snoozeLength,10);
 // console.log("Snooze length" + snoozeInt);
  if ((snoozeInt >= 1) && (snoozeInt <= 240) ){
  reminderTimer = (Math.round(Date.now()/1000) + (snoozeInt*60) );
 console.log("reminder timer" + (reminderTimer-(Date.now()/1000)) );
  } else {
  reminderTimer = (Math.round(Date.now()/1000) + 900 );
  //console.log("Snooze for 15 - default");
  }
 // console.log("Snooze");
  myPopup.style.display = "none";
  muteIcon.style.display = "none";
  snoozeIcon.style.display = "inline";
  muteIconOn = false;
  stopVibration();
  requestData("Snooze");
  //refrshTimers();
}

//----------------------------------------------------------
//
// Messaging
//
//----------------------------------------------------------

messaging.peerSocket.onopen = function() {
 // console.log("App Socket Open");
  initialCall();
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
  //console.log("JS memory: " + memory.js.used + "/" + memory.js.total+ "---peak:" + memory.js.peak);
  charge = battery.chargeLevel;
  const now = evt.date;
  const month = now.getMonth();
  const dayofMonth = now.getDate();
  //const day = now.getDay();
  const hours = now.getHours();
  const mins = util.zeroPad(now.getMinutes());
  var displayHours; 
  if (preferences.clockDisplay === "24h") {
    displayHours = hours;
  } else {
  displayHours = hours % 12 || 12;
  }
  const displayMonth = util.getDisplayMonth(month);
  
  
  leftArc.startAngle = -105 + (((210) - (2.1 * charge)) / 2);
  leftArc.sweepAngle = (2.1 * charge);

  lblActive.text = (today.local.activeMinutes) + "m";
  lblSteps.text = (today.local.steps);
  
  lblDate.text = `${displayMonth} ${dayofMonth}`;
  lblBatt.text = `${charge}%`;
  time.text = `${displayHours}:${mins}`;
  
    
  //arrow.style.visibility = "visible";
  //arrow.style.display = "inline";
  
  /*if ((lastPollTime + 300000) < Date.now() ) {
      clearInterval(mainTimer);
      mainTimer = setInterval(updateBGPollingStatus, 120000);
      updateBGPollingStatus();
    console.log("refetch from 5-min timeout")
      }*/
}

