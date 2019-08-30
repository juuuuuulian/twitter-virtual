"""Integration tests for the twitter view."""
from twitter_virtual.tests.base_test_case import BaseTestCase
from twitter_virtual.tests.twitter_mocks import twitter_list, \
    patch_twitter_add_list_users, patch_twitter_check_user_is_following, patch_twitter_get_following_users, \
    patch_twitter_list_create, patch_twitter_list_delete
from twitter_virtual.twitter import TwitterError, RateLimitHit, SoftRateLimitHit

fake_token = 'FAKETOKEN'
fake_token_secret = 'FAKESECRET'
fake_authorized_token = 'FAKEAUTHORIZEDTOKEN'
fake_authorized_token_secret = 'FAKEAUTHORIZEDTOKENSECRET'
fake_verifier = 'FAKEVERIFIER'
fake_screen_name = 'FAKESCREENNAME'
fake_list_id = '0000'
fake_user_id = '0000'


class TestBegin(BaseTestCase):
    """Tests for /twitter/begin."""
    def test_success(self):
        response = self.client.post("/twitter/begin", {"target_screen_name": fake_screen_name}, status=302)
        self.assertTrue(("/oauth/begin" in response.headers["Location"]), "Redirected to /oauth/begin")

    def test_screen_name_missing(self):
        self.client.post("/twitter/begin", {"target_screen_name": ""}, status=500)
        self.client.post("/twitter/begin", {}, status=500)


class TestCopyFollowing(BaseTestCase):
    """Integration tests for /twitter/copy_following."""
    def _set_token(self, token, token_secret):
        with self.client.session_transaction() as sess:
            sess["token"] = token
            sess["token_secret"] = token_secret

    def _set_target_screen_name(self, target_screen_name):
        with self.client.session_transaction() as sess:
            sess["target_screen_name"] = target_screen_name

    def _do_request(self, set_token=True, set_target_screen_name=True, expected_status=200, expected_error_msg=None):
        """Set the OAuth token and target screen name values in the session, perform the request, then check the response
        body for an error message."""
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

        response = self.client.get("/twitter/copy_following", status=expected_status)

        # check for an error message in the response body
        if expected_error_msg:
            self._check_response_body(response, expected_error_msg)

        return response

    def _check_response_body(self, response, expected_text):
        self.assertTrue(expected_text in response.text, f'Got "{expected_text}" in response body')

    def test_token_missing(self):
        """Test case where OAuth token is missing from session."""
        self._do_request(set_token=False, set_target_screen_name=True, expected_status=500,
                         expected_error_msg="Missing OAuth Token")

    def test_screen_name_missing(self):
        """Test case where target screen name is missing from session."""
        self._do_request(set_token=True, set_target_screen_name=False, expected_status=500,
                         expected_error_msg="Missing target screen name")

    @patch_twitter_check_user_is_following(False)
    def test_user_not_following_target(self):
        """Test case where user is not following the target."""
        self._do_request(expected_status=500, expected_error_msg="Please enter a screen name that you are following")

    @patch_twitter_get_following_users({"ids": [], "next_cursor": 0})
    @patch_twitter_check_user_is_following(True)
    def test_target_following_nobody(self):
        """Test case where the target isn't following anyone."""
        self._do_request(expected_status=500,
                         expected_error_msg="Please enter a screen name that is following other users")

    @patch_twitter_get_following_users({"ids": list(range(0, 5001)), "next_cursor": 5})
    @patch_twitter_check_user_is_following(True)
    def test_target_following_too_many(self):
        """Test case where the target is following too many people."""
        self._do_request(expected_status=500,
                         expected_error_msg="Please enter a screen name that is following fewer than 5000 other users")

    @patch_twitter_list_create(TwitterError("Test Server Error"))
    @patch_twitter_get_following_users({"ids": [1, 2, 3], "next_cursor": 0})
    @patch_twitter_check_user_is_following(True)
    def test_list_create_fail_twitter_server_error(self):
        """Test case where private list creation fails due to a Twitter API server error response."""
        self._do_request(expected_status=500, expected_error_msg="Please try again later")

    @patch_twitter_list_create(RateLimitHit("Test Rate Limit Hit"))
    @patch_twitter_get_following_users({"ids": [3, 4], "next_cursor": 0})
    @patch_twitter_check_user_is_following(True)
    def test_list_create_fail_twitter_rate_limit(self):
        """Test case where private list creation fails due to us hitting a rate limit - expect an error response."""
        self._do_request(expected_status=500, expected_error_msg="Please try again in 30 minutes")

    @patch_twitter_list_delete(True)
    @patch_twitter_add_list_users(SoftRateLimitHit("Test Soft Rate Limit Hit"))
    @patch_twitter_list_create(twitter_list(fake_screen_name, fake_list_id, 1))
    @patch_twitter_get_following_users({"ids": [1], "next_cursor": 0})
    @patch_twitter_check_user_is_following(True)
    def test_soft_rate_limit_hit_mid_list(self):
        """Test that we can detect soft rate limit hits while the users list is being copied."""
        self._do_request(expected_status=500,
                         expected_error_msg="Please try again tomorrow - our application has hit a Twitter rate limit")

    @patch_twitter_list_delete(True)
    @patch_twitter_add_list_users(twitter_list(fake_screen_name, fake_list_id, 169))
    @patch_twitter_list_create(twitter_list(fake_screen_name, fake_list_id, 0))
    @patch_twitter_get_following_users({"ids": list(range(1, 301)), "next_cursor": 0})
    @patch_twitter_check_user_is_following(True)
    def test_soft_rate_limit_hit_post_list(self):
        """Test that we can detect soft rate limit hits after the user list is copied."""
        self._do_request(expected_status=500,
                         expected_error_msg="Please try again tomorrow - our application has hit a Twitter rate limit")

    @patch_twitter_add_list_users(twitter_list(fake_screen_name, fake_list_id, 220))
    @patch_twitter_list_create(twitter_list(fake_screen_name, fake_list_id, 0))
    @patch_twitter_get_following_users({"ids": list(range(1, 221)), "next_cursor": 0})
    @patch_twitter_check_user_is_following(True)
    def test_success(self):
        """Test successful following copy."""
        response = self._do_request(expected_status=302)
        self.assertTrue(("/twitter/success" in response.headers["Location"]), "Redirected to /twitter/success")

