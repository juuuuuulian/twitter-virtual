"""App setup."""
from .setup import setup_app, setup_db

app = setup_app()
db = setup_db(app)
