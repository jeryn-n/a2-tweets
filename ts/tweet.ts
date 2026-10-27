class Tweet {
    private text: string;
    time: Date;

    constructor(tweet_text: string, tweet_time: string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time);
    }

    // identify the category of the tweet
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

    // determine whether the tweet includes user written text
    get written(): boolean {
        return this.writtenText.length > 0;
    }

    // extract user written text
    get writtenText(): string {
        // remove links and the runkeeper hashtag
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

            // exclude automatically generated descriptions
            if (content.toLowerCase() === "tomtom mysports watch") {
                return "";
            }

            return content;
        }

        // miscellaneous tweets are generally user written
        if (this.source === "miscellaneous") {
            if (cleaned.toLowerCase().startsWith("just linked mywellness")) {
                return "";
            }

            return cleaned;
        }

        return "";
    }

    // identify the type of completed activity
    get activityType(): string {
        if (this.source !== "completed_event") {
            return "unknown";
        }

        let text = this.text.toLowerCase();

        // remove the standard introductory phrase
        const prefixes = [
            "just completed a ",
            "just completed an ",
            "just posted a ",
            "just posted an ",
            "completed a ",
            "completed an ",
            "i just completed a ",
            "i just completed an "
        ];

        const prefix = prefixes.find(p => text.startsWith(p));

        if (!prefix) {
            return "unknown";
        }

        text = text.slice(prefix.length);

        // remove the distance if one is present
        const distance = text.match(/^\d+(?:\.\d+)?\s*(?:km|mi)\s+/);

        if (distance) {
            text = text.slice(distance[0].length);
        }

        // find where the activity name ends
        const endings = [
            " with @runkeeper",
            " - ",
            " in ",
            " https://"
        ];

        let end = text.length;

        endings.forEach(ending => {
            const position = text.indexOf(ending);

            if (position !== -1) {
                end = Math.min(end, position);
            }
        });

        return text.slice(0, end).trim() || "unknown";
    }

    // return the completed activity distance in miles
    get distance(): number {
        if (this.source !== "completed_event") {
            return 0;
        }

        // search the activity description for a distance
        const header = this.text.split(" - ")[0];
        const match = header.match(/(\d+(?:\.\d+)?)\s*(km|mi)\b/i);

        if (!match) {
            return 0;
        }

        const distance = Number(match[1]);
        const unit = match[2].toLowerCase();

        // convert kilometers to miles
        if (unit === "km") {
            return distance / 1.609;
        }

        return distance;
    }

    // generate a table row with clickable tweet links
    getHTMLTableRow(rowNumber: number): string {
        // escape characters that could be interpreted as html
        const safeText = this.text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

        // turn urls into clickable links
        const linkedText = safeText.replace(
            /https?:\/\/\S+/gi,
            url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
        );

        const activity = this.activityType
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        return `<tr>
            <td>${rowNumber}</td>
            <td>${activity}</td>
            <td>${linkedText}</td>
        </tr>`;
    }
}