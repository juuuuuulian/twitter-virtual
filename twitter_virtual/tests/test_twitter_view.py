"""Unit tests and integration tests for the twitter view."""
from twitter_virtual.tests.base_test_case import BaseTestCase

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
    """Tests for /twitter/copy_following."""
    def test_success(self):
        pass

    def test_token_missing(self):
        with self.client.session_transaction() as sess:
            sess['token'] = None
            sess['token_secret'] = None
        response = self.client.get("/twitter/copy_following", status=500)
        self.assertTrue("Missing OAuth Token" in response.text, "Error msg in response")

    def test_screen_name_missing(self):
        with self.client.session_transaction() as sess:
            sess['token'] = fake_token
            sess['token_secret'] = fake_token_secret
        response = self.client.get("/twitter/copy_following", status=500)
        self.assertTrue("Missing target screen name" in response.text, "Error msg in response")

    def test_soft_rate_limit_hit_mid_list(self):
        """Test soft rate limit hit detection mid-list-copy - error response, list delete called."""
        pass

    def test_soft_rate_limit_hit_post(self):
        """Test soft rate limit hit detection post-list-copy - error response, list delete called."""
        pass

    def test_user_not_following_target(self):
        """Test case where user is not following the target - error response."""
        pass

    def test_target_following_nobody(self):
        """Test case where the target is following nobody - error response."""
        pass

    def test_target_following_too_many(self):
        """Test case where the target is following too many people - error response."""
        pass

    def test_list_create_fail(self):
        """Test case where private list creation fails due to a server error on Twitter's side - error response."""
        pass




# i expect that it checks if the target screen name is followed by the current user - client.current_user_is_following_user
# i expect that it fetches up to 5000 user IDs - client.get_following_user_ids
#     - i expect that it checks the response to see if more are available, and throws an exception if so
#     - i expect that it checks the response to see if there are no user IDs, and throws and exception if so
# i expect that it creates a new private list named after the target screen name - client.create_private_list
# i expect that it loops through a list of user IDs and adds them to the new list 100 at a time - client.add_users_to_list
#     - i expect that it checks each add response for a soft rate limit hit, and throws an exception if it sees one
#     - i expect that it checks for a soft rate limit hit after adding all users, and throws an exception if it sees one
# i expect that if there is an exception at any point in the process after the list is created, it tries to delete the new list - client.delete_list

