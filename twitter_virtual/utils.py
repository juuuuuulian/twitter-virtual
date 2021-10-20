"""Utility functions used in various views."""
import datetime
from .database import db
from .models import AppUse
from flask import current_app, request, session, render_template, make_response
from .twitter import TwitterClient
from .recaptcha import RecaptchaClient
from pytz import UTC
import re

twitter_username_re = re.compile("^[a-zA-Z0-9_]{1,15}$")


def render_app_template(template_name, status=200, extra_app_vars=None):
    """Render an app template with an app_vars dict to be made accessible to the javascript frontend."""
    app_vars = get_frontend_app_vars()
    if extra_app_vars:
        app_vars.update(extra_app_vars)
    return make_response(render_template(template_name, app_vars=app_vars), status)


def render_app_index(status=200, extra_app_vars=None):
    """Render the app index template with an app_vars dict to be made accessible to the javascript frontend."""
    return render_app_template("index.html", status, extra_app_vars)


def render_app_error(error_message):
    """Render the app index template with an error message in app_vars."""
    return render_app_index(status=500, extra_app_vars={"error_message": error_message})


def get_frontend_app_vars():
    """Get a dict of variables for use on the frontend: last app use, recaptcha key, etc."""
    last_app_use = get_last_app_use_date()
    last_app_use = last_app_use.isoformat() if last_app_use else None

    return {
        "last_app_use": last_app_use
    }


def twitter_username_is_valid(username):
    """Check basic validity of a Twitter username.

    See: https://help.twitter.com/en/managing-your-account/twitter-username-rules
    """
    if twitter_username_re.match(username) is None:
        return False
    return True


def get_twitter_client():
    """Get a TwitterClient configured for current_app."""
    return TwitterClient.from_flask_app(current_app)


def get_recaptcha_client():
    """Get a Recaptcha client configured for current_app."""
    return RecaptchaClient.from_flask_app(current_app)


def get_remote_addr():
    """Return remote_addr while accounting for Flask-WebTest."""
    if request.remote_addr:
        return request.remote_addr
    else:
        # Flask-WebTest is making the request
        return "127.0.0.1"


def should_limit_app_use():
    """Return a boolean indicating whether or not we should time-limit use of the app."""
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
