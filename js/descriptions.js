// store tweets containing user written text
let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
    // do not proceed if no tweets loaded
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

    // create tweet objects and filter to written tweets
    writtenTweets = runkeeper_tweets
        .map(tweet => new Tweet(tweet.text, tweet.created_at))
        .filter(tweet => tweet.written);

    updateSearch();
}

function updateSearch() {
    const searchBox = document.getElementById("textFilter");
    const searchCount = document.getElementById("searchCount");
    const searchText = document.getElementById("searchText");
    const table = document.getElementById("tweetTable");

    // read the current search query
    const query = searchBox.value.trim().toLowerCase();

    searchText.innerText = searchBox.value;

    // clear results when the query is empty
    if (query.length === 0) {
        searchCount.innerText = "0";
        table.innerHTML = "";
        return;
    }

    // find written tweets containing the query
    const matches = writtenTweets.filter(tweet =>
        tweet.writtenText.toLowerCase().includes(query)
    );

    // update the number of matching tweets
    searchCount.innerText = matches.length;

    // generate a table row for each match
    table.innerHTML = matches
        .map((tweet, index) => tweet.getHTMLTableRow(index + 1))
        .join("");
}

function addEventHandlerForSearch() {
    const searchBox = document.getElementById("textFilter");

    // update results after every input change
    searchBox.addEventListener("input", updateSearch);

    updateSearch();
}

// wait for the dom to load
document.addEventListener('DOMContentLoaded', function(event) {
    addEventHandlerForSearch();
    loadSavedRunkeeperTweets().then(parseTweets);
});