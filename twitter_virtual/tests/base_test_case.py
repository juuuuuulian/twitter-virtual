from flask_webtest import TestApp
import unittest


class TwitterVirtualTestApp(TestApp):
    """Our app as a testable Flask application."""
    pass


class BaseTestCase(unittest.TestCase):
    """Base class for test cases of all types."""
    def setUp(self):
        """Set up our test app."""
        from twitter_virtual import app, setup_db, db
        setup_db(app, testing=True)
        self.app = app
        self.client = TwitterVirtualTestApp(app)
        self.db = db
