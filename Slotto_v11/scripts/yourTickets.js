//@ts-check

async function findYourTickets() {
    document.getElementById("ticketsList").innerHTML = "";
    document.getElementById("showTickets").style.display = "block";
    document.getElementById("loadingIcon").style.display = "block";
    document.getElementById("updateStatus").style.display = "none";
    document.getElementById("rfbWrapper").style.display = "none";
    document.getElementById("notFound").style.display = "none";

    await procFind();
}

async function procFind() {
    console.clear();

    // @ts-ignore
    let account = document.getElementById("accountName").value;
    let accountInfo = null;
    try {
        // @ts-ignore
        accountInfo = await steem.api.getAccountsAsync([account]);
        console.log(accountInfo);
    } catch (err) {
        console.log(err);
        console.log("");
        console.log("trying again");
        procFind();
    } finally {
        document.getElementById("notFound").style.display = "none";
        if (accountInfo.length > 0) {
            let yours = await getYours(account);
            //console.log("");
            //console.log("---your outstanding tickets---");
            //console.log(yours);
            showOnPage(yours);
        } else {
            document.getElementById("loadingIcon").style.display = "none";
            document.getElementById("notFound").style.display = "block";
            document.getElementById("notFound").innerHTML = "Account not found: " + account + "<br>" +
                "Make sure your account name is correct (case sensitive)";
            console.log("unable to fetch info from " + account);
        }
    }
}

function showOnPage(data) {
    let str = "Current Tickets<br><br>";
    let outStanding = data.outStanding;
    let previous = data.previous;

    document.getElementById("loadingIcon").style.display = "none";
    document.getElementById("updateStatus").style.display = "block";
    document.getElementById("rfbWrapper").style.display = "block";

    if (outStanding.length == 0) {
        str = "No Current Tickets<br><br>";
    } else {
        for (let i = 0; i < outStanding.length; i++) {
            str += outStanding[i].op[1].memo + " (" + outStanding[i].timestamp + ") <br><br>";
        }
    }

    if (previous.length > 0) {
        str += "<br>Previous Tickets<br><br>";
        for (let i = 0; i < previous.length; i++) {
            str += previous[i].op[1].memo + " (" + previous[i].timestamp + ") <br><br>";
        }
    }

    document.getElementById("ticketsList").innerHTML = str;

}

async function getYours(account) {
    // @ts-ignore slotto.Settings.js
    let defaultRegister = getDefaultRegisterAccount();

    // @ts-ignore
    let receivehistory = new SteemHistory(defaultRegister);
    // @ts-ignore
    receivehistory.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
    await receivehistory.download();

    // @ts-ignore
    let receiveTransfers = new SteemTransfers();
    receiveTransfers.filterTransfers(null, defaultRegister, receivehistory.result);

    // @ts-ignore
    let watcher = new Watcher();
    watcher.getWinners(receiveTransfers.result);

    //get all tickets
    let outStanding = new Array();
    let prevTickets = new Array();
    let winnerFound = false;
    for (let i = 0; i < receiveTransfers.result.length; i++) {


        if (receiveTransfers.result[i].op[1].from == "slotto.gen") {
            for (let w = 0; w < watcher.prevWinningDraws.length; w++) {
                if (watcher.prevWinningDraws[w] == receiveTransfers.result[i].op[1].memo.substring(0, 8) + " " + receiveTransfers.result[i].timestamp) {
                    winnerFound = true;
                }
            }
        }

        if (receiveTransfers.result[i].op[1].from == account) {
            if (winnerFound == false) {
                outStanding.push(receiveTransfers.result[i]);
            } else {
                prevTickets.push(receiveTransfers.result[i])
            }
        }
    }

    console.log("");
    console.log("---your outStanding tickets---");
    console.log(outStanding);

    console.log("");
    console.log("---your previous tickets---");
    console.log(prevTickets);

    let allTickets = { outStanding: outStanding, previous: prevTickets };

    return allTickets;
}

function initTicketStatus() {
    document.getElementById("showTickets").style.display = "none";
    document.getElementById("loadingIcon").style.display = "none";
    document.getElementById("notFound").style.display = "none";

    inputEnter = document.getElementById("accountName");
    inputEnter.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            document.getElementById("findButton").click();
        }
    });
}

var inputEnter = null;