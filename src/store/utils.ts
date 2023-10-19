import { application } from "@ijstech/components";
import { INetwork, Wallet } from "@ijstech/eth-wallet";
import getNetworkList from "@scom/scom-network-list";
import { coreAddress } from "./core";

export class State {
    infuraId: string = '';
    networkMap: { [key: number]: INetwork };
    rpcWalletId: string = '';

    constructor(options: any) {
        this.networkMap = getNetworkList();
        this.initData(options);
      }
    
      private initData(options: any) {
        if (options.infuraId) {
          this.infuraId = options.infuraId;
        }
        if (options.networks) {
          this.setNetworkList(options.networks, options.infuraId)
        }
      }
    
      initRpcWallet(defaultChainId: number) {
        if (this.rpcWalletId) {
          return this.rpcWalletId;
        }
        const clientWallet = Wallet.getClientInstance();
        const networkList: INetwork[] = Object.values(application.store?.networkMap || []);
        const instanceId = clientWallet.initRpcWallet({
          networks: networkList,
          defaultChainId,
          infuraId: application.store?.infuraId,
          multicalls: application.store?.multicalls
        });
        this.rpcWalletId = instanceId;
        if (clientWallet.address) {
          const rpcWallet = Wallet.getRpcWalletInstance(instanceId);
          rpcWallet.address = clientWallet.address;
        }
        return instanceId;
      }
    
      getRpcWallet() {
        return this.rpcWalletId ? Wallet.getRpcWalletInstance(this.rpcWalletId) : null;
      }
    
      isRpcWalletConnected() {
        const wallet = this.getRpcWallet();
        return wallet?.isConnected;
      }
    
      getChainId() {
        const rpcWallet = this.getRpcWallet();
        return rpcWallet?.chainId;
      }
    
      private setNetworkList(networkList: INetwork[], infuraId?: string) {
        const wallet = Wallet.getClientInstance();
        this.networkMap = {};
        const defaultNetworkList = getNetworkList();
        const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
          acc[cur.chainId] = cur;
          return acc;
        }, {});
        for (let network of networkList) {
          const networkInfo = defaultNetworkMap[network.chainId];
          if (!networkInfo) continue;
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
    
      getAddresses(chainId?: number) {
        return coreAddress[chainId || this.getChainId()];
      }
}

export function isClientWalletConnected() {
  const wallet = Wallet.getClientInstance();
  return wallet.isConnected;
}