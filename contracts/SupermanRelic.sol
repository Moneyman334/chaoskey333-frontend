// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SupermanRelic
 * @dev An ERC-721 contract for Superman Relic NFTs with minting capabilities
 */
contract SupermanRelic is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    string private _baseTokenURI;
    uint256 public maxSupply;
    
    event RelicMinted(address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string newBaseURI);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        uint256 _maxSupply
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
        maxSupply = _maxSupply;
    }
    
    /**
     * @dev Mints a new Superman Relic NFT
     * @param to The address to mint the NFT to
     * @return tokenId The ID of the minted token
     */
    function mintRelic(address to) public onlyOwner returns (uint256) {
        require(_tokenIdCounter.current() < maxSupply, "Maximum supply reached");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        
        emit RelicMinted(to, tokenId);
        return tokenId;
    }
    
    /**
     * @dev Public mint function for users (can be restricted with payment logic)
     * @param to The address to mint the NFT to
     * @return tokenId The ID of the minted token
     */
    function publicMintRelic(address to) public returns (uint256) {
        require(_tokenIdCounter.current() < maxSupply, "Maximum supply reached");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(to, tokenId);
        
        emit RelicMinted(to, tokenId);
        return tokenId;
    }
    
    /**
     * @dev Sets the base URI for token metadata
     * @param baseTokenURI The new base URI
     */
    function setBaseURI(string memory baseTokenURI) public onlyOwner {
        _baseTokenURI = baseTokenURI;
        emit BaseURIUpdated(baseTokenURI);
    }
    
    /**
     * @dev Updates the maximum supply
     * @param _maxSupply The new maximum supply
     */
    function setMaxSupply(uint256 _maxSupply) public onlyOwner {
        require(_maxSupply >= _tokenIdCounter.current(), "New max supply must be >= current supply");
        maxSupply = _maxSupply;
        emit MaxSupplyUpdated(_maxSupply);
    }
    
    /**
     * @dev Returns the base URI for tokens
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Returns the total number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Returns the current token ID counter
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Returns whether a token exists
     * @param tokenId The token ID to check
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }
}