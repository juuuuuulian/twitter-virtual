"""View functions for Twitter API interaction."""
from flask import Blueprint, session, redirect, request, current_app, render_template, make_response
from ..twitter import TwitterClient, RateLimitHit, SoftRateLimitHit, TooManyFollowing, ZeroFollowing, TwitterError, \
    UserNotFollowingTarget
import datetime
from ..database import db
from ..models import AppUse
# from ..utils import get_twitter_client, should_limit_app_use, record_app_use, app_used_today


twitter_bp = Blueprint('twitter', __name__, url_prefix="/twitter")

def _get_remote_addr():
    if request.remote_addr:
        return request.remote_addr
    else:
        # Flask-WebTest is making the request
        return "127.0.0.1"


def _get_twitter_client():
    return TwitterClient.from_flask_app(current_app)


class FeedCopyError(Exception):
    """Fatal exception for the following copy process - hit a Twitter API error, a rate limit, etc."""
    def __init__(self, message, orig_exception=None, new_list_id=None):
        super().__init__(message)
        self.orig_exception = orig_exception
        self.user_error_message = message
        self.new_list_id = new_list_id


def _check_user_is_following_target(client, screen_name):
    """Check that the current user is following screen_name on Twitter, and raise an error if not."""
    try:
        if client.current_user_is_following_user(screen_name) is False:
            raise FeedCopyError("Please enter a screen name that you are following", UserNotFollowingTarget())
    except RateLimitHit as e:
        raise FeedCopyError("Please try again in 30 minutes", e)
    except TwitterError as e:
        raise FeedCopyError("Please try again later", e)


def _get_following_user_ids(client, screen_name):
    """Fetch all user IDs that screen_name is following, and raise an error if there are more than 5000."""
    try:
        following_users = client.get_following_user_ids(screen_name, count=5000)
        user_ids = following_users.get("ids", [])

        # following more than 5000 users
        if following_users["next_cursor"] != 0:
            raise FeedCopyError("Please enter a screen name that is following fewer than 5000 other users",
                                TooManyFollowing())
        # following nobody
        if len(user_ids) == 0:
            raise FeedCopyError("Please enter a screen name that is following other users", ZeroFollowing())
        return user_ids
    except RateLimitHit as e:
        raise FeedCopyError("Please try again in 30 minutes", e)
    except TwitterError as e:
        raise FeedCopyError("Please try again later", e)


def _create_new_private_list(twitter_client, screen_name):
    """Create a new private list for the user named '<screen_name>'."""
    try:
        twitter_list = twitter_client.create_private_list(screen_name)
        return twitter_list
    except RateLimitHit as e:
        raise FeedCopyError("Please try again in 30 minutes", e)
    except TwitterError as e:
        raise FeedCopyError("Please try again later", e)


def _add_user_ids_to_list(twitter_client, user_ids, twitter_list):
    """Add users in user_ids as members to a list denoted by list_id."""
    # go through the list a chunk at a time, adding each to the new private list
    twitter_list_id = twitter_list["id_str"]
    chunk_size = 100
    bottom, top = 0, chunk_size
    updated_list = None
    while bottom <= len(user_ids) - 1:
        members_chunk = user_ids[bottom:top]
        try:
            updated_list = twitter_client.add_users_to_list(twitter_list_id, members_chunk)
        except RateLimitHit as e:
            raise FeedCopyError("Please try again in 30 minutes", e, twitter_list_id)
        except SoftRateLimitHit as e:
            raise FeedCopyError("Please try again tomorrow - our application has hit a Twitter rate limit",
                                e, twitter_list_id)
        except TwitterError as e:
            raise FeedCopyError("Please try again later", e, twitter_list_id)

        bottom += chunk_size
        top += chunk_size

    # final check for a soft rate limit hit
    # if our final list member count is a chunk under our goal list size, we've probably hit a soft rate limit
    final_member_count = updated_list["member_count"]
    if final_member_count <= (len(user_ids) - chunk_size):
        raise FeedCopyError("Please try again tomorrow - our application has hit a Twitter rate limit",
                            SoftRateLimitHit(), twitter_list_id)


def _copy_user_following_to_new_list(twitter_client, screen_name):
    """Find following user IDs for screen_name and add them to a new private list for the current user."""
    _check_user_is_following_target(twitter_client, screen_name)
    following_user_ids = _get_following_user_ids(twitter_client, screen_name)
    twitter_list = _create_new_private_list(twitter_client, screen_name)
    _add_user_ids_to_list(twitter_client, following_user_ids, twitter_list)
    return twitter_list


def _handle_cleanup(client, feed_copy_exception):
    """Log the exception and delete the newly created list (if one exists)."""
    orig_exception = feed_copy_exception.orig_exception
    current_app.logger.exception(f'Fatal following copy error! {str(orig_exception)}')
    new_list_id = feed_copy_exception.new_list_id

    # clean up list
    if new_list_id:
        try:
            client.delete_list(new_list_id)
        except TwitterError as e:
            current_app.logger.exception(f'Failed to clean up a list ({new_list_id})! {str(orig_exception)}')
            return False

    current_app.logger.info("Cleaned up a list")
    return True


def render_error(error_message):
    return make_response(render_template("error.html", error_message=error_message), 500)


def _app_used_today():
    """Check the session and the backend database for a record of app use from the last 24 hours."""
    now = datetime.datetime.utcnow()
    day_length_in_seconds = 60 * 60 * 24
    remote_ip = _get_remote_addr()

    # check the database for app_use records with this ip in the last 24 hrs
    yesterday = datetime.datetime.fromtimestamp(now.timestamp() - day_length_in_seconds)
    app_uses = AppUse.query.filter(AppUse.remote == str(remote_ip),
                                   AppUse.date >= yesterday.isoformat()).count()
    if app_uses:
        return True

    # check the session
    last_app_use = session.get("last_app_use")
    if last_app_use and (now.timestamp() - last_app_use < day_length_in_seconds):
        return True

    return False


def _should_limit_app_use():
    if current_app.config["LIMIT_APP_USE"]:
        return True
    return False


def _record_app_use():
    """Record last app use in the session and the backend database."""
    # session
    now = datetime.datetime.utcnow().timestamp()
    session["last_app_use"] = now

    # database
    db.session.add(AppUse(remote=str(_get_remote_addr())))
    db.session.commit()


@twitter_bp.route("/begin", methods=['POST'])
def begin():
    """Accept a Twitter target screen name, stash it in the session, then redirect to the oauth view."""
    target_screen_name = request.form.get("target_screen_name", "").strip()
    if (target_screen_name is None) or len(target_screen_name) == 0:
        return render_error("Missing target screen name")

    # todo: validate and sanitize target_screen_name

    session['target_screen_name'] = target_screen_name
    return redirect("/oauth/begin")


@twitter_bp.route("/copy_feed", methods=['GET'])
def copy_feed():
    """Copy the feed of the target screen name."""
    token = session.get('token')
    token_secret = session.get('token_secret')
    target_screen_name = session.get('target_screen_name')

    if token is None or token_secret is None:
        return render_error("Missing OAuth Token")

    if target_screen_name is None:
        return render_error("Missing target screen name")

    if _should_limit_app_use() and _app_used_today():
        return render_error("App used once today already")

    client = _get_twitter_client()
    client.set_client_token(token, token_secret)

    try:
        twitter_list = _copy_user_following_to_new_list(client, target_screen_name)
    except FeedCopyError as e:
        _handle_cleanup(client, e)
        return render_error(e.user_error_message)

    _record_app_use()

    return render_template("success.html", new_list_url=client.get_full_list_url(twitter_list))
    # return redirect("/twitter/success")


@twitter_bp.route("/success")
def success():
    """Show the user a success page."""
    return render_template("success.html", new_list_url="https://twitter.com/chinese_steel/lists/my-test-list")


