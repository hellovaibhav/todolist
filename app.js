const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const dotenv=require("dotenv");

const _ = require("lodash");

const app = express();

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.set('strictQuery', "false");

mongoose.connect(process.env.MONGO_URI);

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);


// global thimgs

const item1 = new Item({
    name: "Welcome to your to do List"
});
const item2 = new Item({
    name: "Press + to add"
});
const item3 = new Item({
    name: "<-- click here to remove>"
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {



    Item.find(function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Inserted Successfully");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }

    });

});

app.post("/", function (req, res) {

    itemName = req.body.nextListItem;

    const listName = req.body.list;

    const newItem = new Item({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();

        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        })
    }


});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;

    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("deleted successfully");
            }
        });

        res.redirect("/");
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }


});

app.get("/:customListName", function (req, res) {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // creating a new list

                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();

                res.redirect("/" + customListName);

            } else {
                // Showing old list

                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    })
});



app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
