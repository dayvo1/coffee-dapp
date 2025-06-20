import {
  createWalletClient,
  custom,
  createPublicClient,
  parseEther,
  defineChain,
  formatEther,
  WalletClient,
  PublicClient,
  Chain,
  SimulateContractReturnType,
} from "viem"
import "viem/window"
import { contractAddress, abi } from "./constants-ts"

const connectButton = document.getElementById("connectButton") as HTMLButtonElement
const fundButton = document.getElementById("fundButton") as HTMLButtonElement
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement
const balanceButton = document.getElementById("balanceButton") as HTMLButtonElement
const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement

console.log("Viem wallet client example")

let walletClient: WalletClient | undefined
let publicClient: PublicClient | undefined

async function connect(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    })
    await walletClient.requestAddresses()
    connectButton.innerHTML = "Connected!"
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

async function fund(): Promise<void> {
  const ethAmount = ethAmountInput.value
  console.log(`Funding with ${ethAmount}...`)

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    })
    const [connectedAccount] = await walletClient.requestAddresses()
    const currentChain = await getCurrentChain(walletClient)

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    })

    const { request }: SimulateContractReturnType<typeof abi, "fund"> =
      await publicClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: "fund",
        account: connectedAccount,
        chain: currentChain,
        value: parseEther(ethAmount),
      })

    const hash = await walletClient.writeContract(request)
    console.log(hash)
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

async function getCurrentChain(client: WalletClient): Promise<Chain> {
  const chainId = await client.getChainId()
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  })
  return currentChain
}

async function getBalance(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    })
    const balance = await publicClient.getBalance({
      address: contractAddress,
    })
    console.log(formatEther(balance))
  }
}

async function withdraw(): Promise<void> {
  console.log("withdrawing...")
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    })
    const [connectedAccount] = await walletClient.requestAddresses()
    const currentChain = await getCurrentChain(walletClient)

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    })

    const { request }: SimulateContractReturnType<typeof abi, "withdraw"> =
      await publicClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: "withdraw",
        account: connectedAccount,
        chain: currentChain,
      })

    const hash = await walletClient.writeContract(request)
    console.log(hash)
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw
