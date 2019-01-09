const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const watson = require('watson-developer-cloud');
const PORT = process.env.PORT || 3000;

require('./secrets.js');

const LEX = 'LEX',
  WATSON = 'WATSON';
let bot = WATSON,
  service;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/initiate', (req, res, next) => {
  if (bot === WATSON) {
    service = new watson.AssistantV2({
        url: process.env.URL,
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
        version: process.env.VERSION
    });

    service.createSession({
        assistant_id: process.env.ASSISTANT_ID
    }, (err, response) => {
        if (err) next(err);
        res.json(response);
    })
  }
});

app.post('/api/sendMessage', (req, res, next) => {});

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res) => {
  console.error(err);
  console.error(err.stack);

  res.status(err.status || 500).send(err.message || 'Internal Server Error.');
});

app.listen(PORT, () => {
  console.log(`app is listening on port: ${PORT}`);
});
