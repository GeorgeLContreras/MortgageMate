const express = require("express")
const ejs = require("ejs");
const path = require("path");


const utils = require("./utils");


app = express()
app.use(express.static(path.join(__dirname, "/assets")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));


app.get("/dummy", async (req, res) => {
    const csvData = await utils.readCSV("HackUTD-2023-HomeBuyerInfo.csv");
    console.log("should be second");
    // console.log(`length: ${csvData.length}`);
    res.render("index.ejs");
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