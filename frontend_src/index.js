function getLastAppUseValue() {
    var last_app_use_ele = document.getElementById('last_app_use');
    if (last_app_use_ele == null)
        return null;
    var last_app_use = new Date(last_app_use_ele.getAttribute('data-value'));
    return last_app_use;
}

function getSecondsTilNextAppUse() {
    var last_app_use = getLastAppUseValue();
    if (last_app_use == null)
        return 0;
    var ms_in_day = 60 * 60 * 24 * 1000;
    var next_available_use = new Date(last_app_use.getTime() + ms_in_day);
    var now = new Date();

    if (now.getTime() > next_available_use.getTime())
        return 0;

    return Math.floor((next_available_use.getTime() - now.getTime()) / 1000);
}

function initApp() {
    let secondsLeft = getSecondsTilNextAppUse();

    function AppUseTimer(props) {
        const [secondsLeft, setSecondsLeft] = React.useState(props.seconds)

        function formatTimer(secs) {
            var hrs = Math.floor(secs / 3600);
            var mins = Math.floor((secs % 3600) / 60);
            var secs = Math.floor((secs % 3600) % 60);

            return hrs.toString() + "h" + mins.toString() + "m" + secs + "s";
        }

        React.useEffect(() => {
            console.log('starting timer');
            function startAppUseTimer(secs_from_now) {
                var timer = setInterval(function() {
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
            return <div>
                React Timer: {formatTimer(secondsLeft)}
            </div>
        }
    }

    function AppForm() {
        return <div>
            <h1>Enter a screen name</h1>
            <form method="POST" action="/twitter/begin">
                <input type="text" name="target_screen_name" />
                <input type="submit" value="Submit" />
            </form>
        </div>
    }

    function App(props) {
        const [timerFinished, setTimerFinished] = React.useState((props.seconds == 0 ? true : false));

        return <div>
            { props.seconds != 0 && <AppUseTimer seconds={props.seconds} onTimerFinished={() => setTimerFinished(true)} /> }
            { (props.seconds == 0 || timerFinished) && <AppForm /> }
        </div>
    }
    
    ReactDOM.render(
        <App seconds={secondsLeft} />,
        document.getElementById('react-container')
    );    

}

window.onload = initApp;
