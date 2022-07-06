const { expect } = require("chai");
const { ethers } = require("hardhat");


const toWei = (number)=> ethers.utils.parseEther(number.toString());
const fromWei = (number)=> ethers.utils.parseEther(number);
describe("NFT marketPlace", () => {
  let deployer, addr1, addr2, nft, marketPlace;
  const feePercent = 1;
  const URI = "sample URI";
  beforeEach(async () => {
    const NFT = await ethers.getContractFactory("NFT");
    const MarketPlace = await ethers.getContractFactory("MarketPlace");
    [deployer, addr1, addr2] = await ethers.getSigners();

    nft = await NFT.deploy();
    marketPlace = await MarketPlace.deploy(feePercent);
  });

  describe("deployment", () => {
    it("should track symbol and name", async () => {
      expect(await nft.name()).equal("DAPP");
      expect(await nft.symbol()).equal("DX");
    });
    it("should track feePercent and feeAccount", async () => {
      expect(await marketPlace.feePercent()).equal(feePercent);
      expect(await marketPlace.feeAccount()).equal(deployer.address);
    });
  });
  describe("minting NFTs", () => {
    it("should track the minted NFT", async () => {
        // addr1
      await nft.connect(addr1).mint(URI);
      expect(await nft.tokenCount()).equal(1);
      expect(await nft.tokenURI(1)).equal(URI)
        //addr2
      await nft.connect(addr2).mint(URI);
      expect(await nft.tokenCount()).equal(2);
      expect(await nft.tokenURI(1)).equal(URI);
    });
  });

  describe("marketPlace Items",()=>{
    beforeEach(async ()=>{
        await nft.connect(addr1).mint(URI);
        await nft.connect(addr1).setApprovalForAll(marketPlace.address, true);
    })
    it("shoudl track newly created Item, transfer NFT from seller to marketPlace and emit even", async ()=>{
        // expect(marketPlace.connect(addr1).makeItem(nft.address, 1, toWei(1)))
        //   .emit(marketPlace, "Offered")
        //   .withArgs(1, nft, 1, toWei(1), addr1.address);
        //   console.log(
        //    typeof marketPlace.address,
        //     "ERRRRRR",
        //    typeof await nft.ownerOf(1)
        //   )
        // const addressTest = await nft.ownerOf(1);
        // expect(adrs).equal(marketPlace.address);
        // const item = await marketPlace.items(1)
        // expect(item.price).equal(toWei(1))
        // expect(item.itemId).equal(1);
        // expect(item.tokenId).equal(1);
        // expect(item.isSold).equal(false);
        // expect(item.nft).equal(nft.address);
    })
    it("should fail because price is 0", async () => {
        await expect(
            marketPlace.connect(addr1).makeItem(
                nft.address, 1,0
            )
        ).revertedWith("Price must be greater than 0");
    })
  });


  describe("Purchasing MarketPlace", () => {
     const price = 2;
     beforeEach(async () => {
       await nft.connect(addr1).mint(URI);
       await nft.connect(addr1).setApprovalForAll(marketPlace.address, true);
       await marketPlace.connect(addr1).makeItem(nft.address, 1, toWei(price));
     });
    it("should update as item sold, pay Seller, transfer NFT to Buyer,charge Fee, and bought event dispatched", async ()=>{
        const sellerInitialBalance = await addr1.getBalance();
        // const buyerInitialBalance = await ethers.getBalance(addr2);
        const feeAccountInitialBalance = await deployer.getBalance();

        let totalPriceInWei = await marketPlace.getTotalPrice(1);
        await expect(
            marketPlace.connect(addr2).purchaseItem(
                1, {value : totalPriceInWei}
            )
        ).emit(marketPlace, "Bought").withArgs(
            1, nft.address, 1, toWei(price), addr1.address, addr2.address
        );
        const sellerFinalBalance = await addr1.getBalance();
        const feeAccountFinalBalance = await deployer.getBalance();
        const fee = (feePercent/100) * price;
        // expect(fromWei(feeAccountFinalBalance)).equal(
        //   fee + fromWei(feeAccountInitialBalance)
        // );

    })
  })
});
