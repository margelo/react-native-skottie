#include <jni.h>
#include "react-native-skia-skottie.h"
#include <android/log.h>
#include <stdexcept>

extern "C" JNIEXPORT void JNICALL
Java_com_skiaskottie_SkiaSkottieModule_initialize(JNIEnv *env, jclass clazz, jlong jsi_ptr,
                                                  jobject dotLottieReader)
{
    __android_log_print(ANDROID_LOG_DEBUG, "SkiaSkottieModule", "Initializing SkiaSkottieModule");

    jclass javaClass = (env)->GetObjectClass(dotLottieReader);
    jmethodID methodId = env->GetMethodID(javaClass, "readDotLottie","(Ljava/lang/String;)Ljava/lang/String;");
    env->DeleteLocalRef(javaClass);

    jobject dotLottieReaderGlobal = env->NewGlobalRef(dotLottieReader);

    // TODO: We are capturing the JNIEnv here, while testing i haven't found any issues with that, however that might become problematic in the future?
    std::function<std::string(std::string)> readDotLottie = [env, dotLottieReaderGlobal, methodId](std::string uri) -> std::string {

        // std::string uri to jstring:
        jstring jUri = env->NewStringUTF(uri.c_str());

        jstring resultJString = (jstring)env->CallObjectMethod(dotLottieReaderGlobal, methodId, jUri);
        if (env->ExceptionCheck()) {
            env->ExceptionDescribe(); // This prints the exception details to the console
            env->ExceptionClear();    // Clear the exception so you can continue

            throw std::runtime_error("Exception in readDotLottie. Check native logs.");
        }

        env->DeleteLocalRef(jUri);

        const char *resultCString = env->GetStringUTFChars(resultJString, nullptr);
        std::string result = std::string(resultCString);
        env->ReleaseStringUTFChars(resultJString, resultCString);

        return result;
    };

        RNSkia::RNSkModuleManager::installBindings(
            reinterpret_cast<facebook::jsi::Runtime *>(jsi_ptr),
            nullptr,
            std::move(readDotLottie)
            );

        __android_log_print(ANDROID_LOG_DEBUG, "SkiaSkottieModule", "SkiaSkottieModule initialized!");
}
