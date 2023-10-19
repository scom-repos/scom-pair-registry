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