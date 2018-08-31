# mParticle JS Web Kit Library

A kit is an extension to the core [mParticle Web SDK](https://github.com/mParticle/mparticle-javascript-sdk). A kit works as a bridge between the mParticle SDK and a partner SDK. It abstracts the implementation complexity, simplifying the implementation for developers.

A kit takes care of initializing and forwarding information depending on what you've configured in [your app's dashboard](https://app.mparticle.com).

## Create Your Own Integration

Detailed instructions on how to implement your own integration with the mParticle Web SDK can be found [here](https://docs.mparticle.com/developers/partners/kit-integrations/javascript-kit).

## Quick Start Guide

1. Fork this repo and `cd` into it
2. Run `npm install` to install dependencies.
3. Run `KIT=YOURKITNAME npm run watch` to watch files in the `src/` folder, and build your kit to `build/YOURKITNAME-Kit.js`.
4. Following examples such as [ABC](http://tbd) and [XYZ](http://tbd), edit files in `src`.
5. Once all of your methods are mapped in `src/`, stub your SDK methods and create tests in `test/tests.js`
6. Submit a pull request to this repo. A developer from mParticle will review it and once complete, we will help provide you with a repo for your integration.

Full detailed instructions on how to implement your own integration with the mParticle Web SDK can be found [here](https://docs.mparticle.com/developers/partners/kit-integrations/javascript-kit).


## Support

Questions? Give us a shout at <support@mparticle.com>

## License

This mParticle Web Kit is available under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0). See the LICENSE file for more info.
