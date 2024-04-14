function modifyWebpackConfig(config) {
  config.module.rules.push({
    test: /\.css$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1
        }
      },
      'postcss-loader'
    ]
  })

  return config
}
module.exports = [
  {
    name: 'The size of the Mediator with Embed layout',
    limit: '10.1 KB',
    path: 'dist/index.js',
    import: '{createMediator, EmbedLayout}',
    modifyWebpackConfig
  },
  {
    name: 'The size of the Mediator with Overlay layout',
    limit: '10.2 KB',
    path: 'dist/index.js',
    import: '{createMediator, OverlayLayout}',
    modifyWebpackConfig
  },
  {
    name: 'The size of the Consumer',
    limit: '7.3 KB',
    path: 'dist/index.js',
    import: '{registerIFrame}',
    modifyWebpackConfig
  }
]
