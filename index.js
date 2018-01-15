"use strict";

process.env.DEBUG = "actions-on-google:*";

const App = require("actions-on-google").DialogflowApp;
const request = require("request");

const ACTION_PRICE = "price";
const ACTION_TOTAL = "total";
const EXT_BITCOIN_API_URL = "https://blockchain.info";
const EXT_PRICE = "/q/24hrprice";
const EXT_TOTAL = "/q/totalbc";

// [START bitcoinInfo]
exports.bitcoinInfo = (req, res) => {
    const app = new App({request: req, response: res});
    console.log(`bitcoinInfoAction Request headers: ${JSON.stringify(req.headers)}`);
    console.log(`bitcoinInfoAction Request body: ${JSON.stringify(req.body)}`);

    const priceHandler = (app) => {
        request(EXT_BITCOIN_API_URL + EXT_PRICE, (error, response, body) => {
            console.log(`priceHandler response: ${JSON.stringify(response)} Body: ${body} | Error: ${error}`);
            const msg = `現在のビットコインの価格は、${body}アメリカドルです`;
            app.tell(msg);
        });
    };

    const totalHandler = (app) => {
        request(EXT_BITCOIN_API_URL + EXT_TOTAL, (error, response, body) => {
            console.log(`totalHandler response: ${JSON.stringify(response)} Body: ${body} | Error: ${error}`);
            const total = body / 100000000;
            const msg = `現在、世界中で${total}億のビットコインがあります`;
            app.tell(msg);
        });
    };

    const actionMap = new Map();
    actionMap.set(ACTION_PRICE, priceHandler);
    actionMap.set(ACTION_TOTAL, totalHandler);

    app.handleRequest(actionMap);
};
// [END bitcoinInfo]

// [START bitcoinInfo2]
exports.bitcoinInfo2 = (req, res) => {
    const app = new App({request: req, response: res});
    console.log(`bitcoinInfoAction Request headers: ${JSON.stringify(req.headers)}`);
    console.log(`bitcoinInfoAction Request body: ${JSON.stringify(req.body)}`);

    const priceHandler = (app) => {
        request(EXT_BITCOIN_API_URL + EXT_PRICE, (error, response, body) => {
            console.log(`priceHandler response: ${JSON.stringify(response)} body: ${body} | error: ${error}`);
            let price = Number(body);
            request("https://api.fixer.io/latest?base=USD", (error, response, body) => {
                const rates = JSON.parse(body).rates;
                console.log(`Fixer API response: ${JSON.stringify(response)} body: ${body} | error: ${error}`);
                let currency = app.getArgument("currency");
                if (currency === "円") {
                    price *= rates.JPY;
                } else if (currency === "ユーロ") {
                    price *= rates.EUR;
                } else {
                    currency = "アメリカドル";
                }
                const msg = `現在のビットコインの価格は、${price}${currency}です`;
                app.tell(msg);
            });
        });
    };

    const totalHandler = (app) => {
        request(EXT_BITCOIN_API_URL + EXT_TOTAL, (error, response, body) => {
            console.log(`totalHandler response: ${JSON.stringify(response)} body: ${body} | error: ${error}`);
            const total = body / 100000000;
            const msg = `現在、世界中で${total}億のビットコインがあります`;
            app.tell(msg);
        });
    };

    const actionMap = new Map();
    actionMap.set(ACTION_PRICE, priceHandler);
    actionMap.set(ACTION_TOTAL, totalHandler);

    app.handleRequest(actionMap);
};
// [END bitcoinInfo2]
