//@ts-check

function getTicketPrice() {
    let price = 0.1;
    let fixed = price.toFixed(3);
    let amount = fixed + " STEEM"

    return amount;
}

function getGenerationMin() {
    return generationMins;
}

// @ts-ignore slotto.Settings.js
function getDefaultRegisterAccount() {
    return "slotto.register";
}

function getMemoLimit() {
    return { memo: "39,19,27 2018-08-02T02:49:12", sender: "slotto.register" };
}

function getTestSendMilliSeconds() {
    let seconds = 10;
    return seconds * 1000;
}

function getHistoryInterval() {
    return 5000;
}

function getReserveAmount() {
    return 100;
}

async function getSlottoInterval() {
    await downloadInterval();

    console.log("---updating slotto interval in 1 min---");
    setTimeout("getSlottoInterval();", 1 * 60 * 1000);
}

async function downloadInterval() {
    try {
        let query = {
            tag: "slotto.interval",
            limit: 1
        };

        // @ts-ignore
        let result = await steem.api.getDiscussionsByBlogAsync(query);

        console.log("---fetching slotto interval---");
        let body = result[0].body
        body = body.replace("Slotto Interval - ", "");
        body = body.replace(" mins", "");
        generationMins = Number(body);
        console.log("---generation min: " + generationMins + "---");
        generationMinFound = true;
    } catch (err) {
        console.log(err);
        console.log("trying again..");
        await downloadInterval();
    }
}

function generationMinsIsFound() {
    return generationMinFound;
}

getSlottoInterval();
let generationMins = 60;
let generationMinFound = false;