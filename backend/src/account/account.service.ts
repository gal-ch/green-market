import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  create(email: string, password: string) {
    const account = this.accountRepository.create({email, password});
    return this.accountRepository.save(account);
  }

  findOne(id: number): Promise<Account> {
    return this.accountRepository.findOneBy({ id });
  }

  async findByEmail(email: string) {    
    return await this.accountRepository.findOneBy({email});
  }

  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {    
    const account = await this.accountRepository.findOneBy({ id });
    if (!account) {
      throw new NotFoundException(`account with id ${id} not found`);
    }
    Object.assign(account, updateAccountDto);
    return this.accountRepository.save(account);
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
