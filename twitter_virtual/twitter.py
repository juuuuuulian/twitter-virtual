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


class TwitterClient:
    """Class for interacting with the Twitter API as a Twitter user via OAuth."""
    def __init__(self):
        """Load config and initialize an oauth2 client."""
        consumer_key = os.environ.get('TWITTER_CONSUMER_KEY')
        consumer_secret = os.environ.get('TWITTER_CONSUMER_SECRET')

        consumer = oauth2.Consumer(key=consumer_key, secret=consumer_secret)
        self.oauth_client = oauth2.Client(consumer)

    def get_request_token(self):
        """Get a Twitter OAuth request token for step 1 of OAuth flow."""
        client = self.oauth_client
        callback_url = os.environ.get('TWITTER_CALLBACK_URL')

        # ask twitter for a token to perform oauth
        request_body = urlencode({'oauth_callback': callback_url})
        headers, body = client.request(REQUEST_TOKEN_URL, method='POST', body=request_body)

        if headers.status == 200:
            resp_vals = parse_qs(body.decode())
            token = resp_vals.get('oauth_token')[0]
            token_secret = resp_vals.get('oauth_token_secret')[0]
            callback_confirmed = resp_vals.get('oauth_callback_confirmed')[0]

            if callback_confirmed != "true":
                log.error("Bad token request response, callback unconfirmed: {} - {}".format(headers.status, body.decode()))
                return None

            log.info("Fetched a request token successfully")
            return token, token_secret
        else:
            log.error("Token request failed, response: {} - {}".format(str(headers.status), body.decode()))
            return None

    def get_authorize_url_for_token(self, oauth_token):
        """Get a Twitter OAuth authorization URL for step 2 of OAuth."""
        twitter_auth_url = AUTHORIZE_URL
        if twitter_auth_url[-1] != '?':
            twitter_auth_url = twitter_auth_url + '?'
        return twitter_auth_url + urlencode({'oauth_token': oauth_token})

    def authorize_oauth_token(self, oauth_token, oauth_token_secret, oauth_verifier):
        """"Get an OAuth token from Twitter using an authorized request token - final step of three-legged OAuth."""
        token = oauth2.Token(oauth_token, oauth_token_secret)
        token.set_verifier(oauth_verifier)
        self.oauth_client.token = token
        headers, body = self.oauth_client.request(ACCESS_TOKEN_URL, method='POST')

        if headers.status == 200:
            resp_vals = parse_qs(body.decode())
            oauth_token = resp_vals.get('oauth_token')[0]
            oauth_token_secret = resp_vals.get('oauth_token_secret')[0]
            log.info("Exchanged a request token for an oauth token successfully")
            authorized_token = oauth2.Token(oauth_token, oauth_token_secret)
            authorized_token.set_verifier(oauth_verifier)
            self.oauth_client.token = authorized_token
            return oauth_token, oauth_token_secret
        else:
            log.error("Token exchange request failed, response: {} - {}".format(str(headers.status), body.decode()))
        return None

    def get_following_users(self, screen_name):
        """Get the full list of users who screen_name follows on Twitter."""
        params = {"screen_name": screen_name, "stringify_ids": "true"}
        headers, body = self.oauth_client.request(LIST_FRIENDS_URL + '?' + urlencode(params), method='GET')
        if headers.status == 200:
            response = json.loads(body.decode())
            following_ids = response.get('ids', [])
            return following_ids
        else:
            log.error(
                "Error fetching following users for '{}': {} - {}".format(screen_name, headers.status, body.decode()))
            return None

    def create_private_list(self, screen_name):
        """Create a private, empty Twitter list named 'Feed for <screen_name>'."""
        list_settings = {
            "mode": "private",
            "name": screen_name,
            "description": "Feed for {} as of {}".format(screen_name, datetime.date.today().strftime("%m/%-d/%y"))
        }
        headers, body = self.oauth_client.request(CREATE_LIST_URL + '?' + urlencode(list_settings), method='POST')
        if headers.status != 200:
            if headers.status == RateLimitHit.status:
                raise RateLimitHit("Too many lists created in a 15-minute window!")
            else:
                log.error("Error creating list for '{}': {} - {}".format(screen_name, headers.status, body.decode()))
                return None

        new_list = json.loads(body.decode())
        return new_list

    def delete_list(self, list_id):
        """Delete a Twitter list."""
        headers, body = self.oauth_client.request(DELETE_LIST_URL + '?list_id=' + list_id)
        if headers.status != 200:
            if headers.status == RateLimitHit.status:
                raise RateLimitHit("Too many delete requests within a 15-minute window!", headers, body)
            raise TwitterError("List delete failed", headers, body)
        return True

    def get_rate_limit_status(self, resource_type, endpoint_uri):
        """Get the remaining allowed API requests count for a Twitter resource type and one of its endpoints.

        https://developer.twitter.com/en/docs/developer-utilities/rate-limit-status/api-reference/get-application-rate_limit_status
        N.B. Twitter simply does not return the rate limit status for some rate-limited endpoints, like /lists/create,
        so, don't rely too heavily on what this returns. Look at API response headers instead.
        """
        headers, body = self.oauth_client.request(LIST_RATE_LIMITS_URL + '?resource=' + resource_type, method='GET')
        if headers.status != 200:
            raise Exception("Failed to get rate limit status: {} - {}".format(headers.status, body.decode()))

        status_desc_res = json.loads(body.decode())
        endpoint_status_desc = status_desc_res['resources'].get(resource_type, {}).get(endpoint_uri)

        if endpoint_status_desc is None:  # does twitter return 4XX status in this case?
            raise Exception(
                "Failed to get rate limit status for Twitter endpoint '{}' of type '{}', full resp: {}".format(
                    endpoint_uri, resource_type, body.decode()))

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
            raise Exception("Failed to add members to a list: {} - {}".format(headers.status, body.decode()))

        return True


class TwitterError(Exception):
    """Generic Twitter API response error."""
    def __init__(self, message, headers=None, body=None):
        super().__init__(message)
        self.headers = headers
        self.body = body


class RateLimitHit(TwitterError):
    """Twitter rate limit exceeded response error."""
    status = 429  # http status


class SoftRateLimitHit(TwitterError):
    """Twitter soft (hidden) rate limit exceeded - response is 200 but no actions were performed by Twitter."""
    pass


class DuplicateList(TwitterError):
    """Twitter list already exists error."""
    pass


class TooManyFollowing(TwitterError):
    """Twitter list would have too many members error."""
    pass


class ZeroFollowing(TwitterError):
    """Twitter list would have zero members error."""
    pass

