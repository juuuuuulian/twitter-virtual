"""Flask application setup."""

from flask import Flask
from .database import db, SQLAlchemy
import os
from dotenv import load_dotenv
from .views import oauth, twitter, site
from flask_compress import Compress
from flask_talisman import Talisman

load_dotenv()
compress = Compress()


def setup_app(testing: bool = False) -> Flask:
    """Set up Flask application - register views, load secret key, env config, etc."""
    app = Flask("twitter_virtual")

    app.secret_key = os.environ["FLASK_SECRET_KEY"]
    app.config["LIMIT_APP_USE"] = bool(int(os.environ.get("LIMIT_APP_USE", 0)))
    app.config["TWITTER_CONSUMER_KEY"] = os.environ["TWITTER_CONSUMER_KEY"]
    app.config["TWITTER_CONSUMER_SECRET"] = os.environ["TWITTER_CONSUMER_SECRET"]
    app.config["TWITTER_CALLBACK_URL"] = os.environ["TWITTER_CALLBACK_URL"]
    app.config["RECAPTCHA_SECRET"] = os.environ["RECAPTCHA_SECRET"]
    app.config["RECAPTCHA_SITE_KEY"] = os.environ["RECAPTCHA_SITE_KEY"]
    # app.config["TEMPLATES_AUTO_RELOAD"] = True

    app.register_blueprint(oauth.bp)
    app.register_blueprint(twitter.twitter_bp)
    app.register_blueprint(site.site_bp)

    # enable compression
    compress.init_app(app)

    if app.config["ENV"] == "production" and testing is False:
        app.config["SESSION_COOKIE_SECURE"] = True
        app.config["SESSION_COOKIE_HTTPONLY"] = True
        app.config["SESSION_COOKIE_SAMESITE"] = 'Lax'

        # talisman content security policy
        csp = {
            "img-src": "*",
            "script-src": [
                "'self'",
                "*.google.com",
                "*.gstatic.com"
            ],
            "frame-src": "*.google.com"
        }
        Talisman(app, content_security_policy=csp, content_security_policy_nonce_in=["script-src"])

    return app


def setup_db(flask_app: Flask, testing: bool = False) -> SQLAlchemy:
    """Set up Flask-SQLAlchemy."""
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    # app.config["SQLALCHEMY_ECHO"] = True
    if testing:
        flask_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        with flask_app.app_context():
            db.init_app(flask_app)
            db.create_all()
    else:
        flask_app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
        db.init_app(flask_app)
    return db
