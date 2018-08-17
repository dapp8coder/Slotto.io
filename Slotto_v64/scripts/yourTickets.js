//@ts-check

async function findYourTickets() {
    //console.clear();

    // @ts-ignore slowLoad.js
    setSlowLoad();

    // @ts-ignore
    let account = document.getElementById("accountName").value;

    if (account != "") {
        document.getElementById("buttonWrapper").style.display = "none";
        document.getElementById("ticketsData").style.display = "none";
        document.getElementById("loadingIcon").style.display = "block";
        document.getElementById("notFound").style.display = "none";
        document.getElementById("loadingText").textContent = "Searching: " + account;

        await procFind(account);
    }

    // @ts-ignore slowLoad.js
    hideSlowLoad();
}

async function procFind(account) {
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
        if (accountInfo != null) {
            document.getElementById("notFound").style.display = "none";
            if (accountInfo.length > 0) {
                let yours = await getYours(account);
                document.getElementById("ticketsData").style.display = "block";
                showOnPage(yours);
            } else {
                document.getElementById("ticketsData").style.display = "none";
                document.getElementById("loadingIcon").style.display = "none";
                document.getElementById("notFound").style.display = "block";
                document.getElementById("notFound").innerHTML = "Account not found: " + account + "<br>" +
                    "Make sure your account name is correct (case sensitive)";
                console.log("unable to fetch info from " + account);
            }
        } else {
            await procFind(account);
        }
    }

    document.getElementById("buttonWrapper").style.display = "block";
}

function showOnPage(data) {
    let currentTickets = "";
    let bonuses = "";
    let previousTickets = "";
    let winningTickets = "";
    let wins = data.wins;
    let outStanding = data.outStanding;
    let previous = data.previous;

    document.getElementById("loadingIcon").style.display = "none";
    document.getElementById("congrats").style.display = "none";

    if (wins.length == 0) {
        winningTickets += "You haven't won a prize yet<br><br>";
    } else {
        document.getElementById("congrats").style.display = "block";
        for (let i = 0; i < wins.length; i++) {
            winningTickets += wins[i].winningDraw + "<br>";
            let p = Number(wins[i].sum.STEEM);

            if (wins[i].bonusesSent != null) {
                p -= wins[i].bonusesSent.subTotal;
            }

            winningTickets += "<div style='color:rgb(255, 234, 47)'>" + p.toFixed(3) + " STEEM<br><br></div>";
        }
    }

    if (outStanding.length == 0) {
        currentTickets += "None<br><br>";
    } else {
        for (let i = 0; i < outStanding.length; i++) {
            currentTickets += outStanding[i].op[1].memo + " (" + outStanding[i].timestamp + ") <br><br>";
        }
    }

    bonuses += "None<br><br>";

    if (previous.length == 0) {
        previousTickets += "None<br><br>";
    } else {
        for (let i = 0; i < previous.length; i++) {
            previousTickets += previous[i].op[1].memo + " (" + previous[i].timestamp + ") <br><br>";
        }
    }

    document.getElementById("wins").innerHTML = winningTickets;
    document.getElementById("currentTickets").innerHTML = currentTickets;
    document.getElementById("bonuses").innerHTML = bonuses;
    document.getElementById("previousTickets").innerHTML = previousTickets;
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

    let wins = new Array();

    //get bonus data (to subtract from total prize amount)
    // @ts-ignore
    await getBonusData(defaultRegister);
    console.log("");
    console.log("---bonus data---");
    // @ts-ignore
    let bonusBlocks = getBonusBlocks();
    console.log(bonusBlocks);

    for (let i = 0; i < watcher.result.length; i++) {
        console.log("");
        console.log(watcher.result[i].winningDraw);
        for (let w = 0; w < watcher.result[i].winnerNames.length; w++) {
            // add bonus data (for prize calculation)
            for (let b = 0; b < bonusBlocks.length; b++) {
                if (bonusBlocks[b].winningDraw == watcher.result[i].winningDraw) {
                    watcher.result[i].bonusesSent = bonusBlocks[b];
                }
            }

            console.log(watcher.result[i].winnerNames[w]);
            if (watcher.result[i].winnerNames[w] == account) {
                wins.push(watcher.result[i]);
            }
        }
    }

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
    console.log("---your winning tickets---");
    console.log(wins);

    console.log("");
    console.log("---your outStanding tickets---");
    console.log(outStanding);

    console.log("");
    console.log("---your previous tickets---");
    console.log(prevTickets);

    let allTickets = { outStanding: outStanding, previous: prevTickets, wins: wins };

    return allTickets;
}

function initTicketStatus() {
    document.getElementById("ticketsData").style.display = "none";
    document.getElementById("loadingIcon").style.display = "none";
    document.getElementById("notFound").style.display = "none";

    inputEnter = document.getElementById("accountName");
    inputEnter.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            document.getElementById("findButton").click();
        }
    });

    // @ts-ignore slowLoad.js
    hideSlowLoad();
}

let inputEnter = null;