function checkInputOnEquals(input){
	var storage=0;
	var containsEqual=false;
	var startContainsOperator=false;
	var endContainsOperator=false;
	var resultName="";
	
	for(var i=0;i<input.length;i++){
		
		if(input.charAt(i)=="="&&(containsEqual==false ||input.charAt(i+1)=="=" )){
			containsEqual=true;
			storage=i;
		}else if(input.charAt(i)=="="&&containsEqual==true){
			throw new e;
		}
	}
	
	if(containsEqual==true){
		for(var i=0;i<storage;i++){
			if(input.charAt(i)=="ᴧ"||input.charAt(i) == "ᴠ" || input.charAt(i) == "(" || input.charAt(i) == ")" || input.charAt(i) == "¬"|| input.charAt(i) == "⊕" || input.charAt(i) == "0"|| input.charAt(i) == "1" || input.charAt(i) == "⊙" || input.charAt(i)=="↑"|| input.charAt(i)=="↓"){
				startContainsOperator=true;
			}
		}
		for(var i=input.length-1;i>storage;i--){
			if(input.charAt(i)=="ᴧ"||input.charAt(i) == "ᴠ" || input.charAt(i) == "(" || input.charAt(i) == ")" || input.charAt(i) == "¬"|| input.charAt(i) == "⊕" || input.charAt(i) == "0"|| input.charAt(i) == "1" || input.charAt(i) == "⊙" || input.charAt(i)=="↑"|| input.charAt(i)=="↓"){
				endContainsOperator=true;
			}
		}
	}
	
	if(startContainsOperator == true && endContainsOperator == true){
		throw new e;
	}else if(startContainsOperator == true && endContainsOperator == false){
		resultName = input.slice(storage+1,input.length);
	}else if(startContainsOperator == false && endContainsOperator == true){
		resultName = input.slice(0,storage);
	}else{
		resultName = input.slice(0,storage);
	}

	
	return array=[resultName, input, storage,startContainsOperator]; 
}


function removeResultName(array){
	if (array[0]!="" && array[3]==true){
		array[1] = array[1].slice(0,array[2]);
	}else if(array[0]!="" && array[3]==false){
		array[1] = array[1].slice(array[2]+1,array[1].length);
	}
	return array[1];
}

function varFilter(input){ //Herausfiltern der Variablen und Hinzufügen zu einem Array
	var storage = "";
	var vars = new Array(0);
	var counter = 0;
	
	for(var i=0;i<input.length; i++){
		if((input.charAt(i)=="ᴧ"||input.charAt(i) == "ᴠ" || input.charAt(i) == "(" || input.charAt(i) == ")" || input.charAt(i) == "¬"|| input.charAt(i) == "⊕" || input.charAt(i) == "0"|| input.charAt(i) == "1" || input.charAt(i) == "⊙" || input.charAt(i)=="↑"|| input.charAt(i)=="↓")){
			if(vars.length <= counter){
				vars.length = vars.length+1;
			}
			
			vars[counter] = storage;
			storage = "";
			counter++;
		}else{
			if(input.charAt(i)!=" "){
				storage = storage.concat(input.charAt(i));
			}
		}	
	}
	
	vars.length=vars.length+2;
	vars[counter]=storage;
	counter++;
	vars[counter]=input;
	
	
	for(var i=0;i<vars.length;i++){	// leere instanzen und Leerzeichenaus dem Array entfernen
		counter = 0;
		for(var j=0;j<vars[i].length;j++){
			if(vars[i].charAt(j)!=""&&vars[i].charAt(j)!=" "){
				counter++;
			}
		}
		
		if(counter==0){
			vars.splice(i,1);
			i--;
		}
	}
	
	if(vars.length > 2){
		vars = [...new Set(vars)]; //doppelte Variablen entfernen
	}
	return vars;
}


function checkResultName(vars,resultName, storage){ //Überprüfung der Eingabe ohne Leerzeichen und leere Instanzen

	resultName = resultName.trimLeft();
	resultName = resultName.trimRight();
	if(resultName == "" && storage != 0)
	{
		throw new e;
	}
	for(var i=0;i<resultName.length;i++)
	{
		if(resultName.charAt(i)==" ")
		{
			throw new e;
		}
	}
	for(var i=0;i < vars.length;i++){
		if(vars[i]==resultName)
		{
			throw new e;
		}
	}
	return resultName;
}	

function changeOperator(input){ //Ersetzt die möglichen Eingaben für die Logikbausteine mit einheitlichen Operatoren
	var res = input;

	res = res.replace("~", "¬");
	res = res.replace("!", "¬");
	res = res.replace("*", "ᴧ");
	res = res.replace("&", "ᴧ");
	res = res.replace("+", "ᴠ");
	res = res.replace("|", "↑");
	res = res.replace("\\", "↓");	
	res = res.replace("-", "↓");

	if(res.includes(" XAND ") || res.includes(" Xand ") || res.includes(" xand ")){
		res = res.replace("XAND", "⊙");
		res = res.replace("Xand", "⊙");
		res = res.replace("xand", "⊙");
	}if(res.includes(" XNOR ") || res.includes(" Xnor ") || res.includes(" xnor ")){
		res = res.replace("XNOR", "⊙");
		res = res.replace("Xnor", "⊙");
		res = res.replace("xnor", "⊙");
	}
	if(res.includes(" NAND ") || res.includes(" Nand ") || res.includes(" nand ")){
		res = res.replace("NAND", "↑");
		res = res.replace("Nand", "↑");
		res = res.replace("nand", "↑");
	}
	if(res.includes(" AND ") || res.includes(" And ") || res.includes(" and ")){
		res = res.replace("AND", "ᴧ");
		res = res.replace("And", "ᴧ");
		res = res.replace("and", "ᴧ");
	}
	if(res.includes(" NOR ") || res.includes(" Nor ") || res.includes(" nor ")){
		res = res.replace("NOR", "↓");
		res = res.replace("Nor", "↓");
		res = res.replace("nor", "↓");
	}
	if(res.includes(" XOR ") || res.includes(" Xor ") || res.includes(" xor ")) {
		res = res.replace("xor", "⊕");
		res = res.replace("Xor", "⊕");
		res = res.replace("XOR", "⊕");
		}
	if(res.includes(" OR ") || res.includes(" Or ") || res.includes(" or ")){
		res = res.replace("OR", "ᴠ");
		res = res.replace("Or", "ᴠ");
		res = res.replace("or", "ᴠ");
	}
	if(res.includes(" NOT ")|| res.includes(" Not ")|| res.includes(" not ")|| res.slice(0,4)=="NOT "|| res.slice(0,4)=="Not "|| res.slice(0,4)=="not "){
		res = res.replace("NOT", "¬");
		res = res.replace("Not", "¬");
		res = res.replace("not", "¬");
	}
	
	return res;
}

function changeSpaces(input){ //Einfügen von AND zwischen Variablen und/oder Klammern ohne Operatoren

	var lastThing = "";
	var nextThing = "";
	for(var i=0;i<input.length;i++){
		if(input.charAt(i)!=" "){
			lastThing = input.charAt(i);
		}
		if(input.charAt(i+1)==" "){
			for(var j=i+2;j<input.length;j++){
				if(input.charAt(j)!= " " && nextThing == ""){
					nextThing = input.charAt(j);
					break;
				}
			}
		}
		if(lastThing!= "" && lastThing != "ᴧ" && lastThing!= "ᴠ" && lastThing!= "¬" && lastThing!= "⊕" && lastThing!= "0" && lastThing!= "1" && lastThing!= "⊙"&& lastThing!= "(" && lastThing != "↑" && lastThing != "↓" && nextThing != "ᴧ" && nextThing!= "ᴠ" && nextThing!= "¬" && nextThing!= "⊙" && nextThing!= "0" && nextThing!= "1" && nextThing!= "⊕"&& nextThing!= "" && nextThing!= ")" && nextThing != "↑" && nextThing != "↓"){
			
			if(input.charAt(i+1)==" "){
				input = setCharAt(input,i+1,"ᴧ");
			
			}
			
			
		}
		if(input.charAt(i+1)=="(" && input.charAt(i)!= "ᴧ" && input.charAt(i) != "ᴠ" && input.charAt(i) != "¬" && input.charAt(i) != "⊕" && input.charAt(i) != "0" && input.charAt(i) != "1" && input.charAt(i) != "⊙" && input.charAt(i) != " " && input.charAt(i) != "↑" && input.charAt(i) != "↓" && input.charAt(i) != "("){
			input = setCharAt(input,i+1,"ᴧ");
		}
		
		if(input.charAt(i)==")" && input.charAt(i+1) != "ᴧ" && input.charAt(i+1) != "ᴠ" && input.charAt(i+1) != "¬" && input.charAt(i+1) != "⊕" && input.charAt(i+1) != "0" && input.charAt(i+1) != "1" && input.charAt(i+1) != "⊙" && input.charAt(i+1) != " " && input.charAt(i+1) != "↑" && input.charAt(i+1) != "↓" && input.charAt(i+1) != ")"){
			input = setCharAt(input,i+1,"ᴧ");
		}
		lastThing = "";
		nextThing = "";
	}
	return input;
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
	return str.substring(0,index) + chr + str.substring(index);
}