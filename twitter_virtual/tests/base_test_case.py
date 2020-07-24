"""Base test case for testing the flask app."""
from flask_webtest import TestApp
import unittest


class TwitterVirtualTestApp(TestApp):
    """Our app as a testable Flask application."""
    pass


class BaseTestCase(unittest.TestCase):
    """Base class for flask app tests."""
    def setUp(self):
        """Set up our test app."""
        from twitter_virtual.setup import setup_db, setup_app
        app = setup_app()
        db = setup_db(app, testing=True)
        self.app = app
        self.client = TwitterVirtualTestApp(app)
        self.db = db
