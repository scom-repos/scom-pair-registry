export interface CoreAddress {
    OSWAP_RestrictedFactory: string;
    OSWAP_HybridRouterRegistry: string;
}
export const coreAddress: { [chainId: number]: CoreAddress } = {
    56: { // BSC
        OSWAP_RestrictedFactory: "0x91d137464b93caC7E2c2d4444a9D8609E4473B70",
        OSWAP_HybridRouterRegistry: "0xcc44c3617e46b2e946d61499ff8f4cda721ff178"
    },
    97: { // BSC Testnet
        OSWAP_RestrictedFactory: "0xa158FB71cA5EF59f707c6F8D0b9CC5765F97Fd60",
        OSWAP_HybridRouterRegistry: "0x8e5Afed779B56888ca267284494f23aFe158EA0B"
    },
    137: { // Polygon
        OSWAP_RestrictedFactory: "0xF879576c2D674C5D22f256083DC8fD019a3f33A1",
        OSWAP_HybridRouterRegistry: "0x728DbD968341eb7aD11bDabFE775A13aF901d6ac"
    },
    80001: {// Polygon testnet
        OSWAP_RestrictedFactory: "0x6D2b196aBf09CF97612a5c062bF14EC278F6D677",
        OSWAP_HybridRouterRegistry: "0x68C229a3772dFebD0fD51df36B7029fcF75424F7"
    },
    43113: { // AVAX Testnet
        OSWAP_RestrictedFactory: "0x6C99c8E2c587706281a5B66bA7617DA7e2Ba6e48",
        OSWAP_HybridRouterRegistry: "0xCd370BBbC84AB66a9e0Ff9F533E11DeC87704736"
    },
    43114: { // AVAX
        OSWAP_RestrictedFactory: "0x739f0BBcdAd415127FE8d5d6ED053e9D817BdAdb",
        OSWAP_HybridRouterRegistry: "0xEA6A56086e66622208fa8e7B743Bad3FF47aD40c"
    },
    42161: { // Arbitrum One
        OSWAP_RestrictedFactory: "0x408aAf94BD851eb991dA146dFc7C290aA42BA70f",
        OSWAP_HybridRouterRegistry: "0xD5f2e1bb65d7AA483547D1eDF1B59edCa296F6D3"
    },
    421613: { // Arbitrum Goerli Testnet
        OSWAP_RestrictedFactory: "0x6f641f4F5948954F7cd675f3D874Ac60b193bA0d",
        OSWAP_HybridRouterRegistry: "0x7422408d5211a512f18fd55c49d5483d24c9ed6a"
    }
}