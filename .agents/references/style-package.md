# Package layout

Read this reference when investigating the package layout, changing vendored rules or vocabularies, or changing archive construction and installation tests.

## Maintained source

The root `.vale.ini` sets `StylesPath = styles` and enables DNBWriting, DNBAIPatterns, and DNBMillennialisms. It has no external `Packages` dependency. The maintained namespaces are `styles/DNBWriting/`, `styles/DNBAIPatterns/`, and `styles/DNBMillennialisms/`.

Selected Microsoft, Google, alex, proselint, Readability, and write-good rules live inside DNBWriting. Selection decisions and renamed rule identifiers are documented in [upstream rule selection](../../documentation/upstream-rules.md). The machine-readable inventory is [upstream-rules.json](../../styles/config/upstream-rules.json), and licence notices live in `styles/DNBWriting/licenses/`.

Support files live below `styles/config/`, including Tengo scripts, dictionaries, and vocabularies. Each vocabulary has an `accept.txt` and may have a `reject.txt`. The configuration selects DNB, Tech, Thailand, AIDetectionExceptions, and MillennialismsExceptions. The bundled `en_GB` dictionary supports `DNBWriting.Spelling`.

## Archive construction

`scripts/build-release-zip.sh` writes `dist/config.zip` with a `config/` wrapper containing `.vale.ini`, `README.md`, `LICENSE.md`, and the three maintained style namespaces plus `styles/config/`. The script adjusts the packaged `StylesPath` to `../` for Vale's installed configuration layout.

The explicit copy list excludes development tooling and old downloaded style directories. Repository installation does not run `vale sync`; consumers run it to install the release zip. Old upstream downloads and `styles/.vale-config/` are ignored and must not be needed by the package.

The sibling [vale-aidetection](https://github.com/davidsneighbour/vale-aidetection) and [vale-millennialisms](https://github.com/davidsneighbour/vale-millennialisms) repositories are related style-package projects. Inspect their current source before using them as implementation examples.
