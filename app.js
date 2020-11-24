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

//@route /cases 
//@desc Retrieve All The Cases
//@method GET

app.get('/cases', (req, res) => {
	Case.find({}, (err, newCases) => {
		if(err){
			res.sendStatus(500)
			console.log(err)
		} else {
			res.send(JSON.stringify(newCases))
		}
	})
})



//@route /case/new
//@desc Creates A New Case
//@method POST

app.post('/case/new', (req, res) => {
	Case.create({
		name: req.body.name,
		paid: req.body.paid,
		assigned: req.body.assigned,
		description: req.body.description,
		date: req.body.date,
	}, (err, created) => {
		if(err){
			console.log(err)
		} else {
			res.send(created)
		}
	})
})

//Income & Profit Route
app.get("/income", (req, res) => {
	Income.find({}, (err, incomes) => {
		if(err){
			console.log(err);
		} else {
			res.send(JSON.stringify(incomes));
		}
	})
});

app.get('/expenses', (req, res) => {
	Expense.find({}, (err, expenses) => {
		if(err){
			console.log(err)
		} else {
			res.send(JSON.stringify(expenses))
		}
	})
})

//Total Expense Function

//Total Expenses Route
app.get('/totalExpenses', (req, res) => {
	totalExpense.find({}, (err, found) => {
		if(err){
			console.log(err)
		} else {
			res.send(found.total)
		}
	})
})

//New Case Route 
app.post('/new/case', (req, res) => {
	Case.create({
		name: req.body.name,
		paid: req.body.paid,
		assigned: req.body.assigned,
		date: req.body.date,
		description: req.body.description 
	}, (err, newCase) => {
		if(err){
			console.log(err)
		} else {
			updateIncome(newCase.paid)
			res.sendStatus(200)
		}
	})
})

//New Expense Route
app.post('/new/expense', (req, res) => {
	Expense.create({
		name: req.body.name,
		description: req.body.description,
		price: req.body.price
	}, (err, expenses) => {
		if(err){
			console.log(err)
		} else {
			totalExpense.find({}, (err, total) => {
				if(err){
					console.log(err)
				} else {
					total.total += expenses.price
					total.save()
					res.send(expenses)
				}
			}
		)
		}
	}
	)
})

//Move To History Case Route
app.delete('/case/delete', (req, res) => {
	Case.find({done: true}, (err, found) => {
		if(err){
			console.log(err)
		} else {
			found.forEach(done => {
				CaseHistory.create({
					name: done.name,
					paid: done.paid,
					description: done.description,
					date: done.date,
					assigned: done.assigned
				}, (err, created) => {
					if(err){
						console.log(err)
					} else {
						found.forEach(one => {
							Case.findOneAndDelete({_id: one._id}, (err, deleted) => {
								if(err){
									console.log(err)
								} else {
									res.send(created)
								}
							})
						})
					}
				})
			})
		}
	})
});

//Update Case Route
app.put('/case/update', (req, res) => {
	Case.findOneAndUpdate(req.body.id, {
		name: req.body.name,
		paid: req.body.paid,
		assigned: req.body.assigned,
		description: req.body.description,
		date: req.body.date,
		number: req.body.number,
	}, (err, newCase) => {
		if(err){
			console.log(err)
		} else {
			res.send(newCase)
		}
	})
})

//Update Profit
function updateProfit(){
	Income.find({}, (err, incomes) => {
		if(err){
			console.log(err)
		} else {
			var income = incomes.income;
			var expense = totalExpense(); 
			var profit = income - expense
			incomes.profit = profit;
			Income.save
		}
	})
}

//Update Income
function UpdateIncome(paid) {
	Income.find({}, (err, income) => {
		income.income += paid;
		income.save()
	})
}

//Update Expense Route
app.put('/expense/update', (req, res) => {
	var id = req.body.id
	Expense.findOneAndUpdate(id, {
		name: req.body.name,
		description: req.body.description,
		price: req.body.price
	}, (err, updated) => {
		if(err){
			console.log(err)
		} else {
			updateProfit();
			res.send(JSON.stringify(updated))
		}
	})
});

//Delete Expense
app.delete('/expense/delete', (req, res) => {
	Expense.findOneAndDelete(req.body.id, (err, expense) => {
		if(err){
			console.log(err)
		} else {
			res.send(expense)
			res.sendStatus(200)
		}
	})
})

app.listen(process.env.PORT || 80, function(){
    console.log('server started')
})

