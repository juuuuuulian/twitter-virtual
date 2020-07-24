"""Various Twitter API fixture mock methods and decorators for applying to test cases."""
from twitter_virtual.twitter import TwitterClient, RateLimitHit
import mock
from urllib.parse import urlencode
import json


def _api_response_mock(status, body):
    """Mock an OAuth2.request 'response' mock - headers as a MagicMock with a status code, body as an encoded string."""
    headers = mock.MagicMock(status=status)
    return headers, body.encode()


def server_error_response_mock():
    """Mock a Twitter API response where there is a generic server error."""
    return _api_response_mock(500, "Internal Server Error")


def rate_limit_api_response_mock():
    """Mock a Twitter API response where a rate limit was hit."""
    return _api_response_mock(RateLimitHit.status, "Too Many Requests!")


def _oauth_credential_string(token, secret, callback_confirmed):
    """Return a URL-encoded string of oauth credential parameters - used for mock verification responses."""
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


def following_users(user_ids, more_available=False):
    """Return a sample parsed response from the list friends Twitter API method."""
    next_cursor = 1 if more_available else 0
    return {"ids": user_ids, "next_cursor": next_cursor}


def get_following_user_ids_response_mock(user_ids):
    """Mock a successful Twitter list-friend-IDs request."""
    return _api_response_mock(200, json.dumps(following_users(user_ids)))


def twitter_list(name, list_id, member_count):
    """Mock a Twitter List object as a dict."""
    return {"name": name, "id": list_id, "id_str": str(list_id), "member_count": member_count, "uri": "/test/list/uri"}


def twitter_list_json(name, list_id, member_count):
    """Mock a Twitter List object and return it as a JSON string."""
    return json.dumps(twitter_list(name, list_id, member_count))


def list_create_response_mock(list_name, list_id):
    """Mock a successful Twitter list create API response."""
    return _api_response_mock(200, twitter_list_json(list_name, list_id, 0))


def add_list_users_soft_rate_limit_response_mock(list_name, list_id):
    """Mock a Twitter add list members API response where we've hit a soft rate limit - no members added."""
    return list_create_response_mock(list_name, list_id)


def add_list_users_response_mock(list_name, list_id):
    """Mock a successful Twitter add list members API response."""
    return _api_response_mock(200, twitter_list_json(list_name, list_id, 1))

