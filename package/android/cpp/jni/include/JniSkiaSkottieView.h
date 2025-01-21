#pragma once

#include <memory>
#include <string>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include "JniSkiaBaseView.h"
#include "JniSkiaManager.h"
#include "RNSkAndroidView.h"

#include <android/native_window.h>
#include <android/native_window_jni.h>
#include <fbjni/detail/Hybrid.h>

#include "RNSkSkottieView.h"

namespace RNSkia {
namespace jsi = facebook::jsi;
namespace jni = facebook::jni;

class JniSkiaSkottieView : public jni::HybridClass<JniSkiaSkottieView>, public JniSkiaBaseView {
public:
  static auto constexpr kJavaDescriptor = "Lcom/skiaskottie/SkiaSkottieView;";

  static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis,
                                                jni::alias_ref<JniSkiaManager::javaobject> skiaManager) {
    return makeCxxInstance(jThis, skiaManager);
  }

  static void registerNatives() {
    registerHybrid({makeNativeMethod("initHybrid", JniSkiaSkottieView::initHybrid),
                    makeNativeMethod("surfaceAvailable", JniSkiaSkottieView::surfaceAvailable),
                    makeNativeMethod("surfaceDestroyed", JniSkiaSkottieView::surfaceDestroyed),
                    makeNativeMethod("surfaceSizeChanged", JniSkiaSkottieView::surfaceSizeChanged),
                    makeNativeMethod("setDebugMode", JniSkiaSkottieView::setDebugMode),
                    makeNativeMethod("registerView", JniSkiaSkottieView::registerView),
                    makeNativeMethod("unregisterView", JniSkiaSkottieView::unregisterView)});
  }

protected:

    void surfaceAvailable(jobject surface, int width, int height,
                          bool opaque) override {
        JniSkiaBaseView::surfaceAvailable(surface, width, height, opaque);
    }

    void surfaceSizeChanged(jobject surface, int width, int height,
                            bool opaque) override {
        JniSkiaBaseView::surfaceSizeChanged(surface, width, height, opaque);
    }

  void surfaceDestroyed() override {
    JniSkiaBaseView::surfaceDestroyed();
  }

  void setDebugMode(bool show) override {
    JniSkiaBaseView::setDebugMode(show);
  }

  void registerView(int nativeId) override {
    JniSkiaBaseView::registerView(nativeId);
  }

  void unregisterView() override {
    JniSkiaBaseView::unregisterView();
  }

private:
  friend HybridBase;

  explicit JniSkiaSkottieView(jni::alias_ref<jhybridobject> jThis, jni::alias_ref<JniSkiaManager::javaobject> skiaManager)
      : JniSkiaBaseView(skiaManager,
                        std::make_shared<RNSkAndroidView<RNSkia::RNSkSkottieView>>(skiaManager->cthis()->getPlatformContext())) {}

  jni::global_ref<javaobject> javaPart_;
};

} // namespace RNSkia
