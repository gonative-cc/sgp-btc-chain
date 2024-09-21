import { TestingAppChain } from "@proto-kit/sdk";
import { CircuitString, PrivateKey } from "o1js";
import { Bitcoin } from "../../../src/runtime/modules/bitcoin";
import { Balances } from "../../../src/runtime/modules/balances";
import { log } from "@proto-kit/common";
import { UInt64 } from "@proto-kit/library";

log.setLevel("ERROR");

describe("bitcoin", () => {
    it("should be able to link and unlink", async () => {
        const appChain = TestingAppChain.fromRuntime({
            Bitcoin,
        });

        appChain.configurePartial({
            Runtime: {
                Balances: {
                    totalSupply: UInt64.from(10000),
                },
                Bitcoin: {},
            },
        });

        await appChain.start();

        const aliceSK = PrivateKey.random();
        const alice = aliceSK.toPublicKey();
        const bobSK = PrivateKey.random();
        const bob = bobSK.toPublicKey();
        const wID1 = UInt64.from(1);
        const wID2 = UInt64.from(2);

        appChain.setSigner(aliceSK);

        const bitcoin = appChain.runtime.resolve("Bitcoin");

        let tx1 = await appChain.transaction(alice, async () => {
            await bitcoin.link(wID1, CircuitString.fromString("proof"));
        });
        await tx1.sign();
        await tx1.send();
        let tx2 = await appChain.transaction(
            alice,
            async () => {
                await bitcoin.link(wID2, CircuitString.fromString("proof"));
            },
            { nonce: 1 },
        );
        await tx2.sign();
        await tx2.send();

        let block = await appChain.produceBlock();
        let w1 = await appChain.query.runtime.Bitcoin.wallets.get(wID1);

        expect(block?.transactions[0].status.toBoolean()).toBe(true);
        expect(block?.transactions[1].status.toBoolean()).toBe(true);
        expect(w1?.owner.equals(alice)).toBeTruthy();
        expect(w1?.notRemoved.equals(true)).toBeTruthy();

        tx1 = await appChain.transaction(alice, async () => {
            await bitcoin.transfer(wID1, bob);
        });
        await tx1.sign();
        await tx1.send();
        appChain.setSigner(bobSK);
        tx2 = await appChain.transaction(bob, async () => {
            await bitcoin.transfer(wID2, bob);
        });
        await tx2.sign();
        await tx2.send();

        block = await appChain.produceBlock();
        expect(block?.transactions[0].status.toBoolean()).toBe(true);
        expect(block?.transactions[1].status.toBoolean()).toBe(false);
        w1 = await appChain.query.runtime.Bitcoin.wallets.get(wID1);
        expect(w1?.owner.equals(bob)).toBeTruthy();
        expect(w1?.notRemoved.equals(true)).toBeTruthy();
        let w2 = await appChain.query.runtime.Bitcoin.wallets.get(wID2);
        expect(w2?.owner.equals(alice)).toBeTruthy();
        expect(w2?.notRemoved.equals(true)).toBeTruthy();
    }, 1_000_000);
});
