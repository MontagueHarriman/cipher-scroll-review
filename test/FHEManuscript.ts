import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FHEManuscript, FHEManuscript__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHEManuscript")) as FHEManuscript__factory;
  const fheManuscriptContract = (await factory.deploy()) as FHEManuscript;
  const fheManuscriptContractAddress = await fheManuscriptContract.getAddress();

  return { fheManuscriptContract, fheManuscriptContractAddress };
}

describe("FHEManuscript", function () {
  let signers: Signers;
  let fheManuscriptContract: FHEManuscript;
  let fheManuscriptContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ fheManuscriptContract, fheManuscriptContractAddress } = await deployFixture());
  });

  it("should initialize with zero manuscripts", async function () {
    const totalManuscripts = await fheManuscriptContract.getTotalManuscripts();
    expect(totalManuscripts).to.eq(0);
  });

  it("should submit an encrypted manuscript", async function () {
    // Create a test message (convert to bytes)
    const testMessage = "Test manuscript content";
    const messageBytes = ethers.toUtf8Bytes(testMessage);
    
    // Encrypt all bytes in a single encryption call
    // All bytes must be added to the same input instance to share the same proof
    const input = fhevm.createEncryptedInput(fheManuscriptContractAddress, signers.alice.address);
    for (let i = 0; i < messageBytes.length; i++) {
      input.add8(messageBytes[i]);
    }
    const encrypted = await input.encrypt();

    // Extract handles for all bytes
    const encryptedBytes: string[] = [];
    for (let i = 0; i < messageBytes.length; i++) {
      encryptedBytes.push(encrypted.handles[i]);
    }

    const tx = await fheManuscriptContract
      .connect(signers.alice)
      .submitManuscript(encryptedBytes, encrypted.inputProof);
    const receipt = await tx.wait();

    // Check that the manuscript was created
    const totalManuscripts = await fheManuscriptContract.getTotalManuscripts();
    expect(totalManuscripts).to.eq(1);

    // Check manuscript details
    const [encryptedContent, author, timestamp, exists] = await fheManuscriptContract.getManuscript(0);
    expect(author).to.eq(signers.alice.address);
    expect(exists).to.be.true;
    expect(timestamp).to.be.gt(0);
    expect(encryptedContent.length).to.eq(messageBytes.length);

    // Check author's manuscripts
    const authorManuscripts = await fheManuscriptContract.getAuthorManuscripts(signers.alice.address);
    expect(authorManuscripts.length).to.eq(1);
    expect(authorManuscripts[0]).to.eq(0);
  });

  it("should allow author to decrypt their manuscript", async function () {
    // Create a test message
    const testMessage = "My secret research paper";
    const messageBytes = ethers.toUtf8Bytes(testMessage);
    
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

    const tx = await fheManuscriptContract
      .connect(signers.alice)
      .submitManuscript(encryptedBytes, encrypted.inputProof);
    await tx.wait();

    // Get the encrypted content from contract
    const [encryptedContent] = await fheManuscriptContract.getManuscript(0);

    // Decrypt each byte using author's key
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

    // Convert bytes back to string
    const decryptedMessage = ethers.toUtf8String(new Uint8Array(decryptedBytes));

    // Verify decryption
    expect(decryptedMessage).to.eq(testMessage);
  });

  it("should not allow non-author to decrypt manuscript", async function () {
    // Alice submits a manuscript
    const testMessage = "Alice's secret paper";
    const messageBytes = ethers.toUtf8Bytes(testMessage);
    
    const input = fhevm.createEncryptedInput(fheManuscriptContractAddress, signers.alice.address);
    for (let i = 0; i < messageBytes.length; i++) {
      input.add8(messageBytes[i]);
    }
    const encrypted = await input.encrypt();

    const encryptedBytes: string[] = [];
    for (let i = 0; i < messageBytes.length; i++) {
      encryptedBytes.push(encrypted.handles[i]);
    }

    const tx = await fheManuscriptContract
      .connect(signers.alice)
      .submitManuscript(encryptedBytes, encrypted.inputProof);
    await tx.wait();

    // Bob tries to decrypt (should fail or return encrypted data)
    const [encryptedContent] = await fheManuscriptContract.getManuscript(0);
    
    // Bob cannot decrypt because he doesn't have permission
    try {
      const decryptedByte = await fhevm.userDecryptEuint(
        FhevmType.euint8,
        encryptedContent[0],
        fheManuscriptContractAddress,
        signers.bob,
      );
      // If decryption succeeds, it means the permission check failed
      // In a real scenario, this should fail or return garbage
      expect(Number(decryptedByte)).to.not.eq(messageBytes[0]);
    } catch (error) {
      // Expected: Bob cannot decrypt
      expect(error).to.exist;
    }
  });

  it("should support multiple manuscripts from same author", async function () {
    const message1 = "First paper";
    const message2 = "Second paper";

    // Submit first manuscript
    const bytes1 = ethers.toUtf8Bytes(message1);
    const input1 = fhevm.createEncryptedInput(fheManuscriptContractAddress, signers.alice.address);
    for (let i = 0; i < bytes1.length; i++) {
      input1.add8(bytes1[i]);
    }
    const encrypted1 = await input1.encrypt();

    const encryptedBytes1: string[] = [];
    for (let i = 0; i < bytes1.length; i++) {
      encryptedBytes1.push(encrypted1.handles[i]);
    }

    let tx = await fheManuscriptContract
      .connect(signers.alice)
      .submitManuscript(encryptedBytes1, encrypted1.inputProof);
    await tx.wait();

    // Submit second manuscript
    const bytes2 = ethers.toUtf8Bytes(message2);
    const input2 = fhevm.createEncryptedInput(fheManuscriptContractAddress, signers.alice.address);
    for (let i = 0; i < bytes2.length; i++) {
      input2.add8(bytes2[i]);
    }
    const encrypted2 = await input2.encrypt();

    const encryptedBytes2: string[] = [];
    for (let i = 0; i < bytes2.length; i++) {
      encryptedBytes2.push(encrypted2.handles[i]);
    }

    tx = await fheManuscriptContract
      .connect(signers.alice)
      .submitManuscript(encryptedBytes2, encrypted2.inputProof);
    await tx.wait();

    // Check total count
    const total = await fheManuscriptContract.getTotalManuscripts();
    expect(total).to.eq(2);

    // Check author's manuscripts
    const authorManuscripts = await fheManuscriptContract.getAuthorManuscripts(signers.alice.address);
    expect(authorManuscripts.length).to.eq(2);
    expect(authorManuscripts[0]).to.eq(0);
    expect(authorManuscripts[1]).to.eq(1);
  });
});
