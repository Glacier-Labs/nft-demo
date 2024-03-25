// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract GlacierCollHubNFT is ERC721, Ownable, AccessControl {
    using ECDSA for bytes32;

    // Mapping from Sha256(Collection) to token ID
    mapping(string => uint256) _collectionIds;
    mapping(uint256 => string) _tokenURIs;
    mapping(bytes32 => bool) _mintedSigns;

    string _baseURI0;
    uint256 _tokenId;
    address _signerAddress;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address signerAddress
    ) ERC721(name, symbol) {
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _baseURI0 = baseURI;
        _signerAddress = signerAddress;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        return
            bytes(_baseURI0).length > 0
                ? string(abi.encodePacked(_baseURI0, _tokenURIs[tokenId]))
                : "";
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // -------------------------- ADMIN FUNCTIONS -------------------------------

    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseURI0 = baseURI;
    }

    function setSignerAddress(address signerAddress) public onlyOwner {
        _signerAddress = signerAddress;
    }

    // Allows minting of a new NFT
    function mintNFT(
        address collector,
        string memory hash
    ) public onlyRole(MINTER_ROLE) {
        // Only minters can mint
        require(_collectionIds[hash] == 0, "already minted");

        _tokenId += 1; // 1 to N

        _safeMint(collector, _tokenId);
        _collectionIds[hash] = _tokenId;
        _tokenURIs[_tokenId] = string(
            abi.encodePacked("/", hash, "1", "/meta")
        );
    }

    function mintNFTWithSign(
        address collector,
        string memory hash,
        string memory nonce,
        bytes memory signature
    ) public {
        // check sign
        bytes32 messageHash = keccak256(abi.encodePacked(hash, "@", collector, "@", nonce));
        require(_mintedSigns[messageHash] == false);
        require(
            _signerAddress ==
                messageHash.toEthSignedMessageHash().recover(signature),
            "invalid signature"
        );

        // Only minters can mint
        require(_collectionIds[hash] == 0, "already minted");


        _mintedSigns[messageHash] = true;

        _tokenId += 1; // 1 to N

        _safeMint(collector, _tokenId);
        _collectionIds[hash] = _tokenId;
        _tokenURIs[_tokenId] = string(
            abi.encodePacked("/", hash, "1", "/meta")
        );
    }
}
