class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source(): string {
        const text = this.text.toLowerCase();

        if (text.startsWith("just completed") ||
            text.startsWith("just posted") ||
            text.startsWith("completed a ") ||
            text.startsWith("i just completed")) {
            return "completed_event";
        }

        if (text.startsWith("watch my ")) {
            return "live_event";
        }

        if (text.startsWith("achieved a ") ||
            text.startsWith("i just set a goal") ||
            text.startsWith("#runkeeper farthest distance")) {
            return "achievement";
        }

        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
        return this.writtenText.length > 0;
    }

    get writtenText(): string {
        // remove links and the run keeper hashtag
        const cleaned = this.text
            .replace(/https?:\/\/\S+/gi, "")
            .replace(/#runkeeper\b/gi, "")
            .trim();

        if (this.source === "completed_event") {
            // custom descriptions typically follow a dash
            const separator = cleaned.indexOf(" - ");

            if (separator === -1) {
                return "";
            }

            const content = cleaned.slice(separator + 3).trim();

            // another automatically generated description
            if (content.toLowerCase() === "tomtom mysports watch") {
                return "";
            }

            return content;
        }

        // miscellaneous tweets are written by users
        if (this.source === "miscellaneous") {
            if (cleaned.toLowerCase().startsWith("just linked mywellness")) {
                return "";
            }

            return cleaned;
        }

        return "";
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}