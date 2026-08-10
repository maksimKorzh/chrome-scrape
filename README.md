## Chrome Scrape
An example template extension to use Chrome browser for automated web scraping purposes<br>

## How It Works

The scraper runs as a Chrome extension content script and crawls a predefined list of URLs.

The important part is that navigating with `location.href` destroys the current page's JavaScript context. The extension therefore uses `localStorage` to preserve the scraper's state between page navigations.

Watch YouTube demo: https://youtu.be/KTFyrbh-6Pw

### Scraping flow

The process works like this:

1. **Initialize scraper state**

   On the first run, the extension creates a `scraper` object in `localStorage`:

   ```js
   {
       "currentUrlIndex": -1,
       "data": []
   }
   ```

   `currentUrlIndex` keeps track of which URL should be visited next, while `data` contains everything collected so far.

2. **Load the current state**

   When a page loads, the extension reads the `scraper` object from `localStorage`.

3. **Extract page data**

   `parseData()` searches the current HTML document for the required elements and extracts the relevant fields.

   For example, each quote produces an object like:

   ```js
   {
       "quote": "...",
       "author": "...",
       "url": "...",
       "tags": [
           {
               "tag": "...",
               "href": "..."
           }
       ]
   }
   ```

   The extracted objects are appended to `scraper.data`.

4. **Save the updated state**

   The scraper serializes the updated object with `JSON.stringify()` and stores it back in `localStorage`.

   This is what allows the collected data and current URL index to survive a full page navigation.

5. **Navigate to the next URL**

   The scraper increments `currentUrlIndex`, waits for the configured delay, and changes:

   ```js
   location.href = URLS[scraperStorage.currentUrlIndex];
   ```

   The current JavaScript execution ends when the browser navigates to the new page.

6. **Start again on the new page**

   Because the code runs as an extension content script, it is injected into the newly loaded page again.

   The new instance reads the previously saved `scraper` object from `localStorage`, so it knows where the previous run stopped and has access to all previously collected data.

   The cycle then repeats:

   ```text
   Load page
       ↓
   Read scraper state
       ↓
   Extract data
       ↓
   Save data
       ↓
   Increment URL index
       ↓
   Wait
       ↓
   Navigate to next URL
       ↓
   New page loads
       ↓
   Extension script starts again
       ↓
   ...
   ```

7. **Finish and download**

   When all URLs have been processed, the scraper:

   * displays a completion message
   * converts the collected data to JSON
   * creates a temporary `Blob` URL
   * triggers a browser download
   * removes the scraper state from `localStorage`

### Why `localStorage` is used

A normal JavaScript variable would disappear when `location.href` navigates to another page:

```text
Page 1
  ↓
JavaScript variables exist
  ↓
location.href
  ↓
Page 1 JavaScript context is destroyed
  ↓
Page 2
  ↓
New JavaScript context
```

`localStorage`, however, belongs to the browser's storage for the website's origin and survives page navigations. It therefore acts as the scraper's persistent state between executions.

In this project, it effectively serves as a small state store containing:

```js
{
    "currentUrlIndex": 4,
    "data": [
        // previously scraped records
    ]
}
```

This makes it possible for a single extension content script to crawl multiple pages even though each `location.href` navigation creates a completely new JavaScript execution context.

## How to Install

This extension is intended to be loaded locally as an **unpacked Chrome extension**.

### 1. Download the repository

Clone the repository or download it as a ZIP file and extract it to a local directory.

### 2. Open Chrome Extensions

Open:

```text
chrome://extensions
```

### 3. Enable Developer Mode

Turn on **Developer mode** using the switch in the top-right corner.

### 4. Load the extension

Click **Load unpacked** and select the directory containing the extension's `manifest.json` file.

For example:

```text
my-scraper/
├── manifest.json
├── content.js
```

Chrome will add the extension to the list of installed extensions.

### 5. Run the scraper

Navigate to "https://quotes.toscrape.com/"

The extension's content script will be injected automatically.

Reload page one more time and the scraper starts working.

### 6. Important

Make sure to turn extnesion off when scraping is done.

If something goes wrong you may want to clear local browser storage manually,

to do so type "localStorage.removeItem('scraper');" in DevTools console and hit Enter.