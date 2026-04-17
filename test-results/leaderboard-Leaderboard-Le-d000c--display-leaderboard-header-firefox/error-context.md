# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: leaderboard.spec.ts >> Leaderboard >> Leaderboard Layout >> should display leaderboard header
- Location: tests\leaderboard.spec.ts:56:9

# Error details

```
Error: browser.newContext: Target page, context or browser has been closed
Browser logs:

[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80070057 (NS_ERROR_ILLEGAL_VALUE) [nsIWinTaskbar.getTaskbarProgress]"  nsresult: "0x80070057 (NS_ERROR_ILLEGAL_VALUE)"  location: "JS frame :: moz-src:///browser/components/downloads/DownloadsTaskbar.sys.mjs :: #windowsAttachIndicator :: line 183"  data: no]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][out] console.warn: LoginRecipes: "Falling back to a synchronous message for: http://localhost:8000."
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80070057 (NS_ERROR_ILLEGAL_VALUE) [nsIWinTaskbar.getTaskbarProgress]"  nsresult: "0x80070057 (NS_ERROR_ILLEGAL_VALUE)"  location: "JS frame :: moz-src:///browser/components/downloads/DownloadsTaskbar.sys.mjs :: #windowsAttachIndicator :: line 183"  data: no]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][out] console.warn: LoginRecipes: "Falling back to a synchronous message for: http://localhost:8000."
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/content/Runtime.js, line 135: NS_ERROR_XPC_BAD_CONVERT_NATIVE: Could not convert Native argument arg 1 [nsIWindowMediator.getOuterWindowWithId]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80070057 (NS_ERROR_ILLEGAL_VALUE) [nsIWinTaskbar.getTaskbarProgress]"  nsresult: "0x80070057 (NS_ERROR_ILLEGAL_VALUE)"  location: "JS frame :: moz-src:///browser/components/downloads/DownloadsTaskbar.sys.mjs :: #windowsAttachIndicator :: line 183"  data: no]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][out] console.warn: LoginRecipes: "Falling back to a synchronous message for: http://localhost:8000."
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/content/Runtime.js, line 135: NS_ERROR_XPC_BAD_CONVERT_NATIVE: Could not convert Native argument arg 1 [nsIWindowMediator.getOuterWindowWithId]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80070057 (NS_ERROR_ILLEGAL_VALUE) [nsIWinTaskbar.getTaskbarProgress]"  nsresult: "0x80070057 (NS_ERROR_ILLEGAL_VALUE)"  location: "JS frame :: moz-src:///browser/components/downloads/DownloadsTaskbar.sys.mjs :: #windowsAttachIndicator :: line 183"  data: no]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][out] console.warn: LoginRecipes: "Falling back to a synchronous message for: http://localhost:8000."
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/content/Runtime.js, line 135: NS_ERROR_XPC_BAD_CONVERT_NATIVE: Could not convert Native argument arg 1 [nsIWindowMediator.getOuterWindowWithId]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] 
[pid=12780][out]         ERROR: ERROR: cannot find session with id "75622176-a921-40d4-b64f-374dd0a470db" _dispatch@chrome://juggler/content/protocol/Dispatcher.js:54:15
[pid=12780][out] receiveMessage@chrome://juggler/content/components/Juggler.js:121:20
[pid=12780][out] 
[pid=12780][out]       console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80070057 (NS_ERROR_ILLEGAL_VALUE) [nsIWinTaskbar.getTaskbarProgress]"  nsresult: "0x80070057 (NS_ERROR_ILLEGAL_VALUE)"  location: "JS frame :: moz-src:///browser/components/downloads/DownloadsTaskbar.sys.mjs :: #windowsAttachIndicator :: line 183"  data: no]
[pid=12780][out] console.warn: LoginRecipes: "Falling back to a synchronous message for: http://localhost:8000."
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/content/Runtime.js, line 135: NS_ERROR_XPC_BAD_CONVERT_NATIVE: Could not convert Native argument arg 1 [nsIWindowMediator.getOuterWindowWithId]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80070057 (NS_ERROR_ILLEGAL_VALUE) [nsIWinTaskbar.getTaskbarProgress]"  nsresult: "0x80070057 (NS_ERROR_ILLEGAL_VALUE)"  location: "JS frame :: moz-src:///browser/components/downloads/DownloadsTaskbar.sys.mjs :: #windowsAttachIndicator :: line 183"  data: no]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][out] console.warn: LoginRecipes: "Falling back to a synchronous message for: http://localhost:8000."
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/content/Runtime.js, line 135: NS_ERROR_XPC_BAD_CONVERT_NATIVE: Could not convert Native argument arg 1 [nsIWindowMediator.getOuterWindowWithId]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80070057 (NS_ERROR_ILLEGAL_VALUE) [nsIWinTaskbar.getTaskbarProgress]"  nsresult: "0x80070057 (NS_ERROR_ILLEGAL_VALUE)"  location: "JS frame :: moz-src:///browser/components/downloads/DownloadsTaskbar.sys.mjs :: #windowsAttachIndicator :: line 183"  data: no]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][out] console.warn: LoginRecipes: "Falling back to a synchronous message for: http://localhost:8000."
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80070057 (NS_ERROR_ILLEGAL_VALUE) [nsIWinTaskbar.getTaskbarProgress]"  nsresult: "0x80070057 (NS_ERROR_ILLEGAL_VALUE)"  location: "JS frame :: moz-src:///browser/components/downloads/DownloadsTaskbar.sys.mjs :: #windowsAttachIndicator :: line 183"  data: no]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][out] console.warn: LoginRecipes: "Falling back to a synchronous message for: http://localhost:8000."
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780][err] JavaScript warning: http://localhost:3000/socket.io/socket.io.js, line 1306: Script terminated by timeout at:
[pid=12780][err] unloadHandler@http://localhost:3000/socket.io/socket.io.js:1306:3
[pid=12780][err] EventListener.handleEvent*@http://localhost:3000/socket.io/socket.io.js:1297:23
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:9:90
[pid=12780][err] @http://localhost:3000/socket.io/socket.io.js:10:3
[pid=12780][err] 
[pid=12780][err] JavaScript error: chrome://juggler/content/content/Runtime.js, line 135: NS_ERROR_XPC_BAD_CONVERT_NATIVE: Could not convert Native argument arg 1 [nsIWindowMediator.getOuterWindowWithId]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][err] JavaScript error: chrome://juggler/content/Helper.js, line 82: NS_ERROR_FAILURE: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWebProgress.removeProgressListener]
[pid=12780][out] console.error: [Exception... "Component returned failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIContentSniffer.getMIMETypeFromContent]"  nsresult: "0x80040111 (NS_ERROR_NOT_AVAILABLE)"  location: "JS frame :: resource:///modules/FaviconLoader.sys.mjs :: onStopRequest :: line 348"  data: no]
[pid=12780] <gracefully close start>
[pid=12780][err] Exiting due to channel error.
```

```
TypeError: Cannot read properties of undefined (reading 'cleanup')
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { AuthHelper } from './helpers/auth';
  3   | import { TestUtils } from './helpers/utils';
  4   | import { ApiHelper } from './helpers/api';
  5   | 
  6   | test.describe('Leaderboard', () => {
  7   |   let authHelper: AuthHelper;
  8   |   let testUtils: TestUtils;
  9   |   let apiHelper: ApiHelper;
  10  |   let testUser: { username: string; email: string; password: string };
  11  |   let testRoomId: string;
  12  |   let testTeamId: string;
  13  | 
  14  |   test.beforeEach(async ({ page }) => {
  15  |     authHelper = new AuthHelper(page);
  16  |     testUtils = new TestUtils(page);
  17  |     apiHelper = new ApiHelper();
  18  |     
  19  |     // Create and login test user
  20  |     testUser = authHelper.generateTestUser();
  21  |     await authHelper.register(testUser.username, testUser.email, testUser.password);
  22  |     
  23  |     // Sync the API helper token (apiHelper uses its own http client, separate from the browser)
  24  |     await apiHelper.login(testUser.email, testUser.password);
  25  |     
  26  |     // Create a test room
  27  |     const roomResponse = await apiHelper.createRoom({
  28  |       roomName: 'Leaderboard Test Room',
  29  |       roomDescription: 'Room for testing leaderboard',
  30  |       budgetPerTeam: 100,
  31  |       maxPlayersPerTeam: 11,
  32  |       startDate: testUtils.getCurrentDate(),
  33  |       endDate: testUtils.getFutureDate(30)
  34  |     });
  35  |     
  36  |     if (roomResponse.status === 'success') {
  37  |       testRoomId = roomResponse.data._id;
  38  |     }
  39  |     
  40  |     // Create test teams for leaderboard
  41  |     const teamResponse = await apiHelper.createTeam(testRoomId, {
  42  |       teamName: 'Leaderboard Test Team',
  43  |       budgetAllocated: 95
  44  |     });
  45  |     
  46  |     if (teamResponse.status === 'success') {
  47  |       testTeamId = teamResponse.data._id;
  48  |     }
  49  |   });
  50  | 
  51  |   test.afterEach(async () => {
> 52  |     await apiHelper.cleanup();
      |                     ^ TypeError: Cannot read properties of undefined (reading 'cleanup')
  53  |   });
  54  | 
  55  |   test.describe('Leaderboard Layout', () => {
  56  |     test('should display leaderboard header', async ({ page }) => {
  57  |       await page.goto(`/#leaderboard/${testRoomId}`);
  58  |       await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
  59  |       
  60  |       // Check header elements
  61  |       await expect(page.locator('.leaderboard-header h1')).toContainText('Live Leaderboard');
  62  |       await expect(page.locator('.leaderboard-controls')).toBeVisible();
  63  |       await expect(page.locator('#autoRefresh')).toBeVisible();
  64  |       await expect(page.locator('#manualRefresh')).toBeVisible();
  65  |     });
  66  | 
  67  |     test('should display match status section', async ({ page }) => {
  68  |       await page.goto(`/#leaderboard/${testRoomId}`);
  69  |       await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
  70  |       
  71  |       // Check match status elements
  72  |       await expect(page.locator('.match-status')).toBeVisible();
  73  |       await expect(page.locator('#matchStatus')).toBeVisible();
  74  |       await expect(page.locator('#startSyncBtn')).toBeVisible();
  75  |       
  76  |       // Should show default no sync message
  77  |       await expect(page.locator('#matchStatus')).toContainText('No active match sync');
  78  |     });
  79  | 
  80  |     test('should display leaderboard table', async ({ page }) => {
  81  |       await page.goto(`/#leaderboard/${testRoomId}`);
  82  |       await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
  83  |       
  84  |       // Check table structure
  85  |       await expect(page.locator('.leaderboard-table')).toBeVisible();
  86  |       await expect(page.locator('.leaderboard-table thead')).toBeVisible();
  87  |       await expect(page.locator('.leaderboard-table tbody')).toBeVisible();
  88  |       
  89  |       // Check table headers
  90  |       const headers = page.locator('.leaderboard-table th');
  91  |       await expect(headers.nth(0)).toContainText('Rank');
  92  |       await expect(headers.nth(1)).toContainText('Team Name');
  93  |       await expect(headers.nth(2)).toContainText('Points');
  94  |       await expect(headers.nth(3)).toContainText('Players');
  95  |       await expect(headers.nth(4)).toContainText('Budget Used');
  96  |     });
  97  | 
  98  |     test('should show back navigation', async ({ page }) => {
  99  |       await page.goto(`/#leaderboard/${testRoomId}`);
  100 |       await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
  101 |       
  102 |       await expect(page.locator('.back-link')).toBeVisible();
  103 |       await expect(page.locator('.back-link a')).toContainText('Back to Dashboard');
  104 |     });
  105 |   });
  106 | 
  107 |   test.describe('Team Rankings Display', () => {
  108 |     test('should show team in leaderboard', async ({ page }) => {
  109 |       await page.goto(`/#leaderboard/${testRoomId}`);
  110 |       await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
  111 |       
  112 |       // Should show the test team in leaderboard
  113 |       const teamRow = page.locator('#leaderboardBody tr').first();
  114 |       await expect(teamRow).toBeVisible();
  115 |       await expect(teamRow).toContainText('Leaderboard Test Team');
  116 |       
  117 |       // Check rank column (top 3 show medal emoji, rest show numbers)
  118 |       await expect(teamRow.locator('td').first()).toContainText('🥇');
  119 |       
  120 |       // Check initial points (should be 0)
  121 |       await expect(teamRow).toContainText('0');
  122 |     });
  123 | 
  124 |     test('should show empty state when no teams exist', async ({ page }) => {
  125 |       // Create a room without teams
  126 |       const emptyRoomResponse = await apiHelper.createRoom({
  127 |         roomName: 'Empty Room',
  128 |         roomDescription: 'Room with no teams',
  129 |         budgetPerTeam: 100,
  130 |         maxPlayersPerTeam: 11,
  131 |         startDate: testUtils.getCurrentDate(),
  132 |         endDate: testUtils.getFutureDate(30)
  133 |       });
  134 |       
  135 |       if (emptyRoomResponse.status === 'success') {
  136 |         await page.goto(`/#leaderboard/${emptyRoomResponse.data._id}`);
  137 |         await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
  138 |         
  139 |         // Should show empty state
  140 |         await expect(page.locator('#noLeaderboard')).toBeVisible();
  141 |         await expect(page.locator('#noLeaderboard')).toContainText('No teams in this room yet');
  142 |       }
  143 |     });
  144 | 
  145 |     test('should display team statistics correctly', async ({ page }) => {
  146 |       await page.goto(`/#leaderboard/${testRoomId}`);
  147 |       await page.waitForSelector('.leaderboard-container', { state: 'visible', timeout: 15000 });
  148 |       
  149 |       const teamRow = page.locator('#leaderboardBody tr').first();
  150 |       
  151 |       // Check team name
  152 |       await expect(teamRow).toContainText('Leaderboard Test Team');
```