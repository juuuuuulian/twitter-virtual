"""Unit tests for the TwitterClient class."""
from unittest import TestCase
from unittest.mock import MagicMock, Mock
from twitter_virtual.twitter import TwitterClient, OAuthRequestError, InvalidOAuthResponseError, RateLimitHit, \
    TwitterError, SoftRateLimitHit
from urllib.parse import urlencode
from twitter_virtual.tests.twitter_api_mocks import server_error_response_mock, \
    rate_limit_api_response_mock, callback_unconfirmed_api_response_mock, healthy_request_token_api_response_mock, \
    invalid_oauth_response_mock, following_check_response_mock, get_following_user_ids_response_mock, \
    list_create_response_mock, add_list_users_response_mock, add_list_users_soft_rate_limit_response_mock

fake_token = 'FAKETOKEN'
fake_token_secret = 'FAKESECRET'
fake_authorized_token = 'FAKEAUTHORIZEDTOKEN'
fake_authorized_token_secret = 'FAKEAUTHORIZEDTOKENSECRET'
fake_verifier = 'FAKEVERIFIER'
fake_screen_name = 'FAKESCREENNAME'
fake_list_id = '0000'
fake_user_id = '0000'


class TwitterClientTestCase(TestCase):
    """Base test case for twitter client tests."""
    def get_twitter_client(self, **request_method_mock_args):
        """Return a TwitterClient() configured to use a mocked oauth_client that has the .request() method set to a Mock()."""
        mock_request_method = Mock(**request_method_mock_args)
        mock_oauth_client = MagicMock(request=mock_request_method)

        return TwitterClient(oauth_client=mock_oauth_client)


class TestRequestTokenFetch(TwitterClientTestCase):
    """Tests for the TwitterClient oauth fetch request token method - step 1 of the oauth flow."""
    def test_http_request_failure(self):
        """Check that the proper exception is raised on token request failure."""
        client = self.get_twitter_client(return_value=server_error_response_mock())
        with self.assertRaises(OAuthRequestError):
            client.get_request_token()

    def test_bad_oauth_response(self):
        """Check that we're verifying the callback_confirmed parameter."""
        client = self.get_twitter_client(return_value=callback_unconfirmed_api_response_mock(fake_token, fake_token_secret))
        with self.assertRaises(InvalidOAuthResponseError):
            client.get_request_token()

    def test_successful_token_fetch(self):
        """Check that we're able to correctly parse and return a healthy response."""
        client = self.get_twitter_client(return_value=healthy_request_token_api_response_mock(fake_token, fake_token_secret))
        token = client.get_request_token()
        self.assertEqual(fake_token, token.key, "Matching request token in request token response")
        self.assertEqual(fake_token_secret, token.secret, "Matching request token secret in request token response")


class TestTwitterAuthorizationURL(TwitterClientTestCase):
    """Tests for the TwitterClient get_authorize_url_for_token method."""
    def test_get_authorize_url(self):
        """Check that the returned URL is valid and has the right token attached."""
        client = self.get_twitter_client()
        for test_token in ['foo', '@bar!', '*@&#*47baz']:
            auth_url = client.get_authorize_url_for_token(oauth_token=test_token)
            encoded_token_param = urlencode({"oauth_token": test_token})
            self.assertTrue((encoded_token_param in auth_url))


class TestAuthorizeRequestToken(TwitterClientTestCase):
    """Tests for the TwitterClient authorize_request_token method - step 3 of the oauth flow."""
    def test_http_request_failure(self):
        """Check that the proper exception is raised if the web request fails."""
        client = self.get_twitter_client(return_value=server_error_response_mock())
        with self.assertRaises(OAuthRequestError):
            client.authorize_oauth_token(fake_token, fake_token_secret, fake_verifier)

    def test_bad_oauth_response(self):
        """Check that we're handling bad token responses."""
        client = self.get_twitter_client(return_value=invalid_oauth_response_mock(fake_token_secret))
        with self.assertRaises(InvalidOAuthResponseError):
            client.authorize_oauth_token(fake_token, fake_token_secret, fake_verifier)

    def test_successful_token_authorize(self):
        """Check that we're able to correctly parse and save an authorized token."""
        client = self.get_twitter_client(return_value=healthy_request_token_api_response_mock(fake_token, fake_token_secret))
        token = client.authorize_oauth_token(fake_token, fake_token_secret, fake_verifier)
        self.assertEqual(fake_token, token.key, "Matching token in authorize response")
        self.assertEqual(fake_token_secret, token.secret, "Matching token secret in authorize response")


class TestListCreate(TwitterClientTestCase):
    """Tests for the TwitterClient list create method."""
    def test_http_request_failure(self):
        """Check that we're catching request failures and throwing a TwitterError."""
        client = self.get_twitter_client(return_value=server_error_response_mock())
        with self.assertRaises(TwitterError):
            client.create_private_list(fake_screen_name)

    def test_rate_limit_failure(self):
        """Check that we're throwing the right exception when we hit a rate limit."""
        client = self.get_twitter_client(return_value=rate_limit_api_response_mock())
        with self.assertRaises(RateLimitHit):
            client.create_private_list(fake_screen_name)

    def test_success(self):
        """Check that we can parse a successful list create response and return it."""
        client = self.get_twitter_client(return_value=list_create_response_mock(fake_screen_name, fake_list_id))
        new_list = client.create_private_list(fake_screen_name)
        self.assertEqual(new_list['name'], fake_screen_name)


class TestUserIsFollowing(TwitterClientTestCase):
    """Tests for the TwitterClient current_user_is_following_user method."""
    def test_http_request_failure(self):
        """Check that we're throwing the right exception on server error."""
        client = self.get_twitter_client(return_value=server_error_response_mock())
        with self.assertRaises(TwitterError):
            client.current_user_is_following_user(fake_screen_name)

    def test_rate_limit_failure(self):
        """Check that we're throwing the right exception when we hit a rate limit."""
        client = self.get_twitter_client(return_value=rate_limit_api_response_mock())
        with self.assertRaises(RateLimitHit):
            client.current_user_is_following_user(fake_screen_name)

    def test_no_results(self):
        """Check that we handle the case where the friendships lookup returns no results."""
        client = self.get_twitter_client(return_value=following_check_response_mock(None, None))
        self.assertFalse(client.current_user_is_following_user(fake_screen_name),
                         'Friendship lookup with no results is handled')

    def test_is_not_following(self):
        """Check for a negative - returns false for a user with no relation."""
        client = self.get_twitter_client(return_value=following_check_response_mock(fake_screen_name, 'none'))
        self.assertFalse(client.current_user_is_following_user(fake_screen_name), 'Current user is not following user')

    def test_is_following(self):
        """Check for a positive - returns true for a user with a following relation."""
        client = self.get_twitter_client(return_value=following_check_response_mock(fake_screen_name, 'following'))
        self.assertTrue(client.current_user_is_following_user(fake_screen_name), 'Current user is following user')


class TestGetFollowingUsers(TwitterClientTestCase):
    """Tests for the TwitterClient get_following_user_ids method."""
    def test_http_request_failure(self):
        """Check that we're throwing the right exception on server error."""
        client = self.get_twitter_client(return_value=server_error_response_mock())
        with self.assertRaises(TwitterError):
            client.get_following_user_ids(fake_screen_name)

    def test_rate_limit_failure(self):
        """Check that we're throwing the right exception when we hit a rate limit."""
        client = self.get_twitter_client(return_value=rate_limit_api_response_mock())
        with self.assertRaises(RateLimitHit):
            client.get_following_user_ids(fake_screen_name)

    def test_success(self):
        """Check that we can parse the list of following user IDs and return it."""
        client = self.get_twitter_client(return_value=get_following_user_ids_response_mock(["1", "2", "3"]))
        following_ids = client.get_following_user_ids(fake_screen_name)["ids"]
        self.assertEqual(len(following_ids), 3, 'Got following user IDs')


class TestAddUsersToList(TwitterClientTestCase):
    """Tests for the TwitterClient add_users_to_list method."""
    def test_http_request_failure(self):
        """Check that we're throwing the right exception on server error."""
        client = self.get_twitter_client(return_value=server_error_response_mock())
        with self.assertRaises(TwitterError):
            client.add_users_to_list(fake_list_id, [fake_user_id])

    def test_rate_limit_failure(self):
        """Check that we're throwing the right exception when we hit a rate limit."""
        client = self.get_twitter_client(return_value=rate_limit_api_response_mock())
        with self.assertRaises(RateLimitHit):
            client.add_users_to_list(fake_list_id, [fake_user_id])

    def test_soft_rate_limit_failure(self):
        """Check that we're throwing an exception if we hit a soft (shadow) rate limit."""
        client = self.get_twitter_client(return_value=add_list_users_soft_rate_limit_response_mock(fake_screen_name, fake_list_id))
        with self.assertRaises(SoftRateLimitHit):
            client.add_users_to_list(fake_list_id, [fake_user_id])

    def test_success(self):
        """Check that we can parse the updated list and return it."""
        client = self.get_twitter_client(return_value=add_list_users_response_mock(fake_screen_name, fake_list_id))
        self.assertTrue(client.add_users_to_list(fake_list_id, [fake_user_id]), 'Got updated list')
