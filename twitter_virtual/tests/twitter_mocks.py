"""Various Twitter API mock methods and decorators for applying to tests."""
from twitter_virtual.twitter import TwitterClient, RateLimitHit
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


def following_users(user_ids, more_available=False):
    """Return a sample parsed response from the list friends Twitter API method."""
    next_cursor = 1 if more_available else 0
    return {"ids": user_ids, "next_cursor": next_cursor}


def get_following_user_ids_response_mock(user_ids):
    """Mock a successful Twitter list-friend-IDs request."""
    return _api_response_mock(200, json.dumps(following_users(user_ids)))


def twitter_list(name, list_id, member_count):
    return {"name": name, "id": list_id, "id_str": str(list_id), "member_count": member_count}


def twitter_list_json(name, list_id, member_count):
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


def patch_twitter_client_method(method, params):
    def create_decorator(func):
        def wrapper(self):
            with mock.patch.object(TwitterClient, method, **params):
                func(self)
        return wrapper
    return create_decorator


def patch_twitter_client_method_new(method, value):
    """Accept a TwitterClient method name, and either an Exception or a valid return value, and return a decorator
    which patches that TwitterClient method with the exception to raise (as side_effect) or the value to return
    (as return_value)."""
    def create_decorator(func):
        def wrapper(self):
            if isinstance(value, Exception):
                params = {"side_effect": value}
            else:
                params = {"return_value": value}
            with mock.patch.object(TwitterClient, method, **params):
                func(self)
        return wrapper
    return create_decorator


def patch_twitter_check_user_is_following(value):
    """Return a function decorator which patches the TwitterClient.current_user_is_following_user method."""
    return patch_twitter_client_method_new("current_user_is_following_user", value)


def patch_twitter_get_following_users(value):
    """Return a function decorator which patches the TwitterClient.get_following_user_ids method."""
    return patch_twitter_client_method_new("get_following_user_ids", value)


def patch_twitter_list_create(value):
    """Return a function decorator which patches the TwitterClient.create_private_list method."""
    return patch_twitter_client_method_new("create_private_list", value)


def patch_twitter_list_delete(value):
    """Return a function decorator which patches the TwitterClient.delete_list method."""
    return patch_twitter_client_method_new("delete_list", value)


def patch_twitter_add_list_users(value):
    """Return a function decorator which patches the TwitterClient.add_users_to_list method."""
    return patch_twitter_client_method_new("add_users_to_list", value)
