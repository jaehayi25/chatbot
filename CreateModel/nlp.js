console.log('Natural language processor');

var vowels = ["a","e","i","o","u"]
function measure(word) {
	var V = false;
	var count = 0;
	for (var c of word) {
		if (vowels.includes(c)) {
			if (V == false) {
				V = true;
			}
		}
		else {
			if (V == true) { //switch from V to C
				V = false;
				count++;
			}
		}
	}
	return count;
}
function contain_vowel(word) {
	for (var c of word) {
		if (vowels.includes(c)) {
			return true;
		}
	}
	return false;
}
function double_consonant_remove(d) {
	if (!contain_vowel(d) && d.charAt(0) == d.charAt(1)) {
		if (d.charAt(0) != 'l' && d.charAt(0) != 's' && d.charAt(0) != 'z') return true;
	}
	return false;
}
function doubleL(word) {
	if (word.charAt(word.length-2) == 'l' && word.charAt(word.length-1) == 'l') {
		return true;
	}
	return false;
}
function end_cvc(word) {
	if (!vowels.includes(word.charAt(word.length-1))) {
		if (vowels.includes(word.charAt(word.length-2))) {
			if (!vowels.includes(word.charAt(word.length-3))) {
				return true;
			}
		}
	}
	return false;
}
function posEnd(word, suffix) {
	if (word.substring(word.length-suffix.length, word.length) == suffix) {
		return word.length-suffix.length;
	}
	return -1;
}
function stem(word) {
	var n = word.length;
	if (word.substring(n-4, n) == "sses") { //sses -> ss
		word = word.substring(0, n-4)+"ss";
	}
	else if (word.substring(n-3, n) == "ies") { //ies -> i
		word = word.substring(0, n-2);
	}
	else if (word.substring(n-1, n) == "s" && word.substring(n-2, n) != "ss") { //s ->  (except ss)
		word = word.substring(0, n-1);
	}
	else if (word.substring(n-3, n) == "eed") { // eed -> ee
		if (measure(word.substring(0, n-1)) > 0) { //m > 0
			word = word.substring(0, n-1);
		}
	}
	else if (word.substring(n-2, n) == "ed" && contain_vowel(word.substring(0, n-2))) { //ed -> 
		word = word.substring(0, n-2);
		if (word.substring(n-4, n-2) == "at" || word.substring(n-4, n-2) == "ble" || word.substring(n-4, n-2) == "iz") {
			word += "e";
		}
		else if (double_consonant_remove(word.substring(n-4, n-2))) {
			word = word.substring(0, n-3);
		}
		else if (measure(word) == 1 && end_cvc(word)) {
			word += "e";
		}
	}
	else if (word.substring(n-3, n) == "ing" && contain_vowel(word.substring(0, n-3))) { //ing -> 
		word = word.substring(0, n-3);
		if (word.substring(n-5, n-3) == "at" || word.substring(n-5, n-3) == "ble" || word.substring(n-5, n-3) == "iz") {
			word += "e";
		}
		else if (double_consonant_remove(word.substring(n-5, n-3))) {
			word = word.substring(0, n-4);
		}
		else if (measure(word) == 1 && end_cvc(word)) {
			word += "e";
		}
	}
	else if (word.substring(n-1, n) == "y" && contain_vowel(word)) {
		word = word.substring(0, n-1)+"i";
	}

	//step 2
	var suffixes = ["ational", "tional", "enci", "anci", "izer", "abli", "alli", "entli", "eli", "ousli", "ization", "ation", "ator", "alism", "iveness", "fulness", "ousness", "aliti", "iviti", "biliti"];
	var addends = ["ate","tion","ence","ance","ize","able","al","ent","e","ous","ize","ate","ate","al","ive","ful","ous","al","ive","ble"];
	for (var i in suffixes) {
		endpt = posEnd(word, suffixes[i]);
		if (endpt != -1 && measure(word.substring(0, endpt))>0) {
			word = word.substring(0, endpt) + addends[i];
		}
	}

	//step 3
	var suffixes = ["icate","ative","alize","iciti","ical","ful","ness"];
	var addends = ["ic","","al","ic","ic","",""];
	for (var i in suffixes) {
		endpt = posEnd(word, suffixes[i]);
		if (endpt != -1 && measure(word.substring(0, endpt))>0) {
			word = word.substring(0, endpt) + addends[i];
		}
	}
	//step 4
	var suffixes = ["al","ance","ence","er","ic","able","ible","ant","ement","ment","ent","sion","tion","ou","ism","ate","iti","ous","ive","ize"];
	var addends = ["","","","","","","","","","","","s","t","","","","","","",""];
	for (var i in suffixes) {
		endpt = posEnd(word, suffixes[i]);
		if (endpt != -1 && measure(word.substring(0, endpt))>1) {
			word = word.substring(0, endpt) + addends[i];
		}
	}

	//step 5a
	n = word.length;
	if (measure(word)>1 && word.substring(n-1,n)=="e") {
		word = word.substring(0, n-1);
	}
	if (measure(word) == 1 && word.substring(n-1,n)=="e" && !end_cvc(word.substring(0,n-1))) {
		word = word.substring(0, n-1);
	}
	if (measure(word) > 1 && doubleL(word)) {
		word = word.substring(0, n-1);
	}
	return word;
}

var stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];
function remove_stopwords(arr) {
	ret = [];
	for (var word of arr) {
		if (!stopwords.includes(word)) {
			ret.push(word);
		}
	}
	return ret;
}

function stem_arr(arr) {
	ret = [];
	for (var w of arr) {
		ret.push(stem(w));
	}
	return ret;
}

//var test_words = ["caress","ponies","ties","caress","cats","feed","agreed","plastered","bled","falling","sing","tanned","fizzed","swimming","hopping","filing"]
//var test_words = ["relational","conditional","rational","valency","hesitancy","digitizer","conformably","radically","differently","vilely","analogously","vietnamization","predication","predict","operator","feudalism","decisiveness","hopefulness","callousness","formality","sensitivity","sensibility"];
//var test_words = ["triplicate","formative","formalize","electricity","electrical","hopeful","goodness"];
//var test_words = ["cement","revival","allowance","inference","airliner","gyroscopic","supervision","adjustable","defensible","irritant","replacement","adjustment","dependent","adoption","homologou","communism","activate","angularity","homologous","effective","bowdlerize"];
//var test_words = ["supervise","revive","probate","rate","cease","controll","roll","a","the"];

//split sentence into words, remove any symbols and extra spaces, make lowercase, return an array of stemmed words
function tokenize(sentence) { 
	sentence = sentence.toLowerCase();
	sentence = sentence.replace(/[^a-z ]/g, "");
	sentence = sentence.replace(/\s+/g," ").trim();
	var word_arr = sentence.split(" ");
	/*--------------don't remove stop words-------------*/
	//word_arr = remove_stopwords(word_arr);
	word_arr = stem_arr(word_arr);
	return word_arr;
}
