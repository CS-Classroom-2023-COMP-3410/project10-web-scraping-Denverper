const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const baseUrl = 'https://www.du.edu';
const calendarUrl = `${baseUrl}/calendar?search=&start_date=2025-01-01&end_date=2025-12-31#events-listing-date-filter-anchor`;

// Function to get HTML content from a URL
async function fetchHTML(url) {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        console.error(`Error fetching URL: ${url}`, error);
        return null;
    }
}

// Function to get event description from the event detail page
async function getEventDescription(eventUrl) {
    const html = await fetchHTML(eventUrl);
    if (!html) return undefined;

    const $ = cheerio.load(html);

    // Extracting description from the specific div in the event page
    const description = $('.description').text().trim().replace(/\s+/g, ' ');
    return description || undefined;
}

// Function to scrape events from the main calendar page
async function scrapeEvents() {
    const html = await fetchHTML(calendarUrl);
    if (!html) return [];

    const $ = cheerio.load(html);
    const events = [];

    // Loop through each event listing
    const eventElements = $('.events-listing__item');
    console.log(`Found ${eventElements.length} events.`);

    for (let i = 0; i < eventElements.length; i++) {
        const eventElement = eventElements.eq(i);
        const title = eventElement.find('h3').text().trim();
        const date = eventElement.find('p').first().text().trim(); // Get the first <p> tag for the date
        const time = eventElement.find('.icon-du-clock').parent().text().trim().replace(/\s+/g, ' ') || undefined;
        const eventUrl = eventElement.find('a.event-card').attr('href');
        const fullEventUrl = eventUrl.startsWith('http') ? eventUrl : `${baseUrl}${eventUrl}`;

        console.log(`Scraping event: ${title}`);

        // Visit the event detail page to get the description
        const description = await getEventDescription(fullEventUrl);

        events.push({
            title,
            date,
            time,
            description,
        });
    }

    return events;
}

// Main function to scrape all events and save them in the specified format
async function scrapeAllEvents() {
    console.log('Scraping events from DU Main Calendar...');
    const allEvents = await scrapeEvents();

    // Save the results in results/calendar_events.json
    const result = { events: allEvents };
    fs.mkdirSync('results', { recursive: true });
    fs.writeFileSync('results/calendar_events.json', JSON.stringify(result, null, 4));

    console.log('Scraping completed and saved to results/calendar_events.json');
}

scrapeAllEvents().catch((error) => {
    console.error('Error occurred while scraping:', error);
});
