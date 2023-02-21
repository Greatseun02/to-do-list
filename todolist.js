const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")
const express = require("express")
const app = express()
mongoose.set('strictQuery', false)
mongoose.connect("mongodb+srv://goodnewsadewole9:SyWJxxj0Gaf7yGsY@cluster0.wxe614q.mongodb.net/todolistDB?retryWrites=true&w=majority")

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));
app.set('view engine', 'ejs')

const date = new Date()
const options = {
    weekday: "long",
    day: "2-digit", 
    month:"long"
}
const today = date.toLocaleString("en-US", options)
const itemSchema = new mongoose.Schema({
    name: String
}) 

const listSchema = new mongoose.Schema({
    name: String,
    itemList: [itemSchema]
})

const Item = mongoose.model("Item", itemSchema)
const ListItem = mongoose.model("ListItem", listSchema)
const item1 = new Item({
    name: "Welcome to your to-do list!"
})
const item2 = new Item({
    name : "Hit the + button to add a new item to your list"
})

const item3 = new Item({
    name : "<-- Hit this to delete an item"
})

const initialItems = [item1, item2, item3]

app.get("/", function(req, res){

    Item.find(function (err, allItems) {
        if (allItems.length === 0){
            Item.insertMany(initialItems, function(err){console.log(err)})
            res.redirect("/")
        }
        else{res.render("index", {listTitle:"Today", items:allItems, items_length:allItems.length})}
     
    })    

})

app.get("/:paramName", function(req, res){
    const listCheckedItems = _.upperFirst(req.params.paramName)
    let redirected = false
    if (listCheckedItems !== "Favicon.ico"){
        if(!redirected){
        ListItem.findOne({name: listCheckedItems}, function(err, foundList){
            if(!err){
             console.log("found list - " + foundList)
             if(!foundList){
                 const listItem = new ListItem({
                     name: listCheckedItems,
                     itemList: initialItems
                 })
                 ListItem.insertMany(listItem, function(err){console.log(err)})
             redirected = true
             res.redirect("/" + listCheckedItems)
             }else{
                res.render("index",{listTitle:foundList.name, items:foundList.itemList, items_length:(foundList.itemList).length})
             }
            }
        })
    }
  }
})
         

app.post("/", function(req, res){
    const newItem = req.body.to_do
    const listName = req.body.button
    const NewerItems = new Item({
        name:newItem
    })
    
    if (listName === "Today"){
        Item.insertMany(NewerItems, function(err){console.log(err)})
        res.redirect("/")
    }else{
        ListItem.findOne({name: listName}, function(err, foundList){
            foundList.itemList.push(NewerItems)
            foundList.save()
            res.redirect("/" + listName)
            
        })
    }

})

app.post("/delete", function(req, res){
    
    const toDelete = req.body.inputDelete
    const listTitle = req.body.listName
    if (listTitle === "Today"){
        Item.deleteOne({_id:toDelete}, function(err){console.log(err)})
        res.redirect("/")
    } else{
        ListItem.findOne({name: listTitle}, function(err, foundList){
            foundList.itemList.pull({_id: toDelete})
            foundList.save()
            res.redirect("/" + listTitle)
        })
    }

  
})


app.get("/about", function(req, res){
    res.render("about")
})

app.listen(process.env.PORT||3000, function(){
    console.log("Hello World")
}) 