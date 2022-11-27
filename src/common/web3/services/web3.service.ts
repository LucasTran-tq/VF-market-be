import { Injectable } from '@nestjs/common';
import configuration from '../constants/web3.constant';
import Web3 from 'web3';
import Common from '@ethereumjs/common';

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
}
