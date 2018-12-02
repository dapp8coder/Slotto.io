function useDefaultNode() {
    const url = "https://api.steemit.com";
    //const url = "https://testnet.steemitdev.com";
    steem.api.setOptions({ url: url });
    console.log("using default node: " + url);
}

useDefaultNode();