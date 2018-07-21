function getTicketPrice() {
    return "0.001 STEEM";
}

function getGenerationMin() {
    return 5;
}

function getDefaultRegisterAcount() {
    return "slotto.register";
}

function getMemoLimit() {
    return { memo: "40,44,46 2018-07-21T05:50:09", sender: "slotto.register" };
}

function getTestSendMilliSeconds() {
    let seconds = 45;
    return seconds * 1000;
}