import {
    runtimeModule,
    state,
    runtimeMethod,
    RuntimeModule,
} from "@proto-kit/module";
import { State, StateMap, assert } from "@proto-kit/protocol";
import { UInt64, UInt32, Balance, Balances, TokenId } from "@proto-kit/library";
import { Field, PublicKey, Struct, Bool, Provable, CircuitString } from "o1js";

const errNotOnwer = "wallet no owned by sender";

interface IMailbox {
    dispatch(
        destinationDomain: UInt32,
        recipientAddress: CircuitString, // bytes32
        messageBody: CircuitString, // bytes32
    ): CircuitString; // bytes32

    process(metadata: CircuitString, message: CircuitString): void; // (bytes, bytes)
}

export class Msg extends Struct({
    destinationDomain: UInt32,
    recipientAddress: CircuitString, // bytes32
    messageBody: CircuitString, // bytes32
}) {}

@runtimeModule()
export class Bitcoin extends RuntimeModule {
    @state() public msgs = StateMap.from<UInt64, Msg>(UInt64, Msg);
    @state() public nonce = State.from<UInt64>(UInt64);

    @runtimeMethod()
    public async dispatch(
        destinationDomain: UInt32,
        recipientAddress: CircuitString, // bytes32
        messageBody: CircuitString, // bytes32
    ): Promise<CircuitString> {
        let nonce = (await this.nonce.get()).value.add(1);
        await this.nonce.set(nonce);

        const msg = new Msg({
            destinationDomain,
            recipientAddress,
            messageBody,
        });
        await this.msgs.set(nonce, msg);

        return CircuitString.fromString("");
    }

    @runtimeMethod()
    public async process(
        metadata: CircuitString,
        message: CircuitString,
    ): Promise<void> {


    }
}
