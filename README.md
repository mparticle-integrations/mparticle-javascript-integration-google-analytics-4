# mParticle JS Example Web Integration

A web integration (or a kit) is an extension to the core [mParticle Web SDK](https://github.com/mParticle/mparticle-javascript-sdk). A kit works as a bridge between the mParticle SDK and a partner SDK. It abstracts the implementation complexity, simplifying the implementation for developers.

A kit takes care of initializing and forwarding information depending on what you've configured in [mParticle's dashboard](https://app.mparticle.com).

## Create Your Own Integration

Detailed instructions on how to implement your own integration with the mParticle Web SDK can be found [here](https://docs.mparticle.com/developers/partners/kit-integrations/javascript-kit), but you can view a quick start guide below.

## Quick Start Guide

1. Fork this repo and `cd` into it locally on your computer.
2. Run `npm install` to install dependencies.
3. Run `KIT=YOURKITNAME npm run watch` to watch files in the `src/` folder, and automatically build your kit to `build/YOURKITNAME-Kit.js`. Your kit will continuously build as your save your edits.
4. Following examples such as [Optimizely](http://https://github.com/mparticle-integrations/mparticle-javascript-integration-optimizely), edit files in `src/`.
5. As you map mParticle's methods to your own in `src/`, stub your SDK methods and create tests in `test/tests.js`.
6. Submit a pull request to this repo. A developer from mParticle will review it and once complete, we will help provide you with a repo for your integration.

## Support

Questions? Give us a shout at <support@mparticle.com>

## License

This mParticle Web Kit is available under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0). See the LICENSE file for more info.
