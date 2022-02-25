const textAreaArray = document.querySelectorAll('textarea');

//번역할 text는 source, 번역된 text는 target
const [sourceTextArea, targetTextArea] = textAreaArray;

const [sourceSelect, targetSelect] = document.querySelectorAll('select');

//번역할 언어의 타입 (ko, en, ja?)
let targetLanguage = 'en';
//select 내부의 값을 변경 -> change event
targetSelect.addEventListener('change', () => {
    //selectedIndex 이용 : select된 선택지의 index 반환
    const selectedIndex = targetSelect.selectedIndex;
    //options : option들을 배열로 반환해줌
    const options = targetSelect.options;

    targetLanguage = options[selectedIndex].value;
})

let debouncer;


sourceTextArea.addEventListener('input', (event) => {

    if (debouncer) {
        clearTimeout(debouncer);
    }

    
    debouncer = setTimeout(() => {

        //input event가 발생하고 입력되는 것이 target
        //그 target의 value를 console에 출력
        const text = event.target.value;

        if (text) {
           

        const xhr = new XMLHttpRequest();
    
        const url = '/detectLangs'; //node 서버의 특정 url 주소
    
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
    
                //서버의 응답 결과 확인 (responseText : 응답에 포함된 텍스트)
                const responseData = xhr.responseText;
                console.log(`responseData: ${responseData}, type: ${typeof responseData}`);

                const parseJsonToObject = JSON.parse(JSON.parse(responseData));
                console.log(typeof parseJsonToObject, parseJsonToObject);
    
                const result = parseJsonToObject['message']['result']; 
                const options = sourceSelect.options;

                for (let i = 0; i < options.length; i++) {
                    if (options[i].value === result['scLangType']) {
                        sourceSelect.selectedIndex = i;
                    }
                }
    
                //번역된 결과 텍스트를 결과 화면에 띄우기
                targetTextArea.value = result['translatedText'];
    
            };
        };
    
        xhr.open("POST", url); //값을 보내기 때문에 post 사용, server.js에서 post 사용
        //서버에 보내는 데이터의 header에 보내는 타입이 json임을 명시
        xhr.setRequestHeader('Content-type', 'application/json');
    
    
        //source text와 target select의 값을 보내야함 -> 객체로 만들어서 보내기
        const requestData = {
            text,
            targetLanguage
        };
    
        //JSON의 타입은 string이므로 내장모듈 JSON을 활용해서 서버에 보낼 데이터를 문자열화 시킴
        jsonToString = JSON.stringify(requestData);
        // console.log(typeof jsonToString); 
    
        xhr.send(jsonToString); //go to server.js의 app.post('/detectLangs')로 감

    } else {
        alert(`번역할 텍스트를 입력하세요`);
    }

}, 2000);

});