import express from "express";
import dotenv from "dotenv";
import { google } from "googleapis"; // Correct import for googleapis


const app = express();
dotenv.config();

const calendar=google.calendar({
    version:"v3",
    auth:process.env.API_KEY
})
const oauth2Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
);

const scopes = [
    'https://www.googleapis.com/auth/calendar'
];

app.get("/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
    const code=req.query.code;
    const {tokens}=await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.send("user successfully got the access");
});

//write function to list events
app.get("/list_events", async (req, res) => {
    try {
        const calendarId = 'primary';

        const eventsResponse = await calendar.events.list({
            calendarId: calendarId,
            auth: oauth2Client,
            timeMin: (new Date()).toISOString(),
            maxResults: 10, // Adjust as per your requirement
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = eventsResponse.data.items;

        // Filter events where summary (name) starts with 'HQ' and are Google Meet events
        const filteredEvents = events.filter(event => 
            event.summary && event.summary.toLowerCase().startsWith('hq')
        );

        const formattedEvents = filteredEvents.map(event => ({
            id: event.id,
            summary: event.summary,
            description: event.description || '',
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            attendees: event.attendees ? event.attendees.map(attendee => attendee.email) : [],
        }));

        res.json(formattedEvents);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send("Failed to fetch events");
    }
});



app.listen(3000, () => {
    console.log("server running on port 3000");
});