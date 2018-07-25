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

    // @ts-ignore
    document.getElementById("timer").textContent = getNextDrawTime(lastGen);
    setTimeout("initCountDown()", interval);
}

let lastGen = "None";
let interval = 50 //milliseconds

function stampCurrentTime() {
    const date = new Date();
    const utc = date.toUTCString()
    lastGen = utc;

    console.log("");
    console.log("stamp time: " + utc);
}