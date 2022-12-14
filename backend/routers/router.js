const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const schema = require('../database/schema');

const taskGenerator = require('../task_generator');
const pushLog = require('../push_log').pushLog;
const LOG_LEVEL = require('../push_log').LOG_LEVEL;

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
	res.json({message: "Ok"});
});

// submit attempt, return verdict (ok/not ok)
router.post("/submit", async (req, res) => {
	console.log("POST /submit");
	await pushLog(LOG_LEVEL.debug, `POST /submit with cookies: ${JSON.stringify(req.cookies)}, ` +
		`body: ${JSON.stringify(req.body)}, query: ${JSON.stringify(req.query)}`);
	const userId = req.cookies.userId;
	if(userId === undefined) {
		console.log(`User is not logged in. Expecting task to be in request body`);
		const answer = Number.parseInt(req.body.answer);
		const task = req.body.task;
		const correctAnswer = Number.parseInt(task.correctAnswer);
		console.log(`Answer is ${answer}; correct answer is ${correctAnswer}`);
		res.json({verdict: answer === correctAnswer ? "correct" : "not correct"});
		return;
	}
	console.log(`User is logged in`);
	const user = schema.users.find({_id: ObjectId(userId)});
	if(!user) {
		res.json({status: 400, message: `User with id=${userId} not found`});
		return;
	}
	const taskId = ObjectId(req.body.taskId);
	const answer = Number.parseInt(req.body.answer);
	// const startTime = Number.parseInt(req.body.startTime);
	// const endTime = Number.parseInt(req.body.endTime);
	const correctAnswer = (await schema.tasks.findOne({'_id': taskId},
		{'_id': 0, 'correct_answer': 1})).correct_answer;
	console.log(`Answer is ${answer}; correct answer is ${correctAnswer}`);
	const status = answer === correctAnswer ? 'correct' : 'not correct';
	console.log(`Solution status is "${status}"`);
	await schema.tasks.updateOne({'_id': taskId},
		{$set: {"attempts.$[attempt].end_timestamp": Date.now(),
				"attempts.$[attempt].status": status,
				"attempts.$[attempt].user_answer": answer}},
		{"arrayFilters": [{"attempt.status": 'in progress'}]})
	if(status === 'not correct') {
		await schema.tasks.updateOne({'_id': taskId},
			{
				$push: {
					"attempts": {
						'start_timestamp': Date.now(),
						'status': 'in progress'
					}
				}
			});
	}
	res.json({verdict: status});
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
	console.log("GET /task");
	await pushLog(LOG_LEVEL.debug,
		`'GET /task' with query: ${JSON.stringify(req.query)}, cookies: ${JSON.stringify(req.cookies)}`);
	if(!req.query.categories) {
		await pushLog(LOG_LEVEL.warning,
			`GET /task: req.query.categories evaluated to false. This should never happen in a finished app ` +
			`if request came from frontend`);
		res.json({status: 400, message: "Request must contain 'categories' as query parameter"});
		return;
	}
	const categories = req.query.categories.split(" ").sort();
	await pushLog(LOG_LEVEL.finest, `GET /task: categories=${categories}`);
	console.log(`Got cookies: ${JSON.stringify(req.cookies)}`);
	const userId = req.cookies.userId;
	const userRole = req.cookies.userRole;
	console.log("User id:", userId, typeof userId);
	await pushLog(LOG_LEVEL.finest, `GET /task for user id=${userId}`);
	if(userId === undefined) {
		console.log(`Sending a task without saving`);
		await pushLog(LOG_LEVEL.debug, `GET /task: User not authenticated. ` +
			`Sending a task without saving`);
		const task = taskGenerator(categories);
		await pushLog(LOG_LEVEL.finest, `GET /task: Generated task: ${JSON.stringify(task)}`);
		task._id = null;
		task.created_timestamp = null;
		task.attempts = [];
		res.json(task);
		return;
	}
	if(userRole !== "pupil") {
		await pushLog(LOG_LEVEL.warning, `GET /task: User is logged in, but not a pupil. Refusing.`);
		res.json({status: 403, message: "Log in as a pupil to solve tasks or log out to preview them"});
		return;
	}
	const taskIds = (await schema.users.findOne({'_id': userId}, {'tasks': 1})).tasks
	console.log(`Found tasks by user: ${JSON.stringify(taskIds)}`);
	await pushLog(LOG_LEVEL.finest, `GET /task: Found tasks by user: ${JSON.stringify(taskIds)}`);
	const result = await schema.tasks.findOne({'_id': {$in: taskIds},
		'categories': categories,
		'attempts.status': 'in progress'});
	if(!result) {
		console.log(`Creating a new task`);
		await pushLog(LOG_LEVEL.finest, `GET /task: Unfinished task for given categories not found. Generating a new one`);
		const task = taskGenerator(categories);
		console.log(`Generated task: ${JSON.stringify(task)}`);
		await pushLog(LOG_LEVEL.finest, `GET /task: Generated task: ${JSON.stringify(task)}`);
		const taskObject = new schema.tasks(task);
		console.log(`Mongo task document: ${taskObject}`);
		await taskObject.save();
		const attemptObject = new schema.attempts({});
		console.log(`Mongo attempt document: ${attemptObject}`);
		await pushLog(LOG_LEVEL.finest, `GET /task: Mongo attempt document: ${JSON.stringify(attemptObject)}`);
		await schema.tasks.updateOne({'_id': taskObject._id},
			{$set: {"attempts": [attemptObject]}});
		await schema.users.updateOne({"_id": ObjectId(userId)}, {
			$set: {"tasks": taskIds.concat([taskObject._id])}
		});
		const findUpdated = await schema.tasks.findOne({'_id': taskObject._id});
		await pushLog(LOG_LEVEL.finest, `GET /task: Updated task: ${findUpdated}`);
		res.json(findUpdated);
		return;
	}
	console.log(`Found fitting pending task: ${result}`);
	await pushLog(LOG_LEVEL.debug, `Found fitting pending task: ${result}`);
	res.json(result);
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
	res.json({status: 201, message: "Created"});
});

// add a class
router.post("/classes", async (req, res) => {
	const className = req.body.className;
	// res.status(400).send(`${something} is not ${some_type}`)
	// res.status(401).send("Log in as a teacher to proceed")
	// res.status(409).send(`Class named "${className}" already exists`)
	res.json({status: 201, classId: "goes here"});
});

// join to class as a pupil
router.post("/classes/:id([0-9a-f]+)/join", async (req, res) => {
	const classId = req.params.id;
	// const userId = req.session.userId;
	// res.status(401).send("Log in as a pupil to proceed")
	// res.status(409).send("Pupil already present in a class")
	res.json({message: "Ok"});
});

// get statistics for all students in a class (Class Page)
router.get("/classes/:id([0-9a-f]+)/stats", async (req, res) => {
	const classId = req.params.id;
	// const userId = req.session.userId;
	// res.status(401).send("Log in as a teacher to proceed")
	res.json({stats: "go here"});
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
	res.json({message: "Ok"});
});

// register
router.post("/register", async (req, res) => {
	console.log("POST /register");
	await pushLog(LOG_LEVEL.debug, `POST /register with cookies: ${JSON.stringify(req.cookies)}, ` +
		`body: ${JSON.stringify(req.body)}, query: ${JSON.stringify(req.query)}`);
	const creatableRoles = ["teacher", "pupil"];
	const email = req.body.email;
	const password = req.body.password;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const role = req.body.role; // "teacher" | "pupil"
	if(!(email && password && firstName && lastName)) {
		res.json({status: 401, message: "All fields must be filled"});
		return;
	}
	if(creatableRoles.indexOf(role) === -1) {
		res.json({status: 400, message: "Role is not in " + creatableRoles.toString()});
		return;
	}
	const userWithSameEmail = await schema.users.findOne({email: email});
	if(userWithSameEmail) {
		console.log(`Found user with the same email: ${userWithSameEmail}`);
		await pushLog(LOG_LEVEL.warning, `POST /register: `+
			`Found user with the same email: ${userWithSameEmail}. Exiting`);
		res.json({status: 409, message: `User with email '${email}' already exists`});
		return;
	}
	const newUser = new schema.users({
		email: email,
		password: password,
		first_name: firstName,
		last_name: lastName,
		role: role
	});
	await newUser.save();
	console.log(`Created user: ${newUser}`);
	await pushLog(LOG_LEVEL.debug, `Created user: ${newUser}`)
	res.json({status: 201, message: "created"});
});

// log in
router.post("/login", async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	console.log(`Got POST to /login with email="${email}", password="${password}"`);
	await pushLog(LOG_LEVEL.debug, `POST /login with cookies: ${JSON.stringify(req.cookies)}, ` +
		`body: ${JSON.stringify(req.body)}, query: ${JSON.stringify(req.query)}`);
	if(!email || !password) {
		res.json({status: 403, message: "Wrong credentials"});
		return;
	}
	const user = await schema.users.findOne({'email': email});
	console.log(`Found user: ${user}`);
	if(!user) {
		res.json({status: 403, message: "Wrong credentials"});
		return;
	}
	if(user.password !== password) {
		res.json({status: 403, message: "Wrong credentials"});
		return;
	}
	res.json({
		message: "Ok",
		userId: user._id.toString(),
		userRole: user.role
	});
});

router.get("/remember-me", async (req, res) => {
	const userId = req.query.id;
	await pushLog(LOG_LEVEL.debug, `GET /remember-me with cookies: ${JSON.stringify(req.cookies)}, ` +
		`query: ${JSON.stringify(req.query)}`);
	res.cookie("userId", userId, {
		signed: false,
		secure: true,
		sameSite: 'strict'
	});
	res.cookie("userRole", req.query.role, {
		signed: false,
		secure: true,
		sameSite: 'strict'
	});
	res.json({message: "Ok"});
});

router.get("/whoami", async (req, res) => {
	await pushLog(LOG_LEVEL.debug, `GET /whoami with cookies: ${JSON.stringify(req.cookies)}, ` +
		`query: ${JSON.stringify(req.query)}`);
	const userId = req.cookies.userId;
	if(userId === undefined) {
		res.json(null);
		return;
	}
	const user = await schema.users.findOne({_id: ObjectId(userId)});
	res.json(user);
});

router.get("/logout", async (req, res) => {
	console.log("GET /logout");
	await pushLog(LOG_LEVEL.debug, `GET /logout with cookies: ${JSON.stringify(req.cookies)}, ` +
		`query: ${JSON.stringify(req.query)}`);
	const userId = req.cookies.userId;
	console.log(`Cookie userId: ${userId}`);
	if(userId === undefined) {
		res.json({status: 401, message: "Must log in first to logout"});
		return;
	}
	res.clearCookie("userId");
	res.json({message: "Ok"});
});

router.get("/test/users", async (req, res) => {
	const result = await schema.users.find();
	res.json(result);
});

router.get("/test/init", async (req, res) => {
	const newUser = new schema.users({
		email: Math.floor(1000000*Math.random()).toString() + "@example.com",
		password: Math.floor(1000000*Math.random()).toString()
	});
	console.log("Created debug user: ", newUser);
	try {
		await newUser.save();
	}
	catch (e) {
		console.error("OMG!");
		console.error(e);
	}
	// console.log(await schema.users.find({}));
	res.json({message: "Ok"});
});

// log user action on front-end
router.post("/history", async (req, res) => {
	const userId = req.query.userId;
	if(!userId) {
		res.json({status: 401, message: "Log in to proceed"});
		return;
	}
	res.json({status: 418, message: "Not implemented"});
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
	res.json({status: 404, message: "No valid endpoint for that"});
});

router.post("(.*)", (req, res) => {
	res.json({status: 404, message: "No valid endpoint for that"});
});

router.put("(.*)", (req, res) => {
	res.json({status: 404, message: "No valid endpoint for that"});
});

router.delete("(.*)", (req, res) => {
	res.json({status: 404, message: "No valid endpoint for that"});
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