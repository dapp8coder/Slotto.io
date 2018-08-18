//@ts-check

/**
 * 
 * @param {string} accountName 
 */
async function getSteemBalance(accountName) {
    console.log("");
    console.log("---getting account balance: " + accountName + "---");

    await getAccountInfo(accountName);
    await getSteem(accountName);

    console.log(accountSteem);

    return accountSteem;
}

async function getAccountInfo(accountName) {
    accountInfo = null;
    try {
        // @ts-ignore
        accountInfo = await steem.api.getAccountsAsync([accountName]);
        console.log(accountInfo);
    } catch (err) {
        console.log("failed to download info. trying again..");
        await getAccountInfo(accountName);
    }
}

async function getSteem(accountName) {
    accountSteem = null;
    try {
        accountSteem = accountInfo[0].balance;
    } catch (err) {
        console.log("result is undefined. trying again..");
        await getAccountInfo(accountName);
        await getSteem(accountName);
    }
}

let accountInfo = null;
let accountSteem = null;