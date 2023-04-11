import AnchorLink from 'anchor-link'
import AnchorLinkBrowserTransport from 'anchor-link-browser-transport'
import { AUTH_BE, chainId, refundContract } from '../config'
import * as waxjs from "@waxio/waxjs/dist";
import axios from "axios";
import { ExplorerApi } from "atomicassets";
import { JsonRpc, Api, RpcError } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
const ecc = require("eosjs-ecc");

const transport = new AnchorLinkBrowserTransport()



const PLASMA_COIN = "GMP";
const OXYGEN_COIN = "GMO";
const ASTEROID_COIN = "GMA";
const PLASMA_POINT = "PLASMA";
const OXYGEN_POINT = "OXYGEN";
const ASTEROID_POINT = "ASTEROI"; // updated by

// https://eu2.test.wax.api.atomicassets.io


const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};


const token = {
    plasma: {
        type: 'GMP',
        image: 'QmVz8PYSc6oqKU4kwL4WwLhsfA4TrK897Z5rGo9mW6syV6',
    },
    oxygen: {
        type: 'GMO',
        image: 'QmUhj3917cFfEv8PACYRwVDkJt5zT8dYPsqzs2SfhDtq42',
    },
    asteroid: {
        type: 'GMA',
        image: 'Qme1LRLyeDvZqHFgkdHXCzgZgyKGcWaqkH3NffsuQ4ccnD',
    },
};


export default class GalaxyMiners {
    constructor(server, mainCollection, mintCollection, privateAccount) {
        const rpc = new JsonRpc(server, { fetch });
        let signatureProvider = new JsSignatureProvider([]);
        this.api = new Api({
            rpc,
            signatureProvider,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });
        this.signature = null;
        this.timestamp = null;
        if (privateAccount) {
            // this.wax = new waxjs.WaxJS(server, username, null, false, signatureProvider);
            const { username, privateKey } = privateAccount;
            signatureProvider = new JsSignatureProvider([privateKey]);

            this.api = new Api({
                rpc,
                signatureProvider,
                textDecoder: new TextDecoder(),
                textEncoder: new TextEncoder(),
            });
            this.privateAccount = privateAccount;
            this.rpc = rpc;

            this.name = username;
            this.token = localStorage.getItem(`s.id ${this.name}`)

        } else {
            // this.wax = new waxjs.WaxJS({
            //     rpcEndpoint: server,
            //     tryAutoLogin: false
            // });
            this.wax = new waxjs.WaxJS(server, null, null, false); // updated by paul
            this.rpc = this.wax.rpc;
            const link = new AnchorLink({
                transport,
                chains: [
                    {
                        chainId: chainId.main, // mainnet
                        // chainId: chainId.test, // testnet
                        nodeUrl: server,
                    },
                ],
            })
            this.link = link
        }

        try {
            // https://eu2.test.wax.api.atomicassets.io
            // https://wax.api.atomicassets.io           // mainnet
            // https://test.wax.api.atomicassets.io     // testnet
            // https://api.wax-aa.bountyblok.io
            this.aapi = new ExplorerApi("https://wax.api.atomicassets.io", "atomicassets", {
                fetch,
            });

        } catch (error) {
            // https://ca2.test.wax.api.atomichub.io
            // https://wax.api.aa.atomichub.io                 // mainnet
            // https://test.wax.api.atomicassets.io            // testnet
            this.aapi = new ExplorerApi("https://wax.api.aa.atomichub.io", "atomicassets", {
                fetch,
            });
        }
        // this.rpc = rpc;
        // this.api = this.wax.api;
        this.mainCollection = mainCollection;
        this.mintCollection = mintCollection;
        this.server = server;
        // this.test()

    }
    clearSig() {
        this.signature = null;
        this.timestamp = null;
        this.longSig = null;
        this.longTStamp = null;
        this.pubBackup = null;
        this.backupKey = null;
    }


    async anchorLogin() {
        // Perform the login, which returns the users identity
        // try {
        //     this.link.restoreSession('galaxyminers1').then(({ session }) => {
        //         console.log(session)
        //         this.name = session.auth.actor
        //         this.anchorSession = session
        //     })
        // } catch (error) {
        const identity = await this.link.login('galaxyminers')
        
        // Save the session within your application for future use
        const { session } = identity
        this.name = session.auth.actor
        this.anchorSession = session
        this.token = localStorage.getItem(`s.id ${this.name}`)

        // }
        return session.auth

    }

    setSession(session) {
        this.wax = new waxjs.WaxJS({
            rpcEndpoint: this.server,
            userAccount: session.userAccount,
            pubKeys: [session.pubKeys]
        })
        this.rpc = this.wax.rpc
        this.api = this.wax?.api || this.api
        this.name = session.userAccount
    }

    setServer(server) {
        this.server = server;
        // this.wax = new waxjs.WaxJS({
        //     rpcEndpoint: server,
        //     tryAutoLogin: false
        // });
        this.wax = new waxjs.WaxJS(server, null, null, false); // updated by paul
        this.rpc = this.wax.rpc
        const link = new AnchorLink({
            transport,
            chains: [
                {
                    chainId: chainId.main, // mainnet
                    // chainId: chainId.test, // testnet
                    nodeUrl: server,
                },
            ],
        })
        this.link = link

    }

    setPrivateAccount(privateAccount) {
        if (privateAccount) {
            const rpc = new JsonRpc(this.server, { fetch });
            const { username, privateKey } = privateAccount;
            const signatureProvider = new JsSignatureProvider([privateKey]);

            const api = new Api({
                rpc,
                signatureProvider,
                textDecoder: new TextDecoder(),
                textEncoder: new TextEncoder(),
            });

            this.api = api;
            this.name = username;
            this.privateAccount = privateAccount;
            this.rpc = rpc;
            this.token = localStorage.getItem(`s.id ${this.name}`)

        }
    }

    async login() {
        if (this.privateAccount) return;
        try {
            this.name = await this.wax.loginViaEndpoint();
        } catch (e) {
            this.name = await this.wax.login();
        }
        this.api = this.wax?.api || this.api
        this.token = localStorage.getItem(`s.id ${this.name}`)

        return this.name;
    }

    async getTokens() {
        return await this.rpc.get_currency_balance(this.mintCollection, this.name);
    }

    async getPlayerInfo() {
        let { rows } = await this.__getTableRows({
            code: this.mainCollection,
            scope: this.mainCollection,
            table: "players",
            lower_bound: this.name,
            upper_bound: this.name,
            index_position: 1,
            key_type: "i64",
            limit: "100",
        });
        return rows;
    }
    // Badge section
    async getUsingBadge() {
        let { rows } = await this.__getTableRows({
            code: this.mainCollection,
            scope: this.mainCollection,
            table: "badges",
            lower_bound: this.name,
            upper_bound: this.name,
            index_position: 2,
            key_type: "i64",
            limit: "100",
        });

        return rows;
    }
    async getBadgeConfig() {
        let { rows } = await this.rpc.get_table_rows({
            table: "mbsconf",
            limit: 100,
            code: this.mainCollection,
            scope: this.mainCollection,
        });

        return rows;
    }
    async getBadgeCraft() {
        let { rows } = await this.rpc.get_table_rows({
            table: "tmcraft",
            limit: 100,
            code: this.mainCollection,
            scope: this.mainCollection,
        });

        return rows;
    }
    async mbsClaimAsset(asset_id) {
        let actions = [
            {
                account: this.mainCollection,
                name: "claimasset",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    asset_owner: this.name,
                    asset_id: asset_id,
                },
            },
        ];
        return await this.__transact(actions);
    }
    async mbsGetUnclaimedAsset() {
        let { rows } = await this.rpc.get_table_rows({
            table: "tempassets",
            limit: 100,
            code: this.mainCollection,
            scope: this.mainCollection,
            lower_bound: this.name,
            upper_bound: this.name,
            key_type: "i64",
            index_position: 2,
        });

        return rows;
    }
    // 2FA section
    nowsec() {
        return Math.floor(Date.now() / 1000);
    }

    createUnlockHash(timestamp) {
        const content = `unlock ${this.name} ${timestamp}`;
        const buf = Buffer.from(content, { encoding: "ascii" });
        const digest = ecc.sha256(buf);
        return digest;
    }
    signPrivatekey() {
        if (!this.backupKey)
            throw new Error("No Backup Key available")
        const timestamp = this.nowsec() + 60;
        const digest = this.createUnlockHash(timestamp);
        const signature = ecc.signHash(digest, this.backupKey);
        this.timestamp = timestamp;
        this.signature = signature;
    }
    setSig(signature, timestamp) {
        this.signature = signature;
        this.timestamp = timestamp;
    }
    // test(key) {
    //     let temp = ecc.privateToPublic("5JdPdw1JQCYTNeQrGHnAYCXCevGRsDayjnahgHCG74oyNzfB78k")
    //     console.log(temp)
    // }
    isValidbackupKey(backupKey) {
        const isValid = ecc.isValidPrivate(backupKey)
        if (!isValid) {
            throw new Error("Wrong Backup key")
        }
        let tempPubBackup = ecc.privateToPublic(backupKey)

        if (!(tempPubBackup === this.pubBackup) && !(tempPubBackup === this.BEpubBackup)) {
            throw new Error("Invalid backup key")
        }
        this.backupKey = backupKey
        this.signPrivatekey()
        return true

    }
    async getAuthSettings() {

        let { rows } = await this.rpc.get_table_rows({
            table: "account2fa",
            limit: 100,
            code: this.mainCollection,
            scope: this.mainCollection,
            lower_bound: this.name,
            upper_bound: this.name
        });
        rows.forEach((row, i) => {
            this.pubBackup = row.pubkey
            if (!!row.pubkey)
                this.pubBackup = row.pubkey
        })
        return rows;
    }
    async getAuthStatus() {
        let response = await fetch(`${AUTH_BE.main}/account`, {
            method: "GET",
            credentials: 'same-origin',

            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${this.token}`
            },

        });
        const data = await response.json();
        if (!!data.publicKey) {
            this.BEpubBackup = data.publicKey
        }
        return data
    }

    async getNonce() {
        let response = await fetch(`${AUTH_BE.main}/nonce`, {
            method: "POST",
            credentials: 'same-origin',

            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                waxAddress: this.name
            }),
        });
        let nonce = (await response.json()).nonce;
        return nonce
    }

    async getProof(nonce) {
        const actions = [
            {
                account: "orng.wax",
                name: "requestrand",
                authorization: [
                    {
                        actor: this.name,
                        permission: "active",
                    },
                ],
                data: {
                    caller: this.name,
                    signing_value: nonce,
                    assoc_id: nonce,
                },
            },
        ]
        return this.__transact(actions, false)
    }

    /**
     * 
     * @param {*} proof 
     */
    async login2FA(proof, nonce) {
        const response = await fetch(`${AUTH_BE.main}/login`, {
            method: "POST",
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                proof, waxAddress: this.name, nonce
            }, getCircularReplacer()),
        });
        const token = await response.json();
        this.token = token.token

        return token
    }
    async enable2FA() {
        const response = await fetch(`${AUTH_BE.main}/enable-2fa`, {
            method: "POST",
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
                waxAddress: this.name
            }),
        });

        return await response.json()
    }

    async disable2FA(otpCode) {

        const response = await fetch(`${AUTH_BE.main}/disable-2fa`, {
            method: "POST",
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            },
            body: JSON.stringify({
                signature: this.signature, timestamp: this.timestamp
            })
        })
        return await response.json()
    }

    async update2FADuration(unlockDuration) {
        const response = await fetch(`${AUTH_BE.main}/update-2fa`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            },
            body: JSON.stringify({ unlockDuration: unlockDuration, signature: this.signature, timestamp: this.timestamp })
        })
        return response.json()
    }

    async lock2FA() {
        const response = await fetch(`${AUTH_BE.main}/lock-2fa`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            },
        })
        return response.json()
    }

    async verifyOtp(otpCode) {

        let body = { otpCode: otpCode }
        if (this.longSig && !otpCode) {
            if (!!this.longTStamp && this.longTStamp <= this.nowsec())
                throw new Error("Expired Authentication")
            body = { signature: this.longSig, timestamp: this.longTStamp, keyDuration: 60 }
        }
        const response = await fetch(`${AUTH_BE.main}/verify`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            },
            body: JSON.stringify(body)
        })
        const data = await response.json()
        let flag = 1
        if (data.ok) {
            if (data.prefix === "refresh") {
                flag = 2
                this.longSig = data.signature
                this.longTStamp = data.timestamp
            } else if (data.prefix === "unlock") {

                this.signature = data.signature
                this.timestamp = data.timestamp

            }
        } else throw Error("Invalid Token")
        data.flag = flag
        return data
    }

    setAuthSettings({ publicKey, unlock_duration, features }) {
        return [
            {
                account: this.mainCollection,
                name: "setacc2fa",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    "account": this.name,
                    "pubkey": publicKey,
                    "unlock_duration": 0,
                    "features": features
                },
            },
        ];
    }
    removeAuthSettings() {
        return [
            {
                account: this.mainCollection,
                name: "rmacc2fa",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    "account": this.name,
                },
            },
        ];
    }

    async verify2fa(isRequired, signature, timestamp) {
        if (isRequired) {
            if (!!this.backupKey) {
                this.signPrivatekey()
            } else {
                await this.verifyOtp()
            }

            return [
                {
                    account: this.mainCollection,
                    name: "verify2fa",
                    authorization: [{ actor: this.name, permission: "active" }],
                    data: {
                        "account": this.name,
                        "sig": signature || this.signature,
                        "timestamp": timestamp || this.timestamp
                    },
                },
            ];
        } return []
    }

    /**
     * 
     * @param {*} verify2faAction 
     * @param {*} mainAction 
     * @returns 
     */
    async authRequiredTransaction(verify2fa, mainAction = []) {
        const verify2faAction = await verify2fa
        const actions = JSON.parse(JSON.stringify(verify2faAction.concat(mainAction), getCircularReplacer()))
        console.log(actions)
        return await this.__transact(actions)
    }


    // Building section
    async getBuildingConfig() {
        let { rows } = await this.rpc.get_table_rows({
            table: "bldconf",
            limit: 100,
            code: this.mainCollection,
            scope: this.mainCollection,
        });

        return rows;
    }
    async getUsingBuilding() {
        let { rows } = await this.rpc.get_table_rows({
            code: this.mainCollection,
            scope: this.mainCollection,
            table: "buildings",
            lower_bound: this.name,
            upper_bound: this.name,
            index_position: 2,
            key_type: "i64",
            limit: "100",
        });
        return rows;
    }
    async claimBuilding(asset_id) {
        let actions = [
            {
                account: this.mainCollection,
                name: "bldclaim",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    "owner": this.name,
                    "asset_id": asset_id
                },
            },
        ];
        console.log("claim", actions);
        return await this.__transact(actions);
    }

    ticketAction(ticket_id) {
        if (ticket_id === 0) return []
        return [
            {
                account: "atomicassets",
                name: "transfer",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    to: this.mainCollection,
                    asset_ids: [ticket_id],
                    memo: `apply_ticket`,
                },
            },
        ];
    }

    craftBuilding(template_id, ticket_id) {
        return this.ticketAction(ticket_id).concat([
            {
                account: this.mainCollection,
                name: "mintbld",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    new_owner: this.name,
                    template_id: template_id,
                },
            },
        ]);
    }
    // Refund Section

    async getRefundItem() {
        let { rows } = await this.__getTableRows({
            code: refundContract.main,
            scope: refundContract.main,
            table: "retake",
            lower_bound: this.name,
            upper_bound: this.name,
            index_position: 1,
            key_type: "i64",
            limit: "100",
        });
        return rows;
    }
    async getRefund(assetArr) {
        let actions = []
        assetArr.forEach((chunk) => {
            actions.push({
                account: "atomicassets",
                name: "transfer",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    to: refundContract.main,
                    asset_ids: chunk,
                    memo: "refund",
                },
            })
        })

        return await this.__transact(actions);
    }

    async addGadget(asset_id, Type, template_id) {
        var tool_durability = 200;
        switch (parseInt(template_id)) {
            case 446583: tool_durability = 200; break; // Oxygen Jar
            case 446585: tool_durability = 3500; break; // Oxygen Tank
            case 446584: tool_durability = 1400; break; // Oxygen Backpack

            case 411903: tool_durability = 2550; break; // Asteroid Drone
            case 411902: tool_durability = 600; break; // 	Asteroid Dissolver
            case 411906: tool_durability = 100; break; // Asteroid Scanner
            case 438433: tool_durability = 250; break; // 	Asteroid Clever

            case 411924: tool_durability = 2500; break; // 	Plasma Ionizer
            case 411923: tool_durability = 250; break; // Plasma Collector

        }
        let actions = [
            {
                account: this.mainCollection,
                name: "addgadget",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    asset_id: asset_id,
                    owner: this.name,
                    type: Type,
                    template_id: template_id,
                    durability: tool_durability, 
                    current_durability: tool_durability, 
                    next_availability: 0,
                },
            },
        ];
        return await this.__transact(actions);
    }

    async detachGadget(asset_id) {
        let actions = [
            {
                account: this.mainCollection,
                name: "detachgadget",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    asset_id: asset_id,
                    owner: this.name,
                },
            },
        ];
        return await this.__transact(actions);
    }

    // Tool Section
    async getUsingItems() {
        let { rows } = await this.__getTableRows({
            code: this.mainCollection,
            scope: this.mainCollection,
            table: "gadgets",
            lower_bound: this.name,
            upper_bound: this.name,
            index_position: 2, // No commenting doesn't work. :(
            key_type: "i64",
            limit: "100",
        });

        return rows;
    }
    async getItems(template_blacklist) {
        let items = await this.aapi.getAssets({

            // template_blacklist: template_blacklist,  // updated by   original: no commenting
            limit: 1000,
            collection_name: 'galaxyminerx', //this.mainCollection,  // updated by
            owner: this.name,
        });
        return items;
    }

    async getItemsBySchema(schema_name, limit) {
        let items = await this.aapi.getAssets({
            limit: limit || 100,
            collection_name: this.mainCollection,
            owner: this.name,
            schema_name: schema_name
        });
        return items;
    }
    async getItemsByTemplate(template_id) {
        let items = await this.aapi.getAssets({
            limit: 100,
            collection_name: this.mainCollection,
            owner: this.name,
            template_id: template_id
        });
        return items;
    }
    async getTemplates(schema_name) {
        let items = await this.aapi.getTemplates({
            limit: 100,
            schema_name: schema_name,
            collection_name: this.mainCollection,
        });
        return items;
    }
    async getTemplaasds() {
        let items = await this.aapi.getTemplates({
            limit: 100,
            owner: this.name,
            collection_name: this.mainCollection,
        });
        return items;
    }
    async countAssetByTemplate(template_id) {
        let items = await this.aapi.countAssets({
            collection_name: this.mainCollection,
            owner: this.name,
            template_id: template_id
        });
        return items;
    }
    async countAssetBySchema(schema_name) {
        let items = await this.aapi.countAssets({
            collection_name: this.mainCollection,
            owner: this.name,
            schema_name: schema_name
        });
        return items;
    }
    async getEquipConfigs() {
        let { rows } = await this.rpc.get_table_rows({
            table: "configtools",
            limit: 100,
            code: this.mainCollection,
            scope: this.mainCollection,
        });
        return rows;
    }
    // Animal Section
    async getUsingAnimals() {
        let { rows } = await this.__getTableRows({
            code: this.mainCollection,
            scope: this.mainCollection,
            table: "animals",
            lower_bound: this.name,
            upper_bound: this.name,
            index_position: 2,
            key_type: "i64",
            limit: "100",
        });

        return rows;
    }

    async feedAnimal(animal, oxygen) {

        let actions = [
            {
                account: "atomicassets",
                name: "transfer",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    to: this.mainCollection,
                    asset_ids: [oxygen],
                    memo: `feed_animal:${animal}`,
                },
            },
        ];
        return await this.__transact(actions);
    }
    async careAnimal(asset_id) {

        let actions = [
            {
                account: this.mainCollection,
                name: "anmclaim",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    "owner": this.name,
                    "animal_id": asset_id
                },
            },
        ];
        return await this.__transact(actions);
    }

    async getAnimalsConf() {
        let { rows } = await this.rpc.get_table_rows({
            table: "anmconf",
            limit: 100,
            code: this.mainCollection,
            scope: this.mainCollection,
        });

        return rows;
    }

    // Breeding Section

    async breedingStart(dad, mother) {
        let actions = [
            {
                account: this.mainCollection,
                name: "brdstart",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    "owner": this.name,
                    "bearer_id": mother,
                    "partner_id": dad
                },
            },
        ];
        return await this.__transact(actions);
    }

    async breedingClaim(dad, mother, oxygen) {
        let actions = [
            {
                account: "atomicassets",
                name: "transfer",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    to: this.mainCollection,
                    asset_ids: [oxygen],
                    memo: `breed_animal:${mother},${dad}`,
                },
            },
        ];
        return await this.__transact(actions);
    }
    async breedingCancel(asset_id) {
        let actions = [
            {
                account: this.mainCollection,
                name: "unbreed",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    "owner": this.name,
                    "bearer_id": asset_id
                },
            },
        ];
        return await this.__transact(actions);
    }
    async getBreedingConf() {
        let { rows } = await this.rpc.get_table_rows({
            table: "breedconf",
            limit: 100,
            code: this.mainCollection,
            scope: this.mainCollection,
        });

        return rows;
    }
    async getBreedings() {
        let { rows } = await this.__getTableRows({
            code: this.mainCollection,
            scope: this.mainCollection,
            table: "breedings",
            lower_bound: this.name,
            upper_bound: this.name,
            index_position: 2,
            key_type: "i64",
            limit: "100",
        });

        return rows;
    }
    // Market Section
    marketBuy(template_id, quantity) {
        return [
            {
                account: this.mainCollection,
                name: "mktbuy",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    "owner": this.name,
                    "template_id": template_id,
                    "quantity": quantity
                },
            },
        ];
    }

    async getMarketConf() {
        let { rows } = await this.rpc.get_table_rows({
            table: "configmarket",
            limit: 100,
            code: this.mainCollection,
            scope: this.mainCollection,
        });

        return rows;
    }
    // Plant Section
    async cropClaim(asset_id) {
        let actions = [
            {
                account: this.mainCollection,
                name: "cropclaim",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    "owner": this.name,
                    "crop_id": asset_id
                },
            },
        ];
        return await this.__transact(actions);
    }


    async getPlantsConfig() {
        let { rows } = await this.rpc.get_table_rows({
            table: "cropconf",
            limit: 100,
            code: this.mainCollection,
            scope: this.mainCollection,
        });

        return rows;
    }


    async getUsingPlants() {
        let { rows } = await this.__getTableRows({
            code: this.mainCollection,
            scope: this.mainCollection,
            table: "crops",
            lower_bound: this.name,
            upper_bound: this.name,
            index_position: 2,
            key_type: "i64",
            limit: "100",
        });

        return rows;
    }

    // Referral Section
    async getReferral(referral) {
        let { rows } = await this.__getTableRows({
            code: this.mainCollection,
            scope: this.mainCollection,
            table: "friends",
            lower_bound: referral,
            upper_bound: referral,
            index_position: 1,
            key_type: "i64",
            limit: "100",
        });

        return rows;
    }
    async checkReferral(referral) {
        const data = await this.getReferral(referral);
        if (data[0]?.is_active === 1)
            return true;
        return false;
    }
    async register(referral, permission = "active") {
        const isValid = await this.checkReferral(referral)
        let send_referral = isValid ? referral : ''

        let actions = [
            {
                account: this.mainCollection,
                name: "addplayer",
                authorization: [{ actor: this.name, permission: permission }],
                data: {
                    owner: this.name,
                    referral_partner: send_referral
                },
            },
        ];
        return await this.__transact(actions);
    }

    // async register(referral) {
    //     const isValid = await this.checkReferral(referral)
    //     let send_referral = isValid ? referral : ''

    //     let actions = [
    //         {
    //             account: this.mainCollection,
    //             name: "addplayer",
    //             authorization: [{ actor: this.name, permission: "active" }],
    //             data: {
    //                 owner: this.name,
    //                 referral_partner: send_referral
    //             },
    //         },
    //     ];
    //     return await this.__transact(actions);
    // }

    async getAccountToken() {

        if (!(this.name.includes(".wam") || this.name.includes(".waa")))
            return true

        let { rows } = await this.__getTableRows({
            code: "wallet.wax",
            scope: this.name,
            table: "tokens",
            limit: "100",
        });

        return rows;
    }



    async setAccountTokens(_oldToken) {
        let oldToken = []
        _oldToken.forEach(token => {
            oldToken.push({
                account: 'wallet.wax',
                name: "tokenremove",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    token_id: token
                },
            })
        })
        let newToken = [{
            account: 'wallet.wax',
            name: "tokenset",
            authorization: [{ actor: this.name, permission: "active" }],
            data: {
                from: this.name,
                contract: 'galaxytoken',
                token: '4,' + token.plasma.type,
                displayname: token.plasma.type,
                image: token.plasma.image,
            },
        }, {
            account: 'wallet.wax',
            name: "tokenset",
            authorization: [{ actor: this.name, permission: "active" }],
            data: {
                from: this.name,
                contract: 'galaxytoken',
                token: '4,' + token.asteroid.type,
                displayname: token.asteroid.type,
                image: token.asteroid.image,
            },
        }, {
            account: 'wallet.wax',
            name: "tokenset",
            authorization: [{ actor: this.name, permission: "active" }],
            data: {
                from: this.name,
                contract: 'galaxytoken',
                token: '4,' + token.oxygen.type,
                displayname: token.oxygen.type,
                image: token.oxygen.image,
            },
        }]
        let actions = oldToken.concat(newToken)
        return await this.__transact(actions);
    }

    async getWaxAccount() {
        let account = { account_name: this.name };
        let response = await fetch(('https://chain.wax.io/v1/chain/get_account'), { // mainnet
        // let response = await fetch(('https://chain-test.wax.io/v1/chain/get_account'), { // testnet
            method: "POST",
            body: JSON.stringify(account)
        });
        return response.json();;
    }
    // Buy RAM
    async buyRam(amount) {

        let actions = [
            {
                account: "eosio",
                name: "buyram",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    payer: this.name,
                    receiver: this.name,
                    quant: parseFloat(amount).toFixed(8) + " WAX",
                },
            },
        ];
        console.log("buyram", actions)
        return await this.__transact(actions);
    }

    //NBuy CPU, NET
    async buyCpuNet(amount) {
        let cpu = 0
        let net = 0

        if (amount.net) {
            net = amount.net
        }
        if (amount.net) {
            cpu = amount.cpu
        }
        let actions = [
            {
                account: "eosio",
                name: "delegatebw",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    receiver: this.name,
                    stake_net_quantity: parseFloat(net).toFixed(8) + " WAX",
                    stake_cpu_quantity: parseFloat(cpu).toFixed(8) + " WAX",
                    transfer: false
                },
            },
        ];
        console.log("buyCpuNet", actions)
        return await this.__transact(actions);
    }



    mbsCraft(template) {

        return [
            {
                account: "atomicassets",
                name: "transfer",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    to: this.mainCollection,
                    asset_ids: template.coins_id,
                    memo: `mint_membership:${template.name}`,
                },
            },
        ];
    }

    async craftMe(template) {
        let { img } = template;

        let actions = [
            {
                account: this.mainCollection,
                name: "tassetmint",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    owner: this.name,
                    memo: `${img}`,
                },
            },
        ];

        return await this.__transact(actions);
    }

    craft(template, ticket_id) {
        let { template_name } = template;


        return this.ticketAction(ticket_id).concat([
            {
                account: this.mainCollection,
                name: "tassetmint",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    owner: this.name,
                    memo: `${template_name}`,
                },
            },
        ]);
    }

    async repair(itemId) {
        let actions = [
            {
                account: this.mainCollection,
                name: "repair",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    asset_owner: this.name,
                    asset_id: itemId,
                },
            },
        ];
        return await this.__transact(actions);
    }

    async recover(oxygen) {
        let actions = [
            {
                account: this.mainCollection,
                name: "recover",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    owner: this.name,
                    energy_recovered: oxygen * 10,
                },
            },
        ];
        return await this.__transact(actions);
    }

    async stake(asset_id, Type, template_id) {
        // var tool_durability = 200;
        // switch (parseInt(template_id)) {
        //     case 446583: tool_durability = 200; break; // Oxygen Jar
        //     case 446585: tool_durability = 3500; break; // Oxygen Tank
        //     case 446584: tool_durability = 1400; break; // Oxygen Backpack

        //     case 411903: tool_durability = 2550; break; // Asteroid Drone
        //     case 411902: tool_durability = 600; break; // 	Asteroid Dissolver
        //     case 411906: tool_durability = 100; break; // Asteroid Scanner
        //     case 438433: tool_durability = 250; break; // 	Asteroid Clever

        //     case 411924: tool_durability = 2500; break; // 	Plasma Ionizer
        //     case 411923: tool_durability = 250; break; // Plasma Collector
        // }
        
        let actions = [
            {
                account: "atomicassets",
                name: "transfer",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    to: this.mainCollection,
                    asset_ids: [asset_id],
                    memo: Type + "--" + template_id,
                },
            },
            // {
            //     account: this.mainCollection,
            //     name: "addgadget",
            //     authorization: [{ actor: this.name, permission: "active" }],
            //     data: {
            //         asset_id: asset_id,
            //         owner: this.name,
            //         type: Type,
            //         template_id: template_id,
            //         durability: tool_durability, 
            //         current_durability: tool_durability, 
            //         next_availability: 0,
            //     },
            // },
        ];
        return await this.__transact(actions);
    }

    async unstakesimple(itemId) {
        let actions = [
            {
                account: "atomicassets",
                name: "transfer",
                authorization: [{ actor: this.mainCollection, permission: "active" }],
                data: {
                    from: this.mainCollection,
                    to: this.name,
                    asset_ids: [itemId],
                    memo: `unstakesimple`,
                },
            },
        ];
        return await this.__transact(actions);
    }



    mbsUnstake(itemId) {
        return [
            {
                account: this.mainCollection,
                name: "mbsunstake",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    asset_owner: this.name,
                    asset_id: itemId,
                },
            },
        ];
    }

    unstake(itemId) {
        return [
            {
                account: this.mainCollection,
                name: "unstake",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    asset_owner: this.name,
                    asset_id: itemId,
                },
            },
        ];
    }

    async mine(itemId, img) {
        let actions = [
            {
                account: this.mainCollection,
                name: "claim",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    asset_owner: this.name,
                    asset_id: parseInt(itemId),
                    img: img
                },
            },

        ];
        return await this.__transact(actions);
    }

    async mbsClaim(itemId) {
        let actions = [
            {
                account: this.mainCollection,
                name: "mbsclaim",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    owner: this.name,
                    asset_id: itemId,
                },
            }
        ];
        return await this.__transact(actions);
    }

    async deposit(plasma, oxygen, asteroid) {
        let list = [
            { name: PLASMA_COIN, value: plasma },
            { name: OXYGEN_COIN, value: oxygen },
            { name: ASTEROID_COIN, value: asteroid },
        ];

        let quantities = list
            .filter((item) => item.value > 0)
            .map((item) => `${parseFloat(item.value).toFixed(4)} ${item.name}`);

        let actions = [
            {
                account: this.mintCollection,
                name: "transfers",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    to: this.mainCollection,
                    quantities: quantities,
                    memo: "deposit",
                },
            },
            // {
            //     account: this.mainCollection,
            //     name: "transfers",
            //     authorization: [{ actor: this.name, permission: "active" }],
            //     data: {
            //         from: this.name,
            //         to: this.mainCollection,
            //         quantities: quantities,
            //         memo: "deposit",
            //     },
            // },
        ];

        return await this.__transact(actions);
    }

    async depositMe(plasma, oxygen, asteroid) {
        let list = [
            { name: PLASMA_COIN, value: plasma },
            { name: OXYGEN_COIN, value: oxygen },
            { name: ASTEROID_COIN, value: asteroid },
        ];

        let quantities = list
            .filter((item) => item.value > 0)
            .map((item) => `${parseFloat(item.value).toFixed(4)} ${item.name}`);

        let actions = [
            {
                account: this.mainCollection,
                name: "transfers",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    to: this.mainCollection,
                    quantities: quantities,
                    memo: "deposit",
                },
            },
        ];

        return await this.__transact(actions);
    }

    async withdrawMe(plasma, oxygen, asteroid, fee) {
        let list = [
            { name: PLASMA_POINT, value: plasma },
            { name: OXYGEN_POINT, value: oxygen },
            { name: ASTEROID_POINT, value: asteroid },
        ];
        let quantities = list
            .filter((item) => item.value > 0)
            .map((item) => `${parseFloat(item.value).toFixed(4)} ${item.name}`);

        let actions = [
            {
                account: this.mainCollection,
                name: "withdraw",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    owner: this.name,
                    quantities: quantities,
                    fee: fee
                },
            },
        ];
        return await this.__transact(actions);
    }

    withdraw(plasma, oxygen, asteroid, fee) {
        let list = [
            { name: PLASMA_POINT, value: plasma },
            { name: OXYGEN_POINT, value: oxygen },
            { name: ASTEROID_POINT, value: asteroid },
        ];
        let quantities = list
            .filter((item) => item.value > 0)
            .map((item) => `${parseFloat(item.value).toFixed(4)} ${item.name}`);

        let actions = [
            {
                account: this.mainCollection,
                name: "withdraw",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    owner: this.name,
                    quantities: quantities,
                    fee: fee
                },
            },
        ];
        return actions;
    }

    async openPack(itemId, name) {
        let actions = [
            {
                account: "atomicassets",
                name: "transfer",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    to: this.mainCollection,
                    asset_ids: [itemId],
                    memo: "openpack",
                },
            },
            // {
            //     account: "atomicassets",
            //     name: "burnasset",
            //     authorization: [{ actor: this.name, permission: "active" }],
            //     data: {
            //         asset_id: itemId,
            //         asset_owner: this.mainCollection,
            //     },
            // },
            // {
            //     account: this.mainCollection,
            //     name: "logopenpack",
            //     authorization: [{ actor: this.name, permission: "active" }],
            //     data: {
            //         owner: this.name,
            //         asset_id: itemId,
            //         asset_name: name,
            //     },
            // },
        ];

        return await this.__transact(actions)
    }
    // Exchange Rewards
    exchangeRewards(asset_id) {

        return [

            {
                account: "atomicassets",
                name: "transfer",
                authorization: [{ actor: this.name, permission: "active" }],
                data: {
                    from: this.name,
                    to: this.mainCollection,
                    asset_ids: [asset_id],
                    memo: "burn",
                }

            }

        ];
    }
    async getExchangeConf(referral) {
        let { rows } = await this.__getTableRows({
            code: this.mainCollection,
            scope: this.mainCollection,
            table: "configitem",
            lower_bound: referral,
            upper_bound: referral,
            index_position: 1,
            key_type: "i64",
            limit: "100",
        });

        return rows;
    }

    async getConfig() {
        let { rows } = await this.__getTableRows({
            code: this.mainCollection,
            scope: this.mainCollection,
            table: "setting",
            limit: "1",
        });

        return rows;
    }
    async getTransaction(id, server) {

        let { data } = await axios.get(server, { params: { id: id } });
        return data;
    }
    async __transact(actions, isBroadcast = true) {
        // return await this.api.transact({ actions }, { blocksBehind: 3, expireSeconds: 90 })
        try {
            if (!!this.anchorSession) {
                const tx = await this.anchorSession.transact({ actions }, { blocksBehind: 3, expireSeconds: 90, broadcast: isBroadcast, sign: true })
                const { transaction_id } = tx
                return {
                    serializedTransaction: this.api.serializeTransaction(JSON.parse(JSON.stringify(tx.transaction))),
                    signatures: tx.signatures,
                    transaction: tx,
                    transaction_id: transaction_id
                };
            }
            else
                return await this.api.transact({ actions }, { blocksBehind: 3, expireSeconds: 90, broadcast: isBroadcast, sign: true })
        } catch (e) {
            if (e instanceof RpcError)
                throw (JSON.stringify(e.json, null, 2));
            else
                throw (e)
        }




    }

    async __getTableRows(options) {
        return await this.rpc.get_table_rows({
            json: true,
            ...options,
            reverse: false,
            show_payer: false,
        });
    }
}

