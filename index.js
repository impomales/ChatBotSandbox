const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`app is listening on port: ${PORT}`);
});