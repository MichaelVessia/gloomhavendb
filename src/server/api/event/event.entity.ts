import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { EventType } from '../../../shared/constants/event-type';
import { props } from '../../../shared/util/props';
import { EventCard, EventChoice } from '../../../shared/types/entities/event';

export class EventChoiceEntity implements EventChoice {
  @ApiProperty({
    description: 'The matching choice text at the bottom of the front of the card.',
    example: 'You decide to join the fight.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  choice: string;

  @ApiProperty({
    description: 'The text of the outcome.',
    example: 'The fight did not go well... Take 2 damage.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  outcome: string;

  @ApiProperty({
    description: 'Image URL of half of the back of the card.',
    example: 'http://example.com/images/event-road-01-a.png',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  imageUrl: string;
}

@Entity()
@Unique(props<EventEntity>('number', 'type'))
export class EventEntity implements EventCard {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'An unique ID. Not directly used externally, use "number" instead.',
    example: 1,
    required: false,
  }) // @IsInt()
  // @Min(1)
  id?: number;

  // this is the item number and is *not* generated
  @Column()
  @ApiProperty({ description: 'The event number.', example: 1, required: true })
  @IsNotEmpty() // @IsInt()
  // @Min(1)
  number: number;

  @Column()
  @ApiProperty({
    description: 'The event number. Overridden by endpoint you use.',
    example: EventType.Road,
    required: true,
    enum: EventType,
  })
  @IsNotEmpty()
  @IsEnum(EventType)
  type: EventType;

  @Column()
  @ApiProperty({
    description: 'The flavor text that sets up the event.',
    example: 'While enjoying drinks at the Sleeping Lion...',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @Column('json')
  @ApiProperty({ description: 'Option A.', type: EventChoiceEntity })
  @IsNotEmpty()
  @ValidateNested()
  optionA: EventChoiceEntity;

  @Column('json')
  @ApiProperty({ description: 'Option B.', type: EventChoiceEntity })
  @IsNotEmpty()
  @ValidateNested()
  optionB: EventChoiceEntity;

  @Column()
  @ApiProperty({
    description: 'A URL to a high quality scan of the front of the Event',
    required: true,
    example: 'http://example.com/images/event-road-01.png',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  imageUrl: string; // image of the entire front

  @Column({ default: false })
  @ApiProperty({
    description: 'Whether or not the data in this event has been manually reviewed and verified.',
    default: false,
    example: false,
  })
  @IsBoolean()
  verified: boolean;
}
