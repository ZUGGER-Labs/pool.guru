"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/page",{

/***/ "(app-pages-browser)/./src/uniswap/graph.ts":
/*!******************************!*\
  !*** ./src/uniswap/graph.ts ***!
  \******************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getUniswapV3Pools: function() { return /* binding */ getUniswapV3Pools; }\n/* harmony export */ });\n/* harmony import */ var _lib_network__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/network */ \"(app-pages-browser)/./src/lib/network.ts\");\n/* harmony import */ var _helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helper */ \"(app-pages-browser)/./src/uniswap/helper.ts\");\n\n\n// private helper functions\nconst _query = async (endpoint, query)=>{\n    const resp = await fetch(endpoint, {\n        method: \"POST\",\n        body: JSON.stringify({\n            query\n        })\n    });\n    if (resp.status !== 200) {\n        throw new Error(\"invalid response status: \" + resp.status);\n    }\n    const data = await resp.json();\n    const errors = data.errors;\n    if (errors && errors.length > 0) {\n        console.error(\"Uniswap Subgraph Errors\", {\n            errors,\n            query\n        });\n        throw new Error(\"Uniswap Subgraph Errors: \".concat(JSON.stringify(errors)));\n    }\n    return data.data;\n};\nconst _processTokenInfo = (token)=>{\n    token.logoURI = (0,_helper__WEBPACK_IMPORTED_MODULE_1__.getTokenLogoURL)(token.id);\n    // TODO: check the network id before replace the token name\n    if (token.name === \"Wrapped Ether\" || token.name === \"Wrapped Ethereum\") {\n        token.name = \"Ethereum\";\n        token.symbol = \"ETH\";\n        token.logoURI = \"https://cdn.iconscout.com/icon/free/png-128/ethereum-2752194-2285011.png\";\n    }\n    if (token.name === \"Wrapped Matic\") {\n        token.name = \"Polygon Native Token\";\n        token.symbol = \"MATIC\";\n    }\n    if (token.name === \"Wrapped BNB\") {\n        token.name = \"BSC Native Token\";\n        token.symbol = \"BNB\";\n    }\n    return token;\n};\nconst getBulkTokens = async (endpoint, tokenAddresses)=>{\n    const res = await _query(endpoint, \"{\\n      tokens(where: {id_in: [\".concat(tokenAddresses.map((id)=>'\"'.concat(id, '\"')).join(\",\"), \"]}) {\\n        id\\n        name\\n        symbol\\n        volumeUSD\\n        decimals\\n        totalValueLockedUSD\\n        tokenDayData(first: 1, orderBy: date, orderDirection: desc) {\\n          priceUSD\\n        }\\n      }\\n    }\"));\n    if (res.tokens !== null) {\n        res.tokens = res.tokens.map(_processTokenInfo);\n    }\n    return res.tokens;\n};\nconst processPools = async (endpoint, pools)=>{\n    const tokenIds = (0,_helper__WEBPACK_IMPORTED_MODULE_1__.getUniqueItems)(pools.reduce((acc, p)=>[\n            ...acc,\n            p.token0.id,\n            p.token1.id\n        ], []));\n    const queryPage = Math.ceil(tokenIds.length / 100);\n    // batch query getBulkTokens function by page using Promise.all\n    const tokens = await Promise.all(Array.from({\n        length: queryPage\n    }, (_, i)=>{\n        const start = i * 100;\n        const end = start + 100;\n        return getBulkTokens(endpoint, tokenIds.slice(start, end));\n    })).then((res)=>res.flat());\n    // sort token by volume\n    tokens.sort((a, b)=>Number(b.volumeUSD) - Number(a.volumeUSD));\n    // map poolCount\n    const poolCountByTokenId = pools.reduce((acc, p)=>{\n        acc[p.token0.id] = (acc[p.token0.id] || 0) + 1;\n        acc[p.token1.id] = (acc[p.token1.id] || 0) + 1;\n        return acc;\n    }, {});\n    const _tokens = tokens.map((t)=>{\n        return {\n            ...t,\n            poolCount: poolCountByTokenId[t.id]\n        };\n    });\n    // create hashmap of tokens id\n    const tokenMap = _tokens.reduce((acc, t)=>{\n        acc[t.id] = t;\n        return acc;\n    }, {});\n    const npools = pools.map((p)=>{\n        return {\n            ...p,\n            token0: tokenMap[p.token0.id],\n            token1: tokenMap[p.token1.id]\n        };\n    });\n    return {\n        pools: npools,\n        tokens\n    };\n};\n// get uniswap v3 pools\nconst getUniswapV3Pools = async (param)=>{\n    let { chainId, take, tvlUSD_gte, volUSD_gte } = param;\n    chainId = chainId || 1;\n    take = take || 1000; // fir\n    const endpoint = (0,_lib_network__WEBPACK_IMPORTED_MODULE_0__.getNetworkEndpoint)(chainId);\n    try {\n        const res = await _query(endpoint, \"{\\n        pools (first: \".concat(take, \", orderBy: totalValueLockedUSD, orderDirection: desc, where: {liquidity_gt: 0, totalValueLockedUSD_gte: \").concat(tvlUSD_gte, \", volumeUSD_gte: \").concat(volUSD_gte, \"}) {\\n          id\\n          token0 {\\n            id\\n          }\\n          token1 {\\n            id\\n          }\\n          feeTier\\n          liquidity\\n          tick\\n          totalValueLockedUSD\\n        }\\n      }\"));\n        if (!res || res.length === 0) {\n            return {\n                pools: [],\n                tokens: []\n            };\n        }\n        return processPools(endpoint, res.pools);\n    } catch (err) {\n        return {\n            pools: [],\n            tokens: []\n        };\n    }\n};\n\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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M0IsTUFBTS9ELFdBQVdKLGdFQUFrQkEsQ0FBQ2tFO0lBRXBDLElBQUk7UUFDRixNQUFNdEMsTUFBTSxNQUFNekIsT0FDaEJDLFVBQ0EsNEJBQ2lJZ0UsT0FBL0dELE1BQUssNEdBQXdJRSxPQUE5QkQsWUFBVyxxQkFBOEIsT0FBWEMsWUFBVztRQWU1SyxJQUFJLENBQUN6QyxPQUFPQSxJQUFJWCxNQUFNLEtBQUssR0FBRztZQUM1QixPQUFPO2dCQUFFZ0IsT0FBTyxFQUFFO2dCQUFFRixRQUFRLEVBQUU7WUFBQztRQUNqQztRQUVBLE9BQU9DLGFBQWE1QixVQUFVd0IsSUFBSUssS0FBSztJQUN6QyxFQUFFLE9BQU9xQyxLQUFLO1FBQ1osT0FBTztZQUFFckMsT0FBTyxFQUFFO1lBQUVGLFFBQVEsRUFBRTtRQUFDO0lBQ2pDO0FBQ0Y7QUFFNkIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL3VuaXN3YXAvZ3JhcGgudHM/YzRhZiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQb29sLCBUb2tlbiB9IGZyb20gXCJAL2ludGVyZmFjZXMvdW5pc3dhcC5pbnRlcmZhY2VcIjtcbmltcG9ydCB7IERFWF9UWVBFUywgZ2V0TmV0d29ya0VuZHBvaW50LCBnZXROZXR3b3JrTmFtZSB9IGZyb20gXCJAL2xpYi9uZXR3b3JrXCI7XG5pbXBvcnQgeyBnZXRUb2tlbkxvZ29VUkwsIGdldFVuaXF1ZUl0ZW1zIH0gZnJvbSBcIi4vaGVscGVyXCI7XG5cbi8vIHByaXZhdGUgaGVscGVyIGZ1bmN0aW9uc1xuY29uc3QgX3F1ZXJ5ID0gYXN5bmMgKGVuZHBvaW50OiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPGFueT4gPT4ge1xuICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goZW5kcG9pbnQsIHtcbiAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgcXVlcnkgfSksXG4gIH0pO1xuXG4gIGlmIChyZXNwLnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCByZXNwb25zZSBzdGF0dXM6IFwiICsgcmVzcC5zdGF0dXMpO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xuXG4gIGNvbnN0IGVycm9ycyA9IGRhdGEuZXJyb3JzO1xuICBpZiAoZXJyb3JzICYmIGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc29sZS5lcnJvcihcIlVuaXN3YXAgU3ViZ3JhcGggRXJyb3JzXCIsIHsgZXJyb3JzLCBxdWVyeSB9KTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuaXN3YXAgU3ViZ3JhcGggRXJyb3JzOiAke0pTT04uc3RyaW5naWZ5KGVycm9ycyl9YCk7XG4gIH1cblxuICByZXR1cm4gZGF0YS5kYXRhO1xufTtcblxuY29uc3QgX3Byb2Nlc3NUb2tlbkluZm8gPSAodG9rZW46IFRva2VuKSA9PiB7XG4gIHRva2VuLmxvZ29VUkkgPSBnZXRUb2tlbkxvZ29VUkwodG9rZW4uaWQpO1xuXG4gIC8vIFRPRE86IGNoZWNrIHRoZSBuZXR3b3JrIGlkIGJlZm9yZSByZXBsYWNlIHRoZSB0b2tlbiBuYW1lXG4gIGlmICh0b2tlbi5uYW1lID09PSBcIldyYXBwZWQgRXRoZXJcIiB8fCB0b2tlbi5uYW1lID09PSBcIldyYXBwZWQgRXRoZXJldW1cIikge1xuICAgIHRva2VuLm5hbWUgPSBcIkV0aGVyZXVtXCI7XG4gICAgdG9rZW4uc3ltYm9sID0gXCJFVEhcIjtcbiAgICB0b2tlbi5sb2dvVVJJID1cbiAgICAgIFwiaHR0cHM6Ly9jZG4uaWNvbnNjb3V0LmNvbS9pY29uL2ZyZWUvcG5nLTEyOC9ldGhlcmV1bS0yNzUyMTk0LTIyODUwMTEucG5nXCI7XG4gIH1cbiAgaWYgKHRva2VuLm5hbWUgPT09IFwiV3JhcHBlZCBNYXRpY1wiKSB7XG4gICAgdG9rZW4ubmFtZSA9IFwiUG9seWdvbiBOYXRpdmUgVG9rZW5cIjtcbiAgICB0b2tlbi5zeW1ib2wgPSBcIk1BVElDXCI7XG4gIH1cbiAgaWYgKHRva2VuLm5hbWUgPT09IFwiV3JhcHBlZCBCTkJcIikge1xuICAgIHRva2VuLm5hbWUgPSBcIkJTQyBOYXRpdmUgVG9rZW5cIjtcbiAgICB0b2tlbi5zeW1ib2wgPSBcIkJOQlwiO1xuICB9XG5cbiAgcmV0dXJuIHRva2VuO1xufTtcblxuY29uc3QgZ2V0QnVsa1Rva2VucyA9IGFzeW5jIChcbiAgZW5kcG9pbnQ6IHN0cmluZyxcbiAgdG9rZW5BZGRyZXNzZXM6IHN0cmluZ1tdXG4pOiBQcm9taXNlPFRva2VuW10+ID0+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgX3F1ZXJ5KFxuICAgIGVuZHBvaW50LFxuICAgIGB7XG4gICAgICB0b2tlbnMod2hlcmU6IHtpZF9pbjogWyR7dG9rZW5BZGRyZXNzZXNcbiAgICAgICAgLm1hcCgoaWQpID0+IGBcIiR7aWR9XCJgKVxuICAgICAgICAuam9pbihcIixcIil9XX0pIHtcbiAgICAgICAgaWRcbiAgICAgICAgbmFtZVxuICAgICAgICBzeW1ib2xcbiAgICAgICAgdm9sdW1lVVNEXG4gICAgICAgIGRlY2ltYWxzXG4gICAgICAgIHRvdGFsVmFsdWVMb2NrZWRVU0RcbiAgICAgICAgdG9rZW5EYXlEYXRhKGZpcnN0OiAxLCBvcmRlckJ5OiBkYXRlLCBvcmRlckRpcmVjdGlvbjogZGVzYykge1xuICAgICAgICAgIHByaWNlVVNEXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9YFxuICApO1xuXG4gIGlmIChyZXMudG9rZW5zICE9PSBudWxsKSB7XG4gICAgcmVzLnRva2VucyA9IHJlcy50b2tlbnMubWFwKF9wcm9jZXNzVG9rZW5JbmZvKTtcbiAgfVxuXG4gIHJldHVybiByZXMudG9rZW5zO1xufTtcblxuY29uc3QgcHJvY2Vzc1Bvb2xzID0gYXN5bmMgKFxuICBlbmRwb2ludDogc3RyaW5nLFxuICBwb29sczogUG9vbFtdXG4pID0+IHtcbiAgY29uc3QgdG9rZW5JZHMgPSBnZXRVbmlxdWVJdGVtcyhcbiAgICBwb29scy5yZWR1Y2UoXG4gICAgICAoYWNjOiBzdHJpbmdbXSwgcDogUG9vbCkgPT4gWy4uLmFjYywgcC50b2tlbjAuaWQsIHAudG9rZW4xLmlkXSxcbiAgICAgIFtdXG4gICAgKVxuICApO1xuICBjb25zdCBxdWVyeVBhZ2UgPSBNYXRoLmNlaWwodG9rZW5JZHMubGVuZ3RoIC8gMTAwKTtcbiAgLy8gYmF0Y2ggcXVlcnkgZ2V0QnVsa1Rva2VucyBmdW5jdGlvbiBieSBwYWdlIHVzaW5nIFByb21pc2UuYWxsXG4gIGNvbnN0IHRva2VucyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IHF1ZXJ5UGFnZSB9LCAoXywgaSkgPT4ge1xuICAgICAgY29uc3Qgc3RhcnQgPSBpICogMTAwO1xuICAgICAgY29uc3QgZW5kID0gc3RhcnQgKyAxMDA7XG4gICAgICByZXR1cm4gZ2V0QnVsa1Rva2VucyhlbmRwb2ludCwgdG9rZW5JZHMuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICAgIH0pXG4gICkudGhlbigocmVzKSA9PiByZXMuZmxhdCgpKTtcbiAgLy8gc29ydCB0b2tlbiBieSB2b2x1bWVcbiAgdG9rZW5zLnNvcnQoKGEsIGIpID0+IE51bWJlcihiLnZvbHVtZVVTRCkgLSBOdW1iZXIoYS52b2x1bWVVU0QpKTtcbiAgLy8gbWFwIHBvb2xDb3VudFxuICBjb25zdCBwb29sQ291bnRCeVRva2VuSWQgPSBwb29scy5yZWR1Y2UoKGFjYzogYW55LCBwOiBQb29sKSA9PiB7XG4gICAgYWNjW3AudG9rZW4wLmlkXSA9IChhY2NbcC50b2tlbjAuaWRdIHx8IDApICsgMTtcbiAgICBhY2NbcC50b2tlbjEuaWRdID0gKGFjY1twLnRva2VuMS5pZF0gfHwgMCkgKyAxO1xuICAgIHJldHVybiBhY2M7XG4gIH0sIHt9KTtcblxuICBjb25zdCBfdG9rZW5zID0gdG9rZW5zLm1hcCgodDogVG9rZW4pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4udCxcbiAgICAgIHBvb2xDb3VudDogcG9vbENvdW50QnlUb2tlbklkW3QuaWRdLFxuICAgIH07XG4gIH0pO1xuICAvLyBjcmVhdGUgaGFzaG1hcCBvZiB0b2tlbnMgaWRcbiAgY29uc3QgdG9rZW5NYXAgPSBfdG9rZW5zLnJlZHVjZSgoYWNjOiBhbnksIHQ6IFRva2VuKSA9PiB7XG4gICAgYWNjW3QuaWRdID0gdDtcbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG4gIGNvbnN0IG5wb29scyA9IHBvb2xzLm1hcCgocDogUG9vbCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5wLFxuICAgICAgdG9rZW4wOiB0b2tlbk1hcFtwLnRva2VuMC5pZF0sXG4gICAgICB0b2tlbjE6IHRva2VuTWFwW3AudG9rZW4xLmlkXSxcbiAgICB9O1xuICB9KTtcblxuICByZXR1cm4geyBwb29sczogbnBvb2xzLCB0b2tlbnMgfTtcbn07XG5cbi8vIGdldCB1bmlzd2FwIHYzIHBvb2xzXG5jb25zdCBnZXRVbmlzd2FwVjNQb29scyA9IGFzeW5jICh7XG4gIGNoYWluSWQsXG4gIHRha2UsXG4gIHR2bFVTRF9ndGUsXG4gIHZvbFVTRF9ndGUsXG59OiB7XG4gIGNoYWluSWQ/OiBudW1iZXI7XG4gIHRha2U/OiBudW1iZXI7XG4gIHR2bFVTRF9ndGU6IG51bWJlcjtcbiAgdm9sVVNEX2d0ZTogbnVtYmVyO1xufSk6IFByb21pc2U8e1xuICBwb29sczogUG9vbFtdO1xuICB0b2tlbnM6IFRva2VuW107XG59PiA9PiB7XG4gIGNoYWluSWQgPSBjaGFpbklkIHx8IDE7XG4gIHRha2UgPSB0YWtlIHx8IDEwMDA7IC8vIGZpclxuICBjb25zdCBlbmRwb2ludCA9IGdldE5ldHdvcmtFbmRwb2ludChjaGFpbklkKTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IF9xdWVyeShcbiAgICAgIGVuZHBvaW50LFxuICAgICAgYHtcbiAgICAgICAgcG9vbHMgKGZpcnN0OiAke3Rha2V9LCBvcmRlckJ5OiB0b3RhbFZhbHVlTG9ja2VkVVNELCBvcmRlckRpcmVjdGlvbjogZGVzYywgd2hlcmU6IHtsaXF1aWRpdHlfZ3Q6IDAsIHRvdGFsVmFsdWVMb2NrZWRVU0RfZ3RlOiAke3R2bFVTRF9ndGV9LCB2b2x1bWVVU0RfZ3RlOiAke3ZvbFVTRF9ndGV9fSkge1xuICAgICAgICAgIGlkXG4gICAgICAgICAgdG9rZW4wIHtcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuMSB7XG4gICAgICAgICAgICBpZFxuICAgICAgICAgIH1cbiAgICAgICAgICBmZWVUaWVyXG4gICAgICAgICAgbGlxdWlkaXR5XG4gICAgICAgICAgdGlja1xuICAgICAgICAgIHRvdGFsVmFsdWVMb2NrZWRVU0RcbiAgICAgICAgfVxuICAgICAgfWBcbiAgICApO1xuICAgIGlmICghcmVzIHx8IHJlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7IHBvb2xzOiBbXSwgdG9rZW5zOiBbXSB9O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9jZXNzUG9vbHMoZW5kcG9pbnQsIHJlcy5wb29scylcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIHsgcG9vbHM6IFtdLCB0b2tlbnM6IFtdIH07XG4gIH1cbn07XG5cbmV4cG9ydCB7IGdldFVuaXN3YXBWM1Bvb2xzIH07XG4iXSwibmFtZXMiOlsiZ2V0TmV0d29ya0VuZHBvaW50IiwiZ2V0VG9rZW5Mb2dvVVJMIiwiZ2V0VW5pcXVlSXRlbXMiLCJfcXVlcnkiLCJlbmRwb2ludCIsInF1ZXJ5IiwicmVzcCIsImZldGNoIiwibWV0aG9kIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiLCJzdGF0dXMiLCJFcnJvciIsImRhdGEiLCJqc29uIiwiZXJyb3JzIiwibGVuZ3RoIiwiY29uc29sZSIsImVycm9yIiwiX3Byb2Nlc3NUb2tlbkluZm8iLCJ0b2tlbiIsImxvZ29VUkkiLCJpZCIsIm5hbWUiLCJzeW1ib2wiLCJnZXRCdWxrVG9rZW5zIiwidG9rZW5BZGRyZXNzZXMiLCJyZXMiLCJtYXAiLCJqb2luIiwidG9rZW5zIiwicHJvY2Vzc1Bvb2xzIiwicG9vbHMiLCJ0b2tlbklkcyIsInJlZHVjZSIsImFjYyIsInAiLCJ0b2tlbjAiLCJ0b2tlbjEiLCJxdWVyeVBhZ2UiLCJNYXRoIiwiY2VpbCIsIlByb21pc2UiLCJhbGwiLCJBcnJheSIsImZyb20iLCJfIiwiaSIsInN0YXJ0IiwiZW5kIiwic2xpY2UiLCJ0aGVuIiwiZmxhdCIsInNvcnQiLCJhIiwiYiIsIk51bWJlciIsInZvbHVtZVVTRCIsInBvb2xDb3VudEJ5VG9rZW5JZCIsIl90b2tlbnMiLCJ0IiwicG9vbENvdW50IiwidG9rZW5NYXAiLCJucG9vbHMiLCJnZXRVbmlzd2FwVjNQb29scyIsImNoYWluSWQiLCJ0YWtlIiwidHZsVVNEX2d0ZSIsInZvbFVTRF9ndGUiLCJlcnIiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/uniswap/graph.ts\n"));

/***/ })

});