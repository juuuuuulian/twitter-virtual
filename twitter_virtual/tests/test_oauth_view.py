"""Unit tests and integration tests for the OAuth view."""
from twitter_virtual.tests.base_test_case import BaseTestCase
from twitter_virtual.tests.twitter_mocks import patch_twitter_get_request_token, patch_twitter_authorize_oauth_token, \
    fake_oauth_token
from twitter_virtual.twitter import AUTHORIZE_URL, OAuthRequestError, InvalidOAuthResponseError

fake_token = 'FAKETOKEN'
fake_token_secret = 'FAKESECRET'
fake_authorized_token = 'FAKEAUTHORIZEDTOKEN'
fake_authorized_token_secret = 'FAKEAUTHORIZEDTOKENSECRET'
fake_verifier = 'FAKEVERIFIER'


class TestBeginOAuth(BaseTestCase):
    """Tests for /oauth/begin - step 1 of the OAuth flow."""
    @patch_twitter_get_request_token(fake_oauth_token(fake_token, fake_token_secret))
    def test_success(self):
        """Check that we're redirected to Twitter to authenticate."""
        response = self.client.get("/oauth/begin", status=302)
        self.assertTrue((AUTHORIZE_URL in response.headers["Location"]), "Redirected to authorize URL")
        self.assertEqual(response.session.get("token"), fake_token, "OAuth token in session")
        self.assertEqual(response.session.get("token_secret"), fake_token_secret, "OAuth token secret in session")

    @patch_twitter_get_request_token(OAuthRequestError("Test Token Fetch Server Fail"))
    def test_oauth_server_error(self):
        """Check that we're catching and handling token fetch errors."""
        response = self.client.get("/oauth/begin", status=500)
        self.assertIsNone(response.session.get("token"), "No token in session on server error")
        self.assertIsNone(response.session.get("token_secret"), "No token secret in session on server error")
        self.assertTrue("OAuth Request Error" in response.text, "Error message in response body")

    @patch_twitter_get_request_token(InvalidOAuthResponseError("Test Token Fetch Invalid"))
    def test_invalid_oauth_response_error(self):
        """Check that we're catching and handling invalid token fetch response errors."""
        response = self.client.get("/oauth/begin", status=500)
        self.assertIsNone(response.session.get("token"), "No token in session on invalid oauth response")
        self.assertIsNone(response.session.get("token_secret"), "No token secret in session on invalid oauth response")
        self.assertTrue("Invalid OAuth Response" in response.text, "Error message in response body")


class TestOAuthCallback(BaseTestCase):
    """Tests for /oauth/callback - step 3 of the OAuth flow."""
    @patch_twitter_authorize_oauth_token(fake_oauth_token(fake_authorized_token, fake_authorized_token_secret))
    def test_success(self):
        """Check that we're redirected to the twitter view on success."""
        with self.client.session_transaction() as sess:
            sess['token'] = fake_token
            sess['token_secret'] = fake_token_secret
        response = self.client.get("/oauth/callback", {"oauth_verifier": fake_verifier}, status=302)
        self.assertTrue(("/twitter/copy_feed" in response.headers["Location"]), "Redirected to twitter view")
        self.assertEqual(response.session.get("token"), fake_authorized_token, "Access token in session")
        self.assertEqual(response.session.get("token_secret"), fake_authorized_token_secret, "Access token secret in session")

    def test_missing_token(self):
        """Check that we're returning an error when we don't have a token in the user's session."""
        response = self.client.get("/oauth/callback", {"oauth_verifier": fake_verifier}, status=500)
        self.assertTrue("Missing OAuth Token" in response.text, "Error message in response body")

    def test_missing_verifier(self):
        """Check that we're returning an error when the oauth_verifier parameter is missing."""
        with self.client.session_transaction() as sess:
            sess['token'] = fake_token
            sess['token_secret'] = fake_token_secret

        response = self.client.get("/oauth/callback", status=500)
        self.assertTrue("Missing OAuth Verifier" in response.text, "Error message in response body")

    @patch_twitter_authorize_oauth_token(OAuthRequestError("Test Token Authorize Server Fail"))
    def test_oauth_server_error(self):
        """Check that we're returning an error when the Twitter API returns a server error."""
        with self.client.session_transaction() as sess:
            sess['token'] = fake_token
            sess['token_secret'] = fake_token_secret
        response = self.client.get("/oauth/callback", {"oauth_verifier": fake_verifier}, status=500)
        self.assertTrue("OAuth Request Error" in response.text, "Error message in response body")

    @patch_twitter_authorize_oauth_token(InvalidOAuthResponseError("Test Token Authorize Invalid"))
    def test_invalid_oauth_response_error(self):
        with self.client.session_transaction() as sess:
            sess['token'] = fake_token
            sess['token_secret'] = fake_token_secret
        response = self.client.get("/oauth/callback", {"oauth_verifier": fake_verifier}, status=500)
        self.assertTrue("Invalid OAuth Response" in response.text, "Error message in response body")
