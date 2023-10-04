import {
    RuntimeModule,
    runtimeModule,
    state,
    runtimeMethod,
} from "@proto-kit/module";
import { ProtocolTransaction, RuntimeTransaction, State, StateMap, assert } from "@proto-kit/protocol";
import { Field, Provable, PublicKey, Struct, Poseidon, UInt64 } from "snarkyjs";

export interface MonsterAttribute {
    id: Field;
    strength: Field;
    weaknessId: Field;
}

export class MonsterAttribute extends Struct({
    id: Field,
    strength: Field,
    weaknessId: Field
}) implements MonsterAttribute {
    constructor(id: Field, strength: Field, weaknessId: Field) {
        super({
            id: id,
            strength: strength,
            weaknessId: weaknessId
        })
    }

    static nullMonsterAttribute(): MonsterAttribute {
        return {
            id: Field(0),
            strength: Field(0),
            weaknessId: Field(0)
        }
    }
}

interface Monster {
    uuid: Field;
    attributes: MonsterAttribute[];
    hp: Field;
}

export class MonsterStruct extends Struct({
    uuid: Field,
    attributes: Provable.Array(MonsterAttribute, 4),
    hp: Field
}) implements Monster {
    constructor(id: Field, attributes: MonsterAttribute[], hp: Field) {
        super({
            uuid: id,
            attributes: attributes,
            hp: hp
        })
    }

    static nullMonster(): Monster {
        const nullAttributes = [MonsterAttribute.nullMonsterAttribute(), MonsterAttribute.nullMonsterAttribute(), MonsterAttribute.nullMonsterAttribute(), MonsterAttribute.nullMonsterAttribute()]
        return {
            uuid: Field(0),
            attributes: nullAttributes,
            hp: Field(0)
        }
    }
}

interface MonsterConfig {
    /** Total supply of the token/currency. */
    totalSupplyEach: UInt64;
  }
  

/**
 * `Monsters` is a runtime module responsible for managing monsters.
 * This module provides functionalities like minting new monsters and
 * setting monsters to user's address.
 * 
 * @decorators {runtimeModule}
 */
@runtimeModule()
export class Monsters extends RuntimeModule<MonsterConfig> {
    /**
     * StateMap storing the monster for each public key.
     */
    @state() public monsterRegistry = StateMap.from<PublicKey, MonsterStruct>(
        PublicKey,
        MonsterStruct
    );

    /**
     * Mint a new monster and assign it to the given address.
     * 
     * @param address - The public key of the address.
     * @param name - The name of the monster.
     * @param attributes - The list of attributes of the monster.
     * @param power - The power level of the monster.
     * 
     * @remarks
     * A user cannot have more than one monster!
     */
    @runtimeMethod()
    public mintMonster(address: PublicKey) {
        // Check if the user already has a monster
        const existingMonster = this.monsterRegistry.get(address).orElse(MonsterStruct.nullMonster() as MonsterStruct);
        // need assertNotEquals to return a Bool type
        assert(existingMonster.uuid.lessThan(Field(1)), "User already has a monster!");

        // Create a new monster
        
        const txHash =  Poseidon.hash([Field(100), Field(101)]); // this should be the transaction hash
        const registryRoot = Field(1248520)// this.monsterRegistry.getRoot() // getting the root can add some natural randomness
        const monsterID = Poseidon.hash([txHash, registryRoot]);
        // dummy monster for now
        const newMonster = new MonsterStruct(monsterID, [new MonsterAttribute(Field(0), Field(10), Field(0)), new MonsterAttribute(Field(1), Field(8), Field(2)), new MonsterAttribute(Field(2), Field(3), Field(0)), new MonsterAttribute(Field(3), Field(2), Field(1))], Field(30));

        // Update the monster registry with the new monster
        this.monsterRegistry.set(address, newMonster);
    }
}
