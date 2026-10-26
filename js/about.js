function parseTweets(runkeeper_tweets) {
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

    const tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    const total = tweet_array.length;

    document.getElementById('numberTweets').innerText = total;

    // finds earliest and latest timestamps
    const timestamps = tweet_array.map(tweet => tweet.time.getTime());

    const firstDate = new Date(Math.min(...timestamps));
    const lastDate = new Date(Math.max(...timestamps));

    const dateOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
    };

    document.getElementById('firstDate').innerText =
        firstDate.toLocaleDateString("en-US", dateOptions);

    document.getElementById('lastDate').innerText =
        lastDate.toLocaleDateString("en-US", dateOptions);

    // count tweets in each category
    const counts = {
        completed_event: 0,
        live_event: 0,
        achievement: 0,
        miscellaneous: 0
    };

    tweet_array.forEach(tweet => {
        counts[tweet.source]++;
    });

    // connect category names to their HTML class names
    const categories = [
        ["completed_event", "completedEvents", "completedEventsPct"],
        ["live_event", "liveEvents", "liveEventsPct"],
        ["achievement", "achievements", "achievementsPct"],
        ["miscellaneous", "miscellaneous", "miscellaneousPct"]
    ];

    categories.forEach(([category, countClass, percentClass]) => {
        const count = counts[category];
        const percent = (count / total * 100).toFixed(2) + "%";

        document.querySelectorAll("." + countClass).forEach(element => {
            element.innerText = count;
        });

        document.querySelector("." + percentClass).innerText = percent;
    });

    // count completed tweets with user-written descriptions
    const completed = tweet_array.filter(tweet =>
        tweet.source === "completed_event"
    );

    const written = completed.filter(tweet => tweet.written);

    document.querySelector(".written").innerText = written.length;

    document.querySelector(".writtenPct").innerText =
        (written.length / completed.length * 100).toFixed(2) + "%";
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});