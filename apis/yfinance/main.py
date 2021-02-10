import flask
import yfinance as yf

app = flask.Flask(__name__)

@app.route('/ticker/<symbol>')
def ticker(symbol):
     ticker = yf.Ticker(symbol)
     return flask.jsonify(ticker.info)
