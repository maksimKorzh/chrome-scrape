/*

    A Chrome extension to scrape data from
         https://quotes.toscrape.com

*/

// Request delay constant
const DELAY = 1000;

// List of URLs to crawl through
const URLS = [
    "https://quotes.toscrape.com/page/1/",
    "https://quotes.toscrape.com/page/2/",
    "https://quotes.toscrape.com/page/3/",
    "https://quotes.toscrape.com/page/4/",
    "https://quotes.toscrape.com/page/5/",
    "https://quotes.toscrape.com/page/6/",
    "https://quotes.toscrape.com/page/7/",
    "https://quotes.toscrape.com/page/8/",
    "https://quotes.toscrape.com/page/9/",
    "https://quotes.toscrape.com/page/10/"
];

// Extract useful data from target HTML page
function parseData(scraperStorage) {
    // Extract quotes DIV
    let quotes = document.getElementsByClassName("quote");
    
    // Loop over quotes and extract data
    for (let quote of quotes) {
        let data = {
            "quote": quote.children[0].innerHTML,
            "author": quote.children[1].children[0].innerHTML,
            "url": quote.children[1].children[1].href,
            "tags": []
        };
        
        // Loop over tags and extract them
        for (let tag of quote.children[2].children) {
            if (tag.tagName == "A") {
                data.tags.push({
                    "tag": tag.innerHTML,
                    "href": tag.href
                });
            }
        }
        
        // Log extracted data
        console.log(data);
        
        // Push data to the current storage instance
        scraperStorage.data.push(data);
    }
}

// Download scraped data
function download(filename="data.json") {
    // Extract scraped data from local browser storage
    let data = JSON.parse(localStorage.getItem("scraper")).data;
    
    // Create data blob
    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "text/json;charset=utf-8" }
    );
    
    // Create URL
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    
    // "Click" download URL
    link.click();
    
    // Clear download URL
    URL.revokeObjectURL(url);
}

// Wait before going to the next page
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Crawl through URLs
(async () => {
    // Load scraper storage if available
    let scraperStorage = JSON.parse(localStorage.getItem("scraper"));

    // Create scraper storage instance if needed
    if (scraperStorage == null) {
        localStorage.setItem("scraper", JSON.stringify({
            "currentUrlIndex": -1,
            "data": []
        }));
        alert("Reload tab to start scraping or go to 'chrome://extensions' to turn off scraper");
    }
    
    // Scraper storage instance already exists
    else {
        // Extract data from the target HTML page
        parseData(scraperStorage);
        
        // Update URL index
        scraperStorage.currentUrlIndex++;
        
        // Store current URL index and scraped data to browser local storage
        localStorage.setItem("scraper", JSON.stringify(scraperStorage));
        
        // Log next URL to crawl
        console.log("Next URL:", URLS[scraperStorage.currentUrlIndex]);
        
        // If no more URLs to crawl
        if (scraperStorage.currentUrlIndex == URLS.length) {
            // Inform user
            alert("Scraping is done");
            
            // Download scraped data
            download();
            
            // Clear local storage
            localStorage.removeItem("scraper");
        } else {
            // Wait for a while
            await sleep(DELAY);
            
            // Go to the next page
            location.href = URLS[scraperStorage.currentUrlIndex];
        }
    }

})();