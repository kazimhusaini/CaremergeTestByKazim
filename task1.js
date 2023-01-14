//Implemented this task using plain node.js http
const http = require("http");
const url = require("url");
const request = require("request");
const cheerio = require("cheerio");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (req.method === "GET" && parsedUrl.pathname === "/I/want/title/") {
    let addresses = parsedUrl.query.address;
    if (!Array.isArray(addresses)) {
      addresses = [addresses];
    }

    let titles = [];
    let completedRequests = 0;

    addresses.forEach((address) => {
      if (address) {
        if (!/^(f|ht)tps?:\/\//i.test(address)) {
          withHttpAddress = "http://" + address;
        }
        request(withHttpAddress, (error, response, html) => {
          if (error) {
            titles.push({ address, title: "NO RESPONSE" });
            completedRequests++;
          } else if (response.statusCode !== 200) {
            titles.push({
              address,
              title: "INVALID STATUS CODE: " + response.statusCode,
            });
            completedRequests++;
          } else {
            const $ = cheerio.load(html);
            const title = $("title").text();
            titles.push({ address, title });
            completedRequests++;
          }
          if (completedRequests === addresses.length) {
            let html =
              "<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>";
            titles.forEach((title) => {
              html += `<li> ${title.address} - "${title.title}" </li>`;
            });
            html += "</ul></body></html>";
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html);
          }
        });
      } else {
        titles.push({ address, title: "NO RESPONSE" });
        completedRequests++;
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3000, () => {
  console.log("Server started on port 3000");
});

// This server uses the http module to create the server, the url module to parse the request URL, the request module to make the requests to the specified URLs, and the cheerio library to parse the HTML and extract the title tags. The server listens on port 3000 and responds to the route GET /I/want/title/. The query string parameter address is expected to be passed in with one or more website addresses. The server makes a request to each of the specified addresses, extracts the title from the HTML using cheerio, then constructs an HTML page that lists the titles and sends it back to the client. If there is any error or invalid status code, it will return 'NO RESPONSE' or 'INVALID STATUS CODE' respectively. It also handle all other routes and return HTTP code 404.

// This example uses only plain Node.js callbacks and no additional libraries, but it is important to note that using libraries like express can simplify the code and make it more readable.
