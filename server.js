const mongoclient = require('mongodb').MongoClient; //몽고DB 라이브러리를 이용하여 mongoclient라는 객체 색성/ 이걸로 db에 접속하고 제어 가능
//몽고db에서 복사하여 임시 보관한 접속 코드 넣음
const url = "mongodb+srv://webProject:0204@cluster0.rvzni17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let mydb; //나중에 확장성 고려해서 외부에 선언

mongoclient.connect(url)  //conect() 함수는 몽고db에 접속하는 기능
    .then(client => {  // .then은 프로미스에서 가장 중요하고 기본이 되는 메소드/ 접속이 성곻아면 .then 메소드를 실행하며 매개변수 client로 정보 넘겨줌
    mydb = client.db('myboard');  //어떤 데이터베이스에 접속할 것인지..
    //mydb.collection('post').find().toArray().then(result =>{  //collection() 함수로 컬렉션 접근/ toArray() 함수는 데이터를 배열의 형태로 가져오는 거임
    //   console.log(result);  
    //})

    app.listen(8080, function(){  //몽고db에 먼저 접속 시도하고 성공하면  listen() 함수에 의햐 8080 포트를 열고 대기...
        console.log("포트 8080으로 서버 대기중 ... ")  //이게 출력되면 서버가 정상 동작되는거임!
    });
  })
  .catch(err => {
    console.log(err);
});


// post 방식의 경우 데이터를 http 메시지의 body에 담아서 전송하기 때문에 데이터를 읽어올 수 있느 별도의 라이브러리가 필요하다
// = body-parser
const express = require("express");
const app = express();

//세션 미들웨어 코드 
let session = require('express-session');
app.use(session({
    secret : 'kjjd86hgfskjf',  // 세션 아이디를 암호화하기 위한 재료 값
    resave : false,  //세션을 접속할 때마다 새로운 세션 식별자의 발급 여부를 결정한다. 일반적으로 false 사용
    saveUninitialized : true //세셥을 사용하기 전까지 세션 식별자를 발급하지 않도록 함. 일반적으로 true로 설정
}))

//body-parser 라이브러리 추가
const bodyParser = require('body-parser');
const db = require('node-mysql/lib/db');  //이게 맞나 싶지만 일단 넣어봅니다..
app.use(bodyParser.urlencoded({extended:true})); //true 옵션은 객체 형태로 전달된 데이터 내에서 또 다른 중첩된 객체를 허용하겠단 의미
app.set('view engine', 'ejs');  //두 번째 전달인자에 내가 사용할 템플릿 엔진(ejs) 입력


app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지입니다.');
})
/*요롷고롬 send 함수를 사용하면 요청한 웹 브라우저로 문자열 메시지를 보내게 되는디
내용이 길어질수록 코드의 가독성이 매우 떨어짐
그래서 효율적인 방법으로 sendFile 함수 이용!
*/

//이건 홈
app.get('/', function(req, res){
    res.render('index.ejs');
})

app.get('/list', function(req, res){  
    mydb.collection('post').find().toArray().then(result => {  //post 컬렉션의 모든 데이터를 배열 형태로 조회해서 result 변수에 조회 결과 전달
        console.log(result);
        res.render('list.ejs', {data : result}); //ejs파일이니까 render()함수를 사용해서..!
    })
    /*sendFile은 단순히 파일의 내용을 전달하는 기능이라면
    render는 파일의 내용을 만들어 내는 기능이다.
    동적인 결과를 정적인 html 파일에 표현하는 것이기 때문에 가변적인 데이터를 출력하는 렌더링의 의미로
    별로의 render()함수가 제공되는 것이다.
    */
});

app.get('/enter', function(req, res){
    res.render('enter.ejs');
});

//'/save' 요청에 대한 post 방식의 처리 루틴
app.post('/save', function(req, res){
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);
    //몽고DB 데이터 저장하기
    mydb.collection('post').insertOne(
        {title : req.body.title, content : req.body.content, date : req.body.someDate}
    ).then(result => {
        console.log(result);
        console.log('데이터 추가 성공');
    });
    res.send('데이터 추가 성공');  //데이터 저장 후 웹 브라우저에 처리 결과 전송
});

//로그인 라우터
app.get("/login", function (req, res) {
    console.log(req.session);
    if (req.session.user) {
      console.log("세션 유지");
      //res.send('로그인 되었습니다.');
      res.render("index.ejs", { user: req.session.user });  //사용자의 세션이 이미 등록되어 있다면 홈화면으로 이동 {} 데이터를 넘겨준다는 겨!
    } else {
      console.log("로그인 페이지");
      res.render("login.ejs");
    }
});

app.post("/login", function (req, res) {
    console.log("아이디 : " + req.body.userid);
    console.log("비밀번호 : " + req.body.userpw);

    mydb
      .collection("account")
      .findOne({ userid: req.body.userid })
      .then((result) => {
        if (result.userpw == req.body.userpw) {
          req.session.user = req.body;
          console.log("새로운 로그인");
          res.render("index.ejs", { user: req.session.user });  //첫 로그인 시에 로그인하면 홈으로 이동
        } else {
          res.render("login.ejs");  //로그인 실패시 다시
        }
      });
});

app.get("/logout", function (req, res) {
    console.log("로그아웃");
    req.session.destroy();  //현재 도메인의 세션 삭제
    res.render('index.ejs', {user : null});  //로그아웃 성공시 null값 넘겨주기
});


//쿠키 말고 세션으로 할거라서 주석처리..
// let cookieParser = require('cookie-parser');  //미들웨어 등록/ 일반적ㅇ로 app.use()사용함 ㄴ

// app.use(cookieParser('ndksfnklsdjf'));  //아무거나 막 입력..
// app.get('/cookie', function(req, res){
//     let milk = parseInt(req.signedCookies.milk) + 1000;
//     if(isNaN(milk))
//         {
//             milk = 0;
//         }
//     res.cookie('milk', milk, {signed : true});  //maxAge를 통해 쿠키 보관 시간 설정(밀리세컨드 단위로 설정)
//     res.send('product : ' + milk + "원");
// });

//세션
app.get("/session", function (req, res) {
  console.log(req.session.milk);
  if(isNaN(req.session.milk))
  {
    req.session.milk = 0;
  }
  req.session.milk = req.session.milk + 1000;
  res.send("session : " + req.session.milk + "원");
});