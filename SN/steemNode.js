function useDefaultNode() {
    const url = "https://api.steemit.com";
    console.log("using default node: " + url);
    steem.api.setOptions({ url: url });
}

useDefaultNode();