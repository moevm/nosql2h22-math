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
	classes: [new ObjectId()],
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
	teacher  : ObjectId('637c0155e1c4c441e229e1e9'),
	pupils   : [ObjectId('637c00d4f60019eba4826203'), ObjectId('637c00f9f08dc7e8cbb59d83'), ObjectId('637c989b3922c3052c79a92a')]
})
await class_.save()
*/

/* 1. Восстановление задачи при авторизации
const user_id = ObjectId('637be1b2db9fc12900889c67')
const result = await schema.users.findOne({'_id': user_id, 'tasks.attempts.status': 'in progress'},
										  {'_id': 0, 'tasks': {$elemMatch: {'attempts.status': 'in progress'}}})

*/

/* 4. Получение всех учеников класса
const class_id = ObjectId('637c02395d814ec03b85cf56')
const responce = await schema.classes.findOne({'_id': class_id}, {'_id': 0, 'pupils': 1})
pupil_ids = responce.pupils
const result = await schema.users.find({'_id': {$in: pupil_ids}})

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
user_id = ObjectId('637c005c70155b1e5f0ddc25')
class_id = ObjectId('637c02395d814ec03b85cf56')
result = await schema.users.find({'_id': user_id}, {'_id': 0, 'classes': 1})
user_current_class = result.classes
await schema.users.updateOne({'_id': user_id}, {'classes': [class_id]})
if (user_current_class != undefined)
	await schema.classes.updateOne({'_id': user_current_class[0]}, {$pull: {'pupils': user_id}})
await schema.classes.updateOne({'_id': class_id}, {$push: {'pupils': user_id}})
*/