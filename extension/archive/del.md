scenario 1:
detector.js:18 ✅ Nesty Extension detected and markers set
react-dom_client.js?v=bcedaaf8:20103 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
:5173/:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
AuthContext.tsx:169 Auth event: TOKEN_REFRESHED hasSession: true
AuthContext.tsx:169 Auth event: INITIAL_SESSION hasSession: true
AuthContext.tsx:102 fetchUserData: Fetching data for user 51c9edd3-fe5d-401b-b1e4-8ccb4f44ead3
AuthContext.tsx:105 fetchUserData: Starting profile fetch...
AuthContext.tsx:34 fetchProfile: Querying profiles table for user: 51c9edd3-fe5d-401b-b1e4-8ccb4f44ead3
AuthContext.tsx:57 fetchProfile: Query successful, data: Object
AuthContext.tsx:107 fetchUserData: Profile fetch complete: true
AuthContext.tsx:109 fetchUserData: Starting registry fetch...
AuthContext.tsx:111 fetchUserData: Registry fetch complete: true
AuthContext.tsx:113 fetchUserData: Got profile: true registry: true
AuthContext.tsx:119 fetchUserData: Cleaning up, setting fetchingRef to false
useExtensionDetection.ts:41 ✅ Nesty Extension detected, version: 1.3.0
useExtensionDetection.ts:41 ✅ Nesty Extension detected, version: 1.3.0
useExtensionDetection.ts:41 ✅ Nesty Extension detected, version: 1.3.0
useExtensionDetection.ts:41 ✅ Nesty Extension detected, version: 1.3.0
AuthContext.tsx:39 fetchProfile: Query timeout after 5 seconds
(anonymous) @ AuthContext.tsx:39
AuthContext.tsx:70 fetchRegistry: Query timeout after 5 seconds
(anonymous) @ AuthContext.tsx:70


scenario 2
react-dom_client.js?v=bcedaaf8:20103 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
AuthContext.tsx:169 Auth event: SIGNED_IN hasSession: true
AuthContext.tsx:169 Auth event: INITIAL_SESSION hasSession: true
AuthContext.tsx:102 fetchUserData: Fetching data for user 51c9edd3-fe5d-401b-b1e4-8ccb4f44ead3
AuthContext.tsx:105 fetchUserData: Starting profile fetch...
AuthContext.tsx:34 fetchProfile: Querying profiles table for user: 51c9edd3-fe5d-401b-b1e4-8ccb4f44ead3
dashboard:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
AuthContext.tsx:57 fetchProfile: Query successful, data: {id: '51c9edd3-fe5d-401b-b1e4-8ccb4f44ead3', email: 'kehalim.michael@gmail.com', first_name: 'מיכאל', last_name: null, avatar_url: null, …}
AuthContext.tsx:107 fetchUserData: Profile fetch complete: true
AuthContext.tsx:109 fetchUserData: Starting registry fetch...
AuthContext.tsx:111 fetchUserData: Registry fetch complete: true
AuthContext.tsx:113 fetchUserData: Got profile: true registry: true
AuthContext.tsx:119 fetchUserData: Cleaning up, setting fetchingRef to false
AuthContext.tsx:39 fetchProfile: Query timeout after 5 seconds
(anonymous) @ AuthContext.tsx:39
setTimeout
(anonymous) @ AuthContext.tsx:38
(anonymous) @ AuthContext.tsx:37
(anonymous) @ AuthContext.tsx:106
(anonymous) @ AuthContext.tsx:216
(anonymous) @ @supabase_supabase-js.js?v=bcedaaf8:11714
_useSession @ @supabase_supabase-js.js?v=bcedaaf8:11293
await in _useSession
_emitInitialSession @ @supabase_supabase-js.js?v=bcedaaf8:11708
(anonymous) @ @supabase_supabase-js.js?v=bcedaaf8:11702
(anonymous) @ @supabase_supabase-js.js?v=bcedaaf8:11260
(anonymous) @ @supabase_supabase-js.js?v=bcedaaf8:9383
AuthContext.tsx:70 fetchRegistry: Query timeout after 5 seconds
(anonymous) @ AuthContext.tsx:70
setTimeout
(anonymous) @ AuthContext.tsx:69
(anonymous) @ AuthContext.tsx:68
(anonymous) @ AuthContext.tsx:110
await in (anonymous)
(anonymous) @ AuthContext.tsx:216
(anonymous) @ @supabase_supabase-js.js?v=bcedaaf8:11714
_useSession @ @supabase_supabase-js.js?v=bcedaaf8:11293
await in _useSession
_emitInitialSession @ @supabase_supabase-js.js?v=bcedaaf8:11708
(anonymous) @ @supabase_supabase-js.js?v=bcedaaf8:11702
(anonymous) @ @supabase_supabase-js.js?v=bcedaaf8:11260
(anonymous) @ @supabase_supabase-js.js?v=bcedaaf8:9383



