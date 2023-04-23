package com.skiaskottie;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.fbreact.specs.NativeSkiaSkottieSpec;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;

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
        // TODO: yeah, here we'd need to map to PlatformContext, which only exists in RNSkia java code
        context
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
//
//  static {
//    System.loadLibrary("");
//  }

  public static native void initialize(long jsiPtr, ReactContext context);
}
