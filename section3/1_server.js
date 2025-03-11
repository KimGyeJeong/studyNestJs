const http = require('http');

const host = 'localhost';
const port = 3000;

const server = http.createServer((req, res)=> {
    // res.writeHead(statusCode, Header)
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end('<h1>Hello World!</h1>');
});

server.listen(port, host, () => {
    console.log(`Server started at http://localhost:${port}`);
});