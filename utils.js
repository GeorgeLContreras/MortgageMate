const fs = require("fs");
const { parse } = require("csv-parse");
const {convertArrayToCSV} = require("convert-array-to-csv");
const converter = require("convert-array-to-csv");

const utils = {};

utils.checkApproval = function(creditScore, grossIncome, carPayment, cardPayment,studentLoanPayment, appraisedValue, downPayment, loanAmount, mortgage ){

        console.log(creditScore);
    console.log(grossIncome);
    console.log(carPayment);
    console.log(cardPayment);
    console.log(studentLoanPayment);
    console.log(appraisedValue);
    console.log(downPayment);
    console.log(loanAmount);
    console.log(mortgage);


    // check if the user is able to afford their mortgage. If not, add suggested
    // actions for each possible limiting factor why loan is not approved
    var suggestedActions = {
        creditScore: [],
        LTV: [],
        DTI: [],
        FEDTI: []
    }

    // sidenotes holds strings that are shown if a user is approved for a mortgage but
    // under certain conditions
    var sideNotes = [];

    // check if credit score is 640 or more
    if(creditScore < 640) {
        suggestedActions["creditScore"].push("Increase credit score. 640 or above prefered");
    }

    // check if loan-to-value is above 95. If so, calculate how much more they
    // would need to pay as down payment (how much LESS would go in the loan) to
    // see what they would need to be able to buy a house of the same value.
    // Also check how much house they can afford assuming they do NOT want
    // to increase their down payment (what is the max value to make loan to
    // value under 80)
    const LTV = loanAmount / appraisedValue;
    if(LTV == NaN){
        throw new Error("Project being dumb");
    }
    console.log(`ltv: ${LTV}`);
    var monthlyPMI = null;

    if(LTV >= .95){


        
        // calc min down payment needed to purchase house of given appraised value

        var maxLoanAmount = .80 * appraisedValue;
        var minDownPayment = appraisedValue - maxLoanAmount;
        suggestedActions.LTV.push(`To afford a house of that price, ${minDownPayment} or more must be put as down payment to achieve a desirable loan-to-value ratio`);

        // var maxAppraisedValue = loanAmount / .80;
        //  suggestedActions.LTV.push(`Consider purchasing a house of ${maxAppraisedValue} or more to limit the loan-to-value ratio using the given loan amount.`);
    } else if(.80 <= LTV && LTV < .95) {
        monthlyPMI = .01 * appraisedValue;
        sideNotes.push(`A monthly private mortgage insurance of ${monthlyPMI} will be required due to a high loan-to-value ratio.`);
    }

    // if DTI is between above 36% and under 43%, a user will be accepted but
    // they will be told that many lenders prefer a DTI under 36%
    var frontEndDebt = mortgage + monthlyPMI;
    var debt =  frontEndDebt + studentLoanPayment + carPayment + cardPayment;
    creditScore, grossIncome, carPayment, cardPayment,studentLoanPayment, appraisedValue, downPayment, loanAmount, mortgage

    console.log(`debt: ${debt}`);
    console.log(`income: ${grossIncome}`);
    var DTI = debt / grossIncome;

    console.log(`dti: ${DTI}`);
    if(DTI >= .43){
        var maxDebt = .36*grossIncome;
        suggestedActions.DTI.push(`Decrease debt to under $${maxDebt} to lower the Debt-to-Income ratio to under 36%`);
    }
    else if (DTI >= .36 && DTI < .43){
        sideNotes.push(`Many lenders prefer a Debt-to-Income ratio (current: ${DTI*100}%) of under 36 %`);
    }

    // check for FEDTI...
    var FEDTI = frontEndDebt / grossIncome;
    console.log(`fedti: ${FEDTI}`);
    if (FEDTI >= .28){
        var maxDebt = .28 * grossIncome;
        var minIncome = frontEndDebt/.28;
        
        suggestedActions.FEDTI.push(`Try decreasing front end debt (mortgage + monthly private insurance payment) to under $${maxDebt} to lower the Front-End-Debt-to-Income ratio to under 28% for the given income`);
        suggestedActions.FEDTI.push(`Increasing monthly income to above $${minIncome} will bring Front-End-Debt-to-Income ratio under 28% for the given debt`);
    }

    return {suggestedActions, sideNotes};
}

utils.readCSV = function(fileName){

    // array of strings where each string is a header in the csv file
    var csvHeaders = [];
    // array where each element is a Map corresponding to the ith+1 row of the csv
    var csvDataMaps = [];
    // array where each element is an array corresponding to the ith+1 row of the csv
    var csvRows = [];
    var isFirstIteration = true;
return new Promise((resolve, reject) => {
fs.createReadStream(fileName)
  .pipe(parse({ delimiter: ",", from_line: 1 }))
  .on("data", function (row) {

    if(isFirstIteration){
        csvHeaders = row;
        csvHeaders.push("Approved");
        console.log(csvHeaders);
        isFirstIteration = false;
    } else {
        csvRows.push(row);
        
        var id = row[0];
        var grossIncome = Number(row[1]);
        var cardPayment = Number(row[2]);
        var carPayment = Number(row[3]);
        var studentLoanPayment = Number(row[4]);
        var appraisedValue = Number(row[5]);
        var downPayment = Number(row[6]);
        var loanAmount = Number(row[7]);
        var mortgage = Number(row[8]);
        var creditScore = Number(row[9]);
        var {suggestedActions, sideNotes} = utils.checkApproval(creditScore, grossIncome, carPayment, cardPayment,studentLoanPayment, appraisedValue, downPayment, loanAmount, mortgage);
        var totalSuggestedActions = 0;
        totalSuggestedActions += suggestedActions.creditScore.length;
        totalSuggestedActions += suggestedActions.LTV.length;
        totalSuggestedActions += suggestedActions.DTI.length;
        totalSuggestedActions += suggestedActions.FEDTI.length; 
        
        // add to the array that represents the csv file 'Y' if the user
        //  was approved and 'N' if the user was not
        var accepted;

        if(totalSuggestedActions){
            accepted = 'N';
        } else {
            accepted = 'Y';
        }

        csvRows[csvRows.length - 1].push(accepted);
        csvDataMaps.push({
            creditScore, grossIncome, carPayment, cardPayment,studentLoanPayment, appraisedValue, downPayment, loanAmount, mortgage, accepted
        });

    }

  })
  .on("end", function () {
    console.log("finished");
    console.log("should be first");

    // write over csv file (same as given input, but with a new column dictating whether or not they were approved for a loan)
    const csvFromArrayOfArrays = convertArrayToCSV(csvRows, {
        header: csvHeaders,
        separator: ','
    });
    fs.writeFile(fileName, csvFromArrayOfArrays, err => {
        if(err){
            reject(err);
        }

        else {
            resolve("FINISHED WRITING TO CSV");
        }
    });
  })
  .on("error", function (error) {
    console.log(error.message);
    reject("ERROR reading file");
  });
})
}

module.exports = utils;