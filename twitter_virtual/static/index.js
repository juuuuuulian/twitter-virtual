var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function checkLastAppUse() {
    var last_app_use_ele = document.getElementById('last_app_use');
    if (last_app_use_ele == null) return;
    var last_app_use = new Date(last_app_use_ele.getAttribute('data-value'));
    var ms_in_day = 60 * 60 * 24 * 1000;
    var next_available_use = new Date(last_app_use.getTime() + ms_in_day);
    var now = new Date();

    if (now.getTime() > next_available_use.getTime()) return false;

    document.getElementById('local_time').innerText = next_available_use.toString();
    document.getElementById('now').innerText = now.toString();
    document.getElementById('time_until').innerText = (next_available_use.getTime() - now.getTime()) / 1000;

    function startCountdown(secs_from_now) {
        var timer = setInterval(function () {
            var hrs = Math.floor(secs_from_now / 3600);
            var mins = Math.floor(secs_from_now % 3600 / 60);
            var secs = Math.floor(secs_from_now % 3600 % 60);

            document.getElementById('timer').innerText = hrs.toString() + "h" + mins.toString() + "m" + secs + "s";

            if (secs_from_now != 0) {
                secs_from_now = secs_from_now - 1;
            }
        }, 1000);
    }

    startCountdown((next_available_use.getTime() - now.getTime()) / 1000);

    function App() {
        var _React$useState = React.useState('React app!'),
            _React$useState2 = _slicedToArray(_React$useState, 2),
            message = _React$useState2[0],
            setMessage = _React$useState2[1];

        return React.createElement(
            'div',
            null,
            message,
            React.createElement(
                'button',
                { onClick: function onClick() {
                        return setMessage('New Message');
                    } },
                'Click Here'
            )
        );
    }

    ReactDOM.render(React.createElement(App, null), document.getElementById('react-container'));
}

window.onload = checkLastAppUse;