# LyncZ 灵犀支付

**The Trustless CNY-Crypto P2P Exchange**

> 无需信任任何人。公平性由现代密码学保障。我们的代码完全公开和开源。我们没有什么要隐藏的。
> 
> Trust no one. Fairness guaranteed by cryptography. Our code is fully open source. We have nothing to hide.

🌐 **Live on Base Mainnet** | [lync-z.xyz](https://lync-z.xyz)

---

## How It Works

1. **Seller** deposits crypto into escrow, sets exchange rate
2. **Buyer** locks trade, pays seller via Alipay
3. **Buyer** uploads payment receipt
4. **Smart contract** verifies the validity of the payment receipt and releases crypto to buyer

**No intermediaries. No trust required.**

---

## Repository Structure

```
lyncz/
├── apps/web/              # Next.js frontend
├── packages/contracts/    # Solidity smart contracts
├── verifiers/alipay/      # Cryptographic verification circuit
└── services/relay/        # Rust backend
```

---

## Smart Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| LyncZEscrow | [`0x73e800bd2d407c23a2C0fa2998475D5fD6bAc0A2`](https://basescan.org/address/0x73e800bd2d407c23a2C0fa2998475D5fD6bAc0A2) |
| AlipayVerifier | [`0xcB4f5383d087DeCc2DD57098c7352ee0D02250d4`](https://basescan.org/address/0xcB4f5383d087DeCc2DD57098c7352ee0D02250d4) |

**Supported Tokens**: USDC, WETH, cbBTC

---

## Documentation

For technical details, architecture, and API reference, see our [Documentation](https://www.lync-z.xyz/docs).

---

MIT License
