"""Flask application setup."""

from flask import Flask
from .database import db
import os
from dotenv import load_dotenv
load_dotenv()
from .models import AppUse
from .views import oauth, twitter, site
from flask_compress import Compress

compress = Compress()

def setup_app(twitter_class=None):
    """Set up Flask application - register views, load secret key, env config, etc."""
    app = Flask("twitter_virtual")

    app.secret_key = os.environ["FLASK_SECRET_KEY"]
    app.config["LIMIT_APP_USE"] = bool(int(os.environ.get("LIMIT_APP_USE", 0)))
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    #app.config["SQLALCHEMY_ECHO"] = True
    app.config["TWITTER_CONSUMER_KEY"] = os.environ["TWITTER_CONSUMER_KEY"]
    app.config["TWITTER_CONSUMER_SECRET"] = os.environ["TWITTER_CONSUMER_SECRET"]
    app.config["TWITTER_CALLBACK_URL"] = os.environ["TWITTER_CALLBACK_URL"]
    app.config["RECAPTCHA_SECRET"] = os.environ["RECAPTCHA_SECRET"]
    app.config["RECAPTCHA_SITE_KEY"] = os.environ["RECAPTCHA_SITE_KEY"]
    app.config["TEMPLATES_AUTO_RELOAD"] = True

    app.register_blueprint(oauth.bp)
    app.register_blueprint(twitter.twitter_bp)
    app.register_blueprint(site.site_bp)

    compress.init_app(app)

    return app


def setup_db(flask_app, testing=False):
    """Set up Flask-SQLAlchemy."""
    if testing:
        flask_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        with flask_app.app_context():
            db.init_app(flask_app)
            db.create_all()
    else:
        db.init_app(flask_app)
    return db

