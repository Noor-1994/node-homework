const http = require("http");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/time") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        time: new Date().toString(),
      })
    );
  }

  if (req.method === "GET" && req.url === "/timePage") {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
    });

    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Clock</title>
        </head>

        <body>
          <h1>Clock</h1>

          <button id="getTimeBtn" onclick="getTime()">
            Get Time
          </button>

          <p id="time"></p>

          <script>
            function getTime() {
              fetch('/time')
                .then(response => response.json())
                .then(data => {
                  document.getElementById("time").textContent = data.time;
                });
            }
          </script>
        </body>
      </html>
    `);
  }

  if (req.method === "POST" && req.url === "/echo") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      const parsedBody = JSON.parse(body);

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(
        JSON.stringify({
          weReceived: parsedBody,
        })
      );
    });
  }
});

server.listen(8000);