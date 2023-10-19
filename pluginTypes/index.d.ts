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
/// <amd-module name="@scom/scom-pair-registry/data.json.ts" />
declare module "@scom/scom-pair-registry/data.json.ts" {
    const _default_1: {
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
    export default _default_1;
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
/// <amd-module name="@scom/scom-pair-registry" />
declare module "@scom/scom-pair-registry" {
    import { Container, ControlElement, Module } from '@ijstech/components';
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
        getConfigurators(): any[];
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
    }
}