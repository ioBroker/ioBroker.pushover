# Older changes
## 3.0.2 (2022-07-14)
* (bluefox) Added log output of sent messages
* (bluefox) Added custom sound to blockly

## 3.0.0 (2022-07-05)
* (klein0r) Added app limits as states
* (klein0r) Changed to class definition
* (klein0r) Updated logo
* (klein0r) Updated testing

## 2.1.0 (2022-02-20)
* Important: js-controller 3.0+ required! 
* (Apollon77) Remove some legacy code
* (Apollon77) Prevent potential crash case when error occurs

## 2.0.5 (2021-06-29)
* (bluefox) Corrected error with token

## 2.0.4 (2021-06-28)
* (dipts) Blockly input value for attachments
* (bluefox) implemented the "glances"

## 2.0.3 (2020-09-25)
* (klein0r) Removed spaces in the admin config dropdown

## 2.0.2 (2020-04-29)
* (Apollon77) fixes case that token is not defined/existing (Sentry IOBROKER-PUSHOVER-2)

## 2.0.1 (2020-04-24)
* (bluefox) Fixed error in the blockly if language was not "ru/en/de"
* (bluefox) Breaking change: the encryption of the password was changed, so the token must be entered anew. Store your token before update.

## 1.3.2 (2020-04-17)
* (Apollon77) add Error handler to not crash adapter (fixes Sentry IOBROKER-PUSHOVER-1)

## 1.3.0 (2020-04-12)
* (Apollon77) Fix token decryption and add compatibility to js-controller 3.0
* (Apollon77) Add Sentry (used in js-controller 3.0)

## 1.2.3 (2020-02-19)
* (bluefox) Token will be encrypted now.

## 1.2.0 (2020-02-03)
* (bluefox) Removed the getMessages call.

## 1.1.1 (2019-09-18)
* (Apollon77) js-controller 2.0 compatibility, dependency updates

## 1.1.0 (2018-09-02)
* (bluefox) Admin3 is supported now

## 1.0.4 (2017-10-22)
* (janhuddel) callback is now possible (to receive the receipt from pushover if you use priority = 2)

## 1.0.3 (2017-10-21)
* (Tan-DE) Change priorities in blockly

## 1.0.2 (2016-10-12)
* (bluefox) support of blockly

## 1.0.1 (2016-08-28)
* (bluefox) filter out double messages

## 1.0.0 (2016-06-01)
* (bluefox) fix timestamp
* (bluefox) update grunt packages

## 0.1.1 (2015-05-03)
* (bluefox) add readme link

## 0.1.0 (2015-01-03)
* (bluefox) enable npm install

## 0.0.4 (2014-11-22)
* (bluefox) support of new naming concept

## 0.0.3 (2014-10-08)
* (bluefox) add "daemon" mode to "subscribe"
