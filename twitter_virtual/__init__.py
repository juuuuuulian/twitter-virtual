"""Temporary."""

from flask import Flask
from .views import oauth
import os
from dotenv import load_dotenv
load_dotenv()


def setup_app():
    """Set up Flask application - register views, load secret key, etc."""
    app = Flask("twitter_virtual")
    app.secret_key = os.environ['FLASK_SECRET_KEY']
    app.register_blueprint(oauth.bp)
    return app


app = setup_app()
