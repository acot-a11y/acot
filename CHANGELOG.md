# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.0.19](https://github.com/acot-a11y/acot/compare/v0.0.18...v0.0.19) (2022-06-05)

### Bug Fixes

- **acot-reporter-pretty:** fix stat bugs in testcase summary ([f9a2552](https://github.com/acot-a11y/acot/commit/f9a2552fc758dd205d7431c1b8819aa297a18d09))
- **cli:** support non TTY environment on `preset test` ([48e3ce0](https://github.com/acot-a11y/acot/commit/48e3ce04cd12016e1deafbc63dc8e90482f6d212))

### Features

- **acot-preset-wcag:** add `invalid-id-reference` rule ([2a70d7e](https://github.com/acot-a11y/acot/commit/2a70d7e99342c360a0f788ddd96d357dc3a34944))
- **acot-runner-sitemap:** add retry behavior to sitemap fetcher ([fcc1293](https://github.com/acot-a11y/acot/commit/fcc1293fdb162115d87303f59c36b9958ebcd874))
- **cli:** add `parallel` option to `preset test` command ([32f7e1e](https://github.com/acot-a11y/acot/commit/32f7e1e523bf8e03b61f2e776e4e06535a44afd7))
- **document:** add progress indicator to documentation testing ([756158b](https://github.com/acot-a11y/acot/commit/756158bea53f797972bca577c0235a763fcef922))

## [0.0.18](https://github.com/acot-a11y/acot/compare/v0.0.17...v0.0.18) (2022-05-11)

### Features

- **acot-preset-wcag:** add `ignore` option to `dialog-focus` rule ([959bcbc](https://github.com/acot-a11y/acot/commit/959bcbc6f698e565f2a5b452970dfa0031d4fb6c))
- **acot-preset-wcag:** add `ignore` option to `img-has-name` rule ([36a152e](https://github.com/acot-a11y/acot/commit/36a152ef468f0ddfce15037eda23b9f2ed6ed51f))
- **acot-preset-wcag:** add `ignore` option to `interactive-has-enough-size` rule ([640a0aa](https://github.com/acot-a11y/acot/commit/640a0aa1530a20d7105d8ddab36d709681f3f776))
- **acot-preset-wcag:** add `ignore` option to `interactive-has-name` rule ([bcf6119](https://github.com/acot-a11y/acot/commit/bcf61195285a49ade70049f7a82643d8c6914ef1))
- **acot-preset-wcag:** add `ignore` option to `interactive-supports-focus` rule ([a563858](https://github.com/acot-a11y/acot/commit/a56385803a010589ac51fe52e37b496dd5e4d527))
- **acot-preset-wcag:** add `ignore` option to `link-has-name` rule ([97e01a5](https://github.com/acot-a11y/acot/commit/97e01a594c7a4b95cd4afdaa304ccd7554924a2b))
- **utils:** add `isElementMatches` utilify function ([53c4c58](https://github.com/acot-a11y/acot/commit/53c4c58db1e06127250ad1b1d4f97e6452dd754a))

## [0.0.17](https://github.com/acot-a11y/acot/compare/v0.0.17-canary.3...v0.0.17) (2022-05-10)

### Bug Fixes

- **acot-preset-wcag:** improve rule apply for hidden elements ([5f80cd8](https://github.com/acot-a11y/acot/commit/5f80cd81bc99fa1d35f8b7a39a95fb0e01c08216))

### Features

- **utils:** add `isElementHidden` utility function ([2529cf4](https://github.com/acot-a11y/acot/commit/2529cf4551759940a622607d49ed4dc7039a3ff7))

### Performance Improvements

- **acot-preset-wcag:** improve `focusable-has-indicator` performance ([a795308](https://github.com/acot-a11y/acot/commit/a7953080857b19b4b864031baf6dd4b5f9ded492))

## [0.0.17-canary.3](https://github.com/acot-a11y/acot/compare/v0.0.17-canary.2...v0.0.17-canary.3) (2022-05-06)

**Note:** Version bump only for package acot

## [0.0.17-canary.2](https://github.com/acot-a11y/acot/compare/v0.0.17-canary.1...v0.0.17-canary.2) (2022-05-06)

**Note:** Version bump only for package acot

## [0.0.17-canary.1](https://github.com/acot-a11y/acot/compare/v0.0.17-canary.0...v0.0.17-canary.1) (2022-05-05)

**Note:** Version bump only for package acot

## [0.0.17-canary.0](https://github.com/acot-a11y/acot/compare/v0.0.16...v0.0.17-canary.0) (2022-05-05)

### Bug Fixes

- **cli:** fix default value for `parallel` option ([9325b5a](https://github.com/acot-a11y/acot/commit/9325b5abe79cab852706d733dada5ba824e91c95))

### Features

- **acot-runner-sitemap:** add behavior to merge `config.paths` with collected paths ([fdcf2aa](https://github.com/acot-a11y/acot/commit/fdcf2aa6d8689e906ec86db86d296cf5317cea61))

### Reverts

- **core:** remove `immutable` rule flags ([7bd940b](https://github.com/acot-a11y/acot/commit/7bd940bdb08e277b3fdf3208ce0eac345e79dd8a))

## [0.0.16](https://github.com/acot-a11y/acot/compare/v0.0.15...v0.0.16) (2022-05-01)

### Bug Fixes

- fix a bug when Node not found on report ([4e65658](https://github.com/acot-a11y/acot/commit/4e656585b3aa63b17a63d71949326bdb4445af39))
- upgrade to `emittery@0.10.0` ([75304e8](https://github.com/acot-a11y/acot/commit/75304e89832b671ca1a01015acf9283d13d042dd))
- use puppeteer instance of default export ([14b26bb](https://github.com/acot-a11y/acot/commit/14b26bb55b12b1077f4c1c62fab8af934f11bc88))

### Features

- **acot-runner-storybook:** add collect stories timeout error ([c4ebb75](https://github.com/acot-a11y/acot/commit/c4ebb7560a295032e773c86ba76f22ffb97b5010))
- **acot-runner-storybook:** add support storybook v6 ([691129c](https://github.com/acot-a11y/acot/commit/691129c54538c2882444d90c0827556dd7e8827d))

## [0.0.15](https://github.com/acot-a11y/acot/compare/v0.0.14...v0.0.15) (2022-03-27)

### Bug Fixes

- update aom feature flag ([040a321](https://github.com/acot-a11y/acot/commit/040a321b83360f9f0b670e327d0876e9e297fa5a))

### Features

- upgrade puppeteer to v13 ([6598c99](https://github.com/acot-a11y/acot/commit/6598c99ead6734cdc6f71a184a75cf4577cfa17d))

## [0.0.14](https://github.com/acot-a11y/acot/compare/v0.0.14-canary.2...v0.0.14) (2022-01-03)

**Note:** Version bump only for package acot

## [0.0.14-canary.2](https://github.com/acot-a11y/acot/compare/v0.0.14-canary.1...v0.0.14-canary.2) (2022-01-03)

### Bug Fixes

- **core:** fix validation logic of rule options ([ae9fdbd](https://github.com/acot-a11y/acot/commit/ae9fdbdb43f586541b17fc678663065a21b4bf2a))

### Features

- **acot-reporter-github:** add debug options ([e492e54](https://github.com/acot-a11y/acot/commit/e492e54d9d56a5f0424376fbd5392bc28253d11f))

## [0.0.14-canary.1](https://github.com/acot-a11y/acot/compare/v0.0.14-canary.0...v0.0.14-canary.1) (2022-01-03)

### Bug Fixes

- **acot-reporter-github:** fix verbose log ([fb19a81](https://github.com/acot-a11y/acot/commit/fb19a81a3c6dd56529a890b93f227bb5d770fda3))

## [0.0.14-canary.0](https://github.com/acot-a11y/acot/compare/v0.0.13...v0.0.14-canary.0) (2022-01-03)

### Features

- add acot-reporter-github ([5c8a235](https://github.com/acot-a11y/acot/commit/5c8a235a016f595e401b8ce7e4508c17c07c8310))
- **mock:** add runner mock ([c9f71c3](https://github.com/acot-a11y/acot/commit/c9f71c369c2ede7514884b2e0187f0a4e841c218))

## [0.0.13](https://github.com/acot-a11y/acot/compare/v0.0.13-canary.0...v0.0.13) (2021-10-10)

### Features

- allow multiple reporters ([437022c](https://github.com/acot-a11y/acot/commit/437022c73270e94f80e3c337c4d4459967f66e9d))

## [0.0.13-canary.0](https://github.com/acot-a11y/acot/compare/v0.0.12...v0.0.13-canary.0) (2021-08-17)

### Bug Fixes

- update dependency is-ci to v3 ([4282333](https://github.com/acot-a11y/acot/commit/42823334b0a4ce569ed4b608cda5f2b9abe1123c))

### Features

- connection url includes path ([652b3ae](https://github.com/acot-a11y/acot/commit/652b3ae572de2d7a4033c0c509dbdfe5c01b8e6d))

## [0.0.12](https://github.com/acot-a11y/acot/compare/v0.0.11...v0.0.12) (2021-04-18)

### Features

- **acot-runner-sitemap:** add `timeout` options ([1a27081](https://github.com/acot-a11y/acot/commit/1a2708140e4c8310c389181b376b3638cc317aa5))
- **acot-runner-storybook:** add `timeout` options ([41b06f9](https://github.com/acot-a11y/acot/commit/41b06f98d7f920acc6a67a1912d32a856b357c48))

## [0.0.11](https://github.com/acot-a11y/acot/compare/v0.0.10...v0.0.11) (2021-04-12)

**Note:** Version bump only for package acot

## [0.0.10](https://github.com/acot-a11y/acot/compare/v0.0.10-canary.0...v0.0.10) (2021-04-11)

**Note:** Version bump only for package acot

## 0.0.10-canary.0 (2021-04-04)

### Bug Fixes

- fix summary duration bug ([a5fb2d3](https://github.com/acot-a11y/acot/commit/a5fb2d34bc30967d284b37b24a0ea54220bf3565))
- h1 ([4982414](https://github.com/acot-a11y/acot/commit/498241471b781795da70a54fa59c5b91d9f12bab))
- update dependency boxen to v5 ([271bb1f](https://github.com/acot-a11y/acot/commit/271bb1f87e8d30e6a1c6f6ec1ead59e1b356284c))
- update dependency execa to v5 ([456b0de](https://github.com/acot-a11y/acot/commit/456b0dec9695853acb711a90b676078fb7c45fb9))
- update dependency fastify-static to v4 ([4d69df7](https://github.com/acot-a11y/acot/commit/4d69df745cc20b7ee21379c0df406c08bf2268e1))
- Fix omission of version specification in `debug` package ([85f8ea4](https://github.com/acot-a11y/acot/commit/85f8ea44c7b029301dbcd6bceef427fda35972b6))
- Minor bug fixes that occur during Audit ([0ec7b94](https://github.com/acot-a11y/acot/commit/0ec7b94e8f885cb45aae351d0279033367b8d94c))
- **acot-preset-wcag:** fix focusable-has-indicator bug ([4488ca1](https://github.com/acot-a11y/acot/commit/4488ca13c67f64d2b1d68f75c1c7d01c4d0c0e44))
- **acot-preset-wcag:** fix type assertion ([1a5b05a](https://github.com/acot-a11y/acot/commit/1a5b05a6c6e0bec29008a6fe356bb0bacff70f84))
- **acot-runner:** fix dependencies ([00402e9](https://github.com/acot-a11y/acot/commit/00402e9fe33bba70d90a3917b7ad46071878bef7))
- **cli:** Fix a bug in `init` subcommand ([982553b](https://github.com/acot-a11y/acot/commit/982553b6e6dc76ecdd19727e8682f3e1efd90572))
- **cli:** Fix internal package import paths ([5081a27](https://github.com/acot-a11y/acot/commit/5081a27021bdb8c679e0f7bb1612b53dc46e477d))
- **core:** Add element2selector error handling ([4f1a9e5](https://github.com/acot-a11y/acot/commit/4f1a9e5cae66211cd8825028284e81077c8b745e))
- **core:** Fix a bug in which the queue is executed without waiting ([51ddb83](https://github.com/acot-a11y/acot/commit/51ddb836309f927da27e947ac209662ca6696d5e))
- **core:** Fix a bug that `BrowserPool` hangs ([93da5cb](https://github.com/acot-a11y/acot/commit/93da5cbdf28508e4e3cf95983bf710d1675ff3da))
- **core:** Fix a bug that prevented closing a used page ([fd6e55f](https://github.com/acot-a11y/acot/commit/fd6e55f33d6ef057f1c869345674d3a399285032))
- **core:** Fix navigation wait logic ([1178dc9](https://github.com/acot-a11y/acot/commit/1178dc9d4ea6582be3f9d93ebf5aa58f7f7f55ce))
- **core:** Human readable output log of browser console ([10c6c27](https://github.com/acot-a11y/acot/commit/10c6c277c7f2050cffffa7e8f251fb1056dd7286))
- **doc:** Fix trivial typos in README.md ([704019f](https://github.com/acot-a11y/acot/commit/704019f458c1bce1c8811dac2f34151c0d990a99))
- **document:** fix dependencies ([c49533a](https://github.com/acot-a11y/acot/commit/c49533a15e4e066320bd6d7c40a17b4912e3fb83))
- **mock-logger:** Tweak ([ab9210d](https://github.com/acot-a11y/acot/commit/ab9210dc1c645e78a9fcee5dc84a225289d1ce5c))
- **preset-wcag:** Fix immutable flags on WCAG rules ([f383f44](https://github.com/acot-a11y/acot/commit/f383f44e8e66918b609199fdcbb70c1c7221d7e4))
- **reporter:** Fix a bug that PrettyReporter hangs in the case of many URLs ([7248532](https://github.com/acot-a11y/acot/commit/7248532c0380a0483a537c124173f2191027dd54))
- **runner-storybook:** Wait for configuring store ([9daccd0](https://github.com/acot-a11y/acot/commit/9daccd0ca48ea1f7ab0a7b543e45fa685925dafa))
- Fix a bug in the rule performance tracker ([07e8f36](https://github.com/acot-a11y/acot/commit/07e8f36bfabfed8650fc8949409d94f48bca2677))
- **schema-validator:** Fix a duplicate ValidationError export ([30caad3](https://github.com/acot-a11y/acot/commit/30caad386952f72065112d3746add412d13098a3))

### Features

- Add rule result for pretty reporter ([f668f8a](https://github.com/acot-a11y/acot/commit/f668f8a56e730ea31ece53f23d7fd2629e456211))
- Improve progress display (pretty reporter) ([dc4e9e1](https://github.com/acot-a11y/acot/commit/dc4e9e1655408a499619a690798e06ef439844be))
- Initial implements ([68f46a2](https://github.com/acot-a11y/acot/commit/68f46a250de7793795678ece40d23d927ddd075c))
- **acot-preset-wcag:** add link-has-name ([e77f56b](https://github.com/acot-a11y/acot/commit/e77f56b4057619ee941e4b2af1c145cfb27205fd))
- **cli:** add `--(reporter|runner)-with` options ([64944e1](https://github.com/acot-a11y/acot/commit/64944e12c3af8572a84ffb8553ad657d119d2170))
- **cli:** Add `--no-open` options for `preset serve` sub-command ([0a43e58](https://github.com/acot-a11y/acot/commit/0a43e58bcb5b8e8f3bb1fe639989570eef6c5815))
- **cli:** add `@acot/sitemap` to init sub-command ([336196a](https://github.com/acot-a11y/acot/commit/336196a22223a0ebaeca99aed923b8910851706c))
- **cli:** Add filter logic to debug flag ([738c35d](https://github.com/acot-a11y/acot/commit/738c35d0c318036b09faff6588671f054c7508bb))
- **cli:** add update-notifier ([84fe911](https://github.com/acot-a11y/acot/commit/84fe91119ff4862cb82d00da2d0949965ec221c5))
- **cli:** For CI, enable `verbose` flag ([0cd3e16](https://github.com/acot-a11y/acot/commit/0cd3e16e145ef5d5f09b88219a7fbdcc430714b2))
- **cli:** Improve UX for init sub-command ([04e9aed](https://github.com/acot-a11y/acot/commit/04e9aedb05e8be8d07ef0ffa2d804ab89e8ccd56))
- **cli:** Skip ask about puppeteer if installed ([350dc09](https://github.com/acot-a11y/acot/commit/350dc09ced8e7c17c77edc75b879f18471b7d488))
- **connection:** use `GET` request instead of `HEAD` request [#34](https://github.com/acot-a11y/acot/issues/34) ([5a48d8a](https://github.com/acot-a11y/acot/commit/5a48d8ae9bcab53137cdd842f48fb8a17d9edc36))
- **core:** add chromium auto detection for `BrowserPool` ([21f7228](https://github.com/acot-a11y/acot/commit/21f722882efe18605dc3867ddf328f31aede160a))
- **core:** Add cleanup process for the page before perform immutable rule ([c4e4820](https://github.com/acot-a11y/acot/commit/c4e48203bd9af0289f310b0e155409cfacc1002d))
- **core:** Add debug log ([c0b9837](https://github.com/acot-a11y/acot/commit/c0b98374abf2d5547c6e78b4b1cc9a92027e9f3a))
- **core:** switch to `help` from `tags` ([7ac5678](https://github.com/acot-a11y/acot/commit/7ac56780e46c26f94aeda3f0c1d1482f47521acb))
- **document:** add `pattern` to specify test target ([67c319f](https://github.com/acot-a11y/acot/commit/67c319f911f75817c4685cdfab2112b031c5e3d0))
- add `@acot/acot-runner-sitemap` package ([9a760b7](https://github.com/acot-a11y/acot/commit/9a760b787df44a0febac52ccb254073179786306))
- add `@acot/mock` package ([fb6e4ba](https://github.com/acot-a11y/acot/commit/fb6e4bad5a5562260561c5585eb83ba492bdb6a6))
- **core:** Performance improvements with immutable rules ([572edef](https://github.com/acot-a11y/acot/commit/572edefca26d1817a46e2f1c74c8d31b6762642d))
- **document:** Add `acot-head` flag to test `<head>` in rule documentation ([a1c5760](https://github.com/acot-a11y/acot/commit/a1c5760c0207edcd64ccc55d106bf2f980897999))
- **document:** Change summary extraction logic ([361cd2b](https://github.com/acot-a11y/acot/commit/361cd2b448439fd769c20b757fe86abe67f653ee))
- **document:** Upgrade design of preset preview server ([21d555b](https://github.com/acot-a11y/acot/commit/21d555bf191af82a4781f64ab5a0bab5bcc5232f))
- **plugin/wcag:** Add `page-has-title` rule ([4353cab](https://github.com/acot-a11y/acot/commit/4353cabee66982a7b784731cbbeaa2c5035b6270))
- **preset:** add dialog-focus rule ([29ec6ba](https://github.com/acot-a11y/acot/commit/29ec6ba8466bf95678669a84cd14d278ded01821))
- **preset-wcag:** Add `page-has-valid-lang` rule ([8ee766c](https://github.com/acot-a11y/acot/commit/8ee766c3974c735553a830185bf098d0d427aacb))
- **preset-wcag:** add rule focusable-has-indicator ([3bdc1fe](https://github.com/acot-a11y/acot/commit/3bdc1fe8687066dcd0f1d79dfcc5f07f8a43a882))
- **preset-wcag:** Add some rules to recommended set ([6bafccc](https://github.com/acot-a11y/acot/commit/6bafcccdf3cb0974cd1a27b21e163ae7f1104783))
- **runner-storybook:** Add filter options for storybook runner ([c77d6bf](https://github.com/acot-a11y/acot/commit/c77d6bf50a1bddbbd1021c7b71d00e1652376b11))
- **types:** add ComputedAccessibleNode type ([bcd4322](https://github.com/acot-a11y/acot/commit/bcd4322b02cfdd9c264523f4b49d029b0ed92868))
- add img-has-name rule ([1e72566](https://github.com/acot-a11y/acot/commit/1e72566f3bd67422652e0f855c4673be259df41d))
- add interactive-has-name rule to acot-plugin-wcag instead of button-has-name ([95f8e2c](https://github.com/acot-a11y/acot/commit/95f8e2c408a4a04155ab126022d9ee9af66916ed))

### Performance Improvements

- **document:** Improve preset test performance ([51aa3d2](https://github.com/acot-a11y/acot/commit/51aa3d2f6dc6f609c179f5410c12d9ad431706f3))
