//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-bentley:admin@cluster0.hubtiqs.mongodb.net/todolistDB");

const itemsSchema = {
  name: {
    type: String,
    required: true
  }
};


const Item = mongoose.model("Item", itemsSchema);


let firstItem = new Item({
  name: "Welcome To Your New To-Do List!"
});

let secondItem = new Item({
  name: "Click the '+' to add to your list"
});

let thirdItem = new Item({
  name: "<-- Click this to delete an item"
});

const defaultItems = [firstItem, secondItem, thirdItem];


const listSchema = {

  name: String,
  items: [itemsSchema]

};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  

  Item.find({}, (err, results) =>{

    if (err){
      console.log(err);
    }

    if (results.length === 0){
      Item.insertMany([firstItem, secondItem, thirdItem]);
      res.redirect("/");
    }
      res.render("list", {listTitle: "Today", newListItems: results});
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, result) => {

      result.items.push(item);
      result.save();
      res.redirect("/" + listName)

    });
  };
});



app.post("/delete", (req, res) => {

  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    
    Item.deleteOne({_id: checkItemId}, err => {if(err){console.log("A Error Occured: "+ err)}else{console.log("Deleted Successfully"); res.redirect("/");}});

  } else {

    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, (err, result) => {
      if (!err){
        res.redirect("/" + listName);
      }
    });

  }

  
  

});

app.get("/:newList", (req, res) => {

  const newList = req.params.newList;

  List.findOne({name: newList}, (err, results) => {

    if(!err){

      if(!results){
        //Create a new list
        const list = new List({

          name: newList,
          items: defaultItems
      
        });
      
        list.save();
        res.redirect("/" + newList);
      } else{
        //Show an existing list
        res.render("list", {listTitle: results.name, newListItems: results.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
