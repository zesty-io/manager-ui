const https = require("https");
const fs = require("fs");
const path = require("path");

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
  path: "/public"
};

https
  .createServer(options, function(req, res) {
    console.log("Https is working!");
    var filePath = "." + req.url;
    if (filePath == "./") filePath = "./public/index.html";

    var extname = path.extname(filePath);
    var contentType = "text/html";
    switch (extname) {
      case ".js":
        contentType = "text/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".json":
        contentType = "application/json";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
        contentType = "image/jpg";
        break;
      case ".wav":
        contentType = "audio/wav";
        break;
    }

    fs.readFile(filePath, function(error, content) {
      if (error) {
        if (error.code == "ENOENT") {
          fs.readFile("./404.html", function(error, content) {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content, "utf-8");
          });
        } else {
          res.writeHead(500);
          res.end(
            "Sorry, check with the site admin for error: " +
              error.code +
              " ..\n"
          );
          res.end();
        }
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
    res.writeHead(200);
    // res.end("hello world\n");
  })
  .listen(8000);
