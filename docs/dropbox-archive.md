# Dropbox archive

The Dropbox app is configured with **App Folder** access. All API paths are therefore
relative to Dropbox's automatically managed `Apps/SantosDia Orchestrator` folder.
The repository must never repeat that application name in an API path.

## Fixed archive layout

Each producer writes into one stable stream beneath `/archive`:

```text
/archive/<stream>/index.json
/archive/<stream>/slots/01/package.tar.gz
/archive/<stream>/slots/01/receipt.json
...
/archive/<stream>/slots/08/package.tar.gz
/archive/<stream>/slots/08/receipt.json
```

The run number selects one of eight slots. A ninth run overwrites slot `01`; it does
not create a ninth folder. `index.json` is updated only after the package upload and
content-hash verification succeed, so it always points to a complete slot.

This ring provides bounded retention without `files.metadata.write`: the app needs
only `account_info.read`, `files.metadata.read`, `files.content.read` and
`files.content.write`. There is no delete, move or rename operation.

## Streams

- `ecclesiastical-osint`
- `wikidata-normalized`
- `ecclesiastical-directory/<source>`
- `litcal`
- `observances`

The archive is a deterministic `tar.gz`. Every receipt records SHA-256, Dropbox's
content hash, input paths, commit and workflow identity. Files over the direct-upload
limit automatically use a chunked Dropbox upload session.
