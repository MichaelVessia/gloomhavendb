import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleId } from '../../../shared/constants/role-id';
import { SuggestedFixType } from '../../../shared/constants/suggested-fix-type';
import { Item } from '../../../shared/entities/item';
import { SuggestedFix } from '../../../shared/entities/suggested-fix';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { ItemRepository } from '../item/item.repository';
import { SuggestedFixRepository } from './suggested-fix.repository';

@Controller('suggested-fix')
export class SuggestedFixController {
  constructor(private suggestedFixRepo: SuggestedFixRepository, private itemRepo: ItemRepository) {}

  @Post()
  async suggestFix<T>(@Body() suggestedFix: SuggestedFix<T>): Promise<SuggestedFix<T>> {
    // TODO handle UUIDs
    const savedEntity = await this.suggestedFixRepo.save(suggestedFix);
    return this.suggestedFixRepo.findOne(savedEntity.id);
  }

  @Get('matching')
  async getMatchingSuggestedFixes<T>(
    @Query('type') type: SuggestedFixType,
    @Query('idOrNumber') idOrNumber: string,
  ): Promise<SuggestedFix<T>[]> {
    return await this.suggestedFixRepo.find({
      type,
      idOrNumber,
    });
  }

  @Post('commit')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(RoleId.Admin)
  async commitFix<T>(@Body() payload: { id: string }): Promise<void> {
    const fix = await this.suggestedFixRepo.findOne(payload.id);

    if (!fix) {
      throw new NotFoundException(`A suggested fix with the ID of ${payload.id} was not found`);
    }

    switch (fix.type) {
      case SuggestedFixType.Item:
        const item: Item = fix.data;
        await this.itemRepo.saveExisting(item.number, item);
        break;
      default:
        throw new UnprocessableEntityException(`${fix.type} is not  yet supported by the API`);
    }

    await this.deleteMatchingSuggestedFixes(fix.type, fix.idOrNumber);
  }

  private async deleteMatchingSuggestedFixes<T>(
    @Query('type') type: SuggestedFixType,
    @Query('idOrNumber') idOrNumber: string,
  ): Promise<void> {
    await this.suggestedFixRepo.delete({
      type,
      idOrNumber,
    });
  }
}
