//@ts-check

/**
 * 
 * @param {string} accountName 
 */
async function getSteemBalance(accountName) {
    console.log("");
    console.log("---getting account balance: " + accountName + "---");

    let result = null;

    try {
        // @ts-ignore
        result = await steem.api.getAccountsAsync([accountName]);
    } catch (err) {
        console.log("");
        console.log(err);
        console.log("trying again..");
        await getSteemBalance(accountName);
    }

    try {
        return result[0].balance;
    } catch (err) {
        console.log("");
        console.log(err);
        console.log("trying again..");
        getSteemBalance(accountName);
    }
}