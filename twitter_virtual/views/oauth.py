"""View functions for Twitter authentication."""
from flask import Blueprint, session, redirect, request
from ..twitter import OAuthRequestError, InvalidOAuthResponseError
from ..utils import get_twitter_client, render_app_error

bp = Blueprint('oauth', __name__, url_prefix='/oauth')

# TODO: better error messages, better error handling in general


@bp.route('/begin', methods=('GET', 'POST'))
def begin():
    """Get a Twitter OAuth Request Token, then redirect the user to the Twitter authorization page for our token."""
    twitter_client = get_twitter_client()

    try:
        token = twitter_client.get_request_token()
    except OAuthRequestError:
        # non-200 response from twitter
        return render_app_error("OAuth Request Error")
    except InvalidOAuthResponseError:
        # response from twitter was invalid
        return render_app_error("Invalid OAuth Response")

    session['token'] = token.key
    session['token_secret'] = token.secret
    return redirect(twitter_client.get_authorize_url_for_token(token.key))


@bp.route('/callback', methods=('GET', 'POST'))
def callback():
    """Handle redirects from the Twitter OAuth authorization page.

    Accept OAuth request token values, exchange them for a valid OAuth user token, and finally redirect the user to
    the feed copy endpoint.
    """
    twitter_client = get_twitter_client()
    oauth_verifier = request.args.get('oauth_verifier')
    token = session.get('token')
    token_secret = session.get('token_secret')

    if token is None or token_secret is None:
        return render_app_error("Missing OAuth Token")

    if oauth_verifier is None:
        return render_app_error("Missing OAuth Verifier")

    try:
        token = twitter_client.authorize_oauth_token(token, token_secret, oauth_verifier)
        session["token"] = token.key
        session["token_secret"] = token.secret
    except OAuthRequestError:
        return render_app_error("OAuth Request Error")
    except InvalidOAuthResponseError:
        return render_app_error("Invalid OAuth Response")

    return redirect("/twitter/copy_feed")
