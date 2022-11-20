import { Module, forwardRef } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { Transaction } from "./transactions.entity";
import { TransactionsController } from "./transactions.controller";
import { TypeOrmModule } from "@nestjs/typeorm";

import { NftModule } from "../nft/nft.module";
import { ConfigurationModule } from "../configuration/configuration.module";
import { NFT } from "src/nft/nft.entity";
@Module({
  imports: [
    forwardRef(() => NftModule),
    ConfigurationModule,
    TypeOrmModule.forFeature([Transaction, NFT]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
