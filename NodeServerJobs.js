const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // 引入CORS中间件

const app = express();
const PORT = 3002;

// 内存存储，用于模拟数据库
let messages = [];

app.use(bodyParser.json());

// 使用CORS中间件
app.use(cors());

// 路由处理POST请求，将数据存入内存
app.post('/submit-game-data', (req, res) => {
    const { gameName, job } = req.body;
    messages.push({ gameName, job });

    res.status(201).send('Data received');
});

// 新增：添加一个GET路由，用于返回所有存储的数据
app.get('/get-game-data', (req, res) => {
    res.status(200).json(messages);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});