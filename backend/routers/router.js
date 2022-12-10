const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const schema = require('../database/schema');

const taskGenerator = require('../task_generator');

// export database
router.get('/', async (req,res) => {
	// const userId = req.session.userId;
	// res.status(401).send("Log in to proceed")
	// res.status(403).send("User must be an administrator to export data")
	res.json({databaseContent: "comes here"});
});

// import database (replace existing)
router.post("/", async (req, res) => {
	const databaseContent = req.body.databaseContent;
	// const userId = req.session.userId;
	// res.status(401).send("Log in to proceed")
	// res.status(403).send("User must be an administrator to reset data")
	res.send("Ok");
});

// submit attempt, return verdict (ok/not ok)
router.post("/submit", async (req, res) => {
	const taskId = req.body.taskId;
	// const userId = req.session.userId;
	const answer = req.body.answer;
	const startTime = req.body.startTime;
	const endTime = req.body.endTime;
	// res.status(400).send("taskId is not ObjectId hex string")
	// res.status(403).send("Task belongs to a different user")
	res.send("correct")
	// res.send("not correct")
});

// get all active homeworks and their progress for pupil
router.get("/personal/homeworks", async (req, res) => {
	// const userId = req.session.userId;
	// res.status(401).send("Log in as a pupil to proceed")
	res.json({homeworks: "go here"});
	/*
	[
		{
			id: "2054fa1209a9845c2aa02003",
			deadline: "2022-12-07T00:00:00.000Z",
			tasks: [
				{
					categories: ["subtraction", "division"],
					progress: 0,
					requirement: 10
				},
				...
			]
		},
		...
	]
	 */
});

// get task by categories; if unsolved task exists, return it instead of creating a new task
router.get("/task", async (req, res) => {
	if(!req.query.categories) {
		res.status(400).send("Request must contain 'categories' as query parameter");
		return;
	}
	const categories = req.query.categories.split(" ");
	if(!categories.length) {
		res.status(400).send("'categories' must not be empty");
		return;
	}
	// console.log(`GET request to /task: ${JSON.stringify(req)}`);
	console.log(`Got cookies: ${JSON.stringify(req.cookies)}`);
	console.log(`Got signed cookies: ${JSON.stringify(req.signedCookies)}`);
	const userId = req.cookies.userId;
	console.log("User id kinda sus:", userId, typeof userId);
	if(userId === undefined) {
		// test cookie
		// res.cookie("userId", "a", { maxAge: 20000 })
		const task = taskGenerator(categories);
		task.id = null;
		task.created_timestamp = null;
		res.json(task);
		return;
	}
	res.send("not implemented")
});

// get categories from last task pupil tried to solve before
router.get("/personal/last-categories", async (req, res) => {
	// const userId = req.session.userId;
	// res.status(401).send("Log in as a pupil to proceed")
	res.json(["subtraction", "division"])
});

// get attempts for a user filtered by...
router.get("/personal/attempts",
	async (req, res) => {
		// const userId = req.session.userId;
		const requestedUserId = req.query.userId; // если запрос со стороны учителя, то userId !== requestedUserId
		const sortByDatetime = req.query.sortByDatetime; // "asc" | "desc" | null
		const sortBySolvingTime = req.query.sortBySolvingTime; // "asc" | "desc" | null
		const taskContent = req.query.taskContent;
		const categories = req.query.categories;
		const answer = req.query.answer;
		const verdict = req.query.verdict; // null | "correct" | "not correct" | "in progress"
		// res.status(400).send(`${something} is not ${some_type}`)
		// res.status(401).send("Log in to proceed")
		// res.status(403).send("Requested pupil is not in any of this teacher's classes")
		res.json({
			attempts: [
				{
					datetime: "2022-11-15T06:31:15.000Z",
					taskContent: "16x3-17",
					categories: ["subtraction", "multiplication"],
					solvingTime: "1970-01-01T00:01:02.000Z",
					answer: 42,
					verdict: false
				},
				{
					datetime: "2022-11-15T09:25:00.000Z",
					taskContent: "82-65-11",
					categories: ["subtraction"],
					solvingTime: "1970-01-01T00:00:42.000Z",
					answer: 6,
					verdict: true
				}
			],
			correct: 1,
			wrong: 1
		});
	});

// publish new homework
router.post("/classes/homeworks", async (req, res) => {
	const classIds = JSON.parse(req.body.classIds);
	const deadline = new Date(req.body.deadline);
	const homeworkTasks = JSON.parse(req.body.homeworkTasks);
	// const userId = req.session.userId;
	// res.status(400).send(`${something} is not ${some_type}`)
	// res.status(401).send("Log in as a teacher to proceed")
	res.status(201).send("Created");
});

// add a class
router.post("/classes", async (req, res) => {
	const className = req.body.className;
	// res.status(400).send(`${something} is not ${some_type}`)
	// res.status(401).send("Log in as a teacher to proceed")
	// res.status(409).send(`Class named "${className}" already exists`)
	res.status(201).json({classId: "goes here"});
});

// join to class as a pupil
router.post("/classes/:id([0-9a-f]+)/join", async (req, res) => {
	const classId = req.params.id;
	// const userId = req.session.userId;
	// res.status(401).send("Log in as a pupil to proceed")
	// res.status(409).send("Pupil already present in a class")
	res.send("Ok");
});

// get statistics for all students in a class (Class Page)
router.get("/classes/:id([0-9a-f]+)/stats", async (req, res) => {
	const classId = req.params.id;
	// const userId = req.session.userId;
	// res.status(401).send("Log in as a teacher to proceed")
	res.json({stats: "go here"})
	/*[
	{
		firstName: "Fedor",
		lastName: "Fedorov",
		email: "fedorov.f@example.com",
		lastActivity: "2022-11-15T06:31:15.000Z",
		homeworkProgress: 6,
		errorCount: {
			addition: 1,
			subtraction: 8,
			multiplication: 2,
			division: 38
		},
		lastDistractionTime: "2022-11-01T09:58:15.000Z",
		lastDistractionSolveTime: "1970-01-01T00:05:40.000Z"
	}, ... ]
	 */
});

// get aggregated statistics for all classes by teacher (Add Class Process Page)
router.get("/classes", async (req, res) => {
	// const userId = req.session.userId;
	// res.status(401).send("Log in as a teacher to proceed")
	res.json({data: "goes here"});
	/*
	[
		{
			name: "1A",
			pupilCount: 24,
			homeworks: [...],
			doneLastHomework: 22,
			totalSubmissions: 576,
			correctSubmissions: 384
		},
	...]
	 */
});

// delete a class
router.post("/classes/:id([0-9a-f]+)/delete", async (req, res) => {
	const classId = req.params.id;
	// const userId = req.session.userId;
	// res.status(400).send("Class id is not an ObjectId hex string")
	// res.status(401).send("Log in as a teacher to proceed")
	// res.status(403).send("Teacher must run a class to delete it")
	// res.status(404).send("Class not found")
	res.json("Ok");
});

// register
router.post("/register", async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const role = req.body.role; // "teacher" | "pupil"
	// res.status(400).send(`${something} is not ${some_type}`)
	// res.status(409).send(`User with email '${email}' already exists`)
	res.status(201).send("created");
});

// log in
router.post("/login", async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	console.log(`Got POST to /login with email="${email}", password="${password}"`);
	if(!email || !password) {
		res.status(403).send("Wrong credentials");
		return;
	}
	const user = await schema.users.findOne({'email': email});
	console.log(`Found user: ${user}`);
	if(!user) {
		res.status(403).send("Wrong credentials");
		return;
	}
	if(user.password !== password) {
		res.status(403).send("Wrong credentials");
		return;
	}
	res.cookie("userId", user._id.toString(), {
		signed: false,
		secure: false,
		maxAge: 1000 * 600,
		domain: "localhost:8000"
	});
	res.send("Ok");
});

router.get("/test/users", async (req, res) => {
	const result = await schema.users.find();
	res.send(result);
});

router.get("/init", async (req, res) => {
	const john = new schema.users({
		email: "john.doe@example.com",
		password: "password"
	});
	try {
		await john.save();
	}
	catch (e) {
		console.error("OMG!");
		console.error(e);
	}
	console.log(await schema.users.find({}));
});

// get history by...
router.get("/history", async (req, res) => {
	const emailText = req.query.email;
	const userId = req.query.userId;
	const sortByDateTime = req.query.sortByDateTime; // null | "asc" | "desc"
	const role = req.query.role; // null | "pupil" | "teacher"
	const actionText = req.query.action;
	const messageText = req.query.message;
	// const adminId = req.session.userId;
	// res.status(400).send(`${something} is not ${some_type}`)
	// res.status(401).send("Log in to proceed")
	// res.status(403).send("User must be an administrator")
	res.json({history: "comes here"});
	/*
	[
		{
			datetime: "2022-11-15T06:31:15.000Z",
			email: "fedorov.f@example.com",
			role: "pupil",
			action: "Вход",
			message: "..."
		},
		...
	]
	 */
});

// get logs by...
router.get("/logs", async (req, res) => {
	// const adminId = req.session.userId;
	const sortByDateTime = req.query.sortByDateTime; // null | "asc" | "desc"
	const logLevels = req.query.logLevels;
	const messageText = req.query.message;
	// res.status(400).send(`${something} is not ${some_type}`)
	// res.status(401).send("Log in to proceed")
	// res.status(403).send("User must be an administrator")
	res.json({log: "comes here"});
	/*
	[
		{
			datetime: "2022-11-15T06:31:15.000Z",
			level: "DEBUG",
			message: "..."
		},
		...
	]
	 */
});

// fallback
router.get("(.*)", (req, res) => {
	res.status(404).send("No valid endpoint for that")
});

router.post("(.*)", (req, res) => {
	res.status(404).send("No valid endpoint for that")
});

router.put("(.*)", (req, res) => {
	res.status(404).send("No valid endpoint for that")
});

router.delete("(.*)", (req, res) => {
	res.status(404).send("No valid endpoint for that")
});

module.exports = router;


/* 1. Восстановление задачи при авторизации
const user_id = ObjectId('637cef8a42b25ba8ee08ece8')
const categories = ['addition', 'division']
const task_ids = (await schema.users.findOne({'_id': user_id}, {'tasks': 1})).tasks
const result = await schema.tasks.findOne({'_id': {$in: task_ids}, 'categories': categories, 'attempts.status': 'in progress'})

*/

/* 2. Вставка попытки решения
const task_id = ObjectId('637de40e230fffbc9b34414e')
const user_answer = 10
const correct_answer = (await schema.tasks.findOne({'_id': task_id},
											{'_id': 0, 'correct_answer': 1})).correct_answer
const status = user_answer == correct_answer ? 'correct' : 'not correct'
await schema.tasks.updateOne({'_id': task_id},
								{$set: {"attempts.$[attempt].end_timestamp": Date.now(), "attempts.$[attempt].status": status, "attempts.$[attempt].user_answer": user_answer}},
								{"arrayFilters": [{"attempt.status": 'in progress'}]})
if (status == 'not correct')
	await schema.tasks.updateOne({'_id': task_id}, {$push: {"attempts": {'start_timestamp': Date.now(), 'status': 'in progress'}}})
*/

/* 3. Создание нового задания
const class_ids = [ObjectId('637cf20192bec933530fc362'), ObjectId('637cf4044d77a3dc40b1e37b'), ObjectId('637cfef64d77a3dc40b1e3a5')]
const homework = new schema.homeworks({
	created_timestamp : Date.now(),
	deadline_timestamp: Date.parse('2025-11-22T16:30:29.791+00:00'),
	tasks             : [
		{
			categories: ['addittion', 'subtraction'],
			count     : 5
		},
		{
			categories: ['multiplication'],
			count     : 3
		},
		{
			categories: ['addittion', 'division'],
			count     : 8
		}
	]
})
await homework.save()
await schema.classes.updateMany({'_id': {$in: class_ids}}, {$push: {'homeworks': homework._id}})
*/

/* 4. Получение всех учеников класса
const class_id = ObjectId('637cf20192bec933530fc362')
const members = (await schema.classes.findOne({'_id': class_id}, {'_id': 0, 'members': 1})).members
const result = await schema.users.find({'_id': {$in: members}, 'role': 'pupil'})
*/

/* 5. Удаление класса
const class_id = ObjectId('637d31e9eb3701aff0787c0c')
const homework_ids = (await schema.classes.findOne({'_id': class_id}, {'_id': 0, 'homeworks': 1})).homeworks
if (homework_ids.length > 0){
	const response = (await schema.classes.aggregate([
		{$unwind: '$homeworks'},
		{$group: {'_id': '$homeworks', 'count': {$sum: 1}}},
		{$match: {"$expr": {"$in": ["$_id", homework_ids]}, "count": 1}},
		{$project: {'_id': 1}}
	])).map(obj => obj._id)
	await schema.homeworks.deleteMany({'_id': {$in: response}})
}
await schema.classes.deleteOne({'_id': class_id})
*/

/* 6. Получение домашнего задания и его прогресса
const user_id = ObjectId('637cef8a42b25ba8ee08ece8')
const homework_ids = (await schema.classes.findOne({'members': user_id}, {'_id': 0, 'homeworks': 1})).homeworks
const homework = await schema.homeworks.findOne({'_id': {$in: homework_ids}, 'deadline_timestamp': {$gte: (new Date).toISOString()}}, {'_id': 0})
if (homework != null){
	const task_ids = (await schema.users.findOne({'_id': user_id}, {'_id': 0, 'tasks': 1})).tasks
	const result = await schema.tasks.aggregate([{$match: {'_id': {$in: task_ids}}},
		{$unwind: {'path': '$attempts'}},
		{$match: {'attempts.status': 'correct', 'attempts.end_timestamp': {$gte: homework.created_timestamp, $lte: homework.deadline_timestamp}}},
		{$project: {'_id': '$_id', 'categories': '$categories'}}
	])
}
*/

/* 7. Создание нового пользователя (ученик)
const user = new schema.users({
	email: 'mahalichev.n@gmail.com',
	password: 'mahalichev321',
	first_name: 'Никита',
	last_name: 'Махаличев',
	role: 'pupil'
})
await user.save()
*/

/* 8. Создание нового пользователя (учитель)
const user = new schema.users({
	email: 'mahalichev.n@gmail.com',
	password: 'mahalichev321',
	first_name: 'Никита',
	last_name: 'Махаличев',
	role: 'pupil'
})
await user.save()
*/

/* 9. Получение пользователя по адресу почты
const email = 'mahalichev.n@gmail.com'
const result = await schema.users.findOne({'email': email})
console.log(JSON.stringify(result))
*/

/* 10. Добавление ученика в класс
const user_id = ObjectId('637ceff0484241578e5eb04e')
const class_id = ObjectId('637cf20192bec933530fc362')
await schema.classes.updateOne({'members': user_id}, {$pull: {'members': user_id}})
await schema.classes.updateOne({'_id': class_id}, {$push: {'members': user_id}})
*/

/* 11. Получение истории действий пользователя
const user_id = ObjectId('637cef8a42b25ba8ee08ece8')
const result = (await schema.users.findOne({'_id': user_id}, {'_id': 0, 'history': 1})).history
*/

/* 12. Получение истории действий всех пользователей
const result = await schema.users.find({'history': {$type: 'array', $ne: []}}, {'history': 1})
*/

/* 13. Фильтрация системных логов по уровням DEBUG и INFO
const filter = ["DEBUG", "INFO"]
const result = await schema.logs.find({'level': {$in: filter}})
*/