categories = ['addition', 'subtraction', 'multiplication', 'division']
order = categories.map(value => ({ value, sort: Math.random() }))
                  .sort((a, b) => a.sort - b.sort)
                  .map(({ value }) => value)
values = []
categories_dict = {
    'addition': '+',
    'subtraction': '-',
    'multiplication': 'x',
    'division': '/'
}
content = ""
next = 0
switch (true){
    case (order[0] === 'multiplication'):
        number = Math.floor(Math.random()*8+2)
        values.push(number);
        break;
    case (order[0] === 'division'):
        next = Math.floor(Math.random()*8+2);
        values.push(Math.floor(Math.random()*8+2)*next)
        break;
    case (order[0] === 'addition' || order[0] === 'subtraction'):
        values.push(Math.floor(Math.random()*99+1));
        break;
}

content += values[0]

for (let index = 0; index < order.length; index++){
    let operation = order[index]
    switch (operation){
        case 'multiplication':
            number = Math.floor(Math.random()*8+2)
            values.push(number)
            break;
        case 'division':
            if (next)
                values.push(next)
            else {
                next = Math.floor(Math.random()*8+2);
                values[index]=Math.floor(Math.random()*8+2)*next
                values.push(next)
            }
            break;
        default:
            values.push(Math.floor(Math.random()*99+1));
            break;
    }
}

for (let index = 0; index < order.length; index++)
    content += (categories_dict[order[index]] + values[index+1])

division_index = order.indexOf('division')
if (division_index != -1){
    values[division_index] /= values[division_index + 1]
    values.splice(division_index + 1, 1)
    order.splice(division_index, 1)
}

multiplication_index = order.indexOf('multiplication')
if (multiplication_index != -1){
    values[multiplication_index] *= values[multiplication_index + 1]
    values.splice(multiplication_index + 1, 1)
    order.splice(multiplication_index, 1)
}


while (order.length){
    values[0] = (order.shift() === 'addition') ? (values[0] + values[1]) : (values[0] - values[1])
    values.splice(1, 1)
}

task = {
    content: content,
    categories: categories,
    correct_answer: values[0]
}
