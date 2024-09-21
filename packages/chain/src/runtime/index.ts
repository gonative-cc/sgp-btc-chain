import { Balance, VanillaRuntimeModules } from "@proto-kit/library";
import { ModulesConfig } from "@proto-kit/common";

import { Balances } from "./modules/balances";
import { Bitcoin } from "./modules/bitcoin";
import { Bridge } from "./modules/bridge";

export const modules = VanillaRuntimeModules.with({
    Balances,
    Bitcoin,
    Bridge,
});

export const config: ModulesConfig<typeof modules> = {
    Balances: {
        totalSupply: Balance.from(10_000),
    },
    Bitcoin: {},
    Bridge: {},
};

export default {
    modules,
    config,
};
