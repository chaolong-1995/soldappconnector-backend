const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");

const Moralis = require("moralis").default;

const { SOL_NETWORK, MORALIS_API_KEY } = require("./constants");
const { PublicKey } = require("@solana/web3.js");

module.exports.getTokenDecimals = async (mintAddress, solanaConnection) => {
    const info = await solanaConnection.getParsedAccountInfo(new PublicKey(mintAddress));
    const result = info.value?.data.parsed.info.decimals;
    return result;
}

module.exports.getTokenAccounts = async (wallet, solanaConnection) => {
    const filters = [
        {
            dataSize: 165,    //size of account (bytes)
        },
        {
            memcmp: {
                offset: 32,     //location of our query in the account (bytes)
                bytes: wallet,  //our search criteria, a base58 encoded string
            },
        }];
    const accounts = await solanaConnection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        { filters: filters }
    );
    console.log(`Found ${accounts.length} token account(s) for wallet ${wallet}.`);

    let tokensInfo = [];
    let noValueTokensInfo = [];
    await Promise.all(accounts.map(async (account, i) => {
        //Parse the account data
        const parsedAccountInfo = account.account.data;
        const mintAddress = parsedAccountInfo["parsed"]["info"]["mint"];
        const tokenBalance = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
        //Log results
        console.log(`Token Account No. ${i + 1}: ${account.pubkey.toString()}`);
        console.log(`--Token Mint: ${mintAddress}`);
        console.log(`--Token Balance: ${tokenBalance}`);

        const _tokenPrice = await this.getTokenPrice(account.pubkey.toString());
        // const _tokenPrice = { usdPrice: 1 };

        const usdPrice = _tokenPrice?.usdPrice ?? 0;
        const tokenDecimals = await this.getTokenDecimals(mintAddress, solanaConnection);

        if (!!usdPrice) {
            tokensInfo.push({
                mintAddress,
                decimals: tokenDecimals,
                balance: tokenBalance,
                totalTokenValueUSD: usdPrice * tokenBalance
            })
        } else {
            noValueTokensInfo.push({
                mintAddress,
                decimals: tokenDecimals,
                balance: tokenBalance,
                totalTokenValueUSD: usdPrice * tokenBalance
            })
        }

        return false;
    }));

    let sortedTokenInfo = tokensInfo.sort((a, b) => a.totalTokenValueUSD > b.totalTokenValueUSD ? -1 : 1)
    sortedTokenInfo = sortedTokenInfo.concat(noValueTokensInfo)
    console.log('sortedTokenInfo', sortedTokenInfo)
    return sortedTokenInfo;

}

module.exports.getTokenPrice = async (address) => {

    if (!Moralis.Core.isStarted) {
        Moralis.start({
            apiKey: MORALIS_API_KEY,
            // ...and any other configuration
        });
    }

    try {
        const response = await Moralis.SolApi.token.getTokenPrice({
            address: address,
            network: SOL_NETWORK,
        });
        return response.toJSON()
    }

    catch (e) {
        console.log(e.message)
        return {}
    }
};