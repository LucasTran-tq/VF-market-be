import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Web3Service } from 'src/common/web3/services/web3.service';
import { getTime, CONFIG } from 'src/common/web3/constants/web3.constant';
import { ConfigurationService } from 'src/modules/configuration/services/configuration.service';
import { Abi as LaunchPadABI } from 'src/common/web3/contracts/LaunchPad';

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

        private readonly web3Service: Web3Service,

        private readonly configService: ConfigurationService
    ) {}

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

        // await this.nftService.increaseSold(data.launchpadId);
        return data;
    }

    // @Cron('30 * * * * *')
    // @Timeout(100)
    // @Cron(CronExpression.EVERY_10_SECONDS)
    @Cron(CronExpression.EVERY_30_SECONDS)
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
        // console.log("lastBlock:", lastBlock);
        // console.log('lastBlock:', lastBlock)

        const response = await axios.get(process.env.DOMAIN_BSC, {
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
        // console.log('response:', response);

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
}
