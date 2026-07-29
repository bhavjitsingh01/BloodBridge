declare module 'swagger-jsdoc' {
  interface SwaggerOptions {
    definition: {
      openapi: string;
      info: {
        title: string;
        description?: string;
        version: string;
        contact?: {
          name?: string;
          email?: string;
          url?: string;
        };
        license?: {
          name: string;
          url?: string;
        };
      };
      servers?: Array<{
        url: string;
        description?: string;
      }>;
      components?: any;
      security?: any[];
    };
    apis: string[];
  }

  function swaggerJsdoc(options: SwaggerOptions): any;
  export = swaggerJsdoc;
}
