const express = require('express'); 
const redis = require('redis')
const exphbs = require('express-handlebars')
const path = require('path')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 4000; 

const app = express(); 

const client = redis.createClient()

client.on('connect', () => {
    console.log('Redis server started');
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'handlebars'); 
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))

app.get('/', (req, res) => {
    client.hgetall('call', (err, reply) => {
        client.lrange('tasks', 0, -1, (err, tasks) => {
            if(err){
                console.log('Err in retrieving data');
            }
            res.render('taskList', {
                tasks: tasks, 
                call: reply
            })
    
        })
    })
  
})

app.post('/task/add', (req, res) => {
    const tasks = req.body.task; 
    client.rpush('tasks', tasks, (err, reply) => {
        if(err){
            console.log('Err in adding task');
        }
        res.redirect('/')
    })
   
})


app.post('/task/delete', (req, res) => {
    console.log('here');
    const tasksToDel = req.body.tasks;

    client.lrange('tasks', 0, -1, (err, reply) => {
        if(err){
            console.log('Err', err);
        }
        for(var i=0; i<reply.length; i++){
           
            if(tasksToDel.indexOf(reply[i]) > -1){
                console.log('mawjood');
                client.lrem('tasks', 0, reply[i], (err, replySecond) => {
                    if(err){
                        console.log('Err3333', err);
                    }
                    console.log(replySecond, 'reply333');
                })
            }
        }
        res.redirect('/')
    })

    console.log(tasksToDel, 'tasksToDel');
})

app.post('/task/del', (req, res) => {
    const task = req.body.task; 
    console.log(task, 'task');
})

app.post('/call/edit', (req, res) => {
    const newCall = {}; 
    const { name, phone, email } = req.body; 
    console.log(name, phone, email);
    client.hmset('call', [
        'name', name,
        'phone', phone, 
        'email', email
    ], (err, callAdded)=> {
        if(err){
            console.log('Err', err);
        }

        res.redirect('/')
    })
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})