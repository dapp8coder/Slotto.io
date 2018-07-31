//@ts-check

async function getRecentDraws() {
    console.clear();

    console.log("");
    console.log("---prev draw---");
    console.log(prevDraw);

    if (prevDraw == null) {
        document.getElementById("verifierLoader").style.display = "none";
    }

    let history = null;

    /*try {*/
    // @ts-ignore
    history = new SteemHistory(getMemoLimit().sender);
    // @ts-ignore
    history.setSearchLimit(getMemoLimit().memo, getMemoLimit().sender, null);
    await history.download();
    /*} catch (err) {
        console.log("");
        console.log("---error downloading history---");
        console.log(err);

        console.log("");
        console.log("trying again..");

        setTimeout("getRecentDraws()", 1000);
    } finally {*/
    // @ts-ignore
    let transfers = new SteemTransfers();
    transfers.filterTransfers("slotto.gen", "slotto.register", history.result);

    let all = transfers.result;
    let gen = new Array();

    let draws = "";

    for (let i = 0; i < all.length; i++) {
        // @ts-ignore
        if (isSlottoFormat(all[i])) {
            gen.push(all[i]);
            draws += all[i].op[1].memo.substring(0, 8) + " (" + all[i].timestamp + ")" + "<br><br>";
        }
    }

    //draws += "entire history can be viewed at <a class='drawStatus' href='https://steemd.com/@slotto.gen' target='_blank'> https://steemd.com/@slotto.gen</a>";
    console.log("");
    console.log("---recent draws---");
    console.log(gen);

    document.getElementById("recentDraws").innerHTML = draws;

    let latest = draws.substring(0, 30);

    if (prevDraw != null) {
        if (latest != prevDraw) {
            document.getElementById("verifierLoader").style.display = "none";
        }
    }

    prevDraw = latest;
    setTimeout("getRecentDraws()", 10000);
    /*}*/
}

//@ts-check

function initCountDown() {
    const date = new Date();
    const min = date.getUTCMinutes();

    // @ts-ignore
    const minsDeadline = getMinsDeadline();

    if (lastGen.includes("None")) {
        stampCurrentTime();
        setTimeout("initCountDown()", interval);
        // @ts-ignore
    } else if (isGenerationMinute(min, minsDeadline)) {
        // @ts-ignore
        if (isGenerated(lastGen) == false) {
            stampCurrentTime();
        }
    }

    // @ts-ignore generateWinner.js
    let countDown = getNextDrawTime(lastGen)

    if (countDown == "00 : 00") {
        document.getElementById("verifierLoader").style.display = "block";
    }

    document.getElementById("timer").textContent = countDown;
    setTimeout("initCountDown()", interval);
}

function stampCurrentTime() {
    const date = new Date();
    const utc = date.toUTCString()
    lastGen = utc;

    console.log("");
    console.log("stamp time: " + utc);
}

let lastGen = "None";
let interval = 50 //milliseconds
let prevDraw = null;
// @ts-ignore slottoSettings.js
let halfMin = Math.floor(getGenerationMin() / 2);