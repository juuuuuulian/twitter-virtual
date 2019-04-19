import logging
from flask import Blueprint, session
import oauth2
from urllib.parse import urlencode, parse_qs
import os
from dotenv import load_dotenv
load_dotenv()

log = logging.getLogger(__name__)
bp = Blueprint('oauth', __name__, url_prefix='/oauth')


def _get_oauth_client():
    """Get a Twitter-configured oauth2.Client."""
    consumer_key = os.environ.get('TWITTER_CONSUMER_KEY')
    consumer_secret = os.environ.get('TWITTER_CONSUMER_SECRET')
    # access_token = os.environ.get('TWITTER_ACCESS_TOKEN')
    # access_token_secret = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET')

    consumer = oauth2.Consumer(key=consumer_key, secret=consumer_secret)
    return oauth2.Client(consumer)


def _get_request_token():
    """Get a Twitter OAuth request token."""
    client = _get_oauth_client()
    callback_url = os.environ.get('TWITTER_CALLBACK_URL')
    request_token_url = os.environ.get('TWITTER_REQUEST_TOKEN_URL')

    # ask twitter for a token to perform oauth
    request_body = urlencode({'oauth_callback': callback_url})
    headers, body = client.request(request_token_url, method='POST', body=request_body)

    if headers.status == 200:
        resp_vals = parse_qs(body.decode())
        token = resp_vals.get('oauth_token')[0]
        token_secret = resp_vals.get('oauth_token_secret')[0]
        log.info("Fetched a request token successfully")
        return token, token_secret
    else:
        log.error("Token request failure, response: {} - {}".format(str(headers.status), body.decode()))

    return False


@bp.route('/test', methods=('GET', 'POST'))
def test():
    token, token_secret = _get_request_token()
    session['token'] = token
    session['token_secret'] = token_secret
    return "Success!"


@bp.route('/test2', methods=['GET', 'POST'])
def test2():
    return "Session token: " + session['token']

