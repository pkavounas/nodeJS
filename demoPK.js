const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;
var fs = require("fs");

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.write('The date today is: '+ date() +'\n')

  fs.readFile("temp.txt", function(err, data) {
    res.write(data);
  });
  
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


 function date(){
    return Date();
  }