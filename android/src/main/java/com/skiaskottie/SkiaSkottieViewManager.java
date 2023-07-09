package com.skiaskottie;

import com.facebook.react.uimanager.ThemedReactContext;
import com.shopify.reactnative.skia.SkiaBaseViewManager;

import androidx.annotation.NonNull;

public class SkiaSkottieViewManager extends SkiaBaseViewManager {

    @NonNull
    @Override
    public String getName() {
        return "SkiaSkottieView";
    }

    @NonNull
    @Override
    public SkiaSkottieView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new SkiaSkottieView(reactContext);
    }
}
