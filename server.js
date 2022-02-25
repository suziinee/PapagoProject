const express = require('express'); //express 패키지 import

const app = express();

/* API key를 별도 관리 : dot(.)env 활용, .env 파일에 key를 보관하고 dotenv가 .env 파일을 이용해서 
  process.env 객체에 포함시킴 */
const dotenv = require('dotenv');
dotenv.config();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET; 

//node.js 서버가 또 다른 client가 되어 Naver 서버에 요청을 보내기 위해 사용
const request = require('request');
const req = require('express/lib/request');

//express에 static 미들웨어 활용
app.use(express.static('public'));

//express의 json 미들웨어 활용
app.use(express.json());

//root url (기본 url) : localhost:3000/ == localhost:3000
//해당 경로로 요청이 들어왔을 때 호출할 함수
//두 인자값(argument)을 받음
app.get("/", (req, res) => {

  //root url, 즉 메인 페이지로 접속했을 때 papago의 메인 페이지가 나와야함
  res.sendFile(__dirname, 'index.html');
});


/* 언어를 네이버 서버에 보내서 번역된 걸 가져오기 */
/* 언어 감지 서버에 요청 먼저 -> 파파고 번역 서버에 요청 나중 */

//detectLangs 경로로 요청했을 때 (언어 감지 서버)
app.post("/detectLangs", (req, res) => {
  //script.js에서 보낸 requestData 변수, 즉 XMLHttpRequest 객체를 받아야함
  console.log(req.body);
  // console.log(typeof req.body);

  //destructuring
  const {text : query, targetLanguage} = req.body;

  //url 가져오기
  const url = 'https://openapi.naver.com/v1/papago/detectLangs';
  const options = {
    url, 
    form: { query},
    headers: {
      "X-Naver-Client-Id" : clientId,
      "X-Naver-Client-Secret" : clientSecret
    },
  };

  //options에 요청에 필요한 데이터 동봉
  //() => {}  : 요청에 따른 응답 정보 확인
  request.post(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const parseBody = JSON.parse(body); //parse() : string -> object 변환
      console.log(typeof parseBody, parseBody);

      /* papago 번역 url로 redirect(재요청)
      "ko", targetLanguage, query(text) 넘기기
      "ko"는 parseBody의 langCode value에 들어있음
      localhost:3000/translate?lang=ko&targetLanguage=en&query=안녕
      query string으로 데이터 전송할때는 get 요청 */

      res.redirect(`translate?lang=${parseBody['langCode']}&targetLanguage=${targetLanguage}&query=${query}`);
      

    } else {
      console.log(`error : ${response.statusCode}`);
    }
  })
})


app.get("/translate", (req, res) => {
  const url = 'https://openapi.naver.com/v1/papago/n2mt';
  console.log(req.query);
  const options = {
    url,
    form: {
      source: req.query['lang'], //query string으로 받은 것들을 mapping
      target: req.query['targetLanguage'],
      text: req.query['query'],
    },
    headers: {
      "X-Naver-Client-Id" : clientId,
      "X-Naver-Client-Secret" : clientSecret
    },
  }

  request.post(options, (error, response, body) => {
     if (!error && response.statusCode == 200) {
       res.json(body);
     } else {
       console.log(`error = ${response.statusCode}`);
     }
  })
});

//port 지정
app.listen(3000, () => {
  console.log('http://127.0.0.1:3000/ app listening on port 3000!');
});
