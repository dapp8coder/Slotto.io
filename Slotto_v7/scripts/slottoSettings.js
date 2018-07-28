//@ts-check

function getTicketPrice() {
    return "0.001 STEEM";
}

function getGenerationMin() {
    return 2;
}

// @ts-ignore slotto.Settings.js
function getDefaultRegisterAccount() {
    return "slotto.register";
}

function getMemoLimit() {
    return { memo: "40,44,46 2018-07-21T05:50:09", sender: "slotto.register" };
}

function getTestSendMilliSeconds() {
    let seconds = 10;
    return seconds * 1000;
}