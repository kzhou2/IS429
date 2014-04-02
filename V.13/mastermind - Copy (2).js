
/*******************************************
 * 
 *    Mastermind with JavaScript
 *
 * Motivation
 *    Primarily this project was a way to explore JavaScript and see 
 *    what it could do.  The language itself is interesting - more 
 *    Perl-ish than I expected, though awkward at times - 
 *    but trying to figure out which pieces of the DOM will run
 *    on which platforms is a complete mess.  I've been using
 *    "JavaScript: the Definitive Guide, 4th Edition" as a reference.
 *
 * Author
 *    Jim Mahoney (mahoney@marlboro.edu)
 *    April 2003, version 1.2
 *
 * Tested platforms
 *    - Mozilla v1.3 Mac OS X 10.2.4    works (Testing primarily done here.)
 *    - Explorer 6.0 Windows XP         works
 *    - Safari beta1 v60 on Mac OS X    works
 *    - Explorer 5.2 Mac                fails (Problems inserting table rows.)
 * 
 * To Do
 *   - Put color choices into a pop-up menu.
 *   - Add user option to change number of columns (nColumns) 
 *     or colors (colorImages.length)
 *   - Make sure various window widths match columns, colors. (Somewhat done.)
 *   - More DOM testing for browser compatibility.
 *     (Partly done; see testTables.html in this directory.)
 *   - Move timer display to bottom right of board.
 *
 * Files
 *   mastermind.js     JavaScript source. (You're looking at it.)
 *   mastermind.html   Corresponding HTML source which loads mastermind.js
 *   testTables.html   DOM testing
 *   whitepixel.gif    1x1
 *   blackpixel.gif    1x1
 *   greybox.gif       8x8 black outline around grey interior
 *   <color>ball.gif   32x32 circles on white bkground
 *                     color = red,blue,brown,green,yellow,pink
 *
 ***********************/

var nColumns = 4;
var gameNumber = 1;
var startTimeMillis;
var timerIsRunning;
var lastElapsedTime;
var hiddenAnswer = [];     // what the user is trying to guess
var guessTr = null;        // null => is no "Guess" row; game is not running.
var lastGuess = [];        // what the user thinks is the answer.
var oldGuesses = [];       // guessTr row history displayed on screen
var messageTd;             // <td> block that holds user messages.
var boardTable;            // table that holds guesses and buttons
var blackLineTr;           // table row after guessTr
colorImages  = ['redball.gif',    'blueball.gif',    'brownball.gif',
                'greenball.gif',  'yellowball.gif',  'pinkball.gif' ];

// --------------------------------------------------------
// called when user clicks "New Game".
function newGame(){
    resetGame();
    gameNumber++;
    showMessage("<small>Starting the clock for game "+gameNumber+".</small>");
    runTimer();
}

// --------------------------------------------------------
// return a string like "10:02:23 pm".
function currentTime(){
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    var ampm = (h>=12)?"pm":"am";
    if (h>12) {h-=12;}
    if (h==0) {h=12;}
    if (m<10) {m="0"+m;}
    if (s<10) {s="0"+s;}
    return h+":"+m+":"+s+" "+ampm;
}

// --------------------------------------------------------
// return a string like "01:22" giving min, since game began.
function elapsedTimeAsString(){
    var d = new Date();
    var diff = d.getTime() - startTimeMillis;
    var h = Math.floor( diff/3600000 );
    var m = Math.floor( diff/60000 ) % 60;
    var s = Math.floor( diff/1000. ) % 60;
    if (h==0) {h="";} else {h=h+":";}
    if (m<10) {m="0"+m;}
    if (s<10) {s="0"+s;}
    return ""+h+m+":"+s;
}

// --------------------------------------------------------
// show the user the elapsed time and set lastElapsedTime
function showTimer(){
  lastElapsedTime = elapsedTimeAsString();
  defaultStatus = lastElapsedTime;
}

// --------------------------------------------------------
// This calls itself every second while the timer is going.
function runTimer(){
     if (timerIsRunning){
        showTimer();
        setTimeout("runTimer()", 1000); // repeat every second
     }
}

// --------------------------------------------------------
// display a message where the user can see it.
function showMessage(aString){
    messageTd.innerHTML = aString;
}

// --------------------------------------------------------
// Confirm that the user wants to quit the game, and if so
// show the hidden answer.
function showAnswer(){
    if ( guessTr == null ){
        alert("The game is stopped and the answer is visible.\n" + 
              "Click the 'New Game' link to start another.");
        return;
    }
    if (confirm("Would you like to quit this game\n and see the answer?")){
        for (var c=0; c<nColumns; c++){
            getColumnNImage(c).src = colorImages[hiddenAnswer[c]];
        }
        guessTr.childNodes[2*nColumns-1].innerHTML = "<b>Answer</b>";
        oldGuesses.push(guessTr);
        guessTr = null;
        timerIsRunning = false;
        showMessage("The game is over.");
    }
}

// --------------------------------------------------------
// Tell the user what the rules are.
function showHelp(){
    	
		for(var i1 = 0; i1 < 6; i1++){
		  for(var i2 = 0; i2 < 6; i2++){

			  for(var i3 = 0; i3 < 6; i3++){

				  for(var i4 = 0; i4 < 6; i4++){
					  lastGuess[0]=i1;
					  lastGuess[1]=i2;
					  lastGuess[2]=i3;
					  lastGuess[3]=i4;
					  getColumnNImage(0).src = colorImages[lastGuess[0]];
					  getColumnNImage(1).src = colorImages[lastGuess[1]];
					  getColumnNImage(2).src = colorImages[lastGuess[2]];
					  getColumnNImage(3).src = colorImages[lastGuess[3]];
					  checkGuess();
				  }			  
			  }
		  }
		}
}

// --------------------------------------------------------
// Sets up the globals and start game. Called from <body onload=>
function init(){
    boardTable  = document.getElementById('boardTable');
    blackLineTr = document.getElementById('blackLineTr');
    messageTd   = document.getElementById('messageTd');
    document.getElementById('blackHorizontalTd').setAttribute('colspan',
                                                              2*nColumns);
    resetGame();
    showMessage("<small>Game started at " + currentTime() + ".<p>\n" + 
                "The clock's ticking;<br>" +
                "click some colors and start guessing.</small>");
    runTimer();

    // --- initial annwer display ---     
    // var notice = "Answer is ";
    // for (var c=0; c<nColumns; c++){
    //   notice += hiddenAnswer[c] + " ";
    // }
    // alert(notice);
}
    
// --------------------------------------------------------
// return a random integer r, where 0<= r <= (n-1)
function getRandom(n){
    return Math.floor( n * Math.random() );
}

// --------------------------------------------------------
// clear all old guesses, reset timer, start timer.
function resetGame(){
    while (oldGuesses.length>0){
        boardTable.deleteRow( oldGuesses.pop().rowIndex );
    }
    for (var column=0; column<nColumns; column++){
        lastGuess[column] = -1;
        hiddenAnswer[column] = getRandom( colorImages.length );
    }
    timerIsRunning = true;
    var d = new Date();
    startTimeMillis = d.getTime();
    createOrClearGuessTr();
}

// --------------------------------------------------------
// This is called within a document.write() command from 
// the .html page when it first loads.
// It returns the <td>...</td> HTML for an array of 
// button images that the user can click on to specify his guess.
// Clicking on a button will call click(column,color), where
//  column = (0,1,2,..,nColumns-1) ,  
//  color = (0,...,colorImages.length-1)
function getButtonArrayHTML(){
    var result = "";
    var blackLineHeight = colorImages.length * 19;
    var whiteLineWidth  = nColumns * 22;
    for (var column=0; column<nColumns; column++){
        result += "<td align='center'><table>\n";
        for (color in colorImages) {
            result += "<tr><td><a href='javascript:click(" + column + 
                "," + color + ")'><img src='" + colorImages[color] + 
                "' border=0 width=16></a></td></tr>";
        }
        result += "</table></td>\n";
        if (column<nColumns-1){
            result += "<td><img height=" + blackLineHeight +" width=2 " + 
                "src='blackpixel.gif' border=0></td>\n";
        }
    }
    result += "<td align='right' valign='bottom'>"+
              "<img src='whitepixel.gif' width="+whiteLineWidth+"></td>";
              // + "<br><small>00:00</small></td>"
    return result;
}

// --------------------------------------------------------
// If the row where the user submits his guess isn't available, create it.
// If it is there, initialize it.
//   This function is the one that seems to have the biggest problems
//   on various different browsers, particularly the issue of how to add
//   rows to a table.  Here's how this one works, following (mostly) 
//   the DOM spec (except for innerHTML, which I only call on tableData).
//      * foo document.createElement('foo')        # to make TD's, TR's, etc.
//      * tableData.innerHTML = ...                # to add images, links
//      * tableRow.appendChild(tableData)          # put data in row
//      * tbody = boardTable.getElementsByTagName('tbody')[0];   # get tbody
//      * tbody.insertAfter(tableRow,otherRow)     # put row in table
//   (whew!)
function createOrClearGuessTr(){
    if (guessTr != null){
        for (var c=0; c<nColumns; c++){
            // images are at indeces 0,2,4,...
            guessTr.childNodes[2*c].childNodes[0].src = 'whitepixel.gif';
        }
        return;
    }
    guessTr = document.createElement('tr');
    var td;
    for (var column=0; column<nColumns; column++){
        td = document.createElement('td');
        td.innerHTML="<img src='whitepixel.gif' width=32 height=32 border=0>";
        guessTr.appendChild(td);
        if (column<nColumns-1){ 
            td = document.createElement('td');
            td.innerHTML="<img src='whitepixel.gif' border=0>";
            guessTr.appendChild(td);
        }
    }
    td = document.createElement('td');
    td.innerHTML="<a href='javascript:checkGuess()'>Guess&nbsp;</a>";
    td.align = "right";
    guessTr.appendChild(td);
    var tbody = boardTable.getElementsByTagName('tbody')[0];
    tbody.insertBefore(guessTr, blackLineTr);
}

// --------------------------------------------------------
// One of the image buttons was clicked; change the corresponding picture.
function click(column,color){
    if ( guessTr == null ){
        alert("The game is stopped; you can't make guesses now.\n" + 
              "Click 'New Game' to start another.");
        return;
    }
    getColumnNImage(column).src = colorImages[color];
    lastGuess[column] = color;
}

// --------------------------------------------------------
// Return the image corresponding to the N'th column of the puzzle from guessTr
function getColumnNImage(column){
    return guessTr.childNodes[2*column].childNodes[0];
}

// --------------------------------------------------------
// Show the user the hints by replacing the "Guess" link with
// the given number of black and grey images.
function drawAndPopGuessResult(black, grey){
    guessTd = guessTr.childNodes[2*nColumns-1];
    var htmlResult = "";
    for (var i=0; i<black; i++){
        htmlResult += "<img src='blackpixel.gif' height=8 width=8>" + 
            "<img src='whitepixel.gif' width=4>";
    }
    for (var i=0; i<grey; i++){
        htmlResult += "<img src='greybox.gif' height=8 width=8>" +
            "<img src='whitepixel.gif' width=4>";
    }
    htmlResult += "<img src='whitepixel.gif' width=10>"+(oldGuesses.length+1);
    guessTd.innerHTML = htmlResult;
    oldGuesses.push(guessTr);
    guessTr = null;
}

// --------------------------------------------------------
// return true if one of the columns where the user gueses colors is empty
function isAColumnEmpty(){
    for (var c=0; c<nColumns; c++){
        if ( lastGuess[c]<0 ){
            alert(" Please pick a color for each column\n" + 
                  " by clicking on the small circles\n" + 
                  " before submitting your guess.");
            return true;
        }
    }
    return false;
}

// --------------------------------------------------------
// The user clicked 'Guess'; time to count how many black and grey
// hints should be displayed.
// Each correct color in correct column gives a black marker.
// Each correct color in wrong column gives a grey marker.
// No guess or answer can match more than one marker.
function checkGuess(){
    if (isAColumnEmpty()) {return;}
    var guessCopy  = [];
    var answerCopy = [] ;
    var nBlack = 0;
    var nGrey  = 0;
    // Make copies of the guesses and answers;
    // it's easiest to do this counting by erasing ones we've counted.
    for (var c=0; c<nColumns; c++){
        guessCopy[c]  = lastGuess[c];
        answerCopy[c] = hiddenAnswer[c];
    }
    // count number of black markers.
    for (var c=0; c<nColumns; c++){
        if ( answerCopy[c] == guessCopy[c] ){
            nBlack++;
            answerCopy[c] = -10;  // don't match this again
            guessCopy[c] = -11;   // or this again.
        }
    }
    // count number of grey markers
    for (var ca=0; ca<nColumns; ca++){
        for (var cg=0; cg<nColumns; cg++){
            if ( answerCopy[ca] == guessCopy[cg] ){
                nGrey++;
                answerCopy[ca] = -10;  // don't match this again
                guessCopy[cg] = -11;   // or this again.
            }
        }
    }
    drawAndPopGuessResult(nBlack, nGrey);
    for (var c=0; c<nColumns; c++){
        lastGuess[c] = -1;
    }
    if (nBlack == nColumns){         // was this guess correct?
        timerIsRunning = false;
        showTimer();                // display time and set lastElapsedTime.
        showMessage("<b>Correct.</b><p>" + 
                    "Number of guesses = "+ oldGuesses.length + "<br>" + 
                    "Elapased time = " + lastElapsedTime );
    }
    else {
        createOrClearGuessTr();
    }       
}

function pausecomp(millis)
 {
  var date = new Date();
  var curDate = null;
  do { curDate = new Date(); }
  while(curDate-date < millis);
}
