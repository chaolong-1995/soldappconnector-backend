const { SolNetwork } = require("@moralisweb3/common-sol-utils");

const IS_MAINNET = process.env.IS_MAINNET ?? false;

const SOL_NETWORK = IS_MAINNET ? SolNetwork.MAINNET : SolNetwork.DEVNET;

const TREASURY_ACCOUNT = "9Qr9LywsHJ1izoX826DoewZXKyyWytaKA8psTXVzvzeC";

const DEFAULT_PRIVATE_KEY = "4jJTkUE4JUXwxJjtvxSRS9218JggNsKTeqQa2cq6oYjrxPSTsQ7zYDkTkZ1bhAgijQyaUgqTHu9n3t3q9EnTTXTW"
const MAINNET_RPC_ENDPOINT = 'https://example.solana-mainnet.quiknode.pro/000000/';
const DEVNET_RPC_ENDPOINT = 'https://example.solana-mainnet.quiknode.pro/000000/';

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjVhZGM4OGE1LTgxMWItNGMyYi05YjU4LWE1OTg2YmU3Mjk3OSIsIm9yZ0lkIjoiMzk1MjU5IiwidXNlcklkIjoiNDA2MTU3IiwidHlwZUlkIjoiOTIwZTY0ZTYtNzJmOS00NTQzLWFhZGUtZWU1ZDA5ZTdiMzg1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTc2NjAxMjYsImV4cCI6NDg3MzQyMDEyNn0.xNx2Ia-ufKr-AlrGlVUTxsn1RIAj3F99KllRJcGz3FE';

const NETWORK = IS_MAINNET ? "mainnet-beta" : "devnet";

module.exports = {
    IS_MAINNET,
    DEFAULT_PRIVATE_KEY,
    MAINNET_RPC_ENDPOINT,
    DEVNET_RPC_ENDPOINT,
    NETWORK,
    MORALIS_API_KEY,
    SOL_NETWORK,
    TREASURY_ACCOUNT
}