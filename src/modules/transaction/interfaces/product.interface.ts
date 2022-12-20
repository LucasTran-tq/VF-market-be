/* eslint-disable @typescript-eslint/no-empty-interface */

import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionDocument } from '../schemas/transaction.schema';

export interface ITransactionDocument extends TransactionDocument {}

export interface ITransactionCreate extends CreateTransactionDto {}
