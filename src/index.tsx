import { application, Button, Container, Control, ControlElement, customElements, Label, Module, Panel, Styles, VStack } from '@ijstech/components';
import ScomDappContainer from '@scom/scom-dapp-container';
import Assets from './assets';
import { INetworkConfig } from '@scom/scom-network-picker';
import ScomTokenInput from '@scom/scom-token-input';
import ScomWalletModal, { IWalletPlugin } from '@scom/scom-wallet-modal';
import ScomTxStatusModal from '@scom/scom-tx-status-modal';
import { IPairRegistry } from './interface';
import { isClientWalletConnected, State } from './store';
import formSchema from './formSchema';
import configData from './data.json';
import { Constants, Wallet } from '@ijstech/eth-wallet';
import { tokenStore } from '@scom/scom-token-list';
import { doRegisterPair, getPair, getWETH, isPairRegistered } from './api';
import ScomPairRegistryFlowInitialSetup from './flow/initialSetup';

const Theme = Styles.Theme.ThemeVars;

interface ScomPairRegistryElement extends ControlElement {
    lazyLoad?: boolean;
    networks: INetworkConfig[];
    wallets: IWalletPlugin[];
    defaultChainId?: number;
    showHeader?: boolean;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-pair-registry']: ScomPairRegistryElement;
        }
    }
}

@customElements('i-scom-pair-registry')
export default class ScomPairRegistry extends Module {
    private dappContainer: ScomDappContainer;
    private pnlLoading: VStack;
    private fromTokenInput: ScomTokenInput;
    private toTokenInput: ScomTokenInput;
    private lblRegisterPairMsg: Label;
    private btnRegister: Button;
    private txStatusModal: ScomTxStatusModal;
    private mdWallet: ScomWalletModal;
    private state: State;
    private _data: IPairRegistry = {
        wallets: [],
        networks: []
    };
    tag: any = {};
    private isReadyToRegister: boolean = false;

    private get chainId() {
        return this.state.getChainId();
    }

    get defaultChainId() {
        return this._data.defaultChainId;
    }

    set defaultChainId(value: number) {
        this._data.defaultChainId = value;
    }

    get wallets() {
        return this._data.wallets ?? [];
    }

    set wallets(value: IWalletPlugin[]) {
        this._data.wallets = value;
    }

    get networks() {
        return this._data.networks ?? [];
    }

    set networks(value: INetworkConfig[]) {
        this._data.networks = value;
    }

    get showHeader() {
        return this._data.showHeader ?? true;
    }

    set showHeader(value: boolean) {
        this._data.showHeader = value;
    }

    constructor(parent?: Container, options?: ControlElement) {
        super(parent, options);
        this.state = new State(configData);
    }

    removeRpcWalletEvents() {
        const rpcWallet = this.state.getRpcWallet();
        if (rpcWallet) rpcWallet.unregisterAllWalletEvents();
    }

    onHide() {
        this.dappContainer.onHide();
        this.removeRpcWalletEvents();
    }

    isEmptyData(value: IPairRegistry) {
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
            const data: IPairRegistry = {
                networks,
                wallets,
                defaultChainId,
                showHeader
            }
            if (!this.isEmptyData(data)) {
                await this.setData(data);
            }
        }
        this.pnlLoading.visible = false;
        this.isReadyCallbackQueued = false;
        this.executeReadyCallback();
    }

    private _getActions(category?: string) {
        const actions: any[] = [];
        if (category && category !== 'offers') {
            actions.push({
                name: 'Edit',
                icon: 'edit',
                command: (builder: any, userInputData: any) => {
                    let oldData: IPairRegistry = {
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
                            if (builder?.setData) builder.setData(this._data);

                            oldTag = JSON.parse(JSON.stringify(this.tag));
                            if (builder?.setTag) builder.setTag(themeSettings);
                            else this.setTag(themeSettings);
                            if (this.dappContainer) this.dappContainer.setTag(themeSettings);
                        },
                        undo: () => {
                            this._data = JSON.parse(JSON.stringify(oldData));
                            this.refreshUI();
                            if (builder?.setData) builder.setData(this._data);

                            this.tag = JSON.parse(JSON.stringify(oldTag));
                            if (builder?.setTag) builder.setTag(this.tag);
                            else this.setTag(this.tag);
                            if (this.dappContainer) this.dappContainer.setTag(this.tag);
                        },
                        redo: () => {}
                    }
                },
                userInputDataSchema: formSchema.dataSchema,
                userInputUISchema: formSchema.uiSchema,
                customControls: formSchema.customControls()
            })
        }
        return actions;
    }

    private getProjectOwnerActions() {
        const actions: any[] = [
            {
                name: 'Settings',
                userInputDataSchema: formSchema.dataSchema,
                userInputUISchema: formSchema.uiSchema,
                customControls: formSchema.customControls()
            }
        ]
        return actions;
    }

    getConfigurators() {
        return [
            {
                name: 'Project Owner Configurator',
                target: 'Project Owners',
                getActions: this.getProjectOwnerActions,
                getData: this.getData.bind(this),
                setData: async (data: any) => {
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
                setData: async (data: any) => {
                    const defaultData = configData.defaultBuilderData;
                    await this.setData({  ...defaultData, ...data });
                },
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            },
            {
                name: 'Embedder Configurator',
                target: 'Embedders',
                getData: () => {
                    return { ...this._data }
                },
                setData: async (properties: IPairRegistry, linkParams?: Record<string, any>) => {
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

    private getData() {
        return this._data;
    }

    private async setData(data: IPairRegistry) {
        this._data = data;
        this.resetRpcWallet();
        await this.refreshUI();
    }

    async getTag() {
        return this.tag;
    }

    private updateTag(type: 'light' | 'dark', value: any) {
        this.tag[type] = this.tag[type] ?? {};
        for (let prop in value) {
            if (value.hasOwnProperty(prop))
                this.tag[type][prop] = value[prop];
        }
    }

    private setTag(value: any) {
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

    private resetRpcWallet() {
        this.removeRpcWalletEvents();
        const rpcWalletId = this.state.initRpcWallet(this.defaultChainId);
        const rpcWallet = this.state.getRpcWallet();
        const chainChangedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.ChainChanged, async (chainId: number) => {
            this.fromTokenInput.token = null;
            this.toTokenInput.token = null;
            this.lblRegisterPairMsg.visible = false;
            this.refreshUI();
        });
        const connectedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.Connected, async (connected: boolean) => {
            this.refreshUI();
        });
        const data: any = {
            defaultChainId: this.defaultChainId,
            wallets: this.wallets,
            networks: this.networks,
            showHeader: this.showHeader,
            rpcWalletId: rpcWallet.instanceId
        };
        if (this.dappContainer?.setData) this.dappContainer.setData(data);
    }

    private async refreshUI() {
        await this.initializeWidgetConfig();
    }

    private initWallet = async () => {
        try {
            await Wallet.getClientInstance().init();
            const rpcWallet = this.state.getRpcWallet();
            await rpcWallet.init();
        } catch (err) {
            console.log(err);
        }
    }

    private initializeWidgetConfig = async () => {
        setTimeout(async () => {
            const chainId = this.chainId;
            await this.initWallet();
            if (!isClientWalletConnected()) {
                this.btnRegister.caption = "Connect Wallet";
                this.btnRegister.enabled = true;
            } else if (!this.state.isRpcWalletConnected()) {
                this.btnRegister.caption = "Switch Network";
                this.btnRegister.enabled = true;
            } else {
                this.btnRegister.caption = "Register";
                this.btnRegister.enabled = this.isReadyToRegister;
            }
            this.fromTokenInput.chainId = chainId;
            this.toTokenInput.chainId = chainId;
            const tokens = tokenStore.getTokenList(chainId);
            this.fromTokenInput.tokenDataListProp = tokens;
            this.toTokenInput.tokenDataListProp = tokens;
            if (this._data.isFlow) {
                if (this._data.fromToken) this.fromTokenInput.address = this._data.fromToken;
                if (this._data.toToken) this.toTokenInput.address = this._data.toToken;
                this.handleSelectToken(true);
            }
        })
    }

    private showResultMessage = (status: 'warning' | 'success' | 'error', content?: string | Error) => {
        if (!this.txStatusModal) return;
        let params: any = { status };
        if (status === 'success') {
            params.txtHash = content;
        } else {
            params.content = content;
        }
        this.txStatusModal.message = { ...params };
        this.txStatusModal.showModal();
    }

    private connectWallet = async () => {
        if (!isClientWalletConnected()) {
            if (this.mdWallet) {
                await application.loadPackage('@scom/scom-wallet-modal', '*');
                this.mdWallet.networks = this.networks;
                this.mdWallet.wallets = this.wallets;
                this.mdWallet.showModal();
            }
            return;
        }
        if (!this.state.isRpcWalletConnected()) {
            const clientWallet = Wallet.getClientInstance();
            await clientWallet.switchNetwork(this.chainId);
        }
    }

    private onSelectFromToken() {
        this.handleSelectToken(true);
    }

    private onSelectToToken() {
        this.handleSelectToken(false);
    }

    private async handleSelectToken(isFrom: boolean) {
        this.isReadyToRegister = false;
        if (!this.fromTokenInput.token || !this.toTokenInput.token) return;
        let fromToken = (this.fromTokenInput.token?.address || this.fromTokenInput.token?.symbol)?.toLowerCase();
        let toToken = (this.toTokenInput.token?.address || this.toTokenInput.token?.symbol)?.toLowerCase();
        if (fromToken === toToken) {
            if (isFrom) {
                this.toTokenInput.token = null;
            } else {
                this.fromTokenInput.token = null;
            }
            return;
        }
        this.fromTokenInput.tokenReadOnly = true;
        this.toTokenInput.tokenReadOnly = true;
        let pairAddress = await getPair(this.state, this.fromTokenInput.token, this.toTokenInput.token);
        if (!pairAddress) {
            this.lblRegisterPairMsg.caption = 'Pair has not been created yet.';
            this.lblRegisterPairMsg.visible = true;
        } else {
            let isRegistered = await isPairRegistered(this.state, pairAddress);
            if (isRegistered) {
                this.lblRegisterPairMsg.caption = 'This pair is already registered on Hybrid Router Registry.';
                this.lblRegisterPairMsg.visible = true;
            } else {
                this.lblRegisterPairMsg.visible = false;
                this.isReadyToRegister = true;
            }
        }
        this.fromTokenInput.tokenReadOnly = false;
        this.toTokenInput.tokenReadOnly = false;
        if (isClientWalletConnected() && this.state.isRpcWalletConnected()) {
            this.btnRegister.enabled = this.isReadyToRegister;
        }
    }

    private async onRegisterPair() {
        try {
            if (!this.state.isRpcWalletConnected()) {
                this.connectWallet();
                return;
            }
            if (!this.fromTokenInput.token || !this.toTokenInput.token) return;

            this.showResultMessage('warning', 'Registering');
            this.fromTokenInput.tokenReadOnly = true;
            this.toTokenInput.tokenReadOnly = true;
            this.btnRegister.rightIcon.spin = true;
            this.btnRegister.rightIcon.visible = true;
            
            const txHashCallback = async (err: Error, receipt?: string) => {
                if (err) {
                    this.showResultMessage('error', err);
                } else if (receipt) {
                    this.showResultMessage('success', receipt);
                }
            }
    
            const confirmationCallback = async (receipt: any) => {
                this.refreshUI();
            };
    
            const wallet = Wallet.getClientInstance();
            wallet.registerSendTxEvents({
                transactionHash: txHashCallback,
                confirmation: confirmationCallback
            });
            
            const WETH9 = getWETH(this.chainId);
            const fromToken = this.fromTokenInput.token.address ? this.fromTokenInput.token.address : WETH9.address || this.fromTokenInput.token.address;
            const toToken = this.toTokenInput.token.address ? this.toTokenInput.token.address : WETH9.address || this.toTokenInput.token.address;
            await doRegisterPair(this.state, fromToken, toToken);
        } catch (err) {
            console.error(err);
        } finally {
            this.fromTokenInput.tokenReadOnly = false;
            this.toTokenInput.tokenReadOnly = false;
            this.btnRegister.rightIcon.spin = false;
            this.btnRegister.rightIcon.visible = false;
        }
    }

    render() {
        return (
            <i-scom-dapp-container id="dappContainer">
                <i-panel background={{ color: Theme.background.main }}>
                    <i-panel>
                        <i-vstack id="pnlLoading" class="i-loading-overlay">
                            <i-vstack class="i-loading-spinner" horizontalAlignment="center" verticalAlignment="center">
                                <i-icon
                                    class="i-loading-spinner_icon"
                                    image={{ url: Assets.fullPath('img/loading.svg'), width: 36, height: 36 }}
                                ></i-icon>
                                <i-label
                                    class="i-loading-spinner_text"
                                    caption="Loading..."
                                    font={{ color: '#FD4A4C', size: '1.5em' }}
                                ></i-label>
                            </i-vstack>
                        </i-vstack>
                        <i-vstack width="100%" height="100%" padding={{ top: "1rem", bottom: "1rem", left: "1.5rem", right: "1.5rem" }}>
                            <i-label
                                caption="Register Pair on your Hybrid Router"
                                font={{ size: '1.25rem', weight: 700, color: Theme.colors.primary.main }}
                                margin={{ bottom: '2rem' }}
                            ></i-label>
                            <i-vstack width="100%" height="100%" maxWidth={360} horizontalAlignment="center" margin={{ left: 'auto', right: 'auto' }} gap="1.5rem">
                                <i-hstack horizontalAlignment="center" verticalAlignment="center" wrap='wrap' gap={10}>
                                    <i-scom-token-input
                                        id="fromTokenInput"
                                        type="combobox"
                                        isBalanceShown={false}
                                        isBtnMaxShown={false}
                                        isInputShown={false}
                                        border={{ radius: 12 }}
                                        onSelectToken={this.onSelectFromToken.bind(this)}
                                    ></i-scom-token-input>
                                    <i-label caption="to" font={{ size: "1rem" }}></i-label>
                                    <i-scom-token-input
                                        id="toTokenInput"
                                        type="combobox"
                                        isBalanceShown={false}
                                        isBtnMaxShown={false}
                                        isInputShown={false}
                                        border={{ radius: 12 }}
                                        onSelectToken={this.onSelectToToken.bind(this)}
                                    ></i-scom-token-input>
                                </i-hstack>
                                <i-label id="lblRegisterPairMsg" class="text-center" visible={false} />
                                <i-hstack horizontalAlignment="center" verticalAlignment="center" margin={{ top: "0.5rem" }}>
                                    <i-button
                                        id="btnRegister"
                                        width={150}
                                        caption="Register"
                                        font={{ size: '1rem', weight: 600, color: '#ffff' }}
                                        lineHeight={1.5}
                                        background={{ color: Theme.background.gradient }}
                                        padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }}
                                        border={{ radius: '0.65rem' }}
                                        enabled={false}
                                        onClick={this.onRegisterPair.bind(this)}
                                    ></i-button>
                                </i-hstack>
                            </i-vstack>
                        </i-vstack>
                    </i-panel>
                    <i-scom-tx-status-modal id="txStatusModal"></i-scom-tx-status-modal>
                    <i-scom-wallet-modal id="mdWallet" wallets={[]}></i-scom-wallet-modal>
                </i-panel>
            </i-scom-dapp-container>
        )
    }

    async handleFlowStage(target: Control, stage: string, options: any) {
        let widget;
        if (stage === 'initialSetup') {
            widget = new ScomPairRegistryFlowInitialSetup();
            target.appendChild(widget);
            await widget.ready();
            widget.state = this.state;
            await widget.handleFlowStage(target, stage, options);
        } else {
            widget = this;
            if (!options.isWidgetConnected) {
                target.appendChild(widget);
                await widget.ready();
            }
            let properties = options.properties;
            let tag = options.tag;
            this.state.handleNextFlowStep = options.onNextStep;
            this.state.handleAddTransactions = options.onAddTransactions;
            this.state.handleJumpToStep = options.onJumpToStep;
            await this.setData(properties);
            if (tag) {
                this.setTag(tag);
            }
        }
        
        return { widget };
    }
}