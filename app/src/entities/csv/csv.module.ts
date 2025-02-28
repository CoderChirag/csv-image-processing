import { Module } from '@nestjs/common';
import { providers } from 'src/constants';
import { CSVValidationEntity } from './services/csv-validation.entity';

@Module({
  imports: [],
  providers: [
    {
      provide: providers.ENTITIES.CSV_VALIDATION,
      useClass: CSVValidationEntity,
    },
  ],
  exports: [providers.ENTITIES.CSV_VALIDATION],
})
export class CSVEntityModule {}
