const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeAthleticEvents() {
  try {
    const url = 'https://denverpioneers.com';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const scriptContent = $('section[aria-labelledby="h2_scoreboard"] script').first().html();

    if (scriptContent) {
      const jsonStringMatch = scriptContent.match(/var obj = (.*?);\s*if/);

      if (jsonStringMatch && jsonStringMatch[1]) {
        const jsonString = jsonStringMatch[1];

        let jsonObject;
        try {
          jsonObject = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          return;
        }

        const events = jsonObject.data.map(event => ({
          duTeam: jsonObject.extra.school_name,
          opponent: event.opponent.title,
          date: event.date,
        }));

        const output = {
          events: events
        };

        const outputPath = path.join(__dirname, 'results', 'athletic_events.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

      } else {
        console.log('No JSON data found within the script tag.');
      }
    } else {
      console.log('No script found within the section[aria-labelledby="h2_scoreboard"]');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the scraper
scrapeAthleticEvents();
