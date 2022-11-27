const express = require('express');
const router = express.Router();
const request = require('request');
const { OpenAIApi, Configuration } = require('openai');
require('dotenv').config();

let config = new Configuration({
    apiKey: process.env.OPEN_AI_KEY,
});
let openai = new OpenAIApi(config);

const client_id = process.env.NAVER_PAPAGO_KEY;
const client_secret = process.env.NAVER_PAPAGO_SECRET_KEY;

router.get('/', function (req, res) {
    let query = req.query.q;

    let options = {
        url: 'https://openapi.naver.com/v1/papago/n2mt',
        form: {'source':'ko', 'target':'en', 'text':query},
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    request.post(options, function (error, response, body) {
        let transQuery = JSON.parse(body).message?.result.translatedText;


        openai.createCompletion({
            model: "text-davinci-002",
            prompt: transQuery,
            temperature: 0.7,
            max_tokens: 128,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }).then((result) => {
            console.log('ai 응답', result.data.choices[0].text);

            const api_url = 'https://openapi.naver.com/v1/papago/n2mt';
            let query = result.data.choices[0].text;
            let options = {
                url: api_url,
                form: {'source':'en', 'target':'ko', 'text':query},
                headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
            };
            request.post(options, function (error, response, body) {
                console.log('body', typeof body);
                console.log('body', body);
                res.status(200).json(JSON.parse(body));
            });
        }).catch((error)=>{
            console.log('openai error', error)
        })

    });
});


module.exports = router;
