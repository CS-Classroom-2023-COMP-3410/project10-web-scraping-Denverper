const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');


axios.get('https://bulletin.du.edu/undergraduate/coursedescriptions/comp/').then(response => {
    const $ = cheerio.load(response.data);
    // One line that finds all courses and then filters them by having a 3 as the first number of the number
    // and whether the word Prereq is in its description
    let courses = $('div.courseblock p.courseblocktitle strong').get().filter(course => course.children[0].data.split(" ")[0][5] === '3' && !course.parent.next.next.children[0].data.includes("Prereq"));
    const coursesJson = {
        "courses": courses.map((course) => ({
            "course": course.children[0].data.split(" ")[0],
            "title": course.children[0].data.slice(10).split("(")[0]
        }))
    };
    fs.writeFileSync('results/bulletin.json', JSON.stringify(coursesJson, null, 4));
});