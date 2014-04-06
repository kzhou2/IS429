var nColumns = 4;
var bot1score=9999;
var bot2score=9999;
var gameNumber = 1;
var curBot=0;
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
// called when user clicks "New Game" - git kfwefwe.
function newGame(){
    resetGame();
    gameNumber++;
    runTimer();
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
function showHelp(i){
		
		resetGame();
		curBot=i;
		
    	var x = document.getElementById("myTextarea" +i).value;
		
		//eval(x);
		var tmpFunc = new Function(x);
		
		tmpFunc();
		
		
		
		
	
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
showMessage("");
    while (oldGuesses.length>0){
        boardTable.deleteRow( oldGuesses.pop().rowIndex );
    }
    for (var column=0; column<nColumns; column++){
        lastGuess[column] = -1;
        hiddenAnswer[column] = getRandom( colorImages.length );
		//hiddenAnswer[column]= 3;
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
        showMessage("<b>Correct.</b><p>" + 
                    "Number of guesses = "+ oldGuesses.length + "<br>"  );
					
					if(curBot ==1){
					bot1score = oldGuesses.length;
					}
					else{
					bot2score = oldGuesses.length;
					}
					
    }
    else {
        createOrClearGuessTr();
		return [nBlack, nGrey];
    }   

		
}

function beat()
 {
  //alert('Bot 1 competed!!');
  //showHelp(1);
  setTimeout(showHelp(2), 10000000000);
  


}



function pausecomp(millis)
 {
  var date = new Date();
  var curDate = null;
  do { curDate = new Date(); }
  while(curDate-date < millis);
}

function showRes(){

	if (bot1score>bot2score){
		reslut = "Bot2 win";
	}
		if (bot1score==bot2score){
		reslut = "Draw";
	}
		if (bot1score<bot2score){
		reslut = "Bot1 win";
	}
	

 alert("Bot 1 steps " + bot1score + ", Bot 2 steps " + bot2score + ", " + reslut );

}

function bot1(){
	for(var i1 = 0; i1 < 6; i1++){
		  for(var i2 = 0; i2 < 6; i2++){

			  for(var i3 = 0; i3 < 6; i3++){

				  for(var i4 = 0; i4 < 6; i4++){
					  aguess(i1,i2,i3,i4);
				  }			  
			  }
		  }
		}

}

function bot2(){
				for(var i1 = 0; i1 < 6; i1++){
					dance:
					  for(var i2 = 0; i2 < 6; i2++){

						  for(var i3 = 0; i3 < 6; i3++){
							
							  for(var i4 = 0; i4 < 6; i4++){
								 rel= aguess(i1,i2,i3,i4);  
								  if(rel[0] == 0 && rel[1]==0)
									break dance;
								  
							  }			  
						  }
					  }
					}

}

function bot3(){
			
					var arr1=new Array();
					index =0;
					 for(var j = 0; j < 6; j++){
						
						  rel= aguess(j,j,j,j);  
						  if(rel[0] + rel[1]==1){
							arr1[index] =j;
							index++;
						  }
						  else if (rel[0] + rel[1]==2){
							arr1[index] =j;
							index++;
							arr1[index] =j;
							index++;
						  }
						  else if (rel[0] + rel[1]==3){
							arr1[index] =j;
							index++;
							arr1[index] =j;
							index++;
							arr1[index] =j;
							index++;
						  }
						  else if (rel[0] + rel[1]==4){
							arr1[index] =j;
							index++;
							arr1[index] =j;
							index++;
							arr1[index] =j;
							index++;
							arr1[index] =j;
							index++;
						  }
						  else{}
						  
							     
						} 

						aguess(arr1[0],arr1[1],arr1[2],arr1[3]);
						aguess(arr1[0],arr1[1],arr1[3],arr1[2]);
						aguess(arr1[0],arr1[2],arr1[1],arr1[3]);
						aguess(arr1[0],arr1[2],arr1[3],arr1[1]);
						aguess(arr1[0],arr1[3],arr1[1],arr1[2]);
						aguess(arr1[0],arr1[3],arr1[2],arr1[1]);
						aguess(arr1[1],arr1[0],arr1[2],arr1[3]);
						aguess(arr1[1],arr1[0],arr1[3],arr1[2]);
						aguess(arr1[1],arr1[2],arr1[0],arr1[3]);
						aguess(arr1[1],arr1[2],arr1[3],arr1[0]);
						aguess(arr1[1],arr1[3],arr1[0],arr1[2]);
						aguess(arr1[1],arr1[3],arr1[2],arr1[0]);	
						aguess(arr1[2],arr1[0],arr1[2],arr1[3]);
						aguess(arr1[2],arr1[0],arr1[3],arr1[1]);
						aguess(arr1[2],arr1[1],arr1[0],arr1[3]);
						aguess(arr1[2],arr1[1],arr1[3],arr1[0]);
						aguess(arr1[2],arr1[3],arr1[0],arr1[1]);
						aguess(arr1[2],arr1[3],arr1[1],arr1[0]);						
						aguess(arr1[3],arr1[0],arr1[2],arr1[1]);
						aguess(arr1[3],arr1[0],arr1[1],arr1[2]);
						aguess(arr1[3],arr1[1],arr1[0],arr1[2]);
						aguess(arr1[3],arr1[1],arr1[2],arr1[0]);
						aguess(arr1[3],arr1[2],arr1[0],arr1[1]);
						aguess(arr1[3],arr1[2],arr1[1],arr1[0]);
							
}

function aguess(i1,i2,i3,i4){
					lastGuess[0]=i1;
							  lastGuess[1]=i2;
							  lastGuess[2]=i3;
							  lastGuess[3]=i4;
							  getColumnNImage(0).src = colorImages[lastGuess[0]];
							  getColumnNImage(1).src = colorImages[lastGuess[1]];
							  getColumnNImage(2).src = colorImages[lastGuess[2]];
							  getColumnNImage(3).src = colorImages[lastGuess[3]];
							rel = checkGuess();
							return rel;
}