//@ts-check

async function downloadTransferHistory() {
    // @ts-ignore
    setSearchLimit("01,02,10 Sun, 08 Jul 2018 11:05:00 GMT 151", "slotto.gen");

    // @ts-ignore
    await getTransfers("slotto.ninja", null, "slotto.ninja");
}

async function getWinners() {
    finalResult = null;

    await downloadTransferHistory();
    // @ts-ignore
    let transfers = getTransferHistory().transfers;
    finalResult = inspectTransfers(transfers);

    console.log("");
    console.log("---final result---");
    console.log(finalResult);
}

function getFinalResult() {
    return finalResult
}

/**
 * 
 * @param {array} transfers 
 */
function inspectTransfers(transfers) {
    let allTickets = new Array();
    // @ts-ignore
    let allSum = new CurrencySort();

    let genTickets = new Array();
    // @ts-ignore
    let genSum = new CurrencySort();

    let validTickets = new Array();
    // @ts-ignore
    let validSum = new CurrencySort();

    let invalidTickets = new Array();
    // @ts-ignore
    let invalidSum = new CurrencySort();

    for (let i = 0; i < transfers.length; i++) {
        if (isSlottoFormat(transfers[i])) {
            allTickets.push(transfers[i]);
            allSum.sortCurrency(transfers[i].op[1].amount, "STEEM");
            allSum.sortCurrency(transfers[i].op[1].amount, "SBD");

            if (transfers[i].op[1].from != "slotto.gen") {
                validTickets.push(transfers[i]);
                validSum.sortCurrency(transfers[i].op[1].amount, "STEEM");
                validSum.sortCurrency(transfers[i].op[1].amount, "SBD");
            } else {
                genTickets.push(transfers[i]);
                genSum.sortCurrency(transfers[i].op[1].amount, "STEEM");
                genSum.sortCurrency(transfers[i].op[1].amount, "SBD");
            }
        } else {
            invalidTickets.push(transfers[i]);
            invalidSum.sortCurrency(transfers[i].op[1].amount, "STEEM");
            invalidSum.sortCurrency(transfers[i].op[1].amount, "SBD");
        }
    }

    console.log("")
    console.log("---all tickets---");
    console.log(allTickets);
    console.log(allSum);

    console.log("")
    console.log("---gen tickets---");
    console.log(genTickets);
    console.log(genSum);

    console.log("")
    console.log("---valid tickets---");
    console.log(validTickets);
    console.log(validSum);

    console.log("")
    console.log("---invalid tickets---");
    console.log(invalidTickets);
    console.log(invalidSum);

    let blocks = createBlocks(allTickets);

    console.log("");
    console.log("---Slotto Blocks---");
    console.log(blocks);
    let steemTotal = 0;
    let sbdTotal = 0;
    for (let i = 0; i < blocks.length; i++) {
        steemTotal += Number.parseFloat(blocks[i].sum.STEEM);
        sbdTotal += Number.parseFloat(blocks[i].sum.SBD);
    }
    console.log("STEEM total: " + steemTotal);
    console.log("SBD total: " + sbdTotal);

    console.log("");
    console.log("---finding winner---");
    let winners = findWinner(blocks);

    //remaining outstanding tickets (for double checking)
    let outstandingTickets = new Array();
    // @ts-ignore
    let sumOutstanding = new CurrencySort();
    for (let i = 0; i < allTickets.length; i++) {
        let winnerFound = false;

        if (allTickets[i].op[1].from != "slotto.gen" &&
            allTickets[i].op[1].from != "roundbeargames") {
            outstandingTickets.push(allTickets[i]);
            sumOutstanding.sortCurrency(allTickets[i].op[1].amount, "STEEM");
            sumOutstanding.sortCurrency(allTickets[i].op[1].amount, "SBD");
        }

        if (allTickets[i].op[1].from == "slotto.gen") {
            for (let k = 0; k < prevWinningDraws.length; i++) {
                console.log(prevWinningDraws[k] + " vs " + allTickets[i].op[1].memo);
                if (allTickets[i].op[1].memo == prevWinningDraws[k]) {
                    winnerFound = true;
                    break;
                }
            }
        }

        if (winnerFound) {
            break;
        }
    }
    console.log("");
    console.log("---outstanding tickets---")
    console.log(outstandingTickets);
    console.log(sumOutstanding);

    return winners;
}

/**
 * 
 * @param {array} blocks 
 */
function findWinner(blocks) {
    let results = new Array();
    prevWinningDraws = new Array();

    for (let i = 0; i < blocks.length; i++) {
        let draw = blocks[i].draw;
        let prize = new Prize();

        for (let k = i; k >= 0; k--) {
            let deprecated = false;

            prevWinningDraws.forEach(function(element) {
                if (blocks[k].draw == element) {
                    deprecated = true;
                }
            });

            if (deprecated) {
                break;
            }

            searchBlock(draw, blocks[k], prize, prevWinningDraws);
        }

        if (prize.winnerNames.length > 0) {
            results.push(prize);
        }
    }

    return results;
}

function searchBlock(draw, block, prize, prevWinningDraws) {
    console.log("");
    console.log("searching for winner on draw: " + draw);
    console.log("       ----> searching block: " + block.draw);
    console.log(block.tickets.length);

    for (let i = 0; i < block.tickets.length; i++) {
        let t = String(block.tickets[i].op[1].memo);
        t = t.substring(0, 8);

        prize.sum.sortCurrency(block.tickets[i].op[1].amount, "STEEM");
        prize.sum.sortCurrency(block.tickets[i].op[1].amount, "SBD");

        if (draw.substr(0, 8) == t) {
            console.log("WINNER FOUND! " + block.tickets[i].op[1].from);
            console.log(block.tickets[i]);

            prevWinningDraws.push(draw);

            if (prize.winningDraw == null) {
                prize.winningDraw = draw;
            }

            if (block.tickets[i].op[1].from in prize.winnerNames == false) {
                prize.winnerNames.push(block.tickets[i].op[1].from);
            }

            console.log(prize);
        }
    }
}

function Prize() {
    // @ts-ignore
    this.sum = new CurrencySort();
    this.winnerNames = new Array();
    this.winningDraw = null;
}

function isSlottoFormat(data) {
    const memo = String(data.op[1].memo);

    if (memo.length > 8) {
        const comma1 = memo.substr(2, 1);
        const comma2 = memo.substr(5, 1);
        const num1 = memo.substr(0, 2);
        const num2 = memo.substr(3, 2);
        const num3 = memo.substr(6, 2);

        if (comma1 == "," && comma2 == ",") {
            if (isNaN(Number(num1)) == false &&
                isNaN(Number(num2)) == false &&
                isNaN(Number(num3)) == false) {
                if (data.op[1].from == "roundbeargames") {
                    if (data.op[1].memo.substring(0, 8) == "51,51,51") {
                        return true;
                    }
                } else if (data.op[1].from != "slotto.gen") {
                    // @ts-ignore
                    if (data.op[1].amount == getTicketPrice()) {
                        return true;
                    }
                } else if (data.op[1].from == "slotto.gen") {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * 
 * @param {array} allTickets 
 */
function createBlocks(allTickets) {
    let blocks = new Array();

    for (let i = allTickets.length - 1; i >= 0; i--) {
        //get draws only from slotto.gen
        if (allTickets[i].op[1].from == "slotto.gen") {
            let b = new Block();
            b.draw = allTickets[i].op[1].memo;
            //place outstanding tickets into a block
            for (let t = i + 1; t < allTickets.length; t++) {
                if (allTickets[t].op[1].from != "slotto.gen") {
                    b.tickets.push(allTickets[t]);
                    b.sum.sortCurrency(allTickets[t].op[1].amount, "STEEM");
                    b.sum.sortCurrency(allTickets[t].op[1].amount, "SBD");
                } else {
                    break;
                }
            }
            blocks.push(b);
        }
    }

    return blocks;
}

function Block() {
    this.draw = null;
    this.tickets = new Array();
    // @ts-ignore
    this.sum = new CurrencySort();
}

let finalResult = null;
let prevWinningDraws = null;