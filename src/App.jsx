import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './index.css';
import abi from "./utils/WavePortal.json"
import { ConnectionButton } from "./components/ConnectButton";

//wagmi hooks
import { useConnect, useContractRead, useAccount } from "wagmi";

export default function App() {

	const [currentAccount, setCurrentAccount] = useState("")
	const [message, setMessage] = useState("")
	const [totalWaves, setTotalWaves] = useState(0)
	const [allWaves, setAllWaves] = useState([])

	const contractAddress = "0xA67Ba59788E2D8d341b52AA479f563BC6C17c9Dd"
	const contractABI = abi.abi;

	const {address, isConnected} = useAccount();
	//const {connect} = useConnect()
	//console.log("is this bitch connected:", connect)
	console.log("connections", address, isConnected)

	const {data:wavesx} = useContractRead({
		addressOrName: contractAddress,
		contractInterface: contractABI,
		functionName: 'getAllWaves',
	});

	const {data:wavesNumberx} = useContractRead({
		addressOrName: contractAddress,
		contractInterface: contractABI,
		functionName: 'getTotalWaves'
	});

	console.log("please get wavesx", wavesx)
	console.log("total waves",wavesNumberx)

	const getAllWaves = async() => {
		const { ethereum } = window;
		// console.log("logging some waves", wavesx)
		// console.log(wavesNumberx)

		try{

			if (ethereum){
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
				const waves = await wavePortalContract.getAllWaves();
				const wavesNumber = await wavePortalContract.getTotalWaves();

				console.log(waves)
				
				let wavesArray = [];
				waves.forEach( wave => {
					wavesArray.push({
						address: wave.waver,
						timestamp : new Date(wave.timestamp * 1000),
						message : wave.message
					});
				});

				setAllWaves(wavesArray)
				setTotalWaves(wavesNumber.toNumber())
				console.log(wavesArray)
				
			}else{
				console.log("You are not logged in with metamask")
			}
			
			
		}catch(error){
			console.log(error)
		}
		
	};

	const checkIfWalletIsConnected = async () => {

		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log("Make sure that you are connected with metamask");
			} else {
				console.log("We have the ethereum object", ethereum)
			}

			//check wallet access authorisation

			const accounts = await ethereum.request({ method: "eth_accounts" })

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log("Found an authorised account", account)
				setCurrentAccount(account)
			} else {
				console.log("No authorised accounts")
			}

		} catch (error) {
			console.log(error)
		}

	}

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get some Metamask, even though Rainbow is better");
				return;
			}

			const accounts = await ethereum.request({ method: "eth_requestAccounts" });
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0])

		} catch (error) {
			console.log(error)
		}
	}



	const wave = async () => {
		try {
			const { ethereum } = window; //injected by metamask window.

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

				let count = await wavePortalContract.getTotalWaves();
				console.log("Retrieved total wave count...", count.toNumber());


				//lets do the wave

				const waveTxn = await wavePortalContract.wave(message, {gasLimit: 300000});
				console.log("GM sent with the message %s", message)
				console.log("Mining....", waveTxn.hash);

				await waveTxn.wait();
				console.log("Mined-----", waveTxn.hash);
				setMessage("")

				count = await wavePortalContract.getTotalWaves();
				console.log("Retrieved total wave count...", count.toNumber());
				setTotalWaves(count.toNumber())

				let waves = await wavePortalContract.getAllWaves();
				console.log("Retrieved these waves", waves);

			} else {
				console.log("Oh buddy, it does not look like you have the ethereum object")
			}

		} catch (error) {
			console.log(error);
		}


	}

	useEffect(() => {
		checkIfWalletIsConnected();
		getAllWaves();
	}, []) //will only load once when the page is rendered,

	return (
			<div className="flex flex-col place-items-center max-w-full mt-16 space-y-4">
	
				<div className="flex flex-col place-items-center max-w-xl space-y-4">
					<div className="text-4xl font-semibold text-center">
						👋🏿 GM there mfer!
	        		</div>
	
					<div className="text-base text-center mb-4">
						I am Farai, I work as a mechanical engineer but looking to transition to Web3. Have done some cool shits before!
	        		</div>
					{!currentAccount && (
						<>
						<button className="btn btn-wide" onClick={connectWallet}>
							GM 👋🏿, Connect Wallet
	        			</button>
						<ConnectionButton/>
						</>
					) }	
					

				</div>

				{currentAccount && (

				<div> 
					<div className="form-control">
						<label className="label">
    					<span className="label-text">Write some GM message and wave!</span>
  					</label> 
					  <textarea onChange={(e)=> setMessage(e.target.value)} placeholder="Say GM!" className="textarea textarea-bordered mb-4"/>
						<button className="btn btn-wide" onClick={wave}>
						Wave at Me
	        	</button>
					</div>
				</div>
				)}


				<div className="mt-4 text-2xl font-bold">
					Following Mfers have said GM!
				</div>

				<div className="stats shadow">
				  <div className="stat">
				    <div className="stat-title">Total GMs 👋🏿</div>
				    <div className="stat-value">{totalWaves}</div>
				    <div className="stat-desc">Make number go 📈</div>
				  </div>
				</div>

				
				{allWaves.map((wave) => {
				return (
				<div> 
					<div className="card w-96 bg-base-100 shadow-xl">
					  <div className="card-body">
					    <p className="text-sm font-extrabold truncate ...">From: {wave.address}</p>
							<p className="font-bold truncate ...">{wave.timestamp.toString()}</p>
					    <p className="text-base">{wave.message}</p>
					  </div>
				</div>
				</div>
				)})}
		
				
				
	</div>

			
	);
}
