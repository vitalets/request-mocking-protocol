# Changelog

> This project follows the [Keep a Changelog](https://keepachangelog.com) format.

## [Unreleased]
* add duplicate-setup guards for the fetch and Playwright interceptors.
* improve debug logging.
* support `REQUEST_MOCKING_DEBUG` env var to enable debug mode for all mocks.
* make `MockClient` use last-added-wins precedence for overlapping mocks, aligning with Playwright route ordering.
* update examples and docs.

## [0.1.3] - 2025-06-19
* Update dependencies

## [0.1.2] - 2025-04-02
* Fix lodash imports

## [0.1.1] - 2025-03-07

* Support `statusText`.
* Handle types for moduleResolution: node.

## [0.1.0] - 2025-03-07

* Initial release.

[Unreleased]: https://github.com/vitalets/request-mocking-protocol/compare/0.1.3...HEAD
[0.1.3]: https://github.com/vitalets/request-mocking-protocol/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/vitalets/request-mocking-protocol/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/vitalets/request-mocking-protocol/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/vitalets/request-mocking-protocol/releases/tag/0.1.0
