"""Temporary."""

from flask import Flask
from dotenv import load_dotenv
import os
load_dotenv()

app = Flask("twitter_virtual")

consumer_key = os.environ.get('TWITTER_CONSUMER_KEY')
consumer_secret = os.environ.get('TWITTER_CONSUMER_SECRET')
access_token = os.environ.get('TWITTER_ACCESS_TOKEN')
access_token_secret = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET')

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/key')
def key():
    return consumer_key
