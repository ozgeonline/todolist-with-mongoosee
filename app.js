//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//*database schema
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb+srv://ozgeonline:o6kIuhzRA7S8hjPm@cluster0.ggoykbs.mongodb.net/todolistDB'); //Sunucuyla bağlantı kurup fruitsDB adında veritabanı arayacak.
   console.log("connected to the server");
 };

const itemsSchema = {
  name: String
};
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist !"
});
const item2 = new Item({
  name: "Hit the + button to aff a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model('List',listSchema);


app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
        console.log("Successfully");
      }).catch(function(err){
      console.log(err);
      });
      res.redirect("/");
    }else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
  .catch(function(err){
    console.log(err);
  });
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
  .then(function (foundList) {

    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });

      list.save();
      res.redirect("/" + customListName);

    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  })
  .catch(function (err) {
    console.log(err);
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({ name: listName })
    .then(function (foundList) {

      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch(function (err) {
      console.log(err);
    });
  }
});


app.post("/delete", function(req, res){
  const checkedListName = req.body.listName;
  const checkedItemId = req.body.checkbox;

  if(checkedListName==="Today"){
    //In the default list
    del().catch(err => console.log(err));

    async function del(){
      await Item.deleteOne({_id: checkedItemId});
      res.redirect("/");
    }
  } else{
    //In the custom list

    update().catch(err => console.log(err));

    async function update(){
      await List.findOneAndUpdate({name: checkedListName}, {$pull: {items: {_id: checkedItemId}}});
      res.redirect("/" + checkedListName);
    }
  }

});

app.get("/about", function(req, res){
  res.render("about");
});
app.get("/favicon.ico", function (req, res) {
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
