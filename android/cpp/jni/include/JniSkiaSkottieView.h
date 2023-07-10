#pragma once

#include <memory>
#include <string>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include <JniSkiaBaseView.h>
#include <JniSkiaManager.h>
#include <RNSkAndroidView.h>
#include <RNSkSkottieView.h>

#include <android/native_window.h>
#include <android/native_window_jni.h>
#include <fbjni/detail/Hybrid.h>

namespace RNSkia
{
    namespace jsi = facebook::jsi;
    namespace jni = facebook::jni;

    class JniSkiaSkottieView : public jni::HybridClass<JniSkiaSkottieView>,
                               public JniSkiaBaseView
    {
    public:
        static auto constexpr kJavaDescriptor =
            "Lcom/skiaskottie/SkiaSkottieView;";

        static jni::local_ref<jhybriddata>
        initHybrid(jni::alias_ref<jhybridobject> jThis,
                   jni::alias_ref<JniSkiaManager::javaobject> skiaManager)
        {
            return makeCxxInstance(jThis, skiaManager);
        }

        static void registerNatives()
        {
            registerHybrid(
                {makeNativeMethod("initHybrid", JniSkiaSkottieView::initHybrid),
                 makeNativeMethod("surfaceAvailable",
                                  JniSkiaSkottieView::surfaceAvailable),
                 makeNativeMethod("surfaceDestroyed",
                                  JniSkiaSkottieView::surfaceDestroyed),
                 makeNativeMethod("surfaceSizeChanged",
                                  JniSkiaSkottieView::surfaceSizeChanged),
                 makeNativeMethod("setMode", JniSkiaSkottieView::setMode),
                 makeNativeMethod("setDebugMode", JniSkiaSkottieView::setDebugMode),
                 makeNativeMethod("updateTouchPoints",
                                  JniSkiaSkottieView::updateTouchPoints),
                 makeNativeMethod("registerView", JniSkiaSkottieView::registerView),
                 makeNativeMethod("unregisterView",
                                  JniSkiaSkottieView::unregisterView)});
        }

    protected:
        void updateTouchPoints(jni::JArrayDouble touches) override
        {
            JniSkiaBaseView::updateTouchPoints(touches);
        }

        void surfaceAvailable(jobject surface, int width, int height) override
        {
            JniSkiaBaseView::surfaceAvailable(surface, width, height);
        }

        void surfaceSizeChanged(int width, int height) override
        {
            JniSkiaBaseView::surfaceSizeChanged(width, height);
        }

        void surfaceDestroyed() override { JniSkiaBaseView::surfaceDestroyed(); }

        void setMode(std::string mode) override { JniSkiaBaseView::setMode(mode); }

        void setDebugMode(bool show) override { JniSkiaBaseView::setDebugMode(show); }

        void registerView(int nativeId) override
        {
            JniSkiaBaseView::registerView(nativeId);
        }

        void unregisterView() override { JniSkiaBaseView::unregisterView(); }

    private:
        friend HybridBase;

        explicit JniSkiaSkottieView(
            jni::alias_ref<jhybridobject> jThis,
            jni::alias_ref<JniSkiaManager::javaobject> skiaManager)
            : JniSkiaBaseView(
                  skiaManager,
                  std::make_shared<RNSkAndroidView<RNSkia::RNSkSkottieView>>(
                      skiaManager->cthis()->getPlatformContext())) {}

        jni::global_ref<javaobject> javaPart_;
    };

} // namespace RNSkia
