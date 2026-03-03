
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
  "swaggerDoc": {
    "openapi": "3.0.1",
    "info": {
      "title": "API Web Flexxus",
      "description": "API de Flexxus ERP",
      "version": "2.0.0"
    },
    "servers": [
      {
        "url": "https://urlBase/v2"
      },
      {
        "url": "http://urlBase/v2"
      }
    ],
    "tags": [
      {
        "name": "Login",
        "description": "Login"
      },
      {
        "name": "Artículos",
        "description": "Artículos de Flexxus"
      },
      {
        "name": "Talles",
        "description": "Todo acerca de talles"
      },
      {
        "name": "Depositos",
        "description": "Todo acerca de depositos"
      },
      {
        "name": "Rubros",
        "description": "Todo acerca de rubros de artículos"
      },
      {
        "name": "Marcas",
        "description": "Todo acerca de marcas de artículos"
      },
      {
        "name": "Clientes",
        "description": "Todo acerca de los clientes"
      },
      {
        "name": "Tipos de actividad",
        "description": "Todo acerca de los tipos de actividad"
      },
      {
        "name": "Tipos de iva",
        "description": "Todo acerca de tipos de iva"
      },
      {
        "name": "Zonas",
        "description": "Todo acerca de zonas"
      },
      {
        "name": "Proveedores",
        "description": "Todo acerca de los proveedores"
      },
      {
        "name": "Tipos de iva compra",
        "description": "Todo acerca de tipos de iva compra"
      },
      {
        "name": "Provincias",
        "description": "Todo acerca de las provincias"
      },
      {
        "name": "Localidades",
        "description": "Todo acerca de las localidades"
      },
      {
        "name": "Multiplazos",
        "description": "Todo acerca de metodos de pago"
      },
      {
        "name": "Cuentas contables",
        "description": "Todo acerca de cuentas contables"
      },
      {
        "name": "Percepciones",
        "description": "Todo acerca de percepciones"
      },
      {
        "name": "Monedas",
        "description": "Todo acerca de las monedas"
      },
      {
        "name": "Bancos",
        "description": "Todos acerca de los bancos"
      },
      {
        "name": "Tarjetas",
        "description": "Todo acerca de las tarjetas"
      },
      {
        "name": "Sucursales",
        "description": "Todos acerca de las sucursales de los bancos"
      },
      {
        "name": "Operaciones",
        "description": "Todo acerca de las operaciones"
      },
      {
        "name": "Inventarios",
        "description": "Todo acerca de los inventarios"
      },
      {
        "name": "Stock",
        "description": "Todo acerca de stock"
      },
      {
        "name": "Cuentas bancarias",
        "description": "Todo acerca de cuentas bancarias"
      },
      {
        "name": "Ordenes",
        "description": "Todos acerca de las ordenes como presupuestos, pedidos y facturas"
      },
      {
        "name": "Companias",
        "description": "Todos acerca de las companias"
      },
      {
        "name": "Presupuestos",
        "description": "Todos acerca de los Presupuestos"
      },
      {
        "name": "Usuarios",
        "description": "Todo acerca de usuarios"
      },
      {
        "name": "Caja",
        "description": "Todo acerca de cajas (SOLO ENTERPRISE)"
      },
      {
        "name": "Datos de Entrega",
        "description": "Todo acerca de los datos de entrega"
      },
      {
        "name": "Comprobantes Ventas",
        "description": "Todo acerca de los comprobantes de ventas"
      },
      {
        "name": "Versiones",
        "description": "Todo acerca de las versiones de la API y ERP"
      },
      {
        "name": "Empresa",
        "description": "Todo acerca de su empresa"
      },
      {
        "name": "Acopios",
        "description": "Todo acerca de los Acopios (CORRALON)"
      },
      {
        "name": "CompatibilidadApp",
        "description": "Todo acerca de la compatibilidad App compatible"
      },
      {
        "name": "Tipos de Entrega",
        "description": "Todo acerca de los tipos de entrega"
      },
      {
        "name": "Super Rubros",
        "description": "Todo acerca de super rubros"
      },
      {
        "name": "Grupo Super Rubros",
        "description": "Todo acerca de grupo super rubros"
      },
      {
        "name": "Parametros Generales",
        "description": "Todo acerca de parametros generales"
      },
      {
        "name": "MultiFormas",
        "description": "Todo acerca de las multiformas (CORRALON)"
      },
      {
        "name": "Permisos Especiales",
        "description": "Todo acerca de los permisos especiales"
      },
      {
        "name": "Comprobantes Vinculados",
        "description": "Todo acerca de los comprobantes vinculados"
      },
      {
        "name": "Transportes",
        "description": "Todo acerca de los tipos de transporte"
      },
      {
        "name": "Autorizaciones Comprobantes",
        "description": "Todo acerca de las autorizaciones de los comprobantes (CORRALON)"
      },
      {
        "name": "Comprobantes Compras",
        "description": "Todo acerca de los comprobantes de compra (SOLO ENTERPRISE)"
      },
      {
        "name": "Conjuntos",
        "description": "Todo acerca de Conjuntos (ENTERPRISE)"
      },
      {
        "name": "Apropiacion Centro Costo",
        "description": "Todo acerca de Apropiacion Centro Costo"
      },
      {
        "name": "Ejercicios",
        "description": "Todo acerca de Ejercicios"
      },
      {
        "name": "Bienes de uso",
        "description": "Todo acerca de Bienes de uso"
      },
      {
        "name": "Rubros de bienes de uso",
        "description": "Todo acerca de Rubros de bienes de uso"
      },
      {
        "name": "Motivos ajustes stock",
        "description": "Todo acerca de Motivos ajustes stock (ENTERPRISE)"
      },
      {
        "name": "Barrios",
        "description": "Todo acerca de Barrios (CORRALON)"
      },
      {
        "name": "Puntos de Venta",
        "description": "Todo acerca de Puntos de venta (ENTERPRISE)"
      },
      {
        "name": "Sucursales Exportacion",
        "description": "Todo acerca de las Sucursales de Exportacion"
      },
      {
        "name": "Pagos",
        "description": "Todo acerca de Pagos"
      },
      {
        "name": "Actividades Economicas",
        "description": "Todo acerca de Actividades Economicas"
      }
    ],
    "paths": {
      "/products": {
        "get": {
          "tags": [
            "Artículos"
          ],
          "summary": "Listado de productos",
          "operationId": "getProduct",
          "parameters": [
            {
              "name": "id",
              "in": "query",
              "description": "filtra por el codigo de articulo",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "order_size_num",
              "in": "query",
              "description": "filtra por numero de talle de la orden",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "filtra por la fecha de modificacion",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "filtra por su muestra web",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "warehouse_list",
              "in": "query",
              "description": "filtra por el codigo de deposito",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "price_list",
              "in": "query",
              "description": "filtra por la lista de precios",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "levels",
              "in": "query",
              "description": "filtra por el nivel",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "valid_stock",
              "in": "query",
              "description": "si se envia 1 no obtiene datos de stock si es 0 o null calcula stock",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "active",
              "in": "query",
              "description": "0 para inactivos, 1 para activos, 2 para activos e inactivo, por defecto el valor es 1",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ProductGetAll"
                        }
                      },
                      "count": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron productos o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Artículos"
          ],
          "summary": "Creación de un producto (SOLO ENTERPRISE)",
          "operationId": "createProduct",
          "requestBody": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProductCreate"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "ID": {
                              "type": "string"
                            },
                            "RES_CODIGOPARTICULAR": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros invalidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/products/count": {
        "get": {
          "tags": [
            "Artículos"
          ],
          "summary": "Cantidad de productos",
          "description": "Cantidad de productos",
          "operationId": "productCount",
          "parameters": [
            {
              "name": "id",
              "in": "query",
              "description": "filtra por el codigo de articulo",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "order_size_num",
              "in": "query",
              "description": "filtra por numero de talle de la orden",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "filtra por la fecha de modificacion",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "filtra por su muestra web",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "warehouse_list",
              "in": "query",
              "description": "filtra por el codigo de deposito",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "price_list",
              "in": "query",
              "description": "filtra por la lista de precios",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "levels",
              "in": "query",
              "description": "filtra por el nivel",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "valid_stock",
              "in": "query",
              "description": "si se envia 1 no obtiene datos de stock si es 0 o null calcula stock",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "active",
              "in": "query",
              "description": "0 para inactivos, 1 para activos, 2 para activos e inactivo, por defecto el valor es 1",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cantidad",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Error interno",
              "content": {}
            }
          }
        }
      },
      "/products/{id}": {
        "get": {
          "tags": [
            "Artículos"
          ],
          "summary": "Encontrar un producto",
          "description": "Encontrar un producto por id",
          "operationId": "",
          "parameters": [
            {
              "name": "id",
              "description": "Id del producto a buscar",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "active",
              "in": "query",
              "description": "0 para inactivos, 1 para activos, 2 para activos e inactivo, por defecto el valor es 1",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Product encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ProductGetAll"
                        }
                      },
                      "count": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Producto no encontrada o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Artículos"
          ],
          "summary": "Actualizar un producto (SOLO ENTERPRISE)",
          "description": "Retorna product actualizado",
          "operationId": "putProduct",
          "parameters": [
            {
              "name": "id",
              "description": "CODIGOARTICULO del producto a actualizar",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "description": "Id del producto a actualizar",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProductUpdate"
                }
              }
            }
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Producto actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "error": {
                              "type": "boolean",
                              "example": false
                            },
                            "num_fields_updated": {
                              "type": "number"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Producto no encontrado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Artículos"
          ],
          "summary": "Borrar un producto",
          "operationId": "deleteProduct",
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "description": "Id del producto a eliminar",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Product borrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Producto no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/products/{id}/size": {
        "get": {
          "tags": [
            "Artículos"
          ],
          "summary": "Tamaño de un producto",
          "description": "Tamaño de un producto con Id igual a \"id\"",
          "operationId": "",
          "parameters": [
            {
              "name": "id",
              "description": "Id del producto a consultar",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Product encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string"
                      },
                      "Product_Sizes": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProductSize"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Producto no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/products/{id}/stock": {
        "get": {
          "tags": [
            "Artículos"
          ],
          "summary": "Stock de un producto",
          "description": "Stock del producto con Id \"id\"",
          "operationId": "getStockByProduct",
          "parameters": [
            {
              "name": "id",
              "description": "Id del producto a consultar",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Product encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string"
                      },
                      "Product_Stock": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProductStock"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Producto no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/products/image/{imageUrl}": {
        "get": {
          "tags": [
            "Artículos"
          ],
          "summary": "Imagen de un producto",
          "description": "Imagen de un producto, con URL como parámetro",
          "operationId": "getImageByProduct",
          "parameters": [
            {
              "name": "imageUrl",
              "description": "URL de la imagen producto a consultar",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Retorna la imagen del producto"
            },
            "500": {
              "description": "imagen no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/products/image/sync": {
        "get": {
          "tags": [
            "Artículos"
          ],
          "summary": "Sincronización de las imágenes de los productos",
          "description": "Sincroniza las imágenes de los productos",
          "operationId": "getImagesOfProduct",
          "parameters": [
            {
              "name": "fullSync",
              "description": "Habilita o no la sincronización completa",
              "in": "query",
              "schema": {
                "type": "boolean"
              }
            },
            {
              "name": "thumb",
              "description": "Resolución de la miniatura de cada imagen",
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "se encontraron imagenes",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ProductSyncImageGet"
                  }
                }
              }
            },
            "500": {
              "description": "error interno o no se poseen imagenes",
              "content": {}
            }
          }
        }
      },
      "/products/image/sync/status": {
        "get": {
          "tags": [
            "Artículos"
          ],
          "summary": "Estado del progreso de la sincro de imágenes de los productos",
          "description": "Muestra el progreso de la sincro de las imágenes de los productos",
          "operationId": "getImagesStatus",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Progreso actual de la sincro de imágenes",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ProductSyncImageGet"
                  }
                }
              }
            },
            "500": {
              "description": "error interno o progreso inexistente",
              "content": {}
            }
          }
        }
      },
      "/categories": {
        "get": {
          "tags": [
            "Rubros"
          ],
          "summary": "Listado de categorias",
          "operationId": "allCategories",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de las categorias",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación de la categoría",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "Filtra por rubros que estén publicados en la web",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCategory"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron categorias o error interno",
              "content": {}
            }
          }
        }
      },
      "/categories/count": {
        "get": {
          "tags": [
            "Rubros"
          ],
          "summary": "Cantidad de categorias",
          "description": "Cantidad de categorias",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de las categorias",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación de la categoría",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "Filtra por rubros que estén publicados en la web",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de categorias",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/categories/{categoryId}": {
        "get": {
          "tags": [
            "Rubros"
          ],
          "summary": "Encontrar una Categoria por ID",
          "description": "Retorna un unica Categoria",
          "operationId": "getCategoryById",
          "parameters": [
            {
              "name": "categoryId",
              "in": "path",
              "description": "ID de la categoria a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Categoria encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCategory"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Categoria no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Listado de clientes",
          "operationId": "allCustomers",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Filtra por cuit, documento y coincidencia en razon social",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación del cliente",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "particularCode",
              "in": "query",
              "description": "filtra por el codigo particular del cliente",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCustomerAll"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron clientes o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Clientes"
          ],
          "summary": "Creación de un cliente",
          "operationId": "createCustomer",
          "requestBody": {
            "description": "Parametros para insertar un cliente",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Customer"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ResponseCustomer"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/customers/count": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Cantidad de clientes",
          "description": "Cantidad de clientes",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del cliente a buscar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación del cliente",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "particularCode",
              "in": "query",
              "description": "filtra por el codigo particular del cliente",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de clientes",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/{customerId}": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Encontrar un cliente por ID",
          "description": "Retorna un cliente",
          "operationId": "getCustomerById",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cliente encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCustomerAll"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Cliente no encontrada o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Clientes"
          ],
          "summary": "Actualizar un cliente",
          "description": "Retorna el cliente actualizada",
          "operationId": "updateCustomerById",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar un cliente",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CustomerUpdate"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cliente actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ResponseCustomer"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Cliente no encontrado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Clientes"
          ],
          "summary": "Borrar un cliente",
          "operationId": "deleteCustomer",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cliente borrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Cliente no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/{customerId}/change_password": {
        "post": {
          "tags": [
            "Clientes"
          ],
          "summary": "Cambiar contraseña",
          "description": "Retorna un cliente",
          "operationId": "changePassword",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente a cambiar la contraseña",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar el password del cliente",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Change_Password"
                }
              }
            }
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contraseña cambiada",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Change_Password_res"
                  }
                }
              }
            },
            "500": {
              "description": "Contraseña erronea o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/balance": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Balance de los clientes (SOLO ENTERPRISE)",
          "description": "Retorna los balances",
          "operationId": "getBalanceByCustomer",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del cliente a buscar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "all_receipts",
              "in": "query",
              "description": "Incluye comprobantes de tipo (RE,RI,INA)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Balance de los clientes",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCustomerBalance"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron balances o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/balance/count": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Cantidad de balances de los clientes (SOLO ENTERPRISE)",
          "description": "Retorna el numero de balances",
          "operationId": "getCountBalances",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del cliente a buscar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "all_receipts",
              "in": "query",
              "description": "Incluye comprobantes de tipo (RE,RI,INA)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de balances de clientes",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron balances o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/{id}/balance": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Balance de  cliente (SOLO ENTERPRISE)",
          "description": "Retorna  balance de cliente",
          "operationId": "getOneBalanceByCustomer",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "description": "Id del cliente a buscar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "all_receipts",
              "in": "query",
              "description": "Incluye comprobantes de tipo (RE,RI,INA)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Balance de los clientes",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCustomerBalance"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron balances o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/{customerId}/movements": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Movimientos de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna los movimientos de un cliente",
          "operationId": "getMovementsByCustomer",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "only_owed",
              "in": "query",
              "description": "Filtrado por adeudados",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "include_re",
              "in": "query",
              "description": "Filtrado por remitos incluidos",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "include_payments",
              "in": "query",
              "description": "Filtrado por pagos incluidos",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "filtra por fecha comprobante desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "filtra por fecha comprobante hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "receipts",
              "in": "query",
              "description": "si se envia 1 este trae comprobante tipo R (recibo) de lo contrario trae PA (pagos) ESTE PARAMETRO SOLO ES PARA CORRALON",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "excludes_nc_others",
              "in": "query",
              "description": "filtra por NC OTROS  ESTE PARAMETRO SOLO ES PARA CORRALON",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Movimientos del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCustomerMovement"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene movimientos o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/{customerId}/movements/count": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Encontrar movmientos un cliente por ID (SOLO ENTERPRISE)",
          "description": "Retorna la cantidad de movimientos de un cliente",
          "operationId": "getCountMovements",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "only_owed",
              "in": "query",
              "description": "Filtrado por adeudados",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "include_re",
              "in": "query",
              "description": "Filtrado por remitos incluidos",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "include_payments",
              "in": "query",
              "description": "Filtrado por pagos incluidos",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cantidad de movimientos del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene movimientos o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/{customer_id}/branchsbycustomers": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Sucursales de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna las sucursales de un cliente",
          "operationId": "findByCustomerID Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Sucursales del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/CostumerBranchGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene sucursales o error interno",
              "content": {}
            }
          }
        },
        "delete": {
          "tags": [
            "Clientes"
          ],
          "summary": "Elimina las sucursales de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna affected_rows",
          "operationId": "deleteByCustomerID Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Elimina las sucursales del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene sucursales o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Clientes"
          ],
          "summary": "Inserta la sucursal de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna codigocliente",
          "operationId": "inseter Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para insertar una sucursal por cliente",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CostumerBranchUpdate"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Inserta la sucursal del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "properties": {
                            "CODIGOCLIENTE": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene sucursales o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/{customer_id}/branchsbycustomers/{branch_id}": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Sucursal de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna las sucursal de un cliente",
          "operationId": "findOne Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "branch_id",
              "in": "path",
              "description": "ID de la sucursal",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Sucursales del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "items": {
                          "$ref": "#/components/schemas/CostumerBranchGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene sucursales o error interno",
              "content": {}
            }
          }
        },
        "delete": {
          "tags": [
            "Clientes"
          ],
          "summary": "Elimina la sucursal de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna affected_rows",
          "operationId": "deleteOne Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "branch_id",
              "in": "path",
              "description": "ID de la sucursal",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Elimina la sucursal del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene sucursales o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Clientes"
          ],
          "summary": "Actualiza la sucursal de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna affected_rows",
          "operationId": "update Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "branch_id",
              "in": "path",
              "description": "ID de la sucursal",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar un cliente",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CostumerBranchUpdate"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Actualiza la sucursal del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene sucursales o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/{customer_id}/customercontacts": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Contactos de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna los contactos de un cliente",
          "operationId": "findByCustomerID contacts Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contactos del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/CostumerContactGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene contactos o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Clientes"
          ],
          "summary": "Inserta el contacto de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna codigocliente",
          "operationId": "insetar Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para insertar un contacto por cliente",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CostumerContactUpdate"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Innserta al contacto del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "properties": {
                            "CODIGOCLIENTE": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene contactos o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/{customer_id}/customercontacts/{contact_id}": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Contacto de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna los contactos de un cliente",
          "operationId": "findOne contact Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "contact_id",
              "in": "path",
              "description": "ID del contacto",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contactos del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "items": {
                          "$ref": "#/components/schemas/CostumerContactGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene contactos o error interno",
              "content": {}
            }
          }
        },
        "delete": {
          "tags": [
            "Clientes"
          ],
          "summary": "Elimina el contacto de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna affected_rows",
          "operationId": "delete customer Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "contact_id",
              "in": "path",
              "description": "ID de la sucursal",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Elimina el contacto del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene contactos o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Clientes"
          ],
          "summary": "Actualiza el contacto de un cliente (SOLO ENTERPRISE)",
          "description": "Retorna affected_rows",
          "operationId": "update contact Cliente",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "contact_id",
              "in": "path",
              "description": "ID de la sucursal",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar un cliente",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CostumerContactUpdate"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Actualiza al contacto del cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El cliente no tiene contactos o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/itemsdiscount/{customerId}": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Encontrar descuentos rubros por ID Cliente",
          "description": "Retorna descuentos clientes rubro",
          "operationId": "findOne itemdsiscount",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Descuento cliente rubro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetItemsDiscount"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Descuento cliente rubro no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/articlesdiscount/{customerId}": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Encontrar descuentos articulos por ID Cliente",
          "description": "Retorna descuentos cliente articulos",
          "operationId": "findOne articlediscount",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente a retornar",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Descuento cliente articulo encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetItemsArticle"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Descuento cliente articulo no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/brandsdiscount/{customerId}": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Encontrar descuentos marcas por ID Cliente",
          "description": "Retorna descuentos cliente marcas",
          "operationId": "findOne brandiscount",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente a retornar",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Descuento cliente marca encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetItemsBrand"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Descuento cliente marca no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/points/{customerId}": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Encontrar total de puntos por ID Cliente (SOLO ENTERPRISE)",
          "description": "Retorna total de puntos por cliente",
          "operationId": "findOne",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente a retornar",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Puntos por cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Getpoints"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "total de puntos no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/customers/{customerId}/stockpiling": {
        "get": {
          "tags": [
            "Clientes"
          ],
          "summary": "Encontrar acopios asignado por cliente (SOLO CORRALON)",
          "description": "Retorna acopio del cliente",
          "operationId": "findByCliente",
          "parameters": [
            {
              "name": "customerId",
              "in": "path",
              "description": "ID del cliente a retornar",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Acopio por cliente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetAcopio"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "acopio no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/activity_types": {
        "get": {
          "tags": [
            "Tipos de actividad"
          ],
          "summary": "Listado de tipo de actividades",
          "operationId": "allActivitiesTypes",
          "parameters": [
            {
              "name": "id",
              "in": "query",
              "description": "Id por el cual filtrar los tipo de actividad",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del tipo de actividad a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ActivityTypeGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron actividades o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Tipos de actividad"
          ],
          "summary": "Creación de un tipo de actividad",
          "operationId": "createActivityType",
          "requestBody": {
            "description": "Parametros para insertar un tipo de actividad",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Activity_type"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOACTIVIDAD": {
                            "type": "string",
                            "maxLength": 15
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/activity_types/count": {
        "get": {
          "tags": [
            "Tipos de actividad"
          ],
          "summary": "Cantidad de tipo de actividades",
          "description": "Cantidad de tipos de actividades",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del tipo de actividad a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de tipo de actividades",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/activity_types/{activityTypeId}": {
        "get": {
          "tags": [
            "Tipos de actividad"
          ],
          "summary": "Encontrar un tipo de actividad por ID",
          "description": "Retorna un unico tipo de actividad",
          "operationId": "getActivityTypeById",
          "parameters": [
            {
              "name": "activityTypeId",
              "in": "path",
              "description": "ID del tipo de actividad a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Actividad encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ActivityTypeGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de actividad no encontrada o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Tipos de actividad"
          ],
          "summary": "Actualizar un tipo de actividad",
          "description": "Retorna el tipo de actividad actualizada",
          "operationId": "updateActivityTypeById",
          "parameters": [
            {
              "name": "activityTypeId",
              "in": "path",
              "description": "ID del tipo de actividad a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar actividad",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Activity_type"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Actividad actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOACTIVIDAD": {
                            "type": "string",
                            "maxLength": 15
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de actividad no encontrada o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Tipos de actividad"
          ],
          "summary": "Borrar un tipo de actividad",
          "operationId": "deleteActivityType",
          "parameters": [
            {
              "name": "activityTypeId",
              "in": "path",
              "description": "ID de tipo de actividad a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Actividad borrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de actividad no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/warehouses": {
        "get": {
          "tags": [
            "Depositos"
          ],
          "summary": "Listado de depositos",
          "operationId": "allWarehouses",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de los depositos",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "all",
              "in": "query",
              "description": "Indica si se devuelven todos los depósitos o no",
              "schema": {
                "type": "number"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetWarehouse"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron depositos o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Depositos"
          ],
          "summary": "Creación de un deposito (SOLO ENTERPRISE)",
          "operationId": "createWarehouse",
          "parameters": [
            {
              "name": "origin",
              "in": "query",
              "description": "Origen del deposito",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "description": "Parametros para insertar un deposito",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Warehouse"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGODEPOSITO": {
                            "type": "string",
                            "maxLength": 15
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/warehouses/count": {
        "get": {
          "tags": [
            "Depositos"
          ],
          "summary": "Cantidad de depositos",
          "description": "Cantidad de depositos",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de depositos",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/warehouses/{warehouseId}": {
        "get": {
          "tags": [
            "Depositos"
          ],
          "summary": "Encontrar un deposito por ID",
          "description": "Retorna un unico deposito",
          "operationId": "getWarehouseById",
          "parameters": [
            {
              "name": "warehouseId",
              "in": "path",
              "description": "ID de la deposito a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Deposito encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetWarehouse"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Deposito no encontrado o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Depositos"
          ],
          "summary": "Actualizar un deposito (SOLO ENTERPRISE)",
          "description": "Retorna el deposito actualizado",
          "operationId": "updateWarehouseById",
          "parameters": [
            {
              "name": "warehouseId",
              "in": "path",
              "description": "ID del deposito a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "origin",
              "in": "query",
              "description": "Origen del deposito a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar el deposito",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Warehouse"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Deposito actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGODEPOSITO": {
                            "type": "string",
                            "maxLength": 15
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Deposito no encontrado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Depositos"
          ],
          "summary": "Borrar un deposito",
          "operationId": "deleteWarehouse",
          "parameters": [
            {
              "name": "warehouseId",
              "in": "path",
              "description": "ID del deposito a borrar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Deposito borrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Deposito no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/operations": {
        "get": {
          "tags": [
            "Operaciones"
          ],
          "summary": "Listado de operaciones",
          "operationId": "allOperations",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Busca por coincidencia en descripcion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "reqpreparation",
              "in": "query",
              "description": "Filtra por requiere confeccion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "stockreservation",
              "in": "query",
              "description": "Filtra por compromete stock",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/OperationGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron operaciones o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Operaciones"
          ],
          "summary": "Creación de una operación",
          "operationId": "createOperation",
          "requestBody": {
            "description": "Parametros para insertar una operación",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Operation"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOOPERACION": {
                            "type": "integer"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/operations/count": {
        "get": {
          "tags": [
            "Operaciones"
          ],
          "summary": "Cantidad de operaciones",
          "description": "Cantidad de operaciones",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de operaciones",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/operations/{operationId}": {
        "get": {
          "tags": [
            "Operaciones"
          ],
          "summary": "Encontrar una operación por ID",
          "description": "Retorna una unica operación",
          "operationId": "getOperationById",
          "parameters": [
            {
              "name": "operationId",
              "in": "path",
              "description": "ID de la operacion a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OperationGet"
                  }
                }
              }
            },
            "500": {
              "description": "Operacion no encontrada o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Operaciones"
          ],
          "summary": "Actualizar una operación",
          "description": "Retorna la operación actualizada",
          "operationId": "updateOperationById",
          "parameters": [
            {
              "name": "operationId",
              "in": "path",
              "description": "ID de la operación a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar la operación",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Operation"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOOPERACION": {
                            "type": "integer"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Operación no actualizada o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Operaciones"
          ],
          "summary": "Borrar una operación",
          "operationId": "deleteOperation",
          "parameters": [
            {
              "name": "operationId",
              "in": "path",
              "description": "ID de la operación a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación borrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Operación no eliminada o error interno",
              "content": {}
            }
          }
        }
      },
      "/currencies": {
        "get": {
          "tags": [
            "Monedas"
          ],
          "summary": "Listado de monedas",
          "operationId": "allCurrencies",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia en descripcion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "filtra desde la fecha de modificacion",
              "schema": {
                "type": "string",
                "format": "date-time"
              }
            },
            {
              "name": "base_currency",
              "in": "query",
              "description": "filtra por moneda base",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCurrency"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron monedas o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Monedas"
          ],
          "summary": "Creación de una moneda (SOLO ENTERPRISE)",
          "operationId": "createCurrency",
          "requestBody": {
            "description": "Parametros para insertar una moneda",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Currency"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOMONEDA": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/currencies/count": {
        "get": {
          "tags": [
            "Monedas"
          ],
          "summary": "Cantidad de monedas",
          "description": "Cantidad de monedas",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de monedas",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/currencies/{CurrencyId}": {
        "get": {
          "tags": [
            "Monedas"
          ],
          "summary": "Encontrar una moneda",
          "description": "Retorna una unica moneda",
          "operationId": "getCurrencyById",
          "parameters": [
            {
              "name": "CurrencyId",
              "in": "path",
              "description": "ID de la moneda a retornar",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Moneda encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCurrency"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Moneda no encontrada o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Monedas"
          ],
          "summary": "Actualizar una moneda (SOLO ENTERPRISE)",
          "description": "Retorna moneda actualizada",
          "operationId": "updateCurrencyById",
          "parameters": [
            {
              "name": "CurrencyId",
              "in": "path",
              "description": "ID del moneda a actualizar",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar moneda",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Currency"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Moneda actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOMONEDA": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Moneda no actualizada o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Monedas"
          ],
          "summary": "Eliminar una moneda",
          "operationId": "deleteCurrency",
          "parameters": [
            {
              "name": "CurrencyId",
              "in": "path",
              "description": "ID de moneda a eliminar",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Moneda eliminada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Moneda no eliminada o error interno"
            }
          }
        }
      },
      "/inventories": {
        "get": {
          "tags": [
            "Inventarios"
          ],
          "summary": "Listado de inventarios",
          "operationId": "allInventories",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetInventory"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron inventarios o error interno",
              "content": {}
            }
          }
        }
      },
      "/inventories/count": {
        "get": {
          "tags": [
            "Inventarios"
          ],
          "summary": "Cantidad de inventarios",
          "description": "Cantidad de inventarios",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de inventarios",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/inventories/{inventoryId}": {
        "get": {
          "tags": [
            "Inventarios"
          ],
          "summary": "Encontrar un inventario",
          "description": "Retorna un inventario",
          "operationId": "getInventariesById",
          "parameters": [
            {
              "name": "inventoryId",
              "in": "path",
              "description": "ID del inventario a retornar",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Inventario encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetInventory"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Inventario no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/inventories/{idInventory}/products": {
        "get": {
          "tags": [
            "Inventarios"
          ],
          "summary": "Listado de productos",
          "operationId": "allProductsByInventory",
          "parameters": [
            {
              "name": "idInventory",
              "in": "path",
              "description": "ID del inventario a buscar",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProductsOfInventory"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro inventario o error interno",
              "content": {}
            }
          }
        }
      },
      "/inventories/{id}/products/{item}": {
        "get": {
          "tags": [
            "Inventarios"
          ],
          "summary": "Trae un producto del inventario",
          "operationId": "oneProducts",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "ID del inventario",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "item",
              "in": "path",
              "description": "ID del producto",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProductsOfInventory"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro producto del inventario o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Inventarios"
          ],
          "summary": "Actualizacion de un producto del inventario",
          "operationId": "putProductByInventary",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "ID del inventario",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "item",
              "in": "path",
              "description": "ID del producto",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "description": "Inventario a modificar",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "inventoryItem": {
                      "type": "object",
                      "$ref": "#/components/schemas/Inventory"
                    }
                  }
                }
              }
            }
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Modificado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "string",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "success"
                      },
                      "Movement": {
                        "type": "object",
                        "properties": {
                          "RES_ID_CONTEOINVENTARIO": {
                            "type": "integer"
                          },
                          "RES_CODIGOINVENTARIO": {
                            "type": "integer"
                          },
                          "RES_NUMEROCORRELATIVO": {
                            "type": "integer"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/state": {
        "get": {
          "tags": [
            "Provincias"
          ],
          "summary": "Listado de provincias",
          "operationId": "allStates",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de la provincia a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetState"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron provincias o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Provincias"
          ],
          "summary": "Creación de una provincia (SOLO ENTERPRISE)",
          "operationId": "createState",
          "requestBody": {
            "description": "Parametros para insertar una provincia",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/State"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOPROVINCIA": {
                            "type": "string",
                            "description": "descripcion del codigo provincia"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/states/count": {
        "get": {
          "tags": [
            "Provincias"
          ],
          "summary": "Cantidad de provincias",
          "description": "Cantidad de provincias",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de provincias",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/states/{stateId}": {
        "get": {
          "tags": [
            "Provincias"
          ],
          "summary": "Encontrar una provincias por ID",
          "description": "Retorna una unica provincias",
          "operationId": "getProvinciasById",
          "parameters": [
            {
              "name": "stateId",
              "in": "path",
              "description": "ID de la provincia a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Provincia encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetState"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Provincia no encontrada o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Provincias"
          ],
          "summary": "Actualizar una provincia (SOLO ENTERPRISE)",
          "description": "Retorna la provincia actualizada",
          "operationId": "updateStateById",
          "parameters": [
            {
              "name": "stateId",
              "in": "path",
              "description": "ID del tipo de provincia a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "origin",
              "in": "query",
              "description": "Origen de la provincia",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar provincia",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/State"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Provincia actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOPROVINCIA": {
                            "type": "string",
                            "description": "descripcion del codigo provincia"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Provincia no actualizada o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Provincias"
          ],
          "summary": "Borrar una provincia",
          "operationId": "deleteState",
          "parameters": [
            {
              "name": "stateId",
              "in": "path",
              "description": "ID de la provincia a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Provincia borrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Provincia no eliminada o error interno",
              "content": {}
            }
          }
        }
      },
      "/states/{state_id}/cities": {
        "get": {
          "tags": [
            "Localidades"
          ],
          "summary": "Listado de localidades",
          "description": "Cantidad de localidades",
          "operationId": "allCities",
          "parameters": [
            {
              "name": "state_id",
              "in": "path",
              "description": "ID de la provincia",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de la localidad a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCityByState"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron localidades o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Localidades"
          ],
          "summary": "Creación de una localidad (SOLO ENTERPRISE)",
          "operationId": "createCity",
          "parameters": [
            {
              "name": "state_id",
              "in": "path",
              "description": "ID de la provincia",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "Parametros para insertar una localidad",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/City"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetCityByState"
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/states/{state_id}/cities/count": {
        "get": {
          "tags": [
            "Localidades"
          ],
          "summary": "Cantidad de localidades",
          "description": "Cantidad de localidades",
          "parameters": [
            {
              "name": "state_id",
              "in": "path",
              "description": "ID de la localidad",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de localidades",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/states/{state_id}/cities/{id}": {
        "get": {
          "tags": [
            "Localidades"
          ],
          "summary": "Encontrar una Localidades por ID",
          "description": "Retorna una unica Localidades",
          "operationId": "getLocalidadesById",
          "parameters": [
            {
              "name": "state_id",
              "in": "path",
              "description": "ID de la localidad a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de la localidad a buscar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "in": "path",
              "description": "ID de la localidad a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Localidad encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCityByState"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Provincia no encontrada o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Localidades"
          ],
          "summary": "Actualizar una localidad (SOLO ENTERPRISE)",
          "description": "Retorna la localidad actualizada",
          "operationId": "updateCityById",
          "parameters": [
            {
              "name": "state_id",
              "in": "path",
              "description": "ID del tipo de la provincia",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "id",
              "in": "path",
              "description": "ID de la localidad a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "origin",
              "in": "query",
              "description": "Origen de la localidad",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar una localidad",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetCityByState"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Localidad actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetCityByState"
                  }
                }
              }
            },
            "500": {
              "description": "Localidad no encontrada o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Localidades"
          ],
          "summary": "Borrar una localidad",
          "operationId": "deleteCity",
          "parameters": [
            {
              "name": "state_id",
              "in": "path",
              "description": "ID de la provincia",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "id",
              "in": "path",
              "description": "ID de la localidad a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Localidad borrada",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetCityByState"
                  }
                }
              }
            },
            "500": {
              "description": "Localidad no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/providers": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Listado de proveedores",
          "operationId": "allProviders",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del proveedor a buscar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación del proveedor",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProvider"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron proveedores o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Creación de un proveedor",
          "operationId": "createProvider",
          "requestBody": {
            "description": "Parametros para insertar un proveedor",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Provider"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "ID": {
                            "type": "string",
                            "description": "codigoproveedor"
                          },
                          "RES_CODIGOPARTICULAR": {
                            "type": "string",
                            "description": "codigo particular"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/providers/count": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Cantidad de proveedores",
          "description": "Cantidad de proveedores",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del proveedor a buscar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación del proveedor",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de proveedores",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Sin proveedores o error interno",
              "content": {}
            }
          }
        }
      },
      "/providers/{providerId}": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Encontrar un proveedor por ID",
          "description": "Retorna un proveedor",
          "operationId": "getProviderById",
          "parameters": [
            {
              "name": "providerId",
              "in": "path",
              "description": "ID del proveedor a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Proveedor encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProvider"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Proveedor no encontrado o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Actualizar un proveedor",
          "description": "Retorna el proveedor actualizado",
          "operationId": "updateProviderById",
          "parameters": [
            {
              "name": "providerId",
              "in": "path",
              "description": "ID del proveedor a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar un proveedor",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Provider"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Proveedor actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "ID": {
                            "type": "string",
                            "description": "codigoproveedor"
                          },
                          "RES_CODIGOPARTICULAR": {
                            "type": "string",
                            "description": "codigo particular"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Proveedor no actualizado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Borrar un proveedor",
          "operationId": "deleteProvider",
          "parameters": [
            {
              "name": "providerId",
              "in": "path",
              "description": "ID del proveedor a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Proveedor borrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Proveedor no eliminado o error interno",
              "content": {}
            }
          }
        }
      },
      "/providers/balance": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Balance de los Proveedores",
          "description": "Retorna los balances",
          "operationId": "getBalancesByProvider",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del proveedor a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Balance de los Proveedores",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProviderBalance"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron balances o error interno",
              "content": {}
            }
          }
        }
      },
      "/providers/{ProviderId}/balance": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Balance de un proveedor",
          "description": "Retorna los balances de un proveedor",
          "operationId": "findOneBalancesByProvider",
          "parameters": [
            {
              "name": "ProviderId",
              "in": "path",
              "description": "Id del proveedor a buscar",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Balance de un proveedor",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProviderBalance"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro balances o error interno",
              "content": {}
            }
          }
        }
      },
      "/providers/balance/count": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Cantidad de balances de los Proveedores",
          "description": "Retorna el numero de balances",
          "operationId": "getCountBalancesByProvider",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del proveedor a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cantidad de proveedores",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron balances o error interno",
              "content": {}
            }
          }
        }
      },
      "/providers/{providerId}/movements": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Movimientos de un proveedor (SOLO ENTERPRISE)",
          "description": "Retorna los movimientos de un proveedor",
          "operationId": "getMovementsByProvider",
          "parameters": [
            {
              "name": "providerId",
              "in": "path",
              "description": "ID del proveedor",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "only_owed",
              "in": "query",
              "description": "Filtrado por adeudados",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "include_re",
              "in": "query",
              "description": "Filtrado por remitos incluidos",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "include_payments",
              "in": "query",
              "description": "Filtrado por pagos incluidos",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Movimientos del proveedor",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProviderMovement"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El Proveedor no tiene movimientos o error interno",
              "content": {}
            }
          }
        }
      },
      "/providers/{providerId}/movements/count": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Encontrar movimientos de un proveedor por ID",
          "description": "Retorna la cantidad de movimientos de un proveedor",
          "operationId": "getCountMovementsByProvider",
          "parameters": [
            {
              "name": "providerId",
              "in": "path",
              "description": "ID del proveedor a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "only_owed",
              "in": "query",
              "description": "Filtrado por adeudados",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "include_re",
              "in": "query",
              "description": "Filtrado por remitos incluidos",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "include_payments",
              "in": "query",
              "description": "Filtrado por pagos incluidos",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cantidad de movimientos del proveedor",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El proveedor no tiene movimientos o error interno",
              "content": {}
            }
          }
        }
      },
      "/providers/{providerId}/perceptions": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Percepciones de un proveedor",
          "description": "Retorna las percepciones de un proveedor",
          "operationId": "getPercepcionsByProvider",
          "parameters": [
            {
              "name": "providerId",
              "in": "path",
              "description": "ID del proveedor",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del proveedor a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Percepciones del proveedor",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProviderPerception"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "El Proveedor no tiene percepciones o error interno",
              "content": {}
            }
          }
        }
      },
      "/card": {
        "get": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Listado de tarjetas",
          "operationId": "allCards",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Busca por coincidencia en el nombre de la tarjeta",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCard"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron tarjetas o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Creación de una tarjeta (SOLO ENTERPRISE)",
          "operationId": "createCard",
          "requestBody": {
            "description": "Parametros para insertar una tarjeta",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Card"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOTARJETA": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/card/count": {
        "get": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Cantidad de tarjetas",
          "description": "Cantidad de tarjetas",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de tarjetas",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/card/{cardId}": {
        "get": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Encontrar una tarjeta por ID",
          "description": "Retorna una tarjeta",
          "operationId": "getCardById",
          "parameters": [
            {
              "name": "cardId",
              "in": "path",
              "description": "ID de la tarjeta a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Tarjeta encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCard"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Tarjeta no encontrada o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Actualizar una Tarjeta (SOLO ENTERPRISE)",
          "description": "Retorna la Tarjeta actualizada",
          "operationId": "updateCardById",
          "parameters": [
            {
              "name": "cardId",
              "in": "path",
              "description": "ID de la tarjeta a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar una tarjeta",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Card"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "tarjeta actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOTARJETA": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "tarjeta no actualizada o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Borrar una tarjeta",
          "operationId": "deleteCard",
          "parameters": [
            {
              "name": "cardId",
              "in": "path",
              "description": "ID de la tarjeta a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Tarjeta borrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Tarjeta no eliminada o error interno",
              "content": {}
            }
          }
        }
      },
      "/card/{cardId}/plans/count": {
        "get": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Cantidad de planes por tarjeta",
          "description": "Retorna la cantidad de planes por tarjeta",
          "operationId": "getPlanByCard",
          "parameters": [
            {
              "name": "cardId",
              "in": "path",
              "description": "ID de la tarjeta",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Planes de la tarjeta contadas",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No hay planes de la tarjeta o error interno",
              "content": {}
            }
          }
        }
      },
      "/card/{cardId}/plans": {
        "get": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Encontrar un plan por tarjeta",
          "description": "Retorna un plan",
          "operationId": "getPlansByCard",
          "parameters": [
            {
              "name": "cardId",
              "in": "path",
              "description": "ID de la tarjeta",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "current",
              "in": "query",
              "description": "Filtra por planes tarjetas vigentes (Por defecto es true)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "branch_id",
              "in": "query",
              "description": "Filtra por codigo sucursal (SOLO ENTERPRISE)",
              "schema": {
                "type": "string",
                "maxLength": 50
              }
            },
            {
              "name": "days_enabled",
              "in": "query",
              "description": "Filtra por dia habilitado (SOLO ENTERPRISE) (Elegir un solo dia. domingo = 1, lunes = 2, martes = 3, miercoles = 4 , jueves = 5, viernes = 6, sabado = 7)",
              "schema": {
                "type": "string",
                "maxLength": 1
              }
            },
            {
              "name": "ipPlan",
              "in": "query",
              "description": "Filtra por codigo del plan (SOLO ENTERPRISE)",
              "schema": {
                "type": "string",
                "maxLength": 50
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Plan encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCardPlans"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Plan no encontrado o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Creación de un plan (SOLO ENTERPRISE)",
          "operationId": "createPlan",
          "parameters": [
            {
              "name": "cardId",
              "in": "path",
              "description": "ID de la tarjeta",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Parametros para insertar un plan de tarjeta",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CardPlan"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "PLANTARJETA": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "put": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Actualizar un plan (SOLO ENTERPRISE)",
          "description": "Retorna el plan actualizada",
          "operationId": "updatePlansByCard",
          "parameters": [
            {
              "name": "cardId",
              "in": "path",
              "description": "ID de la tarjeta",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar un plan",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CardPlan"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Plan actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "PLANTARJETA": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Plan no actualizado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/card/{cardId}/plans/{plansId}": {
        "delete": {
          "tags": [
            "Tarjetas"
          ],
          "summary": "Borrar un plan de una tarjeta",
          "operationId": "deletePlan",
          "parameters": [
            {
              "name": "cardId",
              "in": "path",
              "description": "ID de la tarjeta",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "plansId",
              "in": "path",
              "description": "ID del plan a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Plan borrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Plan no eliminado o error interno",
              "content": {}
            }
          }
        }
      },
      "/purchases_tax_groups": {
        "get": {
          "tags": [
            "Tipos de iva compra"
          ],
          "summary": "Listado de tipo de iva compra",
          "operationId": "allPurchaseTax",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del tipo de iva compra a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetPurchaseTax"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron tipos de iva compra o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Tipos de iva compra"
          ],
          "summary": "Creación de un tipo de iva compra",
          "operationId": "createPurchaseTax",
          "requestBody": {
            "description": "Parametros para insertar un tipo de iva compra",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PurchaseTax"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOTIPO": {
                            "type": "string",
                            "description": "descripcion del codigo tipo"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/purchases_tax_groups/count": {
        "get": {
          "tags": [
            "Tipos de iva compra"
          ],
          "summary": "Cantidad de tipo de iva compra",
          "description": "Cantidad de tipos de iva compra",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del tipo de iva compra a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de tipos de iva compra",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/purchases_tax_groups/{purchaseTaxGroupsId}": {
        "get": {
          "tags": [
            "Tipos de iva compra"
          ],
          "summary": "Encontrar un tipo de iva compra por ID",
          "description": "Retorna un unico tipo de iva compra",
          "operationId": "getPurchaseTaxById",
          "parameters": [
            {
              "name": "purchaseTaxGroupsId",
              "in": "path",
              "description": "ID del tipo de iva compra a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Iva encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetPurchaseTax"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de iva compra no encontrado o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Tipos de iva compra"
          ],
          "summary": "Actualizar un tipo de iva compra",
          "description": "Retorna el tipo de iva compra actualizado",
          "operationId": "updatePurchaseTaxById",
          "parameters": [
            {
              "name": "purchaseTaxGroupsId",
              "in": "path",
              "description": "ID del tipo de iva compra a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "origin",
              "in": "query",
              "description": "Origen del tipo de iva compra",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar iva compra",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PurchaseTax"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Iva actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOTIPO": {
                            "type": "string",
                            "description": "descripcion del codigo tipo"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de iva compra no actualizado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Tipos de iva compra"
          ],
          "summary": "Borrar un tipo de iva compra",
          "operationId": "deletePurchaseTax",
          "parameters": [
            {
              "name": "purchaseTaxGroupsId",
              "in": "path",
              "description": "ID de tipo de iva compra a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Iva borrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de iva compra no eliminado o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales_tax_groups": {
        "get": {
          "tags": [
            "Tipos de iva"
          ],
          "summary": "Listado de tipo de iva",
          "operationId": "allSaleTax",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del tipo de actividad a buscar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación del tipo de iva",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetSaleTax"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron actividades o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Tipos de iva"
          ],
          "summary": "Creación de un tipo de iva",
          "operationId": "createSaleTax",
          "requestBody": {
            "description": "Parametros para insertar un tipo de iva",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SaleTax"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOTIPO": {
                            "type": "string",
                            "maxLength": 15
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/sales_tax_groups/count": {
        "get": {
          "tags": [
            "Tipos de iva"
          ],
          "summary": "Cantidad de tipo de iva",
          "description": "Cantidad de tipos de iva",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del tipo de actividad a buscar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación del tipo de actividad",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de tipos de iva",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales_tax_groups/{salesTaxGroupsId}": {
        "get": {
          "tags": [
            "Tipos de iva"
          ],
          "summary": "Encontrar un tipo de iva por ID",
          "description": "Retorna un unico tipo de iva",
          "operationId": "getSaleTaxById",
          "parameters": [
            {
              "name": "salesTaxGroupsId",
              "in": "path",
              "description": "ID del tipo de iva a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Iva encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetSaleTax"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de iva no encontrado o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Tipos de iva"
          ],
          "summary": "Actualizar un tipo de iva",
          "description": "Retorna el tipo de iva actualizado",
          "operationId": "updateSaleTaxById",
          "parameters": [
            {
              "name": "salesTaxGroupsId",
              "in": "path",
              "description": "ID del tipo de iva a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar iva",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SaleTax"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Iva actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOTIPO": {
                            "type": "string",
                            "maxLength": 15
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de iva no encontrado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Tipos de iva"
          ],
          "summary": "Borrar un tipo de iva",
          "operationId": "deleteSaleTax",
          "parameters": [
            {
              "name": "salesTaxGroupsId",
              "in": "path",
              "description": "ID de tipo de iva a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Iva borrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de iva no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/payment_methods": {
        "get": {
          "tags": [
            "Multiplazos"
          ],
          "summary": "Listado de multiplazos",
          "operationId": "allPaymentMethod",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia en descripcion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "forsale",
              "in": "query",
              "description": "filtra por multiplazos para la venta",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "forbuy",
              "in": "query",
              "description": "filtra por multiplazos para la compra",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetPaymentMethod"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron multiplazos o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Multiplazos"
          ],
          "summary": "Creación de un multiplazo (SOLO ENTERPRISE)",
          "operationId": "createPaymentMethod",
          "requestBody": {
            "description": "Parametros para insertar un multiplazo",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PaymentMethod"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOMULTIPLAZO": {
                            "type": "integer",
                            "description": "Descripcion del codigo multiplazo"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/payment_methods/count": {
        "get": {
          "tags": [
            "Multiplazos"
          ],
          "summary": "Cantidad de multiplazos",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia en descripcion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "forsale",
              "in": "query",
              "description": "filtra por multiplazos para la venta",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "forbuy",
              "in": "query",
              "description": "filtra por multiplazos para la compra",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "description": "Cantidad de multiplazos",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de multiplazos",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro multiplazo o error interno",
              "content": {}
            }
          }
        }
      },
      "/payment_methods/{paymentMethodId}": {
        "get": {
          "tags": [
            "Multiplazos"
          ],
          "summary": "Encontrar un multiplazo por ID",
          "description": "Retorna un multiplazo",
          "operationId": "getPaymentMethodById",
          "parameters": [
            {
              "name": "paymentMethodId",
              "in": "path",
              "description": "ID del multiplazo a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "multiplazo encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/GetIdPaymentMethod"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Multiplazo no encontrado o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Multiplazos"
          ],
          "summary": "Actualizar un multiplazo (SOLO ENTERPRISE)",
          "description": "Retorna el multiplazo actualizado",
          "operationId": "updatePaymentMethodById",
          "parameters": [
            {
              "name": "paymentMethodId",
              "in": "path",
              "description": "ID del multiplazo a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar el multiplazo",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PaymentMethod"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Multiplazo actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOMULTIPLAZO": {
                            "type": "integer",
                            "description": "Descripcion del codigo multiplazo"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Multiplazo no actualizado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Multiplazos"
          ],
          "summary": "Elimina un multiplazo",
          "operationId": "deletePaymentMethod",
          "parameters": [
            {
              "name": "paymentMethodId",
              "in": "path",
              "description": "ID de multiplazo a eliminar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Multiplazo eliminado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Multiplazo no eliminado o error interno",
              "content": {}
            }
          }
        }
      },
      "/employees": {
        "get": {
          "tags": [
            "Usuarios"
          ],
          "summary": "Listado de usuarios",
          "operationId": "allEmployees",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de los usuarios",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "collectors",
              "in": "query",
              "description": "Filtra por si es comprador",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "sellers",
              "in": "query",
              "description": "Filtra por si es vendedor",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetEmploye"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron usuarios o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Usuarios"
          ],
          "summary": "Creación de un usuario (SOLO ENTERPRISE)",
          "operationId": "createEmploye",
          "requestBody": {
            "description": "Parametros para insetar un usuario",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Employe"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOUSUARIO": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/employees/count": {
        "get": {
          "tags": [
            "Usuarios"
          ],
          "summary": "Cantidad de usuarios",
          "description": "Cantidad de usuarios",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de usuarios",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/employees/{employeId}": {
        "get": {
          "tags": [
            "Usuarios"
          ],
          "summary": "Encontrar un usuario por ID",
          "description": "Retorna un unico usuario",
          "operationId": "getEmployeById",
          "parameters": [
            {
              "name": "employeId",
              "in": "path",
              "description": "ID del usuario a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Usuario encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetEmploye"
                  }
                }
              }
            },
            "500": {
              "description": "Usuario no encontrado o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Usuarios"
          ],
          "summary": "Actualizar un usuario (SOLO ENTERPRISE)",
          "description": "Retorna el usuario actualizado",
          "operationId": "updateEmployeById",
          "parameters": [
            {
              "name": "employeId",
              "in": "path",
              "description": "ID del usuario a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar el usuario",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Employe"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Usuario actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOUSUARIO": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Usuario no encontrado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Usuarios"
          ],
          "summary": "Borrar un usuario",
          "operationId": "deleteEmploye",
          "parameters": [
            {
              "name": "employeId",
              "in": "path",
              "description": "ID de usuario a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Usuario borrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Usuario no eliminado o error interno",
              "content": {}
            }
          }
        }
      },
      "/areas": {
        "get": {
          "tags": [
            "Zonas"
          ],
          "summary": "Listado de zonas",
          "operationId": "allAreas",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de los zonas",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetArea"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron Zonas o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Zonas"
          ],
          "summary": "Creación de una zona (SOLO ENTERPRISE)",
          "operationId": "createArea",
          "requestBody": {
            "description": "Parametros para insertar una nueva zona",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Area"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOZONA": {
                            "type": "string",
                            "maxLength": 15
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/areas/count": {
        "get": {
          "tags": [
            "Zonas"
          ],
          "summary": "Cantidad de zonas",
          "description": "Cantidad de zonas",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de los zonas",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de zonas",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/areas/{AreaId}": {
        "get": {
          "tags": [
            "Zonas"
          ],
          "summary": "Encontrar un zona por ID",
          "description": "Retorna un unico zona",
          "operationId": "getAreaById",
          "parameters": [
            {
              "name": "AreaId",
              "in": "path",
              "description": "ID de la zona a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Zona encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetArea"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Zona no encontrada o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Zonas"
          ],
          "summary": "Actualizar una Zona (SOLO ENTERPRISE)",
          "description": "Retorna la Zona actualizada",
          "operationId": "updateAreaById",
          "parameters": [
            {
              "name": "AreaId",
              "in": "path",
              "description": "ID de la zona a actualizar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar la zona",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Area"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Zona actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOZONA": {
                            "type": "string",
                            "maxLength": 15
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Zona no encontrada o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Zonas"
          ],
          "summary": "Borrar una zona",
          "operationId": "deleteArea",
          "parameters": [
            {
              "name": "AreaId",
              "in": "path",
              "description": "ID de la Zona a borrar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Zona borrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Zona no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/accounts": {
        "get": {
          "tags": [
            "Cuentas contables"
          ],
          "summary": "Listado de cuentas contables",
          "operationId": "allAccounts",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia en descripcion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "filtra desde la fecha de modificacion",
              "schema": {
                "type": "string",
                "format": "date-time"
              }
            },
            {
              "name": "imputable_only",
              "in": "query",
              "description": "filtra por imputables",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Account"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron Cuentas contables o error interno",
              "content": {}
            }
          }
        }
      },
      "/accounts/count": {
        "get": {
          "tags": [
            "Cuentas contables"
          ],
          "summary": "Cantidad de cuentas contables",
          "description": "Cantidad de cuentas contables",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de cuentas contables",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/accounts/{accountId}": {
        "get": {
          "tags": [
            "Cuentas contables"
          ],
          "summary": "Encontrar una cuenta contable por ID",
          "description": "Retorna una cuenta contable",
          "operationId": "getAccountById",
          "parameters": [
            {
              "name": "accountId",
              "in": "path",
              "description": "ID de la cuenta contable a retornar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cuenta contable encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Account"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Cuenta cuentable no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/perceptions": {
        "get": {
          "tags": [
            "Percepciones"
          ],
          "summary": "Listado de percepciones",
          "operationId": "allPerceptions",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Filtra por coincidencias en descripcion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "filtra desde la fecha de modificacion",
              "schema": {
                "type": "string",
                "format": "date-time"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Perception"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron percepciones o error interno",
              "content": {}
            }
          }
        }
      },
      "/perceptions/count": {
        "get": {
          "tags": [
            "Percepciones"
          ],
          "summary": "Cantidad de percepciones",
          "description": "Cantidad de percepciones",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de percepciones",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/perceptions/{PerceptionId}": {
        "get": {
          "tags": [
            "Percepciones"
          ],
          "summary": "Encontrar una percepcion por ID",
          "description": "Retorna una percepcion",
          "operationId": "getPerceptionById",
          "parameters": [
            {
              "name": "PerceptionId",
              "in": "path",
              "description": "ID de la percepcion a retornar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Percepcion encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Perception"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Percepcion no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/brands": {
        "get": {
          "tags": [
            "Marcas"
          ],
          "summary": "Listado de marcas",
          "operationId": "allBrands",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de las marcas",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación de la marca",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "Filtra por rubros que estén publicados en la web",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetBrand"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron marcas o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Marcas"
          ],
          "summary": "Creación de una Marca (SOLO ENTERPRISE)",
          "operationId": "createBrand",
          "requestBody": {
            "description": "Parametros para insertar una marca",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Brand"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOMARCA": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/brands/count": {
        "get": {
          "tags": [
            "Marcas"
          ],
          "summary": "Cantidad de Marcas",
          "description": "Cantidad de Marcas",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de las marcas",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación de la marca",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "Filtra por rubros que estén publicados en la web",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de Marcas",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/brands/{brandId}": {
        "get": {
          "tags": [
            "Marcas"
          ],
          "summary": "Encontrar una Marca por ID",
          "description": "Retorna un unica Marca",
          "operationId": "getBrandById",
          "parameters": [
            {
              "name": "brandId",
              "in": "path",
              "description": "ID de la Marca a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Marca encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetBrand"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Marca no encontrada o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Marcas"
          ],
          "summary": "Actualizar una marca",
          "description": "Retorna una marca actualizado",
          "operationId": "updateBrandById",
          "parameters": [
            {
              "name": "brandId",
              "in": "path",
              "description": "ID de la marca a actualizar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar la marca",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Brand"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Marca actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOMARCA": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Marca no encontrada o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Marcas"
          ],
          "summary": "Borrar una marca",
          "operationId": "deleteBrand",
          "parameters": [
            {
              "name": "brandId",
              "in": "path",
              "description": "ID de la marca a borrar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Marca borrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Marca no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/sizes": {
        "get": {
          "tags": [
            "Talles"
          ],
          "summary": "Listado de talles",
          "operationId": "allSizes",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre del talle a buscar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación del talle",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetSize"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron talles o error interno",
              "content": {}
            }
          }
        }
      },
      "/sizes/count": {
        "get": {
          "tags": [
            "Talles"
          ],
          "summary": "Cantidad de talles",
          "description": "Cantidad de talles",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cantidad de talles",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/sizes/{sizeId}": {
        "get": {
          "tags": [
            "Talles"
          ],
          "summary": "Encontrar un talle por ID",
          "description": "Retorna el talle con Id igual a \"sizeId\"",
          "operationId": "getSizeById",
          "parameters": [
            {
              "name": "sizeId",
              "in": "path",
              "description": "ID del talle a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Talle encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetSize"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Talle no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/stock": {
        "get": {
          "tags": [
            "Stock"
          ],
          "summary": "Listado de stock",
          "operationId": "allStock",
          "parameters": [
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha desde",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "warehouse_list",
              "in": "query",
              "description": "Codigos de depositos a filtrar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "Filtra por si se publica web",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "warehouse_visible",
              "in": "query",
              "description": "Filtra por el deposito visible (Solo para corrolon)",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetStock"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron stock o error interno",
              "content": {}
            }
          }
        }
      },
      "/stock/count": {
        "get": {
          "tags": [
            "Stock"
          ],
          "summary": "Cantidad de stock",
          "description": "Cantidad de stock",
          "parameters": [
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha desde",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "warehouse_list",
              "in": "query",
              "description": "Codigos de depositos a filtrar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "Filtra por si se publica web",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "warehouse_visible",
              "in": "query",
              "description": "Filtra por el deposito visible (Solo para corrolon)",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de stock",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/stock/{stockId}": {
        "get": {
          "tags": [
            "Stock"
          ],
          "summary": "Encontrar un stock por ID",
          "description": "Retorna un unico stock",
          "operationId": "getStockById",
          "parameters": [
            {
              "name": "stockId",
              "in": "path",
              "description": "ID del stock a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha desde",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "warehouse_list",
              "in": "query",
              "description": "Codigos de depositos a filtrar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "Filtra por si se publica web",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "warehouse_visible",
              "in": "query",
              "description": "Filtra por el deposito visible (Solo para corrolon)",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Stock encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetStock"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Stock no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/stock/real": {
        "get": {
          "tags": [
            "Stock"
          ],
          "summary": "cantidad de stock real (Solo corrolon)",
          "description": "Retorna un unico stock real",
          "operationId": "getStockReal",
          "parameters": [
            {
              "name": "id",
              "in": "query",
              "description": "ID del stock a retornar",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha desde",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "warehouse_list",
              "in": "query",
              "description": "Codigos de depositos a filtrar",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "warehouse_visible",
              "in": "query",
              "description": "Filtra por el deposito visible",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Stock encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetReal"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Stock no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/bank_accounts": {
        "get": {
          "tags": [
            "Cuentas bancarias"
          ],
          "summary": "Listado de cuentas bancarias",
          "operationId": "allBankAccounts",
          "parameters": [
            {
              "name": "idBank",
              "in": "query",
              "description": "Filtra por el codigo de banco",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "idBranch",
              "in": "query",
              "description": "Filtra por el codigo de la sucursal del banco",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetBankAccount"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron cuentas bancarias o error interno",
              "content": {}
            }
          }
        }
      },
      "/bank_accounts/{idBank}/{idBranch}": {
        "get": {
          "tags": [
            "Cuentas bancarias"
          ],
          "summary": "Listado de cuentas bancarias por su codigo de banco y codigo sucursal",
          "operationId": "findOneBankAccounts",
          "parameters": [
            {
              "name": "idBank",
              "in": "path",
              "required": true,
              "description": "Filtra por el codigo de banco",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "idBranch",
              "in": "path",
              "required": true,
              "description": "Filtra por el codigo de la sucursal del banco",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetBankAccount"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron cuentas bancarias o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Cuentas bancarias"
          ],
          "summary": "Creación de una cuenta bancaria (SOLO ENTERPRISE)",
          "operationId": "createBankAccount",
          "parameters": [
            {
              "name": "idBank",
              "in": "path",
              "description": "ID del banco",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "idBranch",
              "in": "path",
              "description": "ID de la sucursal",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Nombre de la cuenta bancaria",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BankAccount"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "NUMEROCUENTA": {
                            "type": "string",
                            "maxLength": 20
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "put": {
          "tags": [
            "Cuentas bancarias"
          ],
          "summary": "Actualizar una cuenta bancaria (SOLO ENTERPRISE)",
          "description": "Retorna la cuenta bancaria actualizado",
          "operationId": "updateBankAccountById",
          "parameters": [
            {
              "name": "idBank",
              "in": "path",
              "description": "ID del banco",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            },
            {
              "name": "idBranch",
              "in": "path",
              "description": "ID de la sucursal",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar la cuenta bancaria",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BankAccount"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cuenta bancaria actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "NUMEROCUENTA": {
                            "type": "string",
                            "maxLength": 20
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Cuenta bancaria no encontrada o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/bank_accounts/count": {
        "get": {
          "tags": [
            "Cuentas bancarias"
          ],
          "summary": "Cantidad de cuentas bancarias",
          "description": "Cantidad de cuentas bancarias",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de cuentas bancarias",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/bank_accounts/{bankAccountId}": {
        "get": {
          "tags": [
            "Cuentas bancarias"
          ],
          "summary": "Encontrar una cuenta bancaria por ID",
          "description": "Retorna una unica cuenta bancaria",
          "operationId": "getBankAccountById",
          "parameters": [
            {
              "name": "bankAccountId",
              "in": "path",
              "description": "ID del cuenta bancaria a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cuenta bancaria encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetBankAccount"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Cuenta bancaria no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/bank_accounts/{idBank}/{idBranch}/{idAccount}": {
        "delete": {
          "tags": [
            "Cuentas bancarias"
          ],
          "summary": "Borrar una cuenta bancaria",
          "operationId": "deleteBankAccount",
          "parameters": [
            {
              "name": "idBank",
              "in": "path",
              "description": "ID del banco",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "idBranch",
              "in": "path",
              "description": "ID de la sucursal del banco",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "idAccount",
              "in": "path",
              "description": "ID de la cuenta bancaria",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cuenta bancaria borrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Cuenta bancaria no eliminada o error interno",
              "content": {}
            }
          }
        }
      },
      "/bank": {
        "get": {
          "tags": [
            "Bancos"
          ],
          "summary": "Listado de bancos",
          "operationId": "allBanks",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencias en nombre banco",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetBank"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron bancos o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Bancos"
          ],
          "summary": "Creación de un banco",
          "operationId": "createBank",
          "requestBody": {
            "description": "Parametros para insertar un banco",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BankPost"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "NOMBREBANCO": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/bank/count": {
        "get": {
          "tags": [
            "Bancos"
          ],
          "summary": "Cantidad de bancos",
          "description": "Cantidad de bancos",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de bancos",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/bank/{bankId}": {
        "get": {
          "tags": [
            "Bancos"
          ],
          "summary": "Encontrar un banco por ID",
          "description": "Retorna un banco",
          "operationId": "getBankById",
          "parameters": [
            {
              "name": "bankId",
              "in": "path",
              "description": "ID del banco a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Banco encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetBank"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Banco no actualizado o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Bancos"
          ],
          "summary": "Actualizar un banco",
          "description": "Retorna un banco actualizado",
          "operationId": "updateBankById",
          "parameters": [
            {
              "name": "bankId",
              "in": "path",
              "description": "ID del banco a actualizar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "Parametros para actualizar el banco",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BankPut"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Banco actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "NOMBREBANCO": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Banco no actualizado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Bancos"
          ],
          "summary": "Eliminar un banco",
          "operationId": "deleteBank",
          "parameters": [
            {
              "name": "bankId",
              "in": "path",
              "description": "ID del banco a eliminar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Banco eliminado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Banco no eliminado o error interno",
              "content": {}
            }
          }
        }
      },
      "/bank/{bankId}/branches": {
        "get": {
          "tags": [
            "Sucursales"
          ],
          "summary": "Listado de las sucursales del banco",
          "operationId": "allBranches",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de las sucursales",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "bankId",
              "in": "path",
              "description": "ID del banco",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetBranch"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron sucursales del banco o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Sucursales"
          ],
          "summary": "Creación de una sucursal",
          "operationId": "createBranch",
          "parameters": [
            {
              "name": "bankId",
              "in": "path",
              "description": "ID del banco",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "Nombre de la sucursal",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BranchesPost"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOSUCURSALBANCO": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/bank/{bankId}/branches/count": {
        "get": {
          "tags": [
            "Sucursales"
          ],
          "summary": "Cantidad de sucursales",
          "description": "Cantidad de sucursales",
          "parameters": [
            {
              "name": "bankId",
              "in": "path",
              "description": "ID del banco a borrar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de sucursales",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/bank/{bankId}/branches/{idBranch}": {
        "get": {
          "tags": [
            "Sucursales"
          ],
          "summary": "Encontrar una sucursal por ID",
          "description": "Retorna una unica sucursal",
          "operationId": "getBranchById",
          "parameters": [
            {
              "name": "bankId",
              "in": "path",
              "description": "ID del banco",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "idBranch",
              "in": "path",
              "description": "ID de la sucursal",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Sucursal encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetBranch"
                  }
                }
              }
            },
            "500": {
              "description": "Sucursal no encontrado o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Sucursales"
          ],
          "summary": "Actualizar una sucursal",
          "description": "Retorna una sucursal actualizado",
          "operationId": "updateBranchById",
          "parameters": [
            {
              "name": "bankId",
              "in": "path",
              "description": "ID del banco",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "idBranch",
              "in": "path",
              "description": "ID de la sucursal",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar la Sucursal",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Branch"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Sucursal actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "CODIGOSUCURSALBANCO": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Sucursal no actualizado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Sucursales"
          ],
          "summary": "Borrar una sucursal",
          "operationId": "deleteBranch",
          "parameters": [
            {
              "name": "bankId",
              "in": "path",
              "description": "ID del banco",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "idBranch",
              "in": "path",
              "description": "ID de la sucursal",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Sucursal borrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            },
            "500": {
              "description": "Sucursal no eliminada o error interno",
              "content": {}
            }
          }
        }
      },
      "/auth/login": {
        "post": {
          "tags": [
            "Login"
          ],
          "summary": "Logearse",
          "operationId": "Login",
          "requestBody": {
            "description": "Login",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Login"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetLogin"
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/auth/me": {
        "get": {
          "tags": [
            "Login"
          ],
          "summary": "Refresca datos",
          "operationId": "Refresh data",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Refrescado de datos correcto",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetMe"
                  }
                }
              }
            },
            "500": {
              "description": "Token incorrecto o error interno",
              "content": {}
            }
          }
        }
      },
      "/auth/refresh_token": {
        "post": {
          "tags": [
            "Login"
          ],
          "summary": "Refrescar token",
          "operationId": "refreshToken",
          "requestBody": {
            "description": "Refrescar el token",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RefreshToken"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Refrescado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetRefreshToken"
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/companies": {
        "get": {
          "tags": [
            "Companias"
          ],
          "summary": "Trae las companias (SOLO ENTERPRISE)",
          "operationId": "GetCompany",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Trae las companias",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetCompany"
                  }
                }
              }
            },
            "500": {
              "description": "No hay Companias o error interno",
              "content": {}
            }
          }
        }
      },
      "/budgets": {
        "get": {
          "tags": [
            "Presupuestos"
          ],
          "summary": "Trae los Presupuestos",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "filtra por datos en razon social",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "customerId",
              "in": "query",
              "description": "Filtro por codigo del cliente y el codigo particular del cliente",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "canceled",
              "in": "query",
              "description": "Filtro de anulado",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "number_from",
              "in": "query",
              "description": "Filtro de numero desde",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "Filtro de fecha desde",
              "schema": {
                "type": "string",
                "format": "time-date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "Filtro de fecha hasta",
              "schema": {
                "type": "string",
                "format": "time-date"
              }
            },
            {
              "name": "productId",
              "in": "query",
              "description": "Filtro por codigo del producto",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "brandId",
              "in": "query",
              "description": "Filtro por codigo de la marca",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "operationId",
              "in": "query",
              "description": "Filtro por codigo de la operacion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "responsableId",
              "in": "query",
              "description": "Filtro por codigo del responsable",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "pending",
              "in": "query",
              "description": "Filtro por pendiente",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "observation",
              "in": "query",
              "description": "Filtro por las observaciones",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "approved",
              "in": "query",
              "description": "filtra por estado de aprobacion",
              "schema": {
                "type": "string"
              }
            }
          ],
          "operationId": "GetBudget",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Trae los Presupuestos",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetBudget"
                  }
                }
              }
            },
            "500": {
              "description": "No hay Presupuestos o error interno",
              "content": {}
            }
          }
        }
      },
      "/budgets/count": {
        "get": {
          "tags": [
            "Presupuestos"
          ],
          "summary": "Trae la cantidad de Presupuestos",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "filtra por datos en razon social",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "customerId",
              "in": "query",
              "description": "Filtro por codigo del cliente",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "canceled",
              "in": "query",
              "description": "Filtro de anulado",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "number_from",
              "in": "query",
              "description": "Filtro de numero desde",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "Filtro de fecha desde",
              "schema": {
                "type": "string",
                "format": "time-date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "Filtro de fecha hasta",
              "schema": {
                "type": "string",
                "format": "time-date"
              }
            },
            {
              "name": "productId",
              "in": "query",
              "description": "Filtro por codigo del producto",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "brandId",
              "in": "query",
              "description": "Filtro por codigo de la marca",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "operationId",
              "in": "query",
              "description": "Filtro por codigo de la operacion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "responsableId",
              "in": "query",
              "description": "Filtro por codigo del responsable",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "pending",
              "in": "query",
              "description": "Filtro por pendiente",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "observation",
              "in": "query",
              "description": "Filtro por las observaciones",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "approved",
              "in": "query",
              "description": "filtra por estado de aprobacion",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de presupuestos",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/budgets/{id}": {
        "get": {
          "tags": [
            "Presupuestos"
          ],
          "summary": "Trae un presupuesto",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "description": "filtra por numero comprobante",
              "schema": {
                "type": "number",
                "format": "double"
              }
            }
          ],
          "operationId": "budgetsDetail",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Trae Presupuesto segun el numero comprobante",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/GetBudgetsDetail"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No hay Presupuesto o error interno",
              "content": {}
            }
          }
        }
      },
      "/orders": {
        "get": {
          "tags": [
            "Ordenes"
          ],
          "summary": "Listado de ordenes",
          "operationId": "allOrders",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Razon social  o nombre fantasia de cliente",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "Filtro de fecha desde",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "Filtro de fecha hasta",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "warehouse_id",
              "in": "query",
              "description": "Filtro numero de deposito",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "delivered",
              "in": "query",
              "description": "Filtro por entrega",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "withoutstarting",
              "in": "query",
              "description": "filtra por si empezo el pedido (recibe 0 o 1)",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Order"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron ordenes o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Ordenes"
          ],
          "summary": "Creación de una orden. Presupuesto, Nota de Pedido o Factura",
          "operationId": "createOrder",
          "requestBody": {
            "description": "Datos para generar la orden. El campo paymentsDetail solo se utiliza para  Enterprise",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateOrder"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "success"
                      },
                      "orderType": {
                        "type": "string"
                      },
                      "linequantity": {
                        "type": "integer"
                      },
                      "order_Id": {
                        "type": "integer"
                      },
                      "customer": {
                        "$ref": "#/components/schemas/Orders"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/orders/count": {
        "get": {
          "tags": [
            "Ordenes"
          ],
          "summary": "Cantidad de ordenes",
          "description": "Cantidad de ordenes",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Razon social  o nombre fantasia de cliente",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "Filtro de fecha desde",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "Filtro de fecha hasta",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "warehouse_id",
              "in": "query",
              "description": "Filtro numero de deposito",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "delivered",
              "in": "query",
              "description": "Filtro por entrega",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por el cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "withoutstarting",
              "in": "query",
              "description": "filtra por si empezo el pedido (recibe 0 o 1)",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de ordenes",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/orders/{type}/{id}": {
        "get": {
          "tags": [
            "Ordenes"
          ],
          "summary": "Retorna detalle de una orden",
          "description": "Retorna detalle de una orden",
          "operationId": "getOrderDetail",
          "parameters": [
            {
              "name": "type",
              "in": "path",
              "description": "Tipo de orden (NP)",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "in": "path",
              "description": "Número de orden",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "delivered",
              "in": "query",
              "description": "Filtro por entrega",
              "schema": {
                "type": "number"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Orden encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/OrderDetail"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Orden no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/orders/{type}/{id}/invoice": {
        "post": {
          "tags": [
            "Ordenes"
          ],
          "summary": "Facturar un pedido pendiente (SOLO ENTERPRISE)",
          "description": "Facturar un pedido pendiente",
          "operationId": "orderInvoice",
          "parameters": [
            {
              "name": "type",
              "in": "path",
              "description": "Tipo de orden (NP,PR,FC)",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "in": "path",
              "description": "Número de orden",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "Usuario que genera la operacion",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "user_id": {
                      "type": "string",
                      "description": "Código de usuario"
                    }
                  }
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Orden encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "TIPOCOMPROBANTE": {
                        "type": "string"
                      },
                      "NUMEROCOMPROBANTE": {
                        "type": "number",
                        "format": "double"
                      },
                      "NUMEROPAGO": {
                        "type": "number",
                        "format": "double"
                      },
                      "NUMEROASIENTO": {
                        "type": "number",
                        "format": "double"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Orden no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales": {
        "get": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Listado de comprobantes de venta",
          "operationId": "saleList",
          "parameters": [
            {
              "name": "branch_code",
              "in": "query",
              "description": "filtra por codigosucursal",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "filtra por la fecha desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "filtra por la fecha hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "warehouse_id",
              "in": "query",
              "description": "filtra por el codigo de deposito",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "type",
              "in": "query",
              "description": "filtra por tipo de comprobante",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "customer",
              "in": "query",
              "description": "filtra por el codigo de cliente",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "ctacte",
              "in": "query",
              "description": "filtra por si es cuenta corriente",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "owed",
              "in": "query",
              "description": "filtra por si es adeudado",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "filtra por la fecha de modificacion",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_hour_from",
              "in": "query",
              "description": "filtra por la fecha Y hora desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_hour_to",
              "in": "query",
              "description": "filtra por la fecha y hora hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/SalesGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron comprobantes de venta o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Creación de un comprobante de venta",
          "operationId": "saleCreate",
          "requestBody": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateSale"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string"
                      },
                      "orderType": {
                        "type": "string"
                      },
                      "order_Id": {
                        "type": "integer"
                      },
                      "linequantity": {
                        "type": "integer"
                      },
                      "customer": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Orders"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros invalidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/manualinvoice": {
        "post": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Creación de una factura de venta manual (SOLO ENTERPRISE)",
          "operationId": "invoicesManual",
          "requestBody": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/manualinvoice"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string"
                      },
                      "orderType": {
                        "type": "string"
                      },
                      "order_number": {
                        "type": "integer"
                      },
                      "customer": {
                        "$ref": "#/components/schemas/Orders"
                      },
                      "warning": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros invalidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/creditnote": {
        "post": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Creación de una nota de crédito (SOLO ENTERPRISE)",
          "operationId": "noteCredit",
          "requestBody": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/creditnoteventa"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string"
                      },
                      "orderType": {
                        "type": "string"
                      },
                      "order_number": {
                        "type": "integer"
                      },
                      "customer": {
                        "$ref": "#/components/schemas/Orders"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros invalidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/manualcreditnote": {
        "post": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Creación de una nota de crédito (SOLO ENTERPRISE)",
          "operationId": "manualnoteCredit",
          "requestBody": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/manualcreditnoteventa"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string"
                      },
                      "orderType": {
                        "type": "string"
                      },
                      "order_number": {
                        "type": "integer"
                      },
                      "customer": {
                        "$ref": "#/components/schemas/Orders"
                      },
                      "warning": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros invalidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales/count": {
        "get": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Cantidad de comprobantes de ventas",
          "description": "Cantidad de comprobantes de ventas",
          "operationId": "saleListCount",
          "parameters": [
            {
              "name": "branch_code",
              "in": "query",
              "description": "filtra por codigosucursal",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "filtra por la fecha desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "filtra por la fecha hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "warehouse_id",
              "in": "query",
              "description": "filtra por el codigo de deposito",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "type",
              "in": "query",
              "description": "filtra por tipo de comprobante",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "customer",
              "in": "query",
              "description": "filtra por el codigo de cliente",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "ctacte",
              "in": "query",
              "description": "filtra por si es cuenta corriente",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "owed",
              "in": "query",
              "description": "filtra por si es adeudado",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "filtra por la fecha de modificacion",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_hour_from",
              "in": "query",
              "description": "filtra por la fecha Y hora desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_hour_to",
              "in": "query",
              "description": "filtra por la fecha y hora hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cantidad",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Error interno",
              "content": {}
            }
          }
        }
      },
      "/sales/{type}/{id}": {
        "get": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Encontrar un compronte de venta",
          "description": "Encontrar un comprobante de venta por id y tipo",
          "operationId": "",
          "parameters": [
            {
              "name": "id",
              "description": "Id del comprobante de venta a buscar",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "type",
              "description": "Tipo de comprobante de venta a buscar",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number",
                "format": "double"
              }
            },
            {
              "name": "branch_code",
              "in": "query",
              "description": "Codigosucursal a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Comprobante de venta encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/SalesGetOne"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Comprobante de venta no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales/vouchers/{idclient}": {
        "get": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Encontrar los comprobantes de cuenta corriente de venta por cliente",
          "description": "Encontrar los comprobantes de cuenta corriente de venta por cliente",
          "operationId": "",
          "parameters": [
            {
              "name": "idclient",
              "description": "ID del cliente a buscar",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "show_stockpiling",
              "in": "query",
              "description": "muestra acopio (SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "stockpiling_id",
              "in": "query",
              "description": "codigo acopio (SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "separate_payment_method",
              "in": "query",
              "description": "separa multiplazp",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "show_delivery_docket",
              "in": "query",
              "description": "muestra remito",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "exclude_credit_note (SOLO CORRALON)",
              "in": "query",
              "description": "excluir nota de credito",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "expired_days",
              "in": "query",
              "description": "dias vencidos",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "id_point_sale",
              "in": "query",
              "description": "codigo punto de venta (SOLO ENTERPRISE)",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "customer_group",
              "in": "query",
              "description": "grupo cliente (SOLO ENTERPRISE)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "type_receipt",
              "in": "query",
              "description": "clase comprobante (SOLO ENTERPRISE)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "id_brand",
              "in": "query",
              "description": "codigo marca (SOLO ENTERPRISE)",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Comprobante de ventas",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/SalesCurrentAccount"
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Comprobante de venta no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales/checks/{idclient}": {
        "get": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Encontrar los cheques de cuenta corriente de venta por cliente",
          "description": "Encontrar los cheques de cuenta corriente de venta por cliente",
          "operationId": "",
          "parameters": [
            {
              "name": "idclient",
              "description": "ID del cliente a buscar",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "customer_group",
              "description": "codigo del grupo cliente a buscar (SOLO ENTERPRISE)",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Comprobante de ventas",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/SalesChecksCurrentAccount"
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Cheques de cuenta corriente de venta por cliente no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales/payment": {
        "post": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Integra un pago en cuenta corriente",
          "description": "Integra pago por cuenta corriente",
          "operationId": "salePayment",
          "requestBody": {
            "description": "Información del pago",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Payment"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Pago integrado correctamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "success"
                      },
                      "paynumber": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Error al integrar el pago",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Error al confirmar el pago 156"
                      },
                      "errorDetail": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/cashregister/cashpayments": {
        "get": {
          "tags": [
            "Caja"
          ],
          "summary": "Pagos en efectivo",
          "operationId": "getCashPayments",
          "parameters": [
            {
              "name": "codeBox",
              "description": "CODIGOCAJA de los pagos a buscar",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dateFrom",
              "description": "FECHADESDE (YYYY-MM-DD)",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "description": "FECHAHASTA (YYYY-MM-DD)",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "currentAccountMovements",
              "description": "CUENTACORRIENTE (null, 0 o 1) (null trae todos los pagos)",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCashRegister"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron pagos en efectivo o error interno",
              "content": {}
            }
          }
        }
      },
      "/cashregister/cardpayments": {
        "get": {
          "tags": [
            "Caja"
          ],
          "summary": "Pagos con tarjeta",
          "operationId": "getCardPayments",
          "parameters": [
            {
              "name": "codeBox",
              "description": "CODIGOCAJA de los pagos a buscar",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dateFrom",
              "description": "FECHADESDE (YYYY-MM-DD)",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "description": "FECHAHASTA (YYYY-MM-DD)",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCardRegister"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron pagos con tarjetas o error interno",
              "content": {}
            }
          }
        }
      },
      "/cashregister/transferpayments": {
        "get": {
          "tags": [
            "Caja"
          ],
          "summary": "Pagos con transferencia",
          "operationId": "getTransferPayments",
          "parameters": [
            {
              "name": "codeBox",
              "description": "CODIGOCAJA de los pagos a buscar",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dateFrom",
              "description": "FECHADESDE (YYYY-MM-DD)",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "description": "FECHAHASTA (YYYY-MM-DD)",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetTransferRegister"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron pagos con transferencias o error interno",
              "content": {}
            }
          }
        }
      },
      "/cashregister/checkpayments": {
        "get": {
          "tags": [
            "Caja"
          ],
          "summary": "Pagos con cheques",
          "operationId": "getCheckPayments",
          "parameters": [
            {
              "name": "codeBox",
              "description": "CODIGOCAJA de los pagos a buscar",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dateFrom",
              "description": "FECHADESDE (YYYY-MM-DD)",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dateTo",
              "description": "FECHAHASTA (YYYY-MM-DD)",
              "required": true,
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetCheckRegister"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron pagos con cheques o error interno",
              "content": {}
            }
          }
        }
      },
      "/deliverydata/{vouchertype}/{vouchernumber}": {
        "get": {
          "tags": [
            "Datos de Entrega"
          ],
          "summary": "Encontrar un dato de entrega por tipocomprobante y numerocomprobante",
          "description": "Encontrar un dato de entrega",
          "operationId": "deliverydata findOne",
          "parameters": [
            {
              "name": "vouchertype",
              "in": "path",
              "description": "Tipo de comprobante a retornar",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "vouchernumber",
              "in": "path",
              "description": "Numero de comprobante a retornar",
              "required": true,
              "schema": {
                "type": "number",
                "format": "double"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Dato de entrega encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetDeliveryData"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/versions": {
        "get": {
          "tags": [
            "Versiones"
          ],
          "summary": "Muestra la version del api actual y la ultima de erp",
          "operationId": "findLastVersion",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "VERSIONERP": {
                        "type": "string"
                      },
                      "VERSIONAPI": {
                        "type": "string"
                      },
                      "PRODUCTO_ID": {
                        "type": "integer"
                      },
                      "CPU": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "model": {
                              "type": "string"
                            },
                            "speed": {
                              "type": "integer"
                            },
                            "times": {
                              "type": "object",
                              "properties": {
                                "user": {
                                  "type": "integer"
                                },
                                "nice": {
                                  "type": "integer"
                                },
                                "sys": {
                                  "type": "integer"
                                },
                                "idle": {
                                  "type": "integer"
                                },
                                "irq": {
                                  "type": "integer"
                                }
                              }
                            }
                          }
                        }
                      },
                      "MEMORIA": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron versiones o error interno",
              "content": {}
            }
          }
        }
      },
      "/companydata": {
        "get": {
          "tags": [
            "Empresa"
          ],
          "summary": "Busqueda de su empresa",
          "operationId": "Empresa findOne",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/EmpresaGet"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro empresa o error interno",
              "content": {}
            }
          }
        }
      },
      "/stockpiling/{stockpiling_id}": {
        "get": {
          "tags": [
            "Acopios"
          ],
          "summary": "Cantidad de acopios por codigo",
          "description": "Retorna acopio por codigo",
          "operationId": "findByAcopio",
          "parameters": [
            {
              "name": "stockpiling_id",
              "in": "path",
              "required": true,
              "description": "ID de acopio",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Acopio registrados",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetAcopio"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No hay acopio o error interno",
              "content": {}
            }
          }
        }
      },
      "/stockpiling/{stockpiling_id}/customer/{customer_id}": {
        "get": {
          "tags": [
            "Acopios"
          ],
          "summary": "Busqueda de un acopio",
          "description": "Retorna acopio por codigo acopio y codigo cliente",
          "operationId": "findByCodigoAcopioCodigoCliente",
          "parameters": [
            {
              "name": "stockpiling_id",
              "in": "path",
              "required": true,
              "description": "ID de acopio",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "customer_id",
              "in": "path",
              "required": true,
              "description": "ID de cliente",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Acopio registrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetAcopio"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No hay acopio o error interno",
              "content": {}
            }
          }
        }
      },
      "/stockpiling/details/{stockpiling_id}": {
        "get": {
          "tags": [
            "Acopios"
          ],
          "summary": "Cantidad de detalle acopios por codigo",
          "description": "Retorna detalle acopio por codigo",
          "operationId": "findDetalleByAcopio",
          "parameters": [
            {
              "name": "stockpiling_id",
              "in": "path",
              "required": true,
              "description": "ID de acopio",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Acopio registrados",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetDetalleAcopios"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No hay acopio o error interno",
              "content": {}
            }
          }
        }
      },
      "/compatibilidadApp/{version}": {
        "get": {
          "tags": [
            "CompatibilidadApp"
          ],
          "summary": "Encuentra la compatibilidadApp compatible de a cuerdo a la versionAppDesde",
          "description": "Retorna versionApi y versionAppDesde y si la version encontrada es compatible con la que contiene package.json",
          "operationId": "findCompatibilidadApp",
          "parameters": [
            {
              "name": "version",
              "in": "path",
              "description": "versionAppDesde de la compatibilidadApp",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "CompatibilidadApp encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CompatibilidadAppGet"
                  }
                }
              }
            },
            "500": {
              "description": "CompatibilidadApp no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/deliverytype": {
        "get": {
          "tags": [
            "Tipos de Entrega"
          ],
          "summary": "Listado de tipos de entrega",
          "operationId": "getAll tipoentrega",
          "parameters": [
            {
              "name": "withdrawclient",
              "in": "query",
              "description": "filtra por si retira el cliente",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "validclosingday",
              "in": "query",
              "description": "filtra por si valida cierre dia",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "checkfreight",
              "in": "query",
              "description": "filtra por si verifica flete",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "deliveryispending",
              "in": "query",
              "description": "filtra por si es pendiente de entrega",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/DeliveryTypeGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron tipos de entrega o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Tipos de Entrega"
          ],
          "summary": "Creación de un tipo de entrega (SOLO ENTERPRISE)",
          "operationId": "insert tipoentrega",
          "requestBody": {
            "description": "Tipo de entrega a crear",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DeliveryTypeREQINSERT"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "properties": {
                            "CODIGOTIPOENTREGA": {
                              "type": "integer",
                              "description": "descripcion del codigo tipo de entrega"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/deliverytype/{deliverytypecode}": {
        "get": {
          "tags": [
            "Tipos de Entrega"
          ],
          "summary": "Encontrar un tipo de entrega",
          "description": "Retorna un tipo de entrega",
          "operationId": "findOne tipoentrega",
          "parameters": [
            {
              "name": "deliverytypecode",
              "in": "path",
              "description": "ID del tipo entrega a encontrar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Tipo de entrega encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/DeliveryTypeGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de entrega no actualizado o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Tipos de Entrega"
          ],
          "summary": "Actualizar un tipo de entrega (SOLO ENTERPRISE)",
          "description": "Retorna tipo de entrega actualizado",
          "operationId": "update tipoentrega",
          "parameters": [
            {
              "name": "deliverytypecode",
              "in": "path",
              "description": "ID del tipo entrega a actualizar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "Datos para actualizar moneda",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DeliveryTypeREQ"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Tipo de entrega actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de entrega no encontrado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Tipos de Entrega"
          ],
          "summary": "Borrar un tipo de entrega",
          "operationId": "deleteOne tipoentrega",
          "parameters": [
            {
              "name": "deliverytypecode",
              "in": "path",
              "description": "ID del tipo entrega a borrar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Tipo de entrega borrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Tipo de entrega no borrado o error interno"
            }
          }
        }
      },
      "/items": {
        "get": {
          "tags": [
            "Rubros"
          ],
          "summary": "Listado de rubros",
          "operationId": "getAll rubros",
          "parameters": [
            {
              "name": "id",
              "in": "query",
              "description": "Codigo Rubro",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "Busqueda por descripcion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación del rubro",
              "schema": {
                "type": "string",
                "format": "date-time"
              }
            },
            {
              "name": "codesuperitem",
              "in": "query",
              "description": "Codigo Super Rubro",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "Filtra por muestra web (solo 0 o 1)",
              "schema": {
                "type": "number"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetItems"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron rubros o error interno",
              "content": {}
            }
          }
        }
      },
      "/items/{Id}": {
        "get": {
          "tags": [
            "Rubros"
          ],
          "summary": "Encontrar un rubro por ID",
          "description": "Retorna un unico rubro",
          "operationId": "findOne rubros",
          "parameters": [
            {
              "name": "Id",
              "in": "path",
              "description": "ID del rubro a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "rubro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetItems"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Rubro no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/superitems": {
        "get": {
          "tags": [
            "Super Rubros"
          ],
          "summary": "Listado de super rubros",
          "operationId": "getAll super rubros",
          "parameters": [
            {
              "name": "id",
              "in": "query",
              "description": "Codigo Super Rubro",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "Busqueda por descripcion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación del rubro",
              "schema": {
                "type": "string",
                "format": "date-time"
              }
            },
            {
              "name": "codegroupsuperitem",
              "in": "query",
              "description": "Codigo Grupo Super Rubro",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "Filtra por muestra web (solo 0 o 1)",
              "schema": {
                "type": "number"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetSuperItems"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron super rubros o error interno",
              "content": {}
            }
          }
        }
      },
      "/superitems/{Id}": {
        "get": {
          "tags": [
            "Super Rubros"
          ],
          "summary": "Encontrar un super rubro por ID",
          "description": "Retorna un unico super rubro",
          "operationId": "findOne super rubros",
          "parameters": [
            {
              "name": "Id",
              "in": "path",
              "description": "ID del super rubro a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "super rubro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetSuperItems"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Super Rubro no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/groupsuperitems": {
        "get": {
          "tags": [
            "Grupo Super Rubros"
          ],
          "summary": "Listado de grupo super rubros",
          "operationId": "getAll grupo super rubros",
          "parameters": [
            {
              "name": "id",
              "in": "query",
              "description": "Codigo Grupo Super Rubro",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "Busqueda por descripcion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Fecha de modificación del rubro",
              "schema": {
                "type": "string",
                "format": "date-time"
              }
            },
            {
              "name": "web_published_only",
              "in": "query",
              "description": "Filtra por muestra web (solo 0 o 1)",
              "schema": {
                "type": "number"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetGroupSuperItems"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron grupo super rubros o error interno",
              "content": {}
            }
          }
        }
      },
      "/groupsuperitems/{Id}": {
        "get": {
          "tags": [
            "Grupo Super Rubros"
          ],
          "summary": "Encontrar un grupo super rubro por ID",
          "description": "Retorna un unico grupo super rubro",
          "operationId": "findOne grupo super rubros",
          "parameters": [
            {
              "name": "Id",
              "in": "path",
              "description": "ID del grupo super rubro a retornar",
              "required": true,
              "schema": {
                "type": "integer",
                "format": "int64"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "grupo super rubro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetGroupSuperItems"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Grupo Super Rubro no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/generalparameters": {
        "get": {
          "tags": [
            "Parametros Generales"
          ],
          "summary": "Listado de los parametros generales",
          "operationId": "getAll parametrosgenerales",
          "parameters": [
            {
              "name": "parameterId",
              "in": "query",
              "description": "filtra por el codigo parametro",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ParametrosGeneralesGETALL"
                        }
                      },
                      "count": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron parametros o error interno",
              "content": {}
            }
          }
        }
      },
      "/multiforms/wireTransfer/{payment_method_id}": {
        "get": {
          "tags": [
            "MultiFormas"
          ],
          "summary": "Encontrar un multiplazo por payment_method_id",
          "description": "Encontrar una multiforma",
          "operationId": "multiforms findBanksByPaymentMethodId",
          "parameters": [
            {
              "name": "payment_method_id",
              "in": "path",
              "description": "Tipo del codigo de multiforma a buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Multiforma encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetMultiPlaceBank"
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/multiforms/checks/{payment_method_id}": {
        "get": {
          "tags": [
            "MultiFormas"
          ],
          "summary": "Encontrar un multiforma por payment_method_id",
          "description": "Encontrar un multiforma",
          "operationId": "multiforms findChecksByPaymentMethodId",
          "parameters": [
            {
              "name": "payment_method_id",
              "in": "path",
              "description": "Tipo del codigo de multiplazo a buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Multiforma encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetMultiPlaceCheck"
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/multiforms/cashs/{payment_method_id}": {
        "get": {
          "tags": [
            "MultiFormas"
          ],
          "summary": "Encontrar una multiforma por payment_method_id",
          "description": "Encontrar un multiforma",
          "operationId": "multiforms findCoinsByPaymentMethodId",
          "parameters": [
            {
              "name": "payment_method_id",
              "in": "path",
              "description": "Tipo del codigo de multiplazo a buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Multiforma encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetMultiPlaceCoin"
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/multiforms/cards/{payment_method_id}": {
        "get": {
          "tags": [
            "MultiFormas"
          ],
          "summary": "Encontrar un multiforma por payment_method_id",
          "description": "Encontrar un multiforma",
          "operationId": "multiforms findCardsByPaymentMethodId",
          "parameters": [
            {
              "name": "payment_method_id",
              "in": "path",
              "description": "Tipo del codigo de multiplazo a buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Multiforma encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetMultiPlaceCard"
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/specialpermissions/{profileId}": {
        "get": {
          "tags": [
            "Permisos Especiales"
          ],
          "summary": "Encontrar un permiso especial por profileId",
          "description": "Encontrar los permisos especiales del perfil",
          "operationId": "permisosespeciales findByProfilId",
          "parameters": [
            {
              "name": "profileId",
              "in": "path",
              "description": "Tipo del codigo de perfil a buscar",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "in": "query",
              "description": "filtra por el codigo del permiso",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "window",
              "in": "query",
              "description": "filtra por la ventana del perfil",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/PermisosEspecialesGet"
                        }
                      },
                      "count": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/orderrelated/{type}/{number}": {
        "get": {
          "tags": [
            "Comprobantes Vinculados"
          ],
          "summary": "Comprobantes vinculados",
          "operationId": "allOrderRelatedMethod",
          "parameters": [
            {
              "name": "type",
              "in": "path",
              "description": "Tipo de comprobante",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "number",
              "in": "path",
              "description": "Numero de comprobante",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "TIPOCOMPROBANTE": {
                              "type": "string"
                            },
                            "NUMEROCOMPORBANTE": {
                              "type": "number"
                            }
                          }
                        }
                      },
                      "count": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro comprobante o error interno",
              "content": {}
            }
          }
        }
      },
      "/transport": {
        "get": {
          "tags": [
            "Transportes"
          ],
          "summary": "Tipos de transportes",
          "operationId": "transporte getAll",
          "description": "Obtiene todos los transportes",
          "parameters": [
            {
              "name": "id",
              "in": "query",
              "description": "Codigo del transporte que deseas buscar",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "filtra por descripcion de transporte",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "filtra por fecha modificacion",
              "schema": {
                "type": "string",
                "format": "date-time"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Transportes"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron transportes o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/transport/{id}": {
        "get": {
          "tags": [
            "Transportes"
          ],
          "summary": "Tipo de transporte",
          "operationId": "transporte findOne",
          "description": "Obtiene transporte por codigo transporte",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "description": "Codigo del transporte que deseas buscar",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/Transportes"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro transporte o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/vouchersauthorizations": {
        "post": {
          "tags": [
            "Autorizaciones Comprobantes"
          ],
          "summary": "Creación de una autorizacion de comprobante",
          "operationId": "AutorizacionesComprobantes insert",
          "requestBody": {
            "description": "Crea una nueva autorizacion de comprobante",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/vouchersauthorizationsREQ"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "AUTORIZADO": {
                            "type": "integer",
                            "description": "Descripcion del comprobante autorizado"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/vouchersauthorizations/{vouchertype}/{vouchernumber}": {
        "get": {
          "tags": [
            "Autorizaciones Comprobantes"
          ],
          "summary": "Busca una autorizacion por su tipo de comprobante y numero de comprobante",
          "operationId": "AutorizacionesComprobantes findByTipocomprobanteNumerocomprobante",
          "description": "Obtiene una autorizacion por su tipo de comprobante y numero de comprobante",
          "parameters": [
            {
              "name": "vouchertype",
              "in": "path",
              "description": "Tipo de comprobante a buscar",
              "required": true,
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "vouchernumber",
              "in": "path",
              "description": "Numero de comprobante a buscar",
              "required": true,
              "schema": {
                "type": "number",
                "format": "double"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/vouchersauthorizationsGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro la autorizacion del comprobante o error interno",
              "content": {}
            }
          }
        }
      },
      "/purchases": {
        "get": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Listado de comprobantes compras",
          "operationId": "filterPurchase",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Filtra por razon social  o nombre fantasia del proveedor",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "Filtro de fecha desde",
              "schema": {
                "type": "string",
                "format": "date-time"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "Filtro de fecha hasta",
              "schema": {
                "type": "string",
                "format": "date-time"
              }
            },
            {
              "name": "type",
              "in": "query",
              "description": "Filtra por el tipo comprobante",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "provider_id",
              "in": "query",
              "description": "Filtra por el codigo proveedor",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "description": "filtra por el limite de visualizacion",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "offset",
              "in": "query",
              "description": "filtra por cantidad de paginas",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ComprobantesCompraGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron comprobantes compra o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Creación de un comprobante compra",
          "operationId": "purchaseCreate",
          "requestBody": {
            "description": "Crea un nuevo comprobante compra",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ComprobantesCompraPost"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": false
                      },
                      "mensaje": {
                        "type": "string"
                      },
                      "purchaseType": {
                        "type": "string"
                      },
                      "purchaseId": {
                        "type": "integer"
                      },
                      "numberAccountingEntry": {
                        "type": "integer"
                      },
                      "provider": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/purchases/count": {
        "get": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Cantidad de comprobantes compra",
          "description": "Cantidad de comprobantes compra",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de comprobantes compra",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/purchases/{type}/{id}/{provider_id}": {
        "get": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Encontrar un comprobante compra por tipo comprobante, numero comprobante y codigo proveedor (SOLO ENTERPRISE)",
          "description": "Retorna un unico comprobante compra",
          "operationId": "purchaseDetail",
          "parameters": [
            {
              "name": "type",
              "in": "path",
              "description": "Tipo comprobante que desea buscar",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "in": "path",
              "description": "Numero comprobante que desea buscar",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "provider_id",
              "in": "path",
              "description": "Codigo proveedor que desea buscar",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Deposito encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/ComprobantesCompraGetOne"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Comprobante compra no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/sets": {
        "get": {
          "tags": [
            "Conjuntos"
          ],
          "summary": "Listado de los conjuntos (SOLO ENTERPRISE)",
          "operationId": "getAll",
          "description": "Obtiene todos los conjuntos",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ConjuntosGet"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron los conjuntos o error interno",
              "content": {}
            }
          }
        }
      },
      "/sets/{id}": {
        "get": {
          "tags": [
            "Conjuntos"
          ],
          "summary": "Busca un conjunto segun el codigo conjunto (SOLO ENTERPRISE)",
          "operationId": "findSets",
          "description": "Obtiene el conjunto de acuerdo al codigo conjunto",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Codigo conjunto que deseas buscar",
              "required": true,
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Conjunto encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/ConjuntosGet"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el conjunto o error interno",
              "content": {}
            }
          }
        }
      },
      "/appropriationcentercost/{number}/{code}": {
        "get": {
          "tags": [
            "Apropiacion Centro Costo"
          ],
          "summary": "Muestra el asiento con sus centros de costo asociado",
          "operationId": "findAppropiation",
          "description": "Obtiene el asiento con sus centros de costo asociado",
          "parameters": [
            {
              "name": "number",
              "in": "path",
              "description": "Numero del asiento que deseas buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "code",
              "in": "path",
              "description": "Codigo del ejercicio que deseas buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Asiento encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ApropiacionCentroCostoGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el asiento o error interno",
              "content": {}
            }
          }
        }
      },
      "/appropriationcentercost": {
        "put": {
          "tags": [
            "Apropiacion Centro Costo"
          ],
          "summary": "Actualizar apropiacion centro costo",
          "description": "Respuesta de actualizacion",
          "operationId": "putAppropriation",
          "requestBody": {
            "description": "Apropiacion a actualizar",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApropiacionCentroCostoUpdate"
                }
              }
            }
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Producto actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/accountingyear": {
        "get": {
          "tags": [
            "Ejercicios"
          ],
          "summary": "Muestra los ejercicios contables",
          "operationId": "findAccountingYear",
          "description": "Obtiene los ejercicios contables",
          "parameters": [
            {
              "name": "code",
              "in": "query",
              "description": "filtra por codigo",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "description",
              "in": "query",
              "description": "filtra por descripcion",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "active",
              "in": "query",
              "description": "filtra por activo (activo = 1, inactivo = 0)",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Ejercicio encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/EjercicioGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el ejercicio o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales/{type}/{id}/pdf": {
        "get": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Muestra el pdf del comprobante de venta solicitado. Pueden ser Facturas (A, B, C) o Notas de Credito (A, B, C, E, M, T)",
          "operationId": "pdfSale",
          "description": "Muestra el pdf del comprobante de venta solicitado. Pueden ser Facturas (A, B, C) o Notas de Credito (A, B, C, E, M, T)",
          "parameters": [
            {
              "name": "type",
              "in": "path",
              "description": "Tipo de la factura venta que deseas buscar",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "in": "path",
              "description": "Numero de la factura venta que deseas buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "branch_code",
              "in": "query",
              "description": "Codigosucursal a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "archivo pdf encontrado",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el comprobante solicitado",
              "content": {}
            }
          }
        }
      },
      "/orders/{type}/{id}/pdf": {
        "get": {
          "tags": [
            "Ordenes"
          ],
          "summary": "Muestra el pdf del pedido solicitado",
          "operationId": "pdfOrder",
          "description": "Muestra el pdf del pedido solicitado",
          "parameters": [
            {
              "name": "type",
              "in": "path",
              "description": "Tipo del pedido que deseas buscar",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "in": "path",
              "description": "Numero del pedido que deseas buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "archivo pdf encontrado",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary",
                    "example": "order.pdf"
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el comprobante solicitado o error interno",
              "content": {}
            }
          }
        }
      },
      "/payments/{id}/pdf": {
        "get": {
          "tags": [
            "Pagos"
          ],
          "summary": "Muestra el pdf del recibo de pago solicitado.",
          "operationId": "pdfPayment",
          "description": "Muestra el pdf del recibo de pago solicitado.",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Numero del recibo de pago a buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "branch_code",
              "in": "query",
              "description": "Codigo de la sucursal a buscar",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "archivo pdf encontrado",
              "content": {
                "application/pdf": {
                  "schema": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el comprobante solicitado",
              "content": {}
            }
          }
        }
      },
      "/fixedassets": {
        "get": {
          "tags": [
            "Bienes de uso"
          ],
          "summary": "Listado de bienes de uso",
          "operationId": "bienesdeuso getAll",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Busca por coincidencia en la descripcion del bien de uso",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "filtra por la fecha de modificacion",
              "schema": {
                "type": "string",
                "format": "date"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Fixedassets"
                        }
                      },
                      "count": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron bienes de uso o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Bienes de uso"
          ],
          "summary": "Creación de un bien de uso",
          "operationId": "bienesdeuso insert",
          "requestBody": {
            "description": "Datos para insertar un bien de uso",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/FixedassetsReq"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "properties": {
                            "CODIGOBIENUSO": {
                              "type": "string",
                              "maxLength": 15,
                              "description": "descripcion del codigo de bien de uso"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/fixedassets/{id}": {
        "get": {
          "tags": [
            "Bienes de uso"
          ],
          "summary": "Encontrar un bien de uso por ID",
          "description": "Retorna un unico bien de uso",
          "operationId": "bienesdeuso findOne",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "ID del bien de uso a retornar",
              "required": true,
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Bien de uso encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/Fixedassets"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Bien de uso no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/itemfixedassets": {
        "get": {
          "tags": [
            "Rubros de bienes de uso"
          ],
          "summary": "Listado de rubros de los bienes de uso",
          "operationId": "rubrosbienesdeuso getAll",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Busca por coincidencia en la descripcion del rubro de bien de uso",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "filtra por la fecha de modificacion",
              "schema": {
                "type": "string",
                "format": "date"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/Itemfixedassets"
                        }
                      },
                      "count": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron rubros de los bienes de uso o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Rubros de bienes de uso"
          ],
          "summary": "Creación de un rubro de bien de uso",
          "operationId": "rubrosbienesdeuso insert",
          "requestBody": {
            "description": "Datos para insertar un rubro de bien de uso",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ItemfixedassetsReq"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "properties": {
                            "CODIGORUBROBIENUSO": {
                              "type": "string",
                              "maxLength": 15,
                              "description": "descripcion del codigo de rubro de bien de uso"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/itemfixedassets/{id}": {
        "get": {
          "tags": [
            "Rubros de bienes de uso"
          ],
          "summary": "Encontrar un rubro de bien de uso por ID",
          "description": "Retorna un unico rubro de bien de uso",
          "operationId": "rubrosbienesdeuso findOne",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "ID del rubro de bien de uso a retornar",
              "required": true,
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Rubro de bien de uso encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/Itemfixedassets"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Rubro de bien de uso no encontrado o error interno",
              "content": {}
            }
          }
        }
      },
      "/purchases/internalrequirement": {
        "get": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Muestra los requerimientos internos solicitados",
          "operationId": "RequerimientoInternoGetAll",
          "description": "Muestra los requerimientos internos solicitados",
          "parameters": [
            {
              "name": "id",
              "in": "query",
              "description": "Numero del requerimiento interno que deseas buscar",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "Filtra por la fecha de comprobante desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "Filtra por la fecha de comprobante hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "annul",
              "in": "query",
              "description": "Filtra por anulado (Si = 1, No = 0)",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "requerimiento interno encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/RequerimientoInternoGet"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el requerimiento interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Creación de un requerimiento interno",
          "operationId": "RequerimientoInternoCreate",
          "requestBody": {
            "description": "Crea un nuevo requerimiento interno",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RequerimientoInternoCreate"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "numberInternalRequirement": {
                        "type": "number",
                        "format": "double",
                        "description": "numero del requerimiento interno creado"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/purchases/internalrequirement/{id}": {
        "get": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Muestra el requerimiento interno solicitado",
          "operationId": "RequerimientoInternoGetOne",
          "description": "Muestra el requerimiento interno solicitado",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Numero del requerimiento interno que deseas buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "requerimiento requerimiento interno encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/RequerimientoInternoGetOne"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el requerimiento interno",
              "content": {}
            }
          }
        }
      },
      "/purchases/purchasesorder": {
        "get": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Muestra las ordenes de compras solicitadas",
          "operationId": "OrdenCompraGetAll",
          "description": "Muestra las ordenes de compras solicitadas",
          "parameters": [
            {
              "name": "delivery_docket_annulled",
              "in": "query",
              "description": "Filtra por remitos anulados (Si = 1, No = 0)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "delivery_docket_billed",
              "in": "query",
              "description": "Filtra por remitos facturados (Si = 1, No = 0)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "id_from",
              "in": "query",
              "description": "Filtra desde el numero de la orden de compra",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "id_to",
              "in": "query",
              "description": "Filtra hasta el numero de la orden de compra",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "product_id",
              "in": "query",
              "description": "Filtra por codigo articulo",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "item_id",
              "in": "query",
              "description": "Filtra por codigo rubro",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "brand_id",
              "in": "query",
              "description": "Filtra por codigo marca",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "name",
              "in": "query",
              "description": "Filtra por la razon social del proveedor",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "authorised",
              "in": "query",
              "description": "Filtra por ordenes de compras autorizadas (Si = 1, No = 0)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "not_authorised",
              "in": "query",
              "description": "Filtra por ordenes de compras no autorizadas (Si = 1, No = 0)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "warehouse_id",
              "in": "query",
              "description": "Filtra por codigo deposito",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "Filtra por la fecha del comprobante desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "Filtra por la fecha del comprobante hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "user_id",
              "in": "query",
              "description": "Filtra por codigo de usuario",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "cost_project_id",
              "in": "query",
              "description": "Filtra por codigo costo proyecto",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "ordenes de compras encontrados",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/OrdenCompraGet"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron las ordenes de compras",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Creación de una orden de compra",
          "operationId": "OrdenCompraCreate",
          "requestBody": {
            "description": "Crea una nueva orden de compra",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/OrdenCompraCreate"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "purchasesOrderNumber": {
                        "type": "number",
                        "format": "double",
                        "description": "numero de la orden de compra creada"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/purchases/{id}/{provider_id}/purchasesorder": {
        "get": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Muestra la orden de compra solicitada",
          "operationId": "OrdenCompraGetOne",
          "description": "Muestra la orden de compra solicitada",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Numero de la orden de compra que deseas buscar",
              "required": true,
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "provider_id",
              "in": "path",
              "description": "Codigo del proveedor que deseas buscar",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "orden de compra encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/OrdenCompraGetOne"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro la orden de compra",
              "content": {}
            }
          }
        }
      },
      "/purchases/dispatch": {
        "post": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Creación de un remito compra",
          "operationId": "dispatchPost",
          "requestBody": {
            "description": "Crea un nuevo remito compra",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RemitoCompraPost"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string"
                      },
                      "dispatchType": {
                        "type": "string"
                      },
                      "dispatchNumber": {
                        "type": "number",
                        "format": "double"
                      },
                      "Provider": {
                        "type": "object",
                        "properties": {
                          "idprovaider": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/purchases/dispatchdevolution": {
        "post": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Creación de un remito devolucion compra",
          "operationId": "RemitoDevolucionCompraPost",
          "requestBody": {
            "description": "Crea un nuevo remito devolucion compra",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RemitoDevolucionCompraPost"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string"
                      },
                      "dispatchdevolutionType": {
                        "type": "string"
                      },
                      "dispatchdevolutionNumber": {
                        "type": "number",
                        "format": "double",
                        "description": "numero remito devolucion compra creado"
                      },
                      "Provider": {
                        "type": "object",
                        "properties": {
                          "idprovaider": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/stock/adjustmentsheet": {
        "get": {
          "tags": [
            "Stock"
          ],
          "summary": "Listado de planillas de ajustes (SOLO ENTERPRISE)",
          "operationId": "stock getAllAdjustment",
          "parameters": [
            {
              "name": "idProduct_from",
              "in": "query",
              "description": "Filtra por codigo articulo desde",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "idProduct_to",
              "in": "query",
              "description": "Filtra por codigo articulo hasta",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "particularCode_from",
              "in": "query",
              "description": "Filtra por codigo particular desde",
              "schema": {
                "type": "string",
                "maxLength": 40
              }
            },
            {
              "name": "particularCode_to",
              "in": "query",
              "description": "Filtra por codigo particular hasta",
              "schema": {
                "type": "string",
                "maxLength": 40
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Filtra por la fecha de modificacion la planilla de ajuste desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "Filtra por la fecha de la planilla de ajustedesde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "Filtra por la fecha de la planilla de ajuste hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "userId",
              "in": "query",
              "description": "Filtra por codigo de usuario",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "reason",
              "in": "query",
              "description": "Filtra por el motivo de la planilla de ajuste",
              "schema": {
                "type": "string",
                "maxLength": 50
              }
            },
            {
              "name": "warehouseId",
              "in": "query",
              "description": "Filtra por codigo deposito",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AdjustmentSheetGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron planillas de ajustes o error interno",
              "content": {}
            }
          }
        }
      },
      "/stock/adjustmentsheet/{id}": {
        "get": {
          "tags": [
            "Stock"
          ],
          "summary": "Encontrar un planilla de ajuste por ID (SOLO ENTERPRISE)",
          "description": "Retorna una unica planilla de ajuste",
          "operationId": "Stock findById",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "ID del la planilla de ajuste a retornar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Planilla de ajuste encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/AdjustmentSheetGet"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Planilla de ajuste no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/stock/adjustmentsheet/count": {
        "get": {
          "tags": [
            "Stock"
          ],
          "summary": "Cantidad de planillas de ajuste (SOLO ENTERPRISE)",
          "description": "Cantidad de planillas de ajuste",
          "parameters": [
            {
              "name": "idProduct_from",
              "in": "query",
              "description": "Filtra por codigo articulo desde",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "idProduct_to",
              "in": "query",
              "description": "Filtra por codigo articulo hasta",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "particularCode_from",
              "in": "query",
              "description": "Filtra por codigo particular desde",
              "schema": {
                "type": "string",
                "maxLength": 40
              }
            },
            {
              "name": "particularCode_to",
              "in": "query",
              "description": "Filtra por codigo particular hasta",
              "schema": {
                "type": "string",
                "maxLength": 40
              }
            },
            {
              "name": "update_from",
              "in": "query",
              "description": "Filtra por la fecha de modificacion la planilla de ajuste desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "Filtra por la fecha de la planilla de ajustedesde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "Filtra por la fecha de la planilla de ajuste hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "userId",
              "in": "query",
              "description": "Filtra por codigo de usuario",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "reason",
              "in": "query",
              "description": "Filtra por el motivo de la planilla de ajuste",
              "schema": {
                "type": "string",
                "maxLength": 50
              }
            },
            {
              "name": "warehouseId",
              "in": "query",
              "description": "Filtra por codigo deposito",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de planillas de ajuste",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/stock/correction": {
        "post": {
          "tags": [
            "Stock"
          ],
          "summary": "Creación de una correccion de stock (SOLO ENTERPRISE)",
          "operationId": "stock insertCorrection",
          "requestBody": {
            "description": "Datos para insertar una correccion de stock",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CorrectionReq"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "NUMEROAJUSTEINGRESO": {
                            "type": "integer",
                            "description": "descripcion del numero de la correccion del stock ingreso"
                          },
                          "NUMEROAJUSTEEGRESO": {
                            "type": "integer",
                            "description": "descripcion del numero de la correccion del stock egreso"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/stock/adjustment": {
        "post": {
          "tags": [
            "Stock"
          ],
          "summary": "Creación de un ajuste de stock (SOLO ENTERPRISE)",
          "operationId": "stock insertAdjustment",
          "requestBody": {
            "description": "Datos para insertar un ajuste de stock",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AdjustmentReq"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "NUMEROAJUSTE": {
                            "type": "integer",
                            "description": "descripcion del numero de la ajuste del stock"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/purchases/purchasesorder/product/{id}": {
        "get": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Encontrar ordenes de compra por codigo articulo",
          "description": "Retorna orden de compra",
          "operationId": "purchasesOrderGetProduct",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Codigo articulo que desea buscar",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "expected_delivery_date",
              "in": "query",
              "description": "Filtra por la fecha prevista de entrega",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Orden de compra encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ComprobantesCompraGetProduct"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Orden compra no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/reasonadjustment": {
        "get": {
          "tags": [
            "Motivos ajustes stock"
          ],
          "summary": "Listado de los motivos de ajustes de stock",
          "operationId": "motivosajustestock getAll",
          "description": "Obtiene todos los motivos de ajustes de stock",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia",
              "schema": {
                "type": "string",
                "maxLength": 50
              }
            },
            {
              "name": "id_to",
              "in": "query",
              "description": "filtra por el codigo mayor o igual",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "id_from",
              "in": "query",
              "description": "filtra por el codigo menor o igual",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "showInactive",
              "in": "query",
              "description": "Muestra los inactivos",
              "schema": {
                "type": "boolean"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/MotivosAjustesStock"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron motivos de ajuste de stock o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Motivos ajustes stock"
          ],
          "summary": "Creación de un motivo de ajuste de stock",
          "operationId": "motivosajustestock insert",
          "requestBody": {
            "description": "Crea un nuevo motivo de ajuste de stock",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MotivosAjustesStockReq"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "properties": {
                            "CODIGOMOTIVOAJUSTESTOCK": {
                              "type": "integer",
                              "description": "Descripcion del codigo del motivo de ajuste de stock"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/reasonadjustment/{reason_id}": {
        "get": {
          "tags": [
            "Motivos ajustes stock"
          ],
          "summary": "Busca un motivo de ajuste de stock por su codigo de motivo ajuste stock",
          "operationId": "motivosajustestock findOne",
          "description": "Obtiene un motivo de ajuste de stock por su codigo",
          "parameters": [
            {
              "name": "reason_id",
              "in": "path",
              "description": "Codigo del motivo de ajuste de stock que deseas buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Motivos de ajustes de stock encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/MotivosAjustesStock"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el motivo de ajuste de stock o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Motivos ajustes stock"
          ],
          "summary": "Actualiza un motivo de ajuste de stock",
          "description": "Retorna la verificacion de la actualizacion",
          "operationId": "motivosajustestock update",
          "parameters": [
            {
              "name": "reason_id",
              "in": "path",
              "description": "Codigo del motivo de ajuste de stock que deseas actualizar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "datos necesarios para la actualizacion",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MotivosAjustesStockUpd"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Motivo de ajuste de stock actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Motivo de ajuste de stock no actualizado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Motivos ajustes stock"
          ],
          "summary": "Eliminar un  motivos ajustes stock",
          "operationId": "motivosajustestock Delete",
          "parameters": [
            {
              "name": "reason_id",
              "in": "path",
              "description": "Codigo del motivo de ajuste de stock deseas eliminar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Motivo de ajuste de stock eliminado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Motivo de ajuste de stock no eliminado o error interno",
              "content": {}
            }
          }
        }
      },
      "/reasonadjustment/count": {
        "get": {
          "tags": [
            "Motivos ajustes stock"
          ],
          "summary": "Cantidad de motivos de ajustes de stock",
          "description": "Cantidad de motivos de ajustes de stock",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de motivos de ajustes de stock",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/purchases/internalrequirement/{id}/cancel": {
        "put": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Anula el requerimiento interno solicitado",
          "operationId": "RequerimientoInternoCancel",
          "description": "Anula el requerimiento interno solicitado",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Numero del requerimiento interno que deseas anular",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Requerimiento interno anulado",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "error": {
                        "type": "boolean"
                      },
                      "message": {
                        "type": "string"
                      },
                      "numberInternalRequirement": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el requerimiento interno",
              "content": {}
            }
          }
        }
      },
      "/purchases/dispatch/cancel": {
        "put": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Anula el remito compra solicitado",
          "description": "Anula el remito compra solicitado",
          "operationId": "dispatchCancel",
          "requestBody": {
            "description": "Remito compra que desea anular",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PutDispatchCancel"
                }
              }
            }
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Se anulo el remito compra",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string"
                      },
                      "dispatchType": {
                        "type": "string"
                      },
                      "dispatchNumber": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/purchases/dispatchdevolution/cancel": {
        "put": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Anula el remito devolucion compra solicitado",
          "description": "Anula el remito devolucion compra solicitado",
          "operationId": "dispatchdevolutionCancel",
          "requestBody": {
            "description": "Remito devolucion compra que desea anular",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PutDispatchdevolutionCancel"
                }
              }
            }
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Se anulo el remito devolucion compra",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string"
                      },
                      "dispatchType": {
                        "type": "string"
                      },
                      "dispatchNumber": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/purchases/purchasesorder/cancel": {
        "put": {
          "tags": [
            "Comprobantes Compras"
          ],
          "summary": "Anula orden de compra solicitado",
          "description": "Anula orden de compra solicitado",
          "operationId": "purchaseOrderCancel",
          "requestBody": {
            "description": "Orden de compra que desea anular",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PutPurchaseOrderCancel"
                }
              }
            }
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Se anulo la orden de compra",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string"
                      },
                      "purchasesType": {
                        "type": "string"
                      },
                      "purchasesNumber": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/neighborhood": {
        "get": {
          "tags": [
            "Barrios"
          ],
          "summary": "Listado de los barrios",
          "operationId": "barrios getAll",
          "description": "Obtiene todos los barrios",
          "parameters": [
            {
              "name": "stateCode",
              "in": "query",
              "description": "filtra por codigo provincia",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "cityCode",
              "in": "query",
              "description": "filtra por codigo localidad",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "zoneCode",
              "in": "query",
              "description": "filtra por codigo zona",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia de nombre barrio, nombre provincia, nombre localidad y descripcion de zona",
              "schema": {
                "type": "string",
                "maxLength": 50
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/BarriosGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron barrios o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "Barrios"
          ],
          "summary": "Creación de un barrio",
          "operationId": "barrios insert",
          "requestBody": {
            "description": "Crea un nuevo barrio",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BarriosPost"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "properties": {
                            "CODIGOBARRIO": {
                              "type": "integer",
                              "description": "Descripcion del codigo del barrio"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/neighborhood/{neighborhoodCode}": {
        "get": {
          "tags": [
            "Barrios"
          ],
          "summary": "Busca un barrio por su codigo barrio",
          "operationId": "barrio findOne",
          "description": "Obtiene un barrio por su codigo",
          "parameters": [
            {
              "name": "neighborhoodCode",
              "in": "path",
              "description": "Codigo del barrio que deseas buscar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Barrio encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/BarriosGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el barrio o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "Barrios"
          ],
          "summary": "Actualiza un barrio",
          "description": "Retorna la verificacion de la actualizacion",
          "operationId": "barrio update",
          "parameters": [
            {
              "name": "neighborhoodCode",
              "in": "path",
              "description": "Codigo del barrio que deseas actualizar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "requestBody": {
            "description": "datos necesarios para la actualizacion",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BarriosPut"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Barrio actualizado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Barrio no actualizado o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "Barrios"
          ],
          "summary": "Eliminar un barrio",
          "operationId": "barrio Delete",
          "parameters": [
            {
              "name": "neighborhoodCode",
              "in": "path",
              "description": "Codigo del barrio que deseas eliminar",
              "required": true,
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Barrio eliminado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AffectedRows"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Barrio no eliminado o error interno",
              "content": {}
            }
          }
        }
      },
      "/neighborhood/count": {
        "get": {
          "tags": [
            "Barrios"
          ],
          "summary": "Cantidad de barrios",
          "description": "Cantidad de barrios",
          "parameters": [
            {
              "name": "stateCode",
              "in": "query",
              "description": "filtra por codigo provincia",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "cityCode",
              "in": "query",
              "description": "filtra por codigo localidad",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "zoneCode",
              "in": "query",
              "description": "filtra por codigo zona",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia de nombre barrio, nombre provincia, nombre localidad y descripcion de zona",
              "schema": {
                "type": "string",
                "maxLength": 50
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de barrios",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/salespoint": {
        "get": {
          "tags": [
            "Puntos de Venta"
          ],
          "summary": "Listado de los puntos de venta",
          "operationId": "salepoint getAll",
          "description": "Obtiene todos los puntos de venta",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia de la descripcion",
              "schema": {
                "type": "string",
                "maxLength": 250
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/PuntosDeVentaGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron puntos de venta o error interno",
              "content": {}
            }
          }
        }
      },
      "/salespoint/{id}": {
        "get": {
          "tags": [
            "Puntos de Venta"
          ],
          "summary": "Busca un punto de venta por su codigo de punto de venta",
          "operationId": "salepoint findOne",
          "description": "Obtiene un punto de venta por su codigo",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Codigo del punto de venta que deseas buscar",
              "required": true,
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Punto de venta encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/PuntosDeVentaGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro punto de venta o error interno",
              "content": {}
            }
          }
        }
      },
      "/salespoint/count": {
        "get": {
          "tags": [
            "Puntos de Venta"
          ],
          "summary": "Cantidad de puntos de venta",
          "description": "Cantidad de puntos de venta",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "filtra por coincidencia de la descripcion",
              "schema": {
                "type": "string",
                "maxLength": 250
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Contador de puntos de venta",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales/dispatch/summarised": {
        "get": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Planilla de remitos resumido",
          "operationId": "saleDispatchSummarised",
          "parameters": [
            {
              "name": "id_client",
              "in": "query",
              "description": "filtra por codigo cliente",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "id_from",
              "in": "query",
              "description": "filtra por numero de comprobante desde",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "id_to",
              "in": "query",
              "description": "filtra por numero de comprobante hasta",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "filtra por fecha desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "filtra por fecha hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "id_project",
              "in": "query",
              "description": "filtra por el codigo de proyecto (SOLO ENTERPRISE)",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "id_zone",
              "in": "query",
              "description": "filtra por los codigos de zonas (Los codigos se deberan separar con comas - SOLO ENTERPRISE)",
              "schema": {
                "type": "string",
                "maxLength": 2000
              }
            },
            {
              "name": "id_branch",
              "in": "query",
              "description": "filtra por los codigos de sucursal (Los codigos se deberan separar con comas - SOLO ENTERPRISE)",
              "schema": {
                "type": "string",
                "maxLength": 10000
              }
            },
            {
              "name": "id_warehouse",
              "in": "query",
              "description": "filtra por los codigos de deposito (Los codigos se deberan separar con comas - SOLO ENTERPRISE)",
              "schema": {
                "type": "string",
                "maxLength": 2000
              }
            },
            {
              "name": "dispatch_annul",
              "in": "query",
              "description": "filtra por remitos anulados - (No = 0, Si = 1)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "dispatch_cancel",
              "in": "query",
              "description": "filtra por remitos cancelados - (No = 0, Si = 1)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "dispatch_type",
              "in": "query",
              "description": "filtra por tipo de remito - (Remito Egreso = 1, Remito devolucion = 2 - SOLO ENTERPRISE)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "price_purchase",
              "in": "query",
              "description": "filtra por precio de compra - (No = 0, Si = 1)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "refund",
              "in": "query",
              "description": "filtra por remito de devolucion - (No = 0, Si = 1 - SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "exclude_purchase",
              "in": "query",
              "description": "excluir RE por otros - (No = 0, Si = 1 - SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "payment_method",
              "in": "query",
              "description": "filtra por codigo forma pago - (SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "id_product_from",
              "in": "query",
              "description": "filtra por codigo articulo desde (SOLO CORRALON)",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "id_product_to",
              "in": "query",
              "description": "filtra por codigo articulo hasta (SOLO CORRALON)",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "name_product",
              "in": "query",
              "description": "filtra por descripcion del articulo (SOLO CORRALON)",
              "schema": {
                "type": "string",
                "maxLength": 250
              }
            },
            {
              "name": "sub_warehouse_id",
              "in": "query",
              "description": "filtra por codigo subdeposito (SOLO CORRALON)",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "expedition",
              "in": "query",
              "description": "filtra por expedicion - (No = 0, Si = 1 - SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "distribution",
              "in": "query",
              "description": "filtra por reparto - (No = 0, Si = 1 - SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "id_delivery",
              "in": "query",
              "description": "filtra por codigo tipo entrega - (SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/PlanillaRemitoResumidoVentaGet"
                        }
                      },
                      "count": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron comprobantes de venta o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales/dispatch/detailed": {
        "get": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Planilla de remitos detallado",
          "operationId": "saleDispatchDetailed",
          "parameters": [
            {
              "name": "id_client",
              "in": "query",
              "description": "filtra por codigo cliente",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "id_from",
              "in": "query",
              "description": "filtra por numero de comprobante desde",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "id_to",
              "in": "query",
              "description": "filtra por numero de comprobante hasta",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "date_from",
              "in": "query",
              "description": "filtra por fecha desde",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "filtra por fecha hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "id_project",
              "in": "query",
              "description": "filtra por el codigo de proyecto (SOLO ENTERPRISE)",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "id_zone",
              "in": "query",
              "description": "filtra por los codigos de zonas (Los codigos se deberan separar con comas - SOLO ENTERPRISE)",
              "schema": {
                "type": "string",
                "maxLength": 2000
              }
            },
            {
              "name": "id_branch",
              "in": "query",
              "description": "filtra por los codigos de sucursal (Los codigos se deberan separar con comas - SOLO ENTERPRISE)",
              "schema": {
                "type": "string",
                "maxLength": 10000
              }
            },
            {
              "name": "id_warehouse",
              "in": "query",
              "description": "filtra por los codigos de deposito (Los codigos se deberan separar con comas - SOLO ENTERPRISE)",
              "schema": {
                "type": "string",
                "maxLength": 2000
              }
            },
            {
              "name": "dispatch_annul",
              "in": "query",
              "description": "filtra por remitos anulados - (No = 0, Si = 1)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "dispatch_cancel",
              "in": "query",
              "description": "filtra por remitos cancelados - (No = 0, Si = 1)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "dispatch_type",
              "in": "query",
              "description": "filtra por tipo de remito - (Remito Egreso = 1, Remito devolucion = 2 - SOLO ENTERPRISE)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "price_purchase",
              "in": "query",
              "description": "filtra por precio de compra - (No = 0, Si = 1)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "refund",
              "in": "query",
              "description": "filtra por remito de devolucion - (No = 0, Si = 1 - SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "exclude_purchase",
              "in": "query",
              "description": "excluir RE por otros - (No = 0, Si = 1 - SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "payment_method",
              "in": "query",
              "description": "filtra por codigo forma pago - (SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "id_product_from",
              "in": "query",
              "description": "filtra por codigo articulo desde (SOLO CORRALON)",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "id_product_to",
              "in": "query",
              "description": "filtra por codigo articulo hasta (SOLO CORRALON)",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "name_product",
              "in": "query",
              "description": "filtra por descripcion del articulo (SOLO CORRALON)",
              "schema": {
                "type": "string",
                "maxLength": 250
              }
            },
            {
              "name": "sub_warehouse_id",
              "in": "query",
              "description": "filtra por codigo subdeposito (SOLO CORRALON)",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "expedition",
              "in": "query",
              "description": "filtra por expedicion - (No = 0, Si = 1 - SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "distribution",
              "in": "query",
              "description": "filtra por reparto - (No = 0, Si = 1 - SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "id_delivery",
              "in": "query",
              "description": "filtra por codigo tipo entrega - (SOLO CORRALON)",
              "schema": {
                "type": "integer"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/PlanillaRemitoDetalladoVentaGet"
                        }
                      },
                      "count": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron comprobantes de venta o error interno",
              "content": {}
            }
          }
        }
      },
      "/branchesexport": {
        "get": {
          "tags": [
            "Sucursales Exportacion"
          ],
          "summary": "Listado de sucursales de exportacion",
          "operationId": "getAll branchesexport",
          "parameters": [
            {
              "name": "search",
              "in": "query",
              "description": "Nombre de la sucursal de exportacion a buscar",
              "schema": {
                "type": "string",
                "maxLength": 50
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/SucursalesExportacionGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron sucursales de exportacion o error interno",
              "content": {}
            }
          }
        }
      },
      "/branchesexport/count": {
        "get": {
          "tags": [
            "Sucursales Exportacion"
          ],
          "summary": "Cantidad de sucursales de exportacion",
          "description": "Cantidad de sucursales de exportacion",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cantidad de sucursales de exportacion",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "integer"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/branchesexport/{id}": {
        "get": {
          "tags": [
            "Sucursales Exportacion"
          ],
          "summary": "Encontrar una sucursal de exportacion por su id",
          "description": "Retorna la sucursal de exportacion buscada",
          "operationId": "findOne branchesexport",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "id de la sucursal de exportacion",
              "required": true,
              "schema": {
                "type": "string",
                "maxLength": 50
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Sucursal de exportacion encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SucursalesExportacionGet"
                  }
                }
              }
            },
            "500": {
              "description": "Sucursal de exportacion no encontrada o error interno",
              "content": {}
            }
          }
        }
      },
      "/product/{id}/image": {
        "get": {
          "tags": [
            "Artículos"
          ],
          "summary": "Busca un articulo por su codigo y devuelve la foto en base64",
          "operationId": "articulo getImage",
          "description": "Obtiene un articulo por su codigo y devuelve la foto en base64",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Codigo del articulo que deseas buscar",
              "required": true,
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Articulo encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "error": {
                            "type": "boolean",
                            "description": "Descripcion del error'"
                          },
                          "message": {
                            "type": "string",
                            "description": "Descripcion del mensaje de error o success"
                          },
                          "fotoBase64": {
                            "type": "string",
                            "description": "Descripcion de la foto devuelta en base64"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro el articulo o error interno",
              "content": {}
            }
          }
        }
      },
      "/providerarticles/prices": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Listado de precios articulos por proveedores",
          "operationId": "getAll prices providerarticles",
          "parameters": [
            {
              "name": "provider_id",
              "in": "query",
              "description": "Filtra por codigoparticular de proveedor",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "article_id",
              "in": "query",
              "description": "Filtra por codigoarticulo",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "particular_from",
              "in": "query",
              "description": "Filtra por codigoparticular de articulo desde",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "particular_to",
              "in": "query",
              "description": "Filtra por codigoparticular de articulo hasta",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/PreciosPorProveedorGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron precios por proveedor o error interno",
              "content": {}
            }
          }
        }
      },
      "/providerarticles/prices/count": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Cantidad de precios articulos por proveedores",
          "description": "Cantidad de precios articulos por proveedores",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cantidad de precios articulos por proveedores",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/providerarticles/{id}/prices": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Listado de precios articulos por proveedor",
          "operationId": "findOne prices providerarticles",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Filtra por codigo de proveedor",
              "schema": {
                "type": "string",
                "maxLength": 15
              },
              "required": true
            },
            {
              "name": "article_id",
              "in": "query",
              "description": "Filtra por codigoarticulo",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "particular_from",
              "in": "query",
              "description": "Filtra por codigoparticular de articulo desde",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "particular_to",
              "in": "query",
              "description": "Filtra por codigoparticular de articulo hasta",
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operación exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/PreciosPorProveedorGet"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron precios por proveedor o error interno",
              "content": {}
            }
          }
        }
      },
      "/providerarticles/:id/prices/count": {
        "get": {
          "tags": [
            "Proveedores"
          ],
          "summary": "Cantidad de precios articulos por proveedor",
          "description": "Cantidad de precios articulos por proveedor",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Cantidad de precios articulos por proveedor",
              "content": {
                "*/*": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "totalcount": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/products/{id}/conversions": {
        "get": {
          "tags": [
            "Artículos"
          ],
          "summary": "Obtiene las conversiones de un articulo (ENDPOINT SOLO PARA ERP)",
          "description": "Obtiene las conversiones de un articulo",
          "parameters": [
            {
              "name": "id",
              "description": "Id del producto a consultar",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Conversiones de un articulo",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string"
                      },
                      "Product_Conversions": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetProductConversions"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Parametros inválidos o error interno",
              "content": {}
            }
          }
        }
      },
      "/economicactivities": {
        "get": {
          "tags": [
            "ActividadesEconomicas"
          ],
          "summary": "Obtener todas las actividades economicas (ENDPOINT SOLO PARA CORRALON)",
          "operationId": "getAllActividadesEconomicas",
          "description": "Devuelve todas las actividades economicas (ENDPOINT SOLO PARA CORRALON)",
          "parameters": [
            {
              "name": "activity_id",
              "in": "query",
              "description": "Filtra por id de la actividad economica",
              "schema": {
                "type": "integer"
              }
            },
            {
              "name": "code_from",
              "in": "query",
              "description": "Filtra por codigo de la actividad economica mayor o igual al indicado",
              "schema": {
                "type": "string",
                "maxLength": 10
              }
            },
            {
              "name": "code_to",
              "in": "query",
              "description": "Filtra por codigo de la actividad economica menor o igual al indicado",
              "schema": {
                "type": "string",
                "maxLength": 10
              }
            },
            {
              "name": "search",
              "in": "query",
              "description": "Filtra por coincidencia en la descripcion de la actividad economica",
              "schema": {
                "type": "string",
                "maxLength": 600
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Actividades economicas encontradas",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/ActividadesEconomicasCrud"
                        }
                      },
                      "count": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron actividades economicas o error interno",
              "content": {}
            }
          }
        },
        "post": {
          "tags": [
            "ActividadesEconomicas"
          ],
          "summary": "Creacion de una actividad economica (ENDPOINT SOLO PARA CORRALON)",
          "description": "Crea una actividad economica (ENDPOINT SOLO PARA CORRALON)",
          "operationId": "insertActividadEconomica",
          "requestBody": {
            "description": "Crea una actividad economica",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/ActividadesEconomicasCrud"
                    },
                    {
                      "type": "object",
                      "required": [
                        "activity_code",
                        "description"
                      ]
                    }
                  ]
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Actividad economica creada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "object",
                        "properties": {
                          "IDACTIVIDAD": {
                            "type": "integer",
                            "description": "Descripcion del id de la actividad economica"
                          },
                          "CODIGOACTIVIDAD": {
                            "type": "string",
                            "maxLength": 10,
                            "description": "Descripcion del codigo de actividad"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se pudo crear la actividad economica o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        }
      },
      "/economicactivities/{id}": {
        "get": {
          "tags": [
            "ActividadesEconomicas"
          ],
          "summary": "Obteniene una actividad economica por su id actividad (ENDPOINT SOLO PARA CORRALON)",
          "operationId": "findOneActividadesEconomicas",
          "description": "Obteniene una actividad economica por su id actividad (ENDPOINT SOLO PARA CORRALON)",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Id actividad de la actividad economica que deseas consultar",
              "schema": {
                "type": "integer"
              },
              "required": true
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Actividad economica encontrada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/ActividadesEconomicasCrud"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontro actividad economica o error interno",
              "content": {}
            }
          }
        },
        "put": {
          "tags": [
            "ActividadesEconomicas"
          ],
          "summary": "Actualiza una actividad economica (ENDPOINT SOLO PARA CORRALON)",
          "description": "Retorna la verificacion de la actualizacion (ENDPOINT SOLO PARA CORRALON)",
          "operationId": "updateActividadEconomica",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Id actividad de la actividad economica que deseas actualizar",
              "schema": {
                "type": "integer"
              },
              "required": true
            }
          ],
          "requestBody": {
            "description": "Campos que desea actualizar de la actividad economica",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ActividadesEconomicasCrud"
                }
              }
            },
            "required": true
          },
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Actividad economica actualizada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/AffectedRows"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se actualizo actividad economica o error interno",
              "content": {}
            }
          },
          "x-codegen-request-body-name": "body"
        },
        "delete": {
          "tags": [
            "ActividadesEconomicas"
          ],
          "summary": "Elimina una actividad economica (ENDPOINT SOLO PARA CORRALON)",
          "operationId": "deleteActividadEconomica",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "description": "Id actividad de la actividad economica que deseas eliminar",
              "schema": {
                "type": "integer"
              },
              "required": true
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Actividad economica eliminada",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "$ref": "#/components/schemas/AffectedRows"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se elimino actividad economica o error interno",
              "content": {}
            }
          }
        }
      },
      "/sales/customer/{customer_id}/product/{product_id}/datefrom/{date_from}": {
        "get": {
          "tags": [
            "Comprobantes Ventas"
          ],
          "summary": "Listado de comprobantes de venta por cliente, producto y fecha desde",
          "operationId": "getAll sales by customer product datefrom",
          "description": "Obtiene todos los comprobantes de venta filtrados por cliente, producto y fecha desde (SOLO CORRALON)",
          "parameters": [
            {
              "name": "customer_id",
              "in": "path",
              "description": "filtra por codigo de cliente",
              "required": true,
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "product_id",
              "in": "path",
              "description": "filtra por codigo de producto",
              "required": true,
              "schema": {
                "type": "string",
                "maxLength": 15
              }
            },
            {
              "name": "date_from",
              "in": "path",
              "description": "filtra por la fecha desde",
              "required": true,
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "date_to",
              "in": "query",
              "description": "filtra por la fecha hasta",
              "schema": {
                "type": "string",
                "format": "date"
              }
            },
            {
              "name": "calculate_freight_percentage",
              "in": "query",
              "description": "indica si debe calcular el porcentaje de flete (1 = si, 0 = no)",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "receipt_types",
              "in": "query",
              "description": "filtra por tipos de comprobantes (Los tipos se deberan separar con comas, ejemplo = FA,FB,NP,NCA), si no se envia traera todos",
              "schema": {
                "type": "string",
                "maxLength": 200
              }
            },
            {
              "name": "exclude_nc_others",
              "in": "query",
              "description": "indica si debe excluir los comprobantes NC con clase comprobante otros (1 = si, 0 = no) por defecto 1",
              "schema": {
                "type": "number"
              }
            }
          ],
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Operacion exitosa",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/GetSalesByCustomerProductDateFrom"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "No se encontraron comprobantes de venta o error interno",
              "content": {}
            }
          }
        }
      }
    },
    "components": {
      "securitySchemes": {
        "bearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        }
      },
      "schemas": {
        "Login": {
          "required": [
            "username",
            "password",
            "deviceinfo"
          ],
          "type": "object",
          "properties": {
            "username": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "deviceinfo": {
              "type": "object",
              "$ref": "#/components/schemas/DeviceInfo"
            }
          }
        },
        "DeviceInfo": {
          "required": [
            "model",
            "platform",
            "uuid",
            "version",
            "manufacturer"
          ],
          "type": "object",
          "properties": {
            "model": {
              "type": "string"
            },
            "platform": {
              "type": "string"
            },
            "uuid": {
              "type": "string"
            },
            "version": {
              "type": "string"
            },
            "manufacturer": {
              "type": "string"
            }
          }
        },
        "GetLogin": {
          "properties": {
            "token": {
              "type": "string"
            },
            "expireIn": {
              "type": "number"
            },
            "refreshToken": {
              "type": "string"
            },
            "refreshExpireIn": {
              "type": "number"
            },
            "modules": {
              "$ref": "#/components/schemas/Module"
            },
            "current_timestamp": {
              "type": "string",
              "format": "date-time"
            },
            "config": {
              "$ref": "#/components/schemas/GetConfig"
            },
            "message": {
              "type": "string"
            },
            "user": {
              "$ref": "#/components/schemas/GetUser"
            },
            "permissions": {
              "type": "array",
              "items": {
                "default": 0,
                "description": "array of numbers"
              }
            }
          }
        },
        "GetMe": {
          "properties": {
            "current_timestamp": {
              "type": "string",
              "format": "date-time"
            },
            "config": {
              "$ref": "#/components/schemas/GetConfigMe"
            },
            "message": {
              "type": "string"
            },
            "user": {
              "$ref": "#/components/schemas/GetUser"
            },
            "permissions": {
              "type": "array",
              "items": {
                "default": 0,
                "description": "array of numbers"
              }
            }
          }
        },
        "GetConfig": {
          "properties": {
            "warehouse_id": {
              "type": "string"
            },
            "price_list": {
              "type": "string"
            },
            "database_hash": {
              "type": "string"
            },
            "cart_type": {
              "type": "string"
            },
            "attribute_group": {
              "type": "string"
            },
            "product_char_count": {
              "type": "integer"
            },
            "size_char_count": {
              "type": "integer"
            },
            "default_customer_id": {
              "type": "string"
            },
            "allow_billing": {
              "type": "boolean"
            }
          }
        },
        "GetConfigMe": {
          "properties": {
            "warehouse_id": {
              "type": "string"
            },
            "price_list": {
              "type": "string"
            },
            "database_hash": {
              "type": "string"
            },
            "cart_type": {
              "type": "string"
            },
            "attribute_group": {
              "type": "string"
            },
            "product_char_count": {
              "type": "integer"
            },
            "size_char_count": {
              "type": "integer"
            },
            "default_customer_id": {
              "type": "string"
            },
            "allow_billing": {
              "type": "integer"
            }
          }
        },
        "Module": {
          "type": "object",
          "properties": {
            "cart": {
              "type": "boolean"
            },
            "inventory": {
              "type": "boolean"
            }
          }
        },
        "GetUser": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "full_name": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "company": {
              "type": "string"
            },
            "company_cuit": {
              "type": "string"
            },
            "rol": {
              "type": "string"
            },
            "rol_id": {
              "type": "string"
            },
            "position": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "warehouse_id": {
              "type": "string"
            },
            "warehouse_name": {
              "type": "string"
            },
            "checkout_id": {
              "type": "string"
            },
            "checkout_name": {
              "type": "string"
            },
            "pos_id": {
              "type": "string"
            },
            "pos_name": {
              "type": "string"
            },
            "pos_electronic": {
              "type": "integer"
            },
            "aux_pos_id": {
              "type": "string"
            },
            "aux_pos_name": {
              "type": "string"
            },
            "pos_aux_electronic": {
              "type": "integer"
            },
            "internal_code": {
              "type": "string"
            },
            "seller": {
              "type": "integer"
            },
            "collector": {
              "type": "integer"
            },
            "branchcode_id": {
              "type": "string"
            }
          }
        },
        "Activity_type": {
          "required": [
            "name"
          ],
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "example": "ACTIVIDAD EXTRAORDNIARIA"
            }
          }
        },
        "ProductCreate": {
          "type": "object",
          "required": [
            "name",
            "line_id",
            "unit_mesure_id",
            "brand_id",
            "currency_id",
            "import_certificate",
            "certificate_of_quality"
          ],
          "properties": {
            "reference_id": {
              "type": "string",
              "description": "REFERENCIA ID"
            },
            "name": {
              "type": "string",
              "description": "NOMBRE"
            },
            "line_id": {
              "type": "string",
              "description": "CODIGORUBRO"
            },
            "unit_mesure_id": {
              "type": "string",
              "description": "CODIGOUNIDADMEDIDA"
            },
            "part": {
              "type": "string",
              "description": "PARTECONJUNTO"
            },
            "purchase_price": {
              "type": "number",
              "description": "PRECIOCOMPRA"
            },
            "warranty": {
              "type": "number",
              "description": "GARANTIA"
            },
            "allows_fractioning": {
              "type": "number",
              "description": "FRACCIONADO"
            },
            "profit_margin_1": {
              "type": "number",
              "description": "MARGEN1"
            },
            "profit_margin_2": {
              "type": "number",
              "description": "MARGEN2"
            },
            "profit_margin_3": {
              "type": "number",
              "description": "MARGEN3"
            },
            "profit_margin_4": {
              "type": "number",
              "description": "MARGEN4"
            },
            "profit_margin_5": {
              "type": "number",
              "description": "MARGEN5"
            },
            "price_1": {
              "type": "number",
              "description": "PRECIOVENTA1"
            },
            "price_2": {
              "type": "number",
              "description": "PRECIOVENTA2"
            },
            "price_3": {
              "type": "number",
              "description": "PRECIOVENTA3"
            },
            "price_4": {
              "type": "number",
              "description": "PRECIOVENTA4"
            },
            "price_5": {
              "type": "number",
              "description": "PRECIOVENTA5"
            },
            "allows_detail": {
              "type": "number",
              "description": "PERMITEDETALLE"
            },
            "sales_account": {
              "type": "string",
              "description": "CUENTAVENTA"
            },
            "purchase_account": {
              "type": "string",
              "description": "CUENTACOMPRA"
            },
            "active": {
              "type": "integer",
              "description": "ACTIVO (SOLO 0 o 1)"
            },
            "product_class": {
              "type": "string",
              "description": "CLASEARTICULO"
            },
            "optimal_stock": {
              "type": "number",
              "description": "CANTIDADOPTIMACOMPRA"
            },
            "minimum_stock": {
              "type": "number",
              "description": "STOCKMINIMO"
            },
            "maximum_stock": {
              "type": "number",
              "description": "STOCKMAXIMO"
            },
            "offer_price": {
              "type": "number",
              "description": "PRECIOPROMOCION"
            },
            "offer_price_from": {
              "type": "string",
              "format": "date-time",
              "description": "FECHAPROMOCIONDESDE"
            },
            "offer_prices_to": {
              "type": "string",
              "format": "date-time",
              "description": "FECHAPROMOCIONHASTA"
            },
            "price_type": {
              "type": "number",
              "description": "PRECIOSEGUNRUBRO"
            },
            "locked": {
              "type": "number",
              "description": "BLOQUEADO"
            },
            "allows_negative_stock": {
              "type": "integer",
              "description": "PERMITESTOCKNEGATIVO (SOLO 0 o 1)"
            },
            "brand_id": {
              "type": "string",
              "description": "CODIGOMARCA"
            },
            "weighted_purchase_cost": {
              "type": "number",
              "description": "COSTOPONDERADOCOMPRA"
            },
            "bonus": {
              "type": "number",
              "description": "BONIFICACION"
            },
            "details": {
              "type": "string",
              "description": "DETALLES"
            },
            "image_path": {
              "type": "string",
              "description": "FOTO"
            },
            "marketed_as": {
              "type": "number",
              "description": "BIENDECAMBIO"
            },
            "product_for": {
              "type": "number",
              "description": "COMPRAVENTA"
            },
            "alternative_group_id": {
              "type": "number",
              "description": "CODIGOGRUPOALTERNATIVO",
              "nullable": true
            },
            "VAT_rate": {
              "type": "number",
              "description": "COEFICIENTEIVA"
            },
            "VAT_rate_by_line": {
              "type": "number",
              "description": "COEFICIENTESEGUNRUBRO"
            },
            "exchange_rate": {
              "type": "number",
              "description": "COTIZACION"
            },
            "currency_id": {
              "type": "string",
              "description": "CODIGOMONEDA"
            },
            "barcode": {
              "type": "string",
              "description": "CODIGOBARRA"
            },
            "classification_by_rotation": {
              "type": "number",
              "description": "CLASIFSEGUNROTACION"
            },
            "use_serial_number": {
              "type": "number",
              "description": "POSEESERIE"
            },
            "use_foreign_trade": {
              "type": "number",
              "description": "UTILIZACOMERCIOEXTERIOR"
            },
            "tariff_position_id": {
              "type": "number",
              "description": "CODIGOPOSICIONARANCELARIA",
              "nullable": true
            },
            "dispatcher_percent": {
              "type": "number",
              "description": "PORCENTAJEDESPACHANTE"
            },
            "shipping_percent": {
              "type": "number",
              "description": "PORCENTAJEFLETE"
            },
            "import_percent": {
              "type": "number",
              "description": "PORCENTAJEIMPORTACION"
            },
            "financial_percent": {
              "type": "number",
              "description": "PORCENTAJEFINANCIERO"
            },
            "banking_percent": {
              "type": "number",
              "description": "PORCENTAJEBANCARIO"
            },
            "logistics_percent": {
              "type": "number",
              "description": "PORCENTAJELOGISTICA"
            },
            "fob_price": {
              "type": "number",
              "description": "PRECIOFOB"
            },
            "additional_description": {
              "type": "string",
              "description": "DESCRIPCIONADICIONAL",
              "nullable": true
            },
            "offer_price_1": {
              "type": "number",
              "description": "PRECIOPROMOCION1"
            },
            "offer_price_from_1": {
              "type": "string",
              "format": "date",
              "description": "FECHAPROMOCIONDESDE1"
            },
            "offer_price_to_1": {
              "type": "string",
              "description": "FECHAPROMOCIONHASTA1"
            },
            "offer_price_2": {
              "type": "number",
              "description": "PRECIOPROMOCION2"
            },
            "offer_price_from_2": {
              "type": "string",
              "description": "FECHAPROMOCIONDESDE2"
            },
            "offer_price_to_2": {
              "type": "string",
              "description": "FECHAPROMOCIONHASTA2"
            },
            "offer_price_3": {
              "type": "number",
              "description": "PRECIOPROMOCION3"
            },
            "offer_price_from_3": {
              "type": "string",
              "description": "FECHAPROMOCIONDESDE3"
            },
            "offer_price_to_3": {
              "type": "string",
              "description": "FECHAPROMOCIONHASTA3"
            },
            "offer_price_4": {
              "type": "number",
              "description": "PRECIOPROMOCION4"
            },
            "offer_price_from_4": {
              "type": "string",
              "description": "FECHAPROMOCIONDESDE4"
            },
            "offer_price_to_4": {
              "type": "string",
              "description": "FECHAPROMOCIONHASTA4"
            },
            "offer_price_5": {
              "type": "number",
              "description": "PRECIOPROMOCION5"
            },
            "offer_price_from_5": {
              "type": "string",
              "description": "FECHAPROMOCIONDESDE5"
            },
            "offer_price_to_5": {
              "type": "string",
              "description": "FECHAPROMOCIONHASTA5"
            },
            "discount": {
              "type": "number",
              "description": "DESCUENTO"
            },
            "ranks_web": {
              "type": "number",
              "description": "DESTACADOWEB"
            },
            "publish_on_web": {
              "type": "number",
              "description": "MUESTRAWEB"
            },
            "show_price_list": {
              "type": "number",
              "description": "MUESTRALISTAPRECIOS"
            },
            "short_web_description": {
              "type": "string",
              "description": "DESCRIPCIONCORTAWEB",
              "nullable": true
            },
            "quantity_by_pack": {
              "type": "number",
              "description": "CANTIDADPORBULTO"
            },
            "weight": {
              "type": "number",
              "description": "PESOARTICULO"
            },
            "size": {
              "type": "number",
              "description": "VOLUMENARTICULO"
            },
            "location_id": {
              "type": "number",
              "description": "CODIGOSUBDEPOSITO",
              "nullable": true
            },
            "points_by_credit": {
              "type": "number",
              "description": "PUNTOSPORPESO"
            },
            "fixed_points": {
              "type": "number",
              "description": "PUNTOSFIJOS"
            },
            "certificate_of_quality": {
              "type": "string",
              "description": "CERTIFICADOCALIDAD"
            },
            "expiration_date_certificate": {
              "type": "string",
              "description": "FECHAVENCIMIENTOCERTCALIDAD",
              "nullable": true
            },
            "import_certificate": {
              "type": "string",
              "description": "CERTIFICADOIMPORTACION"
            },
            "postage_required": {
              "type": "number",
              "description": "REQUIEREESTAMPILLA"
            },
            "inner_by_pack": {
              "type": "number",
              "description": "INNERPORBULTO"
            },
            "block_notes": {
              "type": "string",
              "description": "OBSERVACIONBLOQUEADO",
              "nullable": true
            },
            "linked_product_id": {
              "type": "string",
              "description": "CODIGOARTICULOVINCULADO",
              "nullable": true
            },
            "linked_rate": {
              "type": "number",
              "description": "COEFICIENTEVINCULO"
            },
            "barcode_char_from": {
              "type": "number",
              "description": "CODBARRADESDE"
            },
            "barcode_char_to": {
              "type": "number",
              "description": "CODBARRAHASTA"
            },
            "internal_tax_rate": {
              "type": "number",
              "description": "PORCENTAJEII"
            },
            "internal_tax_amount": {
              "type": "number",
              "description": "MONTOII"
            },
            "commercial_discount": {
              "type": "number",
              "description": "DTOCOMERCIAL"
            },
            "minimal_production": {
              "type": "number",
              "description": "MINIMOPRODUCCION"
            },
            "increase_production": {
              "type": "number",
              "description": "INCREMENTOPRODUCCION"
            },
            "assembly_line_id": {
              "type": "number",
              "description": "CODIGOLINEAMONTAJE",
              "nullable": true
            },
            "location": {
              "type": "string",
              "description": "UBICACION",
              "nullable": true
            },
            "barcode_sales_policy": {
              "type": "number",
              "description": "POLITICAVENTAS"
            },
            "initial_position_fixed_part_ns": {
              "type": "number",
              "description": "POSICIONINICIALPARTEFIJANS"
            },
            "length_fixed_part_ns": {
              "type": "number",
              "description": "LONGITUDPARTEFIJANS"
            },
            "cmv_account": {
              "type": "string",
              "description": "CUENTACMV",
              "nullable": true
            },
            "cost_rule": {
              "type": "number",
              "description": "POLITICACOSTOS"
            },
            "ppp_price": {
              "type": "number",
              "description": "PRECIOPPP"
            },
            "reference_file_path": {
              "type": "string",
              "description": "ARCHIVOREFERENCIA"
            },
            "max_discount_1": {
              "type": "number",
              "description": "DTOMAXIMO1"
            },
            "max_discount_2": {
              "type": "number",
              "description": "DTOMAXIMO2"
            },
            "max_discount_3": {
              "type": "number",
              "description": "DTOMAXIMO3"
            },
            "max_discount_4": {
              "type": "number",
              "description": "DTOMAXIMO4"
            },
            "max_discount_5": {
              "type": "number",
              "description": "DTOMAXIMO5"
            },
            "require_transportation": {
              "type": "number",
              "description": "REQUIEREDESPACHO"
            },
            "manual_adjustment_price": {
              "type": "number",
              "description": "PRECIOSCONAJUSTEMANUAL"
            },
            "checks_available_stock": {
              "type": "number",
              "description": "VERIFICASTOCK"
            },
            "round_policy_id": {
              "type": "string",
              "description": "CODIGOPOLITICAREDONDEO",
              "nullable": true
            },
            "gtin": {
              "type": "string",
              "description": "GTIN",
              "nullable": true
            },
            "production_notes": {
              "type": "string",
              "description": "COMENTARIOPRODUCCION",
              "nullable": true
            },
            "quantity_amount_discount": {
              "type": "number",
              "description": "DESCUENTOCANTIMPORTE"
            },
            "production_time": {
              "type": "number",
              "description": "TIEMPOPRODUCCION"
            },
            "setup_time": {
              "type": "number",
              "description": "TIEMPOPUESTAPUNTO"
            },
            "provider_delay_time": {
              "type": "number",
              "description": "TIEMPODEMORAPROVEEDOR"
            },
            "part_time_by_day": {
              "type": "number",
              "description": "TIEMPOPIEZAPORDIA"
            },
            "allows_unbind": {
              "type": "number",
              "description": "PERMITEDESASOCIAR"
            },
            "recalc_parent": {
              "type": "number",
              "description": "RECALCULAPADRE"
            },
            "exempt": {
              "type": "number",
              "description": "ES EXENTO (0 = NO ES EXENTO, 1 = EXENTO PARA COMPRAS, 2 = EXENTO PARA VENTAS, 3 = EXENTO PARA COMPRAS Y VENTAS - SOLO PARA ENTERPRISE VESION ^3.36)"
            }
          }
        },
        "ProductUpdate": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "description": "DESCRIPCION"
            },
            "line_id": {
              "type": "string",
              "description": "CODIGORUBRO"
            },
            "unit_mesure_id": {
              "type": "string",
              "description": "CODIGOUNIDADMEDIDA"
            },
            "part": {
              "type": "string",
              "description": "PARTECONJUNTO"
            },
            "purchase_price": {
              "type": "number",
              "description": "PRECIOCOMPRA"
            },
            "warranty": {
              "type": "number",
              "description": "GARANTIA"
            },
            "allows_fractioning": {
              "type": "number",
              "description": "FRACCIONADO"
            },
            "profit_margin_1": {
              "type": "number",
              "description": "MARGEN1"
            },
            "profit_margin_2": {
              "type": "number",
              "description": "MARGEN2"
            },
            "profit_margin_3": {
              "type": "number",
              "description": "MARGEN3"
            },
            "profit_margin_4": {
              "type": "number",
              "description": "MARGEN4"
            },
            "profit_margin_5": {
              "type": "number",
              "description": "MARGEN5"
            },
            "price_1": {
              "type": "number",
              "description": "PRECIOVENTA1"
            },
            "price_2": {
              "type": "number",
              "description": "PRECIOVENTA2"
            },
            "price_3": {
              "type": "number",
              "description": "PRECIOVENTA3"
            },
            "price_4": {
              "type": "number",
              "description": "PRECIOVENTA4"
            },
            "price_5": {
              "type": "number",
              "description": "PRECIOVENTA5"
            },
            "allows_detail": {
              "type": "number",
              "description": "PERMITEDETALLE"
            },
            "sales_account": {
              "type": "string",
              "description": "CUENTAVENTA"
            },
            "purchase_account": {
              "type": "string",
              "description": "CUENTACOMPRA"
            },
            "active": {
              "type": "integer",
              "description": "ACTIVO (SOLO 0 o 1)"
            },
            "product_class": {
              "type": "string",
              "description": "CLASEARTICULO"
            },
            "optimal_stock": {
              "type": "number",
              "description": "CANTIDADOPTIMACOMPRA"
            },
            "minimum_stock": {
              "type": "number",
              "description": "STOCKMINIMO"
            },
            "maximum_stock": {
              "type": "number",
              "description": "STOCKMAXIMO"
            },
            "offer_price": {
              "type": "number",
              "description": "PRECIOPROMOCION"
            },
            "offer_price_from": {
              "type": "string",
              "format": "date-time",
              "description": "FECHAPROMOCIONDESDE"
            },
            "offer_prices_to": {
              "type": "string",
              "format": "date-time",
              "description": "FECHAPROMOCIONHASTA"
            },
            "price_type": {
              "type": "number",
              "description": "PRECIOSEGUNRUBRO"
            },
            "locked": {
              "type": "number",
              "description": "BLOQUEADO"
            },
            "allows_negative_stock": {
              "type": "integer",
              "description": "PERMITESTOCKNEGATIVO (SOLO 0 o 1)"
            },
            "brand_id": {
              "type": "string",
              "description": "CODIGOMARCA"
            },
            "weighted_purchase_cost": {
              "type": "number",
              "description": "COSTOPONDERADOCOMPRA"
            },
            "bonus": {
              "type": "number",
              "description": "BONIFICACION"
            },
            "details": {
              "type": "string",
              "description": "DETALLES"
            },
            "image_path": {
              "type": "string",
              "description": "FOTO"
            },
            "marketed_as": {
              "type": "number",
              "description": "BIENDECAMBIO"
            },
            "product_for": {
              "type": "number",
              "description": "COMPRAVENTA"
            },
            "alternative_group_id": {
              "type": "number",
              "description": "CODIGOGRUPOALTERNATIVO",
              "nullable": true
            },
            "VAT_rate": {
              "type": "number",
              "description": "COEFICIENTEIVA"
            },
            "VAT_rate_by_line": {
              "type": "number",
              "description": "COEFICIENTESEGUNRUBRO"
            },
            "exchange_rate": {
              "type": "number",
              "description": "COTIZACION"
            },
            "currency_id": {
              "type": "string",
              "description": "CODIGOMONEDA"
            },
            "barcode": {
              "type": "string",
              "description": "CODIGOBARRA"
            },
            "classification_by_rotation": {
              "type": "number",
              "description": "CLASIFSEGUNROTACION"
            },
            "use_serial_number": {
              "type": "number",
              "description": "POSEESERIE"
            },
            "use_foreign_trade": {
              "type": "number",
              "description": "UTILIZACOMERCIOEXTERIOR"
            },
            "tariff_position_id": {
              "type": "number",
              "description": "CODIGOPOSICIONARANCELARIA",
              "nullable": true
            },
            "dispatcher_percent": {
              "type": "number",
              "description": "PORCENTAJEDESPACHANTE"
            },
            "shipping_percent": {
              "type": "number",
              "description": "PORCENTAJEFLETE"
            },
            "import_percent": {
              "type": "number",
              "description": "PORCENTAJEIMPORTACION"
            },
            "financial_percent": {
              "type": "number",
              "description": "PORCENTAJEFINANCIERO"
            },
            "banking_percent": {
              "type": "number",
              "description": "PORCENTAJEBANCARIO"
            },
            "logistics_percent": {
              "type": "number",
              "description": "PORCENTAJELOGISTICA"
            },
            "fob_price": {
              "type": "number",
              "description": "PRECIOFOB"
            },
            "additional_description": {
              "type": "string",
              "description": "DESCRIPCIONADICIONAL",
              "nullable": true
            },
            "offer_price_1": {
              "type": "number",
              "description": "PRECIOPROMOCION1"
            },
            "offer_price_from_1": {
              "type": "string",
              "format": "date",
              "description": "FECHAPROMOCIONDESDE1"
            },
            "offer_price_to_1": {
              "type": "string",
              "description": "FECHAPROMOCIONHASTA1"
            },
            "offer_price_2": {
              "type": "number",
              "description": "PRECIOPROMOCION2"
            },
            "offer_price_from_2": {
              "type": "string",
              "description": "FECHAPROMOCIONDESDE2"
            },
            "offer_price_to_2": {
              "type": "string",
              "description": "FECHAPROMOCIONHASTA2"
            },
            "offer_price_3": {
              "type": "number",
              "description": "PRECIOPROMOCION3"
            },
            "offer_price_from_3": {
              "type": "string",
              "description": "FECHAPROMOCIONDESDE3"
            },
            "offer_price_to_3": {
              "type": "string",
              "description": "FECHAPROMOCIONHASTA3"
            },
            "offer_price_4": {
              "type": "number",
              "description": "PRECIOPROMOCION4"
            },
            "offer_price_from_4": {
              "type": "string",
              "description": "FECHAPROMOCIONDESDE4"
            },
            "offer_price_to_4": {
              "type": "string",
              "description": "FECHAPROMOCIONHASTA4"
            },
            "offer_price_5": {
              "type": "number",
              "description": "PRECIOPROMOCION5"
            },
            "offer_price_from_5": {
              "type": "string",
              "description": "FECHAPROMOCIONDESDE5"
            },
            "offer_price_to_5": {
              "type": "string",
              "description": "FECHAPROMOCIONHASTA5"
            },
            "discount": {
              "type": "number",
              "description": "DESCUENTO"
            },
            "ranks_web": {
              "type": "number",
              "description": "DESTACADOWEB"
            },
            "publish_on_web": {
              "type": "number",
              "description": "MUESTRAWEB"
            },
            "show_price_list": {
              "type": "number",
              "description": "MUESTRALISTAPRECIOS"
            },
            "short_web_description": {
              "type": "string",
              "description": "DESCRIPCIONCORTAWEB",
              "nullable": true
            },
            "quantity_by_pack": {
              "type": "number",
              "description": "CANTIDADPORBULTO"
            },
            "weight": {
              "type": "number",
              "description": "PESOARTICULO"
            },
            "size": {
              "type": "number",
              "description": "VOLUMENARTICULO"
            },
            "location_id": {
              "type": "number",
              "description": "CODIGOSUBDEPOSITO",
              "nullable": true
            },
            "points_by_credit": {
              "type": "number",
              "description": "PUNTOSPORPESO"
            },
            "fixed_points": {
              "type": "number",
              "description": "PUNTOSFIJOS"
            },
            "certificate_of_quality": {
              "type": "string",
              "description": "CERTIFICADOCALIDAD"
            },
            "expiration_date_certificate": {
              "type": "string",
              "description": "FECHAVENCIMIENTOCERTCALIDAD",
              "nullable": true
            },
            "import_certificate": {
              "type": "string",
              "description": "CERTIFICADOIMPORTACION"
            },
            "postage_required": {
              "type": "number",
              "description": "REQUIEREESTAMPILLA"
            },
            "inner_by_pack": {
              "type": "number",
              "description": "INNERPORBULTO"
            },
            "block_notes": {
              "type": "string",
              "description": "OBSERVACIONBLOQUEADO",
              "nullable": true
            },
            "linked_product_id": {
              "type": "string",
              "description": "CODIGOARTICULOVINCULADO",
              "nullable": true
            },
            "linked_rate": {
              "type": "number",
              "description": "COEFICIENTEVINCULO"
            },
            "barcode_char_from": {
              "type": "number",
              "description": "CODBARRADESDE"
            },
            "barcode_char_to": {
              "type": "number",
              "description": "CODBARRAHASTA"
            },
            "internal_tax_rate": {
              "type": "number",
              "description": "PORCENTAJEII"
            },
            "internal_tax_amount": {
              "type": "number",
              "description": "MONTOII"
            },
            "commercial_discount": {
              "type": "number",
              "description": "DTOCOMERCIAL"
            },
            "minimal_production": {
              "type": "number",
              "description": "MINIMOPRODUCCION"
            },
            "increase_production": {
              "type": "number",
              "description": "INCREMENTOPRODUCCION"
            },
            "assembly_line_id": {
              "type": "number",
              "description": "CODIGOLINEAMONTAJE",
              "nullable": true
            },
            "location": {
              "type": "string",
              "description": "UBICACION",
              "nullable": true
            },
            "barcode_sales_policy": {
              "type": "number",
              "description": "POLITICAVENTAS"
            },
            "initial_position_fixed_part_ns": {
              "type": "number",
              "description": "POSICIONINICIALPARTEFIJANS"
            },
            "length_fixed_part_ns": {
              "type": "number",
              "description": "LONGITUDPARTEFIJANS"
            },
            "cmv_account": {
              "type": "string",
              "description": "CUENTACMV",
              "nullable": true
            },
            "cost_rule": {
              "type": "number",
              "description": "POLITICACOSTOS"
            },
            "ppp_price": {
              "type": "number",
              "description": "PRECIOPPP"
            },
            "reference_file_path": {
              "type": "string",
              "description": "ARCHIVOREFERENCIA"
            },
            "max_discount_1": {
              "type": "number",
              "description": "DTOMAXIMO1"
            },
            "max_discount_2": {
              "type": "number",
              "description": "DTOMAXIMO2"
            },
            "max_discount_3": {
              "type": "number",
              "description": "DTOMAXIMO3"
            },
            "max_discount_4": {
              "type": "number",
              "description": "DTOMAXIMO4"
            },
            "max_discount_5": {
              "type": "number",
              "description": "DTOMAXIMO5"
            },
            "require_transportation": {
              "type": "number",
              "description": "REQUIEREDESPACHO"
            },
            "manual_adjustment_price": {
              "type": "number",
              "description": "PRECIOSCONAJUSTEMANUAL"
            },
            "checks_available_stock": {
              "type": "number",
              "description": "VERIFICASTOCK"
            },
            "round_policy_id": {
              "type": "string",
              "description": "CODIGOPOLITICAREDONDEO",
              "nullable": true
            },
            "gtin": {
              "type": "string",
              "description": "GTIN",
              "nullable": true
            },
            "production_notes": {
              "type": "string",
              "description": "COMENTARIOPRODUCCION",
              "nullable": true
            },
            "quantity_amount_discount": {
              "type": "number",
              "description": "DESCUENTOCANTIMPORTE"
            },
            "production_time": {
              "type": "number",
              "description": "TIEMPOPRODUCCION"
            },
            "setup_time": {
              "type": "number",
              "description": "TIEMPOPUESTAPUNTO"
            },
            "provider_delay_time": {
              "type": "number",
              "description": "TIEMPODEMORAPROVEEDOR"
            },
            "part_time_by_day": {
              "type": "number",
              "description": "TIEMPOPIEZAPORDIA"
            },
            "allows_unbind": {
              "type": "number",
              "description": "PERMITEDESASOCIAR"
            },
            "recalc_parent": {
              "type": "number",
              "description": "RECALCULAPADRE"
            },
            "exempt": {
              "type": "number",
              "description": "ES EXENTO (0 = NO ES EXENTO, 1 = EXENTO PARA COMPRAS, 2 = EXENTO PARA VENTAS, 3 = EXENTO PARA COMPRAS Y VENTAS - SOLO PARA ENTERPRISE VESION ^3.36)"
            }
          }
        },
        "Operation": {
          "required": [
            "name"
          ],
          "type": "object",
          "properties": {
            "operationId": {
              "type": "integer",
              "format": "int64"
            },
            "name": {
              "type": "string"
            },
            "notes": {
              "type": "string"
            },
            "allows_check_out": {
              "type": "integer"
            },
            "requires_preparation": {
              "type": "integer"
            },
            "reserve_stock": {
              "type": "integer"
            }
          }
        },
        "Currency": {
          "required": [
            "id",
            "name",
            "quotation",
            "symbol"
          ],
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "example": "PESOS"
            },
            "name": {
              "type": "string",
              "example": "PESOS"
            },
            "quotation": {
              "type": "number",
              "example": 145
            },
            "active": {
              "type": "integer",
              "example": 1
            },
            "base_currency": {
              "type": "integer",
              "example": 1
            },
            "symbol": {
              "type": "string",
              "example": "$"
            }
          }
        },
        "Inventory": {
          "required": [
            "id",
            "item_number",
            "product_id",
            "size",
            "quantity",
            "collect_date",
            "user_id"
          ],
          "type": "object",
          "properties": {
            "id": {
              "type": "integer",
              "format": "int64"
            },
            "item_number": {
              "type": "number"
            },
            "product_id": {
              "type": "string"
            },
            "size": {
              "type": "number"
            },
            "quantity": {
              "type": "number"
            },
            "collect_date": {
              "type": "string"
            },
            "user_id": {
              "type": "string"
            }
          }
        },
        "State": {
          "required": [
            "name"
          ],
          "type": "object",
          "properties": {
            "stateId": {
              "type": "integer"
            },
            "name": {
              "type": "string"
            }
          }
        },
        "City": {
          "required": [
            "state_id",
            "name"
          ],
          "type": "object",
          "properties": {
            "state_id": {
              "type": "integer",
              "format": "int64"
            },
            "id": {
              "type": "number"
            },
            "name": {
              "type": "string"
            },
            "postal_code": {
              "type": "number"
            },
            "phone_prefix": {
              "type": "number"
            }
          }
        },
        "Customer": {
          "required": [
            "name",
            "address",
            "state_id",
            "city",
            "user_id",
            "price_list_id",
            "phone",
            "sales_tax_group_id"
          ],
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "address": {
              "type": "string",
              "description": "REQUERIDO SOLO EN ENTERPRISE"
            },
            "state_id": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "neighborhood": {
              "type": "string",
              "description": "ES REQUERIDO EN CORRALON"
            },
            "user_id": {
              "type": "string"
            },
            "price_list_id": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            },
            "cell_phone": {
              "type": "string",
              "description": "A partir de la version 03.39.001.0004.00 el dato se guarda en el campo TELEFONOCELULAR"
            },
            "sales_tax_group_id": {
              "type": "string"
            },
            "document_id": {
              "type": "string"
            },
            "vat_number": {
              "type": "string",
              "description": "CUIT ES REQUERIDO SEGUN LA CONDICION DE IVA (SOLO CORRALON)"
            },
            "notes": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "zipcode": {
              "type": "string"
            },
            "activity_id": {
              "type": "string"
            },
            "grossincome": {
              "type": "string",
              "description": "INGRESOS BRUTOS ES REQUERIDO SEGUN LA CONDICION DE IVA (SOLO CORRALON)"
            },
            "account": {
              "type": "integer",
              "format": "int64",
              "description": "descripcion de la cuenta corriente"
            },
            "creditLimit": {
              "type": "number",
              "format": "double",
              "description": "descripcion del limite de credito (este campo es requerido si account = 1, solo para ENTERPRISE)"
            },
            "creditLimitDoc": {
              "type": "number",
              "format": "double",
              "description": "descripcion del limite de credito doc (este campo es requerido si account = 1, solo para ENTERPRISE)"
            },
            "payment_method_id": {
              "type": "number",
              "format": "double",
              "description": "descripcion del limite del codigo del multiplazo(este campo es requerido si account = 1, solo para ENTERPRISE)"
            },
            "credit_amount_req": {
              "type": "number",
              "format": "double",
              "description": "descripcion del monto del credito solicitado (solo para ENTERPRISE)"
            },
            "fixed_payment_method": {
              "type": "integer",
              "format": "int64",
              "description": "descripcion del multiplazo fijo (solo para ENTERPRISE)"
            },
            "account_disabled": {
              "type": "integer",
              "format": "int64",
              "description": "descripcion de deshabilitar la cuenta corriente  (solo para ENTERPRISE)"
            },
            "expired_days": {
              "type": "integer",
              "format": "int64",
              "description": "descripcion de dias vencidos (solo para ENTERPRISE)"
            },
            "promotion_bill": {
              "type": "integer",
              "description": "descripcion de ofertas facturables (solo 0 o 1, en caso de null se inserta 1)"
            },
            "codezone": {
              "type": "integer",
              "description": "descripcion de codigo zona (SOLO CORRALON)"
            },
            "seller_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo vendedor (SOLO CORRALON)"
            },
            "branchs": {
              "type": "array",
              "description": "SOLO ENTERPRISE (EN CASO DE USARSE EL OBJETO TODOS LOS CAMPOS SON REQUERIDOS)",
              "items": {
                "type": "object",
                "$ref": "#/components/schemas/CustumerBranchs"
              }
            },
            "contacts": {
              "type": "array",
              "description": "SOLO ENTERPRISE (EN CASO DE USARSE EL OBJETO TODOS LOS CAMPOS SON REQUERIDOS)",
              "items": {
                "type": "object",
                "$ref": "#/components/schemas/CustumerContacts"
              }
            }
          }
        },
        "CustomerUpdate": {
          "type": "object",
          "required": [
            "name",
            "address",
            "state_id",
            "city",
            "user_id",
            "price_list_id",
            "phone",
            "sales_tax_group_id"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "state_id": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "neighborhood": {
              "type": "string"
            },
            "user_id": {
              "type": "string"
            },
            "price_list_id": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            },
            "cell_phone": {
              "type": "string",
              "description": "A partir de la version 03.39.001.0004.00 el dato se guarda en el campo TELEFONOCELULAR"
            },
            "sales_tax_group_id": {
              "type": "string"
            },
            "document_id": {
              "type": "string"
            },
            "vat_number": {
              "type": "string"
            },
            "notes": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "zipcode": {
              "type": "string"
            },
            "activity_id": {
              "type": "string"
            },
            "grossincome": {
              "type": "string"
            },
            "promotion_bill": {
              "type": "integer",
              "description": "descripcion de ofertas facturables (solo 0 o 1)"
            },
            "codezone": {
              "type": "integer",
              "description": "descripcion de codigo zona (SOLO CORRALON)"
            },
            "seller_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo vendedor (SOLO CORRALON)"
            }
          }
        },
        "Change_Password": {
          "required": [
            "oldPassword",
            "newPassword"
          ],
          "type": "object",
          "properties": {
            "oldPassword": {
              "type": "string"
            },
            "newPassword": {
              "type": "string"
            }
          }
        },
        "Change_Password_res": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string",
              "default": "Ok"
            },
            "message": {
              "type": "string",
              "default": "Contraseña cambiada con éxito"
            }
          }
        },
        "Provider": {
          "required": [
            "name",
            "address",
            "state_id",
            "city",
            "neighborhood",
            "user_id",
            "phone",
            "sales_tax_group_id",
            "vat_number",
            "email",
            "zipcode"
          ],
          "type": "object",
          "properties": {
            "providerId": {
              "type": "integer",
              "format": "int64"
            },
            "name": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "state_id": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "neighborhood": {
              "type": "string"
            },
            "user_id": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            },
            "sales_tax_group_id": {
              "type": "string"
            },
            "vat_number": {
              "type": "string"
            },
            "notes": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "zipcode": {
              "type": "string"
            }
          }
        },
        "Card": {
          "required": [
            "name",
            "providerId"
          ],
          "type": "object",
          "properties": {
            "id": {
              "type": "integer",
              "format": "int64"
            },
            "name": {
              "type": "string"
            },
            "providerId": {
              "type": "string"
            },
            "active": {
              "type": "integer"
            },
            "trade_number": {
              "type": "number"
            },
            "authorization": {
              "type": "number"
            },
            "cupon_number_format": {
              "type": "number"
            },
            "reconcile_from_file": {
              "type": "number"
            },
            "cupon_from": {
              "type": "number"
            },
            "cupon_to": {
              "type": "number"
            },
            "amount_from": {
              "type": "number"
            },
            "amount_to": {
              "type": "number"
            },
            "date_from": {
              "type": "string"
            },
            "date_to": {
              "type": "string"
            },
            "date_format": {
              "type": "string"
            },
            "afip_cardId": {
              "type": "string"
            },
            "card_type": {
              "type": "integer"
            },
            "public_web": {
              "type": "integer"
            },
            "lot_number_from": {
              "type": "number"
            },
            "lot_number_to": {
              "type": "number"
            },
            "clientId": {
              "type": "string"
            }
          }
        },
        "SaleTax": {
          "required": [
            "name",
            "documentType",
            "taxPercent",
            "fiscalID"
          ],
          "type": "object",
          "properties": {
            "id": {
              "type": "integer",
              "format": "int64"
            },
            "name": {
              "type": "string"
            },
            "documentType": {
              "type": "string"
            },
            "taxExclude": {
              "type": "integer"
            },
            "taxPercent": {
              "type": "number"
            },
            "taxExcludeVATBook": {
              "type": "integer"
            },
            "taxShowVATBook": {
              "type": "integer"
            },
            "fiscalID": {
              "type": "string"
            },
            "vatRequired": {
              "type": "integer"
            },
            "active": {
              "type": "integer"
            }
          }
        },
        "PurchaseTax": {
          "required": [
            "name",
            "documentType",
            "taxPercent"
          ],
          "type": "object",
          "properties": {
            "id": {
              "type": "integer"
            },
            "name": {
              "type": "string"
            },
            "documentType": {
              "type": "string"
            },
            "taxExclude": {
              "type": "boolean"
            },
            "taxPercent": {
              "type": "number"
            },
            "taxExcludeVATBook": {
              "type": "boolean"
            },
            "taxShowVATBook": {
              "type": "boolean"
            },
            "vatRequired": {
              "type": "boolean"
            },
            "active": {
              "type": "boolean"
            }
          }
        },
        "PaymentMethod": {
          "required": [
            "name",
            "documentType",
            "taxPercent",
            "notes"
          ],
          "type": "object",
          "properties": {
            "id": {
              "type": "integer"
            },
            "name": {
              "type": "string"
            },
            "interes": {
              "type": "number"
            },
            "notes": {
              "type": "string"
            },
            "cash_on_delivery": {
              "type": "number"
            },
            "aplly_product_offers": {
              "type": "integer"
            },
            "active": {
              "type": "integer"
            },
            "purchase_sale": {
              "type": "integer"
            },
            "cash_current_account": {
              "type": "integer"
            },
            "allows_cash": {
              "type": "integer"
            },
            "allows_credit_card": {
              "type": "integer"
            },
            "allows_check_bank": {
              "type": "integer"
            },
            "allows_card": {
              "type": "integer"
            },
            "allows_documents": {
              "type": "integer"
            },
            "allows_accounting_account": {
              "type": "integer"
            },
            "effective_date_from": {
              "type": "string",
              "format": "date-time",
              "nullable": true
            },
            "effective_date_to": {
              "type": "string",
              "format": "date-time",
              "nullable": true
            },
            "allows_debit_card": {
              "type": "integer"
            },
            "aux_payment_method_id": {
              "type": "integer",
              "nullable": true
            },
            "cash_discount": {
              "type": "number"
            },
            "discount_date_from": {
              "type": "string",
              "format": "date-time",
              "nullable": true
            },
            "discount_date_to": {
              "type": "string",
              "format": "date-time",
              "nullable": true
            },
            "down_payment_type": {
              "type": "integer"
            },
            "allows_discount_coupons": {
              "type": "integer"
            },
            "associated_price_lists": {
              "type": "string"
            },
            "default_price_list": {
              "type": "integer"
            },
            "bill_current_account_orders": {
              "type": "integer"
            },
            "detail": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/DetailPaymentMethods"
              }
            }
          }
        },
        "DetailPaymentMethods": {
          "type": "object",
          "properties": {
            "idPaymentMethod": {
              "type": "integer"
            },
            "percentage": {
              "type": "number"
            },
            "daysToExpire": {
              "type": "number"
            }
          }
        },
        "Employe": {
          "required": [
            "name",
            "documentType",
            "profile_id",
            "address",
            "password",
            "nationality",
            "id_number",
            "birhday",
            "gender",
            "civil_status",
            "neighborhood",
            "city",
            "state_id",
            "postal_code",
            "email",
            "phone_number",
            "cuil_number",
            "health_book",
            "wifes_name",
            "wife_id_number",
            "wife_birthday",
            "plant",
            "department",
            "section",
            "wage_agreement",
            "pay_scale",
            "shift",
            "admission_date",
            "departure_date",
            "cash_register_id",
            "point_of_sale_id",
            "max_bonus",
            "warehouse_id",
            "generate_fees",
            "ri_point_of_sale_id",
            "increment_price_percent",
            "decrement_price_percent",
            "folder_number",
            "position",
            "school",
            "embargoes",
            "social_security",
            "contributions",
            "guild",
            "insurance_beneficiaries",
            "web_access_level",
            "branch_id",
            "use_external_warehouse",
            "enable_stock_panel",
            "fixed_fees",
            "bonus_type",
            "control_processes",
            "only_seller_customers"
          ],
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "profile_id": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "sale_percent": {
              "type": "number"
            },
            "active": {
              "type": "integer"
            },
            "collection_percent": {
              "type": "number"
            },
            "net_fees_for_sale": {
              "type": "number"
            },
            "net_fees_for_collection": {
              "type": "number"
            },
            "for_accredited_values": {
              "type": "number"
            },
            "discount_bounced_checks": {
              "type": "integer"
            },
            "is_seller": {
              "type": "integer"
            },
            "is_collector": {
              "type": "integer"
            },
            "make_orders": {
              "type": "integer"
            },
            "check_delivery_receipts": {
              "type": "integer"
            },
            "nationality": {
              "type": "string"
            },
            "id_number": {
              "type": "integer"
            },
            "birhday": {
              "type": "string"
            },
            "gender": {
              "type": "integer"
            },
            "civil_status": {
              "type": "integer"
            },
            "neighborhood": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "state_id": {
              "type": "string"
            },
            "postal_code": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "phone_number": {
              "type": "string"
            },
            "cuil_number": {
              "type": "string"
            },
            "health_book": {
              "type": "string"
            },
            "wifes_name": {
              "type": "string"
            },
            "wife_id_number": {
              "type": "string"
            },
            "wife_birthday": {
              "type": "string"
            },
            "plant": {
              "type": "string"
            },
            "department": {
              "type": "string"
            },
            "section": {
              "type": "string"
            },
            "wage_agreement": {
              "type": "string"
            },
            "pay_scale": {
              "type": "string"
            },
            "shift": {
              "type": "string"
            },
            "admission_date": {
              "type": "string"
            },
            "departure_date": {
              "type": "string"
            },
            "cash_register_id": {
              "type": "string"
            },
            "point_of_sale_id": {
              "type": "string"
            },
            "aux_point_of_sale_id": {
              "type": "string"
            },
            "max_bonus": {
              "type": "number"
            },
            "warehouse_id": {
              "type": "string"
            },
            "generate_fees": {
              "type": "number"
            },
            "ri_point_of_sale_id": {
              "type": "string"
            },
            "internal_id": {
              "type": "string"
            },
            "increment_price_percent": {
              "type": "number"
            },
            "decrement_price_percent": {
              "type": "number"
            },
            "folder_number": {
              "type": "string"
            },
            "position": {
              "type": "string"
            },
            "school": {
              "type": "string"
            },
            "embargoes": {
              "type": "string"
            },
            "social_security": {
              "type": "string"
            },
            "contributions": {
              "type": "string"
            },
            "guild": {
              "type": "string"
            },
            "insurance_beneficiaries": {
              "type": "string"
            },
            "web_access_level": {
              "type": "string"
            },
            "branch_id": {
              "type": "string"
            },
            "use_external_warehouse": {
              "type": "string"
            },
            "oc_authorized_amount": {
              "type": "number"
            },
            "customer_id": {
              "type": "string"
            },
            "fixed_fees": {
              "type": "integer"
            },
            "settings": {
              "type": "string"
            },
            "bonus_type": {
              "type": "integer"
            },
            "control_processes": {
              "type": "integer"
            },
            "invgates_user": {
              "type": "string"
            },
            "invgates_password": {
              "type": "string"
            },
            "enable_stock_panel": {
              "type": "integer"
            },
            "only_seller_customers": {
              "type": "integer"
            }
          }
        },
        "Area": {
          "required": [
            "name",
            "stateId",
            "cityId"
          ],
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "stateId": {
              "type": "string"
            },
            "cityId": {
              "type": "string"
            },
            "prefix": {
              "type": "number"
            },
            "active": {
              "type": "integer"
            },
            "use_delivery_type": {
              "type": "integer"
            }
          }
        },
        "Warehouse": {
          "required": [
            "name"
          ],
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "locationWH": {
              "type": "string"
            },
            "customerId": {
              "type": "string"
            },
            "providerId": {
              "type": "string"
            },
            "distributionRate": {
              "type": "number"
            },
            "visible": {
              "type": "integer"
            },
            "active": {
              "type": "integer"
            },
            "shopId": {
              "type": "string"
            }
          }
        },
        "ActivityTypeGet": {
          "properties": {
            "CODIGOACTIVIDAD": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "ProductGet": {
          "properties": {
            "ID_ARTICULO": {
              "type": "string"
            },
            "CODIGO_PRODUCTO": {
              "type": "string"
            },
            "CODIGOS_BARRA": {
              "type": "string"
            },
            "NOMBRE": {
              "type": "string"
            },
            "DESCRIPCIONCORTA": {
              "type": "string"
            },
            "DESCRIPCIONLARGA": {
              "type": "string"
            },
            "ACTIVO": {
              "type": "boolean"
            },
            "CODIGO_RUBRO": {
              "type": "string"
            },
            "CODIGO_CATEGORIA": {
              "type": "string"
            },
            "DESCRIPCION_CATEGORIA": {
              "type": "string"
            },
            "CODIGO_MARCA": {
              "type": "string"
            },
            "DESCRIPCION_MARCA": {
              "type": "string"
            },
            "DESCRIPCION_UNIDADMEDIDA": {
              "type": "string"
            },
            "DESCRIPCION_EMPAQUE": {
              "type": "string"
            },
            "TALLES": {
              "type": "string"
            },
            "STOCKTOTAL": {
              "type": "number"
            },
            "STOCKTOTALDEPOSITO": {
              "type": "number"
            },
            "STOCKREALDEPOSITO": {
              "type": "number"
            },
            "STOCKPEDIDODEPOSITO": {
              "type": "number"
            },
            "STOCKFACTSINREMITIRDEPOSITO": {
              "type": "number"
            },
            "SIMBOLOMONEDA": {
              "type": "string"
            },
            "COTIZACIONMONEDA": {
              "type": "number"
            },
            "PRECIOVENTA": {
              "type": "number"
            },
            "PRECIOPROMOCION": {
              "type": "number"
            },
            "FECHAPROMOCIONDESDE": {
              "type": "string"
            },
            "FECHAPROMOCIONHASTA": {
              "type": "string"
            },
            "MONTOTOTALII": {
              "type": "number"
            },
            "COEFICIENTEIVA": {
              "type": "number"
            },
            "DESTACADOWEB": {
              "type": "boolean"
            },
            "PESO": {
              "type": "number"
            },
            "FOTO": {
              "type": "string"
            },
            "FECHAMODIFICACION": {
              "type": "string"
            },
            "TALLESELECCIONADO": {
              "type": "string"
            },
            "FRACCIONADO": {
              "type": "boolean"
            },
            "COEFICIENTECONVERSION": {
              "type": "number"
            },
            "PERMITESTOCKNEGATIVO": {
              "type": "boolean"
            },
            "ORDENTALLE": {
              "type": "string"
            },
            "ESPACK": {
              "type": "boolean"
            },
            "CANTIDADXBULTO": {
              "type": "number"
            },
            "MUESTRAWEB": {
              "type": "boolean"
            },
            "INNERPORBULTO": {
              "type": "number"
            },
            "VOLUMENARTICULO": {
              "type": "number",
              "format": "double"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetProductSize": {
          "properties": {
            "TALLE": {
              "type": "string"
            }
          }
        },
        "GetProductStock": {
          "properties": {
            "ESDEPOSITOLOCAL": {
              "type": "integer"
            },
            "DEPOSITO": {
              "type": "string"
            },
            "LOTE": {
              "type": "string"
            },
            "STOCKTOTAL": {
              "type": "number"
            }
          }
        },
        "ProductSyncImageGet": {
          "properties": {
            "error": {
              "type": "boolean"
            },
            "status": {
              "type": "number"
            },
            "totalcount": {
              "type": "number"
            }
          }
        },
        "OperationGet": {
          "properties": {
            "CODIGOOPERACION": {
              "type": "number"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "REQUIERECONFECCION": {
              "type": "integer"
            },
            "COMPROMETESTOCK": {
              "type": "integer"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetInventory": {
          "properties": {
            "ID_INVENTARIO": {
              "type": "number"
            },
            "FECHAINVENTARIO": {
              "type": "string"
            },
            "NOMBREINVENTARIO": {
              "type": "string"
            },
            "OBSERVACIONES": {
              "type": "string"
            },
            "CODIGODEPOSITO": {
              "type": "string"
            },
            "NOMBREDEPOSITO": {
              "type": "string"
            },
            "TOTALACONTAR": {
              "type": "number"
            },
            "TOTALCONTADO": {
              "type": "number"
            },
            "PORCENTAJEAVANCE": {
              "type": "number"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetProductsOfInventory": {
          "properties": {
            "CODIGOINVENTARIO": {
              "type": "number"
            },
            "NUMEROCORRELATIVO": {
              "type": "number"
            },
            "ID_ARTICULO": {
              "type": "string"
            },
            "LOTE": {
              "type": "string"
            },
            "CODIGO_PRODUCTO": {
              "type": "string"
            },
            "CODIGOBARRA": {
              "type": "string"
            },
            "NOMBRE": {
              "type": "string"
            },
            "DESCRIPCION_MARCA": {
              "type": "string"
            },
            "CONTADO": {
              "type": "boolean"
            },
            "CANTIDADINVENTARIADA": {
              "type": "string"
            },
            "CODIGORESPONSABLE": {
              "type": "string"
            },
            "RESPONSABLE": {
              "type": "string"
            },
            "CANTIDADCOLECTADA": {
              "type": "string"
            },
            "FRACCIONADO": {
              "type": "boolean"
            },
            "DESCRIPCION_EMPAQUE": {
              "type": "string"
            },
            "COEFICIENTECONVERSION": {
              "type": "number"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetState": {
          "properties": {
            "CODIGOPROVINCIA": {
              "type": "string"
            },
            "NOMBRE": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCityByState": {
          "properties": {
            "CODIGOPROVINCIA": {
              "type": "string"
            },
            "CODIGOLOCALIDAD": {
              "type": "string"
            },
            "NOMBRE": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCustomer": {
          "properties": {
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "CODIGOPARTICULAR": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "DOCUMENTO": {
              "type": "string"
            },
            "EMAIL": {
              "type": "string"
            },
            "ACTIVO": {
              "type": "integer"
            },
            "CONDICIONIVA": {
              "type": "string"
            },
            "CP": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "CELULAR": {
              "type": "string"
            },
            "BARRIO": {
              "type": "string"
            },
            "LOCALIDAD": {
              "type": "string"
            },
            "CODIGOPROVINCIA": {
              "type": "string"
            },
            "COMENTARIOS": {
              "type": "string"
            },
            "CODIGOMULTIPLAZO": {
              "type": "number"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCustomerBalance": {
          "properties": {
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "CODIGOPARTICULAR": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "PROVINCIA": {
              "type": "string"
            },
            "LOCALIDAD": {
              "type": "string"
            },
            "ZONA": {
              "type": "string"
            },
            "EMAIL": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "VENDEDOR": {
              "type": "string"
            },
            "COBRADOR": {
              "type": "string"
            },
            "SALDOTOTAL": {
              "type": "number"
            },
            "PONDERADODIAS": {
              "type": "number"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCustomerMovement": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number"
            },
            "FECHACOMPROBANTE": {
              "type": "string"
            },
            "HORACOMPROBANTE": {
              "type": "string"
            },
            "FECHAVENCIMIENTO": {
              "type": "string"
            },
            "COTIZACION": {
              "type": "number"
            },
            "CAMBIO": {
              "type": "number"
            },
            "MULTIPLAZO": {
              "type": "string"
            },
            "RESPONSABLE": {
              "type": "string"
            },
            "COBRADOR": {
              "type": "string"
            },
            "SIMBOLO": {
              "type": "string"
            },
            "CUENTACORRIENTE": {
              "type": "number"
            },
            "TOTAL": {
              "type": "number"
            },
            "PAGADO": {
              "type": "number"
            },
            "SALDO": {
              "type": "number"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetProvider": {
          "properties": {
            "CODIGOPROVEEDOR": {
              "type": "string"
            },
            "CODIGOPARTICULAR": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "EMAIL": {
              "type": "string"
            },
            "ACTIVO": {
              "type": "integer"
            },
            "CONDICIONIVA": {
              "type": "string"
            },
            "CP": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "BARRIO": {
              "type": "string"
            },
            "LOCALIDAD": {
              "type": "string"
            },
            "CODIGOPROVINCIA": {
              "type": "string"
            },
            "COMENTARIOS": {
              "type": "string"
            },
            "CODIGOMULTIPLAZO": {
              "type": "number"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetProviderBalance": {
          "properties": {
            "CODIGOPROVEEDOR": {
              "type": "string"
            },
            "CODIGOPARTICULAR": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "EMAIL": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "CLASEPROVEEDOR": {
              "type": "string"
            },
            "MULTIPLAZO": {
              "type": "string"
            },
            "SALDOTOTAL": {
              "type": "number"
            },
            "PONDERADODIAS": {
              "type": "number"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetProviderMovement": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number"
            },
            "FECHACOMPROBANTE": {
              "type": "string"
            },
            "HORACOMPROBANTE": {
              "type": "string"
            },
            "FECHAVENCIMIENTO": {
              "type": "string"
            },
            "COTIZACION": {
              "type": "number"
            },
            "CAMBIO": {
              "type": "number"
            },
            "MULTIPLAZO": {
              "type": "string"
            },
            "RESPONSABLE": {
              "type": "string"
            },
            "SIMBOLO": {
              "type": "string"
            },
            "CUENTACORRIENTE": {
              "type": "number"
            },
            "TOTAL": {
              "type": "number"
            },
            "PAGADO": {
              "type": "number"
            },
            "SALDO": {
              "type": "number"
            },
            "COMPROBANTESOPP": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetProviderPerception": {
          "properties": {
            "CODIGOPERCEPCION": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "TIPOPERCEPCION": {
              "type": "number"
            },
            "CUENTACONTABLE": {
              "type": "string"
            },
            "PORCENTAJEEXENCION": {
              "type": "number"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCard": {
          "properties": {
            "CODIGOTARJETA": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "CardPlan": {
          "required": [
            "name",
            "cardId"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "cantidad_cuotas": {
              "type": "string"
            },
            "rate": {
              "type": "string"
            },
            "special_rate": {
              "type": "string"
            },
            "fee_rate": {
              "type": "string"
            },
            "active": {
              "type": "string"
            },
            "late_payment": {
              "type": "string"
            },
            "only_business_days": {
              "type": "string"
            },
            "pay_day": {
              "type": "string"
            },
            "cut_day": {
              "type": "string"
            },
            "commission": {
              "type": "string"
            },
            "public_web": {
              "type": "string"
            },
            "price_list": {
              "type": "string"
            },
            "loyalty_rate": {
              "type": "string"
            }
          }
        },
        "GetPurchaseTax": {
          "properties": {
            "CODIGOTIPO": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "TIPODOCUMENTO": {
              "type": "string"
            },
            "DISCRIMINA": {
              "type": "integer"
            },
            "PORCENTAJEIVA": {
              "type": "number"
            },
            "DISCRIMINALIBROIVA": {
              "type": "integer"
            },
            "MUESTRALIBROIVA": {
              "type": "integer"
            },
            "REQUIERECUIT": {
              "type": "integer"
            },
            "ACTIVO": {
              "type": "integer"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetSaleTax": {
          "properties": {
            "CODIGOTIPO": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "TIPODOCUMENTO": {
              "type": "string"
            },
            "DISCRIMINA": {
              "type": "integer"
            },
            "PORCENTAJEIVA": {
              "type": "number"
            },
            "DISCRIMINALIBROIVA": {
              "type": "integer"
            },
            "MUESTRALIBROIVA": {
              "type": "integer"
            },
            "IMPRESORAFISCAL": {
              "type": "string"
            },
            "REQUIERECUIT": {
              "type": "integer"
            },
            "ACTIVO": {
              "type": "integer"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetPaymentMethod": {
          "properties": {
            "CODIGOMULTIPLAZO": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "INTERES": {
              "type": "number"
            },
            "RECARGO": {
              "type": "number"
            },
            "PERMITEEFECTIVO": {
              "type": "integer",
              "description": "descripcion de permite efectivo (SOLO ENTERPRISE)"
            },
            "PERMITETARJETA": {
              "type": "integer",
              "description": "descripcion de permite tarjeta (SOLO ENTERPRISE)"
            },
            "PERMITECHEQUES": {
              "type": "integer",
              "description": "descripcion de permite cheques (SOLO ENTERPRISE)"
            },
            "PERMITETRANSFERENCIASBANCARIAS": {
              "type": "integer",
              "description": "descripcion de permite transferencias bancarias (SOLO ENTERPRISE)"
            },
            "APLICAARTICULOSPROMOCION": {
              "type": "integer",
              "description": "descripcion de permite aplica articulos promocion (SOLO ENTERPRISE)"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetIdPaymentMethod": {
          "properties": {
            "CODIGOMULTIPLAZO": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "INTERES": {
              "type": "number"
            },
            "RECARGO": {
              "type": "number"
            },
            "PERMITEEFECTIVO": {
              "type": "integer",
              "description": "descripcion de permite efectivo (SOLO ENTERPRISE)"
            },
            "PERMITETARJETA": {
              "type": "integer",
              "description": "descripcion de permite tarjeta (SOLO ENTERPRISE)"
            },
            "PERMITECHEQUES": {
              "type": "integer",
              "description": "descripcion de permite cheques (SOLO ENTERPRISE)"
            },
            "PERMITETRANSFERENCIASBANCARIAS": {
              "type": "integer",
              "description": "descripcion de permite transferencias bancarias (SOLO ENTERPRISE)"
            },
            "APLICAARTICULOSPROMOCION": {
              "type": "integer",
              "description": "descripcion de permite aplica articulos promocion (SOLO ENTERPRISE)"
            },
            "DETALLES": {
              "type": "array",
              "description": "es necesario que el multiplazo contenga detalles",
              "items": {
                "type": "object",
                "properties": {
                  "CODIGOMULTIPLAZO": {
                    "type": "integer"
                  },
                  "NUMEROPLAZO": {
                    "type": "integer"
                  },
                  "PORCENTAJEMONTO": {
                    "type": "number",
                    "format": "double"
                  },
                  "DIASVENCIMIENTO": {
                    "type": "integer"
                  }
                }
              }
            }
          }
        },
        "GetEmploye": {
          "properties": {
            "CODIGOUSUARIO": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "PASSWORD1": {
              "type": "string"
            },
            "ACTIVO": {
              "type": "boolean"
            },
            "ESVENDEDOR": {
              "type": "boolean"
            },
            "ESCOBRADOR": {
              "type": "boolean"
            },
            "EMAIL": {
              "type": "string"
            },
            "TIPOACCESOWEB": {
              "type": "number"
            },
            "CODIGODEPOSITO": {
              "type": "string"
            },
            "DESCRIPCIONDEPOSITO": {
              "type": "string"
            },
            "CODIGOPERFIL": {
              "type": "string"
            },
            "DESCRIPCIONPERIL": {
              "type": "string"
            },
            "CARGO": {
              "type": "string"
            },
            "EMPRESA": {
              "type": "string"
            },
            "LOTETALLE": {
              "type": "string"
            },
            "CANTDIGITOSCODIGOARTICULO": {
              "type": "integer"
            },
            "CANTDIGITOSLOTETALLE": {
              "type": "integer"
            },
            "CODIGOCLIENTEPORDEFECTO": {
              "type": "string"
            },
            "CODIGOCAJA": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "CAJA": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "CODIGOPUNTOVENTA": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "PUNTOVENTA": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "CODIGOPUNTOVENTAAUX": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "PUNTOVENTAAUXILIAR": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "PERMITEFACTURAR": {
              "type": "boolean"
            },
            "CODIGOINTERNO": {
              "type": "string",
              "maxLength": 15,
              "description": "SOLO ENTERPRISE"
            },
            "CODIGOSUCURSAL_PUNTOVENTA": {
              "type": "string",
              "maxLength": 15,
              "description": "SOLO ENTERPRISE"
            },
            "SUCURSALASOCIADA": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/SucursalesExportacionGet"
              }
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetArea": {
          "properties": {
            "CODIGOZONA": {
              "type": "number"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetWarehouse": {
          "properties": {
            "CODIGODEPOSITO": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "UBICACION": {
              "type": "string"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "CLIENTE": {
              "type": "string"
            },
            "CODIGOPROVEEDOR": {
              "type": "string"
            },
            "PROVEEDOR": {
              "type": "string"
            },
            "PORCENTAJEDISTRIBUCION": {
              "type": "number"
            },
            "DEPOSITOVISIBLE": {
              "type": "integer"
            },
            "ACTIVO": {
              "type": "integer"
            },
            "CODIGOSUCURSAL": {
              "type": "string"
            },
            "SUCURSAL": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "Account": {
          "properties": {
            "CODIGOCUENTACONTABLE": {
              "type": "number"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "CUENTAMADRE": {
              "type": "number"
            },
            "IMPUTABLE": {
              "type": "boolean"
            },
            "INGRESOS": {
              "type": "boolean"
            },
            "EGRESOS": {
              "type": "boolean"
            },
            "PATRIMONIAL": {
              "type": "boolean"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCardPlan": {
          "properties": {
            "CODIGOTARJETA": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCurrency": {
          "properties": {
            "CODIGOMONEDA": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "SIMBOLO": {
              "type": "string"
            },
            "COTIZACION": {
              "type": "number"
            },
            "ESMONEDABASE": {
              "type": "integer"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCardPlans": {
          "properties": {
            "CODIGOTARJETA": {
              "type": "string"
            },
            "PLANTARJETA": {
              "type": "string"
            },
            "CANTIDADCUOTAS": {
              "type": "number"
            },
            "COEFICIENTE": {
              "type": "number"
            },
            "LISTASPRECIOS": {
              "description": "SOLO ENTERPRISE",
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "Perception": {
          "properties": {
            "CODIGOPERCEPCION": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "TIPOPERCEPCION": {
              "type": "number"
            },
            "CUENTACONTABLE": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "Brand": {
          "required": [
            "name"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "profit_margin_1": {
              "type": "number"
            },
            "profit_margin_2": {
              "type": "number"
            },
            "profit_margin_3": {
              "type": "number"
            },
            "profit_margin_4": {
              "type": "number"
            },
            "profit_margin_5": {
              "type": "number"
            },
            "publish_on_web": {
              "type": "integer"
            }
          }
        },
        "GetBrand": {
          "properties": {
            "CODIGOMARCA": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCategory": {
          "properties": {
            "CODIGOCATEGORIA": {
              "type": "string"
            },
            "ID_PADRE": {
              "type": "string"
            },
            "POSICION": {
              "type": "number"
            },
            "NOMBRE": {
              "type": "string"
            },
            "PUBLICAWEB": {
              "type": "integer"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetSize": {
          "properties": {
            "TALLE": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetStock": {
          "properties": {
            "ID_ARTICULO": {
              "type": "string"
            },
            "CODIGO_PRODUCTO": {
              "type": "string"
            },
            "TALLE": {
              "type": "string"
            },
            "NPRESERVADA": {
              "type": "number"
            },
            "STOCKREAL": {
              "type": "number"
            },
            "STOCKREMANENTE": {
              "type": "number"
            },
            "STOCKFACTSINREMITIR": {
              "type": "number"
            },
            "PENDIENTESRECEPCION": {
              "type": "number"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "BankAccount": {
          "required": [
            "account_number",
            "idBranch"
          ],
          "properties": {
            "idBranch": {
              "type": "number"
            },
            "account_number": {
              "type": "number"
            },
            "checkbook": {
              "type": "number"
            },
            "accounting_account": {
              "type": "number"
            },
            "balance": {
              "type": "number"
            },
            "currencyId": {
              "type": "string"
            },
            "bridge_account": {
              "type": "number"
            },
            "active": {
              "type": "boolean"
            },
            "loyalty_coefficient": {
              "type": "number"
            }
          }
        },
        "GetBankAccount": {
          "properties": {
            "NUMEROCUENTA": {
              "type": "string"
            },
            "NOMBREBANCO": {
              "type": "string"
            },
            "NOMBRESUCURSAL": {
              "type": "string"
            },
            "CODIGOBANCO": {
              "type": "string"
            },
            "CODIGOSUCURSALBANCO": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetBank": {
          "properties": {
            "CODIGOBANCO": {
              "type": "string"
            },
            "NOMBREBANCO": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "Bank": {
          "properties": {
            "bankId": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "bankBranchesId": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            }
          }
        },
        "BankPost": {
          "type": "object",
          "required": [
            "bankId",
            "name",
            "transaction_number"
          ],
          "properties": {
            "bankId": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "transaction_number": {
              "type": "integer"
            }
          }
        },
        "BankPut": {
          "type": "object",
          "required": [
            "name",
            "transaction_number"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "transaction_number": {
              "type": "integer"
            }
          }
        },
        "GetBranch": {
          "properties": {
            "NOMBREBANCO": {
              "type": "string"
            },
            "CODIGOSUCURSALBANCO": {
              "type": "string"
            },
            "NOMBRESUCURSAL": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "BranchesPost": {
          "required": [
            "idBranch",
            "name",
            "address"
          ],
          "properties": {
            "idBranch": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            }
          }
        },
        "Branch": {
          "required": [
            "name",
            "address"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            }
          }
        },
        "OrderProduct": {
          "required": [
            "product_id",
            "quantity",
            "unit_price"
          ],
          "properties": {
            "product_id": {
              "type": "string",
              "description": "CODIGOARTICULO"
            },
            "size": {
              "type": "string",
              "description": "LOTE"
            },
            "discount": {
              "type": "number",
              "description": "DESCUENTO"
            },
            "unit_price": {
              "type": "number",
              "description": "PRECIOUNITARIO"
            },
            "total_price": {
              "type": "number",
              "description": "se usa para calcular PRECIOUNITARIO"
            },
            "netPrice": {
              "type": "number",
              "description": "se usa para calcular PRECIOUNITARIO"
            },
            "totalPrice": {
              "type": "number",
              "description": "se usa para calcular PRECIOUNITARIO"
            },
            "quantity": {
              "type": "number",
              "description": "CANTIDAD"
            },
            "linked_voucher_type": {
              "type": "string",
              "description": "TIPOCOMPROBANTEVINCULADO",
              "nullable": true
            },
            "linked_voucher_number": {
              "type": "number",
              "description": "NUMEROCOMPROBANTEVINCULADO",
              "nullable": true
            },
            "linked_voucher_line": {
              "type": "number",
              "description": "LINEACOMPROBANTEVINCULADO",
              "nullable": true
            },
            "line_notes": {
              "type": "string",
              "description": "OBSERVACIONES",
              "nullable": true
            },
            "product_descriptions": {
              "type": "object",
              "required": [
                "overwrite_description"
              ],
              "properties": {
                "overwrite_description": {
                  "type": "number",
                  "description": "DESCRIPCION DE SOBREESCRIBIR LA DESCRIPCION DEL ARTICULO"
                },
                "descriptions": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "description": {
                        "type": "string",
                        "description": "DETALLE DEL ARTICULO QUE SE DESEA AGREGAR"
                      }
                    }
                  }
                }
              }
            },
            "equivalences": {
              "type": "number",
              "description": "si se coloca 1 toma el valor con la equivalencia que tenga el articulo con 0 lo toma como la cantidad enviada del articulo (SOLO CORRALON)"
            },
            "packaging_code": {
              "type": "string",
              "description": "Codigo de empaque (SOLO ENTERPRISE)"
            }
          }
        },
        "PaymentCash": {
          "required": [
            "currency",
            "amount",
            "quotationCash"
          ],
          "properties": {
            "currency": {
              "type": "object",
              "required": [
                "currencyId"
              ],
              "properties": {
                "currencyId": {
                  "type": "string",
                  "description": "CODIGOMONEDA"
                }
              }
            },
            "amount": {
              "type": "number",
              "description": "MONTO"
            },
            "quotationCash": {
              "type": "number",
              "description": "COTIZACION"
            }
          }
        },
        "PaymentCoupon": {
          "required": [
            "amount",
            "total",
            "idCoupon",
            "plan"
          ],
          "properties": {
            "plan": {
              "type": "object",
              "required": [
                "name",
                "card"
              ],
              "properties": {
                "name": {
                  "type": "string",
                  "description": "PLANTARJETA"
                },
                "card": {
                  "type": "object",
                  "required": [
                    "idCard"
                  ],
                  "properties": {
                    "idCard": {
                      "type": "string",
                      "description": "CODIGOTARJETA"
                    }
                  }
                }
              }
            },
            "amount": {
              "type": "number",
              "description": "MONTO"
            },
            "total": {
              "type": "number",
              "description": "TOTAL"
            },
            "idCoupon": {
              "type": "string",
              "description": "NUMERO"
            },
            "automaticManagement": {
              "type": "integer",
              "description": "GESTIONAUTOMATICA (0 = MANUAL, 1 = AUTOMATICA)"
            }
          }
        },
        "PaymentWireTransfer": {
          "type": "object",
          "required": [
            "bankAccount",
            "amount",
            "comments"
          ],
          "properties": {
            "bankAccount": {
              "type": "object",
              "required": [
                "idBankAccount",
                "bankBranch"
              ],
              "properties": {
                "idBankAccount": {
                  "type": "string",
                  "description": "NUMEROCUENTA"
                },
                "bankBranch": {
                  "type": "object",
                  "required": [
                    "idBankBranch",
                    "bank"
                  ],
                  "properties": {
                    "idBankBranch": {
                      "type": "string",
                      "description": "CODIGOSUCURSALBANCO"
                    },
                    "bank": {
                      "required": [
                        "idBank"
                      ],
                      "type": "object",
                      "properties": {
                        "idBank": {
                          "type": "string",
                          "description": "CODIGOBANCO"
                        }
                      }
                    }
                  }
                }
              }
            },
            "amount": {
              "type": "number",
              "description": "MONTO"
            },
            "comments": {
              "type": "string",
              "description": "COMENTARIO",
              "nullable": true
            }
          }
        },
        "PaymentCheck": {
          "type": "object",
          "required": [
            "bankBranch",
            "amount",
            "comments",
            "idCheck",
            "dateCheck",
            "dateClearing",
            "own",
            "common",
            "accountHolder",
            "cuitHolder"
          ],
          "properties": {
            "bankBranch": {
              "type": "object",
              "required": [
                "idBankBranch",
                "bank"
              ],
              "properties": {
                "idBankBranch": {
                  "type": "string",
                  "description": "CODIGOSUCURSALBANCO"
                },
                "bank": {
                  "type": "object",
                  "required": [
                    "idBank"
                  ],
                  "properties": {
                    "idBank": {
                      "type": "string",
                      "description": "CODIGOBANCO"
                    }
                  }
                }
              }
            },
            "amount": {
              "type": "number",
              "description": "MONTO"
            },
            "comments": {
              "type": "string",
              "description": "COMENTARIOS"
            },
            "idCheck": {
              "type": "string",
              "description": "Parte final del numero de cheque"
            },
            "dateCheck": {
              "type": "string",
              "description": "FECHACHEQUE"
            },
            "dateClearing": {
              "type": "string",
              "description": "FECHACLEARING"
            },
            "own": {
              "type": "integer",
              "description": "CHEQUEPROPIO (SOLO 0 o 1)"
            },
            "common": {
              "type": "integer",
              "description": "CHEQUECOMUN (SOLO 0 o 1)"
            },
            "accountHolder": {
              "type": "string",
              "description": "NOMBRETITULAR"
            },
            "cuitHolder": {
              "type": "string",
              "description": "CUIT_TITULAR"
            }
          }
        },
        "Order": {
          "properties": {
            "FECHACOMPROBANTE": {
              "type": "string"
            },
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "TOTAL": {
              "type": "number"
            },
            "NOMBREUSUARIO": {
              "type": "string"
            },
            "DEPOSITO": {
              "type": "string"
            },
            "OBSERVACIONES": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "ENTREGAR": {
              "type": "integer"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "OrderDetail": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number"
            },
            "FECHACOMPROBANTE": {
              "type": "string"
            },
            "FECHAENTREGA": {
              "type": "string"
            },
            "FECHATERMINADA": {
              "type": "string"
            },
            "CODIGOPARTICULAR": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "OPERACION": {
              "type": "string"
            },
            "CONDICIONIVA": {
              "type": "string"
            },
            "CONDICIONVENTA": {
              "type": "string"
            },
            "VENDEDOR": {
              "type": "string"
            },
            "RESPONSABLE": {
              "type": "string"
            },
            "TOTAL": {
              "type": "number"
            },
            "ANULADA": {
              "type": "integer"
            },
            "COMENTARIOS": {
              "type": "string"
            },
            "FORMAPAGO": {
              "type": "string"
            },
            "MONEDA": {
              "type": "string"
            },
            "COTIZACION": {
              "type": "number"
            },
            "DESCUENTOPORCENTAJE": {
              "type": "number"
            },
            "DESCUENTOMONTO": {
              "type": "number"
            },
            "DESCUENTODESCRIPCION": {
              "type": "string"
            },
            "IVA1": {
              "type": "number"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "CODIGOUSUARIO": {
              "type": "string"
            },
            "CODIGOTECNICO": {
              "type": "string"
            },
            "CODIGOMULTIPLAZO": {
              "type": "integer"
            },
            "TIPOIVA": {
              "type": "string"
            },
            "MONTOTOTALII": {
              "type": "number",
              "format": "double",
              "description": "SOLO ENTERPRISE"
            },
            "DETALLE": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "LINEA": {
                    "type": "number"
                  },
                  "CODIGOPARTICULAR": {
                    "type": "string"
                  },
                  "DESCRIPCION": {
                    "type": "string"
                  },
                  "CANTIDAD": {
                    "type": "number"
                  },
                  "CANTIDADREMITIDA": {
                    "type": "number"
                  },
                  "PENDIENTE": {
                    "type": "number"
                  },
                  "CANTIDADPREPARADA": {
                    "type": "number"
                  },
                  "DESCUENTO": {
                    "type": "number"
                  },
                  "PRECIOUNITARIO": {
                    "type": "number"
                  },
                  "PRECIOTOTAL": {
                    "type": "number"
                  },
                  "GARANTIA": {
                    "type": "number"
                  },
                  "LOTE": {
                    "type": "string"
                  },
                  "DESCRIPCIONEMPAQUE": {
                    "type": "string"
                  },
                  "COEFICIENTECONVERSION": {
                    "type": "number"
                  },
                  "OBSERVACIONES": {
                    "type": "string"
                  },
                  "PORCENTAJEIVA": {
                    "type": "number"
                  },
                  "MONTOII": {
                    "type": "number",
                    "description": "SOLO ENTERPRISE"
                  }
                }
              }
            }
          }
        },
        "CreateOrder": {
          "properties": {
            "cart": {
              "type": "object",
              "required": [
                "currency_id",
                "user_id",
                "warehouse_id",
                "date",
                "payment_method_id",
                "paymentsDetail",
                "customer",
                "products"
              ],
              "properties": {
                "total": {
                  "type": "number",
                  "format": "double",
                  "description": "TOTAL DEL COMPROBANTE"
                },
                "notes": {
                  "type": "string",
                  "description": "COMENTARIOS de CABEZAPRESUPUESTOS"
                },
                "price_list_id": {
                  "type": "string",
                  "description": "LISTAPRECIO de CABEZAPRESUPUESTOS (NULLABLE PARA CORRALON)"
                },
                "operation_type_id": {
                  "type": "string",
                  "description": "CODIGOOPERACION de CABEZAPRESUPUESTOS (SOLO ENTERPRISE)"
                },
                "type": {
                  "type": "string",
                  "description": "TIPOCOMPROBANTE (Es requerido para PR y FC)"
                },
                "warehouse_id": {
                  "type": "string",
                  "description": "CODIGODEPOSITO de CUERPOPEDIDOS"
                },
                "date": {
                  "type": "string",
                  "description": "FECHACOMPROBANTE de CABEZAPRESUPUESTOS y CABEZAPEDIDOS (En caso de que la factura se envíe null se inserta la fecha del momento)"
                },
                "expirationdate": {
                  "type": "string",
                  "description": "Descripcion de la fecha de vencimiento, para NP lo agrega como fechaentrega si no se envia toma la fecha del comprobante y le suma el valor configurado de entrega; para el caso de PR lo agrega como fechavencimiento y si no se envia hace lo mismo que NP para sumarle los dias de vencimientos configurados; para el caso FC si no se manda toma el vencimiento del detallemultiplazo."
                },
                "user_id": {
                  "type": "string",
                  "description": "CODIGOUSUARIO, CODIGOUSUARIO2, CODIGORESPONSABLE (CODIGOUSUARIOAPROBACION EN ENTERPRISE y CODIGOUSUARIOENVIADO EN CORRALON) de CABEZAPRESUPUESTOS"
                },
                "currency_id": {
                  "type": "string",
                  "description": "CODIGOMONEDA de CABEZAPRESUPUESTOS y CABEZAPEDIDOS"
                },
                "general_discount": {
                  "type": "string",
                  "description": "DESCUENTOPORCENTAJE de CABEZAPRESUPUESTOS y CABEZAPEDIDOS EN ENTERPRISE (SI EL VALOR ES NEGATIVO ES UN DESCUENTO, SI EL VALOR ES POSITIVO ES UN INTERES) Y DESCUENTOFPAGO de CABEZAPRESUPUESTOS y CABEZAPEDIDOS EN CORRALON (ES REQUERIDO PARA EL TIPO DE COMPROBANTE FC)"
                },
                "payment_method_id": {
                  "type": "string",
                  "description": "CODIGOMULTIPLAZO de CABEZAPRESUPUESTOS y CABEZAPEDIDOS"
                },
                "deliver": {
                  "type": "number",
                  "description": "ENTREGAR de CABEZAPEDIDOS"
                },
                "stockpiling_id": {
                  "type": "number",
                  "description": "ACOPIO QUE PUEDE TENER ASIGNADO CLIENTE (OPCIONAL Y SOLO CORRALON)"
                },
                "sendtocashregister": {
                  "type": "number",
                  "description": "Enviado a caja solo para CRLN"
                },
                "authorized": {
                  "type": "number",
                  "description": "SOLO PARA CRLN autoriza NP si el cliente tiene permisos"
                },
                "deliverytypecode": {
                  "type": "integer",
                  "description": "CODIGO TIPO ENTREGA (SOLO CORRALON)"
                },
                "distance": {
                  "type": "number",
                  "description": "DISTANCIA KM TIPO ENTREGA (SOLO CORRALON)"
                },
                "transport_id": {
                  "type": "integer",
                  "description": "Descripcion del codigo transporte (SOLO ENTERPRISE, En caso de no enviar dicho campo su valor será el que tenga el cliente. Se puede enviar comillas vacias y se insertará -1 como lo hace el ERP. Se considerara el valor de este en caso de usarse el objeto de deliverydata , cuya version debe ser igual o mayor a 03.36.001.0001.00)"
                },
                "saleType": {
                  "type": "integer",
                  "description": "CONTADO 0 - CUENTACORRIENTE 1"
                },
                "customer": {
                  "type": "object",
                  "required": [
                    "name",
                    "state_id",
                    "phone",
                    "address"
                  ],
                  "properties": {
                    "notes": {
                      "type": "string",
                      "description": "COMENTARIOS"
                    },
                    "vat_number": {
                      "type": "string",
                      "description": "CUIT"
                    },
                    "id": {
                      "type": "string",
                      "description": "CODIGOCLIENTE (Se debe mandar en caso de querer actualizar el cliente)"
                    },
                    "name": {
                      "type": "string",
                      "description": "RAZONSOCIAL"
                    },
                    "address": {
                      "type": "string",
                      "description": "DIRECCION"
                    },
                    "state_id": {
                      "type": "string",
                      "description": "CODIGOPROVINCIA"
                    },
                    "city": {
                      "type": "string",
                      "description": "LOCALIDAD"
                    },
                    "neighborhood": {
                      "type": "string",
                      "description": "BARRIO (Es requerido en Corralon)"
                    },
                    "user_id": {
                      "type": "string",
                      "description": "CODIGOVENDEDOR o CODIGOCOBRADOR"
                    },
                    "price_list_id": {
                      "type": "string",
                      "description": "CODIGOLISTA"
                    },
                    "phone": {
                      "type": "string",
                      "description": "TELEFONO"
                    },
                    "cell_phone": {
                      "type": "string",
                      "description": "CELULAR (A partir de la version 03.39.001.0004.00 el dato se guarda en el campo TELEFONOCELULAR)"
                    },
                    "sales_tax_group_id": {
                      "type": "string",
                      "description": "CONDICIONIVA (En Corralon es requerido en caso de que no se mande el parametro id)"
                    },
                    "document_id": {
                      "type": "string",
                      "description": "DOCUMENTO EN ENTERPRISE Y DNI EN CORRALON"
                    },
                    "email": {
                      "type": "string",
                      "description": "EMAIL"
                    },
                    "zipcode": {
                      "type": "string",
                      "description": "CP (codigo postal)"
                    },
                    "activity_id": {
                      "type": "string",
                      "description": "CODIGOACTIVIDAD"
                    },
                    "grossincome": {
                      "type": "string",
                      "description": "INGRESOSBRUTOS"
                    },
                    "account": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de la cuenta corriente"
                    },
                    "creditLimit": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite de credito (este campo es requerido si account = 1, solo para ENTERPRISE)"
                    },
                    "creditLimitDoc": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite de credito doc (este campo es requerido si account = 1, solo para ENTERPRISE)"
                    },
                    "payment_method_id": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite del codigo del multiplazo(este campo es requerido si account = 1, solo para ENTERPRISE)"
                    },
                    "credit_amount_req": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del monto del credito solicitado (solo para ENTERPRISE)"
                    },
                    "fixed_payment_method": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion del multiplazo fijo (solo para ENTERPRISE)"
                    },
                    "account_disabled": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de deshabilitar la cuenta corriente  (solo para ENTERPRISE)"
                    },
                    "expired_days": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de dias vencidos (solo para ENTERPRISE)"
                    },
                    "promotion_bill": {
                      "type": "integer",
                      "description": "descripcion de ofertas facturables (solo 0 o 1)"
                    }
                  }
                },
                "products": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "$ref": "#/components/schemas/OrderProduct"
                  }
                },
                "paymentsDetail": {
                  "type": "object",
                  "description": "este campo SOLO es requerido si el tipo (type) de orden es FC (Factura) SOLO ENTERPRISE",
                  "properties": {
                    "cash": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCash"
                      }
                    },
                    "coupon": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCoupon"
                      }
                    },
                    "wireTransfer": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentWireTransfer"
                      }
                    },
                    "checks": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCheck"
                      }
                    }
                  }
                },
                "deliverydata": {
                  "type": "object",
                  "description": "(SOLO ENTERPRISE, EL OBJETO NO ES OBLIGATORIO PERO EN CASO DE UTILIZARSE DEBE RESPETARSE LOS CAMPOS REQUERIDOS)",
                  "required": [
                    "deliverytypecode",
                    "address",
                    "codezone",
                    "locationcode",
                    "state_id"
                  ],
                  "properties": {
                    "deliverytypecode": {
                      "type": "integer"
                    },
                    "address": {
                      "type": "string"
                    },
                    "neighborhood": {
                      "type": "string"
                    },
                    "codezone": {
                      "type": "integer"
                    },
                    "phone1contact": {
                      "type": "string"
                    },
                    "phone2contact": {
                      "type": "string"
                    },
                    "agreeddate": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "agreedtime": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "responsiblereception": {
                      "type": "string"
                    },
                    "observations": {
                      "type": "string"
                    },
                    "neighborhoodcode": {
                      "type": "integer"
                    },
                    "locationcode": {
                      "type": "string"
                    },
                    "worknumber": {
                      "type": "integer"
                    },
                    "bylogistics": {
                      "type": "integer"
                    },
                    "zipcode": {
                      "type": "string",
                      "description": "SOLO ENTERPRISE"
                    },
                    "date_init": {
                      "type": "string",
                      "format": "format-date",
                      "description": "SOLO ENTERPRISE"
                    },
                    "customer_id": {
                      "type": "string",
                      "description": "SOLO ENTERPRISE"
                    },
                    "branch_id": {
                      "type": "string",
                      "description": "SOLO ENTERPRISE"
                    },
                    "branch": {
                      "type": "string",
                      "description": "SOLO ENTERPRISE"
                    },
                    "state_id": {
                      "type": "string",
                      "description": "SOLO ENTERPRISE"
                    },
                    "timefrom": {
                      "type": "string",
                      "format": "time-date",
                      "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
                    },
                    "timeto": {
                      "type": "string",
                      "format": "time-date",
                      "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
                    },
                    "email": {
                      "type": "string",
                      "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0003.00 O SUPERIOR"
                    }
                  }
                },
                "geolocation": {
                  "type": "object",
                  "properties": {
                    "latitude": {
                      "type": "string",
                      "nullable": true
                    },
                    "length": {
                      "type": "string",
                      "nullable": true
                    }
                  }
                },
                "multiforms": {
                  "type": "object",
                  "description": "SOLO CORRALON",
                  "properties": {
                    "checks": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/MultiformsChecks"
                      }
                    },
                    "accountingsaccounts": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/MultiformsAccountingsaccounts"
                      }
                    },
                    "cashs": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/MultiformsCashs"
                      }
                    },
                    "cards": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/MultiformsCards"
                      }
                    },
                    "transfers": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/MultiformsTransfers"
                      }
                    }
                  }
                },
                "vouchersauthorizations": {
                  "type": "array",
                  "description": "SOLO CORRALON",
                  "items": {
                    "type": "object",
                    "properties": {
                      "usercode": {
                        "type": "string",
                        "nullable": true
                      }
                    }
                  }
                },
                "cae": {
                  "type": "object",
                  "description": "SOLO es requerido si el tipo (type) de orden es FC (Factura)",
                  "required": [
                    "numberCae",
                    "dateExpired",
                    "dateRequested"
                  ],
                  "properties": {
                    "numberCae": {
                      "type": "string"
                    },
                    "dateExpired": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "dateRequested": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "afipResponse": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        },
        "MultiformsChecks": {
          "type": "object",
          "properties": {
            "dayssince": {
              "type": "integer"
            },
            "daysuntil": {
              "type": "integer"
            },
            "percentage": {
              "type": "number",
              "format": "double"
            },
            "totalamount": {
              "type": "number",
              "format": "double"
            }
          }
        },
        "MultiformsAccountingsaccounts": {
          "type": "object",
          "properties": {
            "multiplacecode": {
              "type": "integer"
            },
            "percentage": {
              "type": "number",
              "format": "double"
            },
            "totalamount": {
              "type": "number",
              "format": "double"
            }
          }
        },
        "MultiformsCashs": {
          "type": "object",
          "properties": {
            "coincode": {
              "type": "string"
            },
            "quotation": {
              "type": "number",
              "format": "double"
            },
            "percentage": {
              "type": "number",
              "format": "double"
            },
            "totalamount": {
              "type": "number",
              "format": "double"
            }
          }
        },
        "MultiformsCards": {
          "type": "object",
          "properties": {
            "cardcode": {
              "type": "string"
            },
            "cardplan": {
              "type": "string"
            },
            "percentage": {
              "type": "number",
              "format": "double"
            },
            "totalamount": {
              "type": "number",
              "format": "double"
            }
          }
        },
        "MultiformsTransfers": {
          "type": "object",
          "properties": {
            "bankcode": {
              "type": "string"
            },
            "bankbranchcode": {
              "type": "string"
            },
            "account": {
              "type": "string"
            },
            "percentage": {
              "type": "number",
              "format": "double"
            },
            "totalamount": {
              "type": "number",
              "format": "double"
            }
          }
        },
        "GetCompany": {
          "type": "object",
          "properties": {
            "CODIGOSUCURSAL": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "NOMBREFANTASIA": {
              "type": "string"
            },
            "FORMAACCESO": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetBudget": {
          "type": "object",
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "FECHAVENCIMIENTO": {
              "type": "string"
            },
            "FECHAAPROBADO": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "FECHACOMPROBANTE": {
              "type": "string"
            },
            "COMENTARIOS": {
              "type": "string"
            },
            "OPERACION": {
              "type": "string",
              "description": "solo para enterprise"
            },
            "ANULADA": {
              "type": "number"
            },
            "CONDICIONIVA": {
              "type": "string"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "CODIGOMULTIPLAZO": {
              "type": "integer"
            },
            "CONDICIONVENTA": {
              "type": "string"
            },
            "VENDEDOR": {
              "type": "string"
            },
            "RESPONSABLE": {
              "type": "string"
            },
            "MONEDA": {
              "type": "string"
            },
            "IVA1": {
              "type": "string"
            },
            "CANTIDADPENDIENTE": {
              "type": "number"
            },
            "TOTALORIGINAL": {
              "type": "number"
            },
            "TOTALPENDIENTE": {
              "type": "number"
            },
            "OBSERVACIONESLINEA": {
              "type": "string"
            },
            "ESTADO": {
              "type": "string"
            },
            "CODIGOVENDEDOR": {
              "description": "descripcion de codigo vendedor (SOLO CORRALON)",
              "type": "string"
            },
            "CODIGORESPONSABLE": {
              "description": "descripcion de codigo responsable (SOLO CORRALON)",
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetRefreshToken": {
          "type": "object",
          "properties": {
            "token": {
              "type": "string"
            },
            "expireIn": {
              "type": "number"
            },
            "refreshToken": {
              "type": "string"
            },
            "refreshExpireIn": {
              "type": "number"
            }
          }
        },
        "RefreshToken": {
          "type": "object",
          "required": [
            "refreshToken"
          ],
          "properties": {
            "refreshToken": {
              "type": "string"
            }
          }
        },
        "Vouchers": {
          "required": [
            "vouchertype",
            "vouchernumber",
            "amount"
          ],
          "type": "object",
          "properties": {
            "vouchertype": {
              "type": "string"
            },
            "vouchernumber": {
              "type": "number"
            },
            "amount": {
              "type": "number",
              "description": "Monto a abonar del comprobante. (Al cual se aplicara el descuento si corresponde)"
            },
            "discount": {
              "type": "number",
              "description": "Porcentaje de descuento que se aplicara sobre el monto especificado en `vouchers.amount` (SOLO CORRALON)"
            }
          }
        },
        "Payment": {
          "type": "object",
          "properties": {
            "payment": {
              "type": "object",
              "required": [
                "clientcode",
                "date",
                "amount",
                "usercode",
                "vouchers",
                "paymentDetails"
              ],
              "properties": {
                "clientcode": {
                  "type": "string"
                },
                "date": {
                  "type": "string"
                },
                "amount": {
                  "type": "number"
                },
                "usercode": {
                  "type": "string"
                },
                "observations": {
                  "type": "string"
                },
                "vouchers": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Vouchers"
                  }
                },
                "paymentDetails": {
                  "type": "object",
                  "description": "SOLO ENTERPRISE",
                  "required": [
                    "cash",
                    "wireTransfer",
                    "checks"
                  ],
                  "properties": {
                    "cash": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/PaymentCash"
                      }
                    },
                    "wireTransfer": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/PaymentWireTransfer"
                      }
                    },
                    "checks": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/PaymentCheck"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "GetCashRegister": {
          "properties": {
            "FECHA": {
              "type": "string"
            },
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number"
            },
            "IMPORTE": {
              "type": "number"
            },
            "CODIGOMONEDA": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "COTIZACION": {
              "type": "number"
            },
            "CODCAJA": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCardRegister": {
          "properties": {
            "FECHA": {
              "type": "string"
            },
            "TARJETA": {
              "type": "string"
            },
            "CUOTAS": {
              "type": "number"
            },
            "NUMEROCUPON": {
              "type": "string"
            },
            "IMPORTE": {
              "type": "number"
            },
            "CODIGOAUTORIZACION": {
              "type": "string"
            },
            "CODCAJA": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetTransferRegister": {
          "properties": {
            "FECHA": {
              "type": "string"
            },
            "BANCO": {
              "type": "string"
            },
            "SUCURSAL": {
              "type": "string"
            },
            "NUMEROCUENTA": {
              "type": "string"
            },
            "IMPORTE": {
              "type": "number"
            },
            "CODIGOMONEDA": {
              "type": "string"
            },
            "DESCRIPCIONMONEDA": {
              "type": "string"
            },
            "COTIZACION": {
              "type": "number"
            },
            "CODCAJA": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "GetCheckRegister": {
          "properties": {
            "FECHA": {
              "type": "string"
            },
            "NUMEROCHEQUE": {
              "type": "string"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "CLIENTE": {
              "type": "string"
            },
            "IMPORTE": {
              "type": "number"
            },
            "CODCAJA": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "AffectedRows": {
          "type": "object",
          "properties": {
            "AFFECTED_ROWS": {
              "type": "integer",
              "description": "Valor asiganado al requerimiento",
              "minimum": 1
            }
          }
        },
        "GetDeliveryData": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double"
            },
            "CODIGOTIPOIENTREGA": {
              "type": "integer"
            },
            "DIRECCION": {
              "type": "string"
            },
            "BARRIO": {
              "type": "string"
            },
            "LOCALIDAD": {
              "type": "string"
            },
            "CODIGOZONA": {
              "type": "integer"
            },
            "TELEFONO1CONTACTO": {
              "type": "string"
            },
            "TELEFONO2CONTACTO": {
              "type": "string"
            },
            "FECHAPACTADA": {
              "type": "string",
              "format": "time-date"
            },
            "HORAPACTADA": {
              "type": "string",
              "format": "time-date"
            },
            "RESPONSABLERECEPCION": {
              "type": "string"
            },
            "OBSERVACIONES": {
              "type": "string"
            },
            "CODIGOBARRIO": {
              "type": "integer"
            },
            "CODIGOLOCALIDAD": {
              "type": "string"
            },
            "NUMEROOBRA": {
              "type": "integer"
            },
            "DISTANCIA": {
              "type": "number",
              "format": "double",
              "description": "SOLO CORRALON"
            },
            "CODIGOARTICULOFLETE": {
              "type": "string",
              "description": "SOLO CORRALON"
            },
            "PORLOGISTICA": {
              "type": "integer",
              "description": "SOLO ENTERPRISE"
            },
            "CODIGOPOSTAL": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "FECHAALTA": {
              "type": "string",
              "format": "time-date",
              "description": "SOLO ENTERPRISE"
            },
            "CODIGOCLIENTE": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "CODIGOSUCURSAL": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "SUCURSAL": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "CODIGOPROVINCIA": {
              "type": "string",
              "description": "SOLO ENTERPRISE"
            },
            "CODIGOTRANSPORTE": {
              "type": "integer",
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "HORADESDE": {
              "type": "string",
              "format": "time-date",
              "nullable": true,
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "HORAHASTA": {
              "type": "string",
              "format": "time-date",
              "nullable": true,
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "EMAIL": {
              "type": "string",
              "nullable": true,
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0003.00 O SUPERIOR"
            }
          }
        },
        "Checks": {
          "properties": {
            "dayssince": {
              "type": "integer"
            },
            "daysuntil": {
              "type": "integer"
            },
            "percentage": {
              "type": "integer"
            },
            "totalamount": {
              "type": "integer"
            }
          }
        },
        "AccountingsAccounts": {
          "properties": {
            "multiplacecode": {
              "type": "integer"
            },
            "percentage": {
              "type": "integer"
            },
            "totalamount": {
              "type": "integer"
            }
          }
        },
        "Cashs": {
          "properties": {
            "coincode": {
              "type": "string"
            },
            "quotation": {
              "type": "integer"
            },
            "percentage": {
              "type": "integer"
            },
            "totalamount": {
              "type": "integer"
            }
          }
        },
        "Cards": {
          "properties": {
            "cardcode": {
              "type": "string"
            },
            "cardplan": {
              "type": "string"
            },
            "percentage": {
              "type": "integer"
            },
            "totalamount": {
              "type": "integer"
            }
          }
        },
        "Wiretransfers": {
          "properties": {
            "bankcode": {
              "type": "string"
            },
            "bankbranchcode": {
              "type": "string"
            },
            "account": {
              "type": "string"
            },
            "percentage": {
              "type": "integer"
            },
            "totalamount": {
              "type": "integer"
            }
          }
        },
        "VouchersAuthorizations": {
          "properties": {
            "authorizationcode": {
              "type": "integer"
            },
            "usercode": {
              "type": "string"
            },
            "statecode": {
              "type": "integer"
            },
            "transactionnumber": {
              "type": "integer"
            }
          }
        },
        "GetItemsDiscount": {
          "properties": {
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "PORCENTAJEDESCUENTO": {
              "type": "number"
            },
            "FECHAMODIFICACION": {
              "type": "string"
            },
            "NUMERTRANSACCION": {
              "type": "number"
            },
            "CODIGORUBRO": {
              "type": "string"
            },
            "RUBRO": {
              "type": "string"
            }
          }
        },
        "GetItemsBrand": {
          "properties": {
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "PORCENTAJEDESCUENTO": {
              "type": "number"
            },
            "FECHAMODIFICACION": {
              "type": "string"
            },
            "NUMERTRANSACCION": {
              "type": "number"
            },
            "CODIGOMARCA": {
              "type": "string"
            },
            "MARCA": {
              "type": "string"
            }
          }
        },
        "GetItemsArticle": {
          "properties": {
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "PORCENTAJEDESCUENTO": {
              "type": "number"
            },
            "FECHAMODIFICACION": {
              "type": "string"
            },
            "NUMERTRANSACCION": {
              "type": "number"
            },
            "CODIGOARTICULO": {
              "type": "string"
            },
            "ARTICULO": {
              "type": "string"
            }
          }
        },
        "GetCustomerAll": {
          "properties": {
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "CODIGOPARTICULAR": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "DOCUMENTO": {
              "type": "string"
            },
            "EMAIL": {
              "type": "string"
            },
            "ACTIVO": {
              "type": "integer"
            },
            "CONDICIONIVA": {
              "type": "string"
            },
            "CP": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "CELULAR": {
              "type": "string",
              "description": "A partir de la version 03.39.001.0004.00 el dato lo trae del campo TELEFONOCELULAR"
            },
            "BARRIO": {
              "type": "string"
            },
            "LOCALIDAD": {
              "type": "string"
            },
            "CODIGOPROVINCIA": {
              "type": "string"
            },
            "COMENTARIOS": {
              "type": "string"
            },
            "CODIGOMULTIPLAZO": {
              "type": "number"
            },
            "CODIGOCLIENTEWEB": {
              "type": "string"
            },
            "CLAVEWEB": {
              "type": "string"
            },
            "CODIGOVENDEDOR": {
              "type": "string"
            },
            "VENDEDOR": {
              "type": "string"
            },
            "VENDEDORFIJO": {
              "type": "integer"
            },
            "CODIGOCOBRADOR": {
              "type": "string"
            },
            "COBRADOR": {
              "type": "string"
            },
            "COBRADORFIJO": {
              "type": "integer"
            },
            "CODIGOACTIVIDAD": {
              "type": "string"
            },
            "INGRESOSBRUTOS": {
              "type": "string"
            },
            "BONIFICACIONGENERAL": {
              "type": "number"
            },
            "BONIFICACIONADICIONAL": {
              "type": "number",
              "description": "SOLO PARA CORRALON"
            },
            "PRECIOSNETOS": {
              "type": "integer",
              "description": "SOLO PARA CORRALON (SOLO 0 o 1)"
            },
            "CUENTACORRIENTE": {
              "type": "integer"
            },
            "PROVINCIA": {
              "type": "string"
            },
            "LISTAFIJA": {
              "type": "integer"
            },
            "CODIGOLISTA": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "ProductGetAll": {
          "properties": {
            "ID_ARTICULO": {
              "type": "string"
            },
            "CODIGO_PRODUCTO": {
              "type": "string"
            },
            "CODIGOS_BARRA": {
              "type": "string"
            },
            "NOMBRE": {
              "type": "string"
            },
            "DESCRIPCIONCORTA": {
              "type": "string"
            },
            "DESCRIPCIONLARGA": {
              "type": "string"
            },
            "ACTIVO": {
              "type": "integer"
            },
            "CODIGO_RUBRO": {
              "type": "string"
            },
            "DESCRIPCION_RUBRO": {
              "type": "string"
            },
            "CODIGOSUPERRUBRO": {
              "type": "string"
            },
            "DESCRIPCION_SUPERRUBRO": {
              "type": "string"
            },
            "CODIGOGRUPOSUPERRUBRO": {
              "type": "string"
            },
            "DESCRIPCION_GRUPORUBRO": {
              "type": "string"
            },
            "CODIGO_CATEGORIA": {
              "type": "string"
            },
            "DESCRIPCION_CATEGORIA": {
              "type": "string"
            },
            "CODIGO_MARCA": {
              "type": "string"
            },
            "DESCRIPCION_MARCA": {
              "type": "string"
            },
            "DESCRIPCION_UNIDADMEDIDA": {
              "type": "string"
            },
            "DESCRIPCION_EMPAQUE": {
              "type": "string"
            },
            "TALLES": {
              "type": "string"
            },
            "STOCKTOTAL": {
              "type": "number"
            },
            "STOCKTOTALDEPOSITO": {
              "type": "number"
            },
            "STOCKREALDEPOSITO": {
              "type": "number"
            },
            "STOCKPEDIDODEPOSITO": {
              "type": "number"
            },
            "STOCKFACTSINREMITIRDEPOSITO": {
              "type": "number"
            },
            "SIMBOLOMONEDA": {
              "type": "string"
            },
            "COTIZACIONMONEDA": {
              "type": "number"
            },
            "PRECIOVENTA": {
              "type": "number",
              "format": "double"
            },
            "PRECIOPROMOCION": {
              "type": "number"
            },
            "FECHAPROMOCIONDESDE": {
              "type": "string",
              "format": "date-time"
            },
            "FECHAPROMOCIONHASTA": {
              "type": "string",
              "format": "date-time"
            },
            "MONTOTOTALII": {
              "type": "number"
            },
            "COEFICIENTEIVA": {
              "type": "number",
              "format": "double"
            },
            "DESTACADOWEB": {
              "type": "integer"
            },
            "PESO": {
              "type": "number"
            },
            "FOTO": {
              "type": "string"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time"
            },
            "TALLESELECCIONADO": {
              "type": "string"
            },
            "FRACCIONADO": {
              "type": "integer"
            },
            "COEFICIENTECONVERSION": {
              "type": "number"
            },
            "PERMITESTOCKNEGATIVO": {
              "type": "integer"
            },
            "ORDENTALLE": {
              "type": "string"
            },
            "ESPACK": {
              "type": "integer"
            },
            "CANTIDADXBULTO": {
              "type": "number"
            },
            "MUESTRAWEB": {
              "type": "integer"
            },
            "PUBLICADO": {
              "type": "number",
              "format": "double"
            },
            "INNERPORBULTO": {
              "type": "number",
              "description": "SOLO PARA ENTERPRISE"
            },
            "CODIGO_SUBDEPOSITO": {
              "type": "number",
              "description": "SOLO PARA ENTERPRISE"
            },
            "DESCRIPCIONSUBDEPOSITO": {
              "type": "string",
              "description": "SOLO PARA ENTERPRISE"
            },
            "UNIDADMEDIDABASE": {
              "type": "string",
              "description": "SOLO PARA ENTERPRISE"
            },
            "UNIDADMEDIDACONVERSION": {
              "type": "string",
              "description": "SOLO PARA ENTERPRISE"
            },
            "VOLUMENARTICULO": {
              "type": "number",
              "format": "double"
            },
            "STOCKPENDIENTERECEPCIONOC": {
              "type": "number",
              "format": "double",
              "description": "solo para CORRALON"
            },
            "COEFICIENTEVARIACION": {
              "type": "number",
              "format": "double",
              "description": "solo para CORRALON"
            },
            "UTILIZAEQUIVALENCIAS": {
              "type": "number",
              "format": "integer",
              "description": "solo para CORRALON"
            },
            "ESEXENTO": {
              "type": "number",
              "format": "integer",
              "description": "ES EXENTO (0 = NO ES EXENTO, 1 = EXENTO PARA COMPRAS, 2 = EXENTO PARA VENTAS, 3 = EXENTO PARA COMPRAS Y VENTAS - SOLO PARA ENTERPRISE VESION ^3.36)"
            },
            "IDACTIVIDADMINORISTA": {
              "type": "integer",
              "description": "Descripcion de id actividad minorista (SOLO PARA CORRALON)"
            },
            "CODIGOACTIVIDADMINORISTA": {
              "type": "string",
              "maxLength": 10,
              "description": "Descripcion de codigo actividad minorista (SOLO PARA CORRALON)"
            },
            "DESCRIPCIONACTIVIDADMINORISTA": {
              "type": "string",
              "maxLength": 600,
              "description": "Descripcion de descripcion actividad minorista (SOLO PARA CORRALON)"
            },
            "IDACTIVIDADMAYORISTA": {
              "type": "integer",
              "description": "Descripcion de id actividad mayorista (SOLO PARA CORRALON)"
            },
            "CODIGOACTIVIDADMAYORISTA": {
              "type": "string",
              "maxLength": 10,
              "description": "Descripcion de codigo actividad mayorista (SOLO PARA CORRALON)"
            },
            "DESCRIPCIONACTIVIDADMAYORISTA": {
              "type": "string",
              "maxLength": 600,
              "description": "Descripcion de descripcion actividad mayorista (SOLO PARA CORRALON)"
            },
            "ORIGEN": {
              "type": "string"
            },
            "PRECIOCOMPRA": {
              "type": "number",
              "format": "double",
              "description": "SOLO PARA ENTERPRISE"
            }
          }
        },
        "GetMultiPlaceBank": {
          "properties": {
            "CODIGOMULTIPLAZO": {
              "type": "integer"
            },
            "CODIGOBANCO": {
              "type": "string"
            },
            "CODIGOSUCURSALBANCO": {
              "type": "string"
            },
            "NUMEROCUENTA": {
              "type": "string"
            },
            "PORCENTAJE": {
              "type": "number",
              "format": "float"
            }
          }
        },
        "GetMultiPlaceCheck": {
          "properties": {
            "CODIGOMULTIPLAZO": {
              "type": "integer"
            },
            "DESDE": {
              "type": "integer"
            },
            "HASTA": {
              "type": "integer"
            },
            "PORCENTAJE": {
              "type": "number",
              "format": "float"
            }
          }
        },
        "GetMultiPlaceCoin": {
          "properties": {
            "CODIGOMULTIPLAZO": {
              "type": "integer"
            },
            "CODIGOMONEDA": {
              "type": "string"
            },
            "PORCENTAJE": {
              "type": "number",
              "format": "float"
            }
          }
        },
        "GetMultiPlaceCard": {
          "properties": {
            "CODIGOMULTIPLAZO": {
              "type": "integer"
            },
            "CODIGOTARJETA": {
              "type": "string"
            },
            "PLANTARJETA": {
              "type": "string"
            },
            "PORCENTAJE": {
              "type": "number",
              "format": "float"
            }
          }
        },
        "vouchersauthorizationsGet": {
          "properties": {
            "TIPOCOMPRBANTE": {
              "type": "string"
            },
            "NUMEROCOMPRBANTE": {
              "type": "number",
              "format": "float"
            },
            "CODIGOAUTORIZACION": {
              "type": "integer"
            },
            "CODIGOUSUARIO": {
              "type": "string"
            },
            "CODIGOESTADO": {
              "type": "integer"
            },
            "NUMEROTRANSACCION": {
              "type": "integer"
            }
          }
        },
        "CostumerBranchGet": {
          "properties": {
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "CODIGOSUCURSAL": {
              "type": "number"
            },
            "NOMBRE": {
              "type": "string"
            },
            "CODIGOPROVINCIA": {
              "type": "string"
            },
            "CODIGOLOCALIDAD": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "BARRIO": {
              "type": "string"
            },
            "CP": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "time-date"
            },
            "OBSERVACIONES": {
              "type": "string"
            },
            "CODIGOZONA": {
              "type": "string"
            },
            "CODIGOTRANSPORTE": {
              "type": "integer",
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "HORADESDE": {
              "type": "string",
              "format": "time-date",
              "nullable": true,
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "HORAHASTA": {
              "type": "string",
              "format": "time-date",
              "nullable": true,
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "EMAIL": {
              "type": "string",
              "nullable": true,
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0003.00 O SUPERIOR"
            }
          }
        },
        "CostumerBranchUpdate": {
          "required": [
            "name",
            "state_id",
            "city_id",
            "address",
            "area_id",
            "transport_id"
          ],
          "properties": {
            "name": {
              "description": "NOMBRE",
              "type": "string"
            },
            "state_id": {
              "description": "CODIGOPROVINCIA",
              "type": "string"
            },
            "city_id": {
              "description": "CODIGOLOCALIDAD",
              "type": "string"
            },
            "address": {
              "description": "DIRECCION",
              "type": "string"
            },
            "neighborhood": {
              "description": "BARRIO",
              "type": "string"
            },
            "zipcode": {
              "description": "CP",
              "type": "string"
            },
            "phone": {
              "description": "TELEFONO",
              "type": "string"
            },
            "observations": {
              "description": "OBSERVACIONES",
              "type": "string",
              "nullable": true
            },
            "area_id": {
              "description": "CODIGOZONA",
              "type": "string"
            },
            "transport_id": {
              "type": "integer",
              "description": "CODIGOTRANSPORTE SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR (ES REQUERIDO)"
            },
            "timefrom": {
              "type": "string",
              "format": "time-date",
              "nullable": true,
              "description": "FECHADESDE SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "timeto": {
              "type": "string",
              "format": "time-date",
              "nullable": true,
              "description": "FECHAHASTA SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "email": {
              "type": "string",
              "nullable": true,
              "description": "EMAIL SOLO ENTERPRISE Y VERSION  03.36.001.0003.00 O SUPERIOR"
            }
          }
        },
        "CostumerContactGet": {
          "properties": {
            "CODIGOCONTACTO": {
              "type": "number"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "NOMBRE": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "CELULAR": {
              "type": "string"
            },
            "LOCALIDAD": {
              "type": "string"
            },
            "BARRIO": {
              "type": "string"
            },
            "CODIGOPROVINCIA": {
              "type": "string"
            },
            "CP": {
              "type": "string"
            },
            "DNI": {
              "type": "string"
            },
            "CARGO": {
              "type": "string"
            },
            "EMAIL": {
              "type": "string"
            },
            "FAX": {
              "type": "string"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "time-date"
            },
            "NUMEROTRANSACCION": {
              "type": "integer"
            },
            "FECHANACIMIENTO": {
              "type": "string",
              "format": "time-date"
            }
          }
        },
        "CostumerContactUpdate": {
          "required": [
            "name",
            "address",
            "phone",
            "cell_phone",
            "city",
            "neighborhood",
            "state_id",
            "zipcode",
            "document_id",
            "position",
            "email",
            "fax",
            "transaction_id"
          ],
          "properties": {
            "name": {
              "description": "NOMBRE",
              "type": "string"
            },
            "address": {
              "description": "DIRECCION",
              "type": "string"
            },
            "phone": {
              "description": "TELEFONO",
              "type": "string"
            },
            "cell_phone": {
              "description": "CELULAR",
              "type": "string"
            },
            "city": {
              "description": "LOCALIDAD",
              "type": "string"
            },
            "neighborhood": {
              "description": "BARRIO",
              "type": "string"
            },
            "state_id": {
              "description": "CODIGOPROVINCIA",
              "type": "string"
            },
            "zipcode": {
              "description": "CP",
              "type": "string"
            },
            "document_id": {
              "description": "DNI",
              "type": "string"
            },
            "position": {
              "description": "CARGO",
              "type": "string"
            },
            "email": {
              "description": "EMAIL",
              "type": "string"
            },
            "fax": {
              "description": "FAX",
              "type": "string"
            },
            "update_from": {
              "description": "FECHAMODIFICACION",
              "type": "string",
              "format": "time-date"
            },
            "transaction_id": {
              "description": "NUMEROTRANSACCION",
              "type": "integer"
            },
            "birthday": {
              "description": "FECHANACIMIENTO",
              "type": "string",
              "format": "time-date",
              "nullable": true
            }
          }
        },
        "CustumerBranchs": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "state_id": {
              "type": "string"
            },
            "city_id": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "neighborhood": {
              "type": "string"
            },
            "zipcode": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            },
            "update_from": {
              "type": "string",
              "format": "time-date"
            },
            "observations": {
              "type": "string",
              "nullable": true
            },
            "area_id": {
              "type": "string",
              "nullable": true
            },
            "transport_id": {
              "type": "integer",
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "timefrom": {
              "type": "string",
              "format": "time-date",
              "nullable": true,
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "timeto": {
              "type": "string",
              "format": "time-date",
              "nullable": true,
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0001.00  O SUPERIOR"
            },
            "email": {
              "type": "string",
              "nullable": true,
              "description": "SOLO ENTERPRISE Y VERSION  03.36.001.0003.00 O SUPERIOR"
            }
          }
        },
        "CustumerContacts": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            },
            "cell_phone": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "neighborhood": {
              "type": "string"
            },
            "state_id": {
              "type": "string"
            },
            "zipcode": {
              "type": "string"
            },
            "document_id": {
              "type": "string"
            },
            "position": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "fax": {
              "type": "string"
            },
            "update_from": {
              "type": "string",
              "format": "time-date"
            },
            "transaction_id": {
              "type": "number"
            },
            "birthday": {
              "type": "string",
              "format": "time-date",
              "nullable": true
            }
          }
        },
        "ResponseCustomer": {
          "type": "object",
          "properties": {
            "ID": {
              "type": "string"
            },
            "RES_CODIGOCLIENTE": {
              "type": "string"
            },
            "RES_CODIGOPARTICULAR": {
              "type": "string"
            }
          }
        },
        "Orders": {
          "type": "object",
          "properties": {
            "internal_id": {
              "type": "string"
            },
            "id": {
              "type": "string"
            }
          }
        },
        "CreateSale": {
          "properties": {
            "cart": {
              "type": "object",
              "required": [
                "warehouse_id",
                "date",
                "user_id",
                "currency_id",
                "general_discount",
                "payment_method_id",
                "customer",
                "products",
                "paymentsDetail"
              ],
              "properties": {
                "notes": {
                  "type": "string",
                  "description": "COMENTARIOS"
                },
                "price_list_id": {
                  "type": "string",
                  "description": "LISTAPRECIO"
                },
                "operation_type_id": {
                  "type": "string",
                  "description": "CODIGOOPERACION"
                },
                "type": {
                  "type": "string",
                  "description": "TIPOCOMPROBANTE"
                },
                "warehouse_id": {
                  "type": "string",
                  "description": "CODIGODEPOSITO"
                },
                "date": {
                  "type": "string",
                  "description": "FECHACOMPROBANTE"
                },
                "user_id": {
                  "type": "string",
                  "description": "CODIGOUSUARIO"
                },
                "currency_id": {
                  "type": "string",
                  "description": "CODIGOMONEDA"
                },
                "general_discount": {
                  "type": "string",
                  "description": "DESCUENTOPORCENTAJE"
                },
                "payment_method_id": {
                  "type": "string",
                  "description": "CODIGOMULTIPLAZO"
                },
                "deliver": {
                  "type": "number",
                  "description": "ENTREGAR"
                },
                "customer": {
                  "type": "object",
                  "required": [
                    "name",
                    "state_id",
                    "city",
                    "phone"
                  ],
                  "properties": {
                    "notes": {
                      "type": "string",
                      "description": "COMENTARIOS"
                    },
                    "vat_number": {
                      "type": "string",
                      "description": "CUIT"
                    },
                    "id": {
                      "type": "string",
                      "description": "CODIGOCLIENTE"
                    },
                    "name": {
                      "type": "string",
                      "description": "RAZONSOCIAL"
                    },
                    "address": {
                      "type": "string",
                      "description": "DIRECCION (No es requerido en Corralon)"
                    },
                    "state_id": {
                      "type": "string",
                      "description": "CODIGOPROVINCIA"
                    },
                    "city": {
                      "type": "string",
                      "description": "LOCALIDAD"
                    },
                    "neighborhood": {
                      "type": "string",
                      "description": "BARRIO"
                    },
                    "user_id": {
                      "type": "string",
                      "description": "CODIGOVENDEDOR o CODIGOCOBRADOR"
                    },
                    "price_list_id": {
                      "type": "string",
                      "description": "CODIGOLISTA"
                    },
                    "phone": {
                      "type": "string",
                      "description": "TELEFONO"
                    },
                    "cell_phone": {
                      "type": "string",
                      "description": "CELULAR (A partir de la version 03.39.001.0004.00 el dato se guarda en el campo TELEFONOCELULAR)"
                    },
                    "sales_tax_group_id": {
                      "type": "string",
                      "description": "CONDICIONIVA (Es requerido en Corralon en caso de que no se mande el parametro id)"
                    },
                    "document_id": {
                      "type": "string",
                      "description": "DOCUMENTO"
                    },
                    "email": {
                      "type": "string",
                      "description": "EMAIL"
                    },
                    "zipcode": {
                      "type": "string",
                      "description": "CP (codigo postal)"
                    },
                    "activity_id": {
                      "type": "string",
                      "description": "codigo de actividad"
                    },
                    "grossincome": {
                      "type": "string",
                      "description": "ingresos brutos"
                    },
                    "account": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de la cuenta corriente"
                    },
                    "creditLimit": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite de credito (este campo es requerido si account = 1, solo para ENTERPRISE)"
                    },
                    "creditLimitDoc": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite de credito doc (este campo es requerido si account = 1, solo para ENTERPRISE)"
                    },
                    "payment_method_id": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite del codigo del multiplazo(este campo es requerido si account = 1, solo para ENTERPRISE)"
                    },
                    "credit_amount_req": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del monto del credito solicitado (solo para ENTERPRISE)"
                    },
                    "fixed_payment_method": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion del multiplazo fijo (solo para ENTERPRISE)"
                    },
                    "account_disabled": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de deshabilitar la cuenta corriente  (solo para ENTERPRISE)"
                    },
                    "expired_days": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de dias vencidos (solo para ENTERPRISE)"
                    },
                    "promotion_bill": {
                      "type": "integer",
                      "description": "descripcion de ofertas facturables (solo 0 o 1, si el codigo cliente no existe y dicho campo es null se inserta 1, si el codigo cliente existe y dicho campo es null no modifica su valor en la tabla)"
                    }
                  }
                },
                "products": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "$ref": "#/components/schemas/OrderProduct"
                  }
                },
                "paymentsDetail": {
                  "type": "object",
                  "properties": {
                    "cash": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCash"
                      }
                    },
                    "coupon": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCoupon"
                      }
                    },
                    "wireTransfer": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentWireTransfer"
                      }
                    },
                    "checks": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCheck"
                      }
                    }
                  }
                },
                "geolocation": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string"
                    },
                    "number": {
                      "type": "number",
                      "format": "double"
                    },
                    "latitude": {
                      "type": "string"
                    },
                    "length": {
                      "type": "string"
                    }
                  }
                },
                "cae": {
                  "type": "object",
                  "properties": {
                    "numberCae": {
                      "type": "string"
                    },
                    "dateExpired": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "dateRequested": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "afipResponse": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        },
        "SalesGet": {
          "type": "object",
          "properties": {
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "HORACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "FECHAVENCIMIENTO": {
              "type": "string",
              "format": "time-date"
            },
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "IIBBCLIENTE": {
              "type": "string"
            },
            "TOTALNETO": {
              "type": "number",
              "format": "double"
            },
            "TOTALIVA": {
              "type": "number",
              "format": "double"
            },
            "TOTALEXENTO": {
              "type": "number",
              "format": "double"
            },
            "MONTOTOTALII": {
              "type": "number",
              "format": "double"
            },
            "TOTALBRUTO": {
              "type": "number",
              "format": "double"
            },
            "PAGADO": {
              "type": "number",
              "format": "double"
            },
            "CONDICIONIVA": {
              "type": "string"
            },
            "CONDICIONVENTA": {
              "type": "string"
            },
            "VENDEDOR": {
              "type": "string"
            },
            "RESPONSABLE": {
              "type": "string"
            },
            "DEPOSITO": {
              "type": "string"
            },
            "ANULADA": {
              "type": "integer"
            },
            "CUENTACORRIENTE": {
              "type": "integer"
            },
            "MONEDA": {
              "type": "string"
            },
            "COTIZACION": {
              "type": "number",
              "format": "double"
            },
            "LISTAPRECIO": {
              "type": "integer"
            },
            "COMENTARIOS": {
              "type": "string"
            },
            "DESCUENTOPORCENTAJE": {
              "type": "number",
              "format": "double"
            },
            "DESCUENTOMONTO": {
              "type": "number",
              "format": "double"
            },
            "DESCUENTODESCRIPCION": {
              "type": "string"
            },
            "NUMEROCAE": {
              "type": "string"
            },
            "FECHAVTOCAE": {
              "type": "string",
              "format": "time-date"
            },
            "CODIGOCOMPROBANTEAFIP": {
              "type": "string"
            },
            "FECHAVENCIMIENTO2": {
              "type": "string",
              "format": "time-date"
            },
            "RECARGOVENCIMIENTO2": {
              "type": "number",
              "format": "double"
            },
            "FECHAVENCIMIENTO3": {
              "type": "string",
              "format": "time-date"
            },
            "RECARGOVENCIMIENTO3": {
              "type": "number",
              "format": "double"
            },
            "CODIGOMONEDAAFIP": {
              "type": "string"
            },
            "CODIGODOCUMENTOAFIP": {
              "type": "integer"
            },
            "CODIGOTIPOAUTORIZACION": {
              "type": "string"
            },
            "TOTALPERCEPCIONES": {
              "type": "number",
              "format": "double"
            },
            "PROVINCIA": {
              "type": "string"
            },
            "LOCALIDAD": {
              "type": "string"
            },
            "OBSERVACIONESMULTIPLAZO": {
              "type": "string"
            },
            "FACTURAELECTRONICA": {
              "type": "integer"
            },
            "FECHAHORACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "CODIGOPARTICULAR": {
              "type": "string"
            },
            "TIPOIVA": {
              "type": "string"
            },
            "IMPTOTAL": {
              "type": "number",
              "format": "double"
            },
            "NROPUNTODEVENTA": {
              "type": "integer"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "time-date"
            },
            "NUMEROREMITO": {
              "type": "number",
              "format": "double"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "SalesGetOne": {
          "type": "object",
          "properties": {
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "HORACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "FECHAVENCIMIENTO": {
              "type": "string",
              "format": "time-date"
            },
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "IIBBCLIENTE": {
              "type": "string"
            },
            "TOTALNETO": {
              "type": "number",
              "format": "double"
            },
            "TOTALIVA": {
              "type": "number",
              "format": "double"
            },
            "TOTALEXENTO": {
              "type": "number",
              "format": "double"
            },
            "MONTOTOTALII": {
              "type": "number",
              "format": "double"
            },
            "TOTALBRUTO": {
              "type": "number",
              "format": "double"
            },
            "PAGADO": {
              "type": "number",
              "format": "double"
            },
            "CONDICIONIVA": {
              "type": "string"
            },
            "CONDICIONVENTA": {
              "type": "string"
            },
            "VENDEDOR": {
              "type": "string"
            },
            "RESPONSABLE": {
              "type": "string"
            },
            "DEPOSITO": {
              "type": "string"
            },
            "ANULADA": {
              "type": "integer"
            },
            "CUENTACORRIENTE": {
              "type": "integer"
            },
            "MONEDA": {
              "type": "string"
            },
            "COTIZACION": {
              "type": "number",
              "format": "double"
            },
            "LISTAPRECIO": {
              "type": "integer"
            },
            "COMENTARIOS": {
              "type": "string"
            },
            "DESCUENTOPORCENTAJE": {
              "type": "number",
              "format": "double"
            },
            "DESCUENTOMONTO": {
              "type": "number",
              "format": "double"
            },
            "DESCUENTODESCRIPCION": {
              "type": "string"
            },
            "NUMEROCAE": {
              "type": "string"
            },
            "FECHAVTOCAE": {
              "type": "string",
              "format": "time-date"
            },
            "CODIGOCOMPROBANTEAFIP": {
              "type": "string"
            },
            "FECHAVENCIMIENTO2": {
              "type": "string",
              "format": "time-date"
            },
            "RECARGOVENCIMIENTO2": {
              "type": "number",
              "format": "double"
            },
            "FECHAVENCIMIENTO3": {
              "type": "string",
              "format": "time-date"
            },
            "RECARGOVENCIMIENTO3": {
              "type": "number",
              "format": "double"
            },
            "CODIGOMONEDAAFIP": {
              "type": "string"
            },
            "CODIGODOCUMENTOAFIP": {
              "type": "integer"
            },
            "CODIGOTIPOAUTORIZACION": {
              "type": "string"
            },
            "TOTALPERCEPCIONES": {
              "type": "number",
              "format": "double"
            },
            "FECHAHORACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "CODIGOPARTICULAR": {
              "type": "string"
            },
            "TIPOIVA": {
              "type": "string"
            },
            "IMPTOTAL": {
              "type": "number",
              "format": "double"
            },
            "NROPUNTODEVENTA": {
              "type": "integer"
            },
            "ORIGEN": {
              "type": "string"
            },
            "DETALLE": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "LINEA": {
                    "type": "number"
                  },
                  "CODIGOPARTICULAR": {
                    "type": "string"
                  },
                  "DESCRIPCION": {
                    "type": "string"
                  },
                  "CANTIDAD": {
                    "type": "number"
                  },
                  "CANTIDADREMITIDA": {
                    "type": "number"
                  },
                  "PENDIENTE": {
                    "type": "number"
                  },
                  "DESCUENTO": {
                    "type": "number"
                  },
                  "PRECIOUNITARIO": {
                    "type": "number"
                  },
                  "PRECIOTOTAL": {
                    "type": "number"
                  },
                  "GARANTIA": {
                    "type": "number"
                  },
                  "LOTE": {
                    "type": "string"
                  },
                  "DESCRIPCIONEMPAQUE": {
                    "type": "string"
                  },
                  "COEFICIENTECONVERSION": {
                    "type": "number"
                  },
                  "OBSERVACIONES": {
                    "type": "string"
                  },
                  "PORCENTAJEIVA": {
                    "type": "number"
                  },
                  "CODIGOARTICULO": {
                    "type": "string",
                    "description": "SOLO ENTERPRISE"
                  },
                  "INTERES": {
                    "type": "integer",
                    "description": "SOLO ENTERPRISE"
                  },
                  "ESCONJUNTO": {
                    "type": "integer",
                    "description": "SOLO ENTERPRISE"
                  },
                  "FECHAMODIFICACION": {
                    "type": "string",
                    "format": "time-date",
                    "description": "SOLO ENTERPRISE"
                  },
                  "CODIGODEPOSITO": {
                    "type": "string",
                    "description": "SOLO ENTERPRISE"
                  },
                  "COSTOVENTA": {
                    "type": "number",
                    "description": "SOLO ENTERPRISE"
                  },
                  "NUMEROTRANSACCION": {
                    "type": "number",
                    "description": "SOLO ENTERPRISE"
                  },
                  "DESCDESCUENTO": {
                    "type": "string",
                    "description": "SOLO ENTERPRISE"
                  },
                  "TIPOPRECIO": {
                    "type": "string",
                    "description": "SOLO ENTERPRISE"
                  },
                  "PORCENTAJEDESCUENTOS": {
                    "type": "number",
                    "description": "SOLO ENTERPRISE"
                  },
                  "MONTOII": {
                    "type": "number",
                    "description": "SOLO ENTERPRISE"
                  },
                  "CODIGOEMPAQUE": {
                    "type": "string",
                    "description": "SOLO ENTERPRISE"
                  },
                  "DESCPORMOTOR": {
                    "type": "number",
                    "description": "SOLO ENTERPRISE"
                  },
                  "CODIGODESPACHO": {
                    "type": "string",
                    "description": "SOLO ENTERPRISE"
                  },
                  "IDACTIVIDAD": {
                    "type": "integer",
                    "description": "SOLO CORRALON"
                  },
                  "CODIGOACTIVIDAD": {
                    "type": "string",
                    "maxLength": 10,
                    "description": "SOLO CORRALON"
                  },
                  "DESCRIPCIONACTIVIDAD": {
                    "type": "string",
                    "maxLength": 600,
                    "description": "SOLO CORRALON"
                  }
                }
              }
            },
            "PERCEPCIONES": {
              "example": []
            }
          }
        },
        "Getpoints": {
          "properties": {
            "TOTAL": {
              "type": "number"
            }
          }
        },
        "EmpresaGet": {
          "type": "object",
          "properties": {
            "CODIGOSUCURSAL": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "NOMBREFANTASIA": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "FAX": {
              "type": "string"
            },
            "EMAIL": {
              "type": "string"
            },
            "DIRECCIONWEB": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "INGRESOSBRUTOS": {
              "type": "string"
            },
            "PROVINCIA": {
              "type": "string"
            },
            "LOCALIDAD": {
              "type": "string"
            },
            "CP": {
              "type": "string"
            },
            "TELEFONOADMINISTRACION": {
              "type": "string"
            },
            "NUMEROTRANSACCION": {
              "type": "integer"
            },
            "FE_FECHAINC": {
              "type": "string",
              "format": "date-time"
            },
            "FE_SERVICIOS": {
              "type": "number"
            },
            "FE_PERIODOQUEFACTURA": {
              "type": "number"
            },
            "IDTIPOEMPLEADOR": {
              "type": "number"
            },
            "CODIGOAGEC": {
              "type": "string"
            },
            "MONTOVALIDACIONCUIT": {
              "type": "number"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time"
            },
            "CODIGOPAIS": {
              "type": "number"
            },
            "CODIGOAGENTE": {
              "type": "string"
            },
            "NUMERORNIC": {
              "type": "string"
            },
            "MONTOLEY27440": {
              "type": "number"
            },
            "RG4520": {
              "type": "string"
            },
            "CONDICIONIVA": {
              "type": "object",
              "properties": {
                "CODIGOTIPO": {
                  "type": "string"
                },
                "DESCRIPCION": {
                  "type": "string"
                },
                "TIPODOCUMENTO": {
                  "type": "string"
                },
                "DISCRIMINA": {
                  "type": "number"
                },
                "IVA1": {
                  "type": "number"
                },
                "IVA2": {
                  "type": "number"
                },
                "DISCRIMINALIBROIVA": {
                  "type": "number"
                },
                "MUESTRALIBROIVA": {
                  "type": "number"
                },
                "IMPRESORAFISCAL": {
                  "type": "string"
                },
                "REQUIERECUIT": {
                  "type": "number"
                },
                "ACTIVO": {
                  "type": "number"
                }
              }
            }
          }
        },
        "GetAcopio": {
          "properties": {
            "CODIGOACOPIO": {
              "type": "number"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string"
            },
            "CODIGOMULTIPLAZO": {
              "type": "number"
            },
            "PRECIOSPACTADOSACTIVOS": {
              "type": "number"
            },
            "DIASARTICULOS": {
              "type": "number"
            },
            "DIASCI": {
              "type": "number"
            },
            "FECHAALTA": {
              "type": "string",
              "format": "date"
            },
            "AJUSTE": {
              "type": "number"
            },
            "FIJAPRECIOS": {
              "type": "number"
            }
          }
        },
        "GetDetalleAcopios": {
          "properties": {
            "CODIGOACOPIO": {
              "type": "number"
            },
            "CODIGOARTICULO": {
              "type": "string"
            },
            "PRECIO": {
              "type": "number"
            },
            "FECHAVIGENCIA": {
              "type": "string",
              "format": "date"
            },
            "FECHAALTA": {
              "type": "string",
              "format": "date"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date"
            }
          }
        },
        "CompatibilidadAppGet": {
          "type": "object",
          "properties": {
            "VERSIONAPI": {
              "type": "string"
            },
            "VERSIONAPPDESDE": {
              "type": "string"
            },
            "PRODUCT_ID": {
              "type": "integer"
            },
            "COMPATIBLE": {
              "type": "boolean"
            }
          }
        },
        "GetBudgetsDetail": {
          "type": "object",
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del tipo comprobante"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double",
              "description": "descripcion del numero de comprobante"
            },
            "RAZONSOCIAL": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la razon social"
            },
            "FECHAVENCIMIENTO": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha vencimiento"
            },
            "FECHAAPROBADO": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha aprobado"
            },
            "TELEFONO": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del telefono"
            },
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha comprobante"
            },
            "COMENTARIOS": {
              "type": "string",
              "maxLength": 2000,
              "description": "descripcion de los comentarios"
            },
            "OPERACION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la operacion (solo para enterprise)"
            },
            "ANULADA": {
              "type": "number",
              "description": "descripcion si esta anulada"
            },
            "CONDICIONIVA": {
              "type": "string",
              "description": "descripcion de tipo iva"
            },
            "CODIGOCLIENTE": {
              "type": "string",
              "description": "descripcion codigo cliente"
            },
            "CODIGOMULTIPLAZO": {
              "type": "integer",
              "description": "descripcion de codigo multiplazo"
            },
            "CONDICIONVENTA": {
              "type": "string",
              "description": "descripcion de multiplazo"
            },
            "VENDEDOR": {
              "type": "string",
              "description": "razon social de usuario"
            },
            "RESPONSABLE": {
              "type": "string",
              "description": "razon social de usuario"
            },
            "MONEDA": {
              "type": "string",
              "description": "descripcion de moneda"
            },
            "IVA1": {
              "type": "string",
              "description": "descripcion de iva1"
            },
            "CANTIDADPENDIENTE": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cantidad pendiente"
            },
            "TOTALORIGINAL": {
              "type": "number",
              "format": "double",
              "description": "descripcion de total original"
            },
            "TOTALPENDIENTE": {
              "type": "number",
              "format": "double",
              "description": "descripcion de total pendiente"
            },
            "OBSERVACIONESLINEA": {
              "type": "string",
              "maxLength": 2000,
              "description": "descripcion de las observaciones linea"
            },
            "ESTADO": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del estado"
            },
            "DETALLE": {
              "type": "array",
              "items": {
                "properties": {
                  "TIPOCOMPROBANTE": {
                    "type": "string",
                    "description": "descripcion de tipo comprobante"
                  },
                  "NUMEROCOMPROBANTE": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de numero comprobante"
                  },
                  "LINEA": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de linea"
                  },
                  "CODIGOARTICULO": {
                    "type": "string",
                    "description": "descripcion del codigo articulo"
                  },
                  "DESCRIPCION": {
                    "type": "string",
                    "description": "descripcion"
                  },
                  "CANTIDAD": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de la cantidad"
                  },
                  "BONIFICACION": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de bonificacion"
                  },
                  "PRECIOUNITARIO": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de precio unitario"
                  },
                  "PRECIOTOTAL": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de precio total"
                  },
                  "GARANTIA": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de garantia"
                  },
                  "CANTIDADREMITIDA": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de cantidad remitida"
                  },
                  "ESCONJUNTO": {
                    "type": "number",
                    "description": "descripcion si es conjunto"
                  },
                  "FECHAMODIFICACION": {
                    "type": "string",
                    "format": "date-time",
                    "description": "descripcion de la fecha modificacion"
                  },
                  "NUMEROTRANSACCION": {
                    "type": "integer",
                    "description": "descripcion de numero transaccion"
                  },
                  "CODIGOPARTICULAR": {
                    "type": "string",
                    "description": "descripcion de codigo particular"
                  },
                  "PORCENTAJEIVA": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de porcentaje iva"
                  },
                  "LOTE": {
                    "type": "string",
                    "description": "descripcion de lote"
                  },
                  "INTERES": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion del interes (solo para enterprise)"
                  },
                  "COEFICIENTECONVERSION": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de coeficiente conversion (solo para enterprise)"
                  },
                  "CODIGOEMPAQUE": {
                    "type": "string",
                    "description": "descripcion de codigo empaque (solo para enterprise)"
                  },
                  "DESCRIPCIONEMPAQUE": {
                    "type": "string",
                    "description": "descripcion de empaque (solo para enterprise)"
                  },
                  "OBSERVACION": {
                    "type": "string",
                    "description": "descripcion de observaciones (solo para enterprise)"
                  },
                  "ITEMGANADO": {
                    "type": "number",
                    "description": "descripcion de item ganado (solo para enterprise)"
                  },
                  "NUMEROITEM": {
                    "type": "string",
                    "description": "descripcion del numero item (solo para enterprise)"
                  },
                  "ESALTERNATIVO": {
                    "type": "number",
                    "description": "descripcion si es alternativo (solo para enterprise)"
                  },
                  "DESCPORMOTOR": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion descuento por motor (solo para enterprise)"
                  },
                  "CODIGODEPOSITO": {
                    "type": "string",
                    "description": "descripcion del codigo deposito (solo para corralon)"
                  },
                  "PRECIODIGITADO": {
                    "type": "number",
                    "description": "descripcion si es precio digitado (solo para corralon)"
                  },
                  "CANTIDADEXPEDICION": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion cantidad expidicion (solo para corralon)"
                  },
                  "FECHAENTREGA": {
                    "type": "string",
                    "format": "date-time",
                    "description": "descripcion de fecha entrega (solo para corralon)"
                  },
                  "CANTIDADREPARTO": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion cantidad reparto (solo para corralon)"
                  },
                  "CODIGOSUBDEPOSITO": {
                    "type": "string",
                    "description": "descripcion del codigo sub-deposito (solo para corralon)"
                  },
                  "BONIFICACIONPROVEEDOR": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion bonificacion proveedor (solo para corralon)"
                  },
                  "ESPRECIOPACTADO": {
                    "type": "number",
                    "description": "descripcion si es precio pactado (solo para corralon)"
                  },
                  "CODIGOTIPOEFICIENCIA": {
                    "type": "integer",
                    "description": "descripcion codigo tipo eficiencia (solo para corralon)"
                  },
                  "EFICIENCIAMAXIMA": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion eficiencia maxima (solo para corralon)"
                  },
                  "EFICIENCIALINEA": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion eficiencia linea (solo para corralon)"
                  },
                  "PERMITEOC": {
                    "type": "number",
                    "description": "descripcion si permite OC (solo para corralon)"
                  }
                }
              }
            }
          }
        },
        "DeliveryTypeREQ": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la descripcion"
            },
            "transactionnumber": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            },
            "withdrawclient": {
              "type": "integer",
              "description": "descripcion de si retira cliente"
            },
            "bydefault": {
              "type": "integer",
              "description": "descripcion de si es por default"
            },
            "numberofhours": {
              "type": "integer",
              "description": "descripcion de las cantidades de horas"
            },
            "validclosingday": {
              "type": "integer",
              "description": "descripcion de si valida cierre"
            },
            "checkfreight": {
              "type": "integer",
              "description": "descripcion de si verifica flete"
            },
            "deliveryispending": {
              "type": "integer",
              "description": "descripcion de si es pendinte de entrega"
            },
            "mobilecode": {
              "type": "string",
              "maxLength": 20,
              "description": "descripcion del codigo movil"
            },
            "ratebyweightdistance": {
              "type": "integer",
              "description": "descripcion de si es tarifa por peso distancia"
            },
            "minimaldistance": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la distancia minima"
            },
            "maximumdistance": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la distancia maxima"
            },
            "fractionedeach": {
              "type": "number",
              "format": "double",
              "description": "descripcion de si es fraccionado cada"
            },
            "articleid": {
              "type": "string",
              "maxLength": 20,
              "description": "descripcion del codigo articulo (solo para enterprise)"
            },
            "update_from": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha de modificacion (solo para enterprise)"
            }
          }
        },
        "DeliveryTypeREQINSERT": {
          "type": "object",
          "required": [
            "deliverytypecode",
            "description",
            "transactionnumber",
            "withdrawclient",
            "bydefault",
            "numberofhours",
            "checkfreight",
            "deliveryispending",
            "mobilecode",
            "ratebyweightdistance",
            "minimaldistance",
            "maximumdistance",
            "fractionedeach",
            "update_from"
          ],
          "properties": {
            "deliverytypecode": {
              "type": "integer",
              "description": "descripcion del codigo de entrega"
            },
            "description": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la descripcion"
            },
            "transactionnumber": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            },
            "withdrawclient": {
              "type": "integer",
              "description": "descripcion de si retira cliente"
            },
            "bydefault": {
              "type": "integer",
              "description": "descripcion de si es por default"
            },
            "numberofhours": {
              "type": "integer",
              "description": "descripcion de las cantidades de horas"
            },
            "validclosingday": {
              "type": "integer",
              "description": "descripcion de si valida cierre"
            },
            "checkfreight": {
              "type": "integer",
              "description": "descripcion de si verifica flete"
            },
            "deliveryispending": {
              "type": "integer",
              "description": "descripcion de si es pendinte de entrega"
            },
            "mobilecode": {
              "type": "string",
              "maxLength": 20,
              "description": "descripcion del codigo movil"
            },
            "ratebyweightdistance": {
              "type": "integer",
              "description": "descripcion de si es tarifa por peso distancia"
            },
            "minimaldistance": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la distancia minima"
            },
            "maximumdistance": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la distancia maxima"
            },
            "fractionedeach": {
              "type": "number",
              "format": "double",
              "description": "descripcion de si es fraccionado cada"
            },
            "articleid": {
              "type": "string",
              "maxLength": 20,
              "description": "descripcion del codigo articulo (solo para enterprise)"
            },
            "update_from": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha de modificacion (solo para enterprise)"
            }
          }
        },
        "DeliveryTypeGet": {
          "type": "object",
          "properties": {
            "CODIGOTIPOENTREGA": {
              "type": "integer",
              "description": "descripcion del codigo de tipo entrega"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la descripcion"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            },
            "RETIRACLIENTE": {
              "type": "integer",
              "description": "descripcion de si retira cliente"
            },
            "PORDEFAULT": {
              "type": "integer",
              "description": "descripcion de si es por default"
            },
            "CANTHORAS": {
              "type": "integer",
              "description": "descripcion de las cantidades de horas"
            },
            "VALIDACIERREDIA": {
              "type": "integer",
              "description": "descripcion de si valida cierre"
            },
            "VERIFICAFLETE": {
              "type": "integer",
              "description": "descripcion de si verifica flete"
            },
            "ESPENDIENTEENTREGA": {
              "type": "integer",
              "description": "descripcion de si es pendinte de entrega"
            },
            "CODIGOMOVIL": {
              "type": "string",
              "maxLength": 20,
              "description": "descripcion del codigo movil"
            },
            "TARIFAPORPESODISTANCIA": {
              "type": "integer",
              "description": "descripcion de si es tarifa por peso distancia"
            },
            "DISTANCIAMINIMA": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la distancia minima"
            },
            "DISTANCIAMAXIMA": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la distancia maxima"
            },
            "FRACCIONADOCADA": {
              "type": "number",
              "format": "double",
              "description": "descripcion de si es fraccionado cada"
            },
            "CODIGOARTICULO": {
              "type": "string",
              "maxLength": 20,
              "description": "descripcion del codigo articulo (solo para enterprise)"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha de modificacion (solo para enterprise)"
            }
          }
        },
        "GetItems": {
          "properties": {
            "CODIGORUBRO": {
              "type": "string",
              "description": "codigo de rubro encontrado"
            },
            "CODIGOSUPERRUBRO": {
              "type": "string",
              "description": "codigo de super rubro encontrado"
            },
            "DESCRIPCION": {
              "type": "string",
              "description": "descripcion del codigo rubro encontrado"
            },
            "RESTASTOCK": {
              "type": "boolean",
              "description": "descripcion de resta stock"
            },
            "MARGEN1": {
              "type": "number",
              "format": "double",
              "description": "descripcion del margen1"
            },
            "MARGEN2": {
              "type": "number",
              "format": "double",
              "description": "descripcion del margen2"
            },
            "MARGEN3": {
              "type": "number",
              "format": "double",
              "description": "descripcion del margen3"
            },
            "MARGEN4": {
              "type": "number",
              "format": "double",
              "description": "descripcion del margen4"
            },
            "MARGEN5": {
              "type": "number",
              "format": "double",
              "description": "descripcion del margen5"
            },
            "MUESTRAWEB": {
              "type": "boolean",
              "description": "descripcion de la muestra web"
            },
            "COEFICIENTE": {
              "type": "number",
              "format": "double",
              "description": "descripcion del coeficiente"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha de modificacion"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            },
            "MUESTRALISTAPRECIOS": {
              "type": "boolean",
              "description": "descripcion de la muestra de lista de precios"
            }
          }
        },
        "GetSuperItems": {
          "properties": {
            "CODIGOSUPERRUBRO": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string",
              "description": "descripcion del descripcion"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha de modificacion"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            },
            "CODIGOGRUPOSUPERRUBRO": {
              "type": "string"
            },
            "MUESTRAWEB": {
              "type": "boolean",
              "description": "descripcion de la muestra web"
            },
            "MUESTRALISTAPRECIOS": {
              "type": "boolean",
              "description": "descripcion de la muestra de lista de precios"
            }
          }
        },
        "GetGroupSuperItems": {
          "properties": {
            "CODIGOGRUPOSUPERRUBRO": {
              "type": "string"
            },
            "DESCRIPCION": {
              "type": "string",
              "description": "descripcion del descripcion"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha de modificacion"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            },
            "MUESTRAWEB": {
              "type": "boolean",
              "description": "descripcion de la muestra web"
            }
          }
        },
        "ParametrosGeneralesGETALL": {
          "properties": {
            "CODIGOPARAMETRO": {
              "type": "integer",
              "description": "descripcion del codigo del parametro"
            },
            "VALOR": {
              "type": "string",
              "maxLength": 100,
              "description": "descripcion del valor"
            },
            "DESCRIPCION": {
              "type": "string",
              "description": "descripcion de la descripcion"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha de modificacion"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            },
            "TITULO": {
              "type": "string",
              "maxLength": 150,
              "description": "descripcion del titulo"
            },
            "TEXTOPARAMETRO": {
              "type": "string",
              "maxLength": 4096,
              "description": "descripcion del texto del parametro"
            },
            "TIPO": {
              "type": "integer",
              "description": "descripcion del tipo"
            },
            "GRUPO": {
              "type": "integer",
              "description": "descripcion del grupo"
            },
            "ORDENGRILLA": {
              "type": "integer",
              "description": "descripcion del orden de grilla"
            },
            "EDITABLE": {
              "type": "integer",
              "description": "descripcion de si es editable"
            },
            "VISIBLE": {
              "type": "integer",
              "description": "descripcion de si es visible"
            }
          }
        },
        "PermisosEspecialesGet": {
          "properties": {
            "CODIGOPERMISO": {
              "type": "integer",
              "description": "descripcion del codigo del permiso"
            },
            "VENTANA": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la ventana"
            },
            "NOMBRECOMPONENTE": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del nombre del componente"
            },
            "TIPOCOMPONENTE": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del tipo de componente"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 200,
              "description": "descripcion de la descripcion"
            },
            "DEDONDE": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de donde"
            },
            "PARAMETRO": {
              "type": "integer",
              "description": "descripcion del parametro"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha de modificacion"
            },
            "CODIGOMENU": {
              "type": "integer",
              "description": "descripcion del codigo del menu"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            }
          }
        },
        "Transportes": {
          "properties": {
            "CODIGOTRANSPORTE": {
              "type": "integer",
              "description": "descripcion del codigo transporte"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del transporte"
            },
            "DIRECCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la direccion"
            },
            "DIRECCION1": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la direccion1"
            },
            "DIRECCION2": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la direccion2"
            },
            "TELEFONO": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la telefono"
            },
            "TELEFONO1": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la telefono1"
            },
            "TELEFONO2": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la telefono2"
            },
            "FAX": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del fax"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha de modificacion"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "descripcion de numero transaccion"
            },
            "CODIGOPROVINCIA": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo provincia (ERP)"
            },
            "CODIGOLOCALIDAD": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo localidad (ERP)"
            },
            "BARRIO": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del barrio (ERP)"
            },
            "CODIGOPOSTAL": {
              "type": "string",
              "maxLength": 10,
              "description": "descripcion del codigo postal (ERP)"
            },
            "TRANSPORTEPROPIO": {
              "type": "number",
              "description": "descripcion del codigo postal (CRLON)"
            },
            "TIPOIVA": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del tipo iva"
            },
            "CUIT": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del cuit"
            },
            "INGRESOSBRUTOS": {
              "type": "string",
              "maxLength": 30,
              "description": "descripcion de ingresos brutos"
            },
            "OBSERVACIONES": {
              "type": "string",
              "maxLength": 30,
              "description": "descripcion de observaciones (ERP)"
            }
          }
        },
        "vouchersauthorizationsREQ": {
          "required": [
            "vouchertype",
            "vouchernumber",
            "usercode"
          ],
          "type": "object",
          "properties": {
            "vouchertype": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del tipo de comprobante"
            },
            "vouchernumber": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del numero de comprobante"
            },
            "usercode": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo de usuario"
            }
          }
        },
        "ComprobantesCompraGet": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del tipo comprobante"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double",
              "description": "descripcion del numero comprobante"
            },
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha comprobante"
            },
            "FECHAIMPUTABLE": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha imputable"
            },
            "FECHADESPACHO": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha despacho"
            },
            "FECHARECEPCION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha recepcion"
            },
            "CODIGOPARTICULAR": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo particular del proveedor"
            },
            "CODIGOPROVEEDOR": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo proveedor"
            },
            "RAZONSOCIAL": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la razon social"
            },
            "CUIT": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del cuit"
            },
            "TELEFONO": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del telefono"
            },
            "DIRECCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la direccion"
            },
            "CONDICIONIVA": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la condicion iva"
            },
            "CONDICIONCOMPRA": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la condicion compra"
            },
            "RESPONSABLE": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del responsable"
            },
            "TOTALNETO": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total neto"
            },
            "TOTALIVA": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total iva"
            },
            "TOTALEXENTO": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total exento"
            },
            "TOTALBRUTO": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total bruto"
            },
            "PAGADO": {
              "type": "number",
              "format": "double",
              "description": "descripcion de pagado"
            },
            "ANULADA": {
              "type": "integer",
              "description": "descripcion de anulada"
            },
            "COMENTARIOS": {
              "type": "string",
              "maxLength": 2000,
              "description": "descripcion de comentarios"
            },
            "MONEDA": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la moneda"
            },
            "COTIZACION": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cotizacion"
            },
            "CUENTACORRIENTE": {
              "type": "integer",
              "description": "descripcion de la cuenta corriente"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "ComprobantesCompraGetOne": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del tipo comprobante"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double",
              "description": "descripcion del numero comprobante"
            },
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha comprobante"
            },
            "FECHAIMPUTABLE": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha imputable"
            },
            "FECHADESPACHO": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha despacho"
            },
            "FECHARECEPCION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha recepcion"
            },
            "CODIGOPARTICULAR": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo particular del proveedor"
            },
            "CODIGOPROVEEDOR": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo proveedor"
            },
            "RAZONSOCIAL": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la razon social"
            },
            "CUIT": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del cuit"
            },
            "TELEFONO": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del telefono"
            },
            "DIRECCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la direccion"
            },
            "CONDICIONIVA": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la condicion iva"
            },
            "CONDICIONCOMPRA": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la condicion compra"
            },
            "RESPONSABLE": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del responsable"
            },
            "TOTALNETO": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total neto"
            },
            "TOTALIVA": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total iva"
            },
            "TOTALEXENTO": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total exento"
            },
            "TOTALBRUTO": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total bruto"
            },
            "PAGADO": {
              "type": "number",
              "format": "double",
              "description": "descripcion de pagado"
            },
            "ANULADA": {
              "type": "integer",
              "description": "descripcion de anulada"
            },
            "COMENTARIOS": {
              "type": "string",
              "maxLength": 2000,
              "description": "descripcion de comentarios"
            },
            "MONEDA": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la moneda"
            },
            "COTIZACION": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cotizacion"
            },
            "CUENTACORRIENTE": {
              "type": "integer",
              "description": "descripcion de la cuenta corriente"
            },
            "DETALLES": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "LINEA": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de la linea"
                  },
                  "CODIGOPARTICULAR": {
                    "type": "string",
                    "maxLength": 40,
                    "description": "descripcion de codigo particular"
                  },
                  "DESCRIPCION": {
                    "type": "string",
                    "maxLength": 250,
                    "description": "descripcion"
                  },
                  "CANTIDAD": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de la cantidad"
                  },
                  "CANTIDADREMITIDA": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de la cantidad remitida"
                  },
                  "PENDIENTE": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de la cantidad menos la cantidad remitida"
                  },
                  "CANTIDADINGRESADA": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de la cantidad ingresada"
                  },
                  "DESCUENTO": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de descuento"
                  },
                  "PRECIOUNITARIO": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de precio unitario"
                  },
                  "PRECIOTOTAL": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de precio total"
                  },
                  "LOTE": {
                    "type": "string",
                    "maxLength": 100,
                    "description": "descripcion del lote"
                  },
                  "DESCRIPCIONEMPAQUE": {
                    "type": "string",
                    "maxLength": 150,
                    "description": "descripcion de la descripcion empaque"
                  },
                  "COEFICIENTECONVERSION": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de coeficiente conversion"
                  },
                  "PERCENTAJEIVA": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de porcentaje iva"
                  },
                  "IMPUESTOSINTERNOS": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de impuestos internos"
                  }
                }
              }
            }
          }
        },
        "ComprobantesCompraPost": {
          "required": [
            "type",
            "id",
            "warehouse_id",
            "linked_type",
            "linked_id",
            "linked_line",
            "expiration_date",
            "date",
            "imputable_date",
            "user_id",
            "notes",
            "currency_id",
            "agreed_exchange_rate",
            "payment_method_id",
            "total_exempt"
          ],
          "properties": {
            "type": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del tipo comprobante"
            },
            "id": {
              "type": "number",
              "format": "double",
              "description": "descripcion del numero comprobante"
            },
            "warehouse_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo deposito"
            },
            "linked_type": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del tipo comprobante vinculado"
            },
            "linked_id": {
              "type": "number",
              "format": "double",
              "description": "descripcion del numero comprovante vinculado"
            },
            "linked_line": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la linea comprobante vinculado"
            },
            "expiration_date": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha vencimiento"
            },
            "date": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha comprobante"
            },
            "imputable_date": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha imputable"
            },
            "user_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion de codigo usuario"
            },
            "notes": {
              "type": "string",
              "maxLength": 2000,
              "description": "descripcion de observaciones"
            },
            "currency_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo moneda"
            },
            "agreed_exchange_rate": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cotizacion pactada"
            },
            "payment_method_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo multiplazo"
            },
            "total_exempt": {
              "type": "number",
              "format": "double",
              "description": "descripcion del exento"
            },
            "products": {
              "required": [
                "product_id",
                "size",
                "quantity",
                "unit_price",
                "total_price"
              ],
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "product_id": {
                    "type": "string",
                    "maxLength": 15,
                    "description": "descripcion del codigo articulo"
                  },
                  "size": {
                    "type": "string",
                    "maxLength": 50,
                    "description": "descripcion de lote"
                  },
                  "quantity": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de cantidad"
                  },
                  "discount": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de descuento"
                  },
                  "unit_price": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de precio unitario"
                  },
                  "internal_tax": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de impuestos internos"
                  },
                  "netPrice": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion del precio neto"
                  },
                  "total_price": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion del precio total"
                  }
                }
              }
            },
            "perceptions": {
              "required": [
                "id",
                "number",
                "amount",
                "tax_rate"
              ],
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "maxLength": 15,
                    "description": "descripcion del codigo percepcion"
                  },
                  "number": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion del numero percepcion"
                  },
                  "amount": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion del monto"
                  },
                  "tax_rate": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de alicuota"
                  }
                }
              }
            },
            "provider": {
              "required": [
                "name",
                "address",
                "state_id",
                "city",
                "neighborhood",
                "user_id",
                "phone",
                "sales_tax_group_id",
                "vat_number",
                "notes",
                "email",
                "zipcode"
              ],
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo proveedor"
                },
                "name": {
                  "type": "string",
                  "maxLength": 50,
                  "description": "descripcion de la razon social"
                },
                "address": {
                  "type": "string",
                  "maxLength": 250,
                  "description": "descripcion de la direccion"
                },
                "state_id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo provincia"
                },
                "city": {
                  "type": "string",
                  "maxLength": 50,
                  "description": "descripcion de la localidad"
                },
                "neighborhood": {
                  "type": "string",
                  "maxLength": 50,
                  "description": "descripcion de barrio"
                },
                "user_id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo usuario"
                },
                "phone": {
                  "type": "string",
                  "maxLength": 100,
                  "description": "descripcion de telefono"
                },
                "sales_tax_group_id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo condicion iva"
                },
                "vat_number": {
                  "type": "string",
                  "maxLength": 13,
                  "description": "descripcion del cuit"
                },
                "notes": {
                  "type": "string",
                  "maxLength": 2000,
                  "description": "descripcion de comentarios"
                },
                "email": {
                  "type": "string",
                  "maxLength": 100,
                  "description": "descripcion del email"
                },
                "zipcode": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo postal"
                }
              }
            }
          }
        },
        "SalesGetMlt": {
          "type": "object",
          "properties": {
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "HORACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "FECHAVENCIMIENTO": {
              "type": "string",
              "format": "time-date"
            },
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "IIBBCLIENTE": {
              "type": "string"
            },
            "TOTALNETO": {
              "type": "number",
              "format": "double"
            },
            "TOTALIVA": {
              "type": "number",
              "format": "double"
            },
            "TOTALEXENTO": {
              "type": "number",
              "format": "double"
            },
            "MONTOTOTALII": {
              "type": "number",
              "format": "double"
            },
            "TOTALBRUTO": {
              "type": "number",
              "format": "double"
            },
            "PAGADO": {
              "type": "number",
              "format": "double"
            },
            "CONDICIONIVA": {
              "type": "string"
            },
            "CONDICIONVENTA": {
              "type": "string"
            },
            "VENDEDOR": {
              "type": "string"
            },
            "RESPONSABLE": {
              "type": "string"
            },
            "DEPOSITO": {
              "type": "string"
            },
            "ANULADA": {
              "type": "integer"
            },
            "CUENTACORRIENTE": {
              "type": "integer"
            },
            "MONEDA": {
              "type": "string"
            },
            "COTIZACION": {
              "type": "number",
              "format": "double"
            },
            "LISTAPRECIO": {
              "type": "integer"
            },
            "COMENTARIOS": {
              "type": "string"
            },
            "DESCUENTOPORCENTAJE": {
              "type": "number",
              "format": "double"
            },
            "DESCUENTOMONTO": {
              "type": "number",
              "format": "double"
            },
            "DESCUENTODESCRIPCION": {
              "type": "string"
            },
            "CODIGOCOMPROBANTEAFIP": {
              "type": "string"
            },
            "FECHAVENCIMIENTO2": {
              "type": "string",
              "format": "time-date",
              "description": "solo enterprise"
            },
            "RECARGOVENCIMIENTO2": {
              "type": "number",
              "format": "double"
            },
            "FECHAVENCIMIENTO3": {
              "type": "string",
              "format": "time-date",
              "description": "solo enterprise"
            },
            "RECARGOVENCIMIENTO3": {
              "type": "number",
              "format": "double"
            },
            "CODIGOMONEDAAFIP": {
              "type": "string"
            },
            "CODIGODOCUMENTOAFIP": {
              "type": "integer"
            },
            "CODIGOTIPOAUTORIZACION": {
              "type": "string"
            },
            "FECHAHORACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "ORIGEN": {
              "type": "string"
            },
            "OBSERVACIONESMULTIPLAZO": {
              "type": "string"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "time-date"
            }
          }
        },
        "SalesGetOneMlt": {
          "type": "object",
          "properties": {
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "HORACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "FECHAVENCIMIENTO": {
              "type": "string",
              "format": "time-date"
            },
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "CUIT": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "IIBBCLIENTE": {
              "type": "string"
            },
            "TOTALNETO": {
              "type": "number",
              "format": "double"
            },
            "TOTALIVA": {
              "type": "number",
              "format": "double"
            },
            "TOTALEXENTO": {
              "type": "number",
              "format": "double"
            },
            "MONTOTOTALII": {
              "type": "number",
              "format": "double"
            },
            "TOTALBRUTO": {
              "type": "number",
              "format": "double"
            },
            "PAGADO": {
              "type": "number",
              "format": "double"
            },
            "CONDICIONIVA": {
              "type": "string"
            },
            "CONDICIONVENTA": {
              "type": "string"
            },
            "VENDEDOR": {
              "type": "string"
            },
            "RESPONSABLE": {
              "type": "string"
            },
            "DEPOSITO": {
              "type": "string"
            },
            "ANULADA": {
              "type": "integer"
            },
            "CUENTACORRIENTE": {
              "type": "integer"
            },
            "MONEDA": {
              "type": "string"
            },
            "COTIZACION": {
              "type": "number",
              "format": "double"
            },
            "LISTAPRECIO": {
              "type": "integer"
            },
            "COMENTARIOS": {
              "type": "string"
            },
            "DESCUENTOPORCENTAJE": {
              "type": "number",
              "format": "double"
            },
            "DESCUENTOMONTO": {
              "type": "number",
              "format": "double"
            },
            "DESCUENTODESCRIPCION": {
              "type": "string"
            },
            "CODIGOCOMPROBANTEAFIP": {
              "type": "string"
            },
            "FECHAVENCIMIENTO2": {
              "type": "string",
              "format": "time-date",
              "description": "solo enterprise"
            },
            "RECARGOVENCIMIENTO2": {
              "type": "number",
              "format": "double"
            },
            "FECHAVENCIMIENTO3": {
              "type": "string",
              "format": "time-date",
              "description": "solo enterprise"
            },
            "RECARGOVENCIMIENTO3": {
              "type": "number",
              "format": "double"
            },
            "CODIGOMONEDAAFIP": {
              "type": "string"
            },
            "CODIGODOCUMENTOAFIP": {
              "type": "integer"
            },
            "CODIGOTIPOAUTORIZACION": {
              "type": "string"
            },
            "FECHAHORACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "time-date"
            },
            "OBSERVACIONESMULTIPLAZO": {
              "type": "string"
            },
            "ORIGEN": {
              "type": "string"
            },
            "DETALLE": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "LINEA": {
                    "type": "number"
                  },
                  "CODIGOPARTICULAR": {
                    "type": "string"
                  },
                  "DESCRIPCION": {
                    "type": "string"
                  },
                  "CANTIDAD": {
                    "type": "number"
                  },
                  "CANTIDADREMITIDA": {
                    "type": "number"
                  },
                  "PENDIENTE": {
                    "type": "number"
                  },
                  "CANTIDADPREPARADA": {
                    "type": "number"
                  },
                  "DESCUENTO": {
                    "type": "number"
                  },
                  "PRECIOUNITARIO": {
                    "type": "number"
                  },
                  "PRECIOTOTAL": {
                    "type": "number"
                  },
                  "GARANTIA": {
                    "type": "number"
                  },
                  "LOTE": {
                    "type": "string"
                  },
                  "DESCRIPCIONEMPAQUE": {
                    "type": "string",
                    "description": "solo enterprise"
                  },
                  "COEFICIENTECONVERSION": {
                    "type": "number",
                    "description": "solo enterprise"
                  },
                  "OBSERVACIONES": {
                    "type": "string"
                  },
                  "PORCENTAJEIVA": {
                    "type": "number"
                  }
                }
              }
            }
          }
        },
        "SalesCurrentAccount": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "TIPOCOMPROBANTE": {
                "type": "string"
              },
              "NUMEROCOMPROBANTE": {
                "type": "number"
              },
              "FECHACOMPROBANTE": {
                "type": "string",
                "format": "time-date"
              },
              "FECHAVENCIMIENTO": {
                "type": "string",
                "format": "time-date"
              },
              "TOTAL": {
                "type": "string"
              },
              "PAGADO": {
                "type": "number"
              },
              "DEUDA": {
                "type": "number"
              },
              "DIASVENCIDOS": {
                "type": "string"
              },
              "DESCUENTOSADICIONALES": {
                "type": "number",
                "description": "solo corralon"
              },
              "CODIGOCLIENTE": {
                "type": "string",
                "description": "solo corralon"
              },
              "TOTALNETO": {
                "type": "number",
                "description": "solo corralon"
              },
              "CODIGOMONEDA": {
                "type": "string",
                "description": "solo enterprise"
              },
              "DESCRIPCIONMULTIPLAZO": {
                "type": "string",
                "description": "solo enterprise"
              },
              "OBSERVACIONES": {
                "type": "string",
                "description": "solo enterprise"
              },
              "RECARGO": {
                "type": "number",
                "description": "solo enterprise"
              },
              "TOTALACTUALIZADO": {
                "type": "number",
                "description": "solo enterprise"
              },
              "CAMBIO": {
                "type": "number",
                "description": "solo enterprise"
              },
              "TOTALORIGEN": {
                "type": "number",
                "description": "solo enterprise"
              },
              "ORIGEN": {
                "type": "string"
              }
            }
          }
        },
        "SalesChecksCurrentAccount": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "FECHAINGRESO": {
                "type": "string",
                "format": "time-date"
              },
              "FECHACLEARING": {
                "type": "number",
                "format": "time-date"
              },
              "NUMERO": {
                "type": "number"
              },
              "BANCO": {
                "type": "string"
              },
              "ESPROPIO": {
                "type": "number"
              },
              "MONTO": {
                "type": "number"
              },
              "ELECTRONICO": {
                "type": "integer",
                "description": "solo enterprise"
              },
              "RAZONSOCIAL": {
                "type": "string",
                "description": "solo enterprise"
              },
              "ORIGEN": {
                "type": "string"
              }
            }
          }
        },
        "ConjuntosGet": {
          "properties": {
            "CODIGOCONJUNTO": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo conjunto"
            },
            "CODIGOARTICULO": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo articulo"
            },
            "CODIGOPARTICULAR": {
              "type": "string",
              "maxLength": 40,
              "description": "Descripcion del codigo particular"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 250,
              "description": "Descripcion"
            },
            "CANTIDAD": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cantidad"
            },
            "COEFICIENTEPRECIO": {
              "type": "number",
              "format": "double",
              "description": "descripcion de coeficiente precio"
            },
            "LOTE": {
              "type": "string",
              "maxLength": 100,
              "description": "descripcion de lote"
            }
          }
        },
        "ApropiacionCentroCostoGet": {
          "properties": {
            "LINEA": {
              "type": "number",
              "description": "linea del asiento"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la cuenta"
            },
            "CODIGOASIENTO": {
              "type": "number",
              "description": "codigo del asiento"
            },
            "MONTO": {
              "type": "number",
              "description": "monto del asiento"
            },
            "UTILIZACENTROSCOSTO": {
              "type": "number",
              "description": "utiliza centros costos"
            },
            "ESDEBE": {
              "type": "number",
              "description": "es debe"
            },
            "CENTROCOSTO": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "CODIGOCENTROSCOSTO": {
                    "type": "number"
                  },
                  "RUBRO": {
                    "type": "string"
                  },
                  "SUPERRUBRO": {
                    "type": "string",
                    "description": "solo enterprise"
                  },
                  "CENTRO": {
                    "type": "string"
                  },
                  "PORCENTAJE": {
                    "type": "number"
                  },
                  "MONTO": {
                    "type": "number"
                  }
                }
              }
            }
          }
        },
        "ApropiacionCentroCostoUpdate": {
          "required": [
            "linenumber",
            "code",
            "linecode",
            "user"
          ],
          "properties": {
            "linenumber": {
              "type": "number",
              "description": "numero del asiento"
            },
            "code": {
              "type": "number",
              "description": "codigo del ejercicio"
            },
            "linecode": {
              "type": "number",
              "description": "codigo del asiento"
            },
            "user": {
              "type": "string",
              "maxLength": 15,
              "description": "codigo del usuario"
            },
            "appropriation": {
              "type": "array",
              "items": {
                "required": [
                  "line"
                ],
                "type": "object",
                "properties": {
                  "line": {
                    "type": "number",
                    "description": "linea del asiento"
                  },
                  "values": {
                    "type": "array",
                    "items": {
                      "required": [
                        "codecentercost",
                        "percentage"
                      ],
                      "type": "object",
                      "properties": {
                        "codecentercost": {
                          "type": "number",
                          "description": "codigo del centro de costo"
                        },
                        "percentage": {
                          "type": "number",
                          "description": "porcentaje"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "EjercicioGet": {
          "properties": {
            "CODIGOEJERCICIO": {
              "type": "number",
              "description": "codigo del ejercicio"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del ejercicio"
            },
            "ACTIVO": {
              "type": "number",
              "description": "ejercicio activo"
            },
            "MESINICIO": {
              "type": "number",
              "description": "numero del mes"
            },
            "ANIOINICIO": {
              "type": "number",
              "description": "año de inicio"
            },
            "CANTIDADMESES": {
              "type": "number",
              "description": "cantidad de meses"
            },
            "FECHAINICIO": {
              "type": "number",
              "format": "time-date"
            },
            "FECHAFIN": {
              "type": "number",
              "format": "time-date"
            },
            "FECHAMODIFICACION": {
              "type": "number",
              "format": "time-date"
            },
            "ORIGEN": {
              "type": "string"
            }
          }
        },
        "Fixedassets": {
          "properties": {
            "CODIGOBIENUSO": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo de bien de uso"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del ejercicio"
            },
            "STOCKACTUAL": {
              "type": "number",
              "format": "double",
              "description": "descripcion del stock actual"
            },
            "PRECIOCOMPRA": {
              "type": "number",
              "format": "double",
              "description": "descripcion del precio de compra"
            },
            "CODIGORUBROBIENDEUSO": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo de rubro del bien de uso"
            },
            "FECHAMODIFICACION": {
              "type": "number",
              "format": "time-date",
              "description": "descripcion de la fecha de modificacion"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            },
            "FECHAALTA": {
              "type": "number",
              "format": "time-date",
              "description": "descripcion de la fecha de alta"
            },
            "COEFICIENTE": {
              "type": "number",
              "format": "double",
              "description": "descripcion del coeficiente (solo para enterprise)"
            },
            "CUENTAVALORORIGEN": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cuenta valor de origen (solo para enterprise)"
            },
            "CUENTAAMORTACUM": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cuenta amortizada acumulado (solo para enterprise)"
            },
            "CUENTAAMORTIZACION": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cuenta amortizadacion (solo para enterprise)"
            },
            "CUENTARESVENTA": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cuenta venta (solo para enterprise)"
            },
            "PORCDEPRECANUAL": {
              "type": "number",
              "format": "double",
              "description": "descripcion del procentaje de deprecacion anual (solo para enterprise)"
            },
            "FECHABAJA": {
              "type": "number",
              "format": "time-date",
              "description": "descripcion de la fecha de baja (solo para enterprise)"
            },
            "DEPRECACUM": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la deprecacion acumulada (solo para enterprise)"
            },
            "INCLUYEENPLANILLAAMORT": {
              "type": "number",
              "description": "descripcion de si incluye en planilla amortizada (solo para enterprise)"
            },
            "BAJA": {
              "type": "boolean",
              "description": "descripcion de si da de baja (solo para enterprise)"
            }
          }
        },
        "FixedassetsReq": {
          "required": [
            "description",
            "currentstock",
            "purchaseprice",
            "itemfixedassetid"
          ],
          "properties": {
            "description": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del ejercicio"
            },
            "currentstock": {
              "type": "number",
              "format": "double",
              "description": "descripcion del stock actual"
            },
            "purchaseprice": {
              "type": "number",
              "format": "double",
              "description": "descripcion del precio de compra"
            },
            "itemfixedassetid": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo de rubro del bien de uso"
            },
            "transactionnumber": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            },
            "dischargedate": {
              "type": "number",
              "format": "time-date",
              "description": "descripcion de la fecha de alta"
            },
            "coefficient": {
              "type": "number",
              "format": "double",
              "description": "descripcion del coeficiente (solo para enterprise)"
            },
            "accountsourcevalue": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cuenta valor de origen  (solo para enterprise)"
            },
            "accumulatedamortaccount": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cuenta amortizada acumulado  (solo para enterprise)"
            },
            "amortaccount": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cuenta amortizadacion (solo para enterprise)"
            },
            "resultaccountsale": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cuenta venta (solo para enterprise)"
            },
            "annualdepreciationpercentage": {
              "type": "number",
              "format": "double",
              "description": "descripcion del procentaje de deprecacion anual (solo para enterprise)"
            },
            "leavingdate": {
              "type": "number",
              "format": "time-date",
              "description": "descripcion de la fecha de baja (solo para enterprise)"
            },
            "accumulateddepreciation": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la deprecacion acumulada (solo para enterprise)"
            },
            "includeamortizationlist": {
              "type": "number",
              "description": "descripcion de si incluye en planilla amortizada (solo para enterprise)"
            },
            "leaving": {
              "type": "boolean",
              "description": "descripcion de si da de baja (solo para enterprise)"
            }
          }
        },
        "Itemfixedassets": {
          "properties": {
            "CODIGORUBROBIENDEUSO": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo de bien de uso"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del ejercicio"
            },
            "FECHAMODIFICACION": {
              "type": "number",
              "format": "time-date",
              "description": "descripcion de la fecha de modificacion"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            }
          }
        },
        "ItemfixedassetsReq": {
          "required": [
            "description"
          ],
          "properties": {
            "description": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion del ejercicio"
            },
            "transactionnumber": {
              "type": "integer",
              "description": "descripcion del numero de transaccion"
            }
          }
        },
        "RequerimientoInternoGet": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string",
              "description": "tipo del comprobante",
              "maxLength": 15
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "description": "numero del comprobante"
            },
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "time-date",
              "description": "fecha del comprobante"
            },
            "HORA": {
              "type": "string",
              "format": "time-date",
              "description": "hora del comprobante"
            },
            "CODIGOUSUARIO": {
              "type": "string",
              "description": "codigo del usuario",
              "maxLength": 15
            },
            "FECHAREQUERIDA": {
              "type": "string",
              "description": "fecha requerida",
              "format": "time-date"
            },
            "COMENTARIOS": {
              "type": "string",
              "description": "comentarios del comprobante",
              "maxLength": 2000
            },
            "ANULADA": {
              "type": "integer",
              "description": "comprobante anulado"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "time-date",
              "description": "hora del comprobante"
            },
            "FECHAAPROBADO": {
              "type": "string",
              "format": "time-date",
              "description": "fecha aprobado"
            },
            "USUARIOAPROBACION": {
              "type": "string",
              "description": "usuario que aprobo el comprobante",
              "maxLength": 15
            },
            "CODIGOMONEDA": {
              "type": "string",
              "description": "codigo modeda del comprobante",
              "maxLength": 30
            },
            "COTIZACION": {
              "type": "number",
              "description": "cotizacion del comprobante"
            },
            "ORIGEN": {
              "type": "string",
              "description": "origen de la base de datos"
            }
          }
        },
        "RequerimientoInternoGetOne": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string",
              "description": "tipo del comprobante",
              "maxLength": 15
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double",
              "description": "numero del comprobante"
            },
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "time-date",
              "description": "fecha del comprobante"
            },
            "HORA": {
              "type": "string",
              "format": "time-date",
              "description": "hora del comprobante"
            },
            "CODIGOUSUARIO": {
              "type": "string",
              "description": "codigo del usuario",
              "maxLength": 15
            },
            "FECHAREQUERIDA": {
              "type": "string",
              "description": "fecha requerida",
              "format": "time-date"
            },
            "COMENTARIOS": {
              "type": "string",
              "description": "comentarios del comprobante",
              "maxLength": 2000
            },
            "ANULADA": {
              "type": "integer",
              "description": "comprobante anulado"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "time-date",
              "description": "hora del comprobante"
            },
            "FECHAAPROBADO": {
              "type": "string",
              "format": "time-date",
              "description": "fecha aprobado"
            },
            "USUARIOAPROBACION": {
              "type": "string",
              "description": "usuario que aprobo el comprobante",
              "maxLength": 15
            },
            "CODIGOMONEDA": {
              "type": "string",
              "description": "codigo modeda del comprobante",
              "maxLength": 30
            },
            "COTIZACION": {
              "type": "number",
              "description": "cotizacion del comprobante"
            },
            "DETALLE": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "TIPOCOMPROBANTE": {
                    "type": "string",
                    "description": "tipo del comprobante",
                    "maxLength": 15
                  },
                  "NUMEROCOMPROBANTE": {
                    "type": "number",
                    "format": "double",
                    "description": "numero del comprobante"
                  },
                  "LINEA": {
                    "type": "integer",
                    "description": "linea del cuerpo"
                  },
                  "CODIGOARTICULO": {
                    "type": "string",
                    "description": "codigo del articulo",
                    "maxLength": 15
                  },
                  "DESCRIPCION": {
                    "type": "string",
                    "description": "descripcion del articulo",
                    "maxLength": 250
                  },
                  "OBSERVACIONARTICULO": {
                    "type": "string",
                    "description": "observacion del articulo",
                    "maxLength": 80
                  },
                  "CANTIDAD": {
                    "type": "number",
                    "format": "double",
                    "description": "cantidad del articulo"
                  },
                  "CANTIDADREMITIDA": {
                    "type": "number",
                    "format": "double",
                    "description": "cantidad remitida del articulo"
                  },
                  "CODIGOPARTICULARPROVEEDOR": {
                    "type": "string",
                    "description": "codigo particular del proveedor",
                    "maxLength": 15
                  },
                  "FECHAMODIFICACION": {
                    "type": "string",
                    "format": "time-date",
                    "description": "fecha de modificacion"
                  },
                  "ANULADO": {
                    "type": "integer",
                    "description": "comprobante anulado"
                  },
                  "PRECIOUNITARIO": {
                    "type": "number",
                    "format": "double",
                    "description": "precio unitario del articulo"
                  },
                  "COEFICIENTECONVERSION": {
                    "type": "number",
                    "format": "double",
                    "description": "coeficiente de conversion"
                  },
                  "CODIGOEMPAQUE": {
                    "type": "string",
                    "description": "codigo de empaque",
                    "maxLength": 15
                  },
                  "DESCRIPCIONEMPAQUE": {
                    "type": "string",
                    "description": "descripcion del empaque",
                    "maxLength": 150
                  },
                  "LOTE": {
                    "type": "string",
                    "description": "lote",
                    "maxLength": 150
                  },
                  "ESCONJUNTO": {
                    "type": "integer",
                    "description": "Si = 1, No = 0"
                  }
                }
              }
            }
          }
        },
        "RequerimientoInternoCreate": {
          "properties": {
            "date": {
              "type": "string",
              "format": "time-date",
              "description": "fecha del comprobante"
            },
            "user_id": {
              "type": "string",
              "description": "codigo del usuario",
              "maxLength": 15
            },
            "date_required": {
              "type": "string",
              "format": "time-date",
              "description": "fecha requerida del comprobante"
            },
            "comment": {
              "type": "string",
              "description": "comentarios del comprobante",
              "maxLength": 2000
            },
            "currency_id": {
              "type": "string",
              "description": "codigo de la moneda",
              "maxLength": 30
            },
            "quotation": {
              "type": "number",
              "format": "double",
              "description": "cotizacion"
            },
            "products": {
              "type": "array",
              "items": {
                "required": [
                  "product_id",
                  "quantity",
                  "unit_price"
                ],
                "type": "object",
                "properties": {
                  "product_id": {
                    "type": "string",
                    "description": "codigo del articulo",
                    "maxLength": 15
                  },
                  "observation": {
                    "type": "string",
                    "description": "observacion del articulo",
                    "maxLength": 80
                  },
                  "quantity": {
                    "type": "number",
                    "format": "double",
                    "description": "cantidad"
                  },
                  "unit_price": {
                    "type": "number",
                    "format": "double",
                    "description": "precio unitario"
                  },
                  "size": {
                    "type": "string",
                    "description": "lote",
                    "maxLength": 100
                  }
                }
              }
            }
          }
        },
        "OrdenCompraGet": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string",
              "description": "tipo del comprobante",
              "maxLength": 15
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "description": "numero del comprobante"
            },
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "time-date",
              "description": "fecha del comprobante"
            },
            "RAZONSOCIALPROVEEDOR": {
              "type": "string",
              "description": "razon social del proveedor",
              "maxLength": 50
            },
            "TELEFONO": {
              "type": "string",
              "description": "telefono del proveedor",
              "maxLength": 50
            },
            "MONTOTOTAL": {
              "type": "number",
              "description": "monto total del comprobante"
            },
            "MONTOPENDIENTE": {
              "type": "number",
              "description": "monto pendiente del comprobante"
            },
            "CANCELADO": {
              "type": "string",
              "description": "comprobante cancelado",
              "maxLength": 3
            },
            "DEPOSITO": {
              "type": "string",
              "description": "descripcion del deposito",
              "maxLength": 50
            },
            "OBSERVACION": {
              "type": "string",
              "description": "observacion del comprobante",
              "maxLength": 2000
            },
            "IMPORTACION": {
              "type": "number",
              "description": "importacion"
            },
            "CANTIDADTOTAL": {
              "type": "number",
              "description": "cantidad total"
            },
            "CANTIDADPENDIENTE": {
              "type": "number",
              "description": "cantidad pendiente"
            },
            "ORIGEN": {
              "type": "string",
              "description": "origen de la base de datos"
            }
          }
        },
        "OrdenCompraCreate": {
          "properties": {
            "provider_id": {
              "type": "string",
              "description": "codigo del proveedor",
              "maxLength": 15
            },
            "payment_method_id": {
              "type": "string",
              "description": "codigo multiplazo",
              "maxLength": 15,
              "nullable": true
            },
            "warehouse_id": {
              "type": "string",
              "description": "codigo deposito",
              "maxLength": 15,
              "nullable": true
            },
            "currency_id": {
              "type": "string",
              "description": "codigo moneda",
              "maxLength": 15,
              "nullable": true
            },
            "agreed_exchange_rate": {
              "type": "number",
              "format": "double",
              "description": "cotizacion pactada"
            },
            "transport_id": {
              "type": "string",
              "description": "codigo transporte",
              "maxLength": 15,
              "nullable": true
            },
            "date": {
              "type": "string",
              "format": "time-date",
              "description": "fecha del comprobante",
              "nullable": true
            },
            "date_required": {
              "type": "string",
              "format": "time-date",
              "description": "fecha requerida del comprobante",
              "nullable": true
            },
            "comment": {
              "type": "string",
              "description": "comentarios del comprobante",
              "maxLength": 2000,
              "nullable": true
            },
            "assistance": {
              "type": "string",
              "description": "atencion",
              "maxLength": 50,
              "nullable": true
            },
            "products": {
              "type": "array",
              "items": {
                "required": [
                  "product_id",
                  "quantity"
                ],
                "type": "object",
                "properties": {
                  "product_id": {
                    "type": "string",
                    "description": "codigo del articulo",
                    "maxLength": 15
                  },
                  "quantity": {
                    "type": "number",
                    "format": "double",
                    "description": "cantidad"
                  },
                  "size": {
                    "type": "string",
                    "description": "lote",
                    "maxLength": 100,
                    "nullable": true
                  },
                  "internal_tax": {
                    "type": "number",
                    "format": "double",
                    "description": "impuesto interno",
                    "nullable": true
                  },
                  "unit_price": {
                    "type": "number",
                    "format": "double",
                    "description": "precio unitario",
                    "nullable": true
                  },
                  "observation": {
                    "type": "string",
                    "description": "observacion del articulo",
                    "maxLength": 80,
                    "nullable": true
                  }
                }
              }
            }
          }
        },
        "OrdenCompraGetOne": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string",
              "description": "tipo del comprobante",
              "maxLength": 15
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double",
              "description": "numero del comprobante"
            },
            "CODIGOPROVEEDOR": {
              "type": "string",
              "description": "codigo del proveedor",
              "maxLength": 15
            },
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "time-date",
              "description": "fecha del comprobante"
            },
            "RAZONSOCIAL": {
              "type": "string",
              "description": "razon social del proveedor",
              "maxLength": 50
            },
            "DIRECCION": {
              "type": "string",
              "description": "direccion del proveedor",
              "maxLength": 50
            },
            "TOTAL": {
              "type": "number",
              "description": "total del comprobante"
            },
            "HORA": {
              "type": "string",
              "format": "time-date",
              "description": "hora del comprobante"
            },
            "CODIGOUSUARIO": {
              "type": "string",
              "description": "codigo del usuario",
              "maxLength": 15
            },
            "COMENTARIOS": {
              "type": "string",
              "description": "comentarios del comprobante",
              "maxLength": 2000
            },
            "FECHAREQUERIDA": {
              "type": "string",
              "description": "fecha requerida",
              "format": "time-date"
            },
            "ANULADA": {
              "type": "integer",
              "description": "comprobante anulado"
            },
            "REMITOFACTURADO": {
              "type": "integer",
              "description": "remito facturado"
            },
            "ATENCION": {
              "type": "string",
              "description": "atencion",
              "maxLength": 50
            },
            "CODIGOTRANSPORTE": {
              "type": "integer",
              "description": "codigo transporte del comprobante"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "time-date",
              "description": "fecha modificacion del comprobante"
            },
            "CODIGOMONEDA": {
              "type": "string",
              "description": "codigo modeda del comprobante",
              "maxLength": 15
            },
            "COTIZACION": {
              "type": "number",
              "description": "cotizacion del comprobante"
            },
            "COTIZACIONPACTADA": {
              "type": "number",
              "description": "cotizacion pactada del comprobante"
            },
            "CODIGODEPOSITO": {
              "type": "string",
              "description": "codigo deposito del comprobante",
              "maxLength": 15
            },
            "CODIGOMULTIPLAZO": {
              "type": "integer",
              "description": "codigo multiplazo del comprobante"
            },
            "AUTORIZADA": {
              "type": "integer",
              "description": "comprobante autorizado"
            },
            "CODIGOUSUARIOAUTORIZO": {
              "type": "string",
              "description": "codigo usuario autorizo",
              "maxLength": 15
            },
            "FECHAAUTORIZACION": {
              "type": "string",
              "format": "time-date",
              "description": "fecha autorizacion"
            },
            "NUMEROOOPERACION": {
              "type": "number",
              "description": "numero de la operacion"
            },
            "DETALLE": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "LINEA": {
                    "type": "integer",
                    "description": "linea del cuerpo"
                  },
                  "CODIGOARTICULO": {
                    "type": "string",
                    "description": "codigo del articulo",
                    "maxLength": 15
                  },
                  "DESCRIPCION": {
                    "type": "string",
                    "description": "descripcion del articulo",
                    "maxLength": 250
                  },
                  "CANTIDADPEDIDA": {
                    "type": "number",
                    "format": "double",
                    "description": "cantidad pedida del articulo"
                  },
                  "BONIFICACION": {
                    "type": "number",
                    "format": "double",
                    "description": "bonificacion del articulo"
                  },
                  "PRECIOUNITARIO": {
                    "type": "number",
                    "format": "double",
                    "description": "precio unitario del articulo"
                  },
                  "PRECIOTOTAL": {
                    "type": "number",
                    "format": "double",
                    "description": "precio total"
                  },
                  "CANTIDADRECIBIDA": {
                    "type": "number",
                    "format": "double",
                    "description": "cantidad recibida del articulo"
                  },
                  "CODIGOPARTICULARPROVEEDOR": {
                    "type": "string",
                    "description": "codigo particular del proveedor",
                    "maxLength": 50
                  },
                  "FECHAMODIFICACION": {
                    "type": "string",
                    "format": "time-date",
                    "description": "fecha de modificacion"
                  },
                  "ANULADO": {
                    "type": "integer",
                    "description": "comprobante anulado"
                  },
                  "LOTE": {
                    "type": "string",
                    "description": "lote",
                    "maxLength": 100
                  },
                  "OBSERVACION": {
                    "type": "string",
                    "description": "observacion del articulo",
                    "maxLength": 250
                  },
                  "ACTUALIZAPRECIOCOMPRA": {
                    "type": "string",
                    "description": "actualiza precio compra",
                    "maxLength": 10
                  },
                  "COEFICIENTECONVERSION": {
                    "type": "number",
                    "format": "double",
                    "description": "coeficiente de conversion"
                  },
                  "CODIGOEMPAQUE": {
                    "type": "string",
                    "description": "codigo de empaque",
                    "maxLength": 15
                  },
                  "DESCRIPCIONEMPAQUE": {
                    "type": "string",
                    "description": "descripcion del empaque",
                    "maxLength": 150
                  },
                  "CANTIDADINGRESADA": {
                    "type": "number",
                    "format": "double",
                    "description": "cantidad ingresada del articulo"
                  },
                  "PRECIOINGRESADO": {
                    "type": "number",
                    "format": "double",
                    "description": "precio ingresado del articulo"
                  },
                  "IMPUESTOSINTERNOS": {
                    "type": "number",
                    "format": "double",
                    "description": "impuestos internos del articulo"
                  },
                  "PRECIOANTERIOR": {
                    "type": "number",
                    "format": "double",
                    "description": "precio anterior del articulo"
                  }
                }
              }
            }
          }
        },
        "RemitoCompraPost": {
          "required": [
            "type",
            "id",
            "warehouse_id",
            "linked_type",
            "linked_id",
            "linked_line",
            "expiration_date",
            "imputable_date",
            "date",
            "user_id",
            "notes",
            "currency_id",
            "agreed_exchange_rate",
            "payment_method_id",
            "total_exempt",
            "total_vat"
          ],
          "properties": {
            "type": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del tipo comprobante"
            },
            "id": {
              "type": "number",
              "format": "double",
              "description": "descripcion del numero comprobante"
            },
            "warehouse_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo deposito"
            },
            "linked_type": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del tipo comprobante vinculado"
            },
            "linked_id": {
              "type": "number",
              "format": "double",
              "description": "descripcion del numero comprovante vinculado"
            },
            "linked_line": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la linea comprobante vinculado"
            },
            "expiration_date": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha vencimiento"
            },
            "date": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha comprobante"
            },
            "imputable_date": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha imputable"
            },
            "user_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion de codigo usuario"
            },
            "notes": {
              "type": "string",
              "maxLength": 2000,
              "description": "descripcion de observaciones"
            },
            "currency_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo moneda"
            },
            "agreed_exchange_rate": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cotizacion pactada"
            },
            "payment_method_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo multiplazo"
            },
            "total_exempt": {
              "type": "number",
              "format": "double",
              "description": "descripcion del exento"
            },
            "total_vat": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total iva"
            },
            "products": {
              "required": [
                "product_id",
                "size",
                "quantity",
                "unit_price",
                "total_price"
              ],
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "product_id": {
                    "type": "string",
                    "maxLength": 15,
                    "description": "descripcion del codigo articulo"
                  },
                  "size": {
                    "type": "string",
                    "maxLength": 50,
                    "description": "descripcion de lote"
                  },
                  "quantity": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de cantidad"
                  },
                  "discount": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de descuento"
                  },
                  "unit_price": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de precio unitario"
                  },
                  "internal_tax": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de impuestos internos"
                  },
                  "netPrice": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion del precio neto"
                  },
                  "total_price": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion del precio total"
                  }
                }
              }
            },
            "provider": {
              "required": [
                "name",
                "address",
                "state_id",
                "city",
                "neighborhood",
                "user_id",
                "phone",
                "sales_tax_group_id",
                "vat_number",
                "notes",
                "email",
                "zipcode"
              ],
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo proveedor"
                },
                "name": {
                  "type": "string",
                  "maxLength": 50,
                  "description": "descripcion de la razon social"
                },
                "address": {
                  "type": "string",
                  "maxLength": 250,
                  "description": "descripcion de la direccion"
                },
                "state_id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo provincia"
                },
                "city": {
                  "type": "string",
                  "maxLength": 50,
                  "description": "descripcion de la localidad"
                },
                "neighborhood": {
                  "type": "string",
                  "maxLength": 50,
                  "description": "descripcion de barrio"
                },
                "user_id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo usuario"
                },
                "phone": {
                  "type": "string",
                  "maxLength": 100,
                  "description": "descripcion de telefono"
                },
                "sales_tax_group_id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo condicion iva"
                },
                "vat_number": {
                  "type": "string",
                  "maxLength": 13,
                  "description": "descripcion del cuit"
                },
                "notes": {
                  "type": "string",
                  "maxLength": 2000,
                  "description": "descripcion de comentarios"
                },
                "email": {
                  "type": "string",
                  "maxLength": 100,
                  "description": "descripcion del email"
                },
                "zipcode": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo postal"
                }
              }
            }
          }
        },
        "AdjustmentSheetGet": {
          "type": "object",
          "properties": {
            "CODIGOPARTICULAR": {
              "type": "string",
              "maxLength": 40,
              "description": "Descripcion del codigo particular del articulo"
            },
            "CODIGOARTICULO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo articulo del articulo"
            },
            "DESCRIPCION_ARTICULO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del articulo"
            },
            "DESCRIPCION_RUBRO": {
              "type": "string",
              "maxLength": 100,
              "description": "Descripcion del rubro del articulo"
            },
            "DESCRIPCION_SUPERRUBRO": {
              "type": "string",
              "maxLength": 100,
              "description": "Descripcion del super rubro del articulo"
            },
            "DESCRIPCION_GRUPOSUPERRUBRO": {
              "type": "string",
              "maxLength": 100,
              "description": "Descripcion del grupo de super rubro del articulo"
            },
            "LOTE": {
              "type": "string",
              "maxLength": 100,
              "description": "Descripcion del lote"
            },
            "CODIGOUSUARIO": {
              "type": "string",
              "maxLength": 5,
              "description": "Descripcion del codigo del usuario"
            },
            "INGRESO": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del ingreso"
            },
            "EGRESO": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del egreso"
            },
            "FECHA": {
              "type": "string",
              "format": "time-date",
              "description": "fecha del ajuste"
            },
            "NUMEROMOVIMIENTO": {
              "type": "integer",
              "description": "Descripcion del numero de movimiento"
            },
            "STOCK": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del stock"
            },
            "OBSERVACIONES": {
              "type": "string",
              "maxLength": 2000,
              "description": "Descripcion de las observaciones"
            },
            "CODIGODEPOSITO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo deposito"
            },
            "COSTOUNITARIO": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del costo unitario"
            },
            "DESCRIPCION_DEPOSITO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del deposito"
            },
            "DESCRIPCIONMOTIVOAJUSTESTOCK": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del motivo del ajuste del stock"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "Descripcion del numero de transaccion"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "time-date",
              "description": "fecha de modificacion"
            },
            "CODIGOMOTIVOAJUSTE": {
              "type": "integer",
              "description": "Descripcion del codigo del motivo del ajuste"
            },
            "HORA": {
              "type": "string",
              "format": "time-date",
              "description": "hora del ajuste"
            },
            "ORIGEN": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del origen"
            }
          }
        },
        "CorrectionReq": {
          "type": "object",
          "required": [
            "id",
            "warehouse_id",
            "observations"
          ],
          "properties": {
            "id": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo articulo"
            },
            "warehouse_id": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo deposito"
            },
            "size": {
              "type": "string",
              "maxLength": 100,
              "description": "Descripcion del lote"
            },
            "insert": {
              "type": "number",
              "format": "double",
              "description": "Descripcion de la cantidad ingreso"
            },
            "out": {
              "type": "number",
              "format": "double",
              "description": "Descripcion de la cantidad egreso"
            },
            "cost_insert": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del costo de ingreso"
            },
            "date": {
              "type": "string",
              "format": "date-time",
              "example": "1900-01-01T00:00:00.000Z",
              "description": "Descripcion de la fecha"
            },
            "currency_id_insert": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de codigo moneda de ingreso"
            },
            "quotation_insert": {
              "type": "number",
              "format": "double",
              "description": "Descripcion de cotizacion de ingreso"
            },
            "reason_insert": {
              "type": "integer",
              "description": "Descripcion de motivo de ingreso"
            },
            "observations": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de observaciones"
            },
            "cost_out": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del costo de egreso"
            },
            "currency_id_out": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de codigo moneda de egreso"
            },
            "reason_out": {
              "type": "integer",
              "description": "Descripcion de motivo de egreso"
            },
            "quotation_out": {
              "type": "number",
              "format": "double",
              "description": "Descripcion de cotizacion de egreso"
            }
          }
        },
        "AdjustmentReq": {
          "type": "object",
          "required": [
            "id",
            "warehouse_id",
            "newStock",
            "reason",
            "observations"
          ],
          "properties": {
            "id": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo articulo"
            },
            "warehouse_id": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo deposito"
            },
            "size": {
              "type": "string",
              "maxLength": 100,
              "description": "Descripcion del lote"
            },
            "newStock": {
              "type": "number",
              "format": "double",
              "description": "Descripcion de nuevo stock"
            },
            "cost_insert": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del costo de ingreso"
            },
            "date": {
              "type": "string",
              "format": "date-time",
              "example": "1900-01-01T00:00:00.000Z",
              "description": "Descripcion de la fecha"
            },
            "currency_id": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de codigo moneda"
            },
            "quotation": {
              "type": "number",
              "format": "double",
              "description": "Descripcion de cotizacion"
            },
            "reason": {
              "type": "integer",
              "description": "Descripcion de motivo"
            },
            "observations": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de observaciones"
            },
            "cost_out": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del costo de egreso"
            }
          }
        },
        "ComprobantesCompraGetProduct": {
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del tipo comprobante"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double",
              "description": "descripcion del numero comprobante"
            },
            "CODIGOPROVEEDOR": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo proveedor"
            },
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha comprobante"
            },
            "RAZONSOCIAL": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la razon social"
            },
            "DIRECCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de la direccion"
            },
            "TOTAL": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total"
            },
            "HORA": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la hora"
            },
            "CODIGOUSUARIO": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion codigo usuario"
            },
            "COMENTARIOS": {
              "type": "string",
              "maxLength": 2000,
              "description": "descripcion de comentarios"
            },
            "FECHAPREVISTAENTREGA": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha prevista entrega"
            },
            "ANULADA": {
              "type": "integer",
              "description": "descripcion de anulada"
            },
            "REMITOFACTURADO": {
              "type": "integer",
              "description": "descripcion remito facturado"
            },
            "ATENCION": {
              "type": "string",
              "maxLength": 50,
              "description": "descripcion de atencion"
            },
            "CODIGOTRANSPORTE": {
              "type": "integer",
              "description": "descripcion codigo transporte"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha modificacion"
            },
            "CODIGOMONEDA": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion codigo moneda"
            },
            "COTIZACION": {
              "type": "number",
              "format": "double",
              "description": "descripcion cotizacion"
            },
            "COTIZACIONPACTADA": {
              "type": "number",
              "format": "double",
              "description": "descripcion cotizacion pactada"
            },
            "CODIGODEPOSITO": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion codigo deposito"
            },
            "CODIGOMULTIPLAZO": {
              "type": "integer",
              "description": "descripcion codigo multiplazo"
            },
            "AUTORIZADA": {
              "type": "integer",
              "description": "descripcion autorizada"
            },
            "CODIGOUSUARIOAUTORIZO": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion codigo usuario autorizo"
            },
            "FECHAAUTORIZACION": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha autorizacion"
            },
            "NUMEROOPERACION": {
              "type": "number",
              "format": "double",
              "description": "descripcion numero operacion"
            },
            "CODIGOARTICULO": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion de codigo articulo"
            },
            "CODIGOPARTICULAR": {
              "type": "string",
              "maxLength": 40,
              "description": "descripcion de codigo particular"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 250,
              "description": "descripcion"
            },
            "LINEA": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la linea"
            },
            "CANTIDADPEDIDA": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cantidad pedida"
            },
            "CANTIDADRECIBIDA": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cantidad recibida"
            },
            "CANTIDADINGRESADA": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cantidad ingresada"
            },
            "PRECIOUNITARIO": {
              "type": "number",
              "format": "double",
              "description": "descripcion de precio unitario"
            },
            "PRECIOANTERIOR": {
              "type": "number",
              "format": "double",
              "description": "descripcion de precio anterior"
            },
            "PRECIOTOTAL": {
              "type": "number",
              "format": "double",
              "description": "descripcion de precio total"
            },
            "TOTALCANTIDAD": {
              "type": "number",
              "format": "double",
              "description": "Descripcion el total de las cantidades"
            },
            "MONTOIVA": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del monto del iva"
            },
            "TOTALCANTIDADREMITIDA": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del total de la cantidad remitida"
            },
            "TOTALPENDIENTE": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del total pendiente"
            }
          }
        },
        "MotivosAjustesStock": {
          "type": "object",
          "properties": {
            "CODIGOMOTIVOAJUSTESTOCK": {
              "type": "integer",
              "description": "Descripcion del codigo del motivo de ajuste de stock"
            },
            "DESCRIPCIONMOTIVOAJUSTESTOCK": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion del motivo de ajuste del stock"
            },
            "TIPOAJUSTE": {
              "type": "integer",
              "description": "Descripcion del tipo de ajuste"
            },
            "ACTIVO": {
              "type": "boolean",
              "description": "Descripcion de si esta activo"
            },
            "FECHAALTA": {
              "type": "string",
              "format": "date-time",
              "example": "1900-01-01T00:00:00.000Z",
              "description": "Descripcion de la fecha de alta"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "example": "1900-01-01T00:00:00.000Z",
              "description": "Descripcion de la fecha de modificacion"
            }
          }
        },
        "MotivosAjustesStockReq": {
          "type": "object",
          "required": [
            "description",
            "adjustmentType"
          ],
          "properties": {
            "description": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion del motivo de ajuste del stock"
            },
            "adjustmentType": {
              "type": "integer",
              "description": "Descripcion del tipo de ajuste (1 = Incrementa stock; 2 = Decrementa stock; 3 = Incrementa stock y Decrementa stock)"
            },
            "active": {
              "type": "boolean",
              "description": "Descripcion de si esta activo"
            }
          }
        },
        "MotivosAjustesStockUpd": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion del motivo de ajuste del stock"
            },
            "adjustmentType": {
              "type": "integer",
              "description": "Descripcion del tipo de ajuste (1 = Incrementa stock; 2 = Decrementa stock; 3 = Incrementa stock y Decrementa stock)"
            },
            "active": {
              "type": "boolean",
              "description": "Descripcion de si esta activo"
            }
          }
        },
        "PutDispatchCancel": {
          "type": "object",
          "properties": {
            "id": {
              "type": "number",
              "description": "Numero remito anular"
            },
            "provider_id": {
              "type": "string",
              "maxLength": 15,
              "description": "Codigo proveedor"
            },
            "reason_cancel": {
              "type": "string",
              "maxLength": 15,
              "description": "Motivo de la anulacion"
            }
          }
        },
        "PutPurchaseOrderCancel": {
          "type": "object",
          "properties": {
            "id": {
              "type": "number",
              "description": "Numero orden de compra anular"
            },
            "provider_id": {
              "type": "string",
              "maxLength": 15,
              "description": "Codigo proveedor"
            },
            "reason_cancel": {
              "type": "string",
              "maxLength": 15,
              "description": "Motivo de la anulacion"
            }
          }
        },
        "BarriosGet": {
          "type": "object",
          "properties": {
            "CODIGOBARRIO": {
              "type": "integer",
              "description": "Descripcion del codigo barrio"
            },
            "NOMBRE": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion del nombre"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "example": "1900-01-01T00:00:00.000Z",
              "description": "Descripcion de la fecha de modificacion"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "Descripcion del numero transaccion"
            },
            "CODIGOLOCALIDAD": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de codigo localidad"
            },
            "CODIGOPOSTAL": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de codigo postal"
            },
            "CODIGOZONA": {
              "type": "integer",
              "description": "Descripcion de codigo zona"
            },
            "NOMBRE_LOCALIDAD": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de nombre localidad"
            },
            "DESCRIPCION_ZONA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion de zona"
            },
            "NOMBRE_PROVINCIA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de nombre provincia"
            },
            "CODIGOPROVINCIA": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de codigo provincia"
            }
          }
        },
        "BarriosPut": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de nombre"
            },
            "cityCode": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de codigo localidad"
            },
            "zipcode": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de codigo postal"
            },
            "zoneCode": {
              "type": "integer",
              "description": "Descripcion de codigo zona"
            }
          }
        },
        "BarriosPost": {
          "type": "object",
          "required": [
            "name",
            "cityCode",
            "zoneCode"
          ],
          "properties": {
            "name": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de nombre"
            },
            "cityCode": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de codigo localidad"
            },
            "zipcode": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de codigo postal"
            },
            "zoneCode": {
              "type": "integer",
              "description": "Descripcion de codigo zona"
            }
          }
        },
        "manualinvoice": {
          "properties": {
            "cart": {
              "type": "object",
              "required": [
                "salespointnumeration",
                "type",
                "number",
                "warehouse_id",
                "date",
                "user_id",
                "currency_id",
                "general_discount",
                "payment_method_id",
                "customer",
                "products",
                "paymentsDetail"
              ],
              "properties": {
                "salespointnumeration": {
                  "type": "number",
                  "description": "NUMERACION DEL PUNTO DE VENTA DEL COMPROBANTE"
                },
                "type": {
                  "type": "string",
                  "description": "TIPO DE COMPROBANTE - FA,FB,FC,FM,FE,FT,FCA,FCB,FCC"
                },
                "number": {
                  "type": "number",
                  "description": "NUMERO DE COMPROBANTE"
                },
                "notes": {
                  "type": "string",
                  "description": "COMENTARIOS"
                },
                "price_list_id": {
                  "type": "string",
                  "description": "LISTAPRECIO"
                },
                "operation_type_id": {
                  "type": "string",
                  "description": "CODIGOOPERACION"
                },
                "warehouse_id": {
                  "type": "string",
                  "description": "CODIGODEPOSITO"
                },
                "date": {
                  "type": "string",
                  "description": "FECHACOMPROBANTE"
                },
                "user_id": {
                  "type": "string",
                  "description": "CODIGOUSUARIO"
                },
                "currency_id": {
                  "type": "string",
                  "description": "CODIGOMONEDA"
                },
                "general_discount": {
                  "type": "string",
                  "description": "DESCUENTOPORCENTAJE"
                },
                "payment_method_id": {
                  "type": "string",
                  "description": "CODIGOMULTIPLAZO"
                },
                "deliver": {
                  "type": "number",
                  "description": "ENTREGAR"
                },
                "customer": {
                  "type": "object",
                  "required": [
                    "name",
                    "state_id",
                    "city",
                    "phone"
                  ],
                  "properties": {
                    "notes": {
                      "type": "string",
                      "description": "COMENTARIOS"
                    },
                    "vat_number": {
                      "type": "string",
                      "description": "CUIT"
                    },
                    "id": {
                      "type": "string",
                      "description": "CODIGOCLIENTE"
                    },
                    "name": {
                      "type": "string",
                      "description": "RAZONSOCIAL"
                    },
                    "address": {
                      "type": "string",
                      "description": "DIRECCION"
                    },
                    "state_id": {
                      "type": "string",
                      "description": "CODIGOPROVINCIA"
                    },
                    "city": {
                      "type": "string",
                      "description": "LOCALIDAD"
                    },
                    "neighborhood": {
                      "type": "string",
                      "description": "BARRIO"
                    },
                    "user_id": {
                      "type": "string",
                      "description": "CODIGOVENDEDOR o CODIGOCOBRADOR"
                    },
                    "price_list_id": {
                      "type": "string",
                      "description": "CODIGOLISTA"
                    },
                    "phone": {
                      "type": "string",
                      "description": "TELEFONO"
                    },
                    "cell_phone": {
                      "type": "string",
                      "description": "CELULAR (A partir de la version 03.39.001.0004.00 el dato se guarda en el campo TELEFONOCELULAR)"
                    },
                    "sales_tax_group_id": {
                      "type": "string",
                      "description": "CONDICIONIVA"
                    },
                    "document_id": {
                      "type": "string",
                      "description": "DOCUMENTO"
                    },
                    "email": {
                      "type": "string",
                      "description": "EMAIL"
                    },
                    "zipcode": {
                      "type": "string",
                      "description": "CP (codigo postal)"
                    },
                    "activity_id": {
                      "type": "string",
                      "description": "codigo de actividad"
                    },
                    "grossincome": {
                      "type": "string",
                      "description": "ingresos brutos"
                    },
                    "account": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de la cuenta corriente"
                    },
                    "creditLimit": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite de credito (este campo es requerido si account = 1)"
                    },
                    "creditLimitDoc": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite de credito doc (este campo es requerido si account = 1)"
                    },
                    "payment_method_id": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite del codigo del multiplazo(este campo es requerido si account = 1)"
                    },
                    "credit_amount_req": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del monto del credito solicitado"
                    },
                    "fixed_payment_method": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion del multiplazo fijo"
                    },
                    "account_disabled": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de deshabilitar la cuenta corriente"
                    },
                    "expired_days": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de dias vencidos"
                    },
                    "promotion_bill": {
                      "type": "integer",
                      "description": "descripcion de ofertas facturables (solo 0 o 1, si el codigo cliente no existe y dicho campo es null se inserta 1, si el codigo cliente existe y dicho campo es null no modifica su valor en la tabla)"
                    }
                  }
                },
                "products": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": [
                      "product_id",
                      "size",
                      "quantity",
                      "unit_price",
                      "total_price"
                    ],
                    "properties": {
                      "product_id": {
                        "type": "string",
                        "maxLength": 15,
                        "description": "descripcion del codigo articulo"
                      },
                      "size": {
                        "type": "string",
                        "maxLength": 50,
                        "description": "descripcion de lote"
                      },
                      "quantity": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de cantidad"
                      },
                      "discount": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de descuento"
                      },
                      "unit_price": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de precio unitario"
                      },
                      "internal_tax": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de impuestos internos"
                      },
                      "netPrice": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion del precio neto"
                      },
                      "total_price": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion del precio total"
                      },
                      "equivalences": {
                        "type": "number",
                        "description": "si se coloca 1 toma el valor con la equivalencia que tenga el articulo con 0 lo toma como la cantidad enviada del articulo (SOLO CORRALON)"
                      },
                      "packaging_code": {
                        "type": "string",
                        "description": "Codigo de empaque (SOLO ENTERPRISE)"
                      },
                      "product_descriptions": {
                        "type": "object",
                        "required": [
                          "overwrite_description"
                        ],
                        "properties": {
                          "overwrite_description": {
                            "type": "number",
                            "description": "DESCRIPCION DE SOBREESCRIBIR LA DESCRIPCION DEL ARTICULO"
                          },
                          "descriptions": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "description": {
                                  "type": "string",
                                  "description": "DETALLE DEL ARTICULO QUE SE DESEA AGREGAR"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "paymentsDetail": {
                  "type": "object",
                  "description": "este campo SOLO es requerido si el tipo (type) de orden es FC (Factura)",
                  "properties": {
                    "cash": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCash"
                      }
                    },
                    "coupon": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCoupon"
                      }
                    },
                    "wireTransfer": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentWireTransfer"
                      }
                    },
                    "checks": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCheck"
                      }
                    }
                  }
                },
                "geolocation": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string"
                    },
                    "number": {
                      "type": "number",
                      "format": "double"
                    },
                    "latitude": {
                      "type": "string"
                    },
                    "length": {
                      "type": "string"
                    }
                  }
                },
                "saleType": {
                  "type": "integer",
                  "description": "CONTADO 0 - CUENTACORRIENTE 1"
                },
                "cae": {
                  "type": "object",
                  "properties": {
                    "numberCae": {
                      "type": "string"
                    },
                    "dateExpired": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "dateRequested": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "afipResponse": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        },
        "PuntosDeVentaGet": {
          "type": "object",
          "properties": {
            "CODIGOPUNTOVENTA": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del punto de venta"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion"
            },
            "NUMERACION": {
              "type": "integer",
              "description": "Descripcion de la numeracion del punto de venta"
            },
            "ESAGRUPADA": {
              "type": "integer",
              "description": "Descripcion de si es agrupada"
            },
            "IMPRESION": {
              "type": "string",
              "maxLength": 2,
              "description": "Descripcion de la impresion ('I' = 'IMPRESORA'; 'M' = 'MANUAL(NO IMPRIME EL SISTEMA)'; 'C' = 'CONTROLADOR FISCAL')"
            },
            "SALIDAIMPRESORA": {
              "type": "string",
              "maxLength": 2,
              "description": "Descripcion de la salida de la impresora"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "example": "1900-01-01T00:00:00.000Z",
              "description": "Descripcion de la fecha de modificacion"
            },
            "NUMEROTRANSACCION": {
              "type": "integer",
              "description": "Descripcion del numero transaccion"
            },
            "MARCAIMPRESORA": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion de la marca de la impresora"
            },
            "MODELOIMPRESORA": {
              "type": "string",
              "maxLength": 20,
              "description": "Descripcion del modelo de la impresora"
            },
            "PUERTOIMPRESORA": {
              "type": "string",
              "maxLength": 2,
              "description": "Descripcion del puerto de la impresora"
            },
            "IMPRIMEDESDESISTEMA": {
              "type": "integer",
              "description": "Descripcion de si imprime desde el sistema (0 = 'SEVIDOR DE IMPRESION'; '1' = 'DESDE EL SISTEMA'; )"
            },
            "CODIGOMONEDA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del codigo de la moneda"
            },
            "TIPOPROTOCOLO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del tipo de protocolo"
            },
            "CODIGOSUCURSAL": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del codigo de la sucursal"
            },
            "CAINUMERO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del cai numero"
            },
            "CAIFECHA": {
              "type": "string",
              "format": "date-time",
              "example": "1900-01-01T00:00:00.000Z",
              "description": "Descripcion de la fecha del cai"
            },
            "IMPRIMECONTROLDEPOSITO": {
              "type": "integer",
              "description": "Descripcion de imprime control deposito"
            },
            "CANTIDADESPORBULTO": {
              "type": "integer",
              "description": "Descripcion de cantidades por bulto"
            },
            "FACTURAELECTRONICA": {
              "type": "integer",
              "description": "Descripcion de factura electronica"
            },
            "USAMOTOROFERTAS": {
              "type": "integer",
              "description": "Descripcion de si usa motor de ofertas"
            },
            "IMPRIMELOTEPORSEPARADO": {
              "type": "integer",
              "description": "Descripcion de imprime lote por separado"
            },
            "IMPRIMESUMARIZADOPORTALLE": {
              "type": "integer",
              "description": "Descripcion de imprime sumarizado por talle"
            },
            "CAEANTICIPADO": {
              "type": "integer",
              "description": "Descripcion de cae anticipado"
            },
            "MONEDACOMPROBANTE": {
              "type": "integer",
              "description": "Descripcion de la moneda del comprobante"
            },
            "GENERATICKETCAMBIO": {
              "type": "integer",
              "description": "Descripcion de si genera ticket de cambio"
            },
            "UTILIZAUSB": {
              "type": "integer",
              "description": "Descripcion de si utiliza usb"
            },
            "SOLICITACAEFACTURA": {
              "type": "integer",
              "description": "Descripcion de si solicita ce factura"
            },
            "REG27440": {
              "type": "integer",
              "description": "Descripcion de REG27440"
            },
            "DESCRIPCION_MONEDA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion de la moneda"
            },
            "DESCRIPCION_SUCURSAL": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion de la sucursal"
            },
            "DESCRIPCION_IMPRESION": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion de la impresion"
            },
            "DESCRIPCION_IMPRIMEDESDESISTEMA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion de si imprime desde sistema"
            }
          }
        },
        "PlanillaRemitoResumidoVentaGet": {
          "type": "object",
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del tipo de comprobante"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "description": "Descripcion del numero del comprobante"
            },
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "date",
              "description": "Descripcion de la fecha del comprobante"
            },
            "RAZONSOCIAL": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la razon social (SOLO ENTERPRISE)"
            },
            "TELEFONO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del telefono"
            },
            "MONTOPENDIENTE": {
              "type": "number",
              "description": "Descripcion del monto pendiente (SOLO ENTERPRISE)"
            },
            "MONTOTOTAL": {
              "type": "number",
              "description": "Descripcion del monto total (SOLO ENTERPRISE)"
            },
            "FACT": {
              "type": "string",
              "maxLength": 5,
              "description": "Descripcion de fact (SOLO ENTERPRISE)"
            },
            "RESPONSABLE": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del responsable"
            },
            "ZONA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la zona (SOLO ENTERPRISE)"
            },
            "MONTOTOTALCONIVA": {
              "type": "number",
              "description": "Descripcion del monto total con iva (SOLO ENTERPRISE)"
            },
            "DEPOSITO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del deposito (SOLO ENTERPRISE)"
            },
            "REMITO": {
              "type": "string",
              "maxLength": 475,
              "description": "Descripcion remito (SOLO CORRALON)"
            },
            "CLIENTE": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del cliente (SOLO CORRALON)"
            },
            "MONTO": {
              "type": "number",
              "description": "Descripcion del monto (SOLO CORRALON)"
            },
            "CANCELADO": {
              "type": "string",
              "maxLength": 5,
              "description": "Descripcion de cancelado (SOLO CORRALON)"
            },
            "VENDEDOR": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del vendedor (SOLO CORRALON)"
            },
            "COMENTARIOS": {
              "type": "string",
              "maxLength": 2000,
              "description": "Descripcion del comentario (SOLO CORRALON)"
            },
            "MOTIVO": {
              "type": "string",
              "maxLength": 250,
              "description": "Descripcion del motivo (SOLO CORRALON)"
            },
            "FORMAPAGO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la forma de pago (SOLO CORRALON)"
            },
            "DIRECCIONENTREGA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la entrega (SOLO CORRALON)"
            },
            "LOCALIDAD": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la localidad (SOLO CORRALON)"
            },
            "DESCRIPCIONDEPOSITO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del deposito (SOLO CORRALON)"
            },
            "ORIGEN": {
              "type": "string",
              "description": "Descripcion del origen"
            }
          }
        },
        "PlanillaRemitoDetalladoVentaGet": {
          "type": "object",
          "properties": {
            "TIPOCOMPROBANTE": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del tipo de comprobante (SOLO ENTERPRISE)"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "description": "Descripcion del numero del comprobante (SOLO ENTERPRISE)"
            },
            "LINEA": {
              "type": "integer",
              "description": "Descripcion de linea del comprobante (SOLO ENTERPRISE)"
            },
            "CODIGOPARTICULAR": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo particular del articulo (SOLO ENTERPRISE)"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 250,
              "description": "Descripcion (SOLO ENTERPRISE)"
            },
            "CANTIDAD": {
              "type": "number",
              "description": "Descripcion del monto pendiente (SOLO ENTERPRISE)"
            },
            "DESCUENTO": {
              "type": "number",
              "description": "Descripcion del descuento (SOLO ENTERPRISE)"
            },
            "PRECIOUNITARIO": {
              "type": "number",
              "description": "Descripcion del precio unitario"
            },
            "MONTOTOTAL": {
              "type": "number",
              "description": "Descripcion del monto total (SOLO ENTERPRISE)"
            },
            "CANTIDADREMITIDA": {
              "type": "number",
              "description": "Descripcion de la cantidad remitida"
            },
            "MONTOPENDIENTE": {
              "type": "number",
              "description": "Descripcion del monto pendiente (SOLO ENTERPRISE)"
            },
            "DEPOSITO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del deposito (SOLO ENTERPRISE)"
            },
            "CODIGOPARTICULARCLIENTE": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo particular del cliente (SOLO CORRALON)"
            },
            "RAZONSOCIAL": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la razon social (SOLO CORRALON)"
            },
            "CODIGOPARTICULARARTICULO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo particular articulo (SOLO CORRALON)"
            },
            "ARTICULODESCRIPCION": {
              "type": "string",
              "maxLength": 250,
              "description": "Descripcion del articulo (SOLO CORRALON)"
            },
            "FECHAREMITO": {
              "type": "string",
              "format": "date",
              "description": "Descripcion de la fecha del remito (SOLO CORRALON)"
            },
            "TIPOREMITO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del tipo de remito (SOLO CORRALON)"
            },
            "NUMEROREMITO": {
              "type": "number",
              "description": "Descripcion del numero de remito (SOLO CORRALON)"
            },
            "LINEAREMITO": {
              "type": "integer",
              "description": "Descripcion de la linea de remito (SOLO CORRALON)"
            },
            "FECHANE": {
              "type": "string",
              "format": "date",
              "description": "Descripcion de la fecha de NE (SOLO CORRALON)"
            },
            "NUMERONE": {
              "type": "number",
              "description": "Descripcion del numero de NE (SOLO CORRALON)"
            },
            "LINEANE": {
              "type": "integer",
              "description": "Descripcion de la linea de NE (SOLO CORRALON)"
            },
            "CANTIDADNE": {
              "type": "number",
              "description": "Descripcion del cantidad de NE (SOLO CORRALON)"
            },
            "CANTIDADENTREGADA": {
              "type": "number",
              "description": "Descripcion del cantidad entregada (SOLO CORRALON)"
            },
            "CANTIDADPENDIENTE": {
              "type": "number",
              "description": "Descripcion del cantidad pendiente (SOLO CORRALON)"
            },
            "FECHACMP": {
              "type": "string",
              "format": "date",
              "description": "Descripcion de la fecha de CMP (SOLO CORRALON)"
            },
            "TIPOCMP": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del tipo de CMP (SOLO CORRALON)"
            },
            "NUMEROCMP": {
              "type": "number",
              "description": "Descripcion del numero de CMP (SOLO CORRALON)"
            },
            "LINEACMP": {
              "type": "integer",
              "description": "Descripcion de la linea de CMP (SOLO CORRALON)"
            },
            "CANTCMP": {
              "type": "number",
              "description": "Descripcion de la cantidad de CMP (SOLO CORRALON)"
            },
            "DIRECCIONENTREGA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la direccion de entrega (SOLO CORRALON)"
            },
            "FORMAENTREGA": {
              "type": "string",
              "maxLength": 475,
              "description": "Descripcion de la forma de entrega (SOLO CORRALON)"
            },
            "CODDEPOSITO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo de deposito (SOLO CORRALON)"
            },
            "DESCRIPCIONDEPOSITO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del deposito (SOLO CORRALON)"
            },
            "UBICACIONDEPOSITO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la unicacion del deposito (SOLO CORRALON)"
            },
            "MOVIL": {
              "type": "string",
              "maxLength": 250,
              "description": "Descripcion del movil (SOLO CORRALON)"
            },
            "CHOFERACOMPANIANTE": {
              "type": "string",
              "maxLength": 225,
              "description": "Descripcion del chofer y acompañiante (SOLO CORRALON)"
            },
            "COSTOUNITARIO": {
              "type": "number",
              "description": "Descripcion del costo unitario (SOLO CORRALON)"
            },
            "COSTOUNITARIOACTUAL": {
              "type": "number",
              "description": "Descripcion del costo unitario actual (SOLO CORRALON)"
            },
            "DESCRIPCIONFORMAPAGO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la forma de pago (SOLO CORRALON)"
            },
            "MULTIPLAZO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del multiplazo (SOLO CORRALON)"
            },
            "DESCUENTOFORMAPAGO": {
              "type": "number",
              "description": "Descripcion del descuento forma pago (SOLO CORRALON)"
            },
            "VENDEDOR": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo del vendedor (SOLO CORRALON)"
            },
            "MOTIVO": {
              "type": "string",
              "maxLength": 250,
              "description": "Descripcion del motivo (SOLO CORRALON)"
            },
            "PESOUNITARIO": {
              "type": "number",
              "description": "Descripcion del peso unitario (SOLO CORRALON)"
            },
            "VOLUMENUNITARIO": {
              "type": "number",
              "description": "Descripcion del volumen unitario (SOLO CORRALON)"
            },
            "ESFLETE": {
              "type": "string",
              "maxLength": 5,
              "description": "Descripcion del flete (SOLO CORRALON)"
            },
            "CHOFER": {
              "type": "string",
              "maxLength": 100,
              "description": "Descripcion del chofer (SOLO CORRALON)"
            },
            "ACOMPANIANTE": {
              "type": "string",
              "maxLength": 100,
              "description": "Descripcion del acompañiante (SOLO CORRALON)"
            },
            "PESOTOTAL": {
              "type": "number",
              "description": "Descripcion del peso total (SOLO CORRALON)"
            },
            "VOLUMENTOTAL": {
              "type": "number",
              "description": "Descripcion del volumen total (SOLO CORRALON)"
            },
            "MARCADOFACT": {
              "type": "string",
              "maxLength": 5,
              "description": "Descripcion del marcado fact (SOLO CORRALON)"
            },
            "RUBRO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del rubro (SOLO CORRALON)"
            },
            "SUPERRUBRO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del super rubro (SOLO CORRALON)"
            },
            "GRUPOSUPERRUBRO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del grupo super rubro (SOLO CORRALON)"
            },
            "TIPOENTREGA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del tipo de entrega (SOLO CORRALON)"
            },
            "DISTANCIA": {
              "type": "number",
              "description": "Descripcion de la distancia (SOLO CORRALON)"
            },
            "LOTE": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del lote (SOLO CORRALON)"
            },
            "LOCALIDAD": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la localidad (SOLO CORRALON)"
            },
            "HORAREMITIDA": {
              "type": "string",
              "format": "date",
              "description": "Descripcion de la hora remitida (SOLO CORRALON)"
            },
            "HORANE": {
              "type": "string",
              "format": "date",
              "description": "Descripcion de NE (SOLO CORRALON)"
            },
            "HORACMP": {
              "type": "string",
              "format": "date",
              "description": "Descripcion de CMP (SOLO CORRALON)"
            },
            "LOCALIDADENTREGA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la localidad de entrega (SOLO CORRALON)"
            },
            "UNIDADMEDIDA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la unidad de medida (SOLO CORRALON)"
            },
            "COEFICIENTEEQUIVALENCIA": {
              "type": "number",
              "description": "Descripcion del coeficiente de equivalencia (SOLO CORRALON)"
            },
            "ORIGEN": {
              "type": "string",
              "description": "Descripcion del origen"
            }
          }
        },
        "PutDispatchdevolutionCancel": {
          "type": "object",
          "required": [
            "id",
            "provider_id",
            "reason_cancel"
          ],
          "properties": {
            "id": {
              "type": "number",
              "description": "Numero remito anular"
            },
            "provider_id": {
              "type": "string",
              "maxLength": 15,
              "description": "Codigo proveedor"
            },
            "reason_cancel": {
              "type": "string",
              "maxLength": 15,
              "description": "Motivo de la anulacion"
            }
          }
        },
        "RemitoDevolucionCompraPost": {
          "required": [
            "warehouse_id",
            "expiration_date",
            "imputable_date",
            "date",
            "user_id",
            "notes",
            "currency_id",
            "agreed_exchange_rate",
            "payment_method_id",
            "total_exempt",
            "total_vat"
          ],
          "properties": {
            "warehouse_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo deposito"
            },
            "linked_type": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del tipo comprobante vinculado"
            },
            "linked_id": {
              "type": "number",
              "format": "double",
              "description": "descripcion del numero comprovante vinculado"
            },
            "linked_line": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la linea comprobante vinculado"
            },
            "expiration_date": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha vencimiento"
            },
            "date": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha comprobante"
            },
            "imputable_date": {
              "type": "string",
              "format": "date-time",
              "description": "descripcion de la fecha imputable"
            },
            "user_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion de codigo usuario"
            },
            "notes": {
              "type": "string",
              "maxLength": 2000,
              "description": "descripcion de observaciones"
            },
            "currency_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo moneda"
            },
            "agreed_exchange_rate": {
              "type": "number",
              "format": "double",
              "description": "descripcion de la cotizacion pactada"
            },
            "payment_method_id": {
              "type": "string",
              "maxLength": 15,
              "description": "descripcion del codigo multiplazo"
            },
            "total_exempt": {
              "type": "number",
              "format": "double",
              "description": "descripcion del exento"
            },
            "total_vat": {
              "type": "number",
              "format": "double",
              "description": "descripcion del total iva"
            },
            "products": {
              "required": [
                "product_id",
                "size",
                "quantity",
                "unit_price",
                "total_price"
              ],
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "product_id": {
                    "type": "string",
                    "maxLength": 15,
                    "description": "descripcion del codigo articulo"
                  },
                  "size": {
                    "type": "string",
                    "maxLength": 50,
                    "description": "descripcion de lote"
                  },
                  "quantity": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de cantidad - menor a cero"
                  },
                  "discount": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de descuento"
                  },
                  "unit_price": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de precio unitario"
                  },
                  "internal_tax": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion de impuestos internos"
                  },
                  "netPrice": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion del precio neto"
                  },
                  "total_price": {
                    "type": "number",
                    "format": "double",
                    "description": "descripcion del precio total"
                  }
                }
              }
            },
            "provider": {
              "required": [
                "name",
                "address",
                "state_id",
                "city",
                "neighborhood",
                "user_id",
                "phone",
                "sales_tax_group_id",
                "vat_number",
                "notes",
                "email",
                "zipcode"
              ],
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo proveedor"
                },
                "name": {
                  "type": "string",
                  "maxLength": 50,
                  "description": "descripcion de la razon social"
                },
                "address": {
                  "type": "string",
                  "maxLength": 250,
                  "description": "descripcion de la direccion"
                },
                "state_id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo provincia"
                },
                "city": {
                  "type": "string",
                  "maxLength": 50,
                  "description": "descripcion de la localidad"
                },
                "neighborhood": {
                  "type": "string",
                  "maxLength": 50,
                  "description": "descripcion de barrio"
                },
                "user_id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo usuario"
                },
                "phone": {
                  "type": "string",
                  "maxLength": 100,
                  "description": "descripcion de telefono"
                },
                "sales_tax_group_id": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo condicion iva"
                },
                "vat_number": {
                  "type": "string",
                  "maxLength": 13,
                  "description": "descripcion del cuit"
                },
                "notes": {
                  "type": "string",
                  "maxLength": 2000,
                  "description": "descripcion de comentarios"
                },
                "email": {
                  "type": "string",
                  "maxLength": 100,
                  "description": "descripcion del email"
                },
                "zipcode": {
                  "type": "string",
                  "maxLength": 15,
                  "description": "descripcion del codigo postal"
                }
              }
            }
          }
        },
        "SucursalesExportacionGet": {
          "type": "object",
          "properties": {
            "CODIGOSUCURSAL": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del codigo de sucursal"
            },
            "IDSUCURSAL": {
              "type": "integer",
              "description": "Descripcion del id sucursal (SOLO ENTERPRISE)"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la sucursal exportacion"
            },
            "CONSOLIDA": {
              "type": "integer",
              "description": "Descripcion de consolida"
            }
          }
        },
        "creditnoteventa": {
          "properties": {
            "cart": {
              "type": "object",
              "required": [
                "warehouse_id",
                "date",
                "user_id",
                "currency_id",
                "general_discount",
                "payment_method_id",
                "linked_type",
                "type_creditnote",
                "linked_lines",
                "customer",
                "products",
                "paymentsDetail"
              ],
              "properties": {
                "notes": {
                  "type": "string",
                  "description": "Comentarios nota de crédito"
                },
                "price_list_id": {
                  "type": "string",
                  "description": "Lista de precios nota de crédito"
                },
                "operation_type_id": {
                  "type": "string",
                  "description": "Código operación nota de crédito"
                },
                "type": {
                  "type": "string",
                  "description": "Tipo de comprobante (NC)"
                },
                "linked_type": {
                  "type": "string",
                  "description": "Tipo de comprobante vinculado (RE FA FB FC FM FE FT)"
                },
                "type_creditnote": {
                  "type": "string",
                  "description": "Tipo de nota de crédito (DEVOLUCION-ANULACION)"
                },
                "linked_lines": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": [
                      "linked_number",
                      "linelinked",
                      "quantitylinked"
                    ],
                    "properties": {
                      "linked_number": {
                        "type": "number",
                        "description": "Número de comprobante vinculado"
                      },
                      "linelinked": {
                        "type": "number",
                        "format": "double",
                        "description": "Línea comprobante vinculado"
                      },
                      "quantitylinked": {
                        "type": "number",
                        "format": "double",
                        "description": "Cantidad línea comprobante vinculado"
                      },
                      "packaging_code": {
                        "type": "string",
                        "description": "Codigo de empaque (SOLO ENTERPRISE)"
                      }
                    }
                  }
                },
                "warehouse_id": {
                  "type": "string",
                  "description": "CODIGODEPOSITO"
                },
                "date": {
                  "type": "string",
                  "description": "FECHACOMPROBANTE"
                },
                "user_id": {
                  "type": "string",
                  "description": "CODIGOUSUARIO"
                },
                "currency_id": {
                  "type": "string",
                  "description": "CODIGOMONEDA"
                },
                "general_discount": {
                  "type": "string",
                  "description": "DESCUENTO"
                },
                "payment_method_id": {
                  "type": "string",
                  "description": "CODIGOMULTIPLAZO"
                },
                "customer": {
                  "type": "object",
                  "required": [
                    "name",
                    "state_id",
                    "address",
                    "phone"
                  ],
                  "properties": {
                    "notes": {
                      "type": "string",
                      "description": "COMENTARIOS"
                    },
                    "vat_number": {
                      "type": "string",
                      "description": "CUIT"
                    },
                    "id": {
                      "type": "string",
                      "description": "CODIGOCLIENTE"
                    },
                    "name": {
                      "type": "string",
                      "description": "RAZONSOCIAL"
                    },
                    "address": {
                      "type": "string",
                      "description": "DIRECCION"
                    },
                    "state_id": {
                      "type": "string",
                      "description": "CODIGOPROVINCIA"
                    },
                    "city": {
                      "type": "string",
                      "description": "LOCALIDAD"
                    },
                    "neighborhood": {
                      "type": "string",
                      "description": "BARRIO"
                    },
                    "user_id": {
                      "type": "string",
                      "description": "CODIGOVENDEDOR o CODIGOCOBRADOR"
                    },
                    "price_list_id": {
                      "type": "string",
                      "description": "CODIGOLISTA"
                    },
                    "phone": {
                      "type": "string",
                      "description": "TELEFONO"
                    },
                    "cell_phone": {
                      "type": "string",
                      "description": "CELULAR (A partir de la version 03.39.001.0004.00 el dato se guarda en el campo TELEFONOCELULAR)"
                    },
                    "sales_tax_group_id": {
                      "type": "string",
                      "description": "CONDICIONIVA (ES REQUERIDO PARA CORRALON)"
                    },
                    "document_id": {
                      "type": "string",
                      "description": "DOCUMENTO"
                    },
                    "email": {
                      "type": "string",
                      "description": "EMAIL"
                    },
                    "zipcode": {
                      "type": "string",
                      "description": "CP (codigo postal)"
                    },
                    "activity_id": {
                      "type": "string",
                      "description": "codigo de actividad"
                    },
                    "grossincome": {
                      "type": "string",
                      "description": "ingresos brutos"
                    },
                    "account": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de la cuenta corriente"
                    },
                    "creditLimit": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite de credito (este campo es requerido si account = 1)"
                    },
                    "creditLimitDoc": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite de credito doc (este campo es requerido si account = 1)"
                    },
                    "payment_method_id": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite del codigo del multiplazo(este campo es requerido si account = 1)"
                    },
                    "credit_amount_req": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del monto del credito solicitado"
                    },
                    "fixed_payment_method": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion del multiplazo fijo"
                    },
                    "account_disabled": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de deshabilitar la cuenta corriente"
                    },
                    "expired_days": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de dias vencidos"
                    },
                    "promotion_bill": {
                      "type": "integer",
                      "description": "descripcion de ofertas facturables (solo 0 o 1, si el codigo cliente no existe y dicho campo es null se inserta 1, si el codigo cliente existe y dicho campo es null no modifica su valor en la tabla)"
                    }
                  }
                },
                "products": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": [
                      "product_id",
                      "size",
                      "quantity",
                      "unit_price",
                      "total_price"
                    ],
                    "properties": {
                      "product_id": {
                        "type": "string",
                        "maxLength": 15,
                        "description": "descripcion del codigo articulo"
                      },
                      "size": {
                        "type": "string",
                        "maxLength": 50,
                        "description": "descripcion de lote"
                      },
                      "quantity": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de cantidad"
                      },
                      "discount": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de descuento"
                      },
                      "unit_price": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de precio unitario"
                      },
                      "internal_tax": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de impuestos internos"
                      },
                      "netPrice": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion del precio neto"
                      },
                      "total_price": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion del precio total"
                      },
                      "equivalences": {
                        "type": "number",
                        "description": "si se coloca 1 toma el valor con la equivalencia que tenga el articulo con 0 lo toma como la cantidad enviada del articulo (SOLO CORRALON)"
                      },
                      "packaging_code": {
                        "type": "string",
                        "description": "Codigo de empaque (SOLO ENTERPRISE)"
                      },
                      "product_descriptions": {
                        "type": "object",
                        "required": [
                          "overwrite_description"
                        ],
                        "properties": {
                          "overwrite_description": {
                            "type": "number",
                            "description": "DESCRIPCION DE SOBREESCRIBIR LA DESCRIPCION DEL ARTICULO"
                          },
                          "descriptions": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "description": {
                                  "type": "string",
                                  "description": "DETALLE DEL ARTICULO QUE SE DESEA AGREGAR"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "paymentsDetail": {
                  "type": "object",
                  "description": "este campo SOLO es requerido si el tipo (type) de orden es FC (Factura)",
                  "properties": {
                    "cash": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCash"
                      }
                    },
                    "coupon": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCoupon"
                      }
                    },
                    "wireTransfer": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentWireTransfer"
                      }
                    },
                    "checks": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCheck"
                      }
                    }
                  }
                },
                "geolocation": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string"
                    },
                    "number": {
                      "type": "number",
                      "format": "double"
                    },
                    "latitude": {
                      "type": "string"
                    },
                    "length": {
                      "type": "string"
                    }
                  }
                },
                "saleType": {
                  "type": "integer",
                  "description": "CONTADO 0 - CUENTACORRIENTE 1"
                },
                "cae": {
                  "type": "object",
                  "properties": {
                    "numberCae": {
                      "type": "string"
                    },
                    "dateExpired": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "dateRequested": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "afipResponse": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        },
        "manualcreditnoteventa": {
          "properties": {
            "cart": {
              "type": "object",
              "properties": {
                "salespointnumeration": {
                  "type": "number",
                  "description": "Numeracion del punto de venta del comprobante"
                },
                "type": {
                  "type": "string",
                  "description": "Tipo de comprobante  - NCA,NCB,NCC,NCM,NCE,NCT,NCCA,NCCB,NCCC",
                  "example": "NCB"
                },
                "number": {
                  "type": "number",
                  "description": "Número de comprobante"
                },
                "notes": {
                  "type": "string",
                  "description": "Comentario del comprobante"
                },
                "price_list_id": {
                  "type": "string",
                  "description": "Lista de precio"
                },
                "operation_type_id": {
                  "type": "string",
                  "description": "Código operación"
                },
                "linked_type": {
                  "type": "string",
                  "description": "Tipo de comprobante vinculado (RE FA FB FC FM FE FT)"
                },
                "type_creditnote": {
                  "type": "string",
                  "description": "Tipo de nota de crédito (DEVOLUCION-ANULACION)"
                },
                "linked_lines": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": [
                      "linked_number",
                      "linelinked",
                      "quantitylinked"
                    ],
                    "properties": {
                      "linked_number": {
                        "type": "number",
                        "description": "Número de comprobante vinculado"
                      },
                      "linelinked": {
                        "type": "number",
                        "format": "double",
                        "description": "Línea comprobante vinculado"
                      },
                      "quantitylinked": {
                        "type": "number",
                        "format": "double",
                        "description": "Cantidad línea comprobante vinculado"
                      },
                      "packaging_code": {
                        "type": "string",
                        "description": "Codigo de empaque (SOLO ENTERPRISE)"
                      }
                    }
                  }
                },
                "warehouse_id": {
                  "type": "string",
                  "description": "Código depósito"
                },
                "date": {
                  "type": "string",
                  "description": "Fecha comprobante"
                },
                "user_id": {
                  "type": "string",
                  "description": "CODIGOUSUARIO, CODIGOUSUARIO2, CODIGORESPONSABLE y\nCODIGOUSUARIOAPROBACION"
                },
                "currency_id": {
                  "type": "string",
                  "description": "CODIGOMONEDA"
                },
                "general_discount": {
                  "type": "string",
                  "description": "DESCUENTO GENERAL"
                },
                "payment_method_id": {
                  "type": "string",
                  "description": "CODIGOMULTIPLAZO"
                },
                "customer": {
                  "type": "object",
                  "required": [
                    "sales_tax_group_id",
                    "name",
                    "state_id",
                    "city",
                    "phone",
                    "vat_number"
                  ],
                  "properties": {
                    "notes": {
                      "type": "string",
                      "description": "COMENTARIOS"
                    },
                    "vat_number": {
                      "type": "string",
                      "description": "CUIT"
                    },
                    "id": {
                      "type": "string",
                      "description": "CODIGOCLIENTE"
                    },
                    "name": {
                      "type": "string",
                      "description": "RAZONSOCIAL"
                    },
                    "address": {
                      "type": "string",
                      "description": "DIRECCION"
                    },
                    "state_id": {
                      "type": "string",
                      "description": "CODIGOPROVINCIA"
                    },
                    "city": {
                      "type": "string",
                      "description": "LOCALIDAD"
                    },
                    "neighborhood": {
                      "type": "string",
                      "description": "BARRIO"
                    },
                    "user_id": {
                      "type": "string",
                      "description": "CODIGOVENDEDOR o CODIGOCOBRADOR"
                    },
                    "price_list_id": {
                      "type": "string",
                      "description": "CODIGOLISTA"
                    },
                    "phone": {
                      "type": "string",
                      "description": "TELEFONO"
                    },
                    "cell_phone": {
                      "type": "string",
                      "description": "CELULAR (A partir de la version 03.39.001.0004.00 el dato se guarda en el campo TELEFONOCELULAR)"
                    },
                    "sales_tax_group_id": {
                      "type": "string",
                      "description": "CONDICIONIVA"
                    },
                    "document_id": {
                      "type": "string",
                      "description": "DOCUMENTO"
                    },
                    "email": {
                      "type": "string",
                      "description": "EMAIL"
                    },
                    "zipcode": {
                      "type": "string",
                      "description": "CP (codigo postal)"
                    },
                    "activity_id": {
                      "type": "string",
                      "description": "codigo de actividad"
                    },
                    "grossincome": {
                      "type": "string",
                      "description": "ingresos brutos"
                    },
                    "account": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de la cuenta corriente"
                    },
                    "creditLimit": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite de credito (este campo es requerido si account = 1, solo para ENTERPRISE)"
                    },
                    "creditLimitDoc": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite de credito doc (este campo es requerido si account = 1, solo para ENTERPRISE)"
                    },
                    "payment_method_id": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del limite del codigo del multiplazo(este campo es requerido si account = 1, solo para ENTERPRISE)"
                    },
                    "credit_amount_req": {
                      "type": "number",
                      "format": "double",
                      "description": "descripcion del monto del credito solicitado (solo para ENTERPRISE)"
                    },
                    "fixed_payment_method": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion del multiplazo fijo (solo para ENTERPRISE)"
                    },
                    "account_disabled": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de deshabilitar la cuenta corriente  (solo para ENTERPRISE)"
                    },
                    "expired_days": {
                      "type": "integer",
                      "format": "int64",
                      "description": "descripcion de dias vencidos (solo para ENTERPRISE)"
                    },
                    "promotion_bill": {
                      "type": "integer",
                      "description": "descripcion de ofertas facturables (solo 0 o 1, si el codigo cliente no existe y dicho campo es null se inserta 1, si el codigo cliente existe y dicho campo es null no modifica su valor en la tabla)"
                    }
                  }
                },
                "products": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": [
                      "product_id",
                      "size",
                      "quantity",
                      "unit_price",
                      "total_price"
                    ],
                    "properties": {
                      "product_id": {
                        "type": "string",
                        "maxLength": 15,
                        "description": "descripcion del codigo articulo"
                      },
                      "size": {
                        "type": "string",
                        "maxLength": 50,
                        "description": "descripcion de lote"
                      },
                      "quantity": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de cantidad"
                      },
                      "discount": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de descuento"
                      },
                      "unit_price": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de precio unitario"
                      },
                      "internal_tax": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion de impuestos internos"
                      },
                      "netPrice": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion del precio neto"
                      },
                      "total_price": {
                        "type": "number",
                        "format": "double",
                        "description": "descripcion del precio total"
                      },
                      "equivalences": {
                        "type": "number",
                        "description": "si se coloca 1 toma el valor con la equivalencia que tenga el articulo con 0 lo toma como la cantidad enviada del articulo (SOLO CORRALON)"
                      },
                      "packaging_code": {
                        "type": "string",
                        "description": "Codigo de empaque (SOLO ENTERPRISE)"
                      },
                      "product_descriptions": {
                        "type": "object",
                        "required": [
                          "overwrite_description"
                        ],
                        "properties": {
                          "overwrite_description": {
                            "type": "number",
                            "description": "DESCRIPCION DE SOBREESCRIBIR LA DESCRIPCION DEL ARTICULO"
                          },
                          "descriptions": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "description": {
                                  "type": "string",
                                  "description": "DETALLE DEL ARTICULO QUE SE DESEA AGREGAR"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "paymentsDetail": {
                  "type": "object",
                  "description": "este campo SOLO es requerido si el tipo (type) de orden es FC (Factura)",
                  "properties": {
                    "cash": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCash"
                      }
                    },
                    "coupon": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCoupon"
                      }
                    },
                    "wireTransfer": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentWireTransfer"
                      }
                    },
                    "checks": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "$ref": "#/components/schemas/PaymentCheck"
                      }
                    }
                  }
                },
                "geolocation": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string"
                    },
                    "number": {
                      "type": "number",
                      "format": "double"
                    },
                    "latitude": {
                      "type": "string"
                    },
                    "length": {
                      "type": "string"
                    }
                  }
                },
                "saleType": {
                  "type": "integer",
                  "description": "CONTADO 0 - CUENTACORRIENTE 1"
                },
                "cae": {
                  "type": "object",
                  "properties": {
                    "numberCae": {
                      "type": "string"
                    },
                    "dateExpired": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "dateRequested": {
                      "type": "string",
                      "format": "time-date"
                    },
                    "afipResponse": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        },
        "PreciosPorProveedorGet": {
          "properties": {
            "CODIGO": {
              "type": "string",
              "maxLength": 40,
              "description": "Descripcion del codigo"
            },
            "CODIGOARTICULO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo articulo"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 250,
              "description": "Descripcion de la descripcion del articulo"
            },
            "CODIGOARTICULOPROVEEDOR": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del codigo articulo proveedor (SOLO ENTERPRISE)"
            },
            "CODIGOPROVEEDOR": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo proveedor"
            },
            "RAZONSOCIAL": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la razon social del proveedor"
            },
            "TIPO": {
              "type": "string",
              "maxLength": 1,
              "description": "Descripcion del tipo de articulo (SOLO CORRALON) (\"A\" Articulo, \"F\" Flete)"
            },
            "BONIFICACION": {
              "type": "number",
              "format": "double",
              "description": "Descripcion de la bonificacion"
            },
            "CANTIDAD": {
              "type": "number",
              "format": "double",
              "description": "Descripcion de la cantidad"
            },
            "PRECIOLISTA": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del precio de lista"
            },
            "PRECIOTOTAL": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del precio total (SOLO ENTERPRISE)"
            },
            "PORCENTAJEFLETE": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del porcenta jeflete"
            },
            "FLETE": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del monto de flete (SOLO ENTERPRISE)"
            },
            "MONTOFLETE": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del monto de flete (SOLO CORRALON)"
            },
            "COSTOFINAL": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del costofinal"
            },
            "FECHAVIGENCIA": {
              "type": "string",
              "format": "date-time",
              "example": "1900-01-01T00:00:00.000Z",
              "description": "Descripcion de la fecha de vigencia"
            },
            "UTILIDAD": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del precio de la utilidad (SOLO CORRALON)"
            },
            "PRECIOVENTA": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del precio de venta (SOLO CORRALON)"
            },
            "CODIGOBONIFICACIONPROV": {
              "type": "number",
              "description": "Descripcion del codigo de bonificacion de proveedor (SOLO CORRALON)"
            },
            "DESCUENTOBONIFICACIONPROV": {
              "type": "string",
              "maxLength": 200,
              "description": "Descripcion de bonificacion de proveedor (SOLO CORRALON)"
            },
            "MONEDA": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del simbolo de la moneda (SOLO ENTERPRISE)"
            },
            "OBSERVACIONES": {
              "type": "string",
              "maxLength": 2000,
              "description": "Descripcion de las observaciones (SOLO ENTERPRISE)"
            },
            "CODIGORUBRO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo de el rubro (SOLO ENTERPRISE)"
            },
            "RUBRO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion de el rubro (SOLO ENTERPRISE)"
            },
            "CODIGOBULTO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo de el bulto"
            },
            "BULTO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion del bulto"
            },
            "DESCRIPCIONARTICULOPROVEEDOR": {
              "type": "string",
              "maxLength": 250,
              "description": "Descripcion de la descripcion de el articulo del proveedor (SOLO ENTERPRISE)"
            },
            "TDR": {
              "type": "number",
              "description": "Descripcion de tdr (SOLO ENTERPRISE)"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "example": "1900-01-01T00:00:00.000Z",
              "description": "Descripcion de la fecha de modificacion (SOLO ENTERPRISE)"
            },
            "CODIGOSUPERRUBRO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo de el superrubro (SOLO ENTERPRISE)"
            },
            "SUPERRUBRO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion de el superrubro (SOLO ENTERPRISE)"
            },
            "CODIGOGRUPOSUPERRUBRO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo de el gruposuperrubro (SOLO ENTERPRISE)"
            },
            "GRUPOSUPERRUBRO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la descripcion de el gruposuperrubro (SOLO ENTERPRISE)"
            },
            "MARGENL1": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del margen lista 1 (SOLO CORRALON)"
            },
            "MARGENL2": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del margen lista 2 (SOLO CORRALON)"
            },
            "MARGENL3": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del margen lista 3 (SOLO CORRALON)"
            },
            "MARGENL4": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del margen lista 4 (SOLO CORRALON)"
            },
            "MARGENL5": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del margen lista 5 (SOLO CORRALON)"
            },
            "DTORECOMENDADO": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del descuento recomendado (SOLO CORRALON)"
            },
            "DTOMAXIMO": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del descuento maximo (SOLO CORRALON)"
            },
            "COSTOFLETEVENTA": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del costo de flete venta (SOLO CORRALON)"
            },
            "CODIGOMONEDA": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo de la moneda (SOLO CORRALON)"
            },
            "CONDICIONARTICULO": {
              "type": "string",
              "maxLength": 50,
              "description": "Descripcion de la condicion del articulo (SOLO CORRALON)"
            },
            "ORIGEN": {
              "type": "string",
              "description": "Descripcion del origen"
            }
          }
        },
        "GetProductConversions": {
          "properties": {
            "CODIGOEMPAQUE": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo de empaque"
            },
            "DESCRIPCIONEMPAQUE": {
              "type": "string",
              "maxLength": 150,
              "description": "Descripcion de la descripcion del empaque"
            },
            "CODIGOUNIDADMEDIDA": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo de unidad de medida"
            },
            "DESCRIPCIONUNIDADMEDIDA": {
              "type": "string",
              "maxLength": 150,
              "description": "Descripcion de la descripcion de la unidad de medida"
            },
            "COEFICIENTECONVERSION": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del coeficiente de conversion"
            },
            "EMPAQUEDEFECTO": {
              "type": "boolean",
              "description": "Descripcion del si es empaque defecto"
            },
            "TIPOCONVERSION": {
              "type": "integer",
              "description": "Descripcion del tipo de conversion"
            },
            "PERMITIRFRACCIONADO": {
              "type": "integer",
              "description": "Descripcion de permitir fraccionado (0 - NO, 1 - Compras, 2 - Ventas, 3 - Compras y Ventas)"
            },
            "SOLICITARCONVERSIONDEPOSITOS": {
              "type": "integer",
              "description": "Descripcion de si solicita conversion depositos (SOLO 0 o 1)"
            },
            "PERMITIRFRACCIONADODEPOSITOS": {
              "type": "integer",
              "description": "Descripcion de si permite fraccionado depositos (SOLO 0 o 1)"
            }
          }
        },
        "GetReal": {
          "type": "object",
          "properties": {
            "STOCK": {
              "type": "number",
              "format": "double",
              "description": "Descripcion del stock real"
            },
            "CODIGOARTICULO": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del codigo de el articulo"
            },
            "LOTE": {
              "type": "string",
              "maxLength": 15,
              "description": "Descripcion del lote"
            },
            "DESCRIPCION": {
              "type": "string",
              "maxLength": 250,
              "description": "Descripcion del articulo"
            },
            "FECHAMODIFICACION": {
              "type": "string",
              "format": "date-time",
              "description": "Descripcion de la fecha de modificacion del stock"
            }
          }
        },
        "ActividadesEconomicasCrud": {
          "type": "object",
          "properties": {
            "IDACTIVIDAD": {
              "readOnly": true,
              "type": "integer",
              "description": "Descripción del id actividad"
            },
            "CODIGOACTIVIDAD": {
              "readOnly": true,
              "type": "string",
              "maxLength": 10,
              "description": "Descripción del código actividad"
            },
            "DESCRIPCION": {
              "readOnly": true,
              "type": "string",
              "maxLength": 600,
              "description": "Descripción de la actividad económica"
            },
            "IDPAIS": {
              "readOnly": true,
              "type": "integer",
              "description": "Descripción del id país"
            },
            "DESCRIPCION_PAIS": {
              "readOnly": true,
              "type": "string",
              "maxLength": 300,
              "description": "Descripción del país"
            },
            "NOMENCLADOR": {
              "readOnly": true,
              "type": "integer",
              "description": "Descripción del nomenclador"
            },
            "ORDEN": {
              "readOnly": true,
              "type": "integer",
              "description": "Descripción del orden"
            },
            "PERIODO": {
              "readOnly": true,
              "type": "integer",
              "description": "Descripción del periodo"
            },
            "PORDEFECTO": {
              "readOnly": true,
              "type": "boolean",
              "description": "Indica si la actividad económica es por defecto"
            },
            "activity_code": {
              "writeOnly": true,
              "type": "string",
              "maxLength": 10,
              "description": "Descripción del código actividad"
            },
            "description": {
              "writeOnly": true,
              "type": "string",
              "maxLength": 600,
              "description": "Descripción de la actividad economistica"
            },
            "country_id": {
              "writeOnly": true,
              "type": "integer",
              "description": "Descripción del id país"
            },
            "nomenclator": {
              "writeOnly": true,
              "type": "integer",
              "description": "Descripción del nomenclador"
            },
            "order": {
              "writeOnly": true,
              "type": "integer",
              "description": "Descripción del orden"
            },
            "period": {
              "writeOnly": true,
              "type": "integer",
              "description": "Descripción del periodo"
            },
            "default": {
              "writeOnly": true,
              "type": "boolean",
              "description": "Indica si la actividad economistica es por defecto"
            }
          }
        },
        "GetSalesByCustomerProductDateFrom": {
          "type": "object",
          "properties": {
            "FECHACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "HORACOMPROBANTE": {
              "type": "string",
              "format": "time-date"
            },
            "TIPOCOMPROBANTE": {
              "type": "string"
            },
            "NUMEROCOMPROBANTE": {
              "type": "number",
              "format": "double"
            },
            "CODIGOCLIENTE": {
              "type": "string"
            },
            "RAZONSOCIAL": {
              "type": "string"
            },
            "DIRECCION": {
              "type": "string"
            },
            "TELEFONO": {
              "type": "string"
            },
            "TOTALNETO": {
              "type": "number",
              "format": "double"
            },
            "TOTALIVA": {
              "type": "number",
              "format": "double"
            },
            "TOTALEXENTO": {
              "type": "number",
              "format": "double"
            },
            "TOTALBRUTO": {
              "type": "number",
              "format": "double"
            },
            "PAGADO": {
              "type": "number",
              "format": "double"
            },
            "ANULADA": {
              "type": "integer"
            },
            "CUENTACORRIENTE": {
              "type": "integer"
            },
            "COTIZACION": {
              "type": "number",
              "format": "double"
            },
            "LISTAPRECIOS": {
              "type": "integer"
            },
            "COMENTARIOS": {
              "type": "string"
            },
            "DESCUENTOCOMPROBANTE": {
              "type": "number",
              "format": "double"
            },
            "NUMEROPUNTOVENTA": {
              "type": "integer"
            },
            "PRECIOUNITARIO": {
              "type": "number",
              "format": "double"
            },
            "CANTIDAD": {
              "type": "number",
              "format": "double"
            },
            "PORCENTAJEFLETE": {
              "type": "number",
              "format": "double"
            },
            "COSTOFLETE": {
              "type": "number",
              "format": "double"
            }
          }
        }
      }
    }
  },
  "customOptions": {},
  "swaggerUrl": {}
};
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.preauthorizeApiKey) {
    const key = customOptions.preauthorizeApiKey.authDefinitionKey;
    const value = customOptions.preauthorizeApiKey.apiKeyValue;
    if (!!key && !!value) {
      const pid = setInterval(() => {
        const authorized = ui.preauthorizeApiKey(key, value);
        if(!!authorized) clearInterval(pid);
      }, 500)

    }
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
