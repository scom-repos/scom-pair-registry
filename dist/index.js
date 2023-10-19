var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-pair-registry/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let moduleDir = components_1.application.currentModuleDir;
    function fullPath(path) {
        if (path.indexOf('://') > 0)
            return path;
        return `${moduleDir}/${path}`;
    }
    exports.default = {
        fullPath
    };
});
define("@scom/scom-pair-registry/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-pair-registry/store/core.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.coreAddress = void 0;
    exports.coreAddress = {
        56: {
            OSWAP_RestrictedFactory: "0x91d137464b93caC7E2c2d4444a9D8609E4473B70",
            OSWAP_HybridRouterRegistry: "0xcc44c3617e46b2e946d61499ff8f4cda721ff178"
        },
        97: {
            OSWAP_RestrictedFactory: "0xa158FB71cA5EF59f707c6F8D0b9CC5765F97Fd60",
            OSWAP_HybridRouterRegistry: "0x8e5Afed779B56888ca267284494f23aFe158EA0B"
        },
        137: {
            OSWAP_RestrictedFactory: "0xF879576c2D674C5D22f256083DC8fD019a3f33A1",
            OSWAP_HybridRouterRegistry: "0x728DbD968341eb7aD11bDabFE775A13aF901d6ac"
        },
        80001: {
            OSWAP_RestrictedFactory: "0x6D2b196aBf09CF97612a5c062bF14EC278F6D677",
            OSWAP_HybridRouterRegistry: "0x68C229a3772dFebD0fD51df36B7029fcF75424F7"
        },
        43113: {
            OSWAP_RestrictedFactory: "0x6C99c8E2c587706281a5B66bA7617DA7e2Ba6e48",
            OSWAP_HybridRouterRegistry: "0xCd370BBbC84AB66a9e0Ff9F533E11DeC87704736"
        },
        43114: {
            OSWAP_RestrictedFactory: "0x739f0BBcdAd415127FE8d5d6ED053e9D817BdAdb",
            OSWAP_HybridRouterRegistry: "0xEA6A56086e66622208fa8e7B743Bad3FF47aD40c"
        },
        42161: {
            OSWAP_RestrictedFactory: "0x408aAf94BD851eb991dA146dFc7C290aA42BA70f",
            OSWAP_HybridRouterRegistry: "0xD5f2e1bb65d7AA483547D1eDF1B59edCa296F6D3"
        },
        421613: {
            OSWAP_RestrictedFactory: "0x6f641f4F5948954F7cd675f3D874Ac60b193bA0d",
            OSWAP_HybridRouterRegistry: "0x7422408d5211a512f18fd55c49d5483d24c9ed6a"
        }
    };
});
define("@scom/scom-pair-registry/store/utils.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-network-list", "@scom/scom-pair-registry/store/core.ts"], function (require, exports, components_2, eth_wallet_1, scom_network_list_1, core_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isClientWalletConnected = exports.State = void 0;
    class State {
        constructor(options) {
            this.infuraId = '';
            this.rpcWalletId = '';
            this.networkMap = (0, scom_network_list_1.default)();
            this.initData(options);
        }
        initData(options) {
            if (options.infuraId) {
                this.infuraId = options.infuraId;
            }
            if (options.networks) {
                this.setNetworkList(options.networks, options.infuraId);
            }
        }
        initRpcWallet(defaultChainId) {
            if (this.rpcWalletId) {
                return this.rpcWalletId;
            }
            const clientWallet = eth_wallet_1.Wallet.getClientInstance();
            const networkList = Object.values(components_2.application.store?.networkMap || []);
            const instanceId = clientWallet.initRpcWallet({
                networks: networkList,
                defaultChainId,
                infuraId: components_2.application.store?.infuraId,
                multicalls: components_2.application.store?.multicalls
            });
            this.rpcWalletId = instanceId;
            if (clientWallet.address) {
                const rpcWallet = eth_wallet_1.Wallet.getRpcWalletInstance(instanceId);
                rpcWallet.address = clientWallet.address;
            }
            return instanceId;
        }
        getRpcWallet() {
            return this.rpcWalletId ? eth_wallet_1.Wallet.getRpcWalletInstance(this.rpcWalletId) : null;
        }
        isRpcWalletConnected() {
            const wallet = this.getRpcWallet();
            return wallet?.isConnected;
        }
        getChainId() {
            const rpcWallet = this.getRpcWallet();
            return rpcWallet?.chainId;
        }
        setNetworkList(networkList, infuraId) {
            const wallet = eth_wallet_1.Wallet.getClientInstance();
            this.networkMap = {};
            const defaultNetworkList = (0, scom_network_list_1.default)();
            const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
                acc[cur.chainId] = cur;
                return acc;
            }, {});
            for (let network of networkList) {
                const networkInfo = defaultNetworkMap[network.chainId];
                if (!networkInfo)
                    continue;
                if (infuraId && network.rpcUrls && network.rpcUrls.length > 0) {
                    for (let i = 0; i < network.rpcUrls.length; i++) {
                        network.rpcUrls[i] = network.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
                    }
                }
                this.networkMap[network.chainId] = {
                    ...networkInfo,
                    ...network
                };
                wallet.setNetworkInfo(this.networkMap[network.chainId]);
            }
        }
        getAddresses(chainId) {
            return core_1.coreAddress[chainId || this.getChainId()];
        }
    }
    exports.State = State;
    function isClientWalletConnected() {
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isClientWalletConnected = isClientWalletConnected;
});
define("@scom/scom-pair-registry/store/index.ts", ["require", "exports", "@scom/scom-pair-registry/store/utils.ts", "@scom/scom-pair-registry/store/core.ts"], function (require, exports, utils_1, core_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-pair-registry/store/index.ts'/> 
    __exportStar(utils_1, exports);
    __exportStar(core_2, exports);
});
define("@scom/scom-pair-registry/formSchema.ts", ["require", "exports", "@scom/scom-network-picker"], function (require, exports, scom_network_picker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const chainIds = [1, 56, 137, 250, 97, 80001, 43113, 43114, 42161, 421613];
    const networks = chainIds.map(v => { return { chainId: v }; });
    exports.default = {
        dataSchema: {
            type: 'object',
            properties: {
                networks: {
                    type: 'array',
                    required: true,
                    items: {
                        type: 'object',
                        properties: {
                            chainId: {
                                type: 'number',
                                enum: chainIds,
                                required: true
                            }
                        }
                    }
                },
            }
        },
        uiSchema: {
            type: 'VerticalLayout',
            elements: [
                {
                    type: 'Control',
                    scope: '#/properties/networks',
                    options: {
                        detail: {
                            type: 'VerticalLayout'
                        }
                    }
                }
            ]
        },
        customControls() {
            return {
                '#/properties/networks/properties/chainId': {
                    render: () => {
                        const networkPicker = new scom_network_picker_1.default(undefined, {
                            type: 'combobox',
                            networks
                        });
                        return networkPicker;
                    },
                    getData: (control) => {
                        return control.selectedNetwork?.chainId;
                    },
                    setData: (control, value) => {
                        control.setNetworkByChainId(value);
                    }
                }
            };
        }
    };
});
define("@scom/scom-pair-registry/data.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-pair-registry/data.json.ts'/> 
    exports.default = {
        "defaultBuilderData": {
            "defaultChainId": 43113,
            "networks": [
                {
                    "chainId": 43113
                },
                {
                    "chainId": 43114
                },
                {
                    "chainId": 97
                },
                {
                    "chainId": 56
                },
                {
                    "chainId": 421613
                },
                {
                    "chainId": 42161
                }
            ],
            "wallets": [
                {
                    "name": "metamask"
                }
            ]
        }
    };
});
define("@scom/scom-pair-registry/api.ts", ["require", "exports", "@scom/oswap-openswap-contract", "@scom/scom-token-list", "@scom/scom-pair-registry/store/index.ts"], function (require, exports, oswap_openswap_contract_1, scom_token_list_1, store_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isPairRegistered = exports.getPair = exports.doRegisterPair = exports.getWETH = void 0;
    const getWETH = (chainId) => {
        let wrappedToken = scom_token_list_1.WETHByChainId[chainId];
        return wrappedToken;
    };
    exports.getWETH = getWETH;
    const mapTokenObjectSet = (chainId, obj) => {
        const WETH9 = (0, exports.getWETH)(chainId);
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (!obj[key]?.address)
                    obj[key] = WETH9;
            }
        }
        return obj;
    };
    async function doRegisterPair(state, token0, token1) {
        //register group queue pair to HybridRouterRegistry
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        try {
            const core = store_1.coreAddress[chainId];
            if (!core)
                throw new Error(`This chain (${chainId}) is not supported`);
            const registry = new oswap_openswap_contract_1.Contracts.OSWAP_HybridRouterRegistry(wallet, core.OSWAP_HybridRouterRegistry);
            const receipt = await registry.registerPairByTokensV3({
                factory: core.OSWAP_RestrictedFactory,
                token0,
                token1,
                pairIndex: 0
            });
            return receipt;
        }
        catch (error) {
            console.log("doRegisterPair", error);
        }
    }
    exports.doRegisterPair = doRegisterPair;
    async function getPair(state, tokenA, tokenB) {
        let pairAddress = '';
        try {
            const wallet = state.getRpcWallet();
            const chainId = state.getChainId();
            let tokens = mapTokenObjectSet(chainId, { tokenA, tokenB });
            let params = { param1: tokens.tokenA.address, param2: tokens.tokenB.address };
            let factoryAddress = store_1.coreAddress[chainId].OSWAP_RestrictedFactory;
            let groupQ = new oswap_openswap_contract_1.Contracts.OSWAP_RestrictedFactory(wallet, factoryAddress);
            pairAddress = await groupQ.getPair({ ...params, param3: 0 });
        }
        catch (err) {
            console.error(err);
        }
        return pairAddress;
    }
    exports.getPair = getPair;
    async function isPairRegistered(state, pairAddress) {
        let isRegistered = false;
        try {
            const wallet = state.getRpcWallet();
            const chainId = state.getChainId();
            const core = store_1.coreAddress[chainId];
            const registry = new oswap_openswap_contract_1.Contracts.OSWAP_HybridRouterRegistry(wallet, core.OSWAP_HybridRouterRegistry);
            const { token0, token1 } = await registry.getPairTokens([pairAddress]);
            isRegistered = token0.length > 0 && token1.length > 0;
        }
        catch (err) {
            console.error(err);
        }
        return isRegistered;
    }
    exports.isPairRegistered = isPairRegistered;
});
define("@scom/scom-pair-registry", ["require", "exports", "@ijstech/components", "@scom/scom-pair-registry/assets.ts", "@scom/scom-pair-registry/store/index.ts", "@scom/scom-pair-registry/formSchema.ts", "@scom/scom-pair-registry/data.json.ts", "@ijstech/eth-wallet", "@scom/scom-token-list", "@scom/scom-pair-registry/api.ts"], function (require, exports, components_3, assets_1, store_2, formSchema_1, data_json_1, eth_wallet_2, scom_token_list_2, api_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_3.Styles.Theme.ThemeVars;
    let ScomPairRegistry = class ScomPairRegistry extends components_3.Module {
        get chainId() {
            return this.state.getChainId();
        }
        get defaultChainId() {
            return this._data.defaultChainId;
        }
        set defaultChainId(value) {
            this._data.defaultChainId = value;
        }
        get wallets() {
            return this._data.wallets ?? [];
        }
        set wallets(value) {
            this._data.wallets = value;
        }
        get networks() {
            return this._data.networks ?? [];
        }
        set networks(value) {
            this._data.networks = value;
        }
        get showHeader() {
            return this._data.showHeader ?? true;
        }
        set showHeader(value) {
            this._data.showHeader = value;
        }
        constructor(parent, options) {
            super(parent, options);
            this._data = {
                wallets: [],
                networks: []
            };
            this.tag = {};
            this.isReadyToRegister = false;
            this.initWallet = async () => {
                try {
                    await eth_wallet_2.Wallet.getClientInstance().init();
                    const rpcWallet = this.state.getRpcWallet();
                    await rpcWallet.init();
                }
                catch (err) {
                    console.log(err);
                }
            };
            this.initializeWidgetConfig = async () => {
                setTimeout(async () => {
                    const chainId = this.chainId;
                    await this.initWallet();
                    if (!(0, store_2.isClientWalletConnected)()) {
                        this.btnRegister.caption = "Connect Wallet";
                        this.btnRegister.enabled = true;
                    }
                    else if (!this.state.isRpcWalletConnected()) {
                        this.btnRegister.caption = "Switch Network";
                        this.btnRegister.enabled = true;
                    }
                    else {
                        this.btnRegister.caption = "Register";
                        this.btnRegister.enabled = this.isReadyToRegister;
                    }
                    this.fromTokenInput.chainId = chainId;
                    this.toTokenInput.chainId = chainId;
                    const tokens = scom_token_list_2.tokenStore.getTokenList(chainId);
                    this.fromTokenInput.tokenDataListProp = tokens;
                    this.toTokenInput.tokenDataListProp = tokens;
                });
            };
            this.showResultMessage = (status, content) => {
                if (!this.txStatusModal)
                    return;
                let params = { status };
                if (status === 'success') {
                    params.txtHash = content;
                }
                else {
                    params.content = content;
                }
                this.txStatusModal.message = { ...params };
                this.txStatusModal.showModal();
            };
            this.connectWallet = async () => {
                if (!(0, store_2.isClientWalletConnected)()) {
                    if (this.mdWallet) {
                        await components_3.application.loadPackage('@scom/scom-wallet-modal', '*');
                        this.mdWallet.networks = this.networks;
                        this.mdWallet.wallets = this.wallets;
                        this.mdWallet.showModal();
                    }
                    return;
                }
                if (!this.state.isRpcWalletConnected()) {
                    const clientWallet = eth_wallet_2.Wallet.getClientInstance();
                    await clientWallet.switchNetwork(this.chainId);
                }
            };
            this.state = new store_2.State(data_json_1.default);
        }
        removeRpcWalletEvents() {
            const rpcWallet = this.state.getRpcWallet();
            if (rpcWallet)
                rpcWallet.unregisterAllWalletEvents();
        }
        onHide() {
            this.dappContainer.onHide();
            this.removeRpcWalletEvents();
        }
        isEmptyData(value) {
            return !value || !value.networks || value.networks.length === 0;
        }
        async init() {
            this.isReadyCallbackQueued = true;
            super.init();
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const networks = this.getAttribute('networks', true);
                const wallets = this.getAttribute('wallets', true);
                const defaultChainId = this.getAttribute('defaultChainId', true);
                const showHeader = this.getAttribute('showHeader', true);
                const data = {
                    networks,
                    wallets,
                    defaultChainId,
                    showHeader
                };
                if (!this.isEmptyData(data)) {
                    await this.setData(data);
                }
            }
            this.pnlLoading.visible = false;
            this.isReadyCallbackQueued = false;
            this.executeReadyCallback();
        }
        _getActions(category) {
            const actions = [];
            if (category && category !== 'offers') {
                actions.push({
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = {
                            wallets: [],
                            networks: []
                        };
                        let oldTag = {};
                        return {
                            execute: () => {
                                oldData = JSON.parse(JSON.stringify(this._data));
                                const { networks } = userInputData;
                                const themeSettings = {};
                                this._data.networks = networks;
                                this._data.defaultChainId = this._data.networks[0].chainId;
                                this.resetRpcWallet();
                                this.refreshUI();
                                if (builder?.setData)
                                    builder.setData(this._data);
                                oldTag = JSON.parse(JSON.stringify(this.tag));
                                if (builder?.setTag)
                                    builder.setTag(themeSettings);
                                else
                                    this.setTag(themeSettings);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(themeSettings);
                            },
                            undo: () => {
                                this._data = JSON.parse(JSON.stringify(oldData));
                                this.refreshUI();
                                if (builder?.setData)
                                    builder.setData(this._data);
                                this.tag = JSON.parse(JSON.stringify(oldTag));
                                if (builder?.setTag)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.tag);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(this.tag);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: formSchema_1.default.dataSchema,
                    userInputUISchema: formSchema_1.default.uiSchema,
                    customControls: formSchema_1.default.customControls()
                });
            }
            return actions;
        }
        getProjectOwnerActions() {
            const actions = [
                {
                    name: 'Settings',
                    userInputDataSchema: formSchema_1.default.dataSchema,
                    userInputUISchema: formSchema_1.default.uiSchema,
                    customControls: formSchema_1.default.customControls()
                }
            ];
            return actions;
        }
        getConfigurators() {
            return [
                {
                    name: 'Project Owner Configurator',
                    target: 'Project Owner',
                    getActions: this.getProjectOwnerActions,
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        await this.setData(data);
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: this._getActions.bind(this),
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData({ ...defaultData, ...data });
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Embedder Configurator',
                    target: 'Embedders',
                    getData: () => {
                        return { ...this._data };
                    },
                    setData: async (properties, linkParams) => {
                        let resultingData = {
                            ...properties
                        };
                        if (!properties.defaultChainId && properties.networks?.length) {
                            resultingData.defaultChainId = properties.networks[0].chainId;
                        }
                        await this.setData(resultingData);
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                }
            ];
        }
        getData() {
            return this._data;
        }
        async setData(data) {
            this._data = data;
            this.resetRpcWallet();
            await this.refreshUI();
        }
        async getTag() {
            return this.tag;
        }
        updateTag(type, value) {
            this.tag[type] = this.tag[type] ?? {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.tag[type][prop] = value[prop];
            }
        }
        setTag(value) {
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    if (prop === 'light' || prop === 'dark')
                        this.updateTag(prop, newValue[prop]);
                    else
                        this.tag[prop] = newValue[prop];
                }
            }
            if (this.dappContainer)
                this.dappContainer.setTag(this.tag);
        }
        resetRpcWallet() {
            this.removeRpcWalletEvents();
            const rpcWalletId = this.state.initRpcWallet(this.defaultChainId);
            const rpcWallet = this.state.getRpcWallet();
            const chainChangedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_2.Constants.RpcWalletEvent.ChainChanged, async (chainId) => {
                this.fromTokenInput.token = null;
                this.toTokenInput.token = null;
                this.lblRegisterPairMsg.visible = false;
                this.refreshUI();
            });
            const connectedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_2.Constants.RpcWalletEvent.Connected, async (connected) => {
                this.refreshUI();
            });
            const data = {
                defaultChainId: this.defaultChainId,
                wallets: this.wallets,
                networks: this.networks,
                showHeader: this.showHeader,
                rpcWalletId: rpcWallet.instanceId
            };
            if (this.dappContainer?.setData)
                this.dappContainer.setData(data);
        }
        async refreshUI() {
            await this.initializeWidgetConfig();
        }
        onSelectFromToken() {
            this.handleSelectToken(true);
        }
        onSelectToToken() {
            this.handleSelectToken(false);
        }
        async handleSelectToken(isFrom) {
            this.isReadyToRegister = false;
            if (!this.fromTokenInput.token || !this.toTokenInput.token)
                return;
            let fromToken = (this.fromTokenInput.token?.address || this.fromTokenInput.token?.symbol)?.toLowerCase();
            let toToken = (this.toTokenInput.token?.address || this.toTokenInput.token?.symbol)?.toLowerCase();
            if (fromToken === toToken) {
                if (isFrom) {
                    this.toTokenInput.token = null;
                }
                else {
                    this.fromTokenInput.token = null;
                }
                return;
            }
            this.fromTokenInput.tokenReadOnly = true;
            this.toTokenInput.tokenReadOnly = true;
            let pairAddress = await (0, api_1.getPair)(this.state, this.fromTokenInput.token, this.toTokenInput.token);
            if (!pairAddress) {
                this.lblRegisterPairMsg.caption = 'Pair has not been created yet.';
                this.lblRegisterPairMsg.visible = true;
            }
            else {
                let isRegistered = await (0, api_1.isPairRegistered)(this.state, pairAddress);
                if (isRegistered) {
                    this.lblRegisterPairMsg.caption = 'This pair is already registered on Hybrid Router Registry.';
                    this.lblRegisterPairMsg.visible = true;
                }
                else {
                    this.lblRegisterPairMsg.visible = false;
                    this.isReadyToRegister = true;
                }
            }
            this.fromTokenInput.tokenReadOnly = false;
            this.toTokenInput.tokenReadOnly = false;
            if ((0, store_2.isClientWalletConnected)() && this.state.isRpcWalletConnected()) {
                this.btnRegister.enabled = this.isReadyToRegister;
            }
        }
        async onRegisterPair() {
            try {
                if (!this.state.isRpcWalletConnected()) {
                    this.connectWallet();
                    return;
                }
                if (!this.fromTokenInput.token || !this.toTokenInput.token)
                    return;
                this.showResultMessage('warning', 'Registering');
                this.fromTokenInput.tokenReadOnly = true;
                this.toTokenInput.tokenReadOnly = true;
                this.btnRegister.rightIcon.spin = true;
                this.btnRegister.rightIcon.visible = true;
                const txHashCallback = async (err, receipt) => {
                    if (err) {
                        this.showResultMessage('error', err);
                    }
                    else if (receipt) {
                        this.showResultMessage('success', receipt);
                    }
                };
                const confirmationCallback = async (receipt) => {
                    this.refreshUI();
                };
                const wallet = eth_wallet_2.Wallet.getClientInstance();
                wallet.registerSendTxEvents({
                    transactionHash: txHashCallback,
                    confirmation: confirmationCallback
                });
                const WETH9 = (0, api_1.getWETH)(this.chainId);
                const fromToken = this.fromTokenInput.token.address ? this.fromTokenInput.token.address : WETH9.address || this.fromTokenInput.token.address;
                const toToken = this.toTokenInput.token.address ? this.toTokenInput.token.address : WETH9.address || this.toTokenInput.token.address;
                await (0, api_1.doRegisterPair)(this.state, fromToken, toToken);
            }
            catch (err) {
                console.error(err);
            }
            finally {
                this.fromTokenInput.tokenReadOnly = false;
                this.toTokenInput.tokenReadOnly = false;
                this.btnRegister.rightIcon.spin = false;
                this.btnRegister.rightIcon.visible = false;
            }
        }
        render() {
            return (this.$render("i-scom-dapp-container", { id: "dappContainer" },
                this.$render("i-panel", { background: { color: Theme.background.main } },
                    this.$render("i-panel", null,
                        this.$render("i-vstack", { id: "pnlLoading", class: "i-loading-overlay" },
                            this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                                this.$render("i-icon", { class: "i-loading-spinner_icon", image: { url: assets_1.default.fullPath('img/loading.svg'), width: 36, height: 36 } }),
                                this.$render("i-label", { class: "i-loading-spinner_text", caption: "Loading...", font: { color: '#FD4A4C', size: '1.5em' } }))),
                        this.$render("i-vstack", { width: "100%", height: "100%", padding: { top: "1rem", bottom: "1rem", left: "1.5rem", right: "1.5rem" } },
                            this.$render("i-label", { caption: "Register Pair on your Hybrid Router", font: { size: '1.25rem', weight: 700, color: Theme.colors.primary.main }, margin: { bottom: '2rem' } }),
                            this.$render("i-vstack", { width: "100%", height: "100%", maxWidth: 360, horizontalAlignment: "center", margin: { left: 'auto', right: 'auto' }, gap: "1.5rem" },
                                this.$render("i-hstack", { horizontalAlignment: "center", verticalAlignment: "center", wrap: 'wrap', gap: 10 },
                                    this.$render("i-scom-token-input", { id: "fromTokenInput", type: "combobox", isBalanceShown: false, isBtnMaxShown: false, isInputShown: false, border: { radius: 12 }, onSelectToken: this.onSelectFromToken.bind(this) }),
                                    this.$render("i-label", { caption: "to", font: { size: "1rem" } }),
                                    this.$render("i-scom-token-input", { id: "toTokenInput", type: "combobox", isBalanceShown: false, isBtnMaxShown: false, isInputShown: false, border: { radius: 12 }, onSelectToken: this.onSelectToToken.bind(this) })),
                                this.$render("i-label", { id: "lblRegisterPairMsg", class: "text-center", visible: false }),
                                this.$render("i-hstack", { horizontalAlignment: "center", verticalAlignment: "center", margin: { top: "0.5rem" } },
                                    this.$render("i-button", { id: "btnRegister", width: 150, caption: "Register", font: { size: '1rem', weight: 600, color: '#ffff' }, lineHeight: 1.5, background: { color: Theme.background.gradient }, padding: { top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }, border: { radius: '0.65rem' }, enabled: false, onClick: this.onRegisterPair.bind(this) }))))),
                    this.$render("i-scom-tx-status-modal", { id: "txStatusModal" }),
                    this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] }))));
        }
    };
    ScomPairRegistry = __decorate([
        (0, components_3.customElements)('i-scom-pair-registry')
    ], ScomPairRegistry);
    exports.default = ScomPairRegistry;
});
