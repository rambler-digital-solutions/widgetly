import {createMediator, Mediator, MediatorConfig} from './mediator'

jest.mock('domready', () => jest.fn())

jest.mock('./utils/random-id', () => ({
  randomId: jest.fn(() => 'mockedId')
}))

jest.mock('./utils/dom', () => ({
  mutationEvents: {
    on: jest.fn(),
    removeListener: jest.fn()
  }
}))

describe('Mediator', () => {
  let mediator: Mediator
  let config: MediatorConfig
  let properties: Record<string, any>

  beforeEach(() => {
    jest.resetAllMocks()

    config = {
      prefix: 'test',
      initialize: jest.fn()
    }

    properties = {
      testProperty: 'test'
    }

    mediator = createMediator(config, properties)
  })

  it('should initialize with the provided config', () => {
    expect(mediator.prefix).toBe(config.prefix)
    expect(config.initialize).toHaveBeenCalled()
  })

  it('should define a widget', () => {
    const widgetConfig = {
      name: 'testWidget',
      someConfig: true,
      initialize: jest.fn()
    }

    mediator.defineWidget(widgetConfig)

    expect(mediator.widgets.testWidget).toBeDefined()
    expect(mediator.widgets.testWidget.config).toEqual(widgetConfig)
  })

  it('should build a widget', async () => {
    const widgetConfig = {
      name: 'testWidget',
      someConfig: true,
      initialize: jest.fn()
    }

    mediator.defineWidget(widgetConfig)

    const widgetParams = {
      testParam: 'test'
    }

    const widget = await mediator.buildWidget('testWidget', widgetParams)

    expect(widgetConfig.initialize).toHaveBeenCalled()
    expect(widget.on).toBeInstanceOf(Function)
    expect(widget.once).toBeInstanceOf(Function)
    expect(widget.removeListener).toBeInstanceOf(Function)
    expect(widget.params).toEqual(widgetParams)
  })

  it('should externalize a mediator for users', () => {
    const sdk = mediator.externalize()

    expect(sdk.buildWidget).toBeInstanceOf(Function)
    expect(sdk.initializeDOMElements).toBeInstanceOf(Function)
    expect(sdk.on).toBeInstanceOf(Function)
    expect(sdk.once).toBeInstanceOf(Function)
    expect(sdk.removeListener).toBeInstanceOf(Function)
    expect((sdk as any).testProperty).toBe(properties.testProperty)
  })

  it('should externalize a mediator for iframe', () => {
    const provider = mediator.externalizeAsProvider()

    expect(provider.buildWidget).toBeInstanceOf(Function)
    expect(provider.initializeDOMElements).toBeInstanceOf(Function)
    expect(provider.on).toBeInstanceOf(Function)
    expect(provider.once).toBeInstanceOf(Function)
    expect(provider.removeListener).toBeInstanceOf(Function)
    expect((provider as any).testProperty).toBe(properties.testProperty)
  })
})
