package com.skiaskottie;

import android.content.Context;

import com.facebook.jni.HybridData;
import com.facebook.jni.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactContext;
import com.shopify.reactnative.skia.RNSkiaModule;
import com.shopify.reactnative.skia.SkiaBaseView;
import com.shopify.reactnative.skia.SkiaManager;

public class SkiaSkottieView extends SkiaBaseView {
    @DoNotStrip
    private HybridData mHybridData;

    public SkiaSkottieView(Context context) {
        super(context);
        RNSkiaModule skiaModule = ((ReactContext) context).getNativeModule(RNSkiaModule.class);
        mHybridData = initHybrid(skiaModule.getSkiaManager());
    }

  @Override
  protected void surfaceAvailable(Object surface, int width, int height, boolean opaque) {
    surfaceAvailable(surface, width, height);
  }

  @Override
  protected void surfaceSizeChanged(Object surface, int width, int height, boolean opaque) {
    surfaceSizeChanged(width, height);
  }

  @Override
    protected void finalize() throws Throwable {
        super.finalize();
        mHybridData.resetNative();
    }

    private native HybridData initHybrid(SkiaManager skiaManager);

    protected native void surfaceAvailable(Object surface, int width, int height);

    protected native void surfaceSizeChanged(int width, int height);

    protected native void surfaceDestroyed();

    protected native void setBgColor(int color);

    protected native void setMode(String mode);

    protected native void setDebugMode(boolean show);

    protected native void updateTouchPoints(double[] points);

    protected native void registerView(int nativeId);

    protected native void unregisterView();

}
