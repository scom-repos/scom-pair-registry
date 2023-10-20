import {
    application,
    Button,
    Control,
    ControlElement,
    customElements,
    Label,
    Modal,
    Module,
    Styles
} from "@ijstech/components";
import { Constants, IEventBusRegistry, Wallet } from "@ijstech/eth-wallet";
import { getPair, isPairRegistered } from "@scom-pair-registry/api";
import ScomTokenInput from "@scom/scom-token-input";
import { ITokenObject, tokenStore } from "@scom/scom-token-list";
import ScomWalletModal from "@scom/scom-wallet-modal";
import { isClientWalletConnected, State } from "../store/index";

const Theme = Styles.Theme.ThemeVars;

interface ScomPairRegistryFlowInitialSetupElement extends ControlElement {
    data?: any;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-pair-registry-flow-initial-setup']: ScomPairRegistryFlowInitialSetupElement;
        }
    }
}

@customElements('i-scom-pair-registry-flow-initial-setup')
export default class ScomPairRegistryFlowInitialSetup extends Module {
    private lblConnectedStatus: Label;
    private btnConnectWallet: Button;
    private fromTokenInput: ScomTokenInput;
    private toTokenInput: ScomTokenInput;
    private lblRegisterPairMsg: Label;
    private btnStart: Button;
    private mdWallet: ScomWalletModal;
    private _state: State;
    private tokenRequirements: any;
    private executionProperties: any;
    private walletEvents: IEventBusRegistry[] = [];
    
    get state(): State {
        return this._state;
    }

    set state(value: State) {
        this._state = value;
    }

    private get rpcWallet() {
        return this.state.getRpcWallet();
    }

    private get chainId() {
        return this.executionProperties.chainId || this.executionProperties.defaultChainId;
    }

    private async resetRpcWallet() {
        await this.state.initRpcWallet(this.chainId);
    }

    async setData(value: any) {
        this.executionProperties = value.executionProperties;
        this.tokenRequirements = value.tokenRequirements;
        this.btnStart.enabled = false;
        await this.resetRpcWallet();
        await this.initializeWidgetConfig();
    }

    private async initWallet() {
        try {
            const rpcWallet = this.rpcWallet;
            await rpcWallet.init();
        } catch (err) {
            console.error(err);
        }
    }

    private async initializeWidgetConfig() {
        const connected = isClientWalletConnected();
        this.updateConnectStatus(connected);
        await this.initWallet();
        this.fromTokenInput.chainId = this.chainId;
        this.toTokenInput.chainId = this.chainId;
        const tokens = tokenStore.getTokenList(this.chainId);
        this.fromTokenInput.tokenDataListProp = tokens;
        this.toTokenInput.tokenDataListProp = tokens;
    }

    async connectWallet() {
        if (!isClientWalletConnected()) {
            if (this.mdWallet) {
                await application.loadPackage('@scom/scom-wallet-modal', '*');
                this.mdWallet.networks = this.executionProperties.networks;
                this.mdWallet.wallets = this.executionProperties.wallets;
                this.mdWallet.showModal();
            }
        } 
    }

    private updateConnectStatus(connected: boolean) {
        if (connected) {
            this.lblConnectedStatus.caption = 'Connected with ' + Wallet.getClientInstance().address;
            this.btnConnectWallet.visible = false;
        } else {
            this.lblConnectedStatus.caption = 'Please connect your wallet first';
            this.btnConnectWallet.visible = true;
        }
    }

    private registerEvents() {
        let clientWallet = Wallet.getClientInstance();
        this.walletEvents.push(clientWallet.registerWalletEvent(this, Constants.ClientWalletEvent.AccountsChanged, async (payload: Record<string, any>) => {
            const { account } = payload;
            let connected = !!account;
            this.updateConnectStatus(connected);
        }));
    }

    onHide() {
        let clientWallet = Wallet.getClientInstance();
        for (let event of this.walletEvents) {
            clientWallet.unregisterWalletEvent(event);
        }
        this.walletEvents = [];
    }

    init() {
        super.init();
        this.fromTokenInput.style.setProperty('--input-background', '#232B5A');
        this.fromTokenInput.style.setProperty('--input-font_color', '#fff');
        this.toTokenInput.style.setProperty('--input-background', '#232B5A');
        this.toTokenInput.style.setProperty('--input-font_color', '#fff');
        this.registerEvents();
    }

    private onSelectFromToken(token: ITokenObject) {
        this.handleSelectToken(true);
    }

    private onSelectToToken(token: ITokenObject) {
        this.handleSelectToken(false);
    }

    private async handleSelectToken(isFrom: boolean) {
        this.btnStart.enabled = false;
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
                this.btnStart.enabled = true;
            }
        }
        this.fromTokenInput.tokenReadOnly = false;
        this.toTokenInput.tokenReadOnly = false;
    }

    private async handleClickStart() {
        if (!this.fromTokenInput.token || !this.toTokenInput.token) return;
        this.executionProperties.isFlow = true;
        this.executionProperties.fromToken = this.fromTokenInput.token;
        this.executionProperties.toToken = this.toTokenInput.token;
        if (this.state.handleNextFlowStep) {
            this.state.handleNextFlowStep({
                tokenRequirements: this.tokenRequirements,
                executionProperties: this.executionProperties
            });
        }
    }

    render() {
        return (
            <i-vstack gap="1rem" padding={{ top: 10, bottom: 10, left: 20, right: 20 }}>
                <i-label caption="Get Ready to Register Pair"></i-label>

                <i-vstack gap='1rem'>
                    <i-label id='lblConnectedStatus'></i-label>
                    <i-hstack>
                        <i-button
                            id="btnConnectWallet"
                            caption="Connect Wallet"
                            font={{ color: Theme.colors.primary.contrastText }}
                            padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }}
                            onClick={this.connectWallet.bind(this)}
                        ></i-button>
                    </i-hstack>
                </i-vstack>
                <i-label caption="Select a Pair"></i-label>
                <i-hstack horizontalAlignment="center" verticalAlignment="center" wrap="wrap" gap={10}>
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
                <i-hstack horizontalAlignment="center">
                    <i-button
                        id="btnStart"
                        caption="Start"
                        padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }}
                        font={{ color: Theme.colors.primary.contrastText, size: '1.5rem' }}
                        onClick={this.handleClickStart.bind(this)}
                    ></i-button>
                </i-hstack>
                <i-scom-wallet-modal id="mdWallet" wallets={[]}></i-scom-wallet-modal>
            </i-vstack>
        )
    }

    async handleFlowStage(target: Control, stage: string, options: any) {
        let widget: ScomPairRegistryFlowInitialSetup = this;
        if (!options.isWidgetConnected) {
            let properties = options.properties;
            let tokenRequirements = options.tokenRequirements;
            this.state.handleNextFlowStep = options.onNextStep;
            this.state.handleAddTransactions = options.onAddTransactions;
            this.state.handleJumpToStep = options.onJumpToStep;
            await this.setData({
                executionProperties: properties,
                tokenRequirements
            });
        }
        return { widget };
    }
}