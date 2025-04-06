const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
credentials: require('../notedai-calendar.json'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});
const calendar = google.calendar({ version: 'v3', auth });


console.log(calendar);

const createCalendarInvite = async ({ summary, description, startDateTime }) => {
    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });
  
    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Los_Angeles'
      },
      end: {
        dateTime: new Date(new Date(startDateTime).getTime() + 30 * 60000).toISOString(),
        timeZone: 'America/Los_Angeles'
      },      
    };
  
    const response = await calendar.events.insert({
      calendarId: 'itskalpeshpatil@gmail.com',
      resource: event,
    });
  
    console.log("Event created on calendar:", response.data.organizer.email);
console.log("Event link:", response.data.htmlLink);

    return response.data.htmlLink;
  };
  

module.exports = { createCalendarInvite };
