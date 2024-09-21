import {
    runtimeModule,
    state,
    runtimeMethod,
    RuntimeModule,
} from "@proto-kit/module";
import { State, StateMap, assert } from "@proto-kit/protocol";
import { UInt64, Balance, Balances, TokenId } from "@proto-kit/library";
import { Field, PublicKey, Struct, Bool, Provable, CircuitString } from "o1js";

interface BitcoinConfig {}

const keyBridge = PublicKey.from({ x: 1n, isOdd: false });

const errNotOnwer = "wallet no owned by sender";

export class Wallet extends Struct({
    owner: PublicKey,
    notRemoved: Bool,
}) {
    public static from(owner: PublicKey): Wallet {
        return new Wallet({ owner, notRemoved: Bool.fromValue(true) });
    }
}

@runtimeModule()
export class Bitcoin extends RuntimeModule<BitcoinConfig> {
    @state() public wallets = StateMap.from<UInt64, Wallet>(UInt64, Wallet);

    @runtimeMethod()
    public async link(id: UInt64, sig: CircuitString): Promise<void> {
        const wExists = await this.wallets.get(id);
        assert(
            wExists.isSome.and(wExists.value.notRemoved).not(),
            "wallet already linked",
        );

        const sender = this.transaction.sender.value;
        const w = Wallet.from(sender);
        await this.wallets.set(id, w);

        Provable.asProver(() => {
            // TODO: prove signature
            // example: use Provable to do some logic that is not natively provable
            const mynumber = 3;
        });
    }

    @runtimeMethod()
    public async unlink(id: UInt64): Promise<void> {
        const wOpt = await this.wallets.get(id);
        assert(
            wOpt.isSome.and(wOpt.value.notRemoved.not()),
            "wallet is not linked",
        );
        const sender = this.transaction.sender.value;
        const w = wOpt.value;
        assert(w.owner.equals(sender), errNotOnwer);

        w.notRemoved = Bool.fromValue(true);
        await this.wallets.set(id, w);
    }

    @runtimeMethod()
    public async transfer(id: UInt64, to: PublicKey): Promise<void> {
        const sender = this.transaction.sender.value;
        const wOpt = await this.wallets.get(id);
        assert(wOpt.isSome.and(wOpt.value.notRemoved), "wallet is not linked");

        const w = wOpt.value;
        assert(w.owner.equals(sender), errNotOnwer);
        assert(w.notRemoved, "wallet bridged");

        w.owner = to;
        await this.wallets.set(id, w);
    }
}
