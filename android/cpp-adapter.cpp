#include <jni.h>
#include "react-native-skia-skottie.h"

extern "C"
JNIEXPORT jint JNICALL
Java_com_skiaskottie_SkiaSkottieModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return skiaskottie::multiply(a, b);
}
