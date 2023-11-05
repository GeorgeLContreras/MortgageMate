const express = require("express")
const ejs = require("ejs");
const path = require("path");


const utils = require("./utils");


app = express()
app.use(express.static(path.join(__dirname, "/assets")));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));


app.post("/upload_csv1", (req, res) => {
    console.dir(req);

    res.send("you got here");
});


app.post("/upload_csv", async (req, res) => {
    var fileName = "HackUTD-2023-HomeBuyerInfo.csv"
    await utils.readCSV(fileName);
    
    res.render("index.ejs");
});

app.get("/upload_csv", (req, res) => {
    res.render("upload_file.ejs");
});

app.get("/", (req, res) => {

    var {suggestedActions, sideNotes } = utils.checkApproval(645, 10000, 200, 300, 0, 100000, 7000, 88000, 1800);

    // suggested actions are actions the user should take to get their mortgage approval
    // next time. If there are none, then the user has been approved

    var totalSuggestedActions = 0;
    totalSuggestedActions += suggestedActions.creditScore.length;
    totalSuggestedActions += suggestedActions.LTV.length;
    totalSuggestedActions += suggestedActions.DTI.length;
    totalSuggestedActions += suggestedActions.FEDTI.length;

    console.log(sideNotes);
    console.log(suggestedActions);

    // if user has been approved
    if(totalSuggestedActions == 0){
        res.send("APPROVED :)");
        // res.render("successful.ejs", {sideNotes});
    }

    else {
        res.send("not approved :(");
        // res.render("unsucessful.ejs", {suggestedActions});
    }

});

app.listen(3000, () => {
    console.log("Alfred, at your service!");
});