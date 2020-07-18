console.log("Running interface...");

var word_cnt = 0;
var word_map = {};
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
var nextResponse = "";
var affirmative = ["Whatever you say.","Ok, that sound like a great plan!","Cool beans."];
var numguess = false;
var acceptReason = ["Ok, you convinced me.","Alright, I trust you.","Nah... I don't think I trust you yet","Okay, what will you do for me in return?","That's not a good reason","Alright, but only if you do something for me... what can you do for me?"]
var fairness = ["Alright that seems fair.","Okay, but how will you do that?","No, who would want that?"]

function getResponse(percents) {
	if (nextResponse != "") {
		temp = nextResponse;
		nextResponse = "";
		if (temp == "Okay, what will you do for me in return?" || temp == "Alright, but only if you do something for me... what can you do for me?") {
			nextResponse = fairness[Math.floor(Math.random() * fairness.length)]
		}
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
	if (maxVal < 0.25) {
		return alternative[Math.floor(Math.random() * alternative.length)];
	}
	response_arr = myArr.intents[maxPos].responses;
	response = response_arr[Math.floor(Math.random() * response_arr.length)];
	if (response == "Sure, how?" || response == "Okay, how in the world will I do that?") {
		nextResponse = affirmative[Math.floor(Math.random() * affirmative.length)];
	} 
	if (response == "Give me a good reason." || response == "Why should I do it?") {
		nextResponse = acceptReason[Math.floor(Math.random() * acceptReason.length)];
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
		for (var intent of myArr.intents) {
			for (var pattern of intent.patterns) {
				var word_arr = tokenize(pattern);
				//add to words
				for (var w of tokenize(pattern)) {
					if (!(w in word_map)) {
						word_map[w] = word_cnt;
						word_cnt++;
					}
				}
			}
		}
	}
}
xmlhttp.open("GET", "https://jaehayi.com/chatbot/intents.json", true);
xmlhttp.send();

var model;

(async () => {
	model = await tf.loadLayersModel('https://jaehayi.com/chatbot/my-model.json');
	console.log('Model loaded successfully.')
	//tfvis.show.modelSummary({name: 'Model Summary'}, model);
})();

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

