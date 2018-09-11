var request = require('request');
var arraySort = require('array-sort');
var weekday = require('weekday');
const readline = require('readline');
const cTable = require('console.table');
var moment = require('moment-timezone');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



request('http://data.sfgov.org/resource/bbb8-hzi6.json', function (error, response, body) {

  var dataObject = JSON.parse(body);
  arraySort(dataObject, 'applicant'); // sort data alphabetically by food truck name
  displayResults(dataObject);

});



function deleteContents(outputList){
	outputList.splice(0, outputList.length);
	return outputList;
}



function checkIfOpen(dayOfWeek, currentDay, openTime, closeTime, currentHour){
	if(dayOfWeek == currentDay){
	  	
	  if(currentHour >= openTime && currentHour < closeTime){
	  	return true;			
	  }
	  else{
	  	return false;
	  }

	} 
	else {
		return false;
	}



}



function displayResults(dataObject){
	var currentDay = weekday();
	var date = new Date();
	var currentHour = moment.tz(date, "America/Los_Angeles").format('ha z');
	currentHour = currentHour.slice(0,2);
	
	var index = 0;
	var resultsPerPage = 0;
  	var outputList = [];

	for(i = 0; i < dataObject.length; i++){
  	
	  	if(resultsPerPage == 10) {
	  		index = i;
	  		break;
	  	}

	  	var name = dataObject[i].applicant;
	  	var permitLocation = dataObject[i].location;

	  	var dayOfWeek = dataObject[i].dayofweekstr;
	  	var openTime = dataObject[i].start24.substring(0,2);
	  	var closeTime = dataObject[i].end24.substring(0,2);

	  	var isOpen = checkIfOpen(dayOfWeek, currentDay, openTime, closeTime, currentHour);
	  	if(isOpen){
	  		outputList.push([name, permitLocation]);
	  		resultsPerPage++;
	  	}

  }
  console.table(['NAME', 'ADDRESS'], outputList);
  console.log("\n"); // added to improve readability of list
  
  outputList = deleteContents(outputList);
  resultsPerPage = 0;

  console.log("To see more results, enter Next. Otherwise, enter ctrl + c to end program.");
  	rl.on('line', function(line) {
	    switch(line.trim()) {
	        case 'Next':
	            for(i = index; i < dataObject.length; i++){
				  	if(resultsPerPage == 10) {
				  		index = i;
				  		break;
				  	}
				  	var name = dataObject[i].applicant;
				  	var permitLocation = dataObject[i].location;
				  	
				  	var dayOfWeek = dataObject[i].dayofweekstr;
				  	var openTime = dataObject[i].start24.substring(0,2);
				  	var closeTime = dataObject[i].end24.substring(0,2);

				  	var isOpen = checkIfOpen(dayOfWeek, currentDay, openTime, closeTime, currentHour);
				  	if(isOpen){
				  		outputList.push([name, permitLocation]);
				  		resultsPerPage++;
				  	}
	  			}
	  			console.table(['NAME', 'ADDRESS'], outputList);
	  			console.log("\n"); // added to improve readability of list
	  			if(resultsPerPage == 10){
	  				outputList = deleteContents(outputList);
	  				resultsPerPage = 0;
	  				break;
	  			}
	  			else {
	  				console.log("You have reached the end of the list of results! Have a great a day!");
            		process.exit(0);
	  			}

	        default:
	            console.log("To see more results, enter Next. Otherwise, enter ctrl + c to end program.");
	        break;
	    }
	    rl.prompt();
		}).on('close', function() {
		    console.log('Have a great day!');
		    process.exit(0);
	});

}



// to run locally, first install node and npm. then:
// $ npm install request && node FoodTruckFinder.js