"""View functions for Twitter API interaction."""
from flask import Blueprint, session, redirect, request, current_app, render_template
from ..twitter import RateLimitHit, SoftRateLimitHit, TooManyFollowing, ZeroFollowing, TwitterError, \
    UserNotFollowingTarget, OAuthRequestError
from ..utils import get_twitter_client, get_recaptcha_client, should_limit_app_use, record_app_use, app_used_today, \
    twitter_username_is_valid, render_app_error
from ..recaptcha import RecaptchaError

twitter_bp = Blueprint('twitter', __name__, url_prefix="/twitter")

# TODO: better error messages, better error handling in general
# TODO: handle recaptcha.RecaptchaTimeoutOrDuplicate


class FeedCopyError(Exception):
    """Fatal exception for the following copy process - hit a Twitter API error, a rate limit, etc."""

    def __init__(self, message, orig_exception=None, new_list_id=None):
        """Stash details from the Twitter API for debugging and cleanup."""
        super().__init__(message)
        self.orig_exception = orig_exception
        self.user_error_message = message
        self.new_list_id = new_list_id


def check_user_is_following_target(twitter_client, screen_name):
    """Check that the current user is following screen_name on Twitter, and raise an error if not."""
    try:
        if twitter_client.current_user_is_following_user(screen_name) is False:
            raise FeedCopyError("Please enter a screen name that you are following", UserNotFollowingTarget())
    except RateLimitHit as e:
        raise FeedCopyError("Please try again in 30 minutes", e)
    except TwitterError as e:
        raise FeedCopyError("Please try again later", e)


def get_following_user_ids(twitter_client, screen_name):
    """Fetch all user IDs that screen_name is following, and raise an error if there are more than 5000."""
    try:
        following_users = twitter_client.get_following_user_ids(screen_name, count=5000)
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


def create_new_private_list(twitter_client, screen_name):
    """Create a new private list for the user named '<screen_name>'."""
    try:
        twitter_list = twitter_client.create_private_list(screen_name)
        return twitter_list
    except RateLimitHit as e:
        raise FeedCopyError("Please try again in 30 minutes", e)
    except TwitterError as e:
        raise FeedCopyError("Please try again later", e)


def add_user_ids_to_list(twitter_client, user_ids, twitter_list):
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


def copy_user_following_to_new_list(twitter_client, screen_name):
    """Find following user IDs for screen_name and add them to a new private list for the current user."""
    check_user_is_following_target(twitter_client, screen_name)
    following_user_ids = get_following_user_ids(twitter_client, screen_name)
    twitter_list = create_new_private_list(twitter_client, screen_name)
    add_user_ids_to_list(twitter_client, following_user_ids, twitter_list)
    return twitter_list


def invalidate_oauth_token(twitter_client):
    """Invalidate our Twitter OAuth API credentials."""
    try:
        twitter_client.invalidate_token()
    except OAuthRequestError as e:
        current_app.logger.exception(f'Failed to invalidate oauth token! {str(e)}')
        return False

    return True


def handle_cleanup(twitter_client, feed_copy_exception):
    """Log the exception, delete the newly created list (if one exists), then invalidate our Twitter API access."""
    orig_exception = feed_copy_exception.orig_exception
    current_app.logger.exception(f'Fatal following copy error! {str(orig_exception)}')
    new_list_id = feed_copy_exception.new_list_id

    # clean up list
    if new_list_id:
        try:
            twitter_client.delete_list(new_list_id)
        except TwitterError as cleanup_exception:
            current_app.logger.exception(f'Failed to clean up a list ({new_list_id})! orig: {str(orig_exception)} cleanup:{str(cleanup_exception)}')
            return False

    current_app.logger.info("Cleaned up a twitter list after an exception occurred")

    # invalidate twitter access
    invalidate_oauth_token(twitter_client)

    return True


@twitter_bp.route("/begin", methods=['POST'])
def begin():
    """Accept a Twitter target screen name, stash it in the session, then redirect to the oauth view."""
    captcha_response_token = request.form.get("captcha_response_token", "")
    target_screen_name = request.form.get("target_screen_name", "").strip()

    # validate screenname
    if (target_screen_name is None) or len(target_screen_name) == 0:
        return render_app_error("Please enter a screen name")
    if twitter_username_is_valid(target_screen_name) is False:
        return render_app_error("Please enter a valid screen name (letters, numbers, and underscores only)")

    # validate captcha token
    if len(captcha_response_token) == 0:
        return render_app_error("Please fill out the captcha before proceeding")
    recaptcha_client = get_recaptcha_client()
    try:
        recaptcha_client.verify_token(captcha_response_token)
    except RecaptchaError as e:
        current_app.logger.warning(f"Recaptcha verification failed: {e.response}")
        return render_app_error(e.user_error_msg)

    session['target_screen_name'] = target_screen_name
    return redirect("/oauth/begin")


@twitter_bp.route("/copy_feed", methods=['GET'])
def copy_feed():
    """Copy the feed of the target screen name."""
    token = session.get('token')
    token_secret = session.get('token_secret')
    target_screen_name = session.get('target_screen_name')

    if token is None or token_secret is None:
        return render_app_error("Missing OAuth Token")

    if target_screen_name is None:
        return render_app_error("Missing target screen name")

    if should_limit_app_use() and app_used_today():
        return render_app_error("App used once today already")

    twitter_client = get_twitter_client()
    twitter_client.set_client_token(token, token_secret)

    # return f"Token: {token} | Secret: {token_secret}"

    try:
        twitter_list = copy_user_following_to_new_list(twitter_client, target_screen_name)
    except FeedCopyError as feed_copy_exception:
        handle_cleanup(twitter_client, feed_copy_exception)
        return render_app_error(feed_copy_exception.user_error_message)
    except Exception as unknown_exception:
        # unknown exception
        current_app.logger.exception(
            f'Failed to copy a feed, unknown exception: {str(unknown_exception)}')
        return render_app_error("Oops! Unknown server error!")  # TODO: improve this

    record_app_use()
    invalidate_oauth_token(twitter_client)

    return render_template("success.html", new_list_url=twitter_client.get_full_list_url(twitter_list))
    # return redirect("/twitter/success")


@twitter_bp.route("/success")
def success():
    """Show the user a success page."""
    return render_template("success.html", new_list_url="https://twitter.com/test/lists/my-test-list")
