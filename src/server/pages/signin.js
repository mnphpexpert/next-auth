import { h } from 'preact' // eslint-disable-line no-unused-vars
import render from 'preact-render-to-string'

export default ({ providers, callbackUrl }) => {
  const withCallbackUrl = callbackUrl ? `?callbackUrl=${callbackUrl}` : ''
  return render(
    <div className='signin'>
      {providers.map(provider =>
        <p key={provider.id}>
          <a className='button' data-provider={provider.id} href={`${provider.signinUrl}${withCallbackUrl}`}>Sign in with {provider.name}</a>
        </p>
      )}
    </div>
  )
}
