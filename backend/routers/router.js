const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const schema = require('../database/schema');

const taskGenerator = require('../task_generator');
const pushLog = require('../push_log').pushLog;
const LOG_LEVEL = require('../push_log').LOG_LEVEL;
const lastPublishedHWData = require('../complex_queries').lastPublishedHWData;

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
router.get("/personal/attempts", async (req, res) => {
	const userId = req.query.userId;
	const page = Number(req.query.page);
	const limit = Number(req.query.limit);
	const startDatetime = req.query.start_datetime;
	const endDatetime = req.query.end_datetime;
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
	const taskIds = (await schema.users.findOne({"_id": ObjectId(userId)}, {"_id": 0, "tasks": 1})).tasks;
	var filter = {}
	if ((startDatetime != '') && (endDatetime == ''))
		filter["datetime"] = {$gte: (new Date(startDatetime))}
	if ((endDatetime != '') && (startDatetime == ''))
		filter["datetime"] = {$lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	if ((startDatetime != '') && (endDatetime != ''))
		filter["datetime"] = {$gte: (new Date(startDatetime)), $lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	const attemptsCount = (await schema.tasks.aggregate([
		{$match: {'_id': {$in: taskIds}}},
		{$unwind: {'path': '$attempts'}},
		{$match: {'attempts.status': {$in: ["correct", "not correct"]}}},
		{$project: {'_id': 0,
		            'datetime': '$attempts.end_timestamp',
				    'taskContent': '$content',
					'categories': '$categories',
				    'solvingTime': {$subtract: ['$attempts.end_timestamp', '$attempts.start_timestamp']},
					'answer': '$attempts.user_answer',
					'verdict': '$attempts.status'}},
		{$match: filter}])).length;
	const attempts = await schema.tasks.aggregate([
		{$match: {'_id': {$in: taskIds}}},
		{$unwind: {'path': '$attempts'}},
		{$match: {'attempts.status': {$in: ["correct", "not correct"]}}},
		{$project: {'_id': 0,
		            'datetime': '$attempts.end_timestamp',
				    'taskContent': '$content',
					'categories': '$categories',
				    'solvingTime': {$subtract: ['$attempts.end_timestamp', '$attempts.start_timestamp']},
					'answer': '$attempts.user_answer',
					'verdict': '$attempts.status'}},
		{$match: filter},
		{$sort: {'datetime': -1}}
	]).skip((page - 1) * limit).limit(limit);
	res.json({attempts: attempts, totalElements: attemptsCount, status: 200});
});

router.get("/personal/graph-stats", async (req, res) => {
	const userId = req.query.userId;
	const startDatetime = req.query.start_datetime;
	const endDatetime = req.query.end_datetime;
	const taskIds = (await schema.users.findOne({_id: ObjectId(userId)}, {"_id": 0, "tasks": 1})).tasks;
	if (!taskIds) {
		res.json({status: 400, message: `User with id=${requestedId} not found`});
		return;
	}
	var filter = {
		"verdict": {$in: ["correct", "not correct"]}
	}
	
	if ((startDatetime != '') && (endDatetime == ''))
		filter["end_datetime"] = {$gte: (new Date(startDatetime))}
	if ((endDatetime != '') && (startDatetime == ''))
		filter["end_datetime"] = {$lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	if ((startDatetime != '') && (endDatetime != ''))
		filter["end_datetime"] = {$gte: (new Date(startDatetime)), $lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	console.log(filter)
	const attempts = await schema.tasks.aggregate([
		{$match: {'_id': {$in: taskIds}}},
		{$unwind: {'path': '$attempts'}},
		{$project: {"_id": 0,
					"categories":"$categories",
					"start_datetime": "$attempts.start_timestamp",
					"end_datetime": "$attempts.end_timestamp",
					"verdict": "$attempts.status"}},
		{$match: filter},
		{$unwind: {'path': '$categories'}},
		{$project: {"category": "$categories", "verdict": "$verdict"}}
	]);
	var resObject = {
		addition: [0, 0],
		subtraction: [0, 0],
		multiplication: [0, 0],
		division: [0, 0]
	};
	attempts.map(res => res.verdict == "correct" ? resObject[res.category][0]++ : resObject[res.category][1]++);
	const result = {series: {correct: [resObject.addition[0], resObject.subtraction[0], resObject.multiplication[0], resObject.division[0]],
				    		 not_correct: [resObject.addition[1], resObject.subtraction[1], resObject.multiplication[1], resObject.division[1]]
					},
				    status: 200};
	res.json(result);
})

// publish new homework
router.post("/classes/homeworks", async (req, res) => {
	const classIds = req.body.classIds.map(id => ObjectId(id));
	const deadline = new Date(req.body.deadline);
	const homeworkTasks = req.body.homeworkTasks;
	const userId = ObjectId(req.cookies.userId);
	const userRole = req.cookies.userRole;
	console.debug(`classIds: ${classIds}\n`,
		`deadline: ${deadline}\n`,
		`homeworkTasks: ${homeworkTasks}\n`,
		`userRole: ${userRole}`);
	if(userRole !== "teacher") {
		res.json({status: 401, message: "Log in as a teacher to proceed"});
		return;
	}
	const homework = new schema.homeworks({
		created_timestamp: Date.now(),
		deadline_timestamp: deadline,
		tasks: homeworkTasks
	});
	await homework.save();
	await schema.classes.updateMany({'_id': {$in: classIds}}, {$push: {'homeworks': homework._id}});
	res.json({status: 201, message: "Created"});
});

// add a class
router.post("/classes", async (req, res) => {
	await pushLog(LOG_LEVEL.debug, `POST /classes with cookies: ${JSON.stringify(req.cookies)}, ` +
		`body: ${JSON.stringify(req.body)}, ` +
		`query: ${JSON.stringify(req.query)}`);
	const className = req.body.className;
	const userId = req.cookies.userId;
	const userRole = req.cookies.userRole;
	if(userRole !== "teacher") {
		res.json({status: 401, message: "Log in as a teacher to proceed"});
		return;
	}
	const existingClass = await schema.classes.findOne({title: className});
	await pushLog(LOG_LEVEL.debug, `Tried to find class with name ${className}, got ${existingClass}`);
	if(existingClass) {
		res.json({status: 409, message: `Class named "${className}" already exists`});
		return;
	}
	const newClass = new schema.classes({
		title: className,
		members: [ObjectId(userId)],
		homeworks: []
	});
	await newClass.save();
	const createdClass = await schema.classes.findOne({title: className});
	await pushLog(LOG_LEVEL.debug, `Created class: ${createdClass}`);
	res.json({status: 201, classId: createdClass._id.toString(), message: "Created"});
});

// join to class as a pupil
router.post("/classes/:id([0-9a-f]+)/join", async (req, res) => {
	await pushLog(LOG_LEVEL.debug, `POST ${req.url} with cookies: ${JSON.stringify(req.cookies)}, ` +
		`query: ${JSON.stringify(req.query)}`);
	const classId = ObjectId(req.params.id);
	const userId = ObjectId(req.cookies.userId);
	const userRole = req.cookies.userRole;
	if(userRole !== "pupil") {
		await pushLog(LOG_LEVEL.warning, `${req.url}: User role is "${userRole}" instead of "pupil"`);
		res.json({status: 401, message: "Log in as a pupil to proceed"});
		return;
	}
	const classToEnter = await schema.classes.findOne({_id: classId});
	if(!classToEnter) {
		await pushLog(LOG_LEVEL.warning, `${req.url}: No class to enter`);
		res.json({status: 404, message: "Class not found (wrong link or class was deleted)"});
		return;
	}
	if(classToEnter.members.indexOf(userId) !== -1) {
		await pushLog(LOG_LEVEL.warning, `${req.url}: Pupil already in class`);
		res.json({status: 409, message: "Pupil already present in class"});
		return;
	}
	const classWithPupil = await schema.classes.findOne({
			$expr: {
				$in: [userId, "$members"]
			}
	});
	if(classWithPupil) {
		await pushLog(LOG_LEVEL.warning, `User already is in class ${classWithPupil._id}. ` +
			`User will be silently removed from that class!`);
		classWithPupil.members.splice(classWithPupil.members.indexOf(userId), 1);
		await classWithPupil.save();
		await pushLog(LOG_LEVEL.debug, `Other class with this pupil removed: ${classWithPupil}`);
	}
	await schema.classes.updateOne({_id: classId}, {$push: {members: userId}});
	res.json({status: 200, message: "Ok"});
});

// delete pupil from class
router.post("/classes/:id([0-9a-f]+)/delete-pupil", async (req, res) => {
	await pushLog(LOG_LEVEL.debug, `POST ${req.url} with cookies: ${JSON.stringify(req.cookies)}, ` +
		`body: ${JSON.stringify(req.body)}, query: ${JSON.stringify(req.query)}`);
	const classId = ObjectId(req.params.id);
	const userId = ObjectId(req.cookies.userId);
	const userRole = req.cookies.userRole;
	const deletedUserId = ObjectId(req.body.userId);
	if(userRole !== "teacher") {
		await pushLog(LOG_LEVEL.warning, `${req.url}: User role is "${userRole}" instead of "pupil"`);
		res.json({status: 401, message: "Log in as a teacher to proceed"});
		return;
	}
	const classToEdit = await schema.classes.findOne({_id: classId});
	if(!classToEdit) {
		await pushLog(LOG_LEVEL.warning, `${req.url}: No class to edit`);
		res.json({status: 404, message: "Class not found (wrong link or class was deleted)"});
		return;
	}
	if(classToEdit.members.indexOf(deletedUserId) === -1) {
		await pushLog(LOG_LEVEL.warning, `User #${deletedUserId} is not in class`);
		res.json({status: 409, message: "User not found in class"});
		return;
	}
	const deletedUser = await schema.users.findOne({_id: deletedUserId});
	if(!deletedUser || deletedUser.role !== "pupil") {
		await pushLog(LOG_LEVEL.warning, `User #${deletedUserId} is not a valid pupil`);
		res.json({status: 409, message: "Invalid pupil to delete"});
		return;
	}
	const deletedUserIdPos = classToEdit.members.indexOf(deletedUserId);
	if(deletedUserIdPos === -1) {
		await pushLog(LOG_LEVEL.warning, `User that is requesting pupil deletion does not own the class`);
		res.json({status: 403, message: "Requesting user does not own the class"});
		return;
	}
	await pushLog(LOG_LEVEL.finest, `Before deletion: ${await schema.classes.findOne({_id: classId})}`);
	classToEdit.members.splice(deletedUserIdPos, 1);
	await classToEdit.save();
	await pushLog(LOG_LEVEL.finest, `After deletion: ${await schema.classes.findOne({_id: classId})}`);
	res.json({status: 200, message: "Deleted"});
});

// get statistics for all students in a class (Class Page)
router.get("/classes/:id([0-9a-f]+)/stats", async (req, res) => {
	const classId = ObjectId(req.params.id);
	const userId = ObjectId(req.cookies.userId);
	const userRole = req.cookies.userRole;
	if(userRole !== "teacher") {
		res.json({status: 401, message: "Log in as a teacher to proceed"});
		return;
	}
	const cls = await schema.classes.findOne({ $expr: {
		$in: [userId, "$members"]
	}, _id: classId});
	console.debug(cls);
	if(!cls) {
		res.json({status: 404, message: "Could not access the class"});
		return;
	}
	const pupils = await schema.users.find({_id: {$in: cls.members}, role: "pupil"});
	console.debug(pupils);
	const data = pupils.map( pupil => {
		return {
			fullName: pupil.last_name + " " + pupil.first_name,
			email: pupil.email,
			lastActivity: pupil.history.reduce( (a, b) => a && (a.timestamp > b.timestamp) ? a : b, null ),
			homeworkProgress: 0, // for now
			mistakes: {
				addition: 0,
				subtraction: 0,
				multiplication: 0,
				division: 0
			},
			lastDistractionTime: "2022-11-01T09:58:15.000Z",
			lastDistractionSolutionTime: "1970-01-01T00:05:40.000Z"
		};
	} );
	console.debug(data);
	res.json({status: 200, message: "Ok", data: data});
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
	const userId = ObjectId(req.cookies.userId);
	const userRole = req.cookies.userRole;
	if(userRole !== "teacher") {
		res.json({status: 401, message: "Log in as a teacher to proceed"});
		return;
	}
	const classesByTeacher = await schema.classes.find({ $expr: {
			$in: [userId, "$members"]
		}});
	console.debug(classesByTeacher);
	const result = []
	for(const cls of classesByTeacher) {
		const classInfo = {};
		classInfo.title = cls.title;
		classInfo.pupilCount = cls.members.length - 1;
		const hwInfo = await lastPublishedHWData(cls);
		console.debug("hwInfo == ", hwInfo);
		/*for(const key in hwInfo) {
			console.debug("hwInfo.key: ", hwInfo.key);
			classInfo[key] = hwInfo.key;
			console.debug("classInfo[key]: ", classInfo[key]);
		}*/
		console.debug({
			...classInfo,
			...hwInfo
		});
		result.push({
			...classInfo,
			...hwInfo
		});
	}
	console.debug(result);
	res.json({status: 200, message: "Ok", result: result});
});

router.get("/classes-ids", async (req, res) => {
	const userId = ObjectId(req.cookies.userId);
	const userRole = req.cookies.userRole;
	if(userRole !== "teacher") {
		res.json({status: 401, message: "Log in as a teacher to proceed"});
		return;
	}
	const classes = await schema.classes.find({ $expr: {
		$in: [userId, "$members"]
	}});
	res.json({status: 200, message: "Ok", data: classes.map(cls => cls._id)});
});

// delete a class
router.post("/classes/:id([0-9a-f]+)/delete", async (req, res) => {
	await pushLog(LOG_LEVEL.debug, `${req.method} ${req.url} with ` +
		`cookies: ${JSON.stringify(req.cookies)}, query: ${JSON.stringify(req.query)}`);
	const classId = ObjectId(req.params.id);
	const userId = ObjectId(req.cookies.userId);
	const userRole = req.cookies.userRole;
	if(userRole !== "teacher") {
		res.json({status: 401, message: "Log in as a teacher to proceed"});
		return;
	}
	const homework_ids = (await schema.classes.findOne({'_id': classId}, {'_id': 0, 'homeworks': 1})).homeworks
	if (homework_ids.length > 0){
		const response = (await schema.classes.aggregate([{$unwind: '$homeworks'},
			{$group: {'_id': '$homeworks', 'count': {$sum: 1}}},
			{$match: {"$expr": {"$in": ["$_id", homework_ids]}, "count": 1}},
			{$project: {'_id': 1}} ])).map(obj => obj._id)
		await schema.homeworks.deleteMany({'_id': {$in: response}})
	}
	await schema.classes.deleteOne({'_id': classId})
	res.json({message: "Deleted"});
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

router.get("/access-to-user", async (req, res) => {
	const requestedId = req.query.requested;
	const requesterRole = req.cookies.userRole;
	if (!requestedId){
		res.json({status: 401, message: "Not enough information"});
		return;
	}
	if (requestedId.length != 24){
		res.json({status: 401, message: "Non-supportable id format"});
		return;
	}
	const requestedUser = await schema.users.findOne({_id: ObjectId(requestedId)});
	if (!requestedUser){
		res.json({status: 400, message: `User with id=${requestedId} not found`});
		return;
	};
	if (requesterRole === "administrator"){
		res.json({
			status: 200,
			user: requestedUser,
			requesterRole: req.cookies.userRole
		});
		return;
	};
	const requestedUserRole = requestedUser.role;
	if ((requesterRole === "pupil") || (requestedUserRole !== "pupil")){
		res.json({status: 403, message: "Access denied"})
		return;
	};
	res.json({
		status: 200,
		user: requestedUser,
		requesterRole: req.cookies.userRole
	});
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
	res.clearCookie("userRole");
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
	const startDatetime = req.query.start_datetime;
	const endDatetime = req.query.end_datetime;
	const page = Number(req.query.page);
	const limit = Number(req.query.limit);
	var filter = {};
	if ((startDatetime != '') && (endDatetime == ''))
		filter["timestamp"] = {$gte: (new Date(startDatetime))}
	if ((endDatetime != '') && (startDatetime == ''))
		filter["timestamp"] = {$lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	if ((startDatetime != '') && (endDatetime != ''))
		filter["timestamp"] = {$gte: (new Date(startDatetime)), $lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	// const adminId = req.session.userId;
	// res.status(400).send(`${something} is not ${some_type}`)
	// res.status(401).send("Log in to proceed")
	// res.status(403).send("User must be an administrator")
	const historyCount = (await schema.users.aggregate([
		{$match: {}},
		{$unwind: {'path': '$history'}},
		{$project: {'_id': 0,
					'timestamp': '$history.timestamp',
				    'login': '$email',
					'role': '$role',
					'action': '$history.action',
					'content': '$history.content'}},
		{$match: filter}
	])).length;

	const result = await schema.users.aggregate([
		{$match: {}},
		{$unwind: {'path': '$history'}},
		{$project: {'_id': 0,
					'timestamp': '$history.timestamp',
				    'login': '$email',
					'role': '$role',
					'action': '$history.action',
					'content': '$history.content'}},
		{$match: filter},
		{$sort: {'timestamp': -1}}
	]).skip((page - 1) * limit).limit(limit);
	res.json({history: result, totalElements: historyCount, status: 200});
});

router.post("/add_action", async (req, res) => {
	const userId = req.cookies.userId;
	const action = req.body.action;
	const content = req.body.content;
	if (userId == undefined){
		return;
	}
	await schema.users.updateOne({"_id": ObjectId(userId)},
						         {$push: {"history": {'timestamp': Date.now(), 'action': action, 'content': content}
	}});
	res.json({})
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