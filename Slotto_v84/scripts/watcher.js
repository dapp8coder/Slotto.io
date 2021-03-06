//@ts-check

/**
 * 
 * @param {array} transfers 
 */
Watcher.prototype.getWinners = function(transfers) {
    this.result = null;

    this.result = inspectTransfers(transfers, this);

    console.log("");
    console.log("---winners---");
    console.log(this.result);

    /*for (let i = 0; i < this.result.length; i++) {
        let r = this.result[i];

        for (let k = 0; k < r.tickets.length; k++) {
            let t = r.tickets[k];
            console.log(t.op[1].from + " " + t.op[1].amount + " " + t.op[1].memo);
        }
        console.log("");
    }*/
}

/**
 * 
 * @param {array} transfers 
 * @param {Watcher} node
 */
function inspectTransfers(transfers, node) {
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
    let winners = findWinner(blocks, node);

    //remaining outstanding tickets
    node.outstandingTickets = new Array();
    // @ts-ignore
    node.sumOutstanding = new CurrencySort();

    for (let i = 0; i < allTickets.length; i++) {
        let winnerFound = false;

        if (allTickets[i].op[1].from != "slotto.gen") {
            node.outstandingTickets.push(allTickets[i]);
            node.sumOutstanding.sortCurrency(allTickets[i].op[1].amount, "STEEM");
            node.sumOutstanding.sortCurrency(allTickets[i].op[1].amount, "SBD");
        }

        if (allTickets[i].op[1].from == "slotto.gen") {
            for (let k = 0; k < node.prevWinningDraws.length; k++) {
                let purchased = allTickets[i].op[1].memo.substring(0, 8) + " " + allTickets[i].timestamp;
                //console.log(purchased + " vs " + node.prevWinningDraws[k])
                if (purchased == node.prevWinningDraws[k]) {
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
    console.log(node.outstandingTickets);
    console.log(node.sumOutstanding);

    return winners;
}

/**
 * 
 * @param {array} blocks 
 */
function findWinner(blocks, node) {
    let results = new Array();
    node.prevWinningDraws = new Array();

    for (let i = 0; i < blocks.length; i++) {
        let draw = blocks[i].draw;
        let prize = new Prize();

        for (let k = i; k >= 0; k--) {
            let deprecated = false;

            node.prevWinningDraws.forEach(function(element) {
                if (blocks[k].draw == element) {
                    deprecated = true;
                }
            });

            if (deprecated) {
                break;
            }

            searchBlock(draw, blocks[k], prize, node);
        }

        if (prize.winnerNames.length > 0) {
            results.push(prize);
        }
    }

    return results;
}

function isMatch(ticketMemo, drawMemo) {
    let t1 = Number(ticketMemo.substring(0, 2));
    let t2 = Number(ticketMemo.substring(3, 5));
    let t3 = Number(ticketMemo.substring(6, 8));

    let ticketsArray = new Array();
    ticketsArray.push(t1);
    ticketsArray.push(t2);
    ticketsArray.push(t3);

    let d1 = Number(drawMemo.substring(0, 2));
    let d2 = Number(drawMemo.substring(3, 5));
    let d3 = Number(drawMemo.substring(6, 8));

    let drawArray = new Array();
    drawArray.push(d1);
    drawArray.push(d2);
    drawArray.push(d3);

    let combo1 = new Array();
    let combo2 = new Array();
    let combo3 = new Array();
    let combo4 = new Array();
    let combo5 = new Array();
    let combo6 = new Array();

    combo1.push(d1);
    combo1.push(d2);
    combo1.push(d3);

    combo2.push(d1);
    combo2.push(d3);
    combo2.push(d2);

    combo3.push(d2);
    combo3.push(d1);
    combo3.push(d3);

    combo4.push(d2);
    combo4.push(d3);
    combo4.push(d1);

    combo5.push(d3);
    combo5.push(d1);
    combo5.push(d2);

    combo6.push(d3);
    combo6.push(d2);
    combo6.push(d1);

    if (arrayMatch(ticketsArray, combo1) == true) {
        return true;
    }
    if (arrayMatch(ticketsArray, combo2) == true) {
        return true;
    }
    if (arrayMatch(ticketsArray, combo3) == true) {
        return true;
    }
    if (arrayMatch(ticketsArray, combo4) == true) {
        return true;
    }
    if (arrayMatch(ticketsArray, combo5) == true) {
        return true;
    }
    if (arrayMatch(ticketsArray, combo6) == true) {
        return true;
    }

    return false;
}

function arrayMatch(array1, array2) {
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] != array2[i]) {
            return false;
        }
    }

    return true;
}

function searchBlock(draw, block, prize, node) {
    /*console.log("");
    console.log("searching for winner on draw: " + draw);
    console.log("       ----> searching block: " + block.draw);
    console.log(block.tickets.length);*/

    for (let i = 0; i < block.tickets.length; i++) {
        let t = String(block.tickets[i].op[1].memo);
        t = t.substring(0, 8);

        let d = draw.substring(0, 8);

        if (t == "51,51,51") {
            prize.sum.sortCurrency(block.tickets[i].op[1].amount, "STEEM");
        } else {
            // @ts-ignore
            prize.sum.sortCurrency(getTicketPrice(), "STEEM");
        }
        //prize.sum.sortCurrency(block.tickets[i].op[1].amount, "SBD");

        prize.tickets.push(block.tickets[i]);

        //console.log(draw.substr(0, 8) + " vs " + t);

        if (isMatch(t, d) == true) {
            if (node.prevWinningDraws.includes(draw) == false) {
                node.prevWinningDraws.push(draw);
            }

            if (prize.winningDraw == null) {
                prize.winningDraw = draw;
            }

            if (prize.winnerNames.includes(block.tickets[i].op[1].from) == false) {
                prize.winnerNames.push(block.tickets[i].op[1].from);
                console.log("");
                console.log("WINNER FOUND! " + block.tickets[i].op[1].from);
                //console.log(prize);
            } else {
                console.log("duplicate winning ticket from " + block.tickets[i].op[1].from);
            }
        }
    }
}

function Prize() {
    // @ts-ignore
    this.sum = new CurrencySort();
    this.winnerNames = new Array();
    this.winningDraw = null;
    this.tickets = new Array();
    this.bonusesSent = null;
}

function isSlottoFormat(data) {
    const memo = String(data.op[1].memo);

    if (memo.includes(".")) {
        return false;
    }

    if (memo.includes("-")) {
        return false;
    }

    if (data.op[1].amount.includes("STEEM") == false) {
        return false;
    }

    if (memo.length >= 8) {
        const comma1 = memo.substr(2, 1);
        const comma2 = memo.substr(5, 1);
        const num1 = memo.substr(0, 2);
        const num2 = memo.substr(3, 2);
        const num3 = memo.substr(6, 2);

        if (data.op[1].from == "hitmanchoi") {
            return false;
        }

        if (memo == "51,51,51") {
            console.log("");
            console.log("---donations---");
            console.log(data);
            return true;
        }

        if (comma1 == "," && comma2 == ",") {
            if (isNaN(Number(num1)) == false &&
                isNaN(Number(num2)) == false &&
                isNaN(Number(num3)) == false) {
                if (data.op[1].from != "slotto.gen") {
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
            b.draw = allTickets[i].op[1].memo.substring(0, 8) + " " + allTickets[i].timestamp;

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

function Watcher() {
    this.result = null;
    this.prevWinningDraws = new Array();
    this.outstandingTickets = null;
    this.sumOutstanding = null;
}