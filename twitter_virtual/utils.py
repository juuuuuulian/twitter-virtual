"""Utility functions used in various views."""
import datetime
from .database import db
from .models import AppUse
from flask import current_app, request, session
from .twitter import TwitterClient
from .recaptcha import RecaptchaClient
from pytz import UTC
import re

twitter_username_re = re.compile("^[a-zA-Z0-9_]{1,15}$")


def twitter_username_is_valid(username):
    """Check basic validity of a Twitter username.
    See: https://help.twitter.com/en/managing-your-account/twitter-username-rules"""
    if twitter_username_re.match(username) is None:
        return False
    return True


def get_twitter_client():
    """Get a TwitterClient configured for current_app."""
    return TwitterClient.from_flask_app(current_app)


def get_recaptcha_client():
    """Get a Recaptcha client configured for current_app."""
    return RecaptchaClient.from_flask_app(current_app)


def get_remote_addr():
    if request.remote_addr:
        return request.remote_addr
    else:
        # Flask-WebTest is making the request
        return "127.0.0.1"


def should_limit_app_use():
    if current_app.config["LIMIT_APP_USE"]:
        return True
    return False


def record_app_use():
    """Record last app use in the session and the backend database."""
    # session
    now = UTC.localize(datetime.datetime.utcnow()).timestamp()
    session["last_app_use"] = now

    # database
    db.session.add(AppUse(remote=str(get_remote_addr())))
    db.session.commit()


def get_last_app_use_date():
    """Get a datetime of the last time this person used our app, checking the session and the database."""
    last_app_use = session.get("last_app_use")
    if last_app_use:
        last_app_use = datetime.datetime.fromtimestamp(last_app_use, UTC)
        return last_app_use

    last_app_use = AppUse.query.filter_by(remote=get_remote_addr()) \
        .order_by(AppUse.date.desc()).limit(1).first()
    if last_app_use:
        return last_app_use.date

    return None


def app_used_today():
    """Check the session and the backend database for a record of app use from the last 24 hours."""
    now = UTC.localize(datetime.datetime.utcnow())
    last_app_use = get_last_app_use_date()
    day_length_in_seconds = 60 * 60 * 24
    if last_app_use and (last_app_use.timestamp() + day_length_in_seconds) > now.timestamp():
        return True

    return False


def get_sample_twitter_accounts():
    """Return a list of sample accounts for the user to pick from."""
    return [
         {'name': 'OJ Simpson',
          'username': 'TheRealOJ32',
          'following': 24,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1141569279294226432/J1N7MQIV.jpg'},
         {'name': 'Mahmoud Ahmadinejad',
          'username': 'Ahmadinejad1956',
          'following': 39,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/838335316935200768/VKJJiFj8.jpg'},
         {'name': 'Cornel West',
          'username': 'CornelWest',
          'following': 179,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1076631097/c_west__smaller_.JPG'},
         {'name': 'Norm Macdonald',
          'username': 'normmacdonald',
          'following': 732,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1281990037/Unknown.jpeg'},
         {'name': 'Charlie Warzel',
          'username': 'cwarzel',
          'following': 1505,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/531522450190651393/HuRaqDlp.png'},
         {'name': 'Jose Canseco',
          'username': 'JoseCanseco',
          'following': 64,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1095554807354380289/QcEuJFsQ.jpg'},
         {'name': 'Paul Krugman',
          'username': 'paulkrugman',
          'following': 47,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/2044852218/NYT_Twitter_Krugman.png'},
         {'name': 'Alexandria Ocasio-Cortez',
          'username': 'AOC',
          'following': 1675,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/923274881197895680/AbHcStkl.jpg'},
         {'name': 'DouthatNYT',
          'username': 'DouthatNYT',
          'following': 291,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/2044053093/douthatsmall.jpg'},
         {'name': 'Robert Reich',
          'username': 'RBReich',
          'following': 276,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/796103696106958848/D2c364z2.jpg'},
         {'name': 'Nate Silver',
          'username': 'NateSilver538',
          'following': 1190,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/668814368008708096/5HABV7bJ.png'},
         {'name': 'ICE T',
          'username': 'FINALLEVEL',
          'following': 1468,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/909984858818170881/jagXDTlf.jpg'},
         {'name': 'Donald Trump',
          'username': 'realDonaldTrump',
          'following': 47,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/874276197357596672/kUuht00m.jpg'},
         {'name': 'Kanye West',
          'username': 'kanyewest',
          'following': 265,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1048222727838945281/FBdbacyQ.jpg'},
         {'name': 'Wu-Tang Financial',
          'username': 'Wu_Tang_Finance',
          'following': 2053,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/464244189589684224/99xg62z1.jpeg'},
         {'name': 'Jack',
          'username': 'jack',
          'following': 4033,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1115644092329758721/AFjOr-K8.jpg'},
         {'name': 'Bret Easton Ellis',
          'username': 'BretEastonEllis',
          'following': 483,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/378800000330397348/560951902579f82798804bbc4099754a.jpeg'},
         {'name': 'George Monbiot',
          'username': 'GeorgeMonbiot',
          'following': 1265,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/3594607450/ff6fbd42964f9a0def79d8acbfa034bd.jpeg'},
         {'name': 'Mike Gravel',
          'username': 'MikeGravel',
          'following': 888,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1177610713738678272/B90oMFvj.jpg'},
         {'name': 'Tim Heidecker',
          'username': 'timheidecker',
          'following': 377,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1169296797451177984/3Dut0HPq.jpg'},
         {'name': 'Bernie Sanders',
          'username': 'BernieSanders',
          'following': 1392,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1097820307388334080/9ddg5F6v.png'},
         {'name': 'Michael Moore',
          'username': 'MMFlint',
          'following': 522,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1166671137943818241/WxER48KI.jpg'},
         {'name': 'Rob Delaney',
          'username': 'robdelaney',
          'following': 3136,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1062264728804823045/mjWindTf.jpg'},
         {'name': 'Oprah Winfrey',
          'username': 'Oprah',
          'following': 307,
          'profile_img_url': 'http://pbs.twimg.com/profile_images/1123359369570148353/Mh-Rf4Sk.jpg'}
    ]
