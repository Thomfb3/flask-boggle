////////Boggle Game Class
class BoggleGame {
    
    constructor(seconds = 60) {
        this.seconds = seconds;
        this.score = 0;
        this.words = new Set();
        this.guesses = 0;

        //event listener on from button click, run handleGuess
        $("#submit-guess").on("click", this.handleGuess.bind(this));
        //run the timer countdown
        this.timer = setInterval(this.count.bind(this), 1000);
    }



    //Async function handleGuess
    //it sends guesses to the server and handles the responses
    async handleGuess(evt) {
        //prevent form submit
        evt.preventDefault();
        //form input element
        const $wordInput = $("#word-guessed")
        //collect input value and convert to uppercase
        const word = $wordInput.val().toLowerCase();

        //If the input is empty return
        if (!word) return;

        //increment the guesses - total guesses not just valid guesses
        this.guesses++;
        
        if (this.words.has(word)) {
            //if the word exits in this.words set, add a "bad" class word to list of guesses
            //and display message that word is already found
            this.displayWords(word, "bad");
            this.displayMessage(`You already found "${word}"`, "bad-msg");
            return;
        }

        //Now call server to check for the word and return response
        const response = await axios.get(`/check-guess`, { params: { word } });

        if (response.data.result === "not-word") {
            //if it's not a valid word in our python word dictionary
            //add a "bad" class word to list of guesses
            this.displayWords(word, "bad");
            //and display message that word is not valid
            this.displayMessage(`${word} is not a valid word`, "bad-msg");
        } else if (response.data.result === "not-on-board") {
            //if it's not on the board
            //add a "bad" class word to list of guesses
            this.displayWords(word, "bad");
            //and display message that word is not on the board
            this.displayMessage(`<p><span>${word.toUpperCase()}</span> is not on the board!</p>`, "bad-msg");
        } else {
            //Valid word
            //add a "good" class word to list of guesses
            this.displayWords(word, "good");
            //and display message that the word is good
            this.displayMessage(`Nice! Good word, keep going!`, "good-msg");
            //Add the word length to the score
            this.score += word.length;
            //Display the score on the game
            this.displayScore();
            //Add the word to our set
            this.words.add(word);
        }
        //clear the word input
        $wordInput.val("");
    }



    async handleScore() {
        //Now call server to check for the word and return response
        const response = await axios.post(`/post-score`, { score: this.score });
        //If there's a new high score alert the user and update the UI
        if(response.data.broke_record) {
            alert(`You got the new High Score: ${response.data.highscore}`)
            this.displayMessage(`You Got the New High Score: ${response.data.highscore}!`, "good-msg");
            $("#highscore").text(response.data.highscore);
        }
       
    }



    //count allows ud to count our timer down
    count() {
        //Reduce the number of seconds by 1
        this.seconds -= 1;
        //Display the seconds on the time element
        this.displayTimer();
       
        if (this.seconds === 0) {
            //If time's up, give alert
            alert("Times Up!");
            //Add message to the message box
            this.displayMessage(`Times Up!`, "");
            //clear the interval and stop the count down
            clearInterval(this.timer);
            //disable form button
            $("#submit-guess").attr("disabled", true);

            //handlesScore
            this.handleScore();
        }
    }



    //Add the seconds to the timer box
    displayTimer() {
        $("#timer").text(this.seconds);
    }


    //Add messages to the message box
    displayMessage(msg, cls) {
        //clear the message box 
        $("#message").text("")
        //Add the bew message
        $("#message").append(msg);
        //remove msg classes and add the new one
        $("#message").removeClass("bad-msg good-msg").addClass(cls); 

        //Set Timeout to allow the message to change in a few seconds
        if (cls === "bad-msg")
            setTimeout(function () {
                $("#message").text("")
                $("#message").append(`<p>Keep Guessing</p>`);
            }, 2000);
    }



    //Add the score to the score box
    displayScore() {
        $("#score").text(this.score);
    }


    //Add new guesses words to the words table on the game
    displayWords(word, cls) {
        //Determine the words point
        //It only get points if the word is valid and on the board
        const points = cls === "good" ? word.length : 0;

        //Table cell markup for new word
        const wordMarkUp = `
        <tr>
            <th scope="row">${this.guesses}</th>
            <td class="${cls}">${word}</td>
            <td class="${cls}">${points}</td>
        </tr>`
        //append the new word markup to the guessed words table
        $("#words").append(wordMarkUp)

    }
}
