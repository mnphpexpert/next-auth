export default (_providers, urlPrefix) => {
  const providers = {}

  _providers.forEach(provider => {
    const providerId = provider.id
    providers[providerId] = {
      ...provider,
      signinUrl: `${urlPrefix}/signin/${providerId}`,
      callbackUrl: `${urlPrefix}/callback/${providerId}`
    }
  })

  return providers
}
