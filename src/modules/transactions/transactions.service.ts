import { Injectable, forwardRef, Inject } from "@nestjs/common";
import { Transaction } from "./transactions.entity";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository, getMongoRepository, getMongoManager, In } from "typeorm";

import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { QueryTransactionDto } from "./dto/query-transaction.dto";

import { ConfigurationService } from "../configuration/configuration.service";

import { getWeb3 } from "../utils/web3";

import { Cron, Timeout } from "@nestjs/schedule";

import { getTime, CONFIG, GET_AMOUNT_LAUNCHPAD } from "../config";

import { Abi as LaunchPadABI } from "../contract/LaunchPad";
import axios from "axios";

import { NftService } from "../nft/nft.service";
import { NFT } from "src/nft/nft.entity";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const abiDecoder = require("abi-decoder");

interface QueryTransMarket {
  isMarket?: boolean;
  address?: string;
  refCode?: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,

    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,

    private readonly configService: ConfigurationService,

    @Inject(forwardRef(() => NftService))
    private readonly nftService: NftService
  ) {}

  async findAll(query: QueryTransactionDto) {
    const { page, limit, refCode, address } = query;

    const queryTemp: QueryTransMarket = { isMarket: true };

    if (address) {
      queryTemp.address = address.toLowerCase();
    }

    if (refCode) {
      queryTemp.refCode = refCode;
    }

    const [data, count] = await this.transactionsRepository.findAndCount({
      where: queryTemp,

      order: { createdAt: -1 },
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async findTransMarket(query: QueryTransMarket) {
    const { address, refCode } = query;

    const queryTemp: QueryTransMarket = { isMarket: true };

    if (address) {
      queryTemp.address = address.toLowerCase();
    }

    if (refCode) {
      queryTemp.refCode = refCode;
    }

    const data = await this.transactionsRepository.findOne(queryTemp);

    return data;
  }

  async findMarketTransaction(query: QueryTransactionDto) {
    const { page, limit } = query;
    const [data, count] = await this.transactionsRepository.findAndCount({
      where: { isMarket: true },

      order: { createdAt: -1 },
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const web3 = getWeb3();

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
      "Buy",
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

    const item = await this.transactionsRepository.create(createTransactionDto);
    const data = await this.transactionsRepository.save(item);

    await this.nftService.increaseSold(data.launchpadId);
    return data;
  }

  async getAmountByRef(refCode: string) {
    try {
      const queryTemp = {};

      const data = await this.transactionsRepository.find(queryTemp);

      let total = 0;

      data.forEach((item) => (total += item.amount));

      return total;
    } catch (e) {}
  }

  async getLaunchPadByToken(tokenId: number) {
    try {
      console.log('tokenId:', tokenId)
      const trans = await this.transactionsRepository.findOne({
        tokenId: +tokenId,
      });
      console.log('trans:', trans)
      return trans.launchpadId;
    } catch (e) {
      throw new Error(e);
    }
  }

  async getLaunchPadsByTokens(tokenIds: number[]) {
    // console.log("tokenIds:", tokenIds);
    try {
      const trans = await this.transactionsRepository.find({
        where: {
          tokenId: { $in: tokenIds },
        },
      });

      return trans;
    } catch (e) {
      // return []
      throw new Error(e);
    }
  }

  @Cron("30 * * * * *")
  // @Timeout(100)
  async handleCron() {
    if (this?.["IS_IN_CRONJOB"]) {
      console.log(`\n\n====SKIPPP THIS ROUND at ${getTime(new Date())}===\n\n`);
      return;
    }
    this["IS_IN_CRONJOB"] = true;
    try {
      console.log(`\n\n====START THIS ROUND at ${getTime(new Date())}===\n\n`);
      await this.fetchTrans();
    } catch (e) {
      console.log("cronTransaction failed: ", e);
    } finally {
      console.log("\n\n====END THIS ROUND===\n\n");
      this["IS_IN_CRONJOB"] = false;
    }
  }

  async fetchTrans() {
    const lastBlock = await this.configService.findOne(CONFIG.LAST_BLOCK);
    console.log('lastBlock:', lastBlock.value)
    // console.log("lastBlock:", lastBlock);
    // console.log('lastBlock:', lastBlock)

    const response = await axios.get(process.env.DOMAIN_BSC, {
      params: {
        address: process.env.CONTRACT_LAUNCHPAD,
        apikey: process.env.BSC_API_KEY,
        action: "txlist",
        module: "account",
        sort: "desc",
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
     

      if (item.txreceipt_status == 1) {
        if (data?.name == "buyNFT") {
          const { returnValues } = await this.fetchEvent(
            "Buy",
            item.blockNumber,
            item.hash
          );
          console.log('returnValues:', returnValues)

          const nft = await this.nftRepository.findOne({
            launchId: +returnValues.launchIndex,
          });
          const price = nft ? nft.price : 0;

          newData.address = returnValues.user.toLowerCase();
          newData.launchpadId = +returnValues.launchIndex;
          newData.tokenId = +returnValues.nftId;
          newData.refCode = returnValues.refCode;
          // newData.amount = +GET_AMOUNT_LAUNCHPAD[returnValues.launchIndex];
          newData.price = price;
          newData.level = +returnValues.launchIndex + 1;
          newData.type = "market";
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
    const web3 = getWeb3();

    const contract = new web3.eth.Contract(
      LaunchPadABI as any,
      process.env.CONTRACT_LAUNCHPAD
    );

    const data = await contract.getPastEvents(name || "Receive", {
      fromBlock: blockNumber,
      toBlock: blockNumber,
    });

    const value = Object.values(data).filter(
      (item) => item.transactionHash.toLowerCase() == txHash.toLowerCase()
    )[0];

    return value;
  }
}
