![Logo](admin/pushover.png)
# ioBroker.pushover

![Number of Installations](http://iobroker.live/badges/pushover-installed.svg)
![Number of Installations](http://iobroker.live/badges/pushover-stable.svg)
[![NPM version](http://img.shields.io/npm/v/iobroker.pushover.svg)](https://www.npmjs.com/package/iobroker.pushover)

![Test and Release](https://github.com/ioBroker/iobroker.pushover/workflows/Test%20and%20Release/badge.svg)
[![Translation status](https://weblate.iobroker.net/widgets/adapters/-/pushover/svg-badge.svg)](https://weblate.iobroker.net/engage/adapters/?utm_source=widget)
[![Downloads](https://img.shields.io/npm/dm/iobroker.pushover.svg)](https://www.npmjs.com/package/iobroker.pushover)

[Pushover](https://pushover.net) is a service of Pushover, LLC (formerly Superblock, LLC), a private, independently financed software development company based out of Chicago, Illinois. **This ioBroker adapter is not written or supported by Pushover, LLC**.

## Documentation

[🇺🇸 Documentation](./docs/en/README.md)

[🇩🇪 Dokumentation](./docs/de/README.md)

## Sentry

**This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers.** For more details and for information how to disable the error reporting see [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Sentry reporting is used starting with js-controller 3.0.

## Changelog

<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->
### **WORK IN PROGRESS**
* (robseh) Added a field "tags" to hand over a tag to pushover-service
* (@GermanBluefox) Updated packages

### 4.1.0 (2024-08-17)
* (isi07) added HTML/monospace options to blockly
* (isi07) fixed issue that blockly block is invalid when different priority other than normal is selected
* (isi07) fixed the error when log level selected by duplicate quotes

### 4.0.0 (2024-07-13)
* Breaking changes: NodeJS >= 18.x and js-controller >= 5 are required
* (@klein0r) Updated dependencies
* (@klein0r) Fixed blockly definitions
* (@klein0r) Updated translations

### 3.0.6 (2023-11-06)
* (ticaki) Caught the error by sending of sendToAsync if no configuration exists

### 3.0.5 (2023-10-24)
* (bluefox) Updated packages

### 3.0.4 (2023-08-08)
* (MrStefanH) Added new ttl parameter to blockly

## License

The MIT License (MIT)

Copyright (c) 2014-2025 bluefox <dogafox@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
