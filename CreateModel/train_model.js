console.log('Hello TensorFlow');
/*
const model = await tf.loadLayersModel('C:\Users\devca\Desktop\chatbot\tensorflowjs\model.json');
model.predict("hi");
const model = await tf.loadLayersModel('file://Users/devca/Desktop/chatbot/tensorflowjs/model.json');
*/
/*
(async () => {
	const model = await tf.loadLayersModel('https://jaehayi.com/chatbot/model.json');
	console.log('Model loaded successfully.')
	tfvis.show.modelSummary({name: 'Model Summary'}, model);
})();
*/

var map = [];
var word_map = {}; 
var class_map = {};
var word_cnt = 0;
var class_cnt = 0;
var model;

var training = [];

function convertToTensor(data) {
	//Prepare data for training
	//1. shuffle data
	tf.util.shuffle(training); 
	//2. convert to tensors
	const inputs = training.map(d => d[0]);
	const labels = training.map(d => d[1]);
	const inputTensor = tf.tensor2d(inputs, [inputs.length, word_cnt]);
	const labelTensor = tf.tensor2d(labels, [labels.length, class_cnt]);
	//no normalization needed
	return {
      inputs: inputTensor,
      labels: labelTensor,
	}
}

async function trainModel(inputs, labels) {
		//create model
		model = tf.sequential();
		model.add(tf.layers.dense({units: 128, inputShape: [word_cnt,], activation: 'relu'}));
		model.add(tf.layers.dropout(0.5));
		model.add(tf.layers.dense({units: 64, activation: 'relu'}));
		model.add(tf.layers.dropout(0.5));
		model.add(tf.layers.dense({units: class_cnt, activation: 'softmax'}));

		//train model
		sgd = tf.train.sgd(learning_rate=0.01, decay=1e-6, momentum=0.9, useNesterov=true);
		model.compile({optimizer: sgd, loss: 'categoricalCrossentropy', metrics: ['acc'],});
		
		console.log("Model trained.");
		await model.fit(inputs, labels, {
			epochs: 250, 
			batchSize: 5, 
			verbose: 1, 
			callbacks: tfvis.show.fitCallbacks(
			  { name: 'Training Performance' },
			  ['loss', 'acc'], 
			  { height: 200, callbacks: ['onEpochEnd'] }
			)
		});
		await model.save('downloads://my-model');
}

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		//load and format data
		var myArr = JSON.parse(this.responseText);
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
				//add to classes
				if (!(intent.tag in class_map)) {
					class_map[intent.tag] = class_cnt;
					class_cnt++;
				}
				//add to map
				map.push([word_arr, intent.tag]);
			}
		}
		for (var i in map) {
			var input = new Array(word_cnt).fill(0);
			var output = new Array(class_cnt).fill(0);
			for (var w of map[i][0]) {
				input[word_map[w]] = 1;
			}
			output[class_map[map[i][1]]] = 1;
			//console.log(input+"\n"+output);
			training.push([input, output]);
		}

		//convert data to tensors
		const tensorData = convertToTensor(training);
		const {inputs, labels} = tensorData;
		
		trainModel(inputs, labels);
	}
};
xmlhttp.open("GET", "https://jaehayi.com/chatbot/intents.json", true);
xmlhttp.send();
