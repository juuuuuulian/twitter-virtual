"""Integration tests for the twitter webapp view."""
from twitter_virtual.tests.base_test_case import BaseTestCase
from twitter_virtual.tests.twitter_mocks import patch_twitter_add_list_users, patch_twitter_check_user_is_following, \
    patch_twitter_get_following_users, patch_twitter_list_create, patch_twitter_list_delete, \
    patch_twitter_invalidate_token
from twitter_virtual.tests.twitter_api_mocks import following_users, twitter_list
from twitter_virtual.twitter import TwitterError, RateLimitHit, SoftRateLimitHit
from twitter_virtual.models import AppUse
from twitter_virtual.recaptcha import RecaptchaTimeoutOrDuplicate
from twitter_virtual.tests.recaptcha_mocks import patch_recaptcha_verify_token_method
import datetime


fake_token = 'FAKETOKEN'
fake_token_secret = 'FAKESECRET'
fake_authorized_token = 'FAKEAUTHORIZEDTOKEN'
fake_authorized_token_secret = 'FAKEAUTHORIZEDTOKENSECRET'
fake_verifier = 'FAKEVERIFIER'
fake_screen_name = 'FAKESCREENNAME'
fake_invalid_screen_names = ['FAKE NAME', '@FAKE NAME', 'FA$aKeNa|me', 'FAKENAMEFAKENAME']
fake_list_id = '0000'
fake_user_id = '0000'
fake_captcha_token = "FAKERECAPTCHATOKEN"


class TestBegin(BaseTestCase):
    """Tests for /twitter/begin."""
    def _check_response_body(self, response, expected_text):
        response.mustcontain(expected_text)

    def _do_request(self, target_screen_name=None, captcha_response_token="", expected_status=200, expected_error_msg=None):
        """Make a POST request to /twitter/begin with target_screen_name and captcha_response_token values, and
        assert-check the HTTP response code against expected_status and the body for expected_error_msg."""
        response = self.client.post("/twitter/begin", {
            "target_screen_name": target_screen_name,
            "captcha_response_token": captcha_response_token},
            status=expected_status)
        if expected_error_msg:
            self._check_response_body(response, expected_error_msg)
        return response

    @patch_recaptcha_verify_token_method(True)
    def test_success(self):
        """Test case where we have valid target screen name and captcha response token values - expect redirect."""
        response = self._do_request(fake_screen_name, fake_captcha_token, 302)
        self.assertTrue(("/oauth/begin" in response.headers["Location"]), "Redirected to /oauth/begin")

    @patch_recaptcha_verify_token_method(True)
    def test_screen_name_missing(self):
        """Test case where target screen name value is missing - expect an error message in the response body."""
        self._do_request("", fake_captcha_token, 500, "Please enter a screen name")

    @patch_recaptcha_verify_token_method(True)
    def test_screen_name_invalid(self):
        """Test case where the target screen name is invalid."""
        for invalid_screen_name in fake_invalid_screen_names:
            self._do_request(invalid_screen_name, fake_captcha_token, 500,
                             "Please enter a valid screen name (letters, numbers, and underscores only)")

    @patch_recaptcha_verify_token_method(RecaptchaTimeoutOrDuplicate("Test recaptcha exception"))
    def test_expired_captcha_token(self):
        """Test case where the captcha_response_token is expired - expect an error message in the response body."""
        self._do_request(fake_screen_name, fake_captcha_token, 500, "Test recaptcha exception")


class TestCopyFeed(BaseTestCase):
    """Integration tests for /twitter/copy_feed."""
    def setUp(self):
        super().setUp()
        self.app.config["LIMIT_APP_USE"] = False

    def _set_token(self, token, token_secret):
        with self.client.session_transaction() as sess:
            sess["token"] = token
            sess["token_secret"] = token_secret

    def _set_target_screen_name(self, target_screen_name):
        with self.client.session_transaction() as sess:
            sess["target_screen_name"] = target_screen_name

    def _check_response_body(self, response, expected_text):
        response.mustcontain(expected_text)

    def _do_request(self, set_token=True, set_target_screen_name=True, expected_status=200, expected_error_msg=None):
        """Set the OAuth token and the target screen name values in the session, perform the request, then finally check
        the response body for an error message."""
        # set twitter oauth token in session
        if set_token:
            self._set_token(fake_token, fake_token_secret)
        else:
            self._set_token(None, None)

        # set target user screen name
        if set_target_screen_name:
            self._set_target_screen_name(fake_screen_name)
        else:
            self._set_target_screen_name(None)

        response = self.client.get("/twitter/copy_feed", status=expected_status)

        # check for an error message in the response body
        if expected_error_msg:
            self._check_response_body(response, expected_error_msg)

        return response

    def test_token_missing(self):
        """Test case where OAuth token is missing from session."""
        self._do_request(set_token=False, set_target_screen_name=True, expected_status=500,
                         expected_error_msg="Missing OAuth Token")

    def test_screen_name_missing(self):
        """Test case where target screen name is missing from session."""
        self._do_request(set_token=True, set_target_screen_name=False, expected_status=500,
                         expected_error_msg="Missing target screen name")

    def test_app_used_today_session_flag(self):
        """Test case where the user has already successfully used our application once in the last 24 hours."""
        self.app.config["LIMIT_APP_USE"] = True
        with self.client.session_transaction() as sess:
            sess["last_app_use"] = datetime.datetime.utcnow().timestamp() - 3  # a few seconds ago
        self._do_request(set_token=True, set_target_screen_name=True, expected_status=500,
                         expected_error_msg="App used once today already")
        self.app.config["LIMIT_APP_USE"] = False

    def test_app_used_today_database_flag(self):
        """Test case where the user has already successfully used our application once in the last 24 hours."""
        self.app.config["LIMIT_APP_USE"] = True
        with self.app.app_context():
            last_app_use = datetime.datetime.utcnow()
            self.db.session.add(AppUse(date=last_app_use, remote="127.0.0.1"))  # insert an app_use record
            self.db.session.commit()
        self._do_request(set_token=True, set_target_screen_name=True, expected_status=500,
                         expected_error_msg="App used once today already")
        self.app.config["LIMIT_APP_USE"] = False
        with self.app.app_context():
            AppUse.query.delete()
            self.db.session.commit()

    @patch_twitter_invalidate_token(True)
    @patch_twitter_check_user_is_following(False)
    def test_user_not_following_target(self):
        """Test case where user is not following the target."""
        self._do_request(expected_status=500, expected_error_msg="Please enter a screen name that you are following")

    @patch_twitter_invalidate_token(True)
    @patch_twitter_get_following_users(following_users([]))
    @patch_twitter_check_user_is_following(True)
    def test_target_following_nobody(self):
        """Test case where the target isn't following anyone."""
        self._do_request(expected_status=500,
                         expected_error_msg="Please enter a screen name that is following other users")

    @patch_twitter_invalidate_token(True)
    @patch_twitter_get_following_users(following_users(list(range(0, 5001)), more_available=True))
    @patch_twitter_check_user_is_following(True)
    def test_target_following_too_many(self):
        """Test case where the target is following too many people."""
        self._do_request(expected_status=500,
                         expected_error_msg="Please enter a screen name that is following fewer than 5000 other users")

    @patch_twitter_invalidate_token(True)
    @patch_twitter_list_create(TwitterError("Test Server Error"))
    @patch_twitter_get_following_users(following_users(list(range(1, 4))))
    @patch_twitter_check_user_is_following(True)
    def test_list_create_fail_twitter_server_error(self):
        """Test case where private list creation fails due to a Twitter API server error response."""
        self._do_request(expected_status=500, expected_error_msg="Please try again later")

    @patch_twitter_invalidate_token(True)
    @patch_twitter_list_create(RateLimitHit("Test Rate Limit Hit"))
    @patch_twitter_get_following_users(following_users([3, 4]))
    @patch_twitter_check_user_is_following(True)
    def test_list_create_fail_twitter_rate_limit(self):
        """Test case where private list creation fails due to us hitting a rate limit - expect an error response."""
        self._do_request(expected_status=500, expected_error_msg="Please try again in 30 minutes")

    @patch_twitter_invalidate_token(True)
    @patch_twitter_list_delete(True)
    @patch_twitter_add_list_users(SoftRateLimitHit("Test Soft Rate Limit Hit"))
    @patch_twitter_list_create(twitter_list(fake_screen_name, fake_list_id, 1))
    @patch_twitter_get_following_users(following_users([1]))
    @patch_twitter_check_user_is_following(True)
    def test_soft_rate_limit_hit_mid_list(self):
        """Test that we can detect soft rate limit hits while the user list is being copied."""
        self._do_request(expected_status=500,
                         expected_error_msg="Please try again tomorrow - our application has hit a Twitter rate limit")

    @patch_twitter_invalidate_token(True)
    @patch_twitter_list_delete(True)
    @patch_twitter_add_list_users(twitter_list(fake_screen_name, fake_list_id, 169))  # >100 less than what we fetched
    @patch_twitter_list_create(twitter_list(fake_screen_name, fake_list_id, 0))
    @patch_twitter_get_following_users(following_users(list(range(1, 301))))
    @patch_twitter_check_user_is_following(True)
    def test_soft_rate_limit_hit_post_list(self):
        """Test that we can detect soft rate limit hits after the user list is copied."""
        self._do_request(expected_status=500,
                         expected_error_msg="Please try again tomorrow - our application has hit a Twitter rate limit")

    @patch_twitter_invalidate_token(True)
    @patch_twitter_add_list_users(twitter_list(fake_screen_name, fake_list_id, 220))
    @patch_twitter_list_create(twitter_list(fake_screen_name, fake_list_id, 0))
    @patch_twitter_get_following_users(following_users(list(range(1, 221))))
    @patch_twitter_check_user_is_following(True)
    def test_success(self):
        """Test successful feed copy."""
        with self.app.app_context():
            self.assertEqual(AppUse.query.count(), 0, "No app uses in database")
        response = self._do_request(expected_status=200)
        self._check_response_body(response, "Success")
        # self.assertTrue(("/twitter/success" in response.headers["Location"]), "Redirected to /twitter/success")
        with self.app.app_context():
            self.assertEqual(AppUse.query.count(), 1, "App use recorded")
            AppUse.query.delete()
            self.db.session.commit()
