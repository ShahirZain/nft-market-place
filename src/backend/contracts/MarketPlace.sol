// SPDX-License-Identifier: MIT
pragma solidity >=0.7.3;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MarketPlace is ReentrancyGuard{
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;
    struct Item{
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool isSold;
    }
    event Offered(
        uint itemId,
        IERC721 indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );
    event Bought(
        uint itemId,
        IERC721 indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );
    mapping(uint => Item) public items;
    constructor(uint _feePercent){
        feePercent = _feePercent;
        feeAccount = payable(msg.sender);    
    }

    function makeItem (IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "Price must be greater than 0");
        itemCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        items[itemCount] = Item({
            itemId: itemCount,
            nft: _nft,
            tokenId: _tokenId,
            price: _price,
            seller: payable(msg.sender),
            isSold: false
        });
        emit Offered(itemCount, _nft, _tokenId, _price, msg.sender);   
    }

    function purchaseItem(uint _itemId) external payable nonReentrant{
        uint totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(items[_itemId].isSold == false, "Item is already sold");
        require(items[_itemId].price <= msg.value, "Price is too high");
        
        item.seller.transfer(item.price);
        feeAccount.transfer(totalPrice - item.price);
        item.nft.transferFrom(address(this), item.seller, item.tokenId);
        item.isSold = true;

        emit Bought(itemCount, item.nft, item.tokenId, item.price, item.seller, msg.sender);
    }

    function getTotalPrice(uint itemId) view public returns(uint){
      return (items[itemId].price * (100 + feePercent) / 100);
    } 
}