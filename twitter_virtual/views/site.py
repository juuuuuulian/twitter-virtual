"""Site index view."""
from flask import Blueprint
from ..utils import render_app_index


site_bp = Blueprint('site', __name__, url_prefix=None)


@site_bp.route('/', methods=['GET'])
def index():
    """Render our app home."""
    return render_app_index()
