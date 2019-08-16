"""Various mocked API responses from Twitter."""
from twitter_virtual.twitter import RateLimitHit
import mock
from urllib.parse import urlencode
import json


def _api_response_mock(status, body):
    headers = mock.MagicMock(status=status)
    return headers, body.encode()


def server_error_response_mock():
    """Mock a Twitter API response where there is a generic server error."""
    return _api_response_mock(500, "Internal Server Error")


def rate_limit_api_response_mock():
    """Mock a Twitter API response where a rate limit was hit."""
    return _api_response_mock(RateLimitHit.status, "Too Many Requests!")


def _oauth_credential_string(token, secret, callback_confirmed):
    return urlencode({"oauth_token": token, "oauth_token_secret": secret,
                      "oauth_callback_confirmed": callback_confirmed})


def callback_unconfirmed_api_response_mock(token, secret):
    """Mock a Twitter OAuth API response for the token request step (step 1) where the callback is unconfirmed."""
    return _api_response_mock(200, _oauth_credential_string(token, secret, "false"))


def healthy_request_token_api_response_mock(token, secret):
    """Mock a healthy Twitter OAuth API request token response."""
    return _api_response_mock(200, _oauth_credential_string(token, secret, "true"))


def invalid_oauth_response_mock(secret):
    """Mock a bad Twitter OAuth API response - token value missing."""
    return _api_response_mock(200, _oauth_credential_string("", secret, "true"))


def following_check_response_mock(screen_name=None, relationship_status=None):
    """Mock a successful Twitter friendship status lookup API response."""
    results = []
    if screen_name:
        results.append({"name": screen_name, "connections": [relationship_status]})
    return _api_response_mock(200, json.dumps(results))


def get_following_user_ids_response_mock(user_ids):
    """Mock a successful Twitter list-friend-IDs request."""
    return _api_response_mock(200, json.dumps({"ids": user_ids}))


def _twitter_list_json(name, id, member_count):
    return json.dumps({"name": name, "id": id, "member_count": member_count})


def list_create_response_mock(list_name, list_id):
    """Mock a successful Twitter list create API response."""
    return _api_response_mock(200, _twitter_list_json(list_name, list_id, 0))


def add_list_users_soft_rate_limit_response_mock(list_name, list_id):
    """Mock a Twitter add list members API response where we've hit a soft rate limit - no members added."""
    return list_create_response_mock(list_name, list_id)


def add_list_users_response_mock(list_name, list_id):
    """Mock a successful Twitter add list members API response."""
    return _api_response_mock(200, _twitter_list_json(list_name, list_id, 1))


def patch_oauth_request(response):
    """Patch the oauth2.Client request method to return the response arg, and assert that .request was called."""
    def create_decorator(func):
        @mock.patch('oauth2.Client.request')
        def wrapper(self, req_mock):
            req_mock.return_value = response
            func(self)
            req_mock.assert_called()
        return wrapper
    return create_decorator
