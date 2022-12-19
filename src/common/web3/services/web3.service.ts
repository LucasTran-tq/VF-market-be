import { Injectable } from '@nestjs/common';
import configuration from '../constants/web3.constant';
import { getMultiContract } from '../constants/web3.constant';
import Web3 from 'web3';
import Common from '@ethereumjs/common';
import { Interface } from '@ethersproject/abi';

@Injectable()
export class Web3Service {
    // constructor() {}

    getNodes(): string {
        return configuration()[process.env.CHAIN_ID ?? 97]?.appNodes;
    }

    getRandomNode() {
        const BSC_NODE_RPC = this.getNodes();
        return BSC_NODE_RPC[Math.floor(Math.random() * BSC_NODE_RPC?.length)];
    }

    getRandomWeb3() {
        const provider: string = this.getRandomNode();
        const newWeb3 = new Web3(provider);

        return newWeb3;
    }

    getWeb3 = () => {
        return this.getRandomWeb3();
    };

    getCustomNetwork = (chainId: number) => {
        const customNetwork = Common.forCustomChain('mainnet', {
            name: 'bnb',
            networkId: chainId,
            chainId,
        });

        return customNetwork;
    };

    getMultiContract(web3) {
        return getMultiContract(web3);
    }

    async multicall(multi, abi, calls) {
        const itf = new Interface(abi);

        const calldata = calls.map((call) => [
            call.address.toLowerCase(),
            itf.encodeFunctionData(call.name, call.params),
        ]);
        const { returnData } = await multi.methods.aggregate(calldata).call();
        const res = returnData.map((call, i) =>
            itf.decodeFunctionResult(calls[i].name, call)
        );

        return res;
    }

    async getTokenLength() {
        const web3 = this.getWeb3()

        const contract = new web3.eth.Contract(
            LaunchPadABI as any,
            process.env.CONTRACT_LAUNCHPAD
        );

        

        return res;
    }
}
