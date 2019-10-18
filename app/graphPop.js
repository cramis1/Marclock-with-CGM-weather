import { me as device } from "device";

// Screen dimension fallback for older firmware
if (!device.screen) device.screen = { width: 348, height: 250 };

export default class GraphPop {
 
 constructor(id) {
 
   this._id = id;
   this._xscale = 0;
   
   this._xmin = 0;
   this._xmax = 0;
   this._ymin = 36;
   this._ymax = 250;
   this._yscale = (this._ymax-this._ymin)/80;
   this._pointsize = 2;   
   
   //this._bg = this._id.getElementById("bg");
      
   this._vals = this._id.getElementsByClassName("gval");
   
   this._tHigh = 164;
   this._tLow = 72;
   
   this._tHighLine = this._id.getElementById("tHighPop");
   this._tLowLine = this._id.getElementById("tLowPop");
   this._tMidLine = this._id.getElementById("tMidPop");
  this._thighNum = this._id.getElementById("highPop");
  this._tlowNum = this._id.getElementById("lowPop");
   this._tmidNum = this._id.getElementById("midPop");
   this._tHeading = this._id.getElementById("BGheading");
   this._tHighRect = this._id.getElementById("tRectHighPop");
   this._tLowRect = this._id.getElementById("tRectLowPop");
   this._defaultYmin = 36;
   this._defaultYmax = 370;
  // this._width = 300;
   this._height = parseInt(device.screen.height) - 25; //250;
 }
  
 setPosition(x,y){   
   this._id.x = x;
   this._id.y = y;
 }
  
 setHighLow(high,low){   
   this._tHigh = high;
   this._tLow = low;
   
   
  // this._thighNum.y = (this._height - (this._height * (Math.round( ( (this._tHigh - this._ymin) / (this._ymax - this._ymin) )*100 )/100)));
  // this._tlowNum.y = (this._height - (this._height * (Math.round( ( (this._tLow - this._ymin) / (this._ymax - this._ymin) )*100 )/100)));
 }
  
 setSize(w,h){
      
 } 
  
 setXRange(xmin, xmax){

  // this._xmin = xmin;
  // this._xmax = xmax;
  // this._xscale = (xmax-xmin)/this._width;
   //console.log("XSCALE: " + this._xscale);
   
 }
  
 setYRange(ymin, ymax){
   
   this._ymin = ymin;
   this._ymax = ymax;
   this._yscale = (ymax-ymin)/80;
   //console.log("YSCALE: " + this._yscale);
   
 } 

  getYmin(){
    return this._ymin;
  }
  
  getYmax(){
    return this._ymax;
  }
  
 setBGColor(c){
    this._bgcolor = c;
    this._bg.style.fill = c;
  }
 
  
  
  update(v, headingNum, midNumSend){
    console.log("v0" + v[0])
    this._tHeading.text = "~ " + headingNum + " ~";
    
    let midNumHeight = (this._height - (this._height * (Math.round( ( (midNumSend - this._ymin) / (this._ymax - this._ymin) )*100 )/100))) + 25;
    
   this._tHighLine.y1 = (this._height - (this._height * (Math.round( ( (this._tHigh - this._ymin) / (this._ymax - this._ymin) )*100 )/100))) + 25;
   this._tHighLine.y2 = (this._height - (this._height * (Math.round( ( (this._tHigh - this._ymin) / (this._ymax - this._ymin) )*100 )/100))) + 25;
   this._tLowLine.y1 = (this._height - (this._height * (Math.round( ( (this._tLow - this._ymin) / (this._ymax - this._ymin) )*100 )/100))) + 25;
   this._tLowLine.y2 = (this._height - (this._height * (Math.round( ( (this._tLow - this._ymin) / (this._ymax - this._ymin) )*100 )/100))) + 25;
   let tempHighNum = (this._height - (this._height * (Math.round( ( (this._tHigh - this._ymin) / (this._ymax - this._ymin) )*100 )/100))) + 25;
   this._thighNum.y = tempHighNum;
   let tempLowNum = (this._height - (this._height * (Math.round( ( (this._tLow - this._ymin) / (this._ymax - this._ymin) )*100 )/100))) + 25;
   this._tlowNum.y = tempLowNum;
   let tempMidNum = midNumHeight
   this._tmidNum.y = tempMidNum;
    this._tMidLine.y1 = tempMidNum;
    this._tMidLine.y2 = tempMidNum;
   this._tHighRect.height = tempHighNum - 25;
   this._tLowRect.y = tempLowNum;
    this._tLowRect.height = this._height - tempLowNum + 25;
    
    
    var flippedv = v.reverse(); 
    //console.log('flippedv: ' + flippedv)
    //var flippedv = v;
  console.log("Updating Graph:" + JSON.stringify(flippedv) + " into this many graph points:" + this._vals.length + " into length:" + flippedv.length);
   //console.log("height: " + this._height + " t_high:" + this._tHigh + " ymax:" + this._ymax + " ymin" + this._ymin) ;
   //console.log(" y1: " + (this._height - (this._height * (Math.round( ( (this._tHigh - this._ymin) / (this._ymax - this._ymin) )*100 )/100))));  
   
   
   //for (var index = 0; index < this._vals.length; index++) {
    for (var index = 0; index < 41; index++) {
    console.log('flippedvPop:' + index + ': ' + flippedv[index])
     
     //console.log("SGV" + index + ": " + flippedv[index]);
     //this._vals[index].cx = this._width - ((v[index].date-this._xmin) / this._xscale);
     
     if ((!flippedv[index]) || (isNaN(flippedv[index]))) {
     this._vals[index].style.fill = "#708090";
     this._vals[index].cy = (this._height - (this._height * (Math.round( ( (107 - this._ymin) / (this._ymax - this._ymin) )*100 )/100))) + 25;
     } else {
     
     this._vals[index].cy = (this._height - (this._height * (Math.round( ( (flippedv[index] - this._ymin) / (this._ymax - this._ymin) )*100 )/100))) + 25;
     //console.log("height" + index + ": " + this._vals[index].cy)
     if (this._vals[index].cy < 0){
         this._vals[index].cy = 0 + 25;
         }
       
     this._vals[index].style.fill = "white"; 
       
       if (flippedv[index] <= this._tLow) {
         this._vals[index].style.fill = "red";
       }
       else if (flippedv[index] >= this._tHigh) {
         this._vals[index].style.fill = "#FFA500";
       }
     }
   }
}
};
