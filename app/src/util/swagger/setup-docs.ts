import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER } from 'src/constants';

export function setupDocs(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(SWAGGER.TITLE)
    .setDescription(SWAGGER.DESCRIPTION)
    .setVersion(SWAGGER.VERSION)
    .addServer(SWAGGER.SERVER_URL)
    .build();
  const docs = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(SWAGGER.DOCUMENTATION_PATH, app, docs, {
    jsonDocumentUrl: SWAGGER.JSON_DOCUMENTATION_PATH,
  });
  return docs;
}
