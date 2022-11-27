import { Module, forwardRef } from "@nestjs/common";
import { Web3Module } from "src/common/web3/web3.module";
import { ConfigurationModule } from "../configuration/configuration.module";
import { TransactionService } from "./services/transaction.service";
import { TransactionController } from "./transaction.controller";
// import { Transaction } from "./transactions.entity";
// import { TransactionsController } from "./transaction.controller";
// import { TypeOrmModule } from "@nestjs/typeorm";

// import { NftModule } from "../nft/nft.module";
// import { ConfigurationModule } from "../configuration/configuration.module";
// import { NFT } from "src/nft/nft.entity";
@Module({
  imports: [
    // forwardRef(() => NftModule),
    // ConfigurationModule,
    // TypeOrmModule.forFeature([Transaction, NFT]),
    Web3Module,
    ConfigurationModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
