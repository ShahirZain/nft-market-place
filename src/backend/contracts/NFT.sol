// SPDX-License-Identifier: MIT
pragma solidity >=0.7.3;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
contract NFT is ERC721URIStorage{
    uint public tokenCount;
    constructor() ERC721("DAPP","DX"){

    }

    function mint(string calldata _tokenUri) external returns (uint) {
        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenUri);
        return tokenCount;
    }
}