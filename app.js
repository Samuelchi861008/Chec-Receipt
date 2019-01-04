var http = require("http");
var path = require("path");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");

var app = express();

var rowIndex = 0;

//npm install request cheerio --save
const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
var num_1,num_2,num_3,num_4;
const receipt = function () {
  request({
    url: "http://invoice.etax.nat.gov.tw/", // 財政部稅務入口網
    method: "GET"
  }, function (error, response, body) {
    if (error || !body) {
      return;
    }
    const $ = cheerio.load(body); // 載入 body
    const table_redTex = $(".t18Red"); // 爬 class=t18Red
    num_1 = table_redTex.eq(0).text();
    num_2 = table_redTex.eq(1).text();
    num_3 = table_redTex.eq(2).text();
    num_4 = table_redTex.eq(3).text();
  });
};
receipt();
setInterval(receipt, 30 * 60 * 1000); // 每半小時爬一次資料

app.use(express.static(path.resolve(__dirname, "public")));
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

var entries = [];
app.locals.entries = entries;

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function(request, response) {
  response.render("index");
});

app.post("/", function(request, response) {
  if (!request.body.receiptNumber) {
    response.status(400)
      .send("Entries must have 8 numbers.");
    return; 
  }
  entries.push({
    Index: ++rowIndex,
    receiptNumber: request.body.receiptNumber,
    Num_1: num_1,
    Num_2: num_2,
    Num_3_1_1: num_3.slice(0,8),
    Num_3_1_2: num_3.slice(1,8),
    Num_3_1_3: num_3.slice(2,8),
    Num_3_1_4: num_3.slice(3,8),
    Num_3_1_5: num_3.slice(4,8),
    Num_3_1_6: num_3.slice(5,8),
    Num_3_2_1: num_3.slice(9,17),
    Num_3_2_2: num_3.slice(10,17),
    Num_3_2_3: num_3.slice(11,17),
    Num_3_2_4: num_3.slice(12,17),
    Num_3_2_5: num_3.slice(13,17),
    Num_3_2_6: num_3.slice(14,17),
    Num_3_3_1: num_3.slice(18,26),
    Num_3_3_2: num_3.slice(19,26),
    Num_3_3_3: num_3.slice(20,26),
    Num_3_3_4: num_3.slice(21,26),
    Num_3_3_5: num_3.slice(22,26),
    Num_3_3_6: num_3.slice(23,26),
    Num_4_1: num_4.slice(0,3),
    Num_4_2: num_4.slice(4,7),
    Num_4_3: num_4.slice(8,11),
    published: new Date()
  });

  response.redirect("/");
});

app.use(function(request, response) {
  response.status(404).render("404");
});

http.createServer(app).listen(3000, function() {
  console.log("App started on port 3000.");
});