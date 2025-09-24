require("dotenv").config();
const { ethers } = require("ethers");
const readline = require("readline");

// === CONFIG ===
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const ABI = [
  "function deposit(uint256 assets, address receiver) payable returns (uint256)",
  "function requestRedeem(uint256 shares, address receiver, address owner) returns (uint256)",
  "function claimRedeem(address receiver) returns (uint256)",

  // view helper (jika kontrak support)
  "function pendingRedeem(address owner) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)" // aprMON balance
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(q) {
  return new Promise((res) => rl.question(q, res));
}

(async () => {
  try {
    console.log("=== aprMONAD CLI ===");
    console.log("1. Deposit ETH → aprMON");
    console.log("2. Request Withdraw (burn aprMON, mulai cooldown)");
    console.log("3. Claim Withdraw (setelah cooldown selesai)");
    console.log("4. Cek saldo claimable & balance aprMON\n");

    const mode = parseInt(await ask("Pilih mode (1/2/3/4): "), 10);

    if (mode === 1) {
      // === Deposit ===
      const amountIn = await ask("💰 Masukkan jumlah ETH untuk deposit: ");
      const tx = await contract.deposit(
        ethers.utils.parseEther(amountIn),
        wallet.address,
        { value: ethers.utils.parseEther(amountIn) }
      );
      const rc = await tx.wait();
      console.log(`✅ Deposit sukses di block ${rc.blockNumber}`);

    } else if (mode === 2) {
      // === Request Withdraw ===
      const amountIn = await ask("🏦 Masukkan jumlah aprMON untuk withdraw: ");
      const tx = await contract.requestRedeem(
        ethers.utils.parseEther(amountIn),
        wallet.address,
        wallet.address
      );
      const rc = await tx.wait();
      console.log(`✅ Request withdraw sukses di block ${rc.blockNumber}`);
      console.log("⏳ Tunggu cooldown (±10 menit) sebelum bisa claim...");

    } else if (mode === 3) {
      // === Claim Withdraw ===
      console.log("🔍 Mengecek pending withdraw...");
      try {
        const pending = await contract.pendingRedeem(wallet.address);
        console.log(`💡 Pending withdraw: ${ethers.utils.formatEther(pending)} ETH`);

        if (pending.eq(0)) {
          console.log("⚠️ Tidak ada withdraw yang bisa di-claim (masih cooldown / belum request).");
          process.exit(0);
        }
      } catch (e) {
        console.log("ℹ️ Kontrak mungkin tidak punya fungsi pendingRedeem, lanjut claim langsung...");
      }

      const tx = await contract.claimRedeem(wallet.address);
      const rc = await tx.wait();
      console.log(`✅ Claim sukses di block ${rc.blockNumber}`);

    } else if (mode === 4) {
      // === Check balances ===
      try {
        const pending = await contract.pendingRedeem(wallet.address);
        console.log(`💡 Pending withdraw: ${ethers.utils.formatEther(pending)} ETH`);
      } catch {
        console.log("ℹ️ pendingRedeem tidak tersedia di kontrak ini.");
      }

      const aprBal = await contract.balanceOf(wallet.address);
      console.log(`🏦 Saldo aprMON kamu: ${ethers.utils.formatEther(aprBal)} aprMON`);

      const ethBal = await provider.getBalance(wallet.address);
      console.log(`💰 Saldo ETH wallet: ${ethers.utils.formatEther(ethBal)} ETH`);
    }

    rl.close();
  } catch (err) {
    console.error("❌ Error:", err);
    rl.close();
  }
})();
