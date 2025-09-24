# 🌙 AprMoon CLI Bot

CLI bot sederhana untuk berinteraksi dengan **aPriori Monad LST (aprMON)** via smart contract di Monad Testnet.  
Mendukung fitur:

- ✅ Deposit ETH → aprMON
- ✅ Request Withdraw (pending ~10 menit)
- ✅ Claim Withdraw (setelah pending selesai)
- ✅ Cek saldo ETH, aprMON, dan Claimable
- ✅ Auto-monitor withdraw (opsional)

---

## 📦 Install

Clone repo ini:

```bash
git clone https://github.com/panjibae/AprMoon.git
cd AprMoon
cp .env.example .env
npm install
RPC_URL=https://monad-testnet.drpc.org
PRIVATE_KEY=0xyourprivatekey
CONTRACT_ADDRESS=0xb2f82D0f38dc453D596Ad40A37799446Cc89274A
