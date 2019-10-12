"""Simple API for recaptcha response validation."""
import requests
import json

VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


class RecaptchaClient():
    """Class for interacting with the ReCaptcha verification API."""
    def __init__(self, secret):
        self.secret = secret

    @classmethod
    def from_flask_app(cls, flask_app):
        return cls(secret=flask_app.config["RECAPTCHA_SECRET"])

    def verify_token(self, response_token):
        """Verify a user's recaptcha success response token. https://developers.google.com/recaptcha/docs/verify"""
        resp = requests.post(VERIFY_URL, data={"secret": self.secret, "response": response_token})
        resp_body = json.loads(resp.content)

        if resp_body["success"]:
            return True

        error_codes = resp_body["error-codes"]
        if "timeout-or-duplicate" in error_codes:
            raise RecaptchaTimeoutOrDuplicate("Your captcha has expired, please fill out the captcha and try again",
                                              resp.content)
        else:
            raise RecaptchaError("Our service had a hiccup, please fill out the captcha and try again",
                                 resp.content)


class RecaptchaError(Exception):
    """Generic ReCaptcha validation exception."""
    def __init__(self, msg, response=None):
        """Stash the validation response body."""
        self.response = response
        self.user_error_msg = msg
        super().__init__(msg)


class RecaptchaTimeoutOrDuplicate(RecaptchaError):
    """The ReCaptcha response token expired or has already been validated."""
    pass
