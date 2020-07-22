console.log("Running updated interface...");

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
var alternative = ["Sorry, I didn't get you... Hey, let's do something","You don't make any sense... Should we do something besides talking?","I didn't catch what you said, but how is your day going?"]
var nextResponse = "";
var affirmative = ["Whatever you say.","Ok, that sound like a great plan!","Cool beans."];

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
	if (maxVal < 0.25) {
		return alternative[Math.floor(Math.random() * alternative.length)];
	}
	response_arr = myArr.intents[maxPos].responses;
	response = response_arr[Math.floor(Math.random() * response_arr.length)];
	if (response == "Sure, how?" || response == "Ok. What should I bring?" || response == "How will I play?" || response == "What should I bring?" || response == "How will I get there?" || response == "What should we do there?") {
		nextResponse = affirmative[Math.floor(Math.random() * affirmative.length)];
	} 
	return response;
}

var fulltext = "";

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
		var pred = model.predict(formatInput(inputVal)).dataSync();
		//console.log(getResponse(pred));
		fulltext += getResponse(pred)+"\n";
		document.getElementById('dialogue').value = fulltext;
		document.getElementById("dialogue").scrollTop = document.getElementById("dialogue").scrollHeight;

	}
});

