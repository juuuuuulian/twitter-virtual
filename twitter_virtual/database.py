"""Flask-SQLALchemy instance. Used by the Flask app and the views independently to prevent circular deps."""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
