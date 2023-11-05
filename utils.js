const fs = require("fs");
const { parse } = require("csv-parse");

const utils = {};

utils.checkApproval = function(creditScore, grossIncome, carPayment, cardPayment,studentLoanPayment, appraisedValue, downPayment, loanAmount, mortgage ){

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

    var csvHeaders = [];
    var csvData = [];
    var isFirstIteration = true;

fs.createReadStream(fileName)
  .pipe(parse({ delimiter: ",", from_line: 1 }))
  .on("data", function (row) {
    if(isFirstIteration){
        csvHeaders = row;
        console.log(csvHeaders);
        isFirstIteration = false;
    } else {
        var rowData = {};
        for(var i = 0; i < csvHeaders.length; i++){
            var header = csvHeaders[i];
            rowData[header] = row[i];
        }
        csvData.push(rowData);
    }

  })
  .on("end", function () {
    console.log("finished");
    console.log("should be first");
    return csvData;
  })
  .on("error", function (error) {
    console.log(error.message);
  });
}

module.exports = utils;