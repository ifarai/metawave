import React, { useEffect, useState } from "react";
import './index.css';
import abi from "./utils/WavePortal.json"
import { ConnectionButton } from "./components/ConnectButton";

//wagmi hooks
import { useConnect, useContractRead, useAccount, usePrepareContractWrite, useContractWrite } from "wagmi";

export default function App() {


	const [message, setMessage] = useState("")
	const [totalWaves, setTotalWaves] = useState(0)
	const [allWaves, setAllWaves] = useState([])

	const contractAddress = "0xA67Ba59788E2D8d341b52AA479f563BC6C17c9Dd"
	const contractABI = abi.abi;

	const {isConnected} = useAccount();
	const {config} = usePrepareContractWrite({
		addressOrName : contractAddress,
		contractInterface : contractABI,
		functionName : 'wave',
		args : [message],
		overrides : {
			gasLimit: 300000,
		}
	})

	const {write, isLoading} = useContractWrite(config)

	const {data:waves} = useContractRead({
		addressOrName: contractAddress,
		contractInterface: contractABI,
		functionName: 'getAllWaves',
		watch: true,
		onSuccess(waves) {
			console.log('Success', waves)}
	});

	const {data:wavesNumber} = useContractRead({
		addressOrName: contractAddress,
		contractInterface: contractABI,
		functionName: 'getTotalWaves',
		watch: true,
		onSuccess(wavesNumber) {
			console.log('Success', wavesNumber.toNumber())}
	});


	const getAllWaves = async(waves) => {
	
		try{

			if (waves){
				
				let wavesArray = [];
				waves.forEach( wave => {
					wavesArray.push({
						address: wave.waver,
						timestamp : new Date(wave.timestamp * 1000),
						message : wave.message
					});
				});

				setAllWaves(wavesArray)
				
			}else{
				console.log("You are not logged in with metamask")
			}
			
			
		}catch(error){
			console.log(error)
		}
		
	};

	const wave = async () => {
		
		try {

			if (isConnected) {
				write()
				console.log("SHOULD HAVE WAVED??")
				setMessage("")

			} else {
				console.log("Looks like there is no connected account")
			}

		} catch (error) {
			console.log(error);
		}


	}

	useEffect(() => {
		
		if (wavesNumber){
			setTotalWaves(wavesNumber.toNumber())
		}

		if (waves){
			getAllWaves(waves);
			setMessage("")
		}

		
	}, [wavesNumber, waves])

	return (
			<div className="flex flex-col place-items-center max-w-full mt-16 space-y-4">
	
				<div className="flex flex-col place-items-center max-w-xl space-y-4">
					<div className="text-4xl font-semibold text-center">
						👋🏿 GM there mfer!
	        		</div>
	
					<div className="text-base text-center mb-4">
						I am Farai, I work as a mechanical engineer but looking to transition to Web3. 
						<p>Connect Wallet and say hi</p>
	        		</div>
				
					<ConnectionButton/>
				</div>

				{isConnected && (

				<div> 
					<div className="form-control">
						<label className="label">
    					<span className="label-text">Write some GM message and wave!</span>
  						</label> 
					  	<textarea value={message} onChange={(e)=> setMessage(e.target.value)} placeholder="Say GM!" className="textarea textarea-bordered mb-4"/>
						<button className="btn btn-wide" onClick={wave} disabled={isLoading}>
							{isLoading? "Waving..." : "Wave at Me"}
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

				<div className="flex flex-col scroll-auto space-y-4 max-h-screen overflow-y-auto">
					{[...allWaves].reverse().map((wave) => {
					return (
					<div key={wave.timestamp.toString()}> 
						<div className="card w-96 bg-base-100 shadow-xl bg-slate-600">
						<div className="card-body">
							<h4 className="text-sm font-extrabold truncate ...">From: {wave.address}</h4>
								<p className="font-sm">{wave.timestamp.toString()}</p> 
							<p className="">{wave.message}</p>
						</div>
						</div>
					</div>
					
					)})}
				</div>
			</div>		
	);
}
