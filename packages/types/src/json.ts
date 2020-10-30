export type JsonPrimitive = boolean | number | string | null;

export type JsonObject = {
  [key: string]: JsonPrimitive | JsonObject | JsonArray;
};

export type JsonArray = (JsonPrimitive | JsonObject)[];

export type Json = JsonPrimitive | JsonArray | JsonObject;
