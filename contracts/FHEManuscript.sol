// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Manuscript Contract
/// @notice A contract for storing encrypted manuscripts on-chain with FHE encryption
/// @dev Only the author can decrypt their own manuscript using their private key
contract FHEManuscript is SepoliaConfig {
    struct Manuscript {
        euint8[] encryptedContent; // Encrypted manuscript content as array of encrypted bytes
        address author; // Author's address
        uint256 timestamp; // Submission timestamp
        bool exists; // Whether the manuscript exists
    }

    mapping(uint256 => Manuscript) public manuscripts;
    mapping(address => uint256[]) public authorManuscripts; // Author address => manuscript IDs
    
    uint256 public nextManuscriptId;
    
    event ManuscriptSubmitted(
        uint256 indexed manuscriptId,
        address indexed author,
        uint256 timestamp
    );

    /// @notice Submit an encrypted manuscript
    /// @param encryptedContent Array of encrypted bytes (each byte as externalEuint8)
    /// @param inputProof The input proof for the encrypted content
    /// @return manuscriptId The ID of the submitted manuscript
    function submitManuscript(
        externalEuint8[] calldata encryptedContent,
        bytes calldata inputProof
    ) external returns (uint256) {
        require(encryptedContent.length > 0, "Empty content");
        require(encryptedContent.length <= 32, "Content too long (max 32 bytes)");
        
        uint256 manuscriptId = nextManuscriptId;
        nextManuscriptId++;
        
        // Convert external encrypted bytes to internal euint8 array
        euint8[] memory encryptedBytes = new euint8[](encryptedContent.length);
        for (uint256 i = 0; i < encryptedContent.length; i++) {
            euint8 encryptedByte = FHE.fromExternal(encryptedContent[i], inputProof);
            encryptedBytes[i] = encryptedByte;
            
            // Allow the author to decrypt each byte
            FHE.allowThis(encryptedByte);
            FHE.allow(encryptedByte, msg.sender);
        }
        
        manuscripts[manuscriptId] = Manuscript({
            encryptedContent: encryptedBytes,
            author: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        authorManuscripts[msg.sender].push(manuscriptId);
        
        emit ManuscriptSubmitted(manuscriptId, msg.sender, block.timestamp);
        
        return manuscriptId;
    }

    /// @notice Get the encrypted content of a manuscript
    /// @param manuscriptId The ID of the manuscript
    /// @return encryptedContent The encrypted content as array of encrypted bytes
    /// @return author The author's address
    /// @return timestamp The submission timestamp
    /// @return exists Whether the manuscript exists
    function getManuscript(uint256 manuscriptId)
        external
        view
        returns (
            euint8[] memory encryptedContent,
            address author,
            uint256 timestamp,
            bool exists
        )
    {
        Manuscript memory manuscript = manuscripts[manuscriptId];
        return (
            manuscript.encryptedContent,
            manuscript.author,
            manuscript.timestamp,
            manuscript.exists
        );
    }

    /// @notice Get all manuscript IDs for an author
    /// @param author The author's address
    /// @return manuscriptIds Array of manuscript IDs
    function getAuthorManuscripts(address author)
        external
        view
        returns (uint256[] memory)
    {
        return authorManuscripts[author];
    }

    /// @notice Get the total number of manuscripts
    /// @return count The total count
    function getTotalManuscripts() external view returns (uint256) {
        return nextManuscriptId;
    }
}
