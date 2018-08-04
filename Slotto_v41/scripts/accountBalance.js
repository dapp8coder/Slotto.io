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
        console.log(result);
    } catch (err) {
        console.log("");
        console.log(err);
        console.log("trying again..");
        return await getSteemBalance(accountName);
    } finally {
        return result[0].balance;
    }
}