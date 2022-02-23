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

//express에 static 미들웨어 활용
app.use(express.static('public'));

