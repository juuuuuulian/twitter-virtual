"""Utility functions used in various views."""
import datetime
from .database import db
from .models import AppUse
from flask import current_app, request, session
from .twitter import TwitterClient
from pytz import UTC


def get_twitter_client():
    """Get a TwitterClient configured for current_app."""
    return TwitterClient.from_flask_app(current_app)


def get_remote_addr():
    if request.remote_addr:
        return request.remote_addr
    else:
        # Flask-WebTest is making the request
        return "127.0.0.1"


def should_limit_app_use():
    if current_app.config["LIMIT_APP_USE"]:
        return True
    return False


def record_app_use():
    """Record last app use in the session and the backend database."""
    # session
    now = UTC.localize(datetime.datetime.utcnow()).timestamp()
    session["last_app_use"] = now

    # database
    db.session.add(AppUse(remote=str(get_remote_addr())))
    db.session.commit()


def get_last_app_use_date():
    """Get a datetime of the last time this person used our app, checking the session and the database."""
    last_app_use = session.get("last_app_use")
    if last_app_use:
        last_app_use = datetime.datetime.fromtimestamp(last_app_use, UTC)
        return last_app_use

    last_app_use = AppUse.query.filter_by(remote=get_remote_addr()) \
        .order_by(AppUse.date.desc()).limit(1).first()
    if last_app_use:
        return last_app_use.date

    return None


def app_used_today():
    """Check the session and the backend database for a record of app use from the last 24 hours."""
    now = UTC.localize(datetime.datetime.utcnow())
    last_app_use = get_last_app_use_date()
    day_length_in_seconds = 60 * 60 * 24
    if last_app_use and (last_app_use.timestamp() + day_length_in_seconds) > now.timestamp():
        return True

    return False
