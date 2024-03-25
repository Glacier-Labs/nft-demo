# Fresh project

Your new Fresh project is ready to go. You can follow the Fresh "Getting
Started" guide here: https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Then start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

Form:

- Name:
- Description:
- External_url:
- ImageFile:

Input Document:

```
{
  "name": "Catalyst NFT",
  "description": "Glacier is building a composable, modular and scalable L2 data network and DePIN for large-scale Web3 Dapps and GenAI.", 
  "external_url": "https://www.glacier.io", 
  "image": "data:image/png;base64,iVBORw0KG..."
  "icon": "data:image/png;base64,xxxx..."
}
```

API:

- /nftgateway/:docid -> raw document

```
{
  "name": "Catalyst NFT",
  "description": "Glacier is building a composable, modular and scalable L2 data network and DePIN for large-scale Web3 Dapps and GenAI.", 
  "external_url": "https://www.glacier.io", 
  "image": "data:image/png;base64,iVBORw0KG...", 
}
```

- /nftgateway/:docid/meta -> meta document, serve all `data:image/png` fields to `url`

```
{
  "name": "Catalyst NFT",
  "description": "Glacier is building a composable, modular and scalable L2 data network and DePIN for large-scale Web3 Dapps and GenAI.", 
  "external_url": "https://www.glacier.io", 
  "image": "https://host:port/api/:docid/image/:field.png", 
}
```

- /nftgateway/:docid/image/:field -> image binary


Ref: https://docs.opensea.io/docs/metadata-standards

## Deploy

- ENV
```
GLACIER_ENDPOINT=https://greenfield.onebitdev.com/glacier-gateway
```

```
deno task build
deployctl deploy --project=demo-gw --prod main.ts
```