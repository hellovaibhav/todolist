const express = require("express");

const bodyParser = require("body-parser");

const date = require(__dirname + "/date.js");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set('view engine', 'ejs');

let items = ["buy food",
    "cook food",
    "eat food"];

let workItems = [];

app.get("/", function (req, res) {

    res.render("list", {
        listTitle: date.getDay(),
        newListItems: items

    });
});

app.post("/", function (req, res) {

    let item = req.body.nextListItem;

    if (req.body.list === "Work List") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }

    res.redirect("/");
});

app.get("/work", function (req, res) {

    res.render("list", {
        listTitle: "Work List",
        newListItems: workItems

    });
});

app.post("/work", function (req, res) {

    let item = req.body.nextListItem;

    workItems.push(item);

    res.redirect("/");
});


app.listen(3000, function () {
    console.log("Server is running on port 3000");
});