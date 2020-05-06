import { User } from "../../models/user"

export default async (req, res, options, resolve) => {
  const { cookies, adapter } = options
  const _adapter = await adapter.getAdapter()
  const { getUserById, getSessionById } = _adapter
  const sessionId = req.cookies[cookies.sessionId.name]

  let response = {}

  // @TODO provide adapter method to make it easy  to safely seralize user information and avoid
  // making assumptions about the user / session model (they should be loosely coupled.)
  const session = await getSessionById(sessionId)
  if (session) {
    const user = await getUserById(session.userId)
    // Only expose *name* and *email* to client side.
    // This is for presentation purposes (e.g. "you are logged in as…")
    response = {
      user: {
        name: user.name,
        email: user.email,
      },
      accessToken: session.accessToken,
      accessTokenExpires: session.accessTokenExpires
    }
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(response))
  return resolve()
}