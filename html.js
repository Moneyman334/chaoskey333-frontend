const contract = new ethers.Contract(
  "0xYourContractAddress", // 👈 Replace this with actual deployed contract address
  ["function mint(address to, string memory tokenURI) public"],
  signer
);
