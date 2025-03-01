import { Module } from '@nestjs/common';
import { providers } from 'src/constants';
import { CSVEntity } from './services/csv.entity';

@Module({
  imports: [],
  providers: [
    {
      provide: providers.ENTITIES.CSV,
      useClass: CSVEntity,
    },
  ],
  exports: [providers.ENTITIES.CSV],
})
export class CSVEntityModule {}
