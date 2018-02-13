"use strict";

process.env.DEBUG = "actions-on-google:*";

// Dialogflowを利用するためのモジュールを読み込みます。
const DialogflowApp = require("actions-on-google").DialogflowApp;
// 外部APIを利用するためのモジュールを読み込みます。
const request = require("request");

// DialogflowからWebhookで呼び出される際のactionの定数です。
const ACTION_PRICE = "price";
const ACTION_TOTAL = "total";
// BitcoinのAPIのURLおよびPathの定数です。
const EXT_BITCOIN_API_URL = "https://blockchain.info";
const EXT_PRICE = "/q/24hrprice";
const EXT_TOTAL = "/q/totalbc";

// [START bitcoinInfo]
// 最初の "bitcoinInfo" Cloud Function の定義です。
exports.bitcoinInfo = (req, res) => {
    // DialogflowAppのインスタンスを生成します。
    const app = new DialogflowApp({request: req, response: res});

    // DialogflowからWebhookで呼び出された際のリクエストの内容をログ出力します。
    console.log(`bitcoinInfoAction Request headers: ${JSON.stringify(req.headers)}`);
    console.log(`bitcoinInfoAction Request body: ${JSON.stringify(req.body)}`);

    // Bitcoinの価格をアメリカドルで返事する "price" アクションのハンドラ関数です。
    const priceHandler = (app) => {
        // Bitcoin APIにアクセスして、Bitcoinの価格を得ます。
        // Response Bodyには価格のみが送られてきます。
        request(EXT_BITCOIN_API_URL + EXT_PRICE, (error, response, body) => {
            // Bitcoin APIの結果をログ出力します。
            console.log(`priceHandler response: ${JSON.stringify(response)} Body: ${body} | Error: ${error}`);
            // 返事のメッセージ文字列を組み立てます。
            const msg = `現在のビットコインの価格は、${body}アメリカドルです`;
            // tell 関数を使って返事を行い、会話を終了します。
            app.tell(msg);
        });
    };

    // Bitcoinの総数を返事する "total" アクションのハンドラ関数です。
    const totalHandler = (app) => {
        // Bitcoin APIにアクセスして、Bitcoinの総数を得ます。
        // Response Bodyには総数のみが送られてきます。
        request(EXT_BITCOIN_API_URL + EXT_TOTAL, (error, response, body) => {
            // Bitcoin APIの結果をログ出力します。
            console.log(`totalHandler response: ${JSON.stringify(response)} Body: ${body} | Error: ${error}`);
            // 総数の桁が大きいので、億の単位にします。
            const total = body / 100000000;
            // 返事のメッセージ文字列を組み立てます。
            const msg = `現在、世界中で${total}億のビットコインがあります`;
            // tell 関数を使って返事を行い、会話を終了します。
            app.tell(msg);
        });
    };

    // アクションのハンドラ関数のマップを作ります。
    const actionMap = new Map();
    actionMap.set(ACTION_PRICE, priceHandler);
    actionMap.set(ACTION_TOTAL, totalHandler);

    // ハンドラ関数のマップを渡して、リクエストを処理します。
    app.handleRequest(actionMap);
};
// [END bitcoinInfo]

// [START bitcoinInfo2]
// 通貨の変換処理を追加した "bitcoinInfo2" Cloud Function の定義です。
exports.bitcoinInfo2 = (req, res) => {
    // DialogflowAppのインスタンスを生成します。
    const app = new DialogflowApp({request: req, response: res});

    // DialogflowからWebhookで呼び出された際のリクエストの内容をログ出力します。
    console.log(`bitcoinInfoAction Request headers: ${JSON.stringify(req.headers)}`);
    console.log(`bitcoinInfoAction Request body: ${JSON.stringify(req.body)}`);

    // Bitcoinの価格を指定された通貨で返事する "price" アクションのハンドラ関数です。
    const priceHandler = (app) => {
        // Bitcoin APIにアクセスして、Bitcoinの価格を得ます。
        // Response Bodyには価格のみが送られてきます。
        request(EXT_BITCOIN_API_URL + EXT_PRICE, (error, response, body) => {
            // Bitcoin APIの結果をログ出力します。
            console.log(`priceHandler response: ${JSON.stringify(response)} body: ${body} | error: ${error}`);
            // 総数を数値に変換します。
            let price = Number(body);
            // 通貨レートAPIにアクセスして、アメリカドルを基準に各種レートを得ます。
            request("https://api.fixer.io/latest?base=USD", (error, response, body) => {
                // 通貨レートAPIの結果をログ出力します。
                console.log(`Fixer API response: ${JSON.stringify(response)} body: ${body} | error: ${error}`);
                // 通貨レートAPIの結果をJSONにパースして、各種値を得ます。
                const rates = JSON.parse(body).rates;
                // DialogflowのWebhookで渡された通貨パラメータを取得します。
                let currency = app.getArgument("currency");
                // 通貨パラメータごとに処理分岐します。
                if (currency === "円") {
                    // "円" だった場合は、日本円のレートで計算します。
                    price *= rates.JPY;
                } else if (currency === "ユーロ") {
                    // "ユーロ" だった場合は、ユーロのレートで計算します。
                    price *= rates.EUR;
                } else {
                    // "円" でも "ユーロ" でもなかった場合は、アメリカドルのままとします。
                    currency = "アメリカドル";
                }
                // 返事のメッセージ文字列を組み立てます。
                const msg = `現在のビットコインの価格は、${price}${currency}です`;
                // tell 関数を使って返事を行い、会話を終了します。
                app.tell(msg);
            });
        });
    };

    // Bitcoinの総数を返事する "total" アクションのハンドラ関数です。
    const totalHandler = (app) => {
        // Bitcoin APIにアクセスして、Bitcoinの総数を得ます。
        // Response Bodyには総数のみが送られてきます。
        request(EXT_BITCOIN_API_URL + EXT_TOTAL, (error, response, body) => {
            // Bitcoin APIの結果をログ出力します。
            console.log(`totalHandler response: ${JSON.stringify(response)} Body: ${body} | Error: ${error}`);
            // 総数の桁が大きいので、億の単位にします。
            const total = body / 100000000;
            // 返事のメッセージ文字列を組み立てます。
            const msg = `現在、世界中で${total}億のビットコインがあります`;
            // tell 関数を使って返事を行い、会話を終了します。
            app.tell(msg);
        });
    };

    // アクションのハンドラ関数のマップを作ります。
    const actionMap = new Map();
    actionMap.set(ACTION_PRICE, priceHandler);
    actionMap.set(ACTION_TOTAL, totalHandler);

    // ハンドラ関数のマップを渡して、リクエストを処理します。
    app.handleRequest(actionMap);
};
// [END bitcoinInfo2]
