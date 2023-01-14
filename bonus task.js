//Implemented this task using rxjs
const http = require("http");
const url = require("url");
const request = require("request");
const cheerio = require("cheerio");
const { from } = require("rxjs");
const { mergeMap, toArray } = require("rxjs/operators");
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (req.method === "GET" && parsedUrl.pathname === "/I/want/title/") {
    const addresses = parsedUrl.query.address;
    if (!Array.isArray(addresses)) {
      addresses = [addresses];
    }
    let titles = [];
    from(addresses)
      .pipe(
        mergeMap((address) => {
          if (address) {
            if (!/^(f|ht)tps?:\/\//i.test(address)) {
              withHttpAddress = "http://" + address;
            }
            return from(
              new Promise((resolve, reject) => {
                request(withHttpAddress, (error, response, html) => {
                  if (error) {
                    resolve({ address, title: "NO RESPONSE" });
                  } else if (response.statusCode !== 200) {
                    resolve({
                      address,
                      title: "INVALID STATUS CODE: " + response.statusCode,
                    });
                  } else {
                    console.log(address);
                    const $ = cheerio.load(html);
                    const title = $("title").text();
                    resolve({ address, title });
                    titles.push({ address, title });
                    console.log(titles);
                  }
                });
              })
            );
          } else {
            return from([{ address, title: "NO RESPONSE" }]);
          }
        })
      )
      .pipe(toArray())
      .subscribe((titles) => {
        let html =
          "<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>";
        titles.forEach((title) => {
          html += `<li> ${title.address} - "${title.title}" </li>`;
        });
        html += "</ul></body></html>";
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3000, () => {
  console.log("Server started on port 3000");
});
