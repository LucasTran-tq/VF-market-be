/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseOptions,
    IDatabaseCreateOptions,
    IDatabaseSoftDeleteOptions,
    IDatabaseExistOptions,
} from 'src/common/database/interfaces/database.interface';
import { Web3Service } from 'src/common/web3/services/web3.service';
import { TransactionService } from 'src/modules/transaction/services/transaction.service';
import {
    IProductCheckExist,
    IProductCreate,
} from '../interfaces/product.interface';
// import { UpdateProductDto } from '../dtoa/update-product.dto';
import { IProductService } from '../interfaces/product.service.interface';
import { ProductRepository } from '../repositories/product.repository';
import { ProductDocument, ProductEntity } from '../schemas/product.schema';
import { Abi as NFTAbi } from 'src/common/web3/contracts/NFT';

@Injectable()
export class ProductService implements IProductService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly web3Service: Web3Service,
        // @INject
        private readonly transactionService: TransactionService,
    ) {}

    async create(
        {
            name,
            description,
            price,
            images,
            launchId,
            totalCount,
            totalSold,
        }: IProductCreate,
        options?: IDatabaseCreateOptions
    ): Promise<ProductDocument> {
        const product: ProductEntity = {
            name,
            description,
            price,
            images,
            launchId,
            totalCount,
            totalSold,
        };

        return this.productRepository.create<ProductEntity>(product, options);
    }

    async checkExist(
        name: string,
        options?: IDatabaseExistOptions
    ): Promise<IProductCheckExist> {
        const existProduct: boolean = await this.productRepository.exists(
            {
                name: {
                    $regex: new RegExp(name),
                    $options: 'i',
                },
            },
            options
        );

        return {
            name: existProduct,
        };
    }

    async findAll<T>(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<T[]> {
        return this.productRepository.findAll<T>(find, options);
    }

    async findOneById<T>(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.productRepository.findOneById<T>(_id, options);
    }

    async findOne<T>(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<T> {
        return this.productRepository.findOne<T>(find, options);
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number> {
        return this.productRepository.getTotal(find, options);
    }

    async deleteOneById(
        _id: string,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<ProductDocument> {
        return this.productRepository.deleteOneById(_id, options);
    }

    async deleteOne(
        find: Record<string, any>,
        options?: IDatabaseSoftDeleteOptions
    ): Promise<ProductDocument> {
        return this.productRepository.deleteOne(find, options);
    }

    async getMetadata(id: string): Promise<any> {
        console.log('============ START getMetadata ===============');
        console.log('id: ' + id);
        try {
            const launchpadId =
                await this.transactionService.getLaunchPadByToken(+id);
            console.log('launchpadId: ' + JSON.stringify(launchpadId));

            const data = await this.productRepository.findOne({
                launchId: +launchpadId,
            });
            console.log('data: ' + JSON.stringify(data));

            const date = new Date();
            const today =
                date.getDate() +
                '-' +
                (date.getMonth() + 1) +
                '-' +
                date.getFullYear();
            const newData = {
                ...data,
                tokenId: +id,
                // image: `${process.env.STATIC_SERVER}/upload/${data.image}?${today}`,
            };

            return newData;
        } catch (e) {
            console.log(e);
            return {};
        }
    }

    async getMyNft(account: string) {
        console.log('=== START FUNCTION getMyNft======');
        // const web3 = getWeb3();
        const web3 = this.web3Service.getWeb3();

        try {
            const multicallContract = this.web3Service.getMultiContract(web3);
            console.log(
                ' process.env.CONTRACT_NFT: ' + process.env.CONTRACT_NFT
            );
            console.log('account: ' + account);
            const contractNFT = new web3.eth.Contract(
                NFTAbi as any,
                process.env.CONTRACT_NFT
            );

            const contract = new web3.eth.Contract(
                NFTAbi as any,
                process.env.CONTRACT_LAUNCHPAD
            );
            console.log(
                'balances: ' +
                    (await contractNFT.methods.balanceOf(account).call())
            );
            const balances = Number(
                await contractNFT.methods.balanceOf(account).call()
            );
            console.log('balances: ' + balances);
            let tokenIds = [];
            let tokenInfos = [];

            // ! non-nft
            if (balances == 0) {
                return [];
            }

            const calls = [];

            for (let index = 0; index < balances; index++) {
                calls.push({
                    address: process.env.CONTRACT_NFT,
                    name: 'tokenOfOwnerByIndex',
                    params: [account, index],
                });
            }

            tokenIds = await this.web3Service.multicall(
                multicallContract,
                NFTAbi,
                calls
            );
            // console.log('contractNFT: ' +JSON.stringify(contractNFT))
            console.log('CONTRACT_NFT: ' + process.env.CONTRACT_NFT);
            console.log('balances: ' + balances);
            console.log('multicallContract: ' + multicallContract);
            // console.log('NFTAbi: ' + NFTAbi);
            // console.log('calls: ' + JSON.stringify(calls));
            console.log('tokenIds: ' + tokenIds);
            tokenIds = tokenIds.map((id, index) => id.toString());

            if (tokenIds.length) {
                const callss = [];
                tokenIds.forEach((id) => {
                    callss.push({
                        address: process.env.CONTRACT_NFT,
                        name: 'getToken',
                        params: [+id],
                    });
                });

                tokenInfos = await this.web3Service.multicall(
                    multicallContract,
                    NFTAbi,
                    callss
                );
                // console.log('tokenInfos:', tokenInfos);

                tokenInfos = tokenInfos.map((item) => ({
                    createTimestamp: item.nft.createTimestamp.toNumber(),
                    tokenId: item.tokenId.toNumber(),
                    tokenOwner: item.tokenOwner,
                    uri:
                        `${
                            process.env.STATIC_SERVER_DOMAIN
                        }/product/metadata/${item.tokenId.toNumber()}` ??
                        item.uri,
                    carType: item.nft.carType,
                    carModel: item.nft.carModel,
                }));

                return tokenInfos;
            }
        } catch (e) {
            console.log('get NFT ERROR: ' + e);
            return [];
        }
    }

    async increaseSold(launchpadId: number) {
        const product = await this.productRepository.findOne({ launchpadId });

        await this.productRepository.updateOne(
            { launchpadId },
            { totalSold: product.totalSold++ }
        );
    }
}
