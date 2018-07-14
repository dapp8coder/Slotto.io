function useDefaultNode() {
    console.log("using default node: " + url);
    const url = "https://api.steemit.com";
    steem.api.setOptions({ url: url });
}

useDefaultNode();