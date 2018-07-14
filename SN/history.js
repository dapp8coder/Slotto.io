//@ts-check

/**
 * 
 * @param {string} name 
 * @param {number} from 
 * @param {number} limit 
 */
async function downloadAccountHistory(name, from, limit) {
    resultHistory = new Array();
    await getHistory(name, from, limit);
}

function getAccountHistory() {
    return resultHistory;
}

/**
 * 
 * @param {string} name 
 * @param {number} from 
 * @param {number} limit 
 */
async function getHistory(name, from, limit) {
    try {
        console.log(from + " " + limit);

        // @ts-ignore
        let result = await steem.api.getAccountHistoryAsync(name, from, limit);
        let halt = false;

        for (let i = result.length - 1; i >= 0; i--) {
            resultHistory.push(result[i]);

            if (memoFound(result[i])) {
                halt = true;
                break;
            }
        }

        const next = resultHistory[resultHistory.length - 1][0] - 1;

        if (next <= 0 || halt == true) {
            //do nothing
        } else {
            if (limit > next) {
                limit = next;
            }
            await getHistory(name, next, limit);
        }

    } catch (err) {
        console.log(err);
        console.log("trying again..");
        await getHistory(name, from, limit);
    }
}

/**
 * 
 * @param {JSON} transaction 
 */
function memoFound(transaction) {
    if (transaction[1].op[0] == "transfer") {
        if (transaction[1].op[1].memo == searchLimit.memo &&
            transaction[1].op[1].from == searchLimit.sender) {
            console.log("found memo (halting search): " + searchLimit.memo);
            return true;
        }
    }
    return false;
}

function SearchLimit() {
    this.sender = null;
    this.memo = null; //memo must match sender
}

/**
 * 
 * @param {string} memo 
 * @param {string} sender 
 */
function setSearchLimit(memo, sender) {
    console.log("");
    console.log("---search limit---");
    console.log("memo: " + memo);
    console.log("sender: " + sender);
    searchLimit.memo = memo;
    searchLimit.sender = sender;
}

const searchLimit = new SearchLimit();
let resultHistory = null;