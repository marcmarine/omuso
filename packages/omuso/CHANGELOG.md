# [1.5.0](https://github.com/marcmarine/omuso/compare/v1.4.0...v1.5.0) (2026-08-04)


### Bug Fixes

* Implement proper Markdown paragraph splitting ([6a76972](https://github.com/marcmarine/omuso/commit/6a7697292c9a91aff4da15edf7a790622c6621c3))


### Features

* Add BookContext and BookContextConfig types ([65ccf44](https://github.com/marcmarine/omuso/commit/65ccf446e882734bdd8ae6488351fd6aab93aaca))
* Support omitting specific paths from context ([549ecf6](https://github.com/marcmarine/omuso/commit/549ecf6f274d0f841ce9903f465d8c8b935d7950))

# [1.4.0](https://github.com/marcmarine/omuso/compare/v1.3.0...v1.4.0) (2026-01-24)


### Bug Fixes

* Rename Element to ContentElement ([7925818](https://github.com/marcmarine/omuso/commit/7925818609c6fb0269f0603c375078ff655eac09))


### Features

* Add context module for document parsing and navigation ([af3d1a9](https://github.com/marcmarine/omuso/commit/af3d1a9d7b020bbb08aa22e30b6677a0ea968204))
* Export createContext from context index file ([0d7fe48](https://github.com/marcmarine/omuso/commit/0d7fe483b8b9d5f0215c2cb338a04304a49ca854))

# [1.3.0](https://github.com/marcmarine/omuso/compare/v1.2.1...v1.3.0) (2026-01-19)


### Features

* Add slugs for sections and paragraphs ([35fc125](https://github.com/marcmarine/omuso/commit/35fc1253cf6601ebd22d8e6629f577bd6e1a0234))
* Add type declarations for Node projects ([aab472e](https://github.com/marcmarine/omuso/commit/aab472e18c5e7913ed4798b5234e626fbecc52bd))
* Update slugify to handle numbers in section names ([4b3298f](https://github.com/marcmarine/omuso/commit/4b3298fd8db5f81ed7231cacf8c843d6a0caaed5))

## [1.7.0](https://github.com/marcmarine/omuso/compare/omuso-v1.6.0...omuso-v1.7.0) (2026-10-02)


### Features

* Add configurable wiki-style section slugs ([f2bcb97](https://github.com/marcmarine/omuso/commit/f2bcb97d5994e5e7b1b8ba94a4610a678023a4b6))
* Add strong text parsing and rendering support ([b4193d4](https://github.com/marcmarine/omuso/commit/b4193d401caf3b0aa7854465c0d211c3c735a63a))
* Support slugless parsing with `slugStyle: 'none'` ([b46f805](https://github.com/marcmarine/omuso/commit/b46f805ad2c13d073eb577849be15f499a0cc30f))


### Bug Fixes

* Filter omitted sections from search results ([40e7a3c](https://github.com/marcmarine/omuso/commit/40e7a3c11c2681ac045f9444e4f600ba21425b0f))
* Isolate context state and deprecate singleton use ([3bb5c2b](https://github.com/marcmarine/omuso/commit/3bb5c2be038b7cb57031dc2599ff951a6d80fc33))
* Move TypeScript to devDependencies ([e156c06](https://github.com/marcmarine/omuso/commit/e156c0614fd72f70d8496692a817fb417bf297d5))
* Normalize CRLF line endings before parsing ([3885807](https://github.com/marcmarine/omuso/commit/38858075805da7bfc7254ad9e3d54c15f461400a))
* Normalize dots as slug separators and add tests ([f9c7bbf](https://github.com/marcmarine/omuso/commit/f9c7bbff220a8b375f39d8db85a6829a699c8be6))
* Preserve frontmatter titles over headings ([87f7dfc](https://github.com/marcmarine/omuso/commit/87f7dfc9ebff82e604799ee83bf3bdcf8075037a))
* Recognize only valid ATX headings ([ad61e37](https://github.com/marcmarine/omuso/commit/ad61e37a7f476c84b5818cba409f98b03ed96f58))
* Remove defaultLanguage from BookContextConfig ([f510c07](https://github.com/marcmarine/omuso/commit/f510c07d2c6261587702afd00199f1507dad933e))
* Remove redundant session content cloning ([2caaff9](https://github.com/marcmarine/omuso/commit/2caaff9ef4054cfdd4f71797a1d26b93edd79f4e))
* Respect omitted paths in table of contents ([f7eb279](https://github.com/marcmarine/omuso/commit/f7eb2792400460b70d2d8c23670850531a09ff15))
* Use parser slugs for manifest paths ([e434c63](https://github.com/marcmarine/omuso/commit/e434c63356fa4cd65d313bd551dc9cb8b133e6cd))


### Performance Improvements

* Precompute section references and path index in manifest ([a63b31c](https://github.com/marcmarine/omuso/commit/a63b31cd46255de2ba989a9c205781192baed989))

## [1.6.0](https://github.com/marcmarine/omuso/compare/omuso-v1.5.0...omuso-v1.6.0) (2026-09-18)


### Features

* Export parser as subpath entry point ([5c111c1](https://github.com/marcmarine/omuso/commit/5c111c13345377d652b1dbfa651a83ec7c8e473e))


### Bug Fixes

* Add date field to manifest metadata ([ad48817](https://github.com/marcmarine/omuso/commit/ad48817bf9f7f37a3997e92da51700f82fe4f8ef))
* Filter nested search results to avoid duplicate matches ([b706838](https://github.com/marcmarine/omuso/commit/b706838eee2872ea5332993b4da927e5eb083ea1))
* Simplify search results in reading session ([744bb3b](https://github.com/marcmarine/omuso/commit/744bb3b7df2d7e0e2534827a5d7b837089b1c77d))

## [1.2.1](https://github.com/marcmarine/omuso/compare/v1.2.0...v1.2.1) (2025-12-17)


### Bug Fixes

* Add CommonJS and type definitions to package exports ([3a191f6](https://github.com/marcmarine/omuso/commit/3a191f670cea7635a3abac5cc458d055c57848e9))

# [1.2.0](https://github.com/marcmarine/omuso/compare/v1.1.0...v1.2.0) (2025-12-17)


### Bug Fixes

* Change path separator in content paths ([e8c441c](https://github.com/marcmarine/omuso/commit/e8c441cdb55cc4057c0ab0ae3245025a59b1fd04))
* Update package exports and repository URL format ([839c984](https://github.com/marcmarine/omuso/commit/839c984c5e82d68b6cdc495c899e3d0c8431b5b1))


### Features

* Add Content type for content array in ParentNode ([baaeab0](https://github.com/marcmarine/omuso/commit/baaeab0f88a5cd9aad2e8c6f0360e000089d1552))

# [1.1.0](https://github.com/marcmarine/omuso/compare/v1.0.2...v1.1.0) (2025-10-18)


### Bug Fixes

* Adjust section depth calculation ([32210fc](https://github.com/marcmarine/omuso/commit/32210fc8032b031effd477ec6d158039538f7881))
* Preserve top-level headings in parser ([6bbdffa](https://github.com/marcmarine/omuso/commit/6bbdffa80e36b973c0a002ede66a0ae59b154678))
* Remove empty fields from root object ([93a318c](https://github.com/marcmarine/omuso/commit/93a318c01cad3339e87bc6fe68930534534d706e))
* Rename package exports ([531a393](https://github.com/marcmarine/omuso/commit/531a39323ab5ace62a80cfd54483c6a666c8e8a0))


### Features

* Add path property to section and paragraph types ([5f26707](https://github.com/marcmarine/omuso/commit/5f26707c69e23699aff486b3e0f9238f4cae5af7))

## [1.0.2](https://github.com/marcmarine/omuso/compare/v1.0.1...v1.0.2) (2025-10-10)


### Bug Fixes

* Rename package to OMUSO (initial release) ([dc065a2](https://github.com/marcmarine/omuso/commit/dc065a223221ab613865da001496a107c98deff9))

## [1.0.1](https://github.com/marcmarine/frommark/compare/v1.0.0...v1.0.1) (2025-10-08)


### Bug Fixes

* Rename project and reorganize code structure ([67f0e4e](https://github.com/marcmarine/frommark/commit/67f0e4e520f02d1f926d9fdf6e108e7dbabd6491))

# 1.0.0 (2025-10-04)


### Features

* Initial release ([28a6450](https://github.com/marcmarine/mark-json/commit/28a6450cdd31781ae595ff1d379a962c3343f15e))
