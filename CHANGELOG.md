# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-18

### Added

- Support for promise-returning callbacks and functions at any depth inside an expression. Previously only top-level promises were allowed; nested ones threw `Unexpected nested promise <callback|function>`. (#2)
- `compile` now returns `boolean` for fully synchronous expressions and `Promise<boolean>` when any branch is async. Previously this dynamic return only applied when the entire expression was a single promise-returning callback. `$and` and `$or` still stop on the first `false` / `true` and skip the rest, whether that value is sync or async.

### Changed

- Split the monolithic `test/index.test.js` into one file per category (`primitive`, `callback`, `operator`, `fn`, `compound`, `shortCircuit`) for easier maintenance.

## [0.1.0] - 2021-01-12

### Added

- Initial release: MongoDB-like boolean expression compiler with `$and` / `$or` operators, callbacks, and user-defined functions.

[0.2.0]: https://github.com/mutaimwiti/logical-compiler/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mutaimwiti/logical-compiler/releases/tag/v0.1.0
