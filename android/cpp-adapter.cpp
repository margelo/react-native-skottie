#include <jni.h>
#include "react-native-skia-skottie.h"
#include <android/log.h>
#include <stdexcept>

//extern "C" {
//    jstring readDotLottie(JNIEnv *env, jstring uri);
//}

extern "C" JNIEXPORT void JNICALL
Java_com_skiaskottie_SkiaSkottieModule_initialize(JNIEnv *env, jclass clazz, jlong jsi_ptr,
                                                  jobject context)
{
    __android_log_print(ANDROID_LOG_DEBUG, "SkiaSkottieModule", "Initializing SkiaSkottieModule");

    // TODO: We are capturing the JNIEnv here, i feel like thats a bad idea…
    std::function<std::string(std::string)> readDotLottie = [env](std::string uri) -> std::string {

        jclass javaClass = env->FindClass("com/skiaskottie/DotLottieReader");
        if (javaClass == nullptr) {
            throw std::runtime_error("Class com/skiaskottie/DotLottieReader not found");
        }

        jmethodID methodId = env->GetStaticMethodID(javaClass, "readDotLottie", "(Ljava/lang/String;)Ljava/lang/String;");
        if (methodId == nullptr) {
            throw std::runtime_error("Method readDotLottie not found");
        }

        // std::string uri to jstring:
        jstring jUri = env->NewStringUTF(uri.c_str());

        jstring resultJString = (jstring)env->CallStaticObjectMethod(javaClass, methodId, jUri);
        if (env->ExceptionCheck()) {
            env->ExceptionDescribe(); // This prints the exception details to the console
            env->ExceptionClear();    // Clear the exception so you can continue

            throw std::runtime_error("Exception in readDotLottie. Check native logs.");
        }

        env->DeleteLocalRef(javaClass);
        env->DeleteLocalRef(jUri);

        // return jstring to std::string:
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
