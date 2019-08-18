"""Unit tests and integration tests for the OAuth view."""
from twitter_virtual.tests.base_test_case import BaseTestCase
from twitter_virtual.tests.twitter_mocks import patch_oauth_request, server_error_response_mock, \
    invalid_oauth_response_mock, healthy_request_token_api_response_mock
from twitter_virtual.twitter import AUTHORIZE_URL

fake_token = 'FAKETOKEN'
fake_token_secret = 'FAKESECRET'
fake_authorized_token = 'FAKEAUTHORIZEDTOKEN'
fake_authorized_token_secret = 'FAKEAUTHORIZEDTOKENSECRET'
fake_verifier = 'FAKEVERIFIER'
fake_screen_name = 'FAKESCREENNAME'
fake_list_id = '0000'
fake_user_id = '0000'


class TestBeginOAuth(BaseTestCase):
    """Tests for /oauth/begin - step 1 of the OAuth flow."""
    @patch_oauth_request(response=healthy_request_token_api_response_mock(fake_token, fake_token_secret))
    def test_success(self):
        """Check that we're redirected to Twitter to authenticate."""
        response = self.client.get("/oauth/begin", status=302)
        self.assertTrue((AUTHORIZE_URL in response.headers["Location"]), "Redirected to authorize URL")
        self.assertEqual(response.session["token"], fake_token, "OAuth token in session")
        self.assertEqual(response.session["token_secret"], fake_token_secret, "OAuth token secret in session")

    @patch_oauth_request(response=server_error_response_mock())
    def test_oauth_server_error(self):
        """Check that we're catching and handling token fetch errors."""
        response = self.client.get("/oauth/begin", status=500)
        self.assertIsNone(response.session.get("token"), "No token in session on server error")
        self.assertIsNone(response.session.get("token_secret"), "No token secret in session on server error")
        self.assertTrue("OAuth Request Error" in response.text, "Error message in response body")

    @patch_oauth_request(response=invalid_oauth_response_mock(fake_token_secret))
    def test_invalid_oauth_response_error(self):
        """Check that we're catching and handling invalid token fetch response errors."""
        response = self.client.get("/oauth/begin", status=500)
        self.assertIsNone(response.session.get("token"), "No token in session on invalid oauth response")
        self.assertIsNone(response.session.get("token_secret"), "No token secret in session on invalid oauth response")
        self.assertTrue("Invalid OAuth Response" in response.text, "Error message in response body")


class TestOAuthCallback(BaseTestCase):
    """Tests for /oauth/callback - step 3 of the OAuth flow."""
    def test_success(self):
        pass

    def test_oauth_server_error(self):
        pass

    def test_invalid_oauth_response_error(self):
        pass







