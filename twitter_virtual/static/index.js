var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function getLastAppUseValue() {
    var last_app_use_ele = document.getElementById('last_app_use');
    if (last_app_use_ele == null) return null;
    var last_app_use = new Date(last_app_use_ele.getAttribute('data-value'));
    return last_app_use;
}

function getSecondsTilNextAppUse() {
    var last_app_use = getLastAppUseValue();
    if (last_app_use == null) return 0;
    var ms_in_day = 60 * 60 * 24 * 1000;
    var next_available_use = new Date(last_app_use.getTime() + ms_in_day);
    var now = new Date();

    if (now.getTime() > next_available_use.getTime()) return 0;

    return Math.floor((next_available_use.getTime() - now.getTime()) / 1000);
}

function initApp() {
    var secondsLeft = getSecondsTilNextAppUse();

    function AppUseTimer(props) {
        var _React$useState = React.useState(props.seconds),
            _React$useState2 = _slicedToArray(_React$useState, 2),
            secondsLeft = _React$useState2[0],
            setSecondsLeft = _React$useState2[1];

        function formatTimer(secs) {
            var hrs = Math.floor(secs / 3600);
            var mins = Math.floor(secs % 3600 / 60);
            var secs = Math.floor(secs % 3600 % 60);

            return hrs.toString() + "h" + mins.toString() + "m" + secs + "s";
        }

        React.useEffect(function () {
            console.log('starting timer');
            function startAppUseTimer(secs_from_now) {
                var timer = setInterval(function () {
                    console.log('tick: ' + secs_from_now.toString());
                    secs_from_now = secs_from_now - 1;
                    setSecondsLeft(secs_from_now);

                    if (secs_from_now == 0) {
                        clearInterval(timer);
                        console.log('calling onTimerFinished');
                        props.onTimerFinished();
                    }
                }, 1000);
            }
            startAppUseTimer(secondsLeft);
        }, []);

        if (secondsLeft == 0) {
            return null;
        } else {
            return React.createElement(
                'div',
                null,
                'React Timer: ',
                formatTimer(secondsLeft)
            );
        }
    }

    function AppForm() {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'h1',
                null,
                'Enter a screen name'
            ),
            React.createElement(
                'form',
                { method: 'POST', action: '/twitter/begin' },
                React.createElement('input', { type: 'text', name: 'target_screen_name' }),
                React.createElement('input', { type: 'submit', value: 'Submit' })
            )
        );
    }

    function App(props) {
        var _React$useState3 = React.useState(props.seconds == 0 ? true : false),
            _React$useState4 = _slicedToArray(_React$useState3, 2),
            timerFinished = _React$useState4[0],
            setTimerFinished = _React$useState4[1];

        return React.createElement(
            'div',
            null,
            props.seconds != 0 && React.createElement(AppUseTimer, { seconds: props.seconds, onTimerFinished: function onTimerFinished() {
                    return setTimerFinished(true);
                } }),
            (props.seconds == 0 || timerFinished) && React.createElement(AppForm, null)
        );
    }

    ReactDOM.render(React.createElement(App, { seconds: secondsLeft }), document.getElementById('react-container'));
}

window.onload = initApp;