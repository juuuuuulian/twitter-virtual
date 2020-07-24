"""Various decorators to mock/patch TwitterClient methods for applying to test cases."""
from twitter_virtual.twitter import TwitterClient
from unittest.mock import Mock, patch


def fake_oauth_token(token, token_secret):
    """Return a mock OAuth token object."""
    return Mock(key=token, secret=token_secret)


def patch_twitter_client_method(method, value):
    """Accept a TwitterClient method name, and either an Exception or a valid return value, and return a decorator
    which patches that TwitterClient method with the exception to raise (as side_effect) or the value to return
    (as return_value)."""
    def create_decorator(func):
        def wrapper(self):
            if isinstance(value, Exception):
                params = {"side_effect": value}
            else:
                params = {"return_value": value}
            with patch.object(TwitterClient, method, **params):
                func(self)
        return wrapper
    return create_decorator


def patch_twitter_check_user_is_following(value):
    """Return a function decorator which patches the TwitterClient.current_user_is_following_user method."""
    return patch_twitter_client_method("current_user_is_following_user", value)


def patch_twitter_get_following_users(value):
    """Return a function decorator which patches the TwitterClient.get_following_user_ids method."""
    return patch_twitter_client_method("get_following_user_ids", value)


def patch_twitter_list_create(value):
    """Return a function decorator which patches the TwitterClient.create_private_list method."""
    return patch_twitter_client_method("create_private_list", value)


def patch_twitter_list_delete(value):
    """Return a function decorator which patches the TwitterClient.delete_list method."""
    return patch_twitter_client_method("delete_list", value)


def patch_twitter_add_list_users(value):
    """Return a function decorator which patches the TwitterClient.add_users_to_list method."""
    return patch_twitter_client_method("add_users_to_list", value)


def patch_twitter_invalidate_token(value):
    """Return a function decorator which patches the TwitterClient.invalidate_token method."""
    return patch_twitter_client_method("invalidate_token", value)


def patch_twitter_get_request_token(value):
    """Return a function decorator which patches the TwitterClient.get_request_token method."""
    return patch_twitter_client_method("get_request_token", value)


def patch_twitter_authorize_oauth_token(value):
    """Return a function decorator which patches the TwitterClient.patch_twitter_authorize_oauth_token_method."""
    return patch_twitter_client_method("authorize_oauth_token", value)
