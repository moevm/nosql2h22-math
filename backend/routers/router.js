const express = require('express');
const router  = express.Router();
const ObjectId = require('mongoose').Types.ObjectId
const schema = require('../database/schema')

router.get('/', async (req,res) => {
	/*const user = new schema.users({
		email: 'ilovemath@gmail.com',
		password: 'mathematic_',
		first_name: 'Владислав',
		last_name: 'Думский',
		role: 'teacher',
		class: new ObjectId()
	})
	*/
	//await user.save()
	//console.log(JSON.stringify(result))
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

/* 1. Восстановление задачи при авторизации
const userid = ObjectId('637be1b2db9fc12900889c67')
const result = await schema.users.findOne({'user_id': userid, 'tasks.attempts.status': 'in progress'},
										  {'_id': 0, 'tasks': {$elemMatch: {'attempts.status': 'in progress'}}})
console.log(JSON.stringify(result))
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