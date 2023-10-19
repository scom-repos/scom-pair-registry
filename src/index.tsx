import { application, Button, Container, Control, ControlElement, customElements, Label, Module, Panel, Styles, VStack } from '@ijstech/components';
import ScomDappContainer from '@scom/scom-dapp-container';
import Assets from './assets';
import { INetworkConfig } from '@scom/scom-network-picker';
import ScomTokenInput from '@scom/scom-token-input';
import ScomWalletModal, { IWalletPlugin } from '@scom/scom-wallet-modal';
import ScomTxStatusModal from '@scom/scom-tx-status-modal';
import { IPairRegistry } from './interface';
import { isClientWalletConnected, State } from './store';
import configData from './data.json';
import { Constants, Wallet } from '@ijstech/eth-wallet';
import { tokenStore } from '@scom/scom-token-list';

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
    }

    private getProjectOwnerActions() {
    }

    getConfigurators() {
        return [];
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
            // this.fromTokenInput.tokenReadOnly = true;
            // this.toTokenInput.tokenReadOnly = true;
            // this.pairs = await getGroupQueuePairs(this.state);
            // this.fromTokenInput.tokenReadOnly = false;
            // this.toTokenInput.tokenReadOnly = false;
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
                this.btnRegister.enabled = false;
            }
            this.fromTokenInput.chainId = chainId;
            this.toTokenInput.chainId = chainId;
            const tokens = tokenStore.getTokenList(chainId);
            this.fromTokenInput.tokenDataListProp = tokens;
            this.toTokenInput.tokenDataListProp = tokens;
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

    private onSelectFromToken() {}

    private onSelectToToken() {}

    private async onRegisterPair() {
        try {
            if (!this.state.isRpcWalletConnected()) {
                this.connectWallet();
                return;
            }
            if (!this.fromTokenInput.token || !this.toTokenInput.token) return;
        } catch (err) {
            console.error(err);
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
}