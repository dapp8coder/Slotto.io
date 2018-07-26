//@ts-check

function SteemTransfers() {
    this.result = null;
    this.total = null;
}

/**
 * 
 * @param {string} sender 
 * @param {string} receiver 
 * @param {array} accountHistory 
 */
SteemTransfers.prototype.filterTransfers = function(sender, receiver, accountHistory) {
    console.log("");
    console.log("---filtered transfers---");

    this.result = new Array();
    // @ts-ignore
    this.total = new CurrencySort();

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

    for (let i = 0; i < accountHistory.length; i++) {
        const op = accountHistory[i][1].op;
        const opType = accountHistory[i][1].op[0];
        const action = accountHistory[i][1];
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
                this.result.push(action);
                this.total.sortCurrency(amount, "STEEM");
                this.total.sortCurrency(amount, "SBD");
            }
        }
    }

    console.log(this.result);
    console.log(this.total);
}