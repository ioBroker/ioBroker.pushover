![Logo](admin/pushover.png)
# ioBroker.pushover

![Number of Installations](http://iobroker.live/badges/pushover-installed.svg)
![Number of Installations](http://iobroker.live/badges/pushover-stable.svg)
[![NPM version](http://img.shields.io/npm/v/iobroker.pushover.svg)](https://www.npmjs.com/package/iobroker.pushover)

![Test and Release](https://github.com/ioBroker/iobroker.pushover/workflows/Test%20and%20Release/badge.svg)
[![Translation status](https://weblate.iobroker.net/widgets/adapters/-/pushover/svg-badge.svg)](https://weblate.iobroker.net/engage/adapters/?utm_source=widget)
[![Downloads](https://img.shields.io/npm/dm/iobroker.pushover.svg)](https://www.npmjs.com/package/iobroker.pushover)

[Pushover](https://pushover.net) is a service of Pushover, LLC (formerly Superblock, LLC), a private, independently-financed software development company based out of Chicago, Illinois. **This ioBroker adapter is not written or supported by Pushover, LLC**.

## Installation

Please use the "adapter list" in ioBroker to install a stable version of this adapter. You can also use the CLI to install this adapter:

```
iobroker add pushover
```

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
### 3.0.5 (2023-10-24)
* (bluefox) Updated packages

### 3.0.4 (2023-08-08)
* (MrStefanH) Added new ttl parameter to blockly

### 3.0.3 (2022-07-27)
* (Apollon77) Fix crash cases reported by Sentry

### 3.0.2 (2022-07-14)
* (bluefox) Added log output of sent messages
* (bluefox) Added custom sound to blockly

### 3.0.0 (2022-07-05)
* (klein0r) Added app limits as states
* (klein0r) Changed to class definition
* (klein0r) Updated logo
* (klein0r) Updated testing

## License

The MIT License (MIT)

Copyright (c) 2014-2023 bluefox <dogafox@gmail.com>

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
