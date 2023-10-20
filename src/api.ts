import { Contracts } from "@scom/oswap-openswap-contract";
import { ITokenObject, WETHByChainId } from "@scom/scom-token-list";
import { State, coreAddress } from "./store";

export const getWETH = (chainId: number): ITokenObject => {
    let wrappedToken = WETHByChainId[chainId];
    return wrappedToken;
}

const mapTokenObjectSet = (chainId: number, obj: any) => {
    const WETH9 = getWETH(chainId);
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (!obj[key]?.address) obj[key] = WETH9;
        }
    }
    return obj;
}

export async function doRegisterPair(state: State, token0: string, token1: string) {
    //register group queue pair to HybridRouterRegistry
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    try {
        const core = coreAddress[chainId];
        if (!core) throw new Error(`This chain (${chainId}) is not supported`);
        const registry = new Contracts.OSWAP_HybridRouterRegistry(wallet, core.OSWAP_HybridRouterRegistry)
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

export async function getPair(state: State, tokenA: ITokenObject, tokenB: ITokenObject) {
    let pairAddress = '';
    try {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        let tokens = mapTokenObjectSet(chainId, { tokenA, tokenB });
        let params = { param1: tokens.tokenA.address, param2: tokens.tokenB.address };
        let factoryAddress = coreAddress[chainId].OSWAP_RestrictedFactory;
        let groupQ = new Contracts.OSWAP_RestrictedFactory(wallet, factoryAddress);
        pairAddress = await groupQ.getPair({ ...params, param3: 0 });
    } catch (err) {
        // console.error(err);
    }
    return pairAddress;
}

export async function isPairRegistered(state: State, pairAddress: string) {
    let isRegistered = false;
    try {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const core = coreAddress[chainId];
        const registry = new Contracts.OSWAP_HybridRouterRegistry(wallet, core.OSWAP_HybridRouterRegistry);
        const { token0, token1 } = await registry.getPairTokens([pairAddress]);
        isRegistered = token0.length > 0 && token1.length > 0;
    } catch (err) {
        console.error(err);
    }
    return isRegistered;
}