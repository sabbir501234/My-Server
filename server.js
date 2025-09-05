const express = require('express');
const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.static('frontend'));

const SESSION_FILE = './sessions/session.json';
let sessionData = fs.existsSync(SESSION_FILE) ? require(SESSION_FILE) : null;

const client = new Client({ session: sessionData });

client.on('qr', (qr) => {
    console.log('Please scan QR in website, not terminal.');
});

client.on('ready', () => console.log('WhatsApp client ready!'));

client.on('authenticated', (session) => {
    sessionData = session;
    if(!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');
    fs.writeFileSync(SESSION_FILE, JSON.stringify(session));
});

client.initialize();

// API for number check
app.post('/api/check-number', async (req, res) => {
    const numbers = req.body.numbers;
    let results = [];
    for(let num of numbers){
        try {
            const exists = await client.isRegisteredUser(num);
            results.push({ number: num, exists });
        } catch {
            results.push({ number: num, exists: false });
        }
    }
    res.json(results);
});

app.listen(3000, () => console.log('Server running at http://127.0.0.1:3000'));
