#include <jni.h>
#include "react-native-skia-skottie.h"

extern "C" JNIEXPORT void JNICALL
Java_com_skiaskottie_SkiaSkottieModule_initialize(JNIEnv *env, jclass clazz, jlong jsi_ptr,
                                                  jobject context)
{
        RNSkia::RNSkModuleManager::installBindings(
            reinterpret_cast<facebook::jsi::Runtime *>(jsi_ptr),
            nullptr);
}
