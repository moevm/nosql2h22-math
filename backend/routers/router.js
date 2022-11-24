const express = require('express');
const router  = express.Router();
const ObjectId = require('mongoose').Types.ObjectId
const schema = require('../database/schema')

router.get('/', async (req,res) => {
	res.json({})
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