// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract GlacierCollHubNFT1155 is ERC1155, Ownable, AccessControl {
    using ECDSA for bytes32;

    event MintCollection(address indexed operator, address indexed to, string collhash, uint256 tokenId, uint256 amount);

    // Mapping from Sha256(Collection) to token ID
    mapping(string => uint256) public collectionIds;
    mapping(uint256 => string) public idcollections;
    mapping(uint256 => address) public idowners;
    mapping(bytes32 => bool) public mintedSigns;
    uint256 public tokenId;
    address public signerAddress;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(
        string memory baseURI,
        address _signerAddress
    ) ERC1155(baseURI) {
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        signerAddress = _signerAddress;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function uri(uint256 _tokenId) public view virtual override returns (string memory) {
        string memory coll = idcollections[_tokenId];
        return string(
            abi.encodePacked(super.uri(_tokenId), "/", coll, "1", "/meta")
        );
    }

    // -------------------------- ADMIN FUNCTIONS -------------------------------

    function setBaseURI(string memory baseURI) public onlyOwner {
        _setURI(baseURI);
    }

    function setSignerAddress(address _signerAddress) public onlyOwner {
        signerAddress = _signerAddress;
    }

    // Allows minting of a new NFT
    function mintCollection(
        address collector,
        string memory coll
    ) public onlyRole(MINTER_ROLE) {
        // Only minters can mint
        require(collectionIds[coll] == 0, "already minted");

        tokenId += 1; // 1 to N

        _mint(collector, tokenId, 1, "");
        collectionIds[coll] = tokenId;
        idcollections[tokenId] = coll;

        idowners[tokenId] = collector;

        emit MintCollection(msg.sender, collector, coll, tokenId, 1);
    }

    function mintCollectionWithSign(
        address collector,
        string memory coll,
        bytes memory signature
    ) public {
        // check sign
        bytes32 messageHash = keccak256(abi.encodePacked(coll, "@", collector));
        require(mintedSigns[messageHash] == false, "already minted");
        require(
            signerAddress ==
                messageHash.toEthSignedMessageHash().recover(signature),
            "invalid signature"
        );

        // Only minters can mint
        require(collectionIds[coll] == 0, "already minted");

        mintedSigns[messageHash] = true;

        tokenId += 1; // 1 to N

        _mint(collector, tokenId, 1, "");
        collectionIds[coll] = tokenId;
        idcollections[tokenId] = coll;

        idowners[tokenId] = collector;

        emit MintCollection(msg.sender, collector, coll, tokenId, 1);
    }

    // ==================== colletion owner =======================

    function mintByOwner(
        uint256 _tokenId,
        uint256 amount
    ) public {
        require(idowners[_tokenId] == msg.sender, "Ownable: caller is not the owner");
        _mint(msg.sender, _tokenId, amount, "");
    }
}
