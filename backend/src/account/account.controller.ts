import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { AuthGuard } from 'auth/jwt-auth.guard';


@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  //@UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
  }

  @Put(':id')
  async updateAccount(
    @Param('id') id: number,
    @Body() updateAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountService.update(id, updateAccountDto);
  }
}
