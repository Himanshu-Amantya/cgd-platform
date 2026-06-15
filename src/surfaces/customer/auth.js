// Customer session — backed by real JWT from the backend (lib/api.js).
import { api, session } from '../../lib/api.js'

export const auth = {
  isAuthed: () => !!session.token() && session.user()?.type === 'customer',
  user: () => session.user(),
  logout: () => session.clear(),
  // dev convenience: request the OTP (returned in dev) and verify it, to log a
  // known customer straight in — used by the MyPNG cross-portal redirect.
  demoLogin: async (mobile) => {
    const { devOtp } = await api.requestOtp(mobile)
    const { token, user } = await api.verifyOtp(mobile, devOtp)
    session.set(token, { ...user, type: 'customer' })
    return user
  },
}
