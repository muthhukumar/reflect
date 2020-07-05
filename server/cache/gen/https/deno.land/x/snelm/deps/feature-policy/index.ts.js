function isPlainObject(value) {
    return (typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null);
}
function getHeaderValueFromOptions(options) {
    const FEATURES = {
        accelerometer: 'accelerometer',
        ambientLightSensor: 'ambient-light-sensor',
        autoplay: 'autoplay',
        battery: 'battery',
        camera: 'camera',
        displayCapture: 'display-capture',
        documentDomain: 'document-domain',
        documentWrite: 'document-write',
        encryptedMedia: 'encrypted-media',
        executionWhileNotRendered: 'execution-while-not-rendered',
        executionWhileOutOfViewport: 'execution-while-out-of-viewport',
        fontDisplayLateSwap: 'font-display-late-swap',
        fullscreen: 'fullscreen',
        geolocation: 'geolocation',
        gyroscope: 'gyroscope',
        layoutAnimations: 'layout-animations',
        legacyImageFormats: 'legacy-image-formats',
        loadingFrameDefaultEager: 'loading-frame-default-eager',
        magnetometer: 'magnetometer',
        microphone: 'microphone',
        midi: 'midi',
        navigationOverride: 'navigation-override',
        notifications: 'notifications',
        oversizedImages: 'oversized-images',
        payment: 'payment',
        pictureInPicture: 'picture-in-picture',
        publickeyCredentials: 'publickey-credentials',
        push: 'push',
        serial: 'serial',
        speaker: 'speaker',
        syncScript: 'sync-script',
        syncXhr: 'sync-xhr',
        unoptimizedImages: 'unoptimized-images',
        unoptimizedLosslessImages: 'unoptimized-lossless-images',
        unoptimizedLossyImages: 'unoptimized-lossy-images',
        unsizedMedia: 'unsized-media',
        usb: 'usb',
        verticalScroll: 'vertical-scroll',
        vibrate: 'vibrate',
        vr: 'vr',
        wakeLock: 'wake-lock',
        xr: 'xr',
        xrSpatialTracking: 'xr-spatial-tracking',
    };
    if (!isPlainObject(options)) {
        throw new Error('featurePolicy must be called with an object argument. See the documentation.');
    }
    const { features } = options;
    if (!isPlainObject(features)) {
        throw new Error('featurePolicy must have a single key, "features", which is an object of features. See the documentation.');
    }
    const result = Object.entries(features).map(([featureKeyCamelCase, featureValue]) => {
        if (!Object.prototype.hasOwnProperty.call(FEATURES, featureKeyCamelCase)) {
            throw new Error(`featurePolicy does not support the "${featureKeyCamelCase}" feature.`);
        }
        if (!Array.isArray(featureValue) || featureValue.length === 0) {
            throw new Error(`The value of the "${featureKeyCamelCase}" feature must be a non-empty array of strings.`);
        }
        const allowedValuesSeen = new Set();
        featureValue.forEach((allowedValue) => {
            if (typeof allowedValue !== 'string') {
                throw new Error(`The value of the "${featureKeyCamelCase}" feature contains a non-string, which is not supported.`);
            }
            else if (allowedValuesSeen.has(allowedValue)) {
                throw new Error(`The value of the "${featureKeyCamelCase}" feature contains duplicates, which it shouldn't.`);
            }
            else if (allowedValue === 'self') {
                throw new Error("'self' must be quoted.");
            }
            else if (allowedValue === 'none') {
                throw new Error("'none' must be quoted.");
            }
            allowedValuesSeen.add(allowedValue);
        });
        if (featureValue.length > 1) {
            if (allowedValuesSeen.has('*')) {
                throw new Error(`The value of the "${featureKeyCamelCase}" feature cannot contain * and other values.`);
            }
            else if (allowedValuesSeen.has("'none'")) {
                throw new Error(`The value of the "${featureKeyCamelCase}" feature cannot contain 'none' and other values.`);
            }
        }
        const featureKeyDashed = FEATURES[featureKeyCamelCase];
        return [featureKeyDashed, ...featureValue].join(' ');
    }).join(';');
    if (result.length === 0) {
        throw new Error('At least one feature is required.');
    }
    return result;
}
export default function featurePolicy(requestResponse, options) {
    if (options !== undefined) {
        const headerValue = getHeaderValueFromOptions(options);
        requestResponse.setResponseHeader('Feature-Policy', headerValue);
    }
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxTQUFTLGFBQWEsQ0FBQyxLQUFjO0lBQ25DLE9BQU8sQ0FDTCxPQUFPLEtBQUssS0FBSyxRQUFRO1FBQ3pCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDckIsS0FBSyxLQUFLLElBQUksQ0FDZixDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQUMsT0FBZ0I7SUFDakQsTUFBTSxRQUFRLEdBQTRDO1FBQ3hELGFBQWEsRUFBRSxlQUFlO1FBQzlCLGtCQUFrQixFQUFFLHNCQUFzQjtRQUMxQyxRQUFRLEVBQUUsVUFBVTtRQUNwQixPQUFPLEVBQUUsU0FBUztRQUNsQixNQUFNLEVBQUUsUUFBUTtRQUNoQixjQUFjLEVBQUUsaUJBQWlCO1FBQ2pDLGNBQWMsRUFBRSxpQkFBaUI7UUFDakMsYUFBYSxFQUFFLGdCQUFnQjtRQUMvQixjQUFjLEVBQUUsaUJBQWlCO1FBQ2pDLHlCQUF5QixFQUFFLDhCQUE4QjtRQUN6RCwyQkFBMkIsRUFBRSxpQ0FBaUM7UUFDOUQsbUJBQW1CLEVBQUUsd0JBQXdCO1FBQzdDLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLFdBQVcsRUFBRSxhQUFhO1FBQzFCLFNBQVMsRUFBRSxXQUFXO1FBQ3RCLGdCQUFnQixFQUFFLG1CQUFtQjtRQUNyQyxrQkFBa0IsRUFBRSxzQkFBc0I7UUFDMUMsd0JBQXdCLEVBQUUsNkJBQTZCO1FBQ3ZELFlBQVksRUFBRSxjQUFjO1FBQzVCLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLElBQUksRUFBRSxNQUFNO1FBQ1osa0JBQWtCLEVBQUUscUJBQXFCO1FBQ3pDLGFBQWEsRUFBRSxlQUFlO1FBQzlCLGVBQWUsRUFBRSxrQkFBa0I7UUFDbkMsT0FBTyxFQUFFLFNBQVM7UUFDbEIsZ0JBQWdCLEVBQUUsb0JBQW9CO1FBQ3RDLG9CQUFvQixFQUFFLHVCQUF1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