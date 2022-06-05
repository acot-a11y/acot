# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.0.19](https://github.com/acot-a11y/acot/compare/v0.0.18...v0.0.19) (2022-06-05)

**Note:** Version bump only for package @acot/core

## [0.0.18](https://github.com/acot-a11y/acot/compare/v0.0.17...v0.0.18) (2022-05-11)

**Note:** Version bump only for package @acot/core

## [0.0.17](https://github.com/acot-a11y/acot/compare/v0.0.17-canary.3...v0.0.17) (2022-05-10)

**Note:** Version bump only for package @acot/core

## [0.0.17-canary.2](https://github.com/acot-a11y/acot/compare/v0.0.17-canary.1...v0.0.17-canary.2) (2022-05-06)

**Note:** Version bump only for package @acot/core

## [0.0.17-canary.1](https://github.com/acot-a11y/acot/compare/v0.0.17-canary.0...v0.0.17-canary.1) (2022-05-05)

**Note:** Version bump only for package @acot/core

## [0.0.17-canary.0](https://github.com/acot-a11y/acot/compare/v0.0.16...v0.0.17-canary.0) (2022-05-05)

### Reverts

- **core:** remove `immutable` rule flags ([7bd940b](https://github.com/acot-a11y/acot/commit/7bd940bdb08e277b3fdf3208ce0eac345e79dd8a))

## [0.0.16](https://github.com/acot-a11y/acot/compare/v0.0.15...v0.0.16) (2022-05-01)

### Bug Fixes

- upgrade to `emittery@0.10.0` ([75304e8](https://github.com/acot-a11y/acot/commit/75304e89832b671ca1a01015acf9283d13d042dd))
- use puppeteer instance of default export ([14b26bb](https://github.com/acot-a11y/acot/commit/14b26bb55b12b1077f4c1c62fab8af934f11bc88))

## [0.0.15](https://github.com/acot-a11y/acot/compare/v0.0.14...v0.0.15) (2022-03-27)

### Bug Fixes

- update aom feature flag ([040a321](https://github.com/acot-a11y/acot/commit/040a321b83360f9f0b670e327d0876e9e297fa5a))

### Features

- upgrade puppeteer to v13 ([6598c99](https://github.com/acot-a11y/acot/commit/6598c99ead6734cdc6f71a184a75cf4577cfa17d))

## [0.0.14](https://github.com/acot-a11y/acot/compare/v0.0.14-canary.2...v0.0.14) (2022-01-03)

**Note:** Version bump only for package @acot/core

## [0.0.14-canary.2](https://github.com/acot-a11y/acot/compare/v0.0.14-canary.1...v0.0.14-canary.2) (2022-01-03)

### Bug Fixes

- **core:** fix validation logic of rule options ([ae9fdbd](https://github.com/acot-a11y/acot/commit/ae9fdbdb43f586541b17fc678663065a21b4bf2a))

## [0.0.14-canary.0](https://github.com/acot-a11y/acot/compare/v0.0.13...v0.0.14-canary.0) (2022-01-03)

**Note:** Version bump only for package @acot/core

## [0.0.13](https://github.com/acot-a11y/acot/compare/v0.0.13-canary.0...v0.0.13) (2021-10-10)

**Note:** Version bump only for package @acot/core

## [0.0.12](https://github.com/acot-a11y/acot/compare/v0.0.11...v0.0.12) (2021-04-18)

**Note:** Version bump only for package @acot/core

## [0.0.11](https://github.com/acot-a11y/acot/compare/v0.0.10...v0.0.11) (2021-04-12)

**Note:** Version bump only for package @acot/core

## [0.0.10](https://github.com/acot-a11y/acot/compare/v0.0.10-canary.0...v0.0.10) (2021-04-11)

**Note:** Version bump only for package @acot/core

## 0.0.10-canary.0 (2021-04-04)

### Bug Fixes

- fix summary duration bug ([a5fb2d3](https://github.com/acot-a11y/acot/commit/a5fb2d34bc30967d284b37b24a0ea54220bf3565))
- Fix omission of version specification in `debug` package ([85f8ea4](https://github.com/acot-a11y/acot/commit/85f8ea44c7b029301dbcd6bceef427fda35972b6))
- Minor bug fixes that occur during Audit ([0ec7b94](https://github.com/acot-a11y/acot/commit/0ec7b94e8f885cb45aae351d0279033367b8d94c))
- **core:** Add element2selector error handling ([4f1a9e5](https://github.com/acot-a11y/acot/commit/4f1a9e5cae66211cd8825028284e81077c8b745e))
- Fix a bug in the rule performance tracker ([07e8f36](https://github.com/acot-a11y/acot/commit/07e8f36bfabfed8650fc8949409d94f48bca2677))
- **core:** Fix a bug in which the queue is executed without waiting ([51ddb83](https://github.com/acot-a11y/acot/commit/51ddb836309f927da27e947ac209662ca6696d5e))
- **core:** Fix a bug that `BrowserPool` hangs ([93da5cb](https://github.com/acot-a11y/acot/commit/93da5cbdf28508e4e3cf95983bf710d1675ff3da))
- **core:** Fix a bug that prevented closing a used page ([fd6e55f](https://github.com/acot-a11y/acot/commit/fd6e55f33d6ef057f1c869345674d3a399285032))
- **core:** Fix navigation wait logic ([1178dc9](https://github.com/acot-a11y/acot/commit/1178dc9d4ea6582be3f9d93ebf5aa58f7f7f55ce))
- **core:** Human readable output log of browser console ([10c6c27](https://github.com/acot-a11y/acot/commit/10c6c277c7f2050cffffa7e8f251fb1056dd7286))
- **reporter:** Fix a bug that PrettyReporter hangs in the case of many URLs ([7248532](https://github.com/acot-a11y/acot/commit/7248532c0380a0483a537c124173f2191027dd54))

### Features

- Add rule result for pretty reporter ([f668f8a](https://github.com/acot-a11y/acot/commit/f668f8a56e730ea31ece53f23d7fd2629e456211))
- Improve progress display (pretty reporter) ([dc4e9e1](https://github.com/acot-a11y/acot/commit/dc4e9e1655408a499619a690798e06ef439844be))
- Initial implements ([68f46a2](https://github.com/acot-a11y/acot/commit/68f46a250de7793795678ece40d23d927ddd075c))
- **cli:** Add filter logic to debug flag ([738c35d](https://github.com/acot-a11y/acot/commit/738c35d0c318036b09faff6588671f054c7508bb))
- **core:** add chromium auto detection for `BrowserPool` ([21f7228](https://github.com/acot-a11y/acot/commit/21f722882efe18605dc3867ddf328f31aede160a))
- **core:** Add cleanup process for the page before perform immutable rule ([c4e4820](https://github.com/acot-a11y/acot/commit/c4e48203bd9af0289f310b0e155409cfacc1002d))
- **core:** Add debug log ([c0b9837](https://github.com/acot-a11y/acot/commit/c0b98374abf2d5547c6e78b4b1cc9a92027e9f3a))
- **core:** Performance improvements with immutable rules ([572edef](https://github.com/acot-a11y/acot/commit/572edefca26d1817a46e2f1c74c8d31b6762642d))
- **core:** switch to `help` from `tags` ([7ac5678](https://github.com/acot-a11y/acot/commit/7ac56780e46c26f94aeda3f0c1d1482f47521acb))

## [0.0.8-canary.0](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.7...@acot/core@0.0.8-canary.0) (2021-03-30)

**Note:** Version bump only for package @acot/core

## [0.0.7](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.6...@acot/core@0.0.7) (2021-01-30)

### Features

- **core:** switch to `help` from `tags` ([7ac5678](https://github.com/acot-a11y/acot/commit/7ac56780e46c26f94aeda3f0c1d1482f47521acb))

## [0.0.6](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.6-canary.0...@acot/core@0.0.6) (2021-01-13)

**Note:** Version bump only for package @acot/core

## [0.0.6-canary.0](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.5...@acot/core@0.0.6-canary.0) (2021-01-13)

**Note:** Version bump only for package @acot/core

## [0.0.5](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.4...@acot/core@0.0.5) (2021-01-01)

### Bug Fixes

- fix summary duration bug ([a5fb2d3](https://github.com/acot-a11y/acot/commit/a5fb2d34bc30967d284b37b24a0ea54220bf3565))

### Features

- **core:** add chromium auto detection for `BrowserPool` ([21f7228](https://github.com/acot-a11y/acot/commit/21f722882efe18605dc3867ddf328f31aede160a))

## [0.0.4](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.4-canary.0...@acot/core@0.0.4) (2020-12-29)

**Note:** Version bump only for package @acot/core

## [0.0.4-canary.0](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.3...@acot/core@0.0.4-canary.0) (2020-12-29)

**Note:** Version bump only for package @acot/core

## [0.0.3](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.3-canary.2...@acot/core@0.0.3) (2020-12-22)

**Note:** Version bump only for package @acot/core

## [0.0.3-canary.2](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.3-canary.1...@acot/core@0.0.3-canary.2) (2020-12-19)

### Features

- Add rule result for pretty reporter ([f668f8a](https://github.com/acot-a11y/acot/commit/f668f8a56e730ea31ece53f23d7fd2629e456211))

## [0.0.3-canary.1](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.3-canary.0...@acot/core@0.0.3-canary.1) (2020-12-16)

### Features

- Improve progress display (pretty reporter) ([dc4e9e1](https://github.com/acot-a11y/acot/commit/dc4e9e1655408a499619a690798e06ef439844be))

## [0.0.3-canary.0](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.2...@acot/core@0.0.3-canary.0) (2020-12-14)

### Bug Fixes

- Fix omission of version specification in `debug` package ([85f8ea4](https://github.com/acot-a11y/acot/commit/85f8ea44c7b029301dbcd6bceef427fda35972b6))

## [0.0.2](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.2-canary.7...@acot/core@0.0.2) (2020-12-10)

### Bug Fixes

- **core:** Add element2selector error handling ([4f1a9e5](https://github.com/acot-a11y/acot/commit/4f1a9e5cae66211cd8825028284e81077c8b745e))

## [0.0.2-canary.7](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.2-canary.6...@acot/core@0.0.2-canary.7) (2020-11-23)

### Bug Fixes

- Fix a bug in the rule performance tracker ([07e8f36](https://github.com/acot-a11y/acot/commit/07e8f36bfabfed8650fc8949409d94f48bca2677))

### Features

- **cli:** Add filter logic to debug flag ([738c35d](https://github.com/acot-a11y/acot/commit/738c35d0c318036b09faff6588671f054c7508bb))
- **core:** Add cleanup process for the page before perform immutable rule ([c4e4820](https://github.com/acot-a11y/acot/commit/c4e48203bd9af0289f310b0e155409cfacc1002d))

## [0.0.2-canary.6](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.2-canary.5...@acot/core@0.0.2-canary.6) (2020-11-08)

### Bug Fixes

- **core:** Fix a bug that prevented closing a used page ([fd6e55f](https://github.com/acot-a11y/acot/commit/fd6e55f33d6ef057f1c869345674d3a399285032))

## [0.0.2-canary.5](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.2-canary.4...@acot/core@0.0.2-canary.5) (2020-11-08)

### Bug Fixes

- **core:** Fix navigation wait logic ([1178dc9](https://github.com/acot-a11y/acot/commit/1178dc9d4ea6582be3f9d93ebf5aa58f7f7f55ce))

## [0.0.2-canary.4](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.2-canary.3...@acot/core@0.0.2-canary.4) (2020-11-08)

### Bug Fixes

- **core:** Fix a bug in which the queue is executed without waiting ([51ddb83](https://github.com/acot-a11y/acot/commit/51ddb836309f927da27e947ac209662ca6696d5e))
- **core:** Human readable output log of browser console ([10c6c27](https://github.com/acot-a11y/acot/commit/10c6c277c7f2050cffffa7e8f251fb1056dd7286))

## [0.0.2-canary.3](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.2-canary.2...@acot/core@0.0.2-canary.3) (2020-11-08)

### Features

- **core:** Performance improvements with immutable rules ([572edef](https://github.com/acot-a11y/acot/commit/572edefca26d1817a46e2f1c74c8d31b6762642d))

## [0.0.2-canary.2](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.2-canary.1...@acot/core@0.0.2-canary.2) (2020-11-03)

### Bug Fixes

- Minor bug fixes that occur during Audit ([0ec7b94](https://github.com/acot-a11y/acot/commit/0ec7b94e8f885cb45aae351d0279033367b8d94c))

### Features

- **core:** Add debug log ([c0b9837](https://github.com/acot-a11y/acot/commit/c0b98374abf2d5547c6e78b4b1cc9a92027e9f3a))

## [0.0.2-canary.1](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.2-canary.0...@acot/core@0.0.2-canary.1) (2020-11-02)

**Note:** Version bump only for package @acot/core

## [0.0.2-canary.0](https://github.com/acot-a11y/acot/compare/@acot/core@0.0.1...@acot/core@0.0.2-canary.0) (2020-11-02)

### Bug Fixes

- **core:** Fix a bug that `BrowserPool` hangs ([93da5cb](https://github.com/acot-a11y/acot/commit/93da5cbdf28508e4e3cf95983bf710d1675ff3da))
- **reporter:** Fix a bug that PrettyReporter hangs in the case of many URLs ([7248532](https://github.com/acot-a11y/acot/commit/7248532c0380a0483a537c124173f2191027dd54))

## 0.0.1 (2020-10-31)

### Features

- Initial implements ([68f46a2](https://github.com/acot-a11y/acot/commit/68f46a250de7793795678ece40d23d927ddd075c))
