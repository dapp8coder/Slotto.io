//@ts-check

/**
 * 
 * @param {string} account 
 * @param {string} sender 
 * @param {string} receiver 
 */
async function getTransfers(account, sender, receiver) {
    console.log("");
    console.log("---account history---");
    clearTransfers();
    // @ts-ignore
    await downloadAccountHistory(account, -1, 10000);
    // @ts-ignore
    console.log(getAccountHistory());

    console.log("");
    console.log("---transfer history---");
    filterTransfers(sender, receiver);
    console.log(transferHistory);
}

function getTransferHistory() {
    return transferHistory;
}

function clearTransfers() {
    transferHistory.transfers = null;
    transferHistory.total = null;
}

function filterTransfers(sender, receiver) {
    transfers = new Array();

    let filterSender = false;
    let filterReceiver = false;
    let add = false;

    if (sender != null) {
        console.log("filter by sender: " + sender);
        filterSender = true;
    }

    if (receiver != null) {
        console.log("filter by receiver: " + receiver);
        filterReceiver = true;
    }

    // @ts-ignore
    let history = getAccountHistory()

    for (let i = 0; i < history.length; i++) {
        const op = history[i][1].op;
        const opType = history[i][1].op[0];
        const action = history[i][1];
        const amount = op[1].amount;
        add = false;

        if (opType == "transfer") {
            if (filterSender == true && filterReceiver == true) {
                if (op[1].from == sender && op[1].to == receiver) {
                    add = true;
                }
            } else if (filterSender == true && filterReceiver == false) {
                if (op[1].from == sender) {
                    add = true;
                }
            } else if (filterSender == false && filterReceiver == true) {
                if (op[1].to == receiver) {
                    add = true;
                }
            } else {
                add = true;
            }

            if (add) {
                transfers.push(action);
                total.sortCurrency(amount, "STEEM");
                total.sortCurrency(amount, "SBD");
            }
        }
    }

    transferHistory.transfers = transfers;
    transferHistory.total = total;
}

let transfers = null;
// @ts-ignore
const total = new CurrencySort();
let transferHistory = { "transfers": null, "total": null };