import { Contracts } from "@scom/oswap-openswap-contract";
import { State, coreAddress } from "./store";

export async function doRegisterPair(state: State, token0: string, token1: string) {
    //register group queue pair to HybridRouterRegistry
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    try {
        const core = coreAddress[chainId];
        if (!core) throw new Error(`This chain (${chainId}) is not supported`);
        const registry = new Contracts.OSWAP_HybridRouterRegistry(wallet,core.OSWAP_HybridRouterRegistry)
        const receipt = await registry.registerPairByTokensV3({
            factory: core.OSWAP_RestrictedFactory,
            token0,
            token1,
            pairIndex: 0
        });
        return receipt;
    } catch (error) {
        console.log("doRegisterPair", error);
    }
}