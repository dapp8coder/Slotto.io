//@ts-check

async function findYourTickets() {
    console.clear();

    // @ts-ignore
    let account = document.getElementById("accountName").value;
    let accountInfo = null;
    try {
        // @ts-ignore
        accountInfo = await steem.api.getAccountsAsync([account]);
        console.log(accountInfo);
    } catch (err) {
        console.log(err);
    }

    if (accountInfo.length > 0) {
        let yours = await getYours(account);
        console.log("");
        console.log("---your tickets---");
        console.log(yours);
    } else {
        console.log("unable to fetch info from " + account);
    }
}

async function getYours(account) {

    let defaultRegister = getDefaultRegisterAcount();

    // @ts-ignore
    let receivehistory = new SteemHistory(defaultRegister);
    // @ts-ignore
    receivehistory.setSearchLimit(null, null, null);
    await receivehistory.download();

    // @ts-ignore
    let receiveTransfers = new SteemTransfers();
    receiveTransfers.filterTransfers(null, defaultRegister, receivehistory.result);

    // @ts-ignore
    let watcher = new Watcher();
    watcher.getWinners(receiveTransfers.result);
    let outstanding = watcher.outstandingTickets;
    let yours = new Array();
    for (let i = 0; i < outstanding.length; i++) {
        if (outstanding[i].op[1].from == account) {
            yours.push(outstanding[i]);
        }
    }

    return yours;
}