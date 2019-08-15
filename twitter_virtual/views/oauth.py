from flask import Blueprint, session, redirect, request, current_app
from ..twitter import TwitterClient, RateLimitHit, SoftRateLimitHit, TooManyFollowing, ZeroFollowing


bp = Blueprint('oauth', __name__, url_prefix='/oauth')


def _get_twitter_client():
    """Get a TwitterClient."""
    return TwitterClient()


def _copy_user_following_to_new_list(twitter_client, screen_name):
    """Find 'following' accounts for screen_name and add them to a new private list for the current user."""
    # TODO: handle case where members = 0
    # TODO: handle case where members > 5000
    # TODO: handle case where list with name already exists (for now, just error out)
    following_users = twitter_client.get_following_user_ids(screen_name)
    new_list = twitter_client.create_private_list(screen_name)

    chunk_size = 100
    bottom, top = 0, chunk_size
    while bottom <= len(following_users) - 1:
        members_chunk = following_users[bottom:top]
        success = twitter_client.add_users_to_list(new_list["id_str"], members_chunk)
        bottom += chunk_size
        top += chunk_size

    return new_list


@bp.route('/begin', methods=('GET', 'POST'))
def begin():
    twitter_client = _get_twitter_client()
    token = twitter_client.get_request_token()
    session['token'] = token.key
    session['token_secret'] = token.secret
    return redirect(twitter_client.get_authorize_url_for_token(token.key))


@bp.route('/callback', methods=('GET', 'POST'))
def callback():
    twitter_client = _get_twitter_client()
    oauth_verifier = request.args.get('oauth_verifier')
    twitter_client.authorize_oauth_token(session['token'], session['token_secret'], oauth_verifier)

    # TODO: get the screen name from session or somewhere else
    # create the new list
    new_list = _copy_user_following_to_new_list(twitter_client, 'finallevel')

    # redirect user to new list?
    # handle error cases?
    return "New list: " + str(new_list)


@bp.route('/alive', methods=['GET'])
def hello_world():
    return "Hello, world!"
