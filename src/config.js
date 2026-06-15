// ════════ Integration config ════════
// Where "Apply for New PNG Connection" sends the customer to onboard.
//
//  - REAL MyPNG frontend (png-frontend), run locally:  http://localhost:5174/login
//  - Live MyPNG/Central Portal (on the user's network): http://15.206.148.94:3000/login
//  - In-app recreation (offline, no backend needed):    #/mypng
//
// Set USE_REAL_MYPNG = false to use the bundled in-app recreation instead.
export const USE_REAL_MYPNG = false
export const MYPNG_URL = 'http://15.206.148.94:3000/login'  // live/original MyPNG (user's network)
