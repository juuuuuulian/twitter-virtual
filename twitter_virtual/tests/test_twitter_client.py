"""Unit tests for the TwitterClient class."""
from twitter_virtual.tests.base_test_case import BaseTestCase
from twitter_virtual.twitter import TwitterClient, OAuthRequestError, InvalidOAuthResponseError, RateLimitHit, TwitterError
import mock
from urllib.parse import urlencode
import json

fake_token = 'FAKETOKEN'
fake_token_secret = 'FAKESECRET'
fake_authorized_token = 'FAKEAUTHORIZEDTOKEN'
fake_authorized_token_secret = 'FAKEAUTHORIZEDTOKENSECRET'
fake_verifier = 'FAKEVERIFIER'
fake_screen_name = 'FAKESCREENNAME'
fake_list_id = '0000'
fake_user_id = '0000'


def _server_error_response_mock():
    """Mock a Twitter API response where there is a generic server error."""
    headers = mock.MagicMock(status=500)
    body = "Internal Server Error".encode()
    return headers, body


def _rate_limit_api_response_mock():
    """Mock a Twitter API response where a rate limit was hit."""
    headers = mock.MagicMock(status=RateLimitHit.status)
    body = "Too Many Requests!"
    return headers, body


def _callback_unconfirmed_api_response_mock():
    """Mock a Twitter OAuth API response for the token request step (step 1) where the callback is unconfirmed."""
    headers = mock.MagicMock(status=200)
    body = f'oauth_token={fake_token}&oauth_token_secret={fake_token_secret}&oauth_callback_confirmed=false'.encode()
    return headers, body


def _healthy_request_token_api_response_mock():
    """Mock a healthy Twitter OAuth API request token response."""
    headers = mock.MagicMock(status=200)
    body = f'oauth_token={fake_token}&oauth_token_secret={fake_token_secret}&oauth_callback_confirmed=true'.encode()
    return headers, body


def _invalid_oauth_response_mock():
    """Mock a bad Twitter OAuth API response - token value missing."""
    headers = mock.MagicMock(status=200)
    body = f'oauth_token=&oauth_token_secret={fake_token_secret}'.encode()
    return headers, body


def _list_create_response_mock(list_name):
    """Mock a Twitter list create API response."""
    headers = mock.MagicMock(status=200)
    body = json.dumps({"name": list_name}).encode()
    return headers, body


def _following_check_response_mock(screen_name=None, relationship_status=None):
    """Mock a successful Twitter friendship status lookup API response."""
    headers = mock.MagicMock(status=200)
    results = []
    if screen_name:
        results.append({"name": screen_name, "connections": [relationship_status]})
    body = json.dumps(results).encode()
    return headers, body


def _get_following_user_ids_response_mock(user_ids):
    """Mock a successful Twitter list-friend-IDs request."""
    headers = mock.MagicMock(status=200)
    body = json.dumps({"ids": user_ids}).encode()
    return headers, body


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


class TestRequestTokenFetch(BaseTestCase):
    """Tests for the TwitterClient oauth fetch request token method - step 1 of the oauth flow."""
    @patch_oauth_request(response=_server_error_response_mock())
    def test_http_request_failure(self):
        """Check that the proper exception is raised on token request failure."""
        client = TwitterClient()
        with self.assertRaises(OAuthRequestError):
            client.get_request_token()

    @patch_oauth_request(response=_callback_unconfirmed_api_response_mock())
    def test_bad_oauth_response(self):
        """Check that we're verifying the callback_confirmed parameter."""
        client = TwitterClient()
        with self.assertRaises(InvalidOAuthResponseError):
            client.get_request_token()

    @patch_oauth_request(response=_healthy_request_token_api_response_mock())
    def test_successful_token_fetch(self):
        """Check that we're able to correctly parse and return a healthy response."""
        client = TwitterClient()
        token = client.get_request_token()
        self.assertEqual(fake_token, token.key, "Matching request token in request token response")
        self.assertEqual(fake_token_secret, token.secret, "Matching request token secret in request token response")


class TestTwitterAuthorizationURL(BaseTestCase):
    """Tests for the TwitterClient get_authorize_url_for_token method."""
    def test_get_authorize_url(self):
        """Check that the returned URL is valid and has the right token attached."""
        client = TwitterClient()
        for test_token in ['foo', '@bar!', '*@&#*47baz']:
            auth_url = client.get_authorize_url_for_token(oauth_token=test_token)
            encoded_token_param = urlencode({"oauth_token": test_token})
            self.assertTrue((encoded_token_param in auth_url))


class TestAuthorizeRequestToken(BaseTestCase):
    """Tests for the TwitterClient authorize_request_token method - step 3 of the oauth flow."""
    @patch_oauth_request(response=_server_error_response_mock())
    def test_http_request_failure(self):
        """Check that the proper exception is raised if the web request fails."""
        client = TwitterClient()
        with self.assertRaises(OAuthRequestError):
            client.authorize_oauth_token(fake_token, fake_token_secret, fake_verifier)

    @patch_oauth_request(response= _invalid_oauth_response_mock())
    def test_bad_oauth_response(self):
        """Check that we're handling bad token responses."""
        client = TwitterClient()
        with self.assertRaises(InvalidOAuthResponseError):
            client.authorize_oauth_token(fake_token, fake_token_secret, fake_verifier)

    @patch_oauth_request(response=_healthy_request_token_api_response_mock())
    def test_successful_token_authorize(self):
        """Check that we're able to correctly parse and save an authorized token."""
        client = TwitterClient()
        token = client.authorize_oauth_token(fake_token, fake_token_secret, fake_verifier)
        self.assertEqual(fake_token, token.key, "Matching token in authorize response")
        self.assertEqual(fake_token_secret, token.secret, "Matching token secret in authorize response")


class TestListCreate(BaseTestCase):
    """Tests for the TwitterClient list create method."""
    @patch_oauth_request(response=_server_error_response_mock())
    def test_http_request_failure(self):
        """Check that we're catching request failures and throwing a TwitterError."""
        client = TwitterClient()
        with self.assertRaises(TwitterError):
            client.create_private_list(fake_screen_name)

    @patch_oauth_request(response=_rate_limit_api_response_mock())
    def test_rate_limit_failure(self):
        """Check that we're throwing the right exception when we hit a rate limit."""
        client = TwitterClient()
        with self.assertRaises(RateLimitHit):
            client.create_private_list(fake_screen_name)

    @patch_oauth_request(response=_list_create_response_mock(fake_screen_name))
    def test_success(self):
        """Check that we can parse a successful list create response and return it."""
        client = TwitterClient()
        new_list = client.create_private_list(fake_screen_name)
        self.assertEqual(new_list['name'], fake_screen_name)


class TestUserIsFollowing(BaseTestCase):
    """Tests for the TwitterClient current_user_is_following_user method."""
    @patch_oauth_request(response=_server_error_response_mock())
    def test_http_request_failure(self):
        """Check that we're throwing the right exception on server error."""
        client = TwitterClient()
        with self.assertRaises(TwitterError):
            client.current_user_is_following_user(fake_screen_name)

    @patch_oauth_request(response=_rate_limit_api_response_mock())
    def test_rate_limit_failure(self):
        """Check that we're throwing the right exception when we hit a rate limit."""
        client = TwitterClient()
        with self.assertRaises(RateLimitHit):
            client.current_user_is_following_user(fake_screen_name)

    @patch_oauth_request(response=_following_check_response_mock(None, None))
    def test_no_results(self):
        """Check that we handle the case where the friendships lookup returns no results."""
        client = TwitterClient()
        self.assertFalse(client.current_user_is_following_user(fake_screen_name),
                         'Friendship lookup with no results is handled')

    @patch_oauth_request(response=_following_check_response_mock(fake_screen_name, 'none'))
    def test_is_not_following(self):
        """Check for a negative - returns false for a user with no relation."""
        client = TwitterClient()
        self.assertFalse(client.current_user_is_following_user(fake_screen_name), 'Current user is not following user')

    @patch_oauth_request(response=_following_check_response_mock(fake_screen_name, 'following'))
    def test_is_following(self):
        """Check for a positive - returns true for a user with a following relation."""
        client = TwitterClient()
        self.assertTrue(client.current_user_is_following_user(fake_screen_name), 'Current user is following user')


class TestGetFollowingUsers(BaseTestCase):
    """Tests for the TwitterClient get_following_user_ids method."""
    @patch_oauth_request(response=_server_error_response_mock())
    def test_http_request_failure(self):
        """Check that we're throwing the right exception on server error."""
        client = TwitterClient()
        with self.assertRaises(TwitterError):
            client.get_following_user_ids(fake_screen_name)

    @patch_oauth_request(response=_rate_limit_api_response_mock())
    def test_rate_limit_failure(self):
        """Check that we're throwing the right exception when we hit a rate limit."""
        client = TwitterClient()
        with self.assertRaises(RateLimitHit):
            client.get_following_user_ids(fake_screen_name)

    @patch_oauth_request(response=_get_following_user_ids_response_mock(["1", "2", "3"]))
    def test_success(self):
        """Check that we can parse the list of following user IDs and return it."""
        client = TwitterClient()
        following_ids = client.get_following_user_ids(fake_screen_name)
        self.assertEqual(len(following_ids), 3, 'Got following user IDs')


class TestAddUsersToList(BaseTestCase):
    """Tests for the TwitterClient add_users_to_list method."""
    @patch_oauth_request(response=_server_error_response_mock())
    def test_http_request_failure(self):
        """Check that we're throwing the right exception on server error."""
        client = TwitterClient()
        with self.assertRaises(TwitterError):
            client.add_users_to_list(fake_list_id, [fake_user_id])

    @patch_oauth_request(response=_rate_limit_api_response_mock())
    def test_rate_limit_failure(self):
        """Check that we're throwing the right exception when we hit a rate limit."""
        client = TwitterClient()
        with self.assertRaises(RateLimitHit):
            client.add_users_to_list(fake_list_id, [fake_user_id])

    # @patch_oauth_request(response=)
    def test_soft_rate_limit_failure(self):
        pass

    # @patch_oauth_request(response=)
    def test_success(self):
        pass

