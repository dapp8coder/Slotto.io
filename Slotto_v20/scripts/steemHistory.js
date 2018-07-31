//@ts-check

/**
 * 
 * @param {string} name 
 * @param {number} from 
 * @param {number} limit 
 * @param {SteemHistory} node
 */
async function getHistory(name, from, limit, node) {
    console.log("from: " + from + " limit: " + limit);

    // @ts-ignore
    let r = await steem.api.getAccountHistoryAsync(name, from, limit);
    let halt = false;

    try {
        for (let i = r.length - 1; i >= 0; i--) {
            node.result.push(r[i]);

            //search up to memo
            if (memoFound(r[i], node)) {
                console.log("found memo (halting search): " + node.searchLimit.memo);
                halt = true;
                break;
            }

            //search up to date limit
            if (node.searchLimit.date != "none") {
                // @ts-ignore
                if (Date.parse(r[i][1].timestamp).compareTo(node.searchLimit.date) != 1) {
                    console.log((node.searchLimit.days) + " days limit reached (halting search)")
                    console.log("post date: " + Date.parse(r[i][1].timestamp));
                    halt = true;
                    break;
                };
            }
        }

        const next = node.result[node.result.length - 1][0] - 1;

        if (next <= 0 || halt == true) {
            console.log("");
            console.log("---account history---");
            console.log(node.result);
        } else {
            if (limit > next) {
                limit = next;
            }
            await getHistory(name, next, limit, node);
        }

    } catch (err) {
        console.log(err);
        console.log("trying again..");
        await getHistory(name, from, limit, node);
    }
}

/**
 * 
 * @param {JSON} transaction 
 * @param {SteemHistory} node
 */
function memoFound(transaction, node) {
    if (transaction[1].op[0] == "transfer") {
        if (transaction[1].op[1].memo == node.searchLimit.memo &&
            transaction[1].op[1].from == node.searchLimit.sender) {
            return true;
        }
    }
    return false;
}

function SearchLimit() {
    this.sender = null;
    this.memo = null; //memo must match sender
    this.days = null; //number of recent days
    this.date = null;
}

/**
 * 
 * @param {string} accountName 
 */
function SteemHistory(accountName) {
    this.name = accountName;
    this.searchLimit = new SearchLimit();
    this.result = null;
}

/**
 * 
 * @param {string} memo 
 * @param {string} sender 
 */
SteemHistory.prototype.setSearchLimit = function(memo, sender, days) {
    console.log("");
    console.log("---search limit---");
    console.log("memo: " + memo);
    console.log("sender: " + sender);

    this.searchLimit.memo = memo;
    this.searchLimit.sender = sender;

    if (days <= 0 || days == null) {
        this.searchLimit.date = "none";
        console.log("date: none");
    } else {
        this.searchLimit.days = days;
        // @ts-ignore
        this.searchLimit.date = Date.today().add(-this.searchLimit.days).days();
        console.log("number of days: " + (this.searchLimit.days) + " (" + this.searchLimit.date + ")");
    }
}

SteemHistory.prototype.download = async function() {
    console.log("");
    console.log("---downloading account history---");
    this.result = new Array();
    try {
        await getHistory(this.name, -1, getHistoryInterval(), this);
    } catch (err) {
        console.log("");
        console.log(err);
        console.log("trying again");
        await getHistory(this.name, -1, getHistoryInterval(), this);
    }
}