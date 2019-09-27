const sampleUsers = [
    {
        name: "OJ Simpson",
        username: "TheRealOJ32",
        following: 24
    },
    {
        name: "Mahmoud Ahmadinejad",
        username: "Ahmadinejad1956",
        following: 39
    },
    {
        name: "Cornel West",
        username: "CornelWest",
        following: 179
    },
    {
        name: "Norm Macdonald",
        username: "normmacdonald",
        following: 732
    },
    {
        name: "Charlie Warzel",
        username: "cwarzel",
        following: 1505
    },
    {
        name: "Jose Canseco",
        username: "JoseCanseco",
        following: 64
    },
    {
        name: "Paul Krugman",
        username: "paulkrugman",
        following: 47
    },
    {
        name: "Alexandria Ocasio-Cortez",
        username: "AOC",
        following: 1675
    },
    {
        name: "DouthatNYT",
        username: "DouthatNYT",
        following: 291
    },
    {
        name: "Robert Reich",
        username: "RBReich",
        following: 276
    },
    {
        name: "Nate Silver",
        username: "NateSilver538",
        following: 1190
    },
    {
        name: "ICE T",
        username: "FINALLEVEL",
        following: 1468
    },
    {
        name: "Donald Trump",
        username: "realDonaldTrump",
        following: 47
    },
    {
        name: "Kanye West",
        username: "kanyewest",
        following: 265
    },
    {
        name: "Wu-Tang Financial",
        username: "Wu_Tang_Finance",
        following: 2053
    },
    {
        name: "Jack",
        username: "jack",
        following: 4033
    },
    {
        name: "Bret Easton Ellis",
        username: "BretEastonEllis",
        following: 483
    },
    {
        name: "George Monbiot",
        username: "GeorgeMonbiot",
        following: 1265
    },
    {
        name: "Mike Gravel",
        username: "MikeGravel",
        following: 888
    },
    {
        name: "Tim Heidecker",
        username: "timheidecker",
        following: 377
    },
    {
        name: "Bernie Sanders",
        username: "BernieSanders",
        following: 1392
    },
    {
        name: "Michael Moore",
        username: "MMFlint",
        following: 522
    },
    {
        name: "Rob Delaney",
        username: "robdelaney",
        following: 3136
    },
    {
        name: "Oprah Winfrey",
        username: "Oprah",
        following: 307
    }
]

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
        const [secondsLeft, setSecondsLeft] = React.useState(props.seconds);

        function formatTimer(secs) {
            var hrs = Math.floor(secs / 3600);
            var mins = Math.floor((secs % 3600) / 60);
            var secs = Math.floor((secs % 3600) % 60);

            return hrs.toString() + "h" + mins.toString() + "m" + secs + "s";
        }

        React.useEffect(() => {
            function startAppUseTimer(secs_from_now) {
                var timer = setInterval(function() {
                    secs_from_now = secs_from_now - 1;
                    setSecondsLeft(secs_from_now);

                    if (secs_from_now == 0) {
                        clearInterval(timer);
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

    function SampleUserButton(props) {
        return <div>
            {props.name} (@{props.username} - Following {props.following})
            <button onClick={() => props.clickHandler(props.username)}>Click</button>
        </div>
    }

    function SampleUsersCarousel(props) {
        return <div>
            <ul>
                {props.users.map((user) => 
                    <li><SampleUserButton name={user.name} username={user.username} following={user.following} clickHandler={props.optionClickHandler} /></li>
                )}
            </ul>
        </div>
    }

    function AppForm(props) {
        return <div>
            <form method="POST" action="/twitter/begin">
                <input type="text" name="target_screen_name" value={props.targetScreenName} />
                <input type="submit" value="Submit" />
            </form>
        </div>
    }

    function App(props) {
        const [timerFinished, setTimerFinished] = React.useState((props.seconds == 0 ? true : false));
        const [targetScreenName, setTargetScreenName] = React.useState("");

        return <div>
            { props.seconds != 0 && <AppUseTimer seconds={props.seconds} onTimerFinished={() => setTimerFinished(true)} /> }
            { (props.seconds == 0 || timerFinished) && 
                <div>
                    <AppForm targetScreenName={targetScreenName} />
                    <SampleUsersCarousel users={sampleUsers} optionClickHandler={(screenName) => setTargetScreenName(screenName)} />
                </div>
            }
            <Button label="Hello World!" variant="brand" onClick={() => alert('Hello, World!')} />
        </div>
    } 
    
    ReactDOM.render(
        <App seconds={secondsLeft} />,
        document.getElementById('react-container')
    );    

}

window.onload = initApp;
