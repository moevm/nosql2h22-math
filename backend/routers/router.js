const express = require('express');
const router  = express.Router();
const ObjectId = require('mongoose').Types.ObjectId
const schema = require('../database/schema')

router.get('/', async (req,res) => {
	
	res.json({ first: "Nikita" ,second :"Miha", third:"Max"})
});

module.exports = router;


/*
const user = new schema.users({
	email: 'mahalichev.n@gmail.com',
	password: 'mahalichev321',
	first_name: 'Никита',
	last_name: 'Махаличев',
	role: 'pupil',
	tasks  : [{
		content: '3*12-10',
		create_timestamp: Date.parse('2022-11-21T17:24:52.748Z'),
		categories: ['subtraction', 'multiplication'],
		correct_answer: 26,
		attempts: [{
			start_timestamp: Date.parse('2022-11-21T17:24:52.748Z'),
			end_timestamp: Date.parse('2022-11-21T17:25:00.748Z'),
			user_answer: 36,
			status: 'not correct'
		},
		{
			start_timestamp: Date.parse('2022-11-21T17:25:00.748Z'),
			end_timestamp: Date.parse('2022-11-21T17:25:51.748Z'),
			user_answer: 26,
			status: 'correct'
		}]
	},
	{
		content: '5+15/3',
		create_timestamp: Date.parse('2022-11-21T17:25:51.748Z'),
		categories: ['addition', 'division'],
		correct_answer: 10,
		attempts: [{
			start_timestamp: Date.parse('2022-11-21T17:25:51.748Z'),
			status: 'in progress'
		}]
	}],
})
await user.save()
*/

/*
const class_ = new schema.classes({
	title    : '3A',
	members  : [ObjectId('637c00d4f60019eba4826203'), ObjectId('637c00f9f08dc7e8cbb59d83'), ObjectId('637c989b3922c3052c79a92a')]
})
await class_.save()
*/

/* 1. Восстановление задачи при авторизации
const user_id = ObjectId('637be1b2db9fc12900889c67')
const result = await schema.users.findOne({'_id': user_id, 'tasks.attempts.status': 'in progress'},
										  {'_id': 0, 'tasks': {$elemMatch: {'attempts.status': 'in progress'}}})

*/

/* 4. Получение всех учеников класса
const class_id = ObjectId('637cf20192bec933530fc362')
const response = await schema.classes.findOne({'_id': class_id}, {'_id': 0, 'members': 1})
members = response.members
const result = await schema.users.find({'_id': {$in: members}, 'role': 'pupil'})
*/

/* 7. Создание нового пользователя
const user = new schema.users({
	email: 'mahalichev.n@gmail.com',
	password: 'mahalichev321',
	first_name: 'Никита',
	last_name: 'Махаличев',
	role: 'pupil'
})
await user.save()
*/

/* 8. Получение пользователя по адресу почты
const email = 'mahalichev.n@gmail.com'
const result = await schema.users.findOne({'email': email})
console.log(JSON.stringify(result))
*/

/* 9. Добавление ученика в класс
const user_id = ObjectId('637ceff0484241578e5eb04e')
const class_id = ObjectId('637cf20192bec933530fc362')
await schema.classes.updateOne({'members': user_id}, {$pull: {'members': user_id}})
await schema.classes.updateOne({'_id': class_id}, {$push: {'members': user_id}})
*/



/*const class_id = ObjectId('637cb080a062923864c960ad')
const response = await schema.classes.findOne({'_id': class_id}, {'_id': 0, 'teacher': 1, 'pupils': 1, 'homeworks': 1})
teacher_id = response.teacher
pupil_ids = response.pupils
homework_ids = response.homeworks
homework_ids = JSON.parse(JSON.stringify(response.homeworks))
await schema.users.updateOne({'_id': teacher_id}, {$pull: {'classes': class_id}})
if (pupil_ids != undefined)
	await schema.users.updateMany({'_id': {$in: pupil_ids}}, {$pull: {'classes': class_id}})
if (homework_ids != undefined){
	const homework_classes = await schema.classes.aggregate([{$match: {$expr: {$ne: [{$setIntersection: ["$homeworks", homework_ids]}, []]}}}, 
															{$unwind: '$homeworks'}, 
															{$group: {'_id': '$homeworks', 'count': {$sum: 1}}},
															{$match: {'count': {$eq: 1}}},
															{$project: {'_id': 1}}])
	console.log(homework_classes)
} */