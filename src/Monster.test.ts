import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey, PublicKey, UInt64 } from "snarkyjs";
import { Monsters } from "../src/Monster";


describe("Balances", () => {
  let appChain: TestingAppChain<{ Monsters: typeof Monsters; }>;
  let totalSupplyEach: UInt64;
  let alicePrivateKey: PrivateKey;
  let alicePublicKey: PublicKey;
  let bobPrivateKey: PrivateKey;
  let bobPublicKey: PublicKey;
  
  beforeAll(() => {
    totalSupplyEach = UInt64.from(1);
    // renamed monsters -> balances to get past methodId error
    appChain = TestingAppChain.fromRuntime({
      modules: {
        Monsters,
      },
      config: {
        Monsters: {
            totalSupplyEach,
        },
      },
    });

    const PRIVATE_KEY_0 = "EKE1h2CEeYQxDaPfjSGNNB83tXYSpn3Cqt6B3vLBHuLixZLApCpd"
    const PRIVATE_KEY_1 = "EKEU31uonuF2rhG5f8KW4hRseqDjpPVysqcfKCKxqvs7x5oRviN1"

    alicePrivateKey = PrivateKey.fromBase58(PRIVATE_KEY_0);
    alicePublicKey = alicePrivateKey.toPublicKey();
    bobPrivateKey = PrivateKey.fromBase58(PRIVATE_KEY_1);
    bobPublicKey = bobPrivateKey.toPublicKey();
  })

  it("should demonstrate how to mint a monster", async () => {

    await appChain.start();

    appChain.setSigner(alicePrivateKey);

    // this is almost equivalent to obtaining the contract ABI in solidity
    const monsters = appChain.runtime.resolve("Monsters");

    const tx1 = appChain.transaction(alicePublicKey, () => {
        monsters.mintMonster(alicePublicKey);
    });

    await tx1.sign();
    await tx1.send();

    const startTime = new Date().getTime();
    const block1 = await appChain.produceBlock();
    const endTime = new Date().getTime();
    console.log(`Block Production time: ${endTime - startTime} milliseconds`);

    const aliceMonster = await appChain.query.runtime.Monsters.monsterRegistry.get(
      alicePublicKey
    );

    expect(block1?.txs[0].status, block1?.txs[0].statusMessage).toBe(true);
    expect(aliceMonster?.hp.toBigInt()).toBe(30n);
  });
});