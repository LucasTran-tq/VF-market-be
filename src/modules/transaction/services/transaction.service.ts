import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Web3Service } from 'src/common/web3/services/web3.service';
import { getTime, CONFIG } from 'src/common/web3/constants/web3.constant';
import { ConfigurationService } from 'src/modules/configuration/services/configuration.service';
import { Abi as LaunchPadABI } from 'src/common/web3/contracts/LaunchPad';
import { Abi as VFUSDABI } from 'src/common/web3/contracts/Token';
import { ProductService } from 'src/modules/product/services/product.service';
import Web3 from 'web3';
import { IDatabaseFindAllOptions, IDatabaseOptions } from 'src/common/database/interfaces/database.interface';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const abiDecoder = require('abi-decoder');

interface QueryTransMarket {
    isMarket?: boolean;
    address?: string;
    refCode?: string;
}

@Injectable()
export class TransactionService {
    constructor(
        private readonly transactionsRepository: TransactionRepository,

        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
        private readonly web3Service: Web3Service,
        private readonly configService: ConfigurationService
    ) {}

    async findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]> {
        return this.transactionsRepository.findAll<T>(find, options);
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number> {
        return this.transactionsRepository.getTotal(find, options);
    }

    async getLaunchPadByToken(tokenId: number) {
        try {
            const trans = await this.transactionsRepository.findOne({
                tokenId: +tokenId,
            });
            console.log('tokenId: ' + tokenId);
            console.log('trans: ' + JSON.stringify(trans));
            return trans.launchpadId;
        } catch (e) {
            throw new Error(e);
        }
    }

    async createTransaction(createTransactionDto: CreateTransactionDto) {
        const web3 = this.web3Service.getWeb3();

        const [transactionVerified, transactionReceipt] = await Promise.all([
            web3.eth.getTransaction(createTransactionDto.txHash),
            web3.eth.getTransactionReceipt(createTransactionDto.txHash),
        ]);

        if (
            transactionVerified.to.toLowerCase() !=
                process.env.CONTRACT_LAUNCHPAD.toLowerCase() ||
            !transactionReceipt.status
        ) {
            return false;
        }

        const { returnValues } = await this.fetchEvent(
            'Buy',
            transactionReceipt.blockNumber.toString(),
            createTransactionDto.txHash
        );

        createTransactionDto.tokenId = +returnValues.nftId;

        const itemExisted = await this.transactionsRepository.findOne({
            txHash: createTransactionDto.txHash.toLowerCase(),
        });

        if (itemExisted) {
            return false;
        }

        // const item = await this.transactionsRepository.create(
        //     createTransactionDto
        // );
        // const data = await this.transactionsRepository.save(item);

        const data = await this.transactionsRepository.create(
            createTransactionDto
        );
        console.log('create transaction data:', data);

        await this.productService.increaseSold(+data.launchpadId);
        return data;
    }

    // @Cron(CronExpression.EVERY_10_SECONDS)
    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        if (this?.['IS_IN_CRONJOB']) {
            console.log(
                `\n\n====SKIPPP THIS ROUND at ${getTime(new Date())}===\n\n`
            );
            return;
        }
        this['IS_IN_CRONJOB'] = true;
        try {
            console.log(
                `\n\n====START THIS ROUND at ${getTime(new Date())}===\n\n`
            );
            await this.fetchTrans();
            // await this.testCronJob();
        } catch (e) {
            console.log('cronTransaction failed: ', e);
        } finally {
            console.log('\n\n====END THIS ROUND===\n\n');
            this['IS_IN_CRONJOB'] = false;
        }
    }

    async testCronJob() {
        const data = await this.transactionsRepository.create({
            address: '0x123',
            from: '0x456',
            amount: 1,
            type: 'type1',
            txHash: '0x123243143',
            timestamp: '123',
            isOwnerCreated: false,
            launchpadId: 1,
            tokenId: 10,
        });
        console.log('data:', data);
    }

    async fetchTrans() {
        const lastBlock = await this.configService.findOne(CONFIG.LAST_BLOCK);
        console.log('lastBlock:', lastBlock.value);
        
        const response = await axios.get(process.env.DOMAIN_BSC, {
            headers: { "Accept-Encoding": "gzip,deflate,compress" },
            params: {
                address: process.env.CONTRACT_LAUNCHPAD,
                apikey: process.env.BSC_API_KEY,
                action: 'txlist',
                module: 'account',
                sort: 'desc',
                startblock: +lastBlock.value,
                // endblock: +lastBlock + 9999,
            },
        });
        
        abiDecoder.addABI(LaunchPadABI);

        const arr = [];

        for (const item of response.data?.result) {
            // console.log('item:', item)
            const data = abiDecoder.decodeMethod(item.input);

            const newData: any = {
                block: item.blockNumber,
                txHash: item.hash,
                timestamp: +item.timeStamp * 1000,
                from: item.from.toLowerCase(),
            };
            // console.log('newData:', newData);

            if (item.txreceipt_status == 1) {
                if (data?.name == 'buyNFT') {
                    const { returnValues } = await this.fetchEvent(
                        'Buy',
                        item.blockNumber,
                        item.hash
                    );
                    // console.log('returnValues:', returnValues);

                    // const nft = await this.nftRepository.findOne({
                    //     launchId: +returnValues.launchIndex,
                    // });
                    // const price = nft ? nft.price : 0;

                    newData.address = returnValues.user.toLowerCase();
                    newData.launchpadId = +returnValues.launchIndex;
                    newData.tokenId = +returnValues.nftId;
                    newData.refCode = returnValues.refCode;
                    // newData.amount = +GET_AMOUNT_LAUNCHPAD[returnValues.launchIndex];
                    // newData.price = price;
                    newData.level = +returnValues.launchIndex + 1;
                    newData.type = 'market';
                    newData.isOwnerCreated = false;
                    newData.isMarket = true;

                    arr.push(newData);
                }
            }
        }

        const promises = [];

        for (const item of arr) {
            promises.push(this.createTransaction(item));
        }

        await Promise.all(promises);

        if (response.data?.result?.length) {
            await this.configService.update(
                CONFIG.LAST_BLOCK,
                `${response.data?.result[0].blockNumber}`
            );
        }
    }

    async fetchEvent(name: string, blockNumber: string, txHash: string) {
        const web3 = this.web3Service.getWeb3();

        const contract = new web3.eth.Contract(
            LaunchPadABI as any,
            process.env.CONTRACT_LAUNCHPAD
        );

        const data = await contract.getPastEvents(name || 'Receive', {
            fromBlock: blockNumber,
            toBlock: blockNumber,
        });

        const value = Object.values(data).filter(
            (item) => item.transactionHash.toLowerCase() == txHash.toLowerCase()
        )[0];

        return value;
    }

    async topUp(walletAddress: string) {
        console.log('walletAddress:', walletAddress);

        try {
            const web3 = this.web3Service.getWeb3();

            const adminPrk = process.env.ADMIN_PRIVATE_KEY;

            await this.sendBNB(web3, adminPrk, walletAddress);
            await this.sendVFUSD(web3, adminPrk, walletAddress);
        } catch (error) {
            console.log('error:', error);
        }
    }

    async sendBNB(web3: any, adminPrk: string, to: string) {
        try {
            const tx = {
                to: to,
                value: Web3.utils.toWei(0.01 + ''),
                gas: 2000000,
                common: {
                    baseChain: 'mainnet',
                    hardfork: 'petersburg',
                    customChain: {
                        name: 'bnb',
                        networkId: 97,
                        chainId: 97,
                    },
                },
            };

            const signPromise = await web3.eth.accounts.signTransaction(
                tx,
                adminPrk
            );
            console.log('signPromise:', signPromise);

            await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
        } catch (error) {
            console.log('Error in sendBNB');
            console.log('error:', error);
        }
    }

    async sendVFUSD(web3: any, adminPrk: string, to: string) {
        try {
            const contractVFUSD = new web3.eth.Contract(
                VFUSDABI as any,
                process.env.BUSD_ADDRESS,
                {
                    from: process.env.ADMIN_ADDRESS,
                }
            );

            const methods = contractVFUSD.methods.transfer(
                to,
                Web3.utils.toWei(100000 + '')
            );
            const gasEstimate = await methods.estimateGas({
                from: process.env.ADMIN_ADDRESS,
            });
            console.log({ gasEstimate });

            const tx = {
                from: process.env.ADMIN_ADDRESS,
                to: process.env.BUSD_ADDRESS,
                data: methods.encodeABI(),
                gas: gasEstimate,
                // nonce: nonce,
            };

            // Sign the transaction
            console.log('---START signPromise---');
            const signPromise = await web3.eth.accounts.signTransaction(
                tx,
                adminPrk
            );
            console.log('signPromise:', signPromise);

            // signedTx.transactionHash
            await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
        } catch (error) {
            console.log(error);
        }
    }

    // private _addAllowancesContract = async (
    //     addressWallet: string,
    //     starAmount: number,
    //     keywordAmount: number,
    //   ): Promise<{ hash: string; nonce: number }> => {
    //     return new Promise(async (resolve) => {
    //       const contractStar = new this.web3Config.web3.eth.Contract(
    //         Abis721Star as AbiItem[],
    //         this.config.get(‘app.starContractAddress’),
    //       );
    //       const methods = contractStar.methods.increaseAllowances(
    //         addressWallet,
    //         starAmount,
    //         keywordAmount,
    //       );
    //       const nonce = await this.web3Config.web3.eth.getTransactionCount(
    //         this.adminWalletAddress,
    //         ‘pending’,
    //       );
    //       const gasEstimate = await methods.estimateGas({
    //         from: this.adminWalletAddress,
    //       });
    //       // console.log({ gasEstimate });
    //       this.logger.log(nonce, ‘nonce’);
    //       const tx = {
    //         from: this.adminWalletAddress,
    //         to: this.starContractAddress,
    //         data: methods.encodeABI(),
    //         gas: gasEstimate,
    //         nonce: nonce,
    //       };
    //       // Sign the transaction
    //       console.log(‘---START signPromise---’);
    //       const signPromise = this.web3Config.web3.eth.accounts.signTransaction(
    //         tx,
    //         this.adminPrivateKey,
    //       );
    //       signPromise
    //         .then((signedTx) => async () => {
    //           console.log(
    //             ‘The hash of your transaction is: ’,
    //             signedTx.transactionHash,
    //           );
    //           // signedTx.transactionHash
    //           await this.web3Config.web3.eth.sendSignedTransaction(
    //             signedTx.rawTransaction,
    //             function (err, hash) {
    //               if (!err) {
    //                 console.log(‘The hash of your transaction is: ’, hash);
    //                 resolve({ hash: hash, nonce: nonce });
    //               } else {
    //                 resolve(null);
    //                 console.log(
    //                   ‘Something went wrong when submitting your transaction:’,
    //                   err,
    //                 );
    //               }
    //             },
    //           );
    //         })
    //         .catch((err) => {
    //           resolve(null);
    //           console.log(‘Promise failed:’, err);
    //         });
    //     });
    //   };
}
