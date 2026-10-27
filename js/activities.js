function parseTweets(runkeeper_tweets) {
    // do not proceed if no tweets loaded
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

    const tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    // filter to completed events
    const completed = tweet_array.filter(tweet =>
        tweet.source === "completed_event"
    );

    // count each activity type
    const activityCounts = {};

    completed.forEach(tweet => {
        const type = tweet.activityType;

        if (type !== "unknown") {
            activityCounts[type] = (activityCounts[type] || 0) + 1;
        }
    });

    // sort activities by frequency
    const sortedActivities = Object.entries(activityCounts)
        .sort((a, b) => b[1] - a[1]);

    const topThree = sortedActivities.slice(0, 3).map(entry => entry[0]);

    // update the activity summary
    document.getElementById("numberActivities").innerText =
        sortedActivities.length;

    document.getElementById("firstMost").innerText = topThree[0];
    document.getElementById("secondMost").innerText = topThree[1];
    document.getElementById("thirdMost").innerText = topThree[2];

    // prepare activity frequency data
    const activityData = sortedActivities.map(([activityType, count]) => ({
        activityType,
        count
    }));

    // graph the number of tweets for each activity
    const activity_vis_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Number of tweets for each activity type",
        "data": {
            "values": activityData
        },
        "width": 600,
        "height": 600,
        "mark": "bar",
        "encoding": {
            "x": {
                "field": "count",
                "type": "quantitative",
                "title": "Number of tweets"
            },
            "y": {
                "field": "activityType",
                "type": "nominal",
                "sort": "-x",
                "title": "Activity type"
            }
        }
    };

    vegaEmbed("#activityVis", activity_vis_spec, {actions: false});

    // prepare distance data for the three most common activities
    const distanceData = completed
        .filter(tweet =>
            topThree.includes(tweet.activityType) && tweet.distance > 0
        )
        .map(tweet => ({
            activityType: tweet.activityType,
            distance: tweet.distance,
            day: tweet.time.toLocaleDateString("en-US", {
                weekday: "long",
                timeZone: "UTC"
            })
        }));

    const dayOrder = [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday"
    ];

    // graph individual activity distances by day
    const distanceSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "values": distanceData
        },
        "width": 650,
        "height": 350,
        "mark": {
            "type": "point",
            "opacity": 0.2
        },
        "encoding": {
            "x": {
                "field": "day",
                "type": "ordinal",
                "sort": dayOrder,
                "title": "Day of the week"
            },
            "y": {
                "field": "distance",
                "type": "quantitative",
                "title": "Distance in miles"
            },
            "color": {
                "field": "activityType",
                "type": "nominal",
                "title": "Activity type"
            }
        }
    };

    vegaEmbed("#distanceVis", distanceSpec, {actions: false});

    // graph mean activity distances by day
    const meanSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "values": distanceData
        },
        "width": 650,
        "height": 350,
        "mark": {
            "type": "line",
            "point": true
        },
        "encoding": {
            "x": {
                "field": "day",
                "type": "ordinal",
                "sort": dayOrder,
                "title": "Day of the week"
            },
            "y": {
                "field": "distance",
                "aggregate": "mean",
                "type": "quantitative",
                "title": "Mean distance in miles"
            },
            "color": {
                "field": "activityType",
                "type": "nominal",
                "title": "Activity type"
            }
        }
    };

    vegaEmbed("#distanceVisAggregated", meanSpec, {actions: false});

    // toggle between individual and mean distance graphs
    let showMeans = false;

    const aggregateButton = document.getElementById("aggregate");
    const distanceVis = document.getElementById("distanceVis");
    const meanVis = document.getElementById("distanceVisAggregated");

    meanVis.style.display = "none";

    aggregateButton.addEventListener("click", function() {
        showMeans = !showMeans;

        distanceVis.style.display = showMeans ? "none" : "block";
        meanVis.style.display = showMeans ? "block" : "none";

        aggregateButton.innerText =
            showMeans ? "Show individual distances" : "Show means";
    });

    // summarize the distance findings
    document.getElementById("longestActivityType").innerText = "bike";
    document.getElementById("shortestActivityType").innerText = "walk";
    document.getElementById("weekdayOrWeekendLonger").innerText = "weekends";
}

// wait for the dom to load
document.addEventListener('DOMContentLoaded', function(event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});