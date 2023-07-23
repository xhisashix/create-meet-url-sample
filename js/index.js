import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({});

const app = express();

const PORT = process.env.PORT || 8000;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const scope = ["https://www.googleapis.com/auth/calendar"];

app.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scope,
  });

  res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
  const code = req.query.code;

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
  });
  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });


  await calendar.events.insert(
    {
      auth: oauth2Client,
      calendarId: "primary",
      requestBody: {
        summary: "Test Event",
        description: "This is a test event",
        start: {
          dateTime: "2023-07-23T09:00:00+09:00",
          timeZone: "Asia/Tokyo",
        },
        end: {
          dateTime: "2023-07-23T10:00:00+09:00",
          timeZone: "Asia/Tokyo",
        },
        conferenceData: {
          // Add conferenceData field
          createRequest: {
            requestId: "sample123", // You can generate a random string for this
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      },
      conferenceDataVersion: 1,
    },
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result.data.hangoutLink);
      }
    }
  );

  res.send({
    message: "Success",
  });
});

app.get("/google/calendar", async (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
