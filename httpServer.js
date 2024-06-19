const http = require('http'); //require 함수를 통해 포함하겠다는 의미, 이 모듈이 있어야 서버를 만들 수 있음

const hostname = '127.0.0.1';  //ip
const port = 3000;  //port

const server = http.createServer((req, res) =>{  //createServer함수는 http 모듈로 서버를 1대 생성하는 기능
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
});

server.listen(port, hostname, () => {  //listen함수는 대기하는 함수 서버의 등록한 아이피와 포트 번호를 기반으로 서버에 접속하기 전까지 대기 함!
    console.log(`Server running at http://${hostname}:${port}/`);
});
