console.log("Running interface...");

function formatInput(sentence) {
	word_list = tokenize(sentence);
	var input = new Array(word_cnt).fill(0);
	for (var w of word_list) {
		input[word_map[w]] = 1;
	}
	const inputTensor = tf.tensor2d(input, [1, word_cnt]);
	return inputTensor;
}

var myArr;
var alternative = ["I don't understand","Sorry, I didn't get you.","You don't make any sense... you doing okay?","I didn't catch what you said, but how is your day going?"]
//var quotes = ["Go do your homework","Theres never enough time to do all the nothing you want.","Playing the piano is easy. You just press the right keys at the right time."]
var nextResponse = "";
var affirmative = ["Whatever you say.","Ok, that sound like a great plan!","Cool beans."];
var numguess = false;

function getResponse(percents) {
	if (nextResponse != "") {
		temp = nextResponse;
		nextResponse = "";
		return temp;
	}
	var maxPos = 0;
	var maxVal = 0;
	for (var x in percents) {
		if (percents[x] > maxVal) {
			maxVal = percents[x];
			maxPos = x;
		}
	}
	console.log(maxVal);
	if (maxVal < 0.2) {
		return alternative[Math.floor(Math.random() * alternative.length)];
	}
	response_arr = myArr.intents[maxPos].responses;
	response = response_arr[Math.floor(Math.random() * response_arr.length)];
	if (response == "Sure, how?" || response == "Okay, what should I do?") {
		nextResponse = affirmative[Math.floor(Math.random() * affirmative.length)];
	} 
	if (response == "Guess a number: ") {
		numguess = true;
	}
	return response;
}

var fulltext = "";

var gameStart = false;
var randNum = -1;
var tries = 0;
function guess_game(input) {
	if (gameStart == false) {
		console.log("Game start!");
		gameStart = true;
		randNum = Math.floor(Math.random() * 100);
		tries = 0;
	}
	if (isNaN(input)) {
		//console.log("Please enter a number"); 
		fulltext += "Please enter a number\n";
		return;
	}
	tries++;
	if (input > randNum) {
		//console.log("Wrong! Guess a lower number");
		fulltext += "Wrong! Guess a lower number\n";
		if (tries >= 5) {
			//console.log("You are at "+tries+" tries. You're pretty bad at this aren't you?");
			fulltext += "You are at "+tries+" tries. You're pretty bad at this aren't you?\n";
		}
	}
	if (input < randNum) {
		//console.log("Wrong! Guess a higher number");
		fulltext += "Wrong! Guess a higher number\n";
		if (tries >= 5) {
			//console.log("You are at "+tries+" tries. C'mon. You can do better");
			fulltext += "You are at "+tries+" tries. C'mon. You can do better\n";
		}
	}
	if (input == randNum) {
		//console.log("Correct! It took you "+tries+" tries.");
		fulltext += "Correct! It took you "+tries+" tries.\n";
		gameStart = false;
		numguess = false;
	}
}


var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		myArr = JSON.parse(this.responseText);
	}
}
xmlhttp.open("GET", "https://jaehayi.com/chatbot/intents.json", true);
xmlhttp.send();


$(document).on("keypress", "input", function(e){
    if(e.which == 13){
        var inputVal = $(this).val();
		$(this).val("");
		fulltext += "You: "+inputVal+"\n";
		//console.log("You've entered: " + inputVal);
		if (numguess == true) {
			guess_game(inputVal);
		}
		else {
			var pred = model.predict(formatInput(inputVal)).dataSync();
			//console.log(getResponse(pred));
			fulltext += getResponse(pred)+"\n";
		}
		document.getElementById('dialogue').value = fulltext;
		document.getElementById("dialogue").scrollTop = document.getElementById("dialogue").scrollHeight;

	}
});

