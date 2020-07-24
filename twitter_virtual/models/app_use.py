"""SQLAlchemy model representing a record of our app being used successfully."""
from twitter_virtual.database import db
from sqlalchemy import func
from sqlalchemy.sql.schema import Column
from sqlalchemy.sql.sqltypes import Integer, Text, Enum, DateTime
# from sqlalchemy.dialects.postgresql import INET

class AppUse(db.Model):
    """A record of our app being used successfully - a feed copy."""
    id = Column(Integer, primary_key=True)
    remote = Column(Text, nullable=False)  # would be INET if sqlite (needed for testing) supported it
    date = db.Column(DateTime(timezone=True), nullable=False, server_default=func.now())




