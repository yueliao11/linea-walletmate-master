export const CONTRACTS = {
  LineaAdvisor: {
    address: "0x4b2f2583B3730820D0A8F2076e3a90Af26872B99",
    abi: [
      "function purchaseConsultation() external payable",
      "function checkAccess(address user) external view returns (bool)",
      "function stake() external payable",
      "function unstake(uint256 amount) external",
      "event ConsultationPurchased(address indexed user, uint256 timestamp)",
      "event Staked(address indexed user, uint256 amount)",
      "event Unstaked(address indexed user, uint256 amount)"
    ]
  }
}; 