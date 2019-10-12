"""Decorators and mock methods for testing the recaptcha client."""
import mock
from twitter_virtual.recaptcha import RecaptchaClient

def patch_recaptcha_verify_token_method(value):
    """Accept an Exception or a valid return value, and return a decorator which patches the recaptcha.verify_token
    method with the exception to raise (as side_effect) or the value to return (as return_value)."""
    def create_decorator(func):
        def wrapper(self):
            if isinstance(value, Exception):
                params = {"side_effect": value}
            else:
                params = {"return_value": value}
            with mock.patch.object(RecaptchaClient, "verify_token", **params):
                func(self)
        return wrapper
    return create_decorator

