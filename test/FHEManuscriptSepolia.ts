import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { FHEManuscript } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("FHEManuscriptSepolia", function () {
  let signers: Signers;
  let fheManuscriptContract: FHEManuscript;
  let fheManuscriptContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const FHEManuscriptDeployment = await deployments.get("FHEManuscript");
      fheManuscriptContractAddress = FHEManuscriptDeployment.address;
      fheManuscriptContract = await ethers.getContractAt("FHEManuscript", FHEManuscriptDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("submit and decrypt a manuscript", async function () {
    steps = 10;

    this.timeout(4 * 40000);

    const testMessage = "Test manuscript on Sepolia";
    const messageBytes = ethers.toUtf8Bytes(testMessage);

    progress("Encrypting manuscript content...");
    // Encrypt all bytes in a single encryption call
    const input = fhevm.createEncryptedInput(fheManuscriptContractAddress, signers.alice.address);
    for (let i = 0; i < messageBytes.length; i++) {
      input.add8(messageBytes[i]);
    }
    const encrypted = await input.encrypt();

    const encryptedBytes: string[] = [];
    for (let i = 0; i < messageBytes.length; i++) {
      encryptedBytes.push(encrypted.handles[i]);
    }

    progress(
      `Call submitManuscript() FHEManuscript=${fheManuscriptContractAddress} signer=${signers.alice.address}...`,
    );
    let tx = await fheManuscriptContract
      .connect(signers.alice)
      .submitManuscript(encryptedBytes, encrypted.inputProof);
    await tx.wait();

    progress(`Call FHEManuscript.getManuscript(0)...`);
    const [encryptedContent, author, timestamp, exists] = await fheManuscriptContract.getManuscript(0);
    expect(exists).to.be.true;
    expect(author).to.eq(signers.alice.address);

    progress(`Decrypting manuscript content...`);
    const decryptedBytes: number[] = [];
    for (let i = 0; i < encryptedContent.length; i++) {
      const decryptedByte = await fhevm.userDecryptEuint(
        FhevmType.euint8,
        encryptedContent[i],
        fheManuscriptContractAddress,
        signers.alice,
      );
      decryptedBytes.push(Number(decryptedByte));
    }

    const decryptedMessage = ethers.toUtf8String(new Uint8Array(decryptedBytes));
    progress(`Decrypted content: ${decryptedMessage}`);

    expect(decryptedMessage).to.eq(testMessage);
  });
});
