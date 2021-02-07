import flask
import yfinance as yf
import signal
import sys

app = flask.Flask(__name__)

def exit(sig, frame):
    sys.exit(0)

signal.signal(signal.SIGINT, exit)
signal.signal(signal.SIGTERM, exit)

@app.route('/ticker/<symbol>')
def home(symbol):
     ticker = yf.Ticker(symbol)
     return flask.jsonify(ticker.info)

if __name__ == '__main__':
    app.run(port=5000, debug=False)
