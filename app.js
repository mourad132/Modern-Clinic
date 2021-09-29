//NODE MODULES
const app = require("express")();
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Mourad:Momo2005@modern-clinic.noa2u.mongodb.net/App?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true});
const cors = require('cors');
const bodyParser = require('body-parser');

//LOCAL MODULES
const Case = require('./models/case.js');
const User = require('./models/user.js');
const Income = require('./models/income.js');
const Expense = require('./models/expense.js');
const CaseHistory = require('./models/CaseHistory');
const totalExpense = require('./models/totalExpense');

//APP CONFIG
app.use(cors());
app.use(bodyParser.urlencoded({ extened: false }));
app.use(bodyParser.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// -----------------------
// ***** Case Routes *****
// -----------------------

//get all cases
app.get('/cases', (req, res) => {
	// find all cases
	Case.find({}, (err, newCases) => {
		if(err){
			//if there is an error
			//send status code 500 (server error)
			res.sendStatus(500)
			//print it out
			console.log(err)
		} else {
			// send the cases found
			res.send(JSON.stringify(newCases))
		}
	})
})

// Deleted Case By Id
app.get('/delete/:id', (req, res) => {
	// Find A Case A Delete it
	CaseHistory.findOneAndDelete({_id: req.params.id}, (err, deleted) => {
		if(err){
			// if there is any error, print it out
			console.log(err)
		}
	})
})

//New Case Route 
app.post('/new/case', (req, res) => {
	//create new case
	Case.create({
		name: req.body.name,
		paid: req.body.paid,
		assigned: req.body.assigned,
		date: req.body.date,
		description: req.body.description,
		done: false,
	}, (err, newCase) => {
		if(err){
			//if there is an error, print it out
			console.log(err)
		} else {
			//find income
			Income.findOne({}, (err, income) => {
				if(err){
					console.log(err)
				} else {
					//increment it by the new case
					income.income += newCase.paid
					//save the income 
					income.save()
					// send it
					res.send(income)
				}
			})
		}
	})
})


//Update Case Route
app.put('/case/update', (req, res) => {
	//finds a case and updates it
	Case.findOneAndUpdate(req.body.id, {
		name: req.body.name,
		paid: req.body.paid,
		assigned: req.body.assigned,
		description: req.body.description,
		date: req.body.date,
		number: req.body.number,
	}, (err, newCase) => {
		//if there is an error
		if(err){
			//print it out
			console.log(err)
		} else {
			//send the new case
			res.send(newCase)
		}
	})
})


// ----------------------
// *** History Routes ***
// ----------------------

// Sends Case History (Recently Deleted Cases)
app.get('/history', (req, res) => {
	//finds all cases 
	CaseHistory.find({}, (err, found) => {
		if(err){
			// if there is any error, print it out
			console.log(err)
		} else {
			// and send them
			res.send(found)
		}
	})
})


//Move To History Case Route
app.get('/case/delete/:id', (req, res) => {
	//find case using id
	Case.findById(req.params.id, (err, found) => {
		//if there is an error
		if(err){
			//print it out
			console.log(err)
		} else {
			//create new recently deleted case
			CaseHistory.create({
				name: found.name,
				paid: found.paid,
				description: found.description,
				date: found.date,
				assigned: found.assigned,
			}, (err, history) => {
				// if there is an error
				if(err){
					//print it out
					console.log(err)
				} else {
					//find the case and delete it
					Case.findOneAndDelete({_id: found._id}, (err, deleted) => {
						//if there is an error 
						if(err){
							//print it out
							console.log(err)
						} else {
							//send the recently deleted case
							res.send(history)
						}
					})
				}
			})
		}
	})
});

// Add New Case To Recently Deleted Cases
app.post("/history/new/:id", (req, res) => {
	// find the case
	Case.find({_id: req.params.id}, (err, found) => {
		if(err){
			// if there is an error, send it
			res.send(err)
		} else {
			// create new case history from the deleted case
			CaseHistory.create({
				name: found.name,
				paid: found.paid,
				assigned: found.assigned,
				description: found.description,
				date: found.date,
				number: found.number,
		}, (err, created) => {
			if(err){
				// if there is any error, send it
				res.send(err)
			} 
		})
			}
		})
})

// ---------------------
// ** Expenses Routes **
// ---------------------

// clear Total Expenses
app.get('/clearExpense', (req, res) => {
	//find the total expenses
	totalExpense.findOne({}, (err, total) => {
		if(err){
			// if there is an error, print it out
			console.log(err)
		} else {
			//make total = 0
			total.total = 0
			//save it
			total.save()
		}
	})
})

// expenses route
app.get('/expenses', (req, res) => {
	//find all expenses
	Expense.find({}, (err, expenses) => {
		if(err){
			//if there is an error, print it out
			console.log(err)
		} else {
			// send the expenses 
			res.send(JSON.stringify(expenses))
		}
	})
})

//Update Expense Route
app.put('/expense/update', (req, res) => {
	//initiate id
	var id = req.body.id
	//find the expense and update it
	Expense.findOneAndUpdate(id, {
		name: req.body.name,
		description: req.body.description,
		price: req.body.price
	}, (err, updated) => {
		//if there is an error
		if(err){
			//print it out
			console.log(err)
		} else {
			//send the updated one
			res.send(JSON.stringify(updated))
		}
	})
});

//Delete Expense
app.get('/expense/delete/:id', (req, res) => {
	//find an expense and delete it
	Expense.findOneAndDelete(req.params.id, (err, expense) => {
		//if there is an error
		if(err){
			//print it out
			console.log(err)
		}
		else {
			// find the total expense
			totalExpense.findOne({}, (err, total) => {
				// if there is an error
				if(err){
					// print it out
					console.log(err)
				} else {
					// decrement the expense price from total
					expense.price -= total.total
					//save total
					total.save()
				}
			})
		}
	})
})


//Total Expense Function

//Total Expenses Route
app.get('/totalExpenses', (req, res) => {
	//find total expense
	totalExpense.findOne({}, (err, found) => {
		if(err){
			//if there is an error, print it out
			console.log(err)
		} else {
			// send it
			res.send(found)
		}
	})
})

//New Expense Route
app.post('/new/expense', (req, res) => {
	//create new expense
	Expense.create({
		name: req.body.name,
		description: req.body.description,
		price: req.body.price
	}, (err, expenses) => {
		// if there is an error
		if(err){
			//print it out
			console.log(err)
		} else {
			//find total expense
			totalExpense.findOne({}, (err, total) => {
				//if there is an error
				if(err){
					// Print it out
					console.log(err)
				} else {
					//increment total by the new expense
					total.total += expenses.price
					//save the total
					total.save()
				}
			})
		}
	}
	)
})

// ------------------------------
// *** Income & Profit Routes ***
// ------------------------------

// clears the income
app.get('/clearIncome', (req, res) => {
	//find the income 
	Income.findOne({}, (err, income) => {
		if(err){
			// if there is an error, print it out
			console.log(err)
		} else {
			//clear it
			income.income = 0
			//save it
			income.save()
		}
	})
})

//Income & Profit Route
app.get("/income", (req, res) => {
	//find income
	Income.findOne({}, (err, income) => {
		if(err){
			//if there is an error, print it out
			console.log(err);
		} else {
			//find total expense
			totalExpense.findOne({}, (err, total) => {
				if(err){
					// if there is an error, print it out
					console.log(err)
				} else {
					//send total income and expense
					res.send({income: income, total: total});					
				}
			})
		}
	})
});

// --------------------
// *** Start Server ***
// --------------------

// listen for server
app.listen(process.env.PORT || 80, function(){
    console.log('server started')
})
