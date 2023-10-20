/// <reference path="@scom/scom-dapp-container/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@ijstech/eth-contract/index.d.ts" />
/// <amd-module name="@scom/scom-pair-registry/assets.ts" />
declare module "@scom/scom-pair-registry/assets.ts" {
    function fullPath(path: string): string;
    const _default: {
        fullPath: typeof fullPath;
    };
    export default _default;
}
/// <amd-module name="@scom/scom-pair-registry/interface.ts" />
declare module "@scom/scom-pair-registry/interface.ts" {
    import { INetworkConfig } from "@scom/scom-network-picker";
    import { IWalletPlugin } from "@scom/scom-wallet-modal";
    export interface IPairRegistry {
        wallets: IWalletPlugin[];
        networks: INetworkConfig[];
        defaultChainId?: number;
        showHeader?: boolean;
        fromToken?: string;
        toToken?: string;
        isFlow?: boolean;
    }
}
/// <amd-module name="@scom/scom-pair-registry/store/core.ts" />
declare module "@scom/scom-pair-registry/store/core.ts" {
    export interface CoreAddress {
        OSWAP_RestrictedFactory: string;
        OSWAP_HybridRouterRegistry: string;
    }
    export const coreAddress: {
        [chainId: number]: CoreAddress;
    };
}
/// <amd-module name="@scom/scom-pair-registry/store/utils.ts" />
declare module "@scom/scom-pair-registry/store/utils.ts" {
    import { INetwork } from "@ijstech/eth-wallet";
    export class State {
        infuraId: string;
        networkMap: {
            [key: number]: INetwork;
        };
        rpcWalletId: string;
        handleNextFlowStep: (data: any) => Promise<void>;
        handleAddTransactions: (data: any) => Promise<void>;
        handleJumpToStep: (data: any) => Promise<void>;
        constructor(options: any);
        private initData;
        initRpcWallet(defaultChainId: number): string;
        getRpcWallet(): import("@ijstech/eth-wallet").IRpcWallet;
        isRpcWalletConnected(): boolean;
        getChainId(): number;
        private setNetworkList;
        getAddresses(chainId?: number): import("@scom/scom-pair-registry/store/core.ts").CoreAddress;
    }
    export function isClientWalletConnected(): boolean;
}
/// <amd-module name="@scom/scom-pair-registry/store/index.ts" />
declare module "@scom/scom-pair-registry/store/index.ts" {
    export * from "@scom/scom-pair-registry/store/utils.ts";
    export * from "@scom/scom-pair-registry/store/core.ts";
}
/// <amd-module name="@scom/scom-pair-registry/formSchema.ts" />
declare module "@scom/scom-pair-registry/formSchema.ts" {
    import ScomNetworkPicker from '@scom/scom-network-picker';
    const _default_1: {
        dataSchema: {
            type: string;
            properties: {
                networks: {
                    type: string;
                    required: boolean;
                    items: {
                        type: string;
                        properties: {
                            chainId: {
                                type: string;
                                enum: number[];
                                required: boolean;
                            };
                        };
                    };
                };
            };
        };
        uiSchema: {
            type: string;
            elements: {
                type: string;
                scope: string;
                options: {
                    detail: {
                        type: string;
                    };
                };
            }[];
        };
        customControls(): {
            '#/properties/networks/properties/chainId': {
                render: () => ScomNetworkPicker;
                getData: (control: ScomNetworkPicker) => number;
                setData: (control: ScomNetworkPicker, value: number) => void;
            };
        };
    };
    export default _default_1;
}
/// <amd-module name="@scom/scom-pair-registry/data.json.ts" />
declare module "@scom/scom-pair-registry/data.json.ts" {
    const _default_2: {
        defaultBuilderData: {
            defaultChainId: number;
            networks: {
                chainId: number;
            }[];
            wallets: {
                name: string;
            }[];
        };
    };
    export default _default_2;
}
/// <amd-module name="@scom/scom-pair-registry/api.ts" />
declare module "@scom/scom-pair-registry/api.ts" {
    import { ITokenObject } from "@scom/scom-token-list";
    import { State } from "@scom/scom-pair-registry/store/index.ts";
    export const getWETH: (chainId: number) => ITokenObject;
    export function doRegisterPair(state: State, token0: string, token1: string): Promise<import("@ijstech/eth-contract").TransactionReceipt>;
    export function getPair(state: State, tokenA: ITokenObject, tokenB: ITokenObject): Promise<string>;
    export function isPairRegistered(state: State, pairAddress: string): Promise<boolean>;
}
/// <amd-module name="@scom/scom-pair-registry/flow/initialSetup.tsx" />
declare module "@scom/scom-pair-registry/flow/initialSetup.tsx" {
    import { Control, ControlElement, Module } from "@ijstech/components";
    import { State } from "@scom/scom-pair-registry/store/index.ts";
    interface ScomPairRegistryFlowInitialSetupElement extends ControlElement {
        data?: any;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-pair-registry-flow-initial-setup']: ScomPairRegistryFlowInitialSetupElement;
            }
        }
    }
    export default class ScomPairRegistryFlowInitialSetup extends Module {
        private lblConnectedStatus;
        private btnConnectWallet;
        private fromTokenInput;
        private toTokenInput;
        private lblRegisterPairMsg;
        private btnStart;
        private mdWallet;
        private _state;
        private tokenRequirements;
        private executionProperties;
        private walletEvents;
        get state(): State;
        set state(value: State);
        private get rpcWallet();
        private get chainId();
        private resetRpcWallet;
        setData(value: any): Promise<void>;
        private initWallet;
        private initializeWidgetConfig;
        connectWallet(): Promise<void>;
        private updateConnectStatus;
        private registerEvents;
        onHide(): void;
        init(): void;
        private onSelectFromToken;
        private onSelectToToken;
        private handleSelectToken;
        private handleClickStart;
        render(): any;
        handleFlowStage(target: Control, stage: string, options: any): Promise<{
            widget: ScomPairRegistryFlowInitialSetup;
        }>;
    }
}
/// <amd-module name="@scom/scom-pair-registry" />
declare module "@scom/scom-pair-registry" {
    import { Container, Control, ControlElement, Module } from '@ijstech/components';
    import { INetworkConfig } from '@scom/scom-network-picker';
    import { IWalletPlugin } from '@scom/scom-wallet-modal';
    import { IPairRegistry } from "@scom/scom-pair-registry/interface.ts";
    interface ScomPairRegistryElement extends ControlElement {
        lazyLoad?: boolean;
        networks: INetworkConfig[];
        wallets: IWalletPlugin[];
        defaultChainId?: number;
        showHeader?: boolean;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-pair-registry']: ScomPairRegistryElement;
            }
        }
    }
    export default class ScomPairRegistry extends Module {
        private dappContainer;
        private pnlLoading;
        private fromTokenInput;
        private toTokenInput;
        private lblRegisterPairMsg;
        private btnRegister;
        private txStatusModal;
        private mdWallet;
        private state;
        private _data;
        tag: any;
        private isReadyToRegister;
        private get chainId();
        get defaultChainId(): number;
        set defaultChainId(value: number);
        get wallets(): IWalletPlugin[];
        set wallets(value: IWalletPlugin[]);
        get networks(): INetworkConfig[];
        set networks(value: INetworkConfig[]);
        get showHeader(): boolean;
        set showHeader(value: boolean);
        constructor(parent?: Container, options?: ControlElement);
        removeRpcWalletEvents(): void;
        onHide(): void;
        isEmptyData(value: IPairRegistry): boolean;
        init(): Promise<void>;
        private _getActions;
        private getProjectOwnerActions;
        getConfigurators(): ({
            name: string;
            target: string;
            getActions: any;
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
        } | {
            name: string;
            target: string;
            getData: () => {
                wallets: IWalletPlugin[];
                networks: INetworkConfig[];
                defaultChainId?: number;
                showHeader?: boolean;
                fromToken?: string;
                toToken?: string;
                isFlow?: boolean;
            };
            setData: (properties: IPairRegistry, linkParams?: Record<string, any>) => Promise<void>;
            getTag: any;
            setTag: any;
            getActions?: undefined;
        })[];
        private getData;
        private setData;
        getTag(): Promise<any>;
        private updateTag;
        private setTag;
        private resetRpcWallet;
        private refreshUI;
        private initWallet;
        private initializeWidgetConfig;
        private showResultMessage;
        private connectWallet;
        private onSelectFromToken;
        private onSelectToToken;
        private handleSelectToken;
        private onRegisterPair;
        render(): any;
        handleFlowStage(target: Control, stage: string, options: any): Promise<{
            widget: any;
        }>;
    }
}
