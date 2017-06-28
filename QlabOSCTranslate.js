/*
QLAB OSC Translator
by Will Pickens
will@willpickens.com
08-17-2016

INSTRUCTIONS:
Install Node: https://nodejs.org/en/
Install Module Node-OSC: https://www.npmjs.com/package/node-osc

Install TouchOSC on Mobile Device

Run in the background on the QLab computer
set global variables below to match your QLab computer and Touch OSC

NOTES:

TOUCH OSC LABELS

**Current Cue Section**
/current/type/[number]/
/current/number/[number]/
/current/name/[number]/
/current/time/[number]/


**Selected Cue Selection**
/selected/type/
/selected/number/
/selected/name/

**Touch OSC last message sent**
/descript/label

*/

require("node-osc")
var osc = require('node-osc');

///////////////////////////NETWORK SECTION/////////////////////////
//global.appIP = "10.115.211.114"; //Match to touchOSC ip address
global.appIP = "192.168.0.3"; //Match to touchOSC ip address
//global.appIP = "10.10.3.148"; //Match to touchOSC ip address
global.appPort = 8000; //Match the touchOSC input port

global.qlabIP = "0.0.0.0"; //0.0.0.0 is localhost
global.qlabPort = 53000; //default is 53000

global.localIP = "0.0.0.0";  //0.0.0.0 is localhost
global.localPort = 7000; //Match the touchOSC output port
////////////////////////////////////////////////////////////////


global.currentCount = 8; //number of current cue slots in touchOSC +1 (0,1,2,3,4,etc...)

//heartbeatTime is the duration between requests on QLab of it's current setup
global.heartbeatTime = 1000; //time in milliseconds  1000 = 1 sec

global.arrayUniqueID = [];
global.arrayTime = [];
global.arrayDuration = [];


//listen from TouchOSC
var oscServer = new osc.Server(localPort, localIP); 
oscServer.on("message", function (msg, rinfo) { 

	console.log("-----------TOUCH OSC RECEIVED-------------------");
	console.log(Date());
	text = String(msg);
	
	console.log(text);
	
	var value = text.substring(0,text.length-2);
	var data = text.substring(text.length-1);
	console.log("value: " + value);
	console.log("Data: " + data);

//send to Qlab

var osc = require('node-osc');
var client = new osc.Client(qlabIP, qlabPort);


//client.send(text, function () { client.kill(); });
client.send(data, value,function(){ client.kill});	

//	send touchOSC info to QLab
	sendToQlab(value, data);

//	send description of action to TouchOSC	
	sendToApp("/descript/label", value);

//	get the selected cue information from QLab	
	getSelectedCueInfo();


});

//server listen to Qlab
var oscServer2 = new osc.Server(53001, '0.0.0.0'); 
oscServer2.on("message", function (msg, rinfo) { 

	console.log("-----------QLAB RECEIVED-------------------");
	console.log(Date());


	text = String(msg);
	
	var first =  text.indexOf(",");
	
	first++;

	var res = text.slice(first);

	res = "["+res+"]";

	//console.log(res);
	
	obj = JSON.parse(res);
	
	
	//console.log("-----------");
	
	for(var k = 0; k < obj.length; k++){
		console.log("======================");
		var workspaceID = obj[k].workspace_id;
		var address = obj[k].address;
		var data = obj[k].data;
		if (data == 'undefined'){
			data = 0;
		}
		//basic information
		
		console.log("workspace: "+ workspaceID);
		console.log("address: " + address);
		console.log("data: " + data);
		console.log("status: " + status);
		console.log("======================");
		
		//get Elapsed Time of UniqueID
		if(address.includes("actionElapsed")==true){
			
			var strEnd = address.length - 14;
      		var str_ID = address.slice(8,strEnd);
      		
      		//str_ID = uniqueID
      		
      		arrayTime[str_ID] = data;
      		//console.log("arrayTime: " + arrayTime[str_ID]);
      		
      		//console.log("/current/time/"+str_ID+"/", data);
      		//sendToApp("/current/time/"+str_ID+"/", data);
      			
		}
	
		//get duration of UniqueID
		if(address.includes("duration")==true){
			
			var strEnd = address.length - 9;
      		var str_ID = address.slice(8,strEnd);
      		
      		//str_ID = uniqueID
      		
      		arrayDuration[str_ID] = data;
          //console.log("arrayDuration: " + arrayDuration[str_ID]);
      		
      		//console.log("/current/time/"+str_ID+"/", data);
      		//sendToApp("/current/time/"+str_ID+"/", data);
      			
		}
	
		
	}
	
	
	
	var status = obj[0].status;
	var i = 0;
	
	
	//Selected Cue Data
	if (typeof data === 'string'){
		console.log(typeof data);
		
		if(address.includes("displayName")==true){
			sendToApp("/selected/name", data);
			console.log("Sent: " + "/selected/name/" + data);
		
		}
		if(address.includes("number")==true){
			sendToApp("/selected/number", data);
			console.log("Sent: " + "/selected/number/" + data);
			
		}
		if(address.includes("type")==true){
			sendToApp("/selected/type", data);
			console.log("Sent: " + "/selected/type/" + data);
		}
		
	}else{
		
		//console.log("data: " + typeof data + " is not a string");
		
		
		
		//Running or Paused Cues information
		
		//if(typeof data != 'undefined' && data != 'string'){
		if(address.includes("runningOrPausedCues")==true){
			//console.log("data length: " + data.length);
			while (i < data.length){
				console.log("----Current Cues-------");
				
				
				var uniqueID = data[i].uniqueID;
				var number = data[i].number;
				var name = data[i].name;
				var listName = data[i].listName;
				var type = data[i].type;;
				var colorName = data[i].colorName;
				var flagged = data[i].flagged;
				var armed = data[i].armed;
				var cues = data[i].cues;
				
				
				
				
				sendToQlabNoData("/cue_id/"+uniqueID+"/actionElapsed");
				sendToQlabNoData("/cue_id/"+uniqueID+"/duration");
		
				console.log("data id: " + i);
				console.log("uniqueID: " + uniqueID);
				console.log("number: " + number);
				//console.log("name: " + name);
				console.log("listname: " + listName);
				console.log("type: " + type);
				console.log("colorName: " + colorName);
				console.log("flagged: " + flagged);
				console.log("armed: " + armed);
				//console.log("cues: ");
				
				
				
				updateTouchOSC(i, type, number, listName, uniqueID);
				addToArray(i,uniqueID);
		
				i++;
				
				//RESET cells on TouchOSC that are not being used
			
				
			
				var resetNumber = currentCount - i;
				/*
				console.log("currentCount: " + currentCount);
				console.log("i: " + i);
				console.log("resetNumber: " + resetNumber);
				*/
				resetCurrentCueInfo(resetNumber);
			
			}
		
		//console.log("uniqueID: " + uniqueID);
			if(data.length == 0){
				
				resetCurrentCueInfo(currentCount);
				//console.log("-----RESET-----");
			}
			
		}
	
	
		}
	
	
	
	


});
//Sets heartbeat to listen for what is currently running
var heartbeat = setInterval(QlabHeartbeat, heartbeatTime);

function QlabHeartbeat(){
	sendToQlabNoData("/runningOrPausedCues");
	getSelectedCueInfo();
}


function addToArray(i,uniqueID){
	arrayUniqueID[i] = uniqueID;
	//console.log("arrayUniqueID: " + arrayUniqueID);
	
	var currentTime = arrayTime[uniqueID];
  var cueDuration = arrayDuration[uniqueID];

  //console.log (arrayDuration)
  //console.log (arrayTime)
	//console.log("current Elapsed Time: " + arrayTime[uniqueID]);
	if(typeof currentTime == "number"){
		//console.log("current Elapsed Time: " + currentTime.toFixed(0));
		currentTime = currentTime;
		console.log("Elapsed Time: " + seconds2time(currentTime.toFixed(0)));
		
		sendToApp("/current/time/"+i+"/", seconds2time(currentTime.toFixed(0)));
	}
	
	if((typeof cueDuration == "number") && (cueDuration !== 0)){
    //console.log("current cue duration: " + cueDuration.toFixed(0));
		cueDuration = cueDuration;
		console.log("Remaining Time: -" + seconds2time((cueDuration.toFixed(0) - currentTime.toFixed(0))));
		
    sendToApp("/current/remaining/"+i+"/", "-" + seconds2time((cueDuration.toFixed(0) - currentTime.toFixed(0))));
	}
	
}

function removeFromArray(lastRemain){
	var remainder = arrayUniqueID.length - lastRemain;
	arrayUniqueID.splice(lastRemain, remainder);


}

function pushFromArray(){

}

function updateTouchOSC(i, type, number, listName, uniqueID){

	sendToApp("/current/type/"+i+"/", type);
	sendToApp("/current/number/"+i+"/", number);
	sendToApp("/current/name/"+i+"/", listName);
	//sendToApp("/current/time/"+i+"/", uniqueID);

}

function sendToApp(value,data){

	var osc = require('node-osc');
	var client = new osc.Client(appIP, appPort);

	client.send(value, data, function () { client.kill(); });
}



function sendToQlab(value, data){
	var osc = require('node-osc');
	var client = new osc.Client(qlabIP, qlabPort);

	client.send(value, data, function () { client.kill(); });
	//client.send('/alwaysReply', 1, function () { client.kill(); });
	//console.log("sent");
}

function sendToQlabNoData(value){
	var osc = require('node-osc');
	var client = new osc.Client(qlabIP, qlabPort);

	client.send(value, function () { client.kill(); });
	//client.send('/alwaysReply', 1, function () { client.kill(); });
	//console.log("sent");
}

function getSelectedCueInfo(){
	/*
	data = "";
	sendToApp("/selected/name", data);
	sendToApp("/selected/number", data);
	sendToApp("/selected/type", data);
	*/

	sendToQlabNoData("/cue/selected/displayName");
	sendToQlabNoData("/cue/selected/number");
	sendToQlabNoData("/cue/selected/type");
	
	
	
}

function resetCurrentCueInfo(resetNumber){
	
	
	for(var count = 0; count <= resetNumber; count++){
		var remove = currentCount - count;
		
		/* 
		//DEBUG
		console.log("resetNumber: " + resetNumber);
		console.log("Count: " + count);
		console.log("Remove: " + remove);
		*/
			
		sendToApp("/current/type/"+remove+"/", "");
		sendToApp("/current/number/"+remove+"/", "");
		sendToApp("/current/name/"+remove+"/", "");
		sendToApp("/current/time/"+remove+"/", "");
		
	}
}


function seconds2time (seconds) {
	
    var h, m, s, result='';
    // HOURs
    h = Math.floor(seconds/3600);
    seconds -= h*3600;
    if(h){
        result = h<10 ? '0'+h+':' : h+':';
    }
    // MINUTEs
    m = Math.floor(seconds/60);
    seconds -= m*60;
    result += m<10 ? '0'+m+':' : m+':';
    // SECONDs
    s=seconds%60;
    result += s<10 ? '0'+s : s;
    return result;
    
    
}

/*
/cue/selected/displayName
/cue/selected/number
/cue/selected/fileTarget
/cue/selected/actionElapsed

/alwaysReply 1
*/

