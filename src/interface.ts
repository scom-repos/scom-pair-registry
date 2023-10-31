import { INetworkConfig } from "@scom/scom-network-picker";
import { ITokenObject } from "@scom/scom-token-list";
import { IWalletPlugin } from "@scom/scom-wallet-modal";

export interface IPairRegistry {
    wallets: IWalletPlugin[];
    networks: INetworkConfig[];
    defaultChainId?: number;
    showHeader?: boolean;
    fromToken?: string;
    toToken?: string;
    customTokens?: Record<number, ITokenObject[]>;
    isFlow?: boolean;
}