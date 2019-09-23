function checkLastAppUse() {
    var last_app_use_ele = document.getElementById('last_app_use');
    if (last_app_use_ele == null)
        return;
    var last_app_use = new Date(last_app_use_ele.getAttribute('data-value'));
    var ms_in_day = 60 * 60 * 24 * 1000;
    var next_available_use = new Date(last_app_use.getTime() + ms_in_day);
    var now = new Date();

    if (now.getTime() > next_available_use.getTime())
        return false;

    document.getElementById('local_time').innerText = next_available_use.toString();
    document.getElementById('now').innerText = now.toString();
    document.getElementById('time_until').innerText = (next_available_use.getTime() - now.getTime()) / 1000;

    function startCountdown(secs_from_now) {
        var timer = setInterval(function() {
            var hrs = Math.floor(secs_from_now / 3600);
            var mins = Math.floor((secs_from_now % 3600) / 60);
            var secs = Math.floor((secs_from_now % 3600) % 60);

            document.getElementById('timer').innerText = hrs.toString() + "h" + mins.toString() + "m" + secs + "s";

            if (secs_from_now != 0) {
                secs_from_now = secs_from_now - 1;
            }
        }, 1000);
    }

    startCountdown(((next_available_use.getTime() - now.getTime()) / 1000));


    function App() {
        const [message, setMessage] = React.useState('React app!');
    
        return <div>
            {message}
            <button onClick={() => setMessage('New Message')}>Click Here</button>
        </div>
    }
    
    ReactDOM.render(
        <App />,
        document.getElementById('react-container')
    );    

}

window.onload = checkLastAppUse;
