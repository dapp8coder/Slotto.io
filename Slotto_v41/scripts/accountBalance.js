//@ts-check

/**
 * 
 * @param {string} accountName 
 */
async function getSteemBalance(accountName) {
    let result = null;
    try {
        // @ts-ignore
        result = await steem.api.getAccountsAsync([accountName]);
        return result[0].balance;
    } catch (err) {
        console.log("");
        console.log(err);
        console.log("trying again..");
        await getSteemBalance(accountName);
    }
}