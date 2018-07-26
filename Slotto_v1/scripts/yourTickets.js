//@ts-check

async function findYourTickets() {
    document.getElementById("showTickets").style.display = "block";
    document.getElementById("ticketsList").innerHTML = "loading";
    document.getElementById("spinner").style.display = "block";
    document.getElementById("updateStatus").style.display = "none";

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
        if (accountInfo.length > 0) {
            let yours = await getYours(account);
            //console.log("");
            //console.log("---your outstanding tickets---");
            //console.log(yours);
            showOnPage(yours);
        } else {
            console.log("unable to fetch info from " + account);
        }
    }
}

function showOnPage(data) {
    let str = "Your Tickets<br><br>";

    document.getElementById("spinner").style.display = "none";
    document.getElementById("updateStatus").style.display = "block";

    if (data.length == 0) {
        str = "no tickets found";
    } else {
        for (let i = 0; i < data.length; i++) {
            str += data[i].op[1].memo + " (" + data[i].timestamp + ") <br><br>";
        }
    }
    document.getElementById("ticketsList").innerHTML = str;

    //setTimeout("procFind()", 20000);
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

    console.log("");
    console.log("---wtf---");
    console.log(watcher.result);

    //get outstanding tickets
    /*let outstanding = watcher.outstandingTickets;
    let currentYours = new Array();
    for (let i = 0; i < outstanding.length; i++) {
        if (outstanding[i].op[1].from == account) {
            currentYours.push(outstanding[i]);
        }
    }*/

    //get all tickets
    let allYours = new Array();
    for (let i = 0; i < receiveTransfers.result.length; i++) {
        if (receiveTransfers.result[i].op[1].from == account) {
            allYours.push(receiveTransfers.result[i]);
        }
    }

    //console.log("");
    //console.log("---all your tickets---");
    //console.log(allYours);

    return allYours;
}

function initTicketStatus() {
    document.getElementById("showTickets").style.display = "none";

    inputEnter = document.getElementById("accountName");
    inputEnter.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            document.getElementById("findButton").click();
        }
    });
}

var inputEnter = null;