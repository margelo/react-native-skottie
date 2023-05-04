package com.skiaskottie;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.fbreact.specs.NativeSkiaSkottieSpec;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.shopify.reactnative.skia.PlatformContext;

public class SkiaSkottieModule extends NativeSkiaSkottieSpec {
  public static final String NAME = "SkiaSkottie";

  SkiaSkottieModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean install() {
    try {
      System.loadLibrary("react-native-skia-skottie");
      ReactApplicationContext context = getReactApplicationContext();

      initialize(
        context.getJavaScriptContextHolder().get(),
        new PlatformContext(context)
      );

      Log.i(NAME, "Initialized skia skottie!");
      return true;
    } catch (Exception exception) {
      Log.e(NAME, "Failed to initialize skia skottie!", exception);
      return false;
    }
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  public static native void initialize(long jsiPtr, PlatformContext context);
}
