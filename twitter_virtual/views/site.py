"""Site index view."""
from flask import Blueprint, render_template
from ..utils import get_last_app_use_date

site_bp = Blueprint('site', __name__, url_prefix=None)

@site_bp.route('/', methods=['GET'])
def index():
    last_app_use = get_last_app_use_date()
    last_app_use = last_app_use.isoformat() if last_app_use else None
    return render_template("index.html", last_app_use=last_app_use)

