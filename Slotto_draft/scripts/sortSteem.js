//@ts-check

function CurrencySort() {
    this.STEEM = "0.000";
    this.SBD = "0.000";
}

/**
 * 
 * @param {string} amount 
 * @param {string} currency 
 */
CurrencySort.prototype.sortCurrency = function(amount, currency) {
    let type = " " + currency;
    let currAmount = 0.000;

    if (currency == "STEEM") {
        currAmount = Number.parseFloat(this.STEEM);
    } else if (currency == "SBD") {
        currAmount = Number.parseFloat(this.SBD);
    }

    if (amount.includes(type)) {
        const steemAmount = Number.parseFloat(amount.replace(type, ""));

        currAmount += steemAmount;

        if (currency == "STEEM") {
            this.STEEM = currAmount.toFixed(3);
        } else if (currency == "SBD") {
            this.SBD = currAmount.toFixed(3);
        }
    }
}