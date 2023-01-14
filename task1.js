//Implemented this task using http plain node.js 
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

