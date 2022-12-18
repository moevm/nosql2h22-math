const express = require('express');
const router  = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;
const schema = require('../database/schema');

const taskGenerator = require('../task_generator');
const {LOG_LEVEL, logSimple, logEnterEndpoint, logPretty} = require("../push_log");
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
	await logEnterEndpoint(req);
	const userId = req.cookies.userId;
	if(userId === undefined) {
		await logPretty(LOG_LEVEL.debug, req, `User is not logged in. Expecting task to be in request body`);
		const answer = Number.parseInt(req.body.answer);
		const task = req.body.task;
		const correctAnswer = Number.parseInt(task.correctAnswer);
		await logPretty(LOG_LEVEL.debug, req, `Answer is ${answer}; correct answer is ${correctAnswer}`);
		res.json({verdict: answer === correctAnswer ? "correct" : "not correct"});
		return;
	}
	await logPretty(LOG_LEVEL.debug, req, `User is logged in`);
	const user = schema.users.find({_id: ObjectId(userId)});
	if(!user) {
		res.json({status: 400, message: `User with id=${userId} not found`});
		return;
	}
	const taskId = ObjectId(req.body.taskId);
	const answer = Number.parseInt(req.body.answer);
	const correctAnswer = (await schema.tasks.findOne({'_id': taskId},
		{'_id': 0, 'correct_answer': 1})).correct_answer;
	await logPretty(LOG_LEVEL.debug, req, `Answer is ${answer}; correct answer is ${correctAnswer}`);
	const status = answer === correctAnswer ? 'correct' : 'not correct';
	await logPretty(LOG_LEVEL.debug, req, `Solution status is "${status}"`);
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
	await logEnterEndpoint(req);
	if(!req.query.categories) {
		await logPretty(LOG_LEVEL.warning, req,
			`req.query.categories evaluated to false. This should never happen in a finished app ` +
			`if request came from frontend`);
		res.json({status: 400, message: "Request must contain 'categories' as query parameter"});
		return;
	}
	const categories = req.query.categories.split(" ").sort();
	await logPretty(LOG_LEVEL.debug, req, `categories=${categories}`);
	console.log(`Got cookies: ${JSON.stringify(req.cookies)}`);
	const userId = req.cookies.userId;
	const userRole = req.cookies.userRole;
	console.log("User id:", userId, typeof userId);
	await logPretty(LOG_LEVEL.debug, req, `user id=${userId}`);
	if(userId === undefined) {
		console.log(`Sending a task without saving`);
		await logPretty(LOG_LEVEL.debug, req, `User not authenticated. ` +
			`Sending a task without saving`);
		const task = taskGenerator(categories);
		await logPretty(LOG_LEVEL.debug, req, `Generated task: ${JSON.stringify(task)}`);
		task._id = null;
		task.created_timestamp = null;
		task.attempts = [];
		res.json(task);
		return;
	}
	if(userRole !== "pupil") {
		await logPretty(LOG_LEVEL.warning, req, `User is logged in, but not a pupil. Refusing.`);
		res.json({status: 403, message: "Log in as a pupil to solve tasks or log out to preview them"});
		return;
	}
	const taskIds = (await schema.users.findOne({'_id': userId}, {'tasks': 1})).tasks
	await logPretty(LOG_LEVEL.debug, req, `Found tasks by user: ${JSON.stringify(taskIds)}`);
	const result = await schema.tasks.findOne({'_id': {$in: taskIds},
		'categories': categories,
		'attempts.status': 'in progress'});
	if(!result) {
		await logPretty(LOG_LEVEL.debug, req, `Unfinished task for given categories not found. Generating a new one`);
		const task = taskGenerator(categories);
		await logPretty(LOG_LEVEL.debug, req, `Generated task: ${JSON.stringify(task)}`);
		const taskObject = new schema.tasks(task);
		console.log(`Mongo task document: ${taskObject}`);
		await taskObject.save();
		const attemptObject = new schema.attempts({});
		console.log(`Mongo attempt document: ${attemptObject}`);
		await logPretty(LOG_LEVEL.debug, req, `Mongo attempt document: ${JSON.stringify(attemptObject)}`);
		await schema.tasks.updateOne({'_id': taskObject._id},
			{$set: {"attempts": [attemptObject]}});
		await schema.users.updateOne({"_id": ObjectId(userId)}, {
			$set: {"tasks": taskIds.concat([taskObject._id])}
		});
		const findUpdated = await schema.tasks.findOne({'_id': taskObject._id});
		await logPretty(LOG_LEVEL.debug, req, `Updated task: ${findUpdated}`);
		res.json(findUpdated);
		return;
	}
	console.log(`Found fitting pending task: ${result}`);
	await logPretty(LOG_LEVEL.debug, req, `Found fitting pending task: ${result}`);
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
	await logEnterEndpoint(req);
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
	const taskIds = (await schema.users.findOne({"_id": ObjectId(userId)}, {"_id": 0, "tasks": 1})).tasks;
	const filter = {}
	if ((startDatetime !== '') && (endDatetime === ''))
		filter["datetime"] = {$gte: (new Date(startDatetime))}
	if ((endDatetime !== '') && (startDatetime === ''))
		filter["datetime"] = {$lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	if ((startDatetime !== '') && (endDatetime !== ''))
		filter["datetime"] = {$gte: (new Date(startDatetime)), $lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	await logPretty(LOG_LEVEL.debug, req, `Set 'datetime' filter to ${filter["datetime"]}`);
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
	await logPretty(LOG_LEVEL.debug, req, `Page of ${limit} attempts: ${attempts}`);
	res.json({attempts: attempts, totalElements: attemptsCount, status: 200});
});

router.get("/personal/graph-stats", async (req, res) => {
	await logEnterEndpoint(req);
	const userId = req.query.userId;
	const startDatetime = req.query.start_datetime;
	const endDatetime = req.query.end_datetime;
	const taskIds = (await schema.users.findOne({_id: ObjectId(userId)}, {"_id": 0, "tasks": 1})).tasks;
	if (!taskIds) {
		res.json({status: 400, message: `User with id=${requestedId} not found`});
		return;
	}
	const filter = {
		"verdict": {$in: ["correct", "not correct"]}
	}
	
	if ((startDatetime !== '') && (endDatetime === ''))
		filter["end_datetime"] = {$gte: (new Date(startDatetime))}
	if ((endDatetime !== '') && (startDatetime === ''))
		filter["end_datetime"] = {$lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	if ((startDatetime !== '') && (endDatetime !== ''))
		filter["end_datetime"] = {$gte: (new Date(startDatetime)), $lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	await logPretty(LOG_LEVEL.debug, req, `Set filter to ${JSON.stringify(filter)}`);
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
	await logPretty(LOG_LEVEL.debug, req, `Got attempts: ${attempts}`);
	const resObject = {
		addition: [0, 0],
		subtraction: [0, 0],
		multiplication: [0, 0],
		division: [0, 0]
	};
	attempts.map(res => res.verdict === "correct" ? resObject[res.category][0]++ : resObject[res.category][1]++);
	const result = {series: {correct: [resObject.addition[0], resObject.subtraction[0], resObject.multiplication[0], resObject.division[0]],
				    		 not_correct: [resObject.addition[1], resObject.subtraction[1], resObject.multiplication[1], resObject.division[1]]
					},
				    status: 200};
	await logPretty(LOG_LEVEL.debug, req, `Mapped result data: ${result}`);
	res.json(result);
})

// publish new homework
router.post("/classes/homeworks", async (req, res) => {
	await logEnterEndpoint(req);
	const classIds = req.body.classIds.map(id => ObjectId(id));
	const deadline = new Date(req.body.deadline);
	const homeworkTasks = req.body.homeworkTasks;
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

router.get("/homeworks", async (req, res) => {
	await logEnterEndpoint(req);
	const requestedId = req.query.userId;
	const requestedClass = req.query.classId;
	const type = req.query.type;
	let response;
	if (requestedId !== undefined){
		response = await schema.classes.findOne({"members": ObjectId(requestedId)}, {"_id": 0, "homeworks": 1});
	} else if (requestedClass !== undefined){
		response = await schema.classes.findOne({"_id": ObjectId(requestedClass)}, {"_id": 0, "homeworks": 1});
	} else {
		res.json({status: 403, message: "Wrong arguments"});
		return;
	}
	if (response == null){
		res.json({status: 200, homeworks: []});
		return;
	}
	let homeworkIds = response.homeworks;
	const homeworks = await schema.homeworks.aggregate([
		{$match: {"_id": {$in: homeworkIds}}},
		{$match: type === "in-progress" ? {"deadline_timestamp": {$gte: (new Date())}} : {}},
		{$project: {'created_timestamp': '$created_timestamp',
					'deadline_timestamp': '$deadline_timestamp',
					'tasks': '$tasks'}},
		{$addFields: {status: {"$cond": {
			if: {$gte: ["$deadline_timestamp", (new Date())]},
			then: "in-progress",
			else: "completed"
		}}}},
		{$sort: {'deadline_timestamp': type === "in-progress" ? 1 : -1}}
	]);

	if (requestedId !== undefined){
		const taskIds = (await schema.users.findOne({"_id": ObjectId(requestedId)}, {"_id": 0, "tasks": 1})).tasks;
		for (let i = 0; i < homeworks.length; i++){
			const attempts = (await schema.tasks.aggregate([
				{$match: {'_id': {$in: taskIds}}},
				{$unwind: {'path': '$attempts'}},
				{$match: {'attempts.status': "correct"}},
				{$project: {'_id': 0,
							'datetime': '$attempts.end_timestamp',
							'categories': '$categories'}},
				{$match: {'datetime': {$gte: (new Date(homeworks[i].created_timestamp)), $lte: (new Date(homeworks[i].deadline_timestamp))}}},
				{$project: {'categories': '$categories'}}
			])).map(obj => obj.categories);
			console.log(attempts);
			for (let j = 0; j < homeworks[i].tasks.length; j++){
				homeworks[i].tasks[j].progress = 0;
				for (let k = 0; k < attempts.length; k++){
					homeworks[i].tasks[j].categories.every(category => {return attempts[k].includes(category)}) ? homeworks[i].tasks[j].progress++ : null;
				}
				(homeworks[i].tasks[j].progress < homeworks[i].tasks[j].count) && (homeworks[i].status === "completed") ? homeworks[i].status = "failed" : null;
			}
		}
	}
	res.json({status: 200, homeworks: homeworks});
});

// add a class
router.post("/classes", async (req, res) => {
	await logEnterEndpoint(req);
	const className = req.body.className;
	const userId = req.cookies.userId;
	const userRole = req.cookies.userRole;
	if(userRole !== "teacher") {
		res.json({status: 401, message: "Log in as a teacher to proceed"});
		return;
	}
	const existingClass = await schema.classes.findOne({title: className});
	await logPretty(LOG_LEVEL.debug, req, `Tried to find class with name ${className}, got ${existingClass}`);
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
	await logPretty(LOG_LEVEL.debug, req, `Created class: ${createdClass}`);
	res.json({status: 201, classId: createdClass._id.toString(), message: "Created"});
});

// join to class as a pupil
router.post("/classes/:id([0-9a-f]+)/join", async (req, res) => {
	await logEnterEndpoint(req);
	const classId = ObjectId(req.params.id);
	const userId = ObjectId(req.cookies.userId);
	const userRole = req.cookies.userRole;
	if(userRole !== "pupil") {
		await logPretty(LOG_LEVEL.warning, req, `${req.url}: User role is "${userRole}" instead of "pupil"`);
		res.json({status: 401, message: "Log in as a pupil to proceed"});
		return;
	}
	const classToEnter = await schema.classes.findOne({_id: classId});
	if(!classToEnter) {
		await logPretty(LOG_LEVEL.warning, req, `${req.url}: No class to enter`);
		res.json({status: 404, message: "Class not found (wrong link or class was deleted)"});
		return;
	}
	if(classToEnter.members.indexOf(userId) !== -1) {
		await logPretty(LOG_LEVEL.warning, req, `${req.url}: Pupil already in class`);
		res.json({status: 409, message: "Pupil already present in class"});
		return;
	}
	const classWithPupil = await schema.classes.findOne({
			$expr: {
				$in: [userId, "$members"]
			}
	});
	if(classWithPupil) {
		await logPretty(LOG_LEVEL.warning, req, `User already is in class ${classWithPupil._id}. ` +
			`User will be silently removed from that class!`);
		classWithPupil.members.splice(classWithPupil.members.indexOf(userId), 1);
		await classWithPupil.save();
		await logPretty(LOG_LEVEL.debug, req, `Other class with this pupil removed: ${classWithPupil}`);
	}
	await schema.classes.updateOne({_id: classId}, {$push: {members: userId}});
	res.json({status: 200, message: "Joined"});
});

// delete pupil from class
router.post("/classes/:id([0-9a-f]+)/delete-pupil", async (req, res) => {
	await logPretty(LOG_LEVEL.debug, req, `POST ${req.url} with cookies: ${JSON.stringify(req.cookies)}, ` +
		`body: ${JSON.stringify(req.body)}, query: ${JSON.stringify(req.query)}`);
	const classId = ObjectId(req.params.id);
	const userId = ObjectId(req.cookies.userId);
	const userRole = req.cookies.userRole;
	const deletedUserId = ObjectId(req.body.userId);
	if(userRole !== "teacher") {
		await logPretty(LOG_LEVEL.warning, req, `${req.url}: User role is "${userRole}" instead of "pupil"`);
		res.json({status: 401, message: "Log in as a teacher to proceed"});
		return;
	}
	const classToEdit = await schema.classes.findOne({_id: classId});
	if(!classToEdit) {
		await logPretty(LOG_LEVEL.warning, req, `${req.url}: No class to edit`);
		res.json({status: 404, message: "Class not found (wrong link or class was deleted)"});
		return;
	}
	if(classToEdit.members.indexOf(deletedUserId) === -1) {
		await logPretty(LOG_LEVEL.warning, req, `User #${deletedUserId} is not in class`);
		res.json({status: 409, message: "User not found in class"});
		return;
	}
	const deletedUser = await schema.users.findOne({_id: deletedUserId});
	if(!deletedUser || deletedUser.role !== "pupil") {
		await logPretty(LOG_LEVEL.warning, req, `User #${deletedUserId} is not a valid pupil`);
		res.json({status: 409, message: "Invalid pupil to delete"});
		return;
	}
	const deletedUserIdPos = classToEdit.members.indexOf(deletedUserId);
	if(deletedUserIdPos === -1) {
		await logPretty(LOG_LEVEL.warning, req, `User that is requesting pupil deletion does not own the class`);
		res.json({status: 403, message: "Requesting user does not own the class"});
		return;
	}
	await logPretty(LOG_LEVEL.finest, req, `Before deletion: ${await schema.classes.findOne({_id: classId})}`);
	classToEdit.members.splice(deletedUserIdPos, 1);
	await classToEdit.save();
	await logPretty(LOG_LEVEL.finest, req, `After deletion: ${await schema.classes.findOne({_id: classId})}`);
	res.json({status: 200, message: "Deleted"});
});

// get statistics for all students in a class (Class Page)
router.get("/classes/:id([0-9a-f]+)/stats", async (req, res) => {
	await logEnterEndpoint(req);
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
			_id: pupil._id,
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
});

// get aggregated statistics for all classes by teacher (Add Class Process Page)
router.get("/classes", async (req, res) => {
	await logEnterEndpoint(req);
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
		classInfo._id = cls._id;
		classInfo.title = cls.title;
		classInfo.pupilCount = cls.members.length - 1;
		const hwInfo = await lastPublishedHWData(cls);
		console.debug("hwInfo == ", hwInfo);
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
	res.json({status: 200, message: "Ok", result: result, totalElements: classesByTeacher.length});
});

router.get("/class/:id([0-9a-f]+)", async (req, res) => {
	await logEnterEndpoint(req)
	const classId = req.params.id;
	const class_ = await schema.classes.findOne({_id: ObjectId(classId)});
	res.json(class_);
})

router.get("/classes-ids", async (req, res) => {
	await logEnterEndpoint(req);
	const userId = ObjectId(req.cookies.userId);
	const userRole = req.cookies.userRole;
	if(userRole !== "teacher") {
		res.json({status: 401, message: "Log in as a teacher to proceed"});
		return;
	}
	const classes = await schema.classes.find({ $expr: {
		$in: [userId, "$members"]
	}});
	res.json({status: 200, message: "Ok", data: classes.map(cls => {return {_id: cls._id, title: cls.title}})});
});

// delete a class
router.post("/classes/:id([0-9a-f]+)/delete", async (req, res) => {
	await logEnterEndpoint(req);
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
	await logEnterEndpoint(req);
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
		await logPretty(LOG_LEVEL.warning, req, `POST /register: `+
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
	await logPretty(LOG_LEVEL.debug, req, `Created user: ${newUser}`);
	res.json({status: 201, message: "created"});
});

// log in
router.post("/login", async (req, res) => {
	await logEnterEndpoint(req);
	const email = req.body.email;
	const password = req.body.password;
	console.log(`Got POST to /login with email="${email}", password="${password}"`);
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
	await logEnterEndpoint(req);
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
	await logEnterEndpoint(req);
	const requestedId = req.query.requested;
	const requesterRole = req.cookies.userRole;
	if (!requestedId){
		res.json({status: 401, message: "Not enough information"});
		return;
	}
	if (requestedId.length !== 24){
		res.json({status: 401, message: "Non-supportable id format"});
		return;
	}
	const requestedUser = await schema.users.findOne({_id: ObjectId(requestedId)});
	if (!requestedUser){
		res.json({status: 400, message: `User with id=${requestedId} not found`});
		return;
	}
	if (requesterRole === "administrator"){
		res.json({
			status: 200,
			user: requestedUser,
			requesterRole: req.cookies.userRole
		});
		return;
	}
	const requestedUserRole = requestedUser.role;
	if ((requesterRole === "pupil") || (requestedUserRole !== "pupil")){
		res.json({status: 403, message: "Access denied"})
		return;
	}
	res.json({
		status: 200,
		user: requestedUser,
		requesterRole: req.cookies.userRole
	});
});

router.get("/whoami", async (req, res) => {
	await logEnterEndpoint(req);
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
	await logEnterEndpoint(req);
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
	res.json({message: "Ok"});
});

// get history by...
router.get("/history", async (req, res) => {
	await logEnterEndpoint(req);
	const startDatetime = req.query.start_datetime;
	const endDatetime = req.query.end_datetime;
	const page = Number(req.query.page);
	const limit = Number(req.query.limit);
	const filter = {};
	if ((startDatetime !== '') && (endDatetime === ''))
		filter["timestamp"] = {$gte: (new Date(startDatetime))}
	if ((endDatetime !== '') && (startDatetime === ''))
		filter["timestamp"] = {$lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	if ((startDatetime !== '') && (endDatetime !== ''))
		filter["timestamp"] = {$gte: (new Date(startDatetime)), $lte: (new Date(endDatetime + "T23:59:59.999Z"))}
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
	await logEnterEndpoint(req);
	const userId = req.cookies.userId;
	const action = req.body.action;
	const content = req.body.content;
	if (userId === undefined){
		return;
	}
	await schema.users.updateOne({"_id": ObjectId(userId)},
						         {$push: {"history": {'timestamp': Date.now(), 'action': action, 'content': content}
	}});
	res.json({})
});

// get logs by...
router.get("/logs", async (req, res) => {
	await logEnterEndpoint(req);
	const sortByDateTime = req.query.sortByDateTime; // null | "asc" | "desc"
	const logLevels = req.query.logLevels;
	const messageText = req.query.message;
	const startDatetime = req.query.start_datetime;
	const endDatetime = req.query.end_datetime;
	const page = Number(req.query.page);
	const limit = Number(req.query.limit);
	var filter = {};
	if ((startDatetime !== '') && (endDatetime === ''))
		filter["timestamp"] = {$gte: (new Date(startDatetime))}
	if ((endDatetime !== '') && (startDatetime === ''))
		filter["timestamp"] = {$lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	if ((startDatetime !== '') && (endDatetime !== ''))
		filter["timestamp"] = {$gte: (new Date(startDatetime)), $lte: (new Date(endDatetime + "T23:59:59.999Z"))}
	
	const logsCount = (await schema.logs.aggregate([
		{$match: {}},
		{$project: {'_id': 0,
					'timestamp': '$timestamp',
				    'level': '$level',
					'content': '$content',}},
		{$match: filter}
	])).length;
	if (req.cookies.userRole !== "administrator"){
		res.json({status: 403, message: "User must be an administrator"});
		return;
	}
	const result = await schema.logs.aggregate([
		{$match: {}},
		{$project: {'_id': 0,
					'timestamp': '$timestamp',
				    'level': '$level',
					'content': '$content'}},
		{$match: filter},
		{$sort: {'timestamp': -1}}
	]).skip((page - 1) * limit).limit(limit);
	res.json({status: 200, logs: result, totalElements: logsCount});
});

// for test and debug -- clears the database(!)
router.post("/clear-db", async (req,res) => {
	await Promise.all([
		schema.users.deleteMany({}),
		schema.histories.deleteMany({}),
		schema.tasks.deleteMany({}),
		schema.classes.deleteMany({}),
		schema.homeworks.deleteMany({}),
		schema.attempts.deleteMany({}),
		schema.logs.deleteMany({})
	]);
	res.end("Database cleared! This better be intentional.")
});

// fallback
router.get("(.*)", async (req, res) => {
	await logEnterEndpoint(req);
	res.json({status: 404, message: "No valid endpoint for that"});
});

router.post("(.*)", async (req, res) => {
	await logEnterEndpoint(req);
	res.json({status: 404, message: "No valid endpoint for that"});
});

router.put("(.*)", async (req, res) => {
	await logEnterEndpoint(req);
	res.json({status: 404, message: "No valid endpoint for that"});
});

router.delete("(.*)", async (req, res) => {
	await logEnterEndpoint(req);
	res.json({status: 404, message: "No valid endpoint for that"});
});

module.exports = router;
