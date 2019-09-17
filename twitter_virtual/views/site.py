"""Site index view."""
from flask import Blueprint, render_template

site_bp = Blueprint('site', __name__, url_prefix=None)

@site_bp.route('/', methods=['GET'])
def index():
    return render_template('index.html')

