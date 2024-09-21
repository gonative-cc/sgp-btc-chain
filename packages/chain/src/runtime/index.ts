import { Balance, VanillaRuntimeModules } from "@proto-kit/library";
import { ModulesConfig } from "@proto-kit/common";

import { Balances } from "./modules/balances";
import { Bitcoin } from "./modules/bitcoin";

export const modules = VanillaRuntimeModules.with({
    Balances,
    Bitcoin,
});

export const config: ModulesConfig<typeof modules> = {
    Balances: {
        totalSupply: Balance.from(10_000),
    },
    Bitcoin: {},
};

export default {
    modules,
    config,
};
