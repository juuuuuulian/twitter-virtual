"""Classes for interacting with the Twitter API."""
import logging
import datetime
import oauth2
from urllib.parse import urlencode, parse_qs
import json
import os
from dotenv import load_dotenv
load_dotenv()

log = logging.getLogger(__name__)

REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token"
AUTHORIZE_URL = "https://api.twitter.com/oauth/authorize"
ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token"
LIST_FRIENDS_URL = "https://api.twitter.com/1.1/friends/ids.json"
CREATE_LIST_URL = "https://api.twitter.com/1.1/lists/create.json"
LIST_RATE_LIMITS_URL = "https://api.twitter.com/1.1/application/rate_limit_status.json"
ADD_LIST_MEMBERS_URL = "https://api.twitter.com/1.1/lists/members/create_all.json"
DELETE_LIST_URL = "https://api.twitter.com/1.1/lists/destroy.json"
LOOKUP_FRIENDSHIPS_URL = "https://api.twitter.com/1.1/friendships/lookup.json"
BASE_WEB_URL = "https://twitter.com"


class TwitterClient:
    """Class for interacting with the Twitter API on behalf of a Twitter user via OAuth."""
    def __init__(self, consumer_key, consumer_secret):
        """Initialize an oauth2 client."""
        consumer = oauth2.Consumer(key=consumer_key, secret=consumer_secret)
        self.oauth_client = oauth2.Client(consumer)

    @classmethod
    def from_flask_app(cls, flask_app):
        return cls(consumer_key=flask_app.config["TWITTER_CONSUMER_KEY"],
                   consumer_secret=flask_app.config["TWITTER_CONSUMER_SECRET"])

    def get_request_token(self):
        """Get a Twitter OAuth request token for step 1 of OAuth flow."""
        client = self.oauth_client
        callback_url = os.environ.get('TWITTER_CALLBACK_URL')

        request_body = urlencode({'oauth_callback': callback_url})
        headers, body = client.request(REQUEST_TOKEN_URL, method='POST', body=request_body)

        if headers.status != 200:
            raise OAuthRequestError("Fetching request token failed", headers, body)

        token = self.parse_oauth_response(headers, body)

        if token.callback_confirmed != "true":
            raise InvalidOAuthResponseError("Bad request token response - callback unconfirmed", headers, body)

        return token

    def parse_oauth_response(self, headers, body):
        """Parse a Twitter OAuth request token response or an authorize token response."""
        try:
            token = oauth2.Token.from_string(body.decode())
        except ValueError:
            raise InvalidOAuthResponseError("Bad OAuth response - missing required values", headers, body)

        return token

    def get_authorize_url_for_token(self, oauth_token):
        """Get a Twitter OAuth authorization URL for step 2 of OAuth."""
        twitter_auth_url = AUTHORIZE_URL
        if twitter_auth_url[-1] != '?':
            twitter_auth_url = twitter_auth_url + '?'
        return twitter_auth_url + urlencode({'oauth_token': oauth_token})

    def get_full_list_url(self, twitter_list):
        """Get a full Twitter URL for twitter_list."""
        return BASE_WEB_URL + twitter_list["uri"]

    def set_client_token(self, oauth_token, oauth_token_secret, verifier=None):
        """Create an oauth2.Token and set it on our oauth_client."""
        token = oauth2.Token(oauth_token, oauth_token_secret)
        if verifier:
            token.set_verifier(verifier)
        self.oauth_client.token = token
        return token

    def authorize_oauth_token(self, oauth_token, oauth_token_secret, oauth_verifier):
        """"Get an OAuth token from Twitter using an authorized request token - final step of three-legged OAuth."""
        self.set_client_token(oauth_token, oauth_token_secret, oauth_verifier)
        headers, body = self.oauth_client.request(ACCESS_TOKEN_URL, method='POST')

        if headers.status != 200:
            raise OAuthRequestError("Request token exchange failed", headers, body)

        token = self.parse_oauth_response(headers, body)

        # set authorized token on our oauth client
        self.oauth_client.token = token

        return token

    def get_following_user_ids(self, screen_name, count=5000):
        """Get the stringified IDs of the full list of users who screen_name follows."""
        params = {"screen_name": screen_name, "stringify_ids": "true", "count": count}
        headers, body = self.oauth_client.request(LIST_FRIENDS_URL + '?' + urlencode(params), method='GET')

        if headers.status != 200:
            if headers.status == RateLimitHit.status:
                raise RateLimitHit("Too many requests for following users in a 15-minute period!", headers, body)
            raise TwitterError("Fetch following users failed", headers, body)

        return json.loads(body.decode())

    def current_user_is_following_user(self, screen_name):
        """Check if the current user is following screen_name."""
        params = {"screen_name": screen_name}
        headers, body = self.oauth_client.request(LOOKUP_FRIENDSHIPS_URL + '?' + urlencode(params))

        if headers.status != 200:
            if headers.status == RateLimitHit.status:
                raise RateLimitHit("Too many friendships lookup requests in a 15-minute window!", headers, body)
            raise TwitterError("Friendships lookup failed", headers, body)

        users = json.loads(body.decode())
        if len(users) != 0 and ('following' in users[0]["connections"]):
            return True
        return False

    def create_private_list(self, screen_name):
        """Create a private, empty Twitter list named '<screen_name>'."""
        list_settings = {
            "mode": "private",
            "name": screen_name,
            "description": "Feed for {} as of {}".format(screen_name, datetime.date.today().strftime("%m/%-d/%y"))
        }
        headers, body = self.oauth_client.request(CREATE_LIST_URL + '?' + urlencode(list_settings), method='POST')

        if headers.status != 200:
            if headers.status == RateLimitHit.status:
                raise RateLimitHit("Too many lists created in a 15-minute window!")
            raise TwitterError("Private list creation failed", headers, body)

        new_list = json.loads(body.decode())
        return new_list

    def delete_list(self, list_id):
        """Delete a Twitter list."""
        headers, body = self.oauth_client.request(DELETE_LIST_URL + '?list_id=' + str(list_id), method='POST')

        if headers.status != 200:
            if headers.status == RateLimitHit.status:
                raise RateLimitHit("Too many delete requests within a 15-minute window!", headers, body)
            raise TwitterError("List delete failed", headers, body)

        return True

    def get_rate_limit_status(self, resource_type, endpoint_uri):
        """Get the remaining number of allowed API requests for a Twitter resource type and one of its endpoints.

        https://developer.twitter.com/en/docs/developer-utilities/rate-limit-status/api-reference/get-application-rate_limit_status
        N.B. Twitter simply does not return the rate limit status for some rate-limited endpoints, like /lists/create,
        so, don't rely too heavily on what this returns. Look at API response headers instead.
        """
        headers, body = self.oauth_client.request(LIST_RATE_LIMITS_URL + '?resource=' + resource_type, method='GET')

        if headers.status != 200:
            if headers.status == RateLimitHit.status:
                raise RateLimitHit("Too many requests for rate limit status in 15-minute window!", headers, body)
            raise TwitterError("Failed to get rate limit status", headers, body)

        status_desc_res = json.loads(body.decode())
        endpoint_status_desc = status_desc_res['resources'].get(resource_type, {}).get(endpoint_uri, {})

        return endpoint_status_desc['remaining']

    def add_users_to_list(self, list_id, user_ids):
        """Add a list of Twitter accounts (user_ids) to a Twitter List (list_id)."""
        create_params = {
            "list_id": list_id,
            "user_id": ",".join(user_ids)
        }
        headers, body = self.oauth_client.request(ADD_LIST_MEMBERS_URL, method='POST', body=urlencode(create_params))

        if headers.status != 200:
            if headers.status == RateLimitHit.status:
                raise RateLimitHit("Too many members added to a list within a 15-minute window!")
            raise TwitterError("Failed to add users to a list", headers, body)

        # check for soft rate limit hit
        updated_list = json.loads(body.decode())
        if int(updated_list['member_count']) == 0:
            raise SoftRateLimitHit("Too many list actions performed for today!", headers, body)

        return updated_list


class TwitterError(Exception):
    """Generic Twitter API response error."""
    def __init__(self, message=None, headers=None, body=None):
        if message is None:
            message = str(type(self))
        super().__init__(message)
        self.message = message
        self.headers = headers
        self.body = body

    def __str__(self):
        full_desc = self.message
        if self.headers or self.body:
            full_desc = full_desc + f'. Response details (headers - body): {str(self.headers)} - {str(self.body)}'
        return full_desc


class OAuthRequestError(TwitterError):
    """Generic Twitter OAuth error."""
    pass


class InvalidOAuthResponseError(TwitterError):
    """Twitter either rejected our OAuth credentials, or the response was invalid."""
    pass


class RateLimitHit(TwitterError):
    """Twitter rate limit exceeded response error."""
    status = 429  # http status


class SoftRateLimitHit(TwitterError):
    """Twitter soft (hidden) rate limit exceeded - response is 200 but no actions were performed by Twitter.
    This means that the user can't perform the action again for at least the next 24 hours.
    """
    pass


class TooManyFollowing(TwitterError):
    """Twitter list would have too many members."""
    pass


class ZeroFollowing(TwitterError):
    """Twitter list would have zero members."""
    pass


class UserNotFollowingTarget(TwitterError):
    """Current user isn't following the target user."""
    pass

