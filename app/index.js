import clock from "clock";
import document from "document";
//import { preferences } from "user-settings";
import { today } from "user-activity";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";
import * as util from "../common/utils";
import * as messaging from "messaging";
import { vibration } from "haptics";
import Graph from "./graph.js"
import GraphPop from "./graphPop.js"
import { memory } from "system";
import { preferences } from "user-settings";
import { BodyPresenceSensor } from "body-presence";
import { display } from "display";
import analytics from "fitbit-google-analytics/app"

analytics.configure({
  tracking_id: "UA-133644530-1"
})

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
const highPop = document.getElementById("highPop");
const midPop = document.getElementById("midPop");
const lowPop = document.getElementById("lowPop");
const topPop = document.getElementById("topPop");
//const bottomPop = document.getElementById("bottomPop");
const docGraph = document.getElementById("docGraph");
const docGraphPop = document.getElementById("docGraphPop");
const myGraph = new Graph(docGraph);
const myGraphPop = new GraphPop(docGraphPop);
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
const arrow = document.getElementById("arrow");
const GraphScreen= document.getElementById("GraphScreen");
const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const animateArc = document.getElementById("arcUse");
let tempMins = 0;


let prefBgUnits;
let prefHighLevel;
let prefLowLevel;
let points; 
let trend;
let latestDelta = 0;
let lastPollTime = Date.now();
let lastPopTime = 0;
let weatherCount = 7;
let settingsCount = 4;
let disableAlert = false;
let snoozeLength = 15;
let weatherUnitF = false;
let tempRead;
let heartRate;
let stepCount;
let previousMuteBG;
let recordedBG;
let reminderTimer = 0;
var snoozeRemove = false;
var signalAlert = false;
var muteIconOn = false;
let veryLowSnooze = false;
let snoozeOn = false;
let emergencyInterval;
let popHolder;
let currentBG;
let currentBGPop;
let graphTimeout;
var presenceAlert=false;
const signalTimeout;

hrm.onreading = function (){
  heartRate = hrm.heartRate;
  lblHR.text = `${heartRate}`;
}

hrm.start();


const bodyPresenceSensor = new BodyPresenceSensor();
bodyPresenceSensor.start();
let bodyPresent = true;
let bodyPresentTemp = true;
bodyPresenceSensor.onreading = () => {
  if (presenceAlert===true){ 
   bodyPresenceSensor.present ? bodyPresentTemp=true : bodyPresentTemp=false;
  } else {bodyPresentTemp=true}
 } 

import { charger } from "power";
let chargerConnect = false;
if (presenceAlert===true){
charger.connected ? chargerConnect=true : chargerConnect=false;
} else {chargerConnect=false}
 
if (chargerConnect===true || bodyPresentTemp===false ) {bodyPresent=false} else {bodyPresent=true};




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

      console.log('signalAlert: ' + signalAlert + '   !signaltimeout: ' + !signalTimeout)
  if ((signalAlert === true) && (!signalTimeout)  ) {
    signalTimeout = setTimeout(noSignal, 1800000);
    //signalTimeout = setTimeout(noSignal, 10000);
    console.log('set signal timeout')
  }
  
} 

function requestData(DataType) {
  
  
  //console.log("Asking for a data update from companion.");
  var messageContent = {"RequestType" : DataType,
                        "Steps"       : stepCount,
                        "HeartRate"   : heartRate };
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(messageContent);
     // console.log("Sent request to companion.");
  } else {
      console.log("companion - no connection");
      //setTimeout(function(){messaging.peerSocket.send(messageContent);}, 5000);
  }
}

/*function refrshTimers(){
    clearInterval(mainTimer);
    
    weatherCount = 0;
    mainTimer = setInterval(updateBGPollingStatus, 150000);
    requestData("Data");
    setTimeout(requestData("Weather"), 15000);
}*/

function initialCall(){
    
  clearInterval(mainTimer);
    
    weatherCount = 0;
    settingsCount = 0;
    setTimeout(requestData("Settings"), 500);
    setTimeout(requestData("Data"), 4000);
    setTimeout(requestData("Weather"), 8000);
  
    mainTimer = setInterval(updateBGPollingStatus, 150000);
}

//----------------------------------------------------------
//
// Weather processing
//
//----------------------------------------------------------
function processWeatherData(data) {
 
  //console.log("The temperature is: " + Math.round(data.weather.temperature));
  
  if(isNaN(data.weather.temperature)){} else {
    if (weatherUnitF === true) {
    lblDist.text = Math.round( (((data.weather.temperature) * 9) / 5) + 32 ) + "°F";
    } else {
      lblDist.text = Math.round(data.weather.temperature) + "°C";
    }
    tempRead = data.weather.temperature;
    iconNumber = data.weather.icon;
  }
  
  if (iconNumber > 800 && iconNumber < 806) {
  //if ((iconNumber >= 19 && iconNumber <= 30) || (iconNumber == 44)) {
    icon.href = "icons/cloudy.png";
    //console.log("The icon is cloudy");
    
 } else if (iconNumber > 599 && iconNumber < 625){
   // } else if ((iconNumber >= 13 && iconNumber <= 18) || (iconNumber == 7) || (iconNumber == 41) || (iconNumber == 42) || (iconNumber == 43) || (iconNumber == 46)){
    icon.href = "icons/snow.png";    
  //  console.log("The icon is snow");
    
    } 
  else if (iconNumber > 499 && iconNumber < 550){
  //else if ((iconNumber >= 10 && iconNumber <= 12) || (iconNumber >= 5 && iconNumber <= 6) || (iconNumber == 35) || (iconNumber == 40)){  
  icon.href = "icons/rain.png";
 //   console.log("The icon is rain");
    
    }
  else if (iconNumber > 299 && iconNumber < 350){
    //else if ((iconNumber >= 8 && iconNumber <= 9)  ){  
  icon.href = "icons/drizzle.png";    
   //console.log("The icon is drizzle");
    
    }
  else if (iconNumber > 199 && iconNumber < 250){
    //else if ((iconNumber >= 0 && iconNumber <= 4) || (iconNumber >= 37 && iconNumber <= 39) || (iconNumber == 45) || (iconNumber == 47) ){ 
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
      presenceAlert = data.settings.presenceAlert;
      signalAlert = data.settings.signalAlert;

  
  if (weatherUnitF === true) {
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
      
  currentBG = points[0];
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
      
        if (signalAlert === true) {
          clearTimeout(signalTimeout);
          signalTimeout = null;
          }
     minutesSinceQuery.text = (Math.floor(((Date.now()/1000) - (lastPollTime/1000)) /60)) + " mins";    
      
        if ((Math.floor(((Date.now()/1000) - (lastPollTime/1000)) /60)) > 999){
            minutesSinceQuery.text = "N/A";
        }
      
     // console.log(currentBG + typeof currentBG);
      //   console.log('reminder timer left: ' + (reminderTimer - Math.round(Date.now()/1000)))
  //
 
       veryLowSnooze = false; 
    
    console.log((reminderTimer - Math.round(Date.now()/1000)) )
  //alerts
        if( (currentBG >= prefHighLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
         
          display.poke();
          
          if((!disableAlert && snoozeOn===false) && bodyPresent===true && !(battery.charging===true)) {
            
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
         
   
        if((currentBG <= 45) && (((reminderTimer) <= Math.round(Date.now()/1000)) ) ) {
                    
          display.poke();
          
               // console.log('BG VERY LOW') ;
                  if(prefBgUnits === 'mmol') {
                    let tempalertstring = "VERY LOW: " + ((Math.round(mmol(currentBG)*10))/10);
                  startAlertProcess("confirmation-max", tempalertstring);
                   } else {
                    let tempalertstring = "VERY LOW: " + currentBG;
                    startAlertProcess("confirmation-max", tempalertstring);
                   } 
                  veryLowSnooze = true;        
    
        } else if((currentBG <= prefLowLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
           
          display.poke();
          
            if((!disableAlert && snoozeOn===false) && bodyPresent===true && !(battery.charging===true)) {  
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
      veryLowSnooze = false;
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

function processBgsPop(data) {
  console.log("processBGPop")    
  let pointsPop = data.bgdataPop.sgv;
  let headingNumPop;
          //myGraphPop.setYRange(36, 250);
  currentBGPop = pointsPop[0];
  if(prefBgUnits === 'mmol') {         
        topPop.text = "14"
        //bottomPop.text = "2"
        headingNumPop = (pointsPop[0] / 18.018018).toFixed(1);
  } else {
        topPop.text = "250"
        //bottomPop.text = "36"
        headingNumPop = pointsPop[0];
  }
  
  if (isNaN(headingNumPop)) {headingNumPop = "?"};
  
   if (prefHighLevel && prefLowLevel) {
      myGraphPop.setHighLow(prefHighLevel, prefLowLevel);
   } else{
    requestData("Settings");
    }
      let tempMidSend = Math.floor((parseInt(prefHighLevel) + parseInt(prefLowLevel)) / 2);
          myGraphPop.update(pointsPop, headingNumPop, tempMidSend);
          
   if(prefBgUnits === 'mmol') {  
          let tempprefHighLevel =  (Math.round(mmol(prefHighLevel)*10))/10;
          let tempprefLowLevel = (Math.round(mmol(prefLowLevel)*10))/10;  
          highPop.text = tempprefHighLevel;
          midPop.text = ((tempprefHighLevel + tempprefLowLevel) *0.5).toFixed(1);//Math.floor(ymin + ((ymax-ymin) *0.5));
          lowPop.text = tempprefLowLevel;
      } else {
          highPop.text = prefHighLevel;
          midPop.text = Math.floor((parseInt(prefHighLevel) + parseInt(prefLowLevel)) / 2);
          lowPop.text = prefLowLevel;
      }
  
        

  
  
         GraphScreen.style.display = "inline";
          console.log("Graph screen on")  
          display.poke();
         
  
  
  
  //Non graph BG functions
      trend = data.bgdataPop.currentTrend;
      lastPollTime = data.bgdataPop.lastPollTime;
      lastPopTime = lastPollTime;
      latestDelta = data.bgdataPop.delta; 
      BGErrorGray1 = data.bgdataPop.BGerror;
      

      let iob = parseFloat(data.bgdataPop.iob);
      let cob = parseFloat(data.bgdataPop.cob);
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

  
     // console.log("currentBG: " + currentBG);
       console.log("points:" + JSON.stringify(points));
      
  if(isNaN(currentBGPop) || BGErrorGray1 === true) {
        deltaDisplay.text = 'no data';
        setArrowDirection("Even");
        strikeLine.style.display = "inline";
        leftArc.style.fill = "#708090"; 
        
       
      } 
  else {
    if (signalAlert === true) {
      clearTimeout(signalTimeout);
      signalTimeout = null;
      }
        strikeLine.style.display = "none";
        colorSet(currentBGPop); 
        processOneBg(currentBGPop);
        
        minutesSinceQuery.text = (Math.floor(((Date.now()/1000) - (lastPopTime/1000)) /60)) + " mins";    
      
        if ((Math.floor(((Date.now()/1000) - (lastPopTime/1000)) /60)) > 999){
            minutesSinceQuery.text = "N/A";
        } else if ((Math.floor(((Date.now()/1000) - (lastPopTime/1000)) /60)) < 0){
            minutesSinceQuery.text = "0 mins";       
        }
     
      
     // console.log(currentBG + typeof currentBG);
      //   console.log('reminder timer left: ' + (reminderTimer - Math.round(Date.now()/1000)))
  //
 
       veryLowSnooze = false; 
    
    console.log((reminderTimer - Math.round(Date.now()/1000)) )
  //alerts
        if( (currentBGPop >= prefHighLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
         
          display.poke();
          
          if((!disableAlert && snoozeOn===false) && bodyPresent===true && !(battery.charging===true)) {
            
             if((previousMuteBG - currentBGPop) > 35){
              //  console.log('BG REALLY HIGH') ;
                    reminderTimer = (Math.round(Date.now()/1000)) - 10;
                   if(prefBgUnits === 'mmol') {
                      startAlertProcess("nudge-max", ((Math.round(mmol(currentBGPop)*10))/10));
                    } else {
                      startAlertProcess("nudge-max", currentBGPop);
                    }
                } 
             else {
               // console.log('BG HIGH') ;
                    if(prefBgUnits === 'mmol') {
                      startAlertProcess("nudge-max", ((Math.round(mmol(currentBGPop)*10))/10));
                    } else {
                      startAlertProcess("nudge-max", currentBGPop);
                    }
              } 
          }   
        } 
         
   
        if((currentBGPop <= 45) && (((reminderTimer) <= Math.round(Date.now()/1000)) ) ) {
                
          display.poke();
          
               // console.log('BG VERY LOW') ;
                  if(prefBgUnits === 'mmol') {
                    let tempalertstring = "VERY LOW: " + ((Math.round(mmol(currentBGPop)*10))/10);
                  startAlertProcess("confirmation-max", tempalertstring);
                   } else {
                    let tempalertstring = "VERY LOW: " + currentBGPop;
                    startAlertProcess("confirmation-max", tempalertstring);
                   } 
                  veryLowSnooze = true;        
    
        } else if((currentBGPop <= prefLowLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
           
          display.poke();
          
            if((!disableAlert && snoozeOn===false) && bodyPresent===true && !(battery.charging===true)) {  
                //  console.log('BG LOW') ;
                  if(prefBgUnits === 'mmol') {
                  startAlertProcess("nudge-max", ((Math.round(mmol(currentBGPop)*10))/10));
                   } else {
                  startAlertProcess("nudge-max", currentBGPop);
                   } 
           }
        }
    
    
    if (disableAlert === true){
    disableIcon.style.display = "inline";
  } else {
    disableIcon.style.display = "none";
  }
    
     
    if( ( (currentBGPop < prefHighLevel ) && (currentBGPop > prefLowLevel ) ) && (snoozeRemove === true) ) {
      reminderTimer = Math.round(Date.now()/1000);
      muteIcon.style.display = "none";
      snoozeIcon.style.display = "none";
      muteIconOn = false;
      veryLowSnooze = false;
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
  
  popHolder = data;
};

function colorSet(currentBGcolor){
  //set the colors
      if ((currentBGcolor < prefHighLevel) && (currentBGcolor > prefLowLevel)){
        leftArc.style.fill = "greenyellow";
        bgDisplay.style.fill="white"; 
        BGErrorGray1 = false;
      } 
      if (currentBGcolor <= prefLowLevel){
      leftArc.style.fill = "red";
      bgDisplay.style.fill="red";
      BGErrorGray1 = false;
      } 
      if (currentBGcolor >= prefHighLevel){
       leftArc.style.fill = "#FFA500";
       bgDisplay.style.fill="#FFA500";
       BGErrorGray1 = false;
       
      } 

}

function setArrowDirection(delta) {
  
  let BGWidth = bgDisplay.getBBox().width;
  let BGstart = bgDisplay.x;
  let dWidth = deltaDisplay.getBBox().width;
  let dStart = deltaDisplay.x;
  let iobcobWidth = iobcob.getBBox().width;
  let iobcobStart = iobcob.x;
  
    arrow.style.visibility = "visible";
    arrow.style.display = "inline";
 
  //if( ((iobcobWidth + iobcobStart) > (BGstart + BGWidth)) && ((iobcobWidth + iobcobStart) > (dStart + dWidth)) ){
    // arrow.x = iobcobWidth + iobcobStart + 3;
  //} else 
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
  let messageDisplay = message;
  showAlert(messageDisplay);
  vibration.start(type);
 // console.log('vibration')
  emergencyInterval = setTimeout(function(){ messageDisplay = "DIABETIC CALL 911" }, 905000);
  vibrationInterval = setTimeout(function(){ startAlertProcess(type, messageDisplay) }, 3000);
  
}



function stopVibration() {
  clearTimeout(vibrationInterval);
  clearTimeout(emergencyInterval);
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
let myPopupSignal = document.getElementById("Signalpopup");
let SignalbtnRight = myPopupSignal.getElementById("SignalbtnRight");
let alertHeaderSignal = document.getElementById("alertHeaderSignal");
let SignalvibInt;

function noSignal() {
  alertHeaderSignal.text = "No Signal";
  myPopupSignal.style.display = "inline";
  vibration.start("nudge-max")
  console.log('no signal ON')
  SignalvibInt = setTimeout(noSignal, 3000);
}

SignalbtnRight.onclick = function(evt) {
  
  myPopupSignal.style.display = "none";
  clearTimeout(SignalvibInt);
  vibration.stop();
}

function showAlert(message) {
 // console.log('ALERT BG')
  //console.log(message); 
  alertHeader.text = message;
  myPopup.style.display = "inline";
  snoozeOn = true;
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
  if (veryLowSnooze === true) {
    reminderTimer = (Math.round(Date.now()/1000) + 300);
  }
  snoozeOn = false;
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
  if (veryLowSnooze === true) {
    reminderTimer = (Math.round(Date.now()/1000) + 300);
  }
  snoozeOn = false;
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
    
  analytics.send({
    hit_type: "event",
    event_category: "Display",
    event_action: "Blood Glucose Query",
    event_label: "Blood Glucose Query"
  })

    processBgs(evt.data);
  } 
  if (evt.data.hasOwnProperty("bgdataPop")) {
    
    processBgsPop(evt.data);
    animateArc.animate("disable");
  } 
  if (evt.data.hasOwnProperty("weather")) {
    processWeatherData(evt.data);
  }
}


//Buttons

button1.onclick = function() {
  console.log("bring up graph");
  animateArc.animate("enable");
    if (  ((Date.now() - lastPollTime) > 60000) || (currentBGPop != currentBG)  ) {
       requestData("DataPop");
    } else {
   
      processBgsPop(popHolder);
    }
graphTimeout = setTimeout(function(){ GraphScreen.style.display = "none" }, 60000);
}

button2.onclick = function () {
  console.log("close graph");
  GraphScreen.style.display = "none"; 
  clearTimeout(graphTimeout);
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

  lblActive.text = (today.local.activeMinutes); // + "m";
  stepCount = today.local.steps;
  lblSteps.text = (stepCount);

  lblDate.text = `${displayMonth} ${dayofMonth}`;
  lblBatt.text = `${charge}%`;
  time.text = `${displayHours}:${mins}`;
  
    const queryMins = (Math.floor(((Date.now()/1000) - (lastPollTime/1000)) /60));
    minutesSinceQuery.text = queryMins + " mins";    
      
        if (queryMins > 999){
            minutesSinceQuery.text = "N/A";
        }
  
  if ((queryMins >= 5)){
    console.log("refetch on 5 min timeout")
    //clearInterval(mainTimer);
    //mainTimer = setInterval(updateBGPollingStatus, 120000);
   // tempMins = queryMins;
    updateBGPollingStatus()

  }

 
    
  
  if (presenceAlert===true){
    charger.connected ? chargerConnect=true : chargerConnect=false;
    } else {chargerConnect=false}

  if (chargerConnect===true || bodyPresentTemp===false ) {bodyPresent=false} else {bodyPresent=true};
  


  
}

