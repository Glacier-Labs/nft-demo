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


### Deploy Testnet

- ENV

```
SIGNER_PRIVATE_KEY=""
DATABASE_URI=""
GLACIER_SCAN_ENDPOINT=https://greenfield.onebitdev.com/glacier-scan
```

```
deno task build
deployctl deploy --project=demo-mint --prod  main.ts
```