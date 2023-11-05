const express = require("express")
const ejs = require("ejs");
const path = require("path");
const multer = require("multer");

const utils = require("./utils");
var upload = multer({dest: "uploads"});

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


app.post("/upload_csv", upload.single("csv_file"), async (req, res) => {
    console.log("eureka!!");
    console.log(req.file);
    var fileName = req.file.filename;
    await utils.readCSV(fileName);
    
    res.render("newPage.ejs");
});


app.get("/", (req, res) => {
    res.render('index.ejs');
});

app.post("/checkApproval", (req, res) => {
    var { creditScore, grossIncome, carPayment, cardPayment,studentLoanPayment, appraisedValue, downPayment, mortgage } = req.body;
    

    creditScore = Number(creditScore);
    grossIncome = Number(grossIncome);
    carPayment = Number(carPayment);
    cardPayment = Number(cardPayment);
    studentLoanPayment = Number(studentLoanPayment);
    appraisedValue = Number(appraisedValue);
    downPayment = Number(downPayment);
    mortgage = Number(mortgage);

    var loanAmount = appraisedValue - downPayment;

    var {suggestedActions, sideNotes} = utils.checkApproval(creditScore, grossIncome, carPayment, cardPayment,studentLoanPayment, appraisedValue, downPayment, loanAmount, mortgage);
    
    var totalSuggestedActions = 0;
        totalSuggestedActions += suggestedActions.creditScore.length;
        totalSuggestedActions += suggestedActions.LTV.length;
        totalSuggestedActions += suggestedActions.DTI.length;
        totalSuggestedActions += suggestedActions.FEDTI.length; 
    
    if(totalSuggestedActions == 0){
        res.render("successful.ejs", {sideNotes});
    } else {
        res.render("unsuccessful.ejs", {suggestedActions});
    }
});

app.get("/upload_csv", (req, res) => {
    res.render("getCSV.ejs");
});

app.listen(3000, () => {
    console.log("Alfred, at your service!");
});