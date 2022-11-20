import { Module, forwardRef } from "@nestjs/common";
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
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
