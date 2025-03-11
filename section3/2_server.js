const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>');
});
// app.post();
// app.delete();
// app.put();

app.get('/post', (req, res) => {
    res.send('<h1>POST PAGE!</h1>');
});

app.get('/user', (req, res) => {
    res.send('<h1>USER PAGE!</h1>');
});

app.use((req, res) => {
    res.status(404).send('<h1>Page Not Found<h1>');
});

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
})
