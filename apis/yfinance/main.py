from flask import Flask
import signal
import sys

app = Flask(__name__)

def exit():
    sys.exit(0)

signal.signal(signal.SIGINT, exit)
signal.signal(signal.SIGTERM, exit)

@app.route('/')
def home():
    return 'Hello, World!'
