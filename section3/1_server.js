const http = require('http');
const url = require('url');

const host = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {
    const path = url.parse(req.url).pathname;

    if (path === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>HOME PAGE!</h1>');
    } else if (path === '/post') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>POST PAGE!</h1>');
    } else if (path === '/user') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>USER PAGE!</h1>');
    } else {
        // res.writeHead(statusCode, Header)
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('<h1>PAGE NOT FOUND!</h1>');
    }
});

server.listen(port, host, () => {
    console.log(`Server started at http://localhost:${port}`);
});