# Retina image

Cross browser implementation of retina images for high density screens

- Smartphones
- Tablets
- Retina MacBook Pro
- 4K displays (requires 4x)

## W3C standard

Only requests the retina image on high density devices.  
Non capable browser ignore the srcset attribute so no damage is done to them.

#### Usage

```html
<img src="{normal image}" srcset="{retina image} 2x" width="{normal image width}" height="{normal image height}">
```

More info:  
http://www.webkit.org/demos/srcset/

The srcset attribute is already supported by a wide range of browsers.

#### Browser support

- Chrome 34+
- Chrome for Android 36+
- Safari iOS 8+
- Safari 8+
- Opera 22+

Source:  
http://caniuse.com/srcset


## JavaScript polyfill

Browsers that are not capable of the srcset attribute are provided with retina image support via JavaScript (e.g. IE, Firefox, Android stock browser)

[jquery-srcset-retina-polyfill] (https://github.com/jcampbell1/jquery-srcset-retina-polyfill)

#### Note

Unfortunately there is an additional browser request to the normal image because the browser prefetches all sources before executing JavaScript.  
This only occurs on retina devices with browsers without the srcset support, so it is a tolerable issue.

------------

### Example

[examples/index.html] (examples/index.html)

