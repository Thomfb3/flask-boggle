from flask import Flask, request, render_template, redirect, flash, jsonify, session
from flask_debugtoolbar import DebugToolbarExtension
from boggle import Boggle

boggle_game = Boggle()


app = Flask(__name__)
app.config['SECRET_KEY'] = "secretkey"
debug = DebugToolbarExtension(app)
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

BOARD_KEY = "board"
HIGH_SCORE_KEY = "highscore"
NUM_PLAYS_KEY = "num_plays"


@app.route('/')
def home_board():
    """Home screen displays session board"""
    #collects board from session
    board = session[BOARD_KEY]
    highscore = session.get(HIGH_SCORE_KEY, 0)
    num_plays = session.get(NUM_PLAYS_KEY, 0)

    #render board html template
    return render_template('board.html', board=board, highscore=highscore, num_plays=num_plays)


@app.route('/new')
def create_board():
    """creates new board and redirects to home screen"""
    #Creates a new boggle board
    board = boggle_game.make_board()

    #Increment the number of plays for a new board
    num_plays = session.get(NUM_PLAYS_KEY, 0)
    session[NUM_PLAYS_KEY] = num_plays + 1

    #Saves the board to session
    session[BOARD_KEY] = board

    #redirects to the home screen with new board
    return redirect('/')


@app.route('/check-guess')
def check_guess():
    """creates new board and redirects to home screen"""
    #Creates a new boggle board
    word = request.args['word']
    board = session[BOARD_KEY]
    result = boggle_game.check_valid_word(board, word)
    #Return the json response
    return jsonify({"result": result})


@app.route('/post-score', methods=["POST"])
def post_score():
    """creates new board and redirects to home screen"""
    #Creates a new boggle board
    score = request.json['score']

    highscore = session.get(HIGH_SCORE_KEY, 0)
    num_plays = session.get(NUM_PLAYS_KEY, 0)

    broke_record = True if score > highscore else False

    session[HIGH_SCORE_KEY] = max(score, highscore)
    session[NUM_PLAYS_KEY] = num_plays + 1


    #Return the json response
    return jsonify( highscore=session[HIGH_SCORE_KEY], broke_record=broke_record)


    