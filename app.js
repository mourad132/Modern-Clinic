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

app.get('/delete/:id', (req, res) => {
	CaseHistory.findOneAndDelete({_id: req.params.id}, (err, deleted) => {
		if(err){
			console.log(err)
		}
	})
})

app.get('/history', (req, res) => {
	CaseHistory.find({}, (err, found) => {
		if(err){
			console.log(err)
		} else {
			res.send(found)
		}
	})
})

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

app.get('/clearIncome', (req, res) => {
	Income.findOne({}, (err, income) => {
		if(err){
			console.log(err)
		} else {
			income.income = 0
			income.save()
		}
	})
})

app.get('/clearExpense', (req, res) => {
	totalExpense.findOne({}, (err, total) => {
		if(err){
			console.log(err)
		} else {
			total.total = 0
			total.save()
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
			Income.findOne({}, (err, income) => {
				if(err){
					console.log(err)
				} else {
					income.income += created.paid
					income.save()
					res.send(income)
				}
			})
			res.send(created)
		}
	})
})

//Income & Profit Route
app.get("/income", (req, res) => {
	Income.findOne({}, (err, income) => {
		if(err){
			console.log(err);
		} else {
			totalExpense.findOne({}, (err, total) => {
				if(err){
					console.log(err)
				} else {
					res.send({income: income, total: total});					
				}
			})
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
	totalExpense.findOne({}, (err, found) => {
		if(err){
			console.log(err)
		} else {
			res.send(found)
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
		description: req.body.description,
		done: false,
	}, (err, newCase) => {
		if(err){
			console.log(err)
		} else {
			Income.findOne({}, (err, income) => {
				if(err){
					console.log(err)
				} else {
					income.income += newCase.paid
					income.save()
					res.send(income)
				}
			})
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
			totalExpense.findOne({}, (err, total) => {
				if(err){
					console.log(err)
				} else {
					total.total += expenses.price
					total.save()
				}
			})
		}
	}
	)
})

//Move To History Case Route
app.get('/case/delete/:id', (req, res) => {
	Case.findById(req.params.id, (err, found) => {
		if(err){
			console.log(err)
		} else {
			CaseHistory.create({
				name: found.name,
				paid: found.paid,
				description: found.description,
				date: found.date,
				assigned: found.assigned,
			}, (err, history) => {
				if(err){
					console.log(err)
				} else {
					Case.findOneAndDelete({_id: found._id}, (err, deleted) => {
						if(err){
							console.log(err)
						} else {
							res.send(history)
						}
					})
				}
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
			res.send(JSON.stringify(updated))
		}
	})
});

//Delete Expense
app.get('/expense/delete/:id', (req, res) => {
	Expense.findOneAndDelete(req.params.id, (err, expense) => {
		if(err){
			console.log(err)
		}
		else {
			totalExpense.findOne({}, (err, total) => {
				if(err){
					console.log(err)
				} else {
					expense.price -= total.total
					total.save()
				}
			})
		}
	})
})

app.listen(process.env.PORT || 80, function(){
    console.log('server started')
})

