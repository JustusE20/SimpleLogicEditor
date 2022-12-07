/* v1.0.5 by Konstantin Fuchs
*  v2.0.6 by Wiebke Albers
*  v3.0.5 by Justus Epperlein
*/

var globalDeleteActive = false;
var colorActive = "orange";
var colorStandard = "black";
var colorSelected = "lightgrey";
var colorConnectionPoints = "#38393d";
var viewZoom = 0;
var realZoom = 1000;
var inputCount = 0;
var outputCount = 0;
var modulID = 0;
var statusNavigationBar = true;
var widthNavBar = document.getElementById("navigationBar").clientHeight;
var width = 100;
var height = 90;
var select = document.getElementById("select"); //J.E.
const gridSize = 15;


//#region prototype additional functions

/* W.A. 
 * hide dropdown menus when loading the web page
 */
document.getElementById("myDropdownLogic").style.display = "none";
document.getElementById("myDropdownSave").style.display = "none";

/* K.F.
 * changes the textbox color to orange when an error appears
 */
const textBox = document.getElementById("term");
textBox.addEventListener('showError', e => { showError(d3.select(e.target)); });

/* W.A.
* rightclick in simulation area: show most important buttons of navigation bar as dropdown list 
*/
const logicBox = document.getElementById("simulationBox");
logicBox.addEventListener('contextmenu', function (event) {
    event.preventDefault(); 
    var top = event.clientY - logicBox.clientHeight - widthNavBar - 30;
    var left = event.clientX - 10;
    dropdownMenu(3, top, left);
});

/** K.F.
 * moves an svg element to the lowest z-level 
 */
d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};
 
/** K.F.
 * swaps the two elements in the array
 * 
 * @param {number} x the index of one of the elements to be exchanged
 * @param {number} y the index of the other of the elements to be exchanged 
 */
Array.prototype.swap = function (x, y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
};

/** W.A.
 * Closes the dropdown menu if the user clicks outside of it  
 */
window.onclick = function(event) {  
    if (!event.target.matches('.dropdownButton') && !event.target.matches('.dropdown-content a')){  
        var clickLogic = document.getElementById("myDropdownLogic");   
        var clickSave = document.getElementById("myDropdownSave");   
        var clickMenu = document.getElementById("myDropdownMenu");   
        clickLogic.style.display ="none";
        clickSave.style.display ="none";
        clickMenu.style.display ="none";
    }
}

//#endregion

//#region functions

/** W.A.
 * Shows developer information
 */
function about(){
    alert("v1.0.5 by Konstantin Fuchs \nv2.0.6 by Wiebke Albers \nv3.0.5 by Justus Epperlein \nUnder the supervision of Prof. Dr. Rüdiger Heintz");
}

/** K.F./W.A.
 * adds an SVG element to the DOM and reads the equation that may have been added to the URL
 */
function onLoad(){
    try {
        setWinParam();
        var initVal = (decodeURI(window.location.hash.slice(1)));
        d3.select(".frame").append("svg").attr("id", "svg").attr("viewBox", "0 0 " + realZoom + " 100").attr("preserveAspectRatio", "xMinYMin meet");
    }
    catch { }
    if (typeof initVal != "undefined" || initVal != "") {
        document.getElementById("term").value = initVal;
        firstCharacter = initVal.slice(0,1);
        if(firstCharacter == "[" || firstCharacter == "{"){
            deserializeLogic();
        } 
        else{
            if (initVal) {
                draw(initVal);
            }
        }
    }
    else term = "";
}

///////// Begin implementation of URL window-informtion
/** W.A.
 * Set parameters of window-size, view, appearance
 */
function setWinParam(){
    var urlParam = new URLSearchParams(document.location.search);
    width = JSON.parse(urlParam.get('width'));
    height = JSON.parse(urlParam.get('height'));
    viewZoom = JSON.parse(urlParam.get('viewZoom'));
    statusNavigationBar = JSON.parse(urlParam.get('statusNavigationBar'));

    if(width != null && height != null){
        document.getElementById("navigationBar").style.width = width + 'px';
        document.getElementById("simulationBox").style.width = width + 'px';
        document.getElementById("simulationBox").style.height = height + 'vh';
    }
    if(statusNavigationBar == false && height == null){
        height = 85;
    }

    calcZoom();
    toggleNavigationBar();
}

/** W.A.
 * calculates Zoom out of window size
 */
function calcZoom(){
    var absoluteWidth = document.body.offsetWidth;
    var zoomRatio = absoluteWidth / 1000;
    
    realZoom = (realZoom - viewZoom) *zoomRatio;
}

/** W.A.
 * hide/show dropdown menu depending on which dropdown menu has been activated
 */
function dropdownMenu(number, x, y){
    if(number == 1){
        var click = document.getElementById("myDropdownLogic");
    }
    else if(number == 2){
        var click = document.getElementById("myDropdownSave");
    }
    else if(number == 3){
        var click = document.getElementById("myDropdownMenu");
        click.style.top = x + "px";
        click.style.left = y + "px";
    }
    
    if(click.style.display ==="none") {  
        click.style.display ="block";  
    } 
    else {  
        click.style.display ="none";  
    } 
}

/** W.A.
* Show/hide of the navigation bar
*/
function toggleNavigationBar(toggle){
    if(toggle == true){
        statusNavigationBar = !statusNavigationBar;
    }
    
    if(statusNavigationBar == false){
        height = height + 8;
        document.getElementById("navigationBar").style.display = 'none';
    }
    else if(statusNavigationBar == true){
        if(toggle == true){height = height - 8;}
        document.getElementById("navigationBar").style.display = '';
    }
}
///////// End implementation of URL window-informtion

/** K.F.
 * lets the element light up in the highlight color
 * @param {Object} element the d3 selection of the element to be highlighted
 */
function showError(element) {
    element.transition().duration(500).style("background-color", colorActive);
    element.transition().duration(500).delay(500).style("background-color", "white");
}

/** K.F.
 * toggles the state of the global variable globalDeleteActivate
 */
function toggleDelete() {
    if (globalDeleteActive) {
        globalDeleteActive = false;
    }
    else {
        globalDeleteActive = true;
    }
}

/** K.F.
 * reduces the view of the svg canvas
 */
function zoomIn() {
    viewZoom += 50;
    realZoom -= 50;
    d3.select("#svg").attr("viewBox", "0 0 " + realZoom + " 100");
}

/** K.F.
 * enlarges the view of the svg canvas
 */
function zoomOut() {
    viewZoom -= 50;
    realZoom += 50;
    d3.select("#svg").attr("viewBox", "0 0 " + realZoom + " 100");
}

/** J.E.
 * selection of an area on the canvas
*/
var selectionArea = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,

    drawSelection: function() { //Draws selection box and marks the modules inside the area
        var x3 = Math.min(this.x1, this.x2);
        var x4 = Math.max(this.x1, this.x2);
        var y3 = Math.min(this.y1, this.y2);
        var y4 = Math.max(this.y1, this.y2);
        select.style.left = x3 + 'px';
        select.style.top = y3 + 'px';
        select.style.width = x4 - x3 + 'px';
        select.style.height = y4 - y3 + 'px';
        x3 = x3*realZoom/(realZoom + viewZoom);
        x4 = x4*realZoom/(realZoom + viewZoom);
        y3 = y3*realZoom/(realZoom + viewZoom);
        y4 = y4*realZoom/(realZoom + viewZoom);
    
        var moduleList = new ModuleManager().getModuleList();
        for(var i=0; i < moduleList.length; i++) {
            var element = moduleList[i];
            if(x3 < element.getX() && element.getX() < x4 && y3 < element.getY() && element.getY() < y4) {
                element.group.select("rect").attr("fill", colorSelected);
                element.selected = true;
            } else {
                element.group.select("rect").attr("fill", "transparent");
                element.selected = false;
            }
        }
    },
    setSelection: function(x1, y1, x2, y2) { //Sets all coordinates of selection area
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    },
};
onmousedown = function(e) {
    if(e.clientY > (widthNavBar + 10) && !e.target.matches('.dropdown-content a')  && !e.target.matches('.d3-context-menu ul li') && e.button === 0) {
        select.hidden = 0;
        selectionArea.setSelection(e.clientX - 10, e.clientY - 65, e.clientX - 10, e.clientY - 65);
        selectionArea.drawSelection();
    }
};
onmousemove = function(e) {
    if(select.hidden == 0) {
        selectionArea.x2 = e.clientX - 10;
        if(e.clientY > (widthNavBar + 15)) {
            selectionArea.y2 = e.clientY - 65;
        } else {
            selectionArea.y2 = widthNavBar - 50;
        }
        selectionArea.drawSelection();
    }
};
onmouseup = function(e) {
    select.hidden = 1;
    selectionArea.setSelection(0, 0, 0, 0);
};

/** J.E.
 * return Array of single selected module or all marked modules
 * @param {Module} module the selected module
 */
function getSelection(module) {
    var selectionList = new Array();
    if(module.selected) {
        var moduleList = new ModuleManager().getModuleList();
        for(var i=0; i < moduleList.length; i++) {
            if(moduleList[i].selected) {
                selectionList.push(moduleList[i]);
            }
        }
    } else {
        selectionList.push(module);
    }
    return selectionList;
}

///////// Begin save logic with button
/** W.A.
 * Converts logic objects to JSON-string and write it in URL
 */
function pushToURL(){
    var urlParam = new URLSearchParams(document.location.search);
    var textLogic = serializeLogic();
     
    urlParam.set('statusNavigationBar', statusNavigationBar);
    urlParam.set('viewZoom', viewZoom);
    urlParam.set('width', width);
    urlParam.set('height', height);
    history.pushState(null, null, "?"+urlParam);
    
    textLogic = textLogic[2] + "delimiter" + textLogic[3];
    var encodedLogic = encodeURI(textLogic);
    history.pushState(null, null, "#"+encodedLogic);
    
    navigator.clipboard.writeText("?" + urlParam + "#" + encodedLogic);
    alert("?" + urlParam + "#" + encodedLogic);
}

/** W.A.
* copies serialized logic into clipboard
*/
function copyText() {
    var textLogic = serializeLogic();
    var copy = textLogic[2] + "delimiter" + textLogic[3];

    if ((textLogic[0].length < 1) && (textLogic[1].length < 1)) {
        alert("No objects to copy!");
    }
    else {
        document.getElementById("term").value = copy;
        navigator.clipboard.writeText(copy);
        alert("Module count: " +  textLogic[0].length + "\nConnection count: " + textLogic[1].length + "\n\nSaved:\n" + textLogic[2] + "delimiter" + textLogic[3]);
    }
}

/** W.A.
* saves text as .txt-file
*/
function saveTxt() {
    var textLogic = serializeLogic();
    var date = new Date();

    if ((textLogic[0].length < 1) && (textLogic[1].length < 1)) {
        alert("No ojects to save!");
    }
    else {
        var text = document.createElement("a");
        text.href = window.URL.createObjectURL(new Blob([textLogic[2] + "delimiter" + textLogic[3]], { type: "text/plain" }));
        text.download = "LogicToText_" + date + ".txt";
        text.click();
    }
}

/** W.A.
* Serialization of drawn object-assembly
* Converts generated logic into JSON-text
* Possibility to save logic for later use
*/
function serializeLogic() 
{
    var listModules = new ModuleManager().getModuleList();
    var listConnections = new ConnectionManager().getConnectionList();
    var jsonModules = [];
    var jsonConnections = [];

    // Serialize only specific properties to aviod circular loops because of connections
    jsonModules.push(JSON.stringify(listModules,['classname','text','id','value',
                                                'x','y','width','height',
                                                'maxInputCount','maxOutputCount',
                                                'outputOffset','inputOffset']));
    jsonConnections.push(JSON.stringify(listConnections,['classname','inputID','outputID',
                                                        'gridPointsX','gridPointsY', 'curve']));
    
    var textLogic = [listModules, listConnections, jsonModules, jsonConnections];
    return textLogic;
}
///////// End save logic with button

///////// Begin draw logic from JSON
/** W.A.
 * Converts gernerated text back into objects
 */
function deserializeLogic()
{   
    var text = document.getElementById("term").value;

    var firstCharacter = text.slice(0,1);
    if(firstCharacter == "[" || firstCharacter == "{"){
        var JSONarray = text.split('delimiter');
        var listModulesOld = JSON.parse(JSONarray[0]); 
        var listConnectionsOld = JSON.parse(JSONarray[1]);
    
        changeModuleID(listModulesOld);
    
        listModulesOld.forEach(function(module){
            if(module.classname == "INPUT" || module.classname == "OUTPUT"){
                module.value = !module.value;
                eval("Object.assign(new " + module.classname + "(module.x, module.y, module.text), module);")
            }
            else{
                eval("Object.assign(new " + module.classname + "(module.x, module.y, module.maxInputCount), module);")
            }
            
        });
    
        var listModulesNew = new ModuleManager().getModuleList();
        var listConnectedModules = [];
        listConnectionsOld.forEach(function(connection){
            listConnectedModules.push(connection.outputID);
            var inputIndex = listConnectedModules.filter(outID => outID == connection.outputID)
            createConnection(connection,listModulesNew, inputIndex.length-1);
        })
    }
    else{
        draw(text);
    }   
}

/** W.A.
 * Creates connection between reloaded modules based on their moduleID
 * @param {CONNECTION} connection the connection to be drawn
 * @param {Array} listModulesNew list of modules which can be connected
 * @param {number} inputIndex number of input (relevant for modules with several inputs)
 */
function createConnection(connection, listModulesNew, inputIndex) 
{
    var startObject = listModulesNew.find(obj => obj.id == connection.inputID);
    var endObject = listModulesNew.find(obj => obj.id == connection.outputID);
   
    try{
        connect(startObject, new CONNECTION([0,0,0,0], [0,0,0,0]), endObject, inputIndex);
        startObject.checkActivated();
    }
    catch{
        alert("Connection did not work!");
    }
}

/** W.A.
 * Changes id of currently plotted modules to avoid doublings when deserialize logic with 'old' ids
 * Identify highest id in module-list (all lower ids are reserved for deserialization)
 * @param {Array} listOldModules
 */
function changeModuleID(listModulesOld){
    var listIDs = [];
    listModulesOld.forEach(function(module){listIDs.push(module.id);}); 
    var maxID = Math.max.apply(null, listIDs);

    var listModulesNow = new ModuleManager().getModuleList();
    if(listModulesNow.length != 0){
        listModulesNow.forEach(function(module){
            module.id = maxID + 1;
            maxID++;
        });
    }
}
///////// End draw logic from JSON

///////// Begin draw logic from equation
/** K.F.
 * initiates the process of drawing the equation
 * @param {String} text the raw text that was entered and is to be drawn 
 */
function draw(text) {draw
    var parser = new Parser(text);
    var variables = parser.getVariables()
    var inputList = new Array(variables.length);
    var buffer = new Array();
    var lastElement = null;

    try {
        //drawing all necessary inputs
        for (var i = 0; i < variables.length; i++) {
            var input = new INPUT(15, 15, variables[i]);
            buffer.push(input);
            inputList[i] = place(input);
        }

        //drawing all modules
        lastElement = buildEquation(variables, parser.getEquation(), inputList, buffer);

        //drawing the output
        if (lastElement != null) {
            var output = place(new OUTPUT(210, 30, parser.getResult()));
            buffer.push(output);
            connect(lastElement, new CONNECTION([0,0,0,0], [0,0,0,0]), output, 0);
            lastElement.checkActivated();
        }
    }
    catch
    {
        //in the case of an exception, the elements drawn so far are deleted and the event showError is dispatched
        for (var i = buffer.length; i >= 0; i--) {
            if (buffer[i] != null) buffer.pop().delete();
        }
        var event = new CustomEvent('showError');
        textBox.dispatchEvent(event);
    }
}

/** K.F.
 * draws the given equation
 * @param {String[]} variables list of variables
 * @param {String[]} equation  the equation to be drawn
 * @param {INPUT[]} inputList list of the inputs generated from the variables
 * @param {Module[]} buffer the buffer in which every automatically generated module is cached so that it can be deleted in the event of an error 
 */
function buildEquation(variables, equation, inputList, buffer) {
    var innerBrackets = new Array();
    var openBrackets = 0;
    var searchBracketsLevel = 0;
    var inBrackets = false;
    var equationMerge = new Array();

    //find brackets and save them in InnerBrackets
    for (var i = 0; i < equation.length; i++) {
        if (inBrackets) {
            innerBrackets[innerBrackets.length - 1].push(equation[i]);
        }
        else if (equation[i] != "(") {
            equationMerge.push(equation[i]);
        }

        if (equation[i] == "(") {
            openBrackets++;
            if (!inBrackets) {
                innerBrackets.push(new Array());
                searchBracketsLevel = openBrackets;
                inBrackets = true;
            }
        }
        else if (equation[i] == ")") {
            if (inBrackets && searchBracketsLevel == openBrackets) {
                searchBracketsLevel = openBrackets;
                inBrackets = false;
                innerBrackets[innerBrackets.length - 1].pop();
                equationMerge.push(innerBrackets.length - 1);
            }
            openBrackets--;
        }
    }

    //first build brackets with buildEquation (recursion) 
    var outputList = new Array(innerBrackets.length);
    for (var i = 0; i < innerBrackets.length; i++) {
        outputList[i] = buildEquation(variables, innerBrackets[i], inputList, buffer);
    }

    //draw the module and connect the inputs
    var module = null;
    var input;
    switch (equationMerge[1]) {
        case "ᴧ":
            module = place(new AND(120, 15, 2));
            break;
        case "↑":
            module = place(new NAND(120, 15, 2));
            break;
        case "ᴠ":
            module = place(new OR(120, 15, 2));
            break;
        case "↓":
            module = place(new NOR(120, 15, 2));
            break;            
        case "¬":
            module = place(new NOT(120, 15, 2));
            break;
        case "⊕":
            module = place(new XOR(120, 15, 2));
        break; 
        case "⊙":
            module = place(new XNOR(120, 15, 2));
        break;        
    }

    if (module != null) {
        buffer.push(module);
        if (isNaN(equationMerge[0])) {
            input = inputList[variables.indexOf(equationMerge[0])];
        }
        else {
            input = outputList[equationMerge[0]];
        }
        connect(input, new CONNECTION([0,0,0,0], [0,0,0,0]), module, 0);
        input.checkActivated();

        if (equationMerge.length > 2) {
            if (isNaN(equationMerge[2])) {
                input = inputList[variables.indexOf(equationMerge[2])];
            }
            else {
                input = outputList[equationMerge[2]];
            }
            connect(input, new CONNECTION([0,0,0,0], [0,0,0,0]), module, 1);
            input.checkActivated();
        }
    }
    else {
        if (outputList) {
            module = outputList[0];
        }
    }
    return module;
}
///////// End draw logic from equation

/** K.F.
 * takes the given element and moves it in y direction until it no longer touches any other module
 * @param {Module} element the element to be placed
 */
function place(element) {
    while (isTouching(element)) {
        element.dMove(0, gridSize);
    }
    return element;
}

/** K.F.
 * determines whether the specified element touches another module
 * @param {Module} element the element which should be checked
 */
function isTouching(element) {
    var elementLeft = element.getX();
    var elementRight = element.getX() + element.width;
    var elementTop = element.getY();
    var elementBottom = element.getY() + element.height;

    var moduleList = new ModuleManager().getModuleList();
    var elementsList = new Array();

    //adds the elements which lead to collisions in the x direction to the "elementsList" list
    for (var i = 0; i < moduleList.length; i++) {
        var moduleLeft = moduleList[i].getX();
        var moduleRight = moduleList[i].getX() + moduleList[i].width;
        if ((elementLeft <= moduleRight && elementRight >= moduleLeft) || (moduleLeft <= elementRight && moduleRight >= elementLeft)) {
            elementsList.push(moduleList[i]);
        }
    }

    //returns true if an element in the "elementsList" list leads to collisions in the y direction 
    for (var i = 0; i < elementsList.length; i++) {
        var moduleTop = elementsList[i].getY();
        var moduleBottom = elementsList[i].getY() + elementsList[i].height;
        if ((element != elementsList[i]) && ((elementTop <= moduleBottom && elementBottom >= moduleTop) || (moduleTop <= elementBottom && moduleBottom >= elementTop))) {
            return true;
        }
    }
    return false;
}

/** K.F./J.E.
 * lets the given module and its connections follow the movement of the mouse
 * @param {Array} modules selection of modules to be moved
 * @param {boolean} dragMode chooses drag or latch mode
 */
function dragMove(modules, dragMode) {
    for(var h = 0; h < modules.length; h++) {
        var module = modules[h];
        if(dragMode) {
            var dx = d3.event.dx;
            var dy = d3.event.dy;
        } else {
            var dx = nextGridPoint(module.x) - module.x;
            var dy = nextGridPoint(module.y) - module.y;
        }
        module.dMove(dx, dy);
        if (module.output.length > 0) {
            for (var i = 0; i < module.output.length; i++) {
                module.output[i].dMoveStart(dx, dy);
            }
        }
        if (module.input.length > 0) {
            for (var i = 0; i < module.input.length; i++) {
                for (var j = 0; j < module.input[i].length; j++) {
                    module.input[i][j].dMoveEnd(dx, dy);
                    for(var k = 0; k < module.input[i][j].branches.length; k++) {//J.E.
                        module.input[i][j].branches[k].dMoveStart(dx, dy);
                    }
                }
            }
        }
    }
}

/** K.F.
 * lets the end of the given connection follow the movement of the mouse 
 * @param {CONNECTION} connection the connection to be moved
 */
function dragConnection(connection) {
    var dx = d3.event.dx;
    var dy = d3.event.dy;
    connection.dMoveEnd(dx, dy);
}

/** J.E.
 * calculates nearest grid point of current coordinate
 * @param {number} coordinate the coordinate to be used
 */
 function nextGridPoint(coordinate) {
    var res = Math.round(coordinate/gridSize)*gridSize;
    return res;
}

/** J.E.
 * deletion of all modules inside an array
 * @param {Array} modules the connection to be moved
 */
function deleteSelection(modules) {
    for(var i = 0; i < modules.length; i++) {
        modules[i].delete();
    }
}

/** K.F.
 * connects two modules with a given connection element
 * @param {Module} outElement the module whose output is to be connected with the connection element
 * @param {CONNECTION} connectionElement the connection element which should be used for the connection
 * @param {Module} inElement the module whose input is to be connected with the connection element
 * @param {number} inElementInputIndex indicates to which input the connection element is to be connected
 * @param {boolean} value indicates whether the connection should be activated
 */
function connect(outElement, connectionElement, inElement, inElementInputIndex, value) {
    try {
        if (outElement != null) {
            outElement.addOutput(connectionElement);
            connectionElement.moveStart(outElement.getX() + outElement.getOutputOffset()[0], outElement.getY() + outElement.getOutputOffset()[1]);
            connectionElement.setInput(outElement);
        }
        if (value != null) {
            connectionElement.setValue(value);
        }
        inElement.input[inElementInputIndex].push(connectionElement);
        connectionElement.output = inElement;
        connectionElement.outputID = inElement.id;
        connectionElement.setOutputInputIndex(inElementInputIndex);
        connectionElement.moveEnd(inElement.getX() + inElement.getInputOffset(inElementInputIndex)[0], inElement.getY() + inElement.getInputOffset(inElementInputIndex)[1]);
        return true;
    }
    catch (x) {
        //no connection possible
        return false;
    }
}

/** K.F.
 * creates a context menu
 * @param {Module} element element that triggered the context menu
 */
function menuLogic(element) {
    //describing the context menu
    var menu =
        [
            {
                title: "replace...",
                children:
                    [
                        {
                            title: "INPUT",
                            action: function () {
                                element.replace(new INPUT(element.x, element.y), element.id);
                            },
                        },
                        {
                            title: "AND",
                            action: function () {
                                element.replace(new AND(element.x, element.y, element.maxInputCount), element.id);
                            },
                        },
                        {
                            title: "NAND",
                            action: function () {
                                element.replace(new NAND(element.x, element.y, element.maxInputCount), element.id);
                            },
                        },
                        {
                            title: "OR",
                            action: function () {
                                element.replace(new OR(element.x, element.y, element.maxInputCount), element.id);
                            },
                        },
                        {
                            title: "NOR",
                            action: function () {
                                element.replace(new NOR(element.x, element.y, element.maxInputCount), element.id);
                            },
                        },
                        {
                            title: "XOR",               // J.E.
                            action: function () {
                                element.replace(new XOR(element.x, element.y, element.maxInputCount), element.id);
                            },
                        },
                        {
                            title: "XNOR",               // J.E.
                            action: function () {
                                element.replace(new XNOR(element.x, element.y, element.maxInputCount), element.id);
                            },
                        },
                        {
                            title: "NOT",
                            action: function () {
                                element.replace(new NOT(element.x, element.y), element.id);
                            },
                        },
                        {
                            title: "OUTPUT",
                            action: function () {
                                element.replace(new OUTPUT(element.x, element.y), element.id);
                            },
                        },
                    ],
            },
            {
                title: "change input number",               // W.A.
                children:
                    [
                        {
                            title: "2",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 2, element.id);
                            },
                        },
                        {
                            title: "3",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 3, element.id);
                            },
                        },
                        {
                            title: "4",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 4, element.id);
                            },
                        },
                        {
                            title: "5",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 5, element.id);
                            },
                        },
                        {
                            title: "6",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 6, element.id);
                            },
                        },
                        {
                            title: "7",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 7, element.id);
                            },
                        },
                        {
                            title: "8",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 8, element.id);
                            },
                        },
                    ],
            },
            {
                title: "rename",               // J.E.
                action: function () {
                    element.renameModule(element.constructor.name, element.x, element.y, element.id);
                },
            },
            {
                divider: true,
            },
            {
                title: 'delete',
                action: function () {
                    deleteSelection(getSelection(element)); //J.E.
                }
            }
        ];
    //open the context menu
    d3.contextMenu(menu)();
}

//#endregion

//#region classes

/** K.F.
 * converts a raw text into a further processable equation and filters variables and result variables 
 */
class Parser {
    /**
     * initializes all variables and calls the necessary methods to make the raw text usable
     * @param {String} text the raw text that should be made usable
     */
    constructor(text) {
        this.array;
        this.input;
        this.vars;
        try {
            this.input = changeOperator(text);
            this.input = changeSpaces(this.input);
            this.array = checkInputOnEquals(this.input);
            this.input = removeResultName(this.array);
            this.vars = varFilter(this.input);
            this.vars.pop();
            this.array[0] = checkResultName(this.vars, this.array[0], this.array[2]);
            this.equation = this.formEquation(this.array[1]);
            this.addBrackets(this.equation);
        }
        catch (e) {
            throw (e);
        }
    }

    /**
     * converts the given string to an array and merges variables
     * @param {String} text the text to be handled
     */
    formEquation(text) {
        //convert string to an array, combine variables
        var equation = new Array();
        var variableList = new Array();
        var delimiter = [" ", "(", ")", "ᴧ", "ᴠ", "¬", "⊕", "⊙", "↑", "↓", "="];
        var variable;
        for (var i = 0; i < text.length; i++) {
            if (delimiter.includes(text[i])) {
                if (variable != null) {
                    equation.push(variable);
                    variableList.push(variable);
                    variable = null;
                }
                if (text[i] != " ") {
                    equation.push(text[i]);
                }
            }
            else {
                if (variable == null) {
                    variable = text[i];
                }
                else {
                    variable = variable.concat(text[i]);
                }

            }

        }
        if (variable != null) {
            equation.push(variable);
            variableList.push(variable);
            variable = null;
        }
        return equation;
    }

    /**
     * adds brackets to preserve the logical calculation rules
     * @param {String[]} equation 
     */
    addBrackets(equation) {
        var delimiter = [" ", "(", ")", "ᴧ", "ᴠ", "¬", "⊕", "⊙", "↑", "↓", "="];

        //handle ! (NOT)
        for (var i = 0; i < equation.length; i++) {
            if (equation[i] == "¬") {
                if (equation[i + 1] == "(") {
                    var openBrackets = 0;
                    for (var j = i; j < equation.length; j++) {
                        if (equation[j] == "(") {
                            openBrackets++;
                        }
                        if (equation[j] == ")") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, "¬");
                                equation.splice(j + 2, 0, ")");
                                equation.splice(i, 1, "(");
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }
                else if ((i > 0 && !delimiter.includes(equation[i - 1]))) {
                    equation.splice(i - 1, 0, "(");
                    i++;
                    equation.splice(i + 1, 0, ")");
                    i++;
                }
                else if (i + 1 < equation.length && !delimiter.includes(equation[i + 1])) // !a
                {
                    equation.swap(i, i + 1);
                    i = -1; //reset
                }
                else if (equation[i - 1] == ")" && delimiter.includes(equation[i + 1])) //(a and b)!
                {
                    var openBrackets = 0;
                    for (var j = i; j >= 0; j--) {
                        if (equation[j] == ")") {
                            openBrackets++;
                        }
                        if (equation[j] == "(") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, "(");
                                i++;
                                equation.splice(i + 1, 0, ")");
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }
            }
        }

        //handle & (AND)
        for (var i = 0; i < equation.length; i++) {
            if (equation[i] == "ᴧ") {
                if (equation[i - 1] != ")") {
                    equation.splice(i - 1, 0, "(");
                    i++;
                }
                else {
                    var openBrackets = 0;
                    for (var j = i; j >= 0; j--) {
                        if (equation[j] == ")") {
                            openBrackets++;
                        }
                        if (equation[j] == "(") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, "(");
                                i++;
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }

                if (equation[i + 1] != "(") {
                    equation.splice(i + 2, 0, ")");
                    i++;
                }
                else {
                    var openBrackets = 0;
                    for (var j = i; j < equation.length; j++) {
                        if (equation[j] == "(") {
                            openBrackets++;
                        }
                        if (equation[j] == ")") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, ")");
                                i++;
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }
            }
        }

        // handle | (OR)
        for (var i = 0; i < equation.length; i++) {
            if (equation[i] == "ᴠ") {
                if (equation[i - 1] != ")") {
                    equation.splice(i - 1, 0, "(");
                    i++;
                }
                else {
                    var openBrackets = 0;
                    for (var j = i; j >= 0; j--) {
                        if (equation[j] == ")") {
                            openBrackets++;
                        }
                        if (equation[j] == "(") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, "(");
                                i++;
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }

                if (equation[i + 1] != "(") {
                    equation.splice(i + 2, 0, ")");
                    i++;
                }
                else {
                    var openBrackets = 0;
                    for (var j = i; j < equation.length; j++) {
                        if (equation[j] == "(") {
                            openBrackets++;
                        }
                        if (equation[j] == ")") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, ")");
                                i++;
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }
            }
        }

        return equation;
    }

    /**
     * returns a list of strings representing the variables in the equation
     */
    getVariables() {
        return this.vars;
    }

    /**
     * returns the result variable
     */
    getResult() {
        return this.array[0];
    }

    /**
     * returns the equation as a list of strings 
     */
    getEquation() {
        return this.equation;
    }
}

/** W.A.
 * keeps list of the currently generated connections
 */
class ConnectionManager {
    /**
     * This class is written as a singleton. Only one Instance can be made. If there is already an instance the constructor will return it.
     */
    constructor() {
        if (!ConnectionManager.instance) {
            this.connectionList = new Array();
            ConnectionManager.instance = this;
        }
        return ConnectionManager.instance;
    }

    /**
     * adds the line to the connection list
     * @param {CONNECTION} line the module to be add
     */
    addConnection(line) {
        this.connectionList.push(line);
    }

    /**
     * removes the given CONNECTION from the connection list
     * @param {CONNECTION} line the module to be removed
     */
    removeConnection(line) {
        this.connectionList.splice(this.connectionList.indexOf(line), 1);
    }

    /**
     * returns a list of all currently generated CONNECTIONS
     */
    getConnectionList() {
        return this.connectionList;
    }
}

/** K.F.
 * keeps list of the currently generated modules
 */
class ModuleManager {
    /**
     * This class is written as a singleton. Only one Instance can be made. If there is already an instance the constructor will return it.
     */
    constructor() {
        if (!ModuleManager.instance) {
            this.moduleList = new Array();
            ModuleManager.instance = this;
        }
        return ModuleManager.instance;
    }

    /**
     * adds the given module to the module list
     * @param {Module} module the module to be add
     */
    addModule(module) {
        this.moduleList.push(module);
    }

    /**
     * removes the given Module from the module list
     * @param {Module} module the module to be removed
     */
    removeModule(module) {
        this.moduleList.splice(this.moduleList.indexOf(module), 1);
    }

    /**
     * returns a list of all currently generated Modules
     */
    getModuleList() {
        return this.moduleList;
    }
}

/**
 * The EventManager is to be notified when the user hovers over a connection Point with the mouse.
 * This event can be queried in order to find the object to be connected with a CONNECTION
 */
class EventManager {
    /**
     * This class is written as a singleton. Only one Instance can be made. If there is already an instance the constructor will return it.
     */
    constructor() {
        if (!EventManager.instance) {
            this.lastEventElement = null;
            this.elementInput = 0;
            EventManager.instance = this;
        }
        return EventManager.instance;
    }

    /**
     * directs the EventManager to the given element
     * @param {Module} eventElement The module which triggered the event
     * @param {number} inputIndex The Index of the input which triggered the Event
     */
    setEventElement(eventElement, inputIndex) {
        this.lastEventElement = eventElement;
        this.elementInputIndex = inputIndex; // 1 oben, 2 unten
    }

    /**
     * returns the object that last reported an event
     */
    getLastEventElement() {
        return this.lastEventElement;
    }

    /**
     * returns the index of the input of the object that last reported an event
     */
    getElementInputIndex() {
        return this.elementInputIndex;
    }
}

/** K.F./W.A.
 * This class is the basis of every logic module. It contains the most important methods
 */
class Module {
    /**
     * Creates a new module and initializes most class variables with a default value
     * @param {number} x the x position in which the module is to be set 
     * @param {number} y the y position in which the module is to be set 
     */
    constructor(x, y) {
        this.classname = this.constructor.name;    
        this.x = nextGridPoint(x);
        this.y = nextGridPoint(y);
        this.id = modulID;
        modulID++;
        this.width = 30;
        this.height = 30;
        this.maxInputCount = 2;
        this.maxOutputCount = 1;
        this.outputOffset = [];
        this.inputOffset = [];
        this.connectionPointRadius = 3;
        this.sizeStrokeWidth = 3;
        this.formRadius = 1;
        this.group = null;
        this.input = new Array();
        this.output = new Array();
        this.text = '';
        this.negation = false;
        this.value = false;
        this.selected = false; //J.E.
        new ModuleManager().addModule(this);
    }

    /** W.A./J.E.
    * Calculates position of input-circles + adding to inputOffset, Combining positions to array
    */
    calcInputOffset() {
        var oddNumbered = Boolean(this.maxInputCount%2);
        var middlePosition = this.maxInputCount/2;
        var j = 0;
        for(var i = 0; i <= this.maxInputCount; i++) {
            if(oddNumbered || i != middlePosition) {
                this.inputOffset[j] = [0, gridSize * (i + 1)];  
                j++;
            }
        }
    }

    /** W.A.
    * Calculates position of input-circles + adding to inputOffset
    * @param {boolean} negation indicates whether a negation should be appended
    */
    calcOutputOffset(negation) {
        if (negation) {
            this.outputOffset = [this.width, this.height / 2];//for old inverse output offset this.height / 2 + 5
        }

        else {
            this.outputOffset = [this.width, this.height / 2];
        }
    }

    /** K.F.
     * builds the module in the SVG element based on the set class variables
     * @param {String} text the text to be written in the module
     * @param {boolean} negation indicates whether a negation should be appended
     * @param {boolean} activatable indicates whether the module should be activated when clicked
     */
    build(text, negation, activatable) 
    {
        var thisElement = this;
        this.text = text;
        this.negation = negation;
        this.activatable = activatable;

        this.value = false;
        this.group = d3.select("svg").append("g");      // Creates SVG-element
        this.group.append("rect")                       // Shape-attributes of module (rectangle)
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", this.formRadius)
            .attr("ry", this.formRadius)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("fill", "transparent")
            .attr("stroke", colorStandard);

        this.group.append("text")                       // Text-attributes of module
            .attr("x", this.width / 2 - text.length * 5)
            .attr("y", this.height / 2 + 5)
            .attr("fill", colorStandard)
            .text(text)
            .style("font-family", "arial");

        if (negation)                                    // If module with negation -> create circle for negation 
        {
            this.value = true;

            this.group.select("text").attr("fill", colorActive);
            this.group.select("rect").attr("stroke", colorActive);

            this.group.append("circle")
                .attr("cx", this.width)//for old output negation + 5
                .attr("cy", this.height / 2)
                .attr("r", 5)
                .attr("fill", "white")//for old negated output visualisation "transparent"
                .attr("stroke", colorStandard);
        }

        for (var i = 0; i < this.maxOutputCount; i++)   // Creates output-circles
        {
            this.group.append("circle")
                .attr("cx", this.outputOffset[0])
                .attr("cy", this.outputOffset[1])
                .attr("r", this.connectionPointRadius)
                .attr("fill", colorConnectionPoints)
                .attr("stroke", "transparent")
                .attr("stroke-width", this.sizeStrokeWidth)
                .on("mouseover", function () { d3.select(this).attr("fill", colorActive).attr("stroke", colorActive) })
                .on("mouseout", function () { d3.select(this).attr("fill", colorConnectionPoints).attr("stroke", "transparent") })
                .call(d3.drag()
                    .on("start", function () {
                        var startX = thisElement.getX() + thisElement.outputOffset[0];
                        var startY = thisElement.getY() + thisElement.outputOffset[1];
                        var connection = new CONNECTION([startX, startX, startX, startX], [startY, startY, startY, startY]);
                        connection.setInput(thisElement);
                        if (thisElement.value) {
                            thisElement.output.push(connection.setValue(true));
                        }
                        else {
                            thisElement.output.push(connection.setValue(false));
                        }
                    })
                    .on('drag', function () { dragConnection(thisElement.output[thisElement.output.length - 1]); })
                    .on("end", function () {
                        if (!connect(null, thisElement.output[thisElement.output.length - 1], new EventManager().getLastEventElement(), new EventManager().getElementInputIndex())) {
                            thisElement.output.pop().delete();
                        }
                        else {
                            thisElement.output[thisElement.output.length - 1].output.checkActivated();
                            thisElement.output[thisElement.output.length - 1].latch(); //J.E.
                        }
                    })
                );
        }

        var inputIndexList = new Array(this.maxInputCount);
        for (var i = 0; i < this.maxInputCount; i++)         // Creates input-circles
        {
            inputIndexList[i] = i;
            this.group.append("circle")
                .attr("cx", this.inputOffset[i][0])
                .attr("cy", this.inputOffset[i][1])
                .attr("r", this.connectionPointRadius)
                .attr("fill", colorConnectionPoints)
                .attr("stroke", "transparent")
                .attr("stroke-width", this.sizeStrokeWidth)
                .attr("class", "input");
        }
        this.group.selectAll(".input")
            .data(inputIndexList)
            .on("mouseover", function (d) { new EventManager().setEventElement(thisElement, d); d3.select(this).attr("fill", colorActive).attr("stroke", colorActive) })
            .on("mouseout", function (d) { new EventManager().setEventElement(null, d); d3.select(this).attr("fill", colorConnectionPoints).attr("stroke", "transparent") })//input[0]

        this.group.attr('transform', 'translate(' + this.x + ',' + this.y + ')');
        this.group.on("contextmenu", function () { d3.event.preventDefault(); menuLogic(thisElement) });
        this.group.call(d3.drag()
            .on('drag', function () { dragMove(getSelection(thisElement), true) })
            .on("end", function () { dragMove(getSelection(thisElement), false) }));

        if (activatable) 
        {
            this.group.on("click", function () 
            { 
                if (globalDeleteActive) { thisElement.delete() } 
                else { thisElement.checkActivated(); } 
            });
        }
        else 
        {
            this.group.on("click", function () 
            { 
                if (globalDeleteActive) { thisElement.delete() } 
            });
        }
    }

    /** K.F.
    * Adds inputs as new array
    */
    addsInputToArray() {
        for (var i = 0; i < this.maxInputCount; i++) {
            this.input.push(new Array);
        }
    }

    /** K.F.
     * moves the module to the given coordinates
     * @param {number} x target x coordinate
     * @param {number} y target y coordinate
     */
    move(x, y) {
        this.group.attr('transform', 'translate(' + x + ',' + y + ')');
        this.x = x;
        this.y = y;
    }

    /** K.F.
     * shifts the module by the specified values
     * @param {number} dx shift in x direction
     * @param {number} dy shift in y direction
     */
    dMove(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.group.attr('transform', 'translate(' + nextGridPoint(this.x) + ',' + nextGridPoint(this.y) + ')');
    }

    /** K.F.
     * returns the current position in x direction
     */
    getX() {
        return this.x;
    }

    /** K.F.
     * returns the current position in y direction
     */
    getY() {
        return this.y;
    }

    /** K.F.
     * deletes the module and its connections
     */
    delete() {
        for (var i = this.input.length - 1; i >= 0; i--) {
            for (var j = this.input[i].length - 1; j >= 0; j--) {
                this.input[i][j].delete();
                //this.input[i].pop().delete();
            }
        }
        while (this.output.length > 0) {
            var temp = this.output[0].output;
            this.output[0].delete();
            temp.checkActivated();
            temp = null;
        }
        new ModuleManager().removeModule(this);
        this.group.remove();
    }

    /** K.F.
     * checks whether the module needs to be activated
     * @param {boolean} activate
     */
    activateInactivate(activate) {
        if (activate) {
            this.value = true;
            if (this.output.length > 0) {
                for (var i = 0; i < this.output.length; i++) {
                    this.output[i].setValue(true);
                }
            }
            this.group.select("text").attr("fill", colorActive);
            this.group.select("rect").attr("stroke", colorActive);
        }
        else {
            this.value = false;
            if (this.output.length > 0) {
                for (var i = 0; i < this.output.length; i++) {
                    this.output[i].setValue(false);
                }
            }
            this.group.select("text").attr("fill", colorStandard);
            this.group.select("rect").attr("stroke", colorStandard);
        }
    }

    /** K.F.
     * toggles the value and the color of the module
     *
    toggleActivate() {
        return;
    }*/

    /** K.F.
     * returns the offset of the output connectionpoint
     */
    getOutputOffset() {
        return this.outputOffset;
    }

    /** K.F.
     * returns the offset of the input connectionpoint at index
     * @param {number} index indicates the input
     */
    getInputOffset(index) {
        return this.inputOffset[index];
    }

    /** K.F.
     * replaces this module with another module
     * @param {Module} newModule the module with which it is to be replaced
     */
    replace(newModule, oldID) {
        var thisElement = this;
        newModule.id = oldID;
        //inputs:
        for (var i = 0; i < thisElement.input.length && i < newModule.maxInputCount; i++) {
            for (var j = 0; j < thisElement.input[i].length; j++) {
                var oldConnection = thisElement.input[i][j];
                var newConnection = new CONNECTION([oldConnection.input.getX() + oldConnection.input.getOutputOffset()[0], oldConnection.input.getX() + oldConnection.input.getOutputOffset()[0], thisElement.getX() + thisElement.getInputOffset(i)[0] ,thisElement.getX() + thisElement.getInputOffset(i)[0]], [oldConnection.input.getY() + oldConnection.input.getOutputOffset()[1], oldConnection.input.getY() + oldConnection.input.getOutputOffset()[1], thisElement.getY() + thisElement.getInputOffset(i)[1], thisElement.getY() + thisElement.getInputOffset(i)[1]]);
                newConnection.setInput(oldConnection.input);
                var value = false;
                if (oldConnection.value) {
                    value = true;
                }
                connect(oldConnection.input, newConnection, newModule, i, value);
            }
        }
        //outputs:
        for (var i = 0; i < thisElement.output.length && i < newModule.maxOutputCount; i++) {
            var oldConnection = thisElement.output[i];
            var newConnection = new CONNECTION([newModule.x + newModule.getOutputOffset()[0], newModule.x + newModule.getOutputOffset()[0], oldConnection.output.getX() + oldConnection.output.getInputOffset(oldConnection.outputInputIndex)[0], oldConnection.output.getX() + oldConnection.output.getInputOffset(oldConnection.outputInputIndex)[0]], [newModule.y + newModule.getOutputOffset()[1], newModule.y + newModule.getOutputOffset()[1], oldConnection.output.getY() + oldConnection.output.getInputOffset(oldConnection.outputInputIndex)[1], oldConnection.output.getY() + oldConnection.output.getInputOffset(oldConnection.outputInputIndex)[1]]);
            connect(newModule, newConnection, oldConnection.output, oldConnection.outputInputIndex, 0);
        }
        newModule.checkActivated();
        thisElement.delete();
    }
    /** W.A.
     * changes the number of the module's inputs
     * @param {string} classname name of the modul's subclass
     * @param {number} x x position of module
     * @param {number} y y position of module
     * @param {number} inputCount new number of the module's inputs
     */
    changeInputNumber(classname, x, y, inputCount, oldID) {
        eval("this.replace(new " + classname + "(x, y, inputCount), oldID);");
    }

    /** K.F.
     * adds an element to the output list
     * @param {CONNECTION} element the element to be added
     */
    addOutput(element) {
        this.output.push(element);
    }

    /** J.E.
     * enables renaming of an OUTPUT or INPUT
     * @param {string} classname name of the modul's subclass
     * @param {number} x x position of module
     * @param {number} y y position of module
     * @param {number} inputCount new number of the module's inputs
     */
    renameModule(classname, x, y, oldID) {
        if(classname == "INPUT" || classname == "OUTPUT") {
            var name = window.prompt("Rename selected elemented to...", "");
            eval("this.replace(new " + classname + "(x, y, name), oldID);");
        } else {
            window.alert("Only Inputs and Outputs can be renamed, consider using replace option.");
        }
    }
}

/** J.E.
 * implements logic gates
 */
 class Logic extends Module {
    /**
     * sets all variables for a logic gate 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {number} inputCount the number of inputs is to be set
     */
    constructor(x, y, inputCount)                             
    {
        super(x, y);

        if (!inputCount)                                     
        {
            inputCount = 2;
        }
        this.maxInputCount = inputCount;
        this.maxOutputCount = 1;
        this.width = 30;
        this.height = gridSize * (inputCount + (inputCount+1)%2 + 1);
        this.calcOutputOffset(false);
        this.calcInputOffset();                            
    }
}

/** K.F./W.A.
 * implements a Module as an AND module
 */
class AND extends Logic {
    /**
     * sets all variables for an AND module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {number} inputCount the number of inputs is to be set
     */
    constructor(x, y, inputCount)                             
    {
        super(x, y, inputCount);                            
        this.build("&", false);
        this.addsInputToArray();                                
    }

    checkActivated() {
        var activate = true;

        for (var i = 0; i < this.input.length; i++) {
            var oneConnectionActive = false;
            for (var j = 0; j < this.input[i].length; j++) {
                if (this.input[i][j].value) {
                    oneConnectionActive = true;
                }
            }
            if (!oneConnectionActive) {
                activate = false;
            }
        }
        this.activateInactivate(activate);                  
    }
}

/** K.F./W.A.
 * implements a Module as an NAND module
 */
class NAND extends Logic {
    /**
     * sets all variables for an NAND module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {number} inputCount the number of inputs is to be set
     * @param {number} oldID id of old element in case of replacement
     */
    constructor(x, y, inputCount)                        
    {
        super(x, y, inputCount);                           
        this.build("&", true);
        this.addsInputToArray();                            
    }

    checkActivated() {
        var activate = false;

        for (var i = 0; i < this.input.length; i++) {
            var oneConnectionActive = false;
            for (var j = 0; j < this.input[i].length; j++) {
                if (this.input[i][j].value) {
                    oneConnectionActive = true;
                }
            }
            if (!oneConnectionActive) {
                activate = true;
            }
        }
        this.activateInactivate(activate);                      
    }
}

/** K.F./W.A.
 * implements a Module as an OR module
 */
class OR extends Logic {
    /**
     * sets all variables for an OR module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {number} inputCount the number of inputs is to be set
     */
    constructor(x, y, inputCount)                             
    {
        super(x, y, inputCount);                           
        this.build("≥1", false);
        this.addsInputToArray();                            
    }

    checkActivated() {
        var activate = false;
        for (var i = 0; i < this.input.length; i++) {
            for (var j = 0; j < this.input[i].length; j++) {
                if (this.input[i][j].value) {
                    activate = true;
                }
            }
        }
        this.activateInactivate(activate);                  
    }
}

/** K.F./W.A.
 * implements a Module as an NOR module
 */
class NOR extends Logic {
    /**
     * sets all variables for an NOR module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {number} inputCount the number of inputs is to be set
     */
    constructor(x, y, inputCount)                             
    {
        super(x, y, inputCount);                          
        this.build("≥1", true);
        this.addsInputToArray();                            
    }

    checkActivated() {
        var activate = true;

        for (var i = 0; i < this.input.length; i++) {
            var oneConnectionActive = true;
            for (var j = 0; j < this.input[i].length; j++) {
                if (this.input[i][j].value) {
                    oneConnectionActive = false;
                }
            }
            if (!oneConnectionActive) {
                activate = false;
            }
        }
        this.activateInactivate(activate);                   
    }
}

/** J.E.
 * implements a Module as an XOR module
 */
class XOR extends Logic {
    /**
     * sets all variables for an XOR module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {number} inputCount the number of inputs is to be set
     */
    constructor(x, y, inputCount)                             
    {
        super(x, y, inputCount);                           
        this.build("=1", false);
        this.addsInputToArray();                            
    }

    checkActivated() {
        var activate = false;

        for (var i = 0; i < this.input.length; i++) {
            var oneConnectionActive = false;
            for (var j = 0; j < this.input[i].length; j++) {
                if (this.input[i][j].value) {
                    oneConnectionActive = true;
                }
            }
            if(oneConnectionActive) {
                activate = !activate;
            }
        }
        this.activateInactivate(activate);                   
    }
}

/** J.E.
 * implements a Module as an XNOR module
 */
 class XNOR extends Logic {
    /**
     * sets all variables for an XNOR module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {number} inputCount the number of inputs is to be set
     */
    constructor(x, y, inputCount)                             
    {
        super(x, y, inputCount);                           
        this.build("=1", true);
        this.addsInputToArray();                            
    }

    checkActivated() {
        var activate = true;

        for (var i = 0; i < this.input.length; i++) {
            var oneConnectionActive = false;
            for (var j = 0; j < this.input[i].length; j++) {
                if (this.input[i][j].value) {
                    oneConnectionActive = true;
                }
            }
            if(oneConnectionActive) {
                activate = !activate;
            }
        }
        this.activateInactivate(activate);                    
    }
}

/** K.F./W.A.
 * implements a Module as an NOT module
 */
class NOT extends Module {
    /**
     * sets all variables for an NOT module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     */
    constructor(x, y) {
        super(x, y);

        this.maxInputCount = 1;
        this.maxOutputCount = 1;
        this.width = 30;
        this.height = 30;

        this.calcOutputOffset(true);                        
        this.calcInputOffset();                             
        this.build("1", true);
        this.addsInputToArray();                            
    }

    checkActivated() {
        var activate = true;
        for (var i = 0; i < this.input.length; i++) {
            for (var j = 0; j < this.input[i].length; j++) {
                if (this.input[i][j].value) {
                    activate = false;
                }
            }
        }
        this.activateInactivate(activate);                  
    }
}

/** K.F./W.A.
 * implements a Module as an OUTPUT module
 */
class OUTPUT extends Module {
    /**
     * sets all variables for an OUTPUT module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {String} name the text to be shown in the output module
     */
    constructor(x, y, name) {
        super(x, y);

        if (!name) {
            name = "OUT"; //+ outputCount;
            outputCount++;                                  
        }

        this.maxInputCount = 1;
        this.maxOutputCount = 0;
        this.input.push(new Array);
        this.width = ((name.length * 8) + 15);
        this.height =  gridSize * (inputCount + (inputCount+1)%2 + 1);

        this.calcInputOffset();                             
        this.build(name, false);

    }

    checkActivated() {
        var activate = false;
        for (var i = 0; i < this.input.length; i++) {
            for (var j = 0; j < this.input[i].length; j++) {
                if (this.input[i][j].value) {
                    activate = true;
                }
            }
        }
        if (activate) {
            this.value = true;
            this.group.select("rect").attr("stroke", colorActive);
            this.group.select("text").attr("fill", colorActive);
        }
        else {
            this.value = false;
            this.group.select("rect").attr("stroke", colorStandard);
            this.group.select("text").attr("fill", colorStandard);
        }
    }
}

/** K.F./W.A.
 * implements a Module as an INPUT module
 */
class INPUT extends Module {
    /**
     * sets all variables for an INPUT module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {String} name the text to be shown in the input module
     */
    constructor(x, y, name) {
        super(x, y);

        if (!name) {
            name = "IN"; //+ inputCount;
            inputCount++;                                   
        }
        
        this.maxInputCount = 0;
        this.maxOutputCount = 1;

        this.width = (Math.round(((name.length * 8) + 15)/gridSize)*gridSize);
        this.height = 30;

        this.calcOutputOffset(false);                       
        this.build(name, false, true);
    }

    checkActivated() {
        if (!this.value) {
            this.group.select("rect").attr("stroke", colorActive);
            this.group.select("text").attr("fill", colorActive);
            this.value = true;
            for (var i = 0; i < this.output.length; i++) {
                this.output[i].setValue(true);
            }
        }
        else {
            this.group.select("rect").attr("stroke", colorStandard);
            this.group.select("text").attr("fill", colorStandard);
            this.value = false;
            for (var i = 0; i < this.output.length; i++) {
                this.output[i].setValue(false);
            }
        }
    }
}

/** K.F./J.E.
 * acts as a connection element between modules
 */
class CONNECTION {
    /**
     * creates a connection based on the given parameters
     * @param {Array} gridPointsX the x coordinates of the points that define the Connection
     * @param {Array} gridPointsY the y coordinates of the points that define the Connection
     */
    constructor(gridPointsX, gridPointsY) {
        var thisElement = this;
        var branchStartX;
        var branchStartY;
        var connection;

        this.classname = this.constructor.name;
        this.outputInputIndex;
        this.parent = null;
        this.input = null;
        this.output = null;
        this.inputID = null;
        this.outputID = null;
        this.branches = [];
        this.gridPointsX = gridPointsX;
        this.gridPointsY = gridPointsY;
        this.path = d3.select("svg").append("path")
            .attr("d", "M" + this.gridPointsX[0] + " " + this.gridPointsY[0] + " L" + this.gridPointsX[1] + " " + this.gridPointsY[1] + " L" + this.gridPointsX[2] + " " + this.gridPointsY[2] + " L" + this.gridPointsX[this.gridPointsX.length - 1] + " " + this.gridPointsY[this.gridPointsY.length - 1])
            .attr("stroke", colorStandard)
            .attr("fill", "none")
            .attr("stroke-width", "2px")
            .on("mousedown", function () {
                branchStartX = nextGridPoint(d3.mouse(this)[0]);
                branchStartY = nextGridPoint(d3.mouse(this)[1]);
            })
            .on("mouseover", function () { if (thisElement.output != null) { d3.select(this).attr("stroke-width", "4px"); if (thisElement.value) { d3.select(this).attr("stroke", colorActive) } else { d3.select(this).attr("stroke", colorConnectionPoints) } } })
            .on("mouseout", function () { d3.select(this).attr("stroke-width", "2px"); if (thisElement.value) { d3.select(this).attr("stroke", colorActive) } else { d3.select(this).attr("stroke", colorStandard) } })
            .on("contextmenu", function () { d3.event.preventDefault(); thisElement.delete(true) })
            .on("click", function () { if (globalDeleteActive) { thisElement.delete(true) } })
            .call(d3.drag()//J.E.
                .on("start", function () {
                    connection = new CONNECTION([branchStartX, branchStartX, branchStartX, branchStartX], [branchStartY, branchStartY, branchStartY, branchStartY])
                    connection.setInput(thisElement.input);
                    connection.parent = thisElement;
                    if (thisElement.input.value) {
                        thisElement.input.output.push(connection.setValue(true));
                    }
                    else {
                        thisElement.input.output.push(connection.setValue(false));
                    }
                })
                .on('drag', function () { dragConnection(thisElement.input.output[thisElement.input.output.length - 1]); })
                .on("end", function () {
                    if (!connect(null, thisElement.input.output[thisElement.input.output.length - 1], new EventManager().getLastEventElement(), new EventManager().getElementInputIndex())) {
                        thisElement.input.output.pop().delete();
                    }
                    else {
                        connection.output.checkActivated();
                        thisElement.addBranch(connection);
                        connection.latch();
                    }
                })
            );
        this.path.moveToBack();
        new ConnectionManager().addConnection(this);
    }

    /**
     * moves the end of the connection to the given coordinates
     * @param {number} x target x coordinate
     * @param {number} y target y coordinate
     */
    moveEnd(x, y) {
        this.gridPointsX[this.gridPointsX.length - 1] = x;
        this.gridPointsY[this.gridPointsY.length - 1] = y;
        this.gridPointsY[2] = y;
        this.path.attr("d", "M" + this.gridPointsX[0] + " " + this.gridPointsY[0] + " L" + this.gridPointsX[1] + " " + this.gridPointsY[1] + " L" + this.gridPointsX[2] + " " + this.gridPointsY[2] + " L" + this.gridPointsX[this.gridPointsX.length - 1] + " " + this.gridPointsY[this.gridPointsY.length - 1]);
        this.path.moveToBack();
    }

    /**
     * moves the start of the connection to the given coordinates
     * @param {number} x target x coordinate
     * @param {number} y target y coordinate
     */
    moveStart(x, y) {
        this.gridPointsX = [x, x + gridSize, x + gridSize, 0];
        this.gridPointsY = [y, y, 0, 0];
        this.path.attr("d", "M" + this.gridPointsX[0] + " " + this.gridPointsY[0] + " L" + this.gridPointsX[1] + " " + this.gridPointsY[1] + " L" + this.gridPointsX[2] + " " + this.gridPointsY[2] + " L" + this.gridPointsX[this.gridPointsX.length - 1] + " " + this.gridPointsY[this.gridPointsY.length - 1]);
        this.path.moveToBack();
    }

    /**
     * shifts the end of the connection by the specified values
     * @param {number} dx shift in x direction
     * @param {number} dy shift in y direction
     */
    dMoveEnd(dx, dy) {
        this.gridPointsX[this.gridPointsX.length - 1] += dx;
        this.gridPointsY[this.gridPointsY.length - 1] += dy;
        this.gridPointsY[2] = this.gridPointsY[this.gridPointsY.length - 1];
        if(this.parent == null && nextGridPoint(this.gridPointsY[0]) == nextGridPoint(this.gridPointsY[this.gridPointsY.length - 1])) {
            this.gridPointsX[1] = this.gridPointsX[0] + gridSize;
            this.gridPointsX[2] = this.gridPointsX[0] + gridSize;
        }
        this.path.attr("d", "M" + nextGridPoint(this.gridPointsX[0]) + " " + nextGridPoint(this.gridPointsY[0]) + " L" + nextGridPoint(this.gridPointsX[1]) + " " + nextGridPoint(this.gridPointsY[1]) + " L" + nextGridPoint(this.gridPointsX[2]) + " " + nextGridPoint(this.gridPointsY[2]) + " L" + nextGridPoint(this.gridPointsX[this.gridPointsX.length - 1]) + " " + nextGridPoint(this.gridPointsY[this.gridPointsY.length - 1]));
        this.path.moveToBack();
    }

    /**
     * shifts the start of the connection by the specified values
     * @param {number} dx shift in x direction
     * @param {number} dy shift in y direction
     */
    dMoveStart(dx, dy) {
        var startPoint = this.input.x + this.input.getOutputOffset()[0] + gridSize;
        if(this.parent == null) {
            this.gridPointsX[0] += dx;
            this.gridPointsY[0] += dy;
            if(nextGridPoint(this.gridPointsY[0]) == nextGridPoint(this.gridPointsY[this.gridPointsY.length - 1]) || this.gridPointsX[1] <= startPoint) {
                this.gridPointsX[1] = startPoint;
            }
        } else {
            if(this.gridPointsX[0] <= startPoint) {
                this.gridPointsX[0] = startPoint;
                this.gridPointsX[1] = this.gridPointsX[0];
            }
            if(this.gridPointsX[0] < nextGridPoint(this.parent.gridPointsX[1]) && nextGridPoint(this.gridPointsY[0]) != nextGridPoint(this.parent.gridPointsY[0])) {
                this.gridPointsY[0] = nextGridPoint(this.parent.gridPointsY[0]);
            } else if(this.gridPointsX[0] > nextGridPoint(this.parent.gridPointsX[2]) && nextGridPoint(this.gridPointsY[0]) != nextGridPoint(this.parent.gridPointsY[2])) {
                this.gridPointsY[0] = nextGridPoint(this.parent.gridPointsY[2]);
            } else if(this.gridPointsX[0] == nextGridPoint(this.parent.gridPointsX[2])) {
                var upperEnd = nextGridPoint(Math.min(this.parent.gridPointsY[1], this.parent.gridPointsY[2]));
                var lowerEnd = nextGridPoint(Math.max(this.parent.gridPointsY[1], this.parent.gridPointsY[2]));  
                if(this.gridPointsY[2] < upperEnd) {
                    this.gridPointsY[0] = upperEnd;
                } else if(this.gridPointsY[2] > lowerEnd) {
                    this.gridPointsY[0] = lowerEnd;
                }
            }
        }
        this.gridPointsX[2] = this.gridPointsX[1];
        this.gridPointsY[1] = this.gridPointsY[0];
        this.path.attr("d", "M" + nextGridPoint(this.gridPointsX[0]) + " " + nextGridPoint(this.gridPointsY[0]) + " L" + nextGridPoint(this.gridPointsX[1]) + " " + nextGridPoint(this.gridPointsY[1]) + " L" + nextGridPoint(this.gridPointsX[2]) + " " + nextGridPoint(this.gridPointsY[2]) + " L" + nextGridPoint(this.gridPointsX[this.gridPointsX.length - 1]) + " " + nextGridPoint(this.gridPointsY[this.gridPointsY.length - 1]));
        this.path.moveToBack();
    }

    /** J.E.
     * connection points latch onto grid point after beeing dragged
     */
    latch() { 
        for(var i = 0; i < this.gridPointsX.length; i++) {
            this.gridPointsX[i] = nextGridPoint(this.gridPointsX[i]);
            this.gridPointsY[i] = nextGridPoint(this.gridPointsY[i]);
        }
        this.path.attr("d", "M" + this.gridPointsX[0] + " " + this.gridPointsY[0] + " L" + this.gridPointsX[1] + " " + this.gridPointsY[1] + " L" + this.gridPointsX[2] + " " + this.gridPointsY[2] + " L" + this.gridPointsX[this.gridPointsX.length - 1] + " " + this.gridPointsY[this.gridPointsY.length - 1]);
        this.path.moveToBack();
    }

    /**
     * deletes this connection
     * @param {boolean} [setValue] indicates wether the value should first set to false 
     */
    delete(resetValue) {
        if (this.output != null) {
            try {
                if (resetValue) {
                    this.setValue(false);
                }
            }
            catch
            {

            }
            var index = new Array();
            index.push(new Array());
            index.push(new Array()); // [[i][j]]

            for (var i = 0; i < this.output.input.length; i++) {
                var temp = this.output.input[i].indexOf(this);
                if (temp >= 0) {
                    index[0].push(i);
                    index[1].push(temp);
                }
            }
            for (var i = 0; i < index[0].length; i++) {
                this.output.input[index[0][i]].splice(index[1][i], 1)
            }
        }
        if (this.input != null) {
            var index = this.input.output.indexOf(this);
            if (index >= 0) {
                this.input.output.splice(index, 1);
            }
        }
        this.input = null;
        this.output = null;
        this.path.remove();
        if(this.parent != null) {
            this.parent.branches.splice(0, 1, this);
        }
        for(var i = 0; i < this.branches.length; i++) {
            this.branches[i].delete(true);
        }
        new ConnectionManager().removeConnection(this);
    }

    /**
     * sets the input to the given object and returns this connection
     * @param {Module} module the object which should be the new input
     */
    setInput(module) {
        this.input = module;
        this.inputID = module.id;
        return this; // returns itself for inline useage
    }

    /**
     * sets the value of the connection to the given value and returns this connection
     * @param {boolean} value the new value
     */
    setValue(value) {
        try {
            if (value != this.value) {
                if (value) {
                    this.path.attr("stroke", colorActive);
                }
                else {
                    this.path.attr("stroke", colorStandard);
                }
                this.value = value;
                if (this.output != null) {
                    this.output.checkActivated();
                }
            }
        }
        catch (e) {
            alert("An infinite loop was found, which may lead to incorrect results");
        }
        return this; // returns itself for inline useage
    }

    /**
     * sets the outputInputIndex to the given value
     * @param {number} index the index to which the variable should be set
     */
    setOutputInputIndex(index) {
        this.outputInputIndex = index;
    }

    /** J.E.
     * adds branch to old connection
     * @param {CONNECTION} newConnection the new connection to be defined as branch of old connection
     */
    addBranch(newConnection) {
        this.branches.push(newConnection);
    }
}

//#endregion